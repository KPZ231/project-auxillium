import { NextRequest, NextResponse } from "next/server";

// In production, store these in environment variables
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY || "";
const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID || "";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // MailerLite API endpoint
    const url = "https://connect.mailerlite.com/api/subscribers";

    // Prepare subscriber data with custom fields
    const subscriberData = {
      email: email,
      fields: {
        source: "coming-soon-page"
      },
      groups: [MAILERLITE_GROUP_ID]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MAILERLITE_API_KEY}`,
        "Accept": "application/json",
      },
      body: JSON.stringify(subscriberData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle MailerLite specific errors
      if (response.status === 400 && data.message?.includes("already exists")) {
        return NextResponse.json(
          { error: "This email is already subscribed" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: data.message || "Failed to subscribe" },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { success: true, message: "Successfully subscribed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}