import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      console.error("[GOOGLE_AUTH_CALLBACK_ERROR]", error);
      return NextResponse.redirect(new URL("/pl/settings?error=auth_failed", request.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/pl/settings?error=missing_params", request.url));
    }

    let parsedState;
    try {
      parsedState = JSON.parse(state as string);
    } catch (e) {
      return NextResponse.redirect(new URL("/pl/settings?error=invalid_state", request.url));
    }

    const { userId, provider } = parsedState;

    if (!userId || !provider) {
      return NextResponse.redirect(new URL("/pl/settings?error=invalid_state_data", request.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL("/pl/settings?error=server_configuration", request.url));
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token) {
      return NextResponse.redirect(new URL("/pl/settings?error=no_access_token", request.url));
    }

    // Zapisujemy tokeny do bazy danych
    await prisma.integration.upsert({
      where: {
        userId_provider: {
          userId,
          provider
        }
      },
      update: {
        accessToken: tokens.access_token,
        ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
        ...(tokens.expiry_date && { expiresAt: new Date(tokens.expiry_date) })
      },
      create: {
        userId,
        provider,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null
      }
    });

    return NextResponse.redirect(new URL("/pl/settings?success=integration_connected", request.url));

  } catch (error) {
    console.error("[GOOGLE_AUTH_CALLBACK_EXCEPTION]", error);
    return NextResponse.redirect(new URL("/pl/settings?error=internal_error", request.url));
  }
}
