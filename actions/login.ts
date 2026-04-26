"use server";

import { verify } from "argon2";
import { prisma } from "@/lib/prisma";
import { loginSchema, LoginFormData } from "@/lib/validators";
import { login } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function loginAction(formData: LoginFormData) {
  // 1. Rate limiting
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await checkRateLimit(ip, "auth");
  
  if (!success) {
    return { error: "Zbyt wiele prób logowania. Spróbuj ponownie za 10 minut." };
  }

  // 2. Validation
  const validatedFields = loginSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: "Nieprawidłowe dane logowania." };
  }

  const { email, username, password } = validatedFields.data;

  try {
    // 3. Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email || "___non_existent___" },
          { username: username || "___non_existent___" }
        ]
      }
    });

    if (!user) {
      return { error: "Nieprawidłowy e-mail/login lub hasło." };
    }

    // 4. Verify password with Argon2
    const isValidPassword = await verify(user.passwordHash, password);

    if (!isValidPassword) {
      return { error: "Nieprawidłowy e-mail/login lub hasło." };
    }

    // 5. Create session
    await login(user.id);

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Wystąpił błąd podczas logowania. Spróbuj ponownie." };
  }
}
