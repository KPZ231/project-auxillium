"use server";

import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";
import { headers } from "next/headers";

export async function sendVerificationCode() {
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await checkRateLimit(ip, "email");
  if (!success) {
    return { error: "Osiągnięto limit wysyłania kodów. Spróbuj ponownie później." };
  }

  const session = await getSession();
  if (!session?.userId) {
    return { error: "Brak sesji. Zaloguj się ponownie." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true, emailVerified: true },
  });

  if (!user) return { error: "Nie znaleziono użytkownika." };
  if (user.emailVerified) return { success: true };

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.emailVerificationToken.upsert({
    where: { userId: session.userId },
    update: { code, expires },
    create: { code, expires, userId: session.userId },
  });

  await sendVerificationEmail(user.email, code);

  return { success: true };
}

export async function verifyEmailCode(code: string) {
  const session = await getSession();
  if (!session?.userId) {
    return { error: "Brak sesji. Zaloguj się ponownie." };
  }

  if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
    return { error: "Nieprawidłowy format kodu." };
  }

  const token = await prisma.emailVerificationToken.findUnique({
    where: { userId: session.userId },
  });

  if (!token || token.code !== code) {
    return { error: "Nieprawidłowy kod weryfikacyjny." };
  }

  if (token.expires < new Date()) {
    return { error: "Kod wygasł. Wyślij nowy." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.userId },
      data: { emailVerified: true },
    }),
    prisma.emailVerificationToken.delete({
      where: { userId: session.userId },
    }),
  ]);

  return { success: true };
}
