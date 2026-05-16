import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { ConnectorType } from "@/actions/connectors";

export async function getGoogleAuthClient(userId: string, provider: ConnectorType) {
  const integration = await prisma.integration.findUnique({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
  });

  if (!integration) {
    return null;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials missing");
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  oauth2Client.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken || undefined,
    expiry_date: integration.expiresAt ? integration.expiresAt.getTime() : undefined,
  });

  // Check if token is expired and refresh if possible
  const isExpired = integration.expiresAt ? integration.expiresAt.getTime() < Date.now() : false;

  if (isExpired && integration.refreshToken) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Update tokens in DB
      await prisma.integration.update({
        where: {
          id: integration.id,
        },
        data: {
          accessToken: credentials.access_token!,
          expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined,
        },
      });

      oauth2Client.setCredentials(credentials);
    } catch (error) {
      console.error("Error refreshing Google access token:", error);
      return null;
    }
  }

  return oauth2Client;
}
