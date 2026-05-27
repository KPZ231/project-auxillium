"use server";

import { hash } from "argon2";
import { prisma } from "@/lib/prisma";
import { registerSchema, RegisterFormData } from "@/lib/validators";
import { login } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { sendVerificationEmail } from "@/lib/mail";
import { randomInt } from "crypto";

export async function registerAction(formData: RegisterFormData) {
  // 1. Rate limiting
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await checkRateLimit(ip, "auth");
  
  if (!success) {
    return { error: "Zbyt wiele prób. Spróbuj ponownie później." };
  }

  // 2. Validation
  const validatedFields = registerSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: "Nieprawidłowe dane formularza." };
  }

  const { email: providedEmail, username, password, name } = validatedFields.data;
  
  // If no email provided separately, check if username is an email
  let email = providedEmail;
  if (!email && username.includes("@")) {
    email = username;
  }

  if (email) {
    email = email.toLowerCase();
  }

  try {
    // 3. Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email: email } : {},
          { username: username }
        ].filter(cond => Object.keys(cond).length > 0)
      }
    });

    if (existingUser) {
      return { error: "Użytkownik o podanym adresie e-mail lub loginie już istnieje." };
    }

    // 4. Hash password with Argon2
    const passwordHash = await hash(password);

    // 5. Create user
    const user = await prisma.user.create({
      data: {
        email: email || "",
        username,
        passwordHash,
        name,
      },
    });

    // 6. Create session
    await login(user.id, false);

    // Send verification email (non-fatal — user is registered even if this fails)
    try {
      const verifyCode = randomInt(100000, 1000000).toString();
      const verifyExpires = new Date(Date.now() + 15 * 60 * 1000);
      await prisma.emailVerificationToken.create({
        data: { code: verifyCode, expires: verifyExpires, userId: user.id },
      });
      if (user.email) {
        await sendVerificationEmail(user.email, verifyCode);
      }
    } catch (mailError) {
      console.error("Failed to send verification email after registration:", mailError);
    }

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Wystąpił błąd podczas rejestracji. Spróbuj ponownie." };
  }
}
