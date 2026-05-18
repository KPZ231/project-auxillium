import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { login } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("[GITHUB_LOGIN_CALLBACK_ERROR]", error);
      return NextResponse.redirect(new URL("/pl/login?error=auth_failed", request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL("/pl/login?error=missing_code", request.url));
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/login/github/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL("/pl/login?error=server_configuration", request.url));
    }

    // Exchange code for token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri
      })
    });

    const tokenData = await tokenRes.json();
    
    if (tokenData.error) {
      console.error("[GITHUB_LOGIN_TOKEN_ERROR]", tokenData.error);
      return NextResponse.redirect(new URL("/pl/login?error=auth_failed", request.url));
    }

    const accessToken = tokenData.access_token;

    // Fetch user info
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Accept": "application/json"
      }
    });

    const userData = await userRes.json();

    // Fetch emails
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Accept": "application/json"
      }
    });
    
    const emailsData = await emailsRes.json();
    const primaryEmailObj = emailsData.find((e: any) => e.primary && e.verified) || emailsData.find((e: any) => e.verified) || emailsData[0];
    const email = primaryEmailObj?.email;

    if (!email || !userData.id) {
      return NextResponse.redirect(new URL("/pl/login?error=missing_user_info", request.url));
    }

    const userEmail = email.toLowerCase();
    const providerId = userData.id.toString();

    // Check if user exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { providerId: providerId },
          { email: userEmail }
        ]
      }
    });

    if (user) {
      if (!user.providerId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { providerId: providerId, authProvider: "GITHUB" }
        });
      }
    } else {
      const baseUsername = userData.login || userEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
      const uniqueUsername = `${baseUsername}_${Math.floor(Math.random() * 10000)}`;
      
      user = await prisma.user.create({
        data: {
          email: userEmail,
          username: uniqueUsername,
          name: userData.name || userData.login,
          avatarUrl: userData.avatar_url,
          authProvider: "GITHUB",
          providerId: providerId,
        }
      });
    }

    // Check if user has a space
    const userSpace = await prisma.space.findFirst({
      where: { members: { some: { id: user.id } } }
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
    console.error("[GITHUB_LOGIN_CALLBACK_EXCEPTION]", error);
    return NextResponse.redirect(new URL("/pl/login?error=internal_error", request.url));
  }
}
