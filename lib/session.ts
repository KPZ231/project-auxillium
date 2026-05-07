import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secretKey = process.env.JWT_SECRET || "default-secret-key-change-me";
const key = new TextEncoder().encode(secretKey);

export const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt<T>(input: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload as T;
  } catch (error) {
    console.error("Failed to decrypt session:", error);
    return null;
  }
}

export async function login(userId: string, hasSpace: boolean = false) {
  // Create the session
  const expires = new Date(Date.now() + SESSION_DURATION);
  const session = await encrypt({ userId, hasSpace, expires });

  // Save the session in a cookie
  const cookieStore = await cookies();
  cookieStore.set("session", session, { 
    expires, 
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
}

export async function logout() {
  // Destroy the session
  const cookieStore = await cookies();
  cookieStore.set("session", "", { expires: new Date(0), path: "/" });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt<any>(session);
  if (!parsed) return;
  
  parsed.expires = new Date(Date.now() + SESSION_DURATION);
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
  return res;
}

export async function getUser() {
  const session = await getSession();
  
  return {
    isAuthenticatedAndLogedIn: !!session,
    userId: (session as any)?.userId || null,
  };
}
