"use server";

import { hash } from "argon2";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/validators";
import { sendResetPasswordEmail } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import crypto from "crypto";

export async function requestPasswordReset(formData: ResetPasswordFormData) {
  // 1. Rate limiting
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await checkRateLimit(ip, "email");
  
  if (!success) {
    return { error: "Osiągnięto limit próśb o reset hasła. Spróbuj ponownie później." };
  }

  // 2. Validation
  const validatedFields = resetPasswordSchema.safeParse(formData);
  if (!validatedFields.success) {
    return { error: "Nieprawidłowy adres e-mail." };
  }

  const { email } = validatedFields.data;

  try {
    // 3. Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email }
        ]
      }
    });
    
    // Safety: don't reveal if user exists
    if (!user || !user.email) {
      return { success: true, message: "Jeśli konto istnieje, link do resetowania został wysłany." };
    }

    // 4. Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    // 5. Save token
    await prisma.passwordResetToken.create({
      data: {
        token,
        expires,
        userId: user.id,
      },
    });

    // 6. Send email
    await sendResetPasswordEmail(user.email, token);

    return { success: true, message: "Jeśli konto istnieje, link do resetowania został wysłany." };
  } catch (error) {
    console.error("Password reset request error:", error);
    return { error: "Wystąpił błąd. Spróbuj ponownie później." };
  }
}

export async function resetPassword(token: string, password: string) {
  try {
    // 1. Find token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return { error: "Link wygasł lub jest nieprawidłowy." };
    }

    // 2. Hash new password
    const passwordHash = await hash(password);

    // 3. Update user and delete token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: "Wystąpił błąd podczas resetowania hasła." };
  }
}
