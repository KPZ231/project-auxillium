import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/login/google/callback`;

    if (!clientId || !clientSecret) {
      console.error("Missing Google OAuth credentials in environment variables");
      return NextResponse.json({ error: "OAuth not configured on server" }, { status: 500 });
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ];

    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: "online",
      scope: scopes,
      prompt: "consent"
    });

    return NextResponse.redirect(authorizationUrl);
  } catch (error) {
    console.error("[GOOGLE_LOGIN_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
