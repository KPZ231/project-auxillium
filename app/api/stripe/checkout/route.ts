import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const { isAuthenticatedAndLogedIn, userId } = await getUser();

    if (!isAuthenticatedAndLogedIn || !userId) {
      return NextResponse.json(
        { error: "You must be logged in to subscribe." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planName, priceId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing priceId in request body." },
        { status: 400 }
      );
    }

    // Retrieve the user to see if they already have a Stripe Customer ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      // Create a new Stripe Customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || user.username,
        metadata: {
          userId: user.id,
        },
      });

      customerId = customer.id;

      // Update User with new Customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Derive base URL from the request itself so it works on any domain
    const origin = request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      new URL(request.url).origin;

    // Detect locale from the Referer header (e.g. https://auxillium.site/pl → pl)
    const referer = request.headers.get("referer") || "";
    const localeMatch = referer.match(/\/([a-z]{2})\b/);
    const locale = localeMatch?.[1] ?? "pl";

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/checkout/cancel`,
      metadata: {
        userId: user.id,
        planName: planName || "Pro",
      },
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error("Stripe error:", error.type, error.message, error.code);
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode ?? 500 }
      );
    }
    console.error("Unexpected error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
