import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getUser } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser();

    if (!isAuthenticatedAndLogedIn || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const provider = searchParams.get("provider"); // e.g. "google_sheets"

    if (!provider || !["google_sheets", "google_drive", "google_docs", "google_calendar", "google_tasks"].includes(provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      console.error("Missing Google OAuth credentials in environment variables");
      return NextResponse.json({ error: "OAuth not configured on server" }, { status: 500 });
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    let scopes = [];
    if (provider === "google_sheets") {
      scopes = ["https://www.googleapis.com/auth/spreadsheets"];
    } else if (provider === "google_drive") {
      scopes = ["https://www.googleapis.com/auth/drive.file"];
    } else if (provider === "google_docs") {
      scopes = ["https://www.googleapis.com/auth/documents"];
    } else if (provider === "google_calendar") {
      scopes = ["https://www.googleapis.com/auth/calendar"];
    } else if (provider === "google_tasks") {
      scopes = ["https://www.googleapis.com/auth/tasks"];
    }

    // Dodajemy e-mail profile itp
    scopes.push("https://www.googleapis.com/auth/userinfo.email");

    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      include_granted_scopes: true,
      state: JSON.stringify({ userId, provider }),
      prompt: "consent" // Wymuszamy refresh token
    });

    return NextResponse.redirect(authorizationUrl);
  } catch (error) {
    console.error("[GOOGLE_AUTH_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
