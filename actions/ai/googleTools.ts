"use server";

import { google } from "googleapis";
import { getGoogleAuthClient } from "@/lib/google-auth";

// ============================================================
// GOOGLE DOCS
// ============================================================

export async function saveToGoogleDocs(userId: string, data: { title: string; content: string }) {
  try {
    const auth = await getGoogleAuthClient(userId, "google_docs");
    if (!auth) return { error: "Google Docs not connected." };

    const docs = google.docs({ version: "v1", auth });
    const drive = google.drive({ version: "v3", auth });

    // 1. Create a blank document in Drive first (to set title easily)
    const file = await drive.files.create({
      requestBody: {
        name: data.title,
        mimeType: "application/vnd.google-apps.document",
      },
    });

    const documentId = file.data.id;
    if (!documentId) throw new Error("Failed to create document");

    // 2. Insert content into the document
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: data.content,
            },
          },
        ],
      },
    });

    return {
      success: true,
      url: `https://docs.google.com/document/d/${documentId}/edit`,
      title: data.title
    };
  } catch (error) {
    console.error("Error saving to Google Docs:", error);
    const isPermissionError =
      (error as any).status === 403 ||
      (error as any).code === 403 ||
      (error as any).response?.status === 403 ||
      (error as any).message?.toLowerCase().includes("permission") ||
      (error as any).message?.toLowerCase().includes("scope");

    if (isPermissionError) {
      return { error: "Insufficient permissions. Please disconnect and reconnect Google Docs in settings to grant the required Google Drive access." };
    }
    return { error: "Failed to save to Google Docs." };
  }
}

// ============================================================
// GOOGLE SHEETS
// ============================================================

export async function addToGoogleSheet(userId: string, data: { spreadsheetTitle: string; rows: (string | number | boolean | null | undefined)[][] }) {
  try {
    const auth = await getGoogleAuthClient(userId, "google_sheets");
    if (!auth) return { error: "Google Sheets not connected." };

    const sheets = google.sheets({ version: "v4", auth });
    const drive = google.drive({ version: "v3", auth });

    // Search for existing spreadsheet or create new
    const safeTitle = data.spreadsheetTitle.replace(/'/g, "\\'");
    const searchRes = await drive.files.list({
      q: `name = '${safeTitle}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
      fields: "files(id)",
    });

    let spreadsheetId = searchRes.data.files?.[0]?.id;

    if (!spreadsheetId) {
      const createRes = await sheets.spreadsheets.create({
        requestBody: {
          properties: { title: data.spreadsheetTitle },
        },
      });
      spreadsheetId = createRes.data.spreadsheetId!;
    }

    // Append rows
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: {
        values: data.rows,
      },
    });

    return {
      success: true,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      title: data.spreadsheetTitle
    };
  } catch (error) {
    console.error("Error adding to Google Sheets:", error);
    const isPermissionError =
      (error as any).status === 403 ||
      (error as any).code === 403 ||
      (error as any).response?.status === 403 ||
      (error as any).message?.toLowerCase().includes("permission") ||
      (error as any).message?.toLowerCase().includes("scope");

    if (isPermissionError) {
      return { error: "Insufficient permissions. Please disconnect and reconnect Google Sheets in settings to grant the required Google Drive access." };
    }
    return { error: "Failed to add to Google Sheets." };
  }
}

// ============================================================
// GOOGLE CALENDAR
// ============================================================

export async function createGoogleCalendarEvent(userId: string, data: {
  summary: string;
  description?: string;
  start: string; // ISO string
  end: string; // ISO string
}) {
  try {
    const auth = await getGoogleAuthClient(userId, "google_calendar");
    if (!auth) return { error: "Google Calendar not connected." };

    const calendar = google.calendar({ version: "v3", auth });

    const event = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: data.summary,
        description: data.description,
        start: { dateTime: data.start },
        end: { dateTime: data.end },
      },
    });

    return {
      success: true,
      url: event.data.htmlLink,
      summary: data.summary
    };
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);
    return { error: "Failed to create calendar event." };
  }
}

// ============================================================
// GOOGLE TASKS (TO DO)
// ============================================================

export async function createGoogleTask(userId: string, data: { title: string; notes?: string; due?: string }) {
  try {
    const auth = await getGoogleAuthClient(userId, "google_tasks");
    if (!auth) return { error: "Google Tasks not connected." };

    const tasks = google.tasks({ version: "v1", auth });

    // Get default task list
    const lists = await tasks.tasklists.list({ maxResults: 1 });
    const tasklistId = lists.data.items?.[0]?.id || "@default";

    const task = await tasks.tasks.insert({
      tasklist: tasklistId,
      requestBody: {
        title: data.title,
        notes: data.notes,
        due: data.due ? new Date(data.due).toISOString() : undefined,
      },
    });

    return {
      success: true,
      title: task.data.title
    };
  } catch (error) {
    console.error("Error creating Google Task:", error);
    return { error: "Failed to create Google Task." };
  }
}

// ============================================================
// GOOGLE DRIVE
// ============================================================

export async function uploadToGoogleDrive(userId: string, data: { filename: string; content: string; mimeType?: string }) {
  try {
    const auth = await getGoogleAuthClient(userId, "google_drive");
    if (!auth) return { error: "Google Drive not connected." };

    const drive = google.drive({ version: "v3", auth });

    const file = await drive.files.create({
      requestBody: {
        name: data.filename,
      },
      media: {
        mimeType: data.mimeType || "text/plain",
        body: data.content,
      },
    });

    return {
      success: true,
      id: file.data.id,
      name: file.data.name
    };
  } catch (error) {
    console.error("Error uploading to Google Drive:", error);
    return { error: "Failed to upload to Google Drive." };
  }
}
