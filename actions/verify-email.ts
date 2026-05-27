"use server";

import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";

export async function sendVerificationCode() {
  const session = await getSession();
  if (!session?.userId) {
    return { error: "Brak sesji. Zaloguj się ponownie." };
  }

  const { success } = await checkRateLimit(session.userId, "email");
  if (!success) {
    return { error: "Osiągnięto limit wysyłania kodów. Spróbuj ponownie później." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true, emailVerified: true },
  });

  if (!user) return { error: "Nie znaleziono użytkownika." };
  if (user.emailVerified) return { success: true };
  if (!user.email) return { error: "Konto nie ma przypisanego adresu e-mail." };

  const code = randomInt(100000, 1000000).toString();
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

  const { success: rateLimitOk } = await checkRateLimit(session.userId, "email");
  if (!rateLimitOk) {
    return { error: "Zbyt wiele prób weryfikacji. Spróbuj ponownie później." };
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
