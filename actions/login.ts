"use server";

import { verify } from "argon2";
import { prisma } from "@/lib/prisma";
import { loginSchema, LoginFormData } from "@/lib/validators";
import { login, SESSION_DURATION } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers, cookies } from "next/headers";

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

  const { email: providedEmail, username, password } = validatedFields.data;
  let email = providedEmail;
  let searchUsername = username;

  if (!email && username && username.includes("@")) {
    email = username;
  }

  if (email) {
    email = email.toLowerCase();
  }

  try {
    // 3. Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email || "___non_existent___" },
          { username: searchUsername || "___non_existent___" }
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

    // 5. Check if user has at least one space
    const userSpace = await prisma.space.findFirst({
      where: {
        members: {
          some: { id: user.id }
        }
      }
    });

    // 6. Create session
    await login(user.id, !!userSpace);

    // 7. Auto-activate space if user has one
    if (userSpace) {
      const activeSpaceId = user.lastActiveSpaceId || userSpace.id;
      const cookieStore = await cookies();
      const expires = new Date(Date.now() + SESSION_DURATION);
      cookieStore.set("active_space_id", activeSpaceId, { path: "/", expires });

      // Update lastActiveSpaceId if not set
      if (!user.lastActiveSpaceId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveSpaceId: userSpace.id }
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Wystąpił błąd podczas logowania. Spróbuj ponownie." };
  }
}
