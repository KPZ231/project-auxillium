import React from "react";
import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { isAuthenticatedAndLogedIn, userId } = await getUser();

  if (!isAuthenticatedAndLogedIn || !userId) {
    redirect(`/${locale}/login`);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return <SettingsClient userId={userId} locale={locale} initialUser={user} />;
}
