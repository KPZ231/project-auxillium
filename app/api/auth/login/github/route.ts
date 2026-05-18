import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/login/github/callback`;

  if (!clientId) {
    console.error("Missing GITHUB_CLIENT_ID in environment variables");
    return NextResponse.json({ error: "OAuth not configured on server" }, { status: 500 });
  }

  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  
  return NextResponse.redirect(url);
}
