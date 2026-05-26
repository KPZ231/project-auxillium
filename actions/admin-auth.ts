"use server";

import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { checkRateLimit } from "@/lib/rate-limit";

const secretKey = process.env.JWT_SECRET || "default-secret-key-change-me";
const key = new TextEncoder().encode(secretKey);

const ADMIN_SESSION_DURATION = 60 * 60 * 1000; // 1 hour

async function encryptAdminToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}

async function decryptAdminToken(input: string) {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function adminLoginAction(password: string) {
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await checkRateLimit(ip, "admin");

  if (!success) {
    return { error: "Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut." };
  }

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_PASSWORD) {
    return { error: "Brak konfiguracji hasła administratora w zmiennych środowiskowych." };
  }

  if (password !== ADMIN_PASSWORD) {
    return { error: "Nieprawidłowe hasło." };
  }

  const expires = new Date(Date.now() + ADMIN_SESSION_DURATION);
  const token = await encryptAdminToken({ step1: true, expires });

  const cookieStore = await cookies();
  cookieStore.set("admin_auth_1", token, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return { success: true };
}

export async function adminVerifyAction(password: string) {
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await checkRateLimit(ip, "admin");

  if (!success) {
    return { error: "Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut." };
  }

  const SECOND_ADMIN_PASS = process.env.SECOND_ADMIN_PASS;

  if (!SECOND_ADMIN_PASS) {
    return { error: "Brak konfiguracji drugiego hasła administratora w zmiennych środowiskowych." };
  }

  if (password !== SECOND_ADMIN_PASS) {
    return { error: "Nieprawidłowe hasło." };
  }

  // Check if step 1 is valid
  const cookieStore = await cookies();
  const step1Token = cookieStore.get("admin_auth_1")?.value;

  if (!step1Token) {
    return { error: "Sesja wygasła. Zaloguj się ponownie z pierwszego kroku." };
  }

  const step1Payload = await decryptAdminToken(step1Token);
  if (!step1Payload?.step1) {
    return { error: "Nieautoryzowany dostęp." };
  }

  const expires = new Date(Date.now() + ADMIN_SESSION_DURATION);
  const token = await encryptAdminToken({ step2: true, expires });

  cookieStore.set("admin_auth_2", token, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return { success: true };
}

export async function verifyAdminSession() {
  const cookieStore = await cookies();
  const step1Token = cookieStore.get("admin_auth_1")?.value;
  const step2Token = cookieStore.get("admin_auth_2")?.value;

  if (!step1Token || !step2Token) return { authenticated: false };

  const step1Payload = await decryptAdminToken(step1Token);
  const step2Payload = await decryptAdminToken(step2Token);

  if (step1Payload?.step1 && step2Payload?.step2) {
    return { authenticated: true };
  }

  return { authenticated: false };
}

export async function adminLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.set("admin_auth_1", "", { expires: new Date(0), path: "/" });
  cookieStore.set("admin_auth_2", "", { expires: new Date(0), path: "/" });
  return { success: true };
}
