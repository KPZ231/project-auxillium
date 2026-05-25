import { NextResponse } from "next/server"
import { getUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"

export async function POST() {
  const { isAuthenticatedAndLogedIn, userId } = await getUser()

  if (!isAuthenticatedAndLogedIn || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  })

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "NO_STRIPE_CUSTOMER" }, { status: 400 })
  }

  const headersList = await headers()
  const origin = headersList.get("origin") ?? ""

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${origin}/pl/settings`,
  })

  return NextResponse.json({ url: session.url })
}
