import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { login } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("[GOOGLE_LOGIN_CALLBACK_ERROR]", error);
      return NextResponse.redirect(new URL("/pl/login?error=auth_failed", request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL("/pl/login?error=missing_code", request.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/login/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL("/pl/login?error=server_configuration", request.url));
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user info
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const data = userInfo.data;

    if (!data.email || !data.id) {
      return NextResponse.redirect(new URL("/pl/login?error=missing_user_info", request.url));
    }

    const userEmail = data.email.toLowerCase();

    // Check if user exists by providerId OR email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { providerId: data.id },
          { email: userEmail }
        ]
      }
    });

    if (user) {
      // If user exists by email but was a LOCAL user, optionally update them to link account
      if (!user.providerId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { providerId: data.id, authProvider: "GOOGLE" }
        });
      }
    } else {
      // Create new user
      const baseUsername = userEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
      const uniqueUsername = `${baseUsername}_${Math.floor(Math.random() * 10000)}`;
      
      user = await prisma.user.create({
        data: {
          email: userEmail,
          username: uniqueUsername,
          name: data.name,
          avatarUrl: data.picture,
          authProvider: "GOOGLE",
          providerId: data.id,
        }
      });
    }

    // Check if user has a space
    const userSpace = await prisma.space.findFirst({
      where: { members: { some: { userId: user.id } } }
    });
    
    await login(user.id, !!userSpace);

    // Auto-activate space if user has one
    if (userSpace) {
      const activeSpaceId = user.lastActiveSpaceId || userSpace.id;
      const cookieStore = await cookies();
      cookieStore.set("active_space_id", activeSpaceId, { path: "/" });

      if (!user.lastActiveSpaceId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveSpaceId: userSpace.id }
        });
      }
    }

    return NextResponse.redirect(new URL("/pl/dashboard", request.url));
  } catch (error) {
    console.error("[GOOGLE_LOGIN_CALLBACK_EXCEPTION]", error);
    return NextResponse.redirect(new URL("/pl/login?error=internal_error", request.url));
  }
}
