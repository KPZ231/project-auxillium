# Email Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 6-digit email verification after registration — users access dashboard immediately with a banner until they verify; OAuth users are auto-verified.

**Architecture:** Add `emailVerified` field to User and a new `EmailVerificationToken` model in Prisma. On registration, generate a 6-digit code, store it (15 min TTL), and send it via the existing nodemailer setup. A persistent banner in the dashboard layout drives users to `/verify-email`. A resend action is rate-limited using the existing `emailRateLimit`.

**Tech Stack:** Prisma (db push), nodemailer (lib/mail.ts), Next.js Server Actions, React Hook Form, Zod, Tailwind CSS, sonner toasts

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `prisma/schema.prisma` | Modify | Add `emailVerified`, `EmailVerificationToken` model |
| `lib/mail.ts` | Modify | Add `sendVerificationEmail` |
| `actions/verify-email.ts` | Create | `sendVerificationCode` + `verifyEmailCode` server actions |
| `actions/register.ts` | Modify | Inline-send verification code after user creation |
| `app/api/auth/login/google/callback/route.ts` | Modify | `emailVerified: true` on create + existing update |
| `app/api/auth/login/github/callback/route.ts` | Modify | `emailVerified: true` on create + existing update |
| `app/api/user/me/route.ts` | Modify | Expose `emailVerified` in response |
| `app/context/UserContext.tsx` | Modify | Add `emailVerified: boolean` to `UserData` |
| `app/components/Dashboard/EmailVerificationBanner.tsx` | Create | Black banner with resend + verify link |
| `app/[locale]/(dashboard)/layout.tsx` | Modify | Fetch `emailVerified`, render banner |
| `app/components/Forms/VerifyEmail/VerifyEmailForm.tsx` | Create | 6-digit input form with auto-advance |
| `app/[locale]/(marketing)/verify-email/page.tsx` | Create | Public page wrapping the form |

---

## Task 1: Prisma Schema — Add emailVerified + EmailVerificationToken

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add `emailVerified` field to User model**

In `prisma/schema.prisma`, add after line 28 (`tutorialDismissed Boolean @default(false)`):

```prisma
  emailVerified      Boolean  @default(false)
```

Also add the relation after `resetTokens PasswordResetToken[]` (line 35):

```prisma
  verificationTokens EmailVerificationToken[]
```

- [ ] **Step 2: Add EmailVerificationToken model**

After the closing brace of `PasswordResetToken` model (after line 62), add:

```prisma
model EmailVerificationToken {
  id      String   @id @default(cuid())
  code    String
  expires DateTime
  userId  String   @unique
  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

- [ ] **Step 3: Push schema to DB**

```bash
npx prisma db push
```

Expected output: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 4: Regenerate Prisma client**

```bash
npx prisma generate
```

Expected output: `Generated Prisma Client (vX.X.X) to ./lib/generated/client`

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add emailVerified field and EmailVerificationToken model"
```

---

## Task 2: Email — Add sendVerificationEmail

**Files:**
- Modify: `lib/mail.ts`

- [ ] **Step 1: Add the function**

Append to the end of `lib/mail.ts` (after `sendResetPasswordEmail`):

```typescript
export async function sendVerificationEmail(email: string, code: string) {
  const mailOptions = {
    from: `"Auxillium" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Weryfikacja konta — Auxillium",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #0A0A0A; text-align: center; font-size: 24px; letter-spacing: 0.05em;">WERYFIKACJA KONTA</h2>
        <p style="color: #444;">Twój jednorazowy kod weryfikacyjny (ważny przez 15 minut):</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 0.3em; color: #0A0A0A; font-family: monospace;">${code}</span>
        </div>
        <p style="color: #888; font-size: 12px;">Jeśli nie zakładałeś konta w Auxillium, zignoruj tę wiadomość.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 11px; color: #aaa; text-align: center;">Wiadomość wygenerowana automatycznie przez Auxillium.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/mail.ts
git commit -m "feat: add sendVerificationEmail to mail utility"
```

---

## Task 3: Server Actions — verify-email.ts

**Files:**
- Create: `actions/verify-email.ts`

- [ ] **Step 1: Create the file**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add actions/verify-email.ts
git commit -m "feat: add sendVerificationCode and verifyEmailCode server actions"
```

---

## Task 4: Update Registration — Send Code After Sign-Up

**Files:**
- Modify: `actions/register.ts`

- [ ] **Step 1: Add mail import**

At the top of `actions/register.ts`, add import alongside existing ones:

```typescript
import { sendVerificationEmail } from "@/lib/mail";
```

- [ ] **Step 2: Add code generation after `login()` call**

In the `registerAction` function, after `await login(user.id, false);` (currently line 67), add:

```typescript
    // Send verification email (non-fatal — user is registered even if this fails)
    try {
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
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
```

- [ ] **Step 3: Verify the full updated function looks correct**

The end of `registerAction` should now be:
```typescript
    // 6. Create session
    await login(user.id, false);

    // Send verification email (non-fatal — user is registered even if this fails)
    try {
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
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
```

- [ ] **Step 4: Commit**

```bash
git add actions/register.ts
git commit -m "feat: send verification email on registration"
```

---

## Task 5: OAuth Auto-Verify (Google + GitHub)

**Files:**
- Modify: `app/api/auth/login/google/callback/route.ts`
- Modify: `app/api/auth/login/github/callback/route.ts`

### Google callback

- [ ] **Step 1: Add `emailVerified: true` to new user create**

In `app/api/auth/login/google/callback/route.ts`, find the `prisma.user.create` block (around line 68) and add `emailVerified: true`:

```typescript
      user = await prisma.user.create({
        data: {
          email: userEmail,
          username: uniqueUsername,
          name: data.name,
          avatarUrl: data.picture,
          authProvider: "GOOGLE",
          providerId: data.id,
          emailVerified: true,
        }
      });
```

- [ ] **Step 2: Also set verified on existing OAuth user update**

Find the existing-user update block (around line 58) and add `emailVerified: true`:

```typescript
        user = await prisma.user.update({
          where: { id: user.id },
          data: { providerId: data.id, authProvider: "GOOGLE", emailVerified: true }
        });
```

### GitHub callback

- [ ] **Step 3: Add `emailVerified: true` to new user create**

In `app/api/auth/login/github/callback/route.ts`, find the `prisma.user.create` block (around line 103):

```typescript
      user = await prisma.user.create({
        data: {
          email: userEmail,
          username: uniqueUsername,
          name: userData.name || userData.login,
          avatarUrl: userData.avatar_url,
          authProvider: "GITHUB",
          providerId: providerId,
          emailVerified: true,
        }
      });
```

- [ ] **Step 4: Also set verified on existing OAuth user update**

Find the existing-user update block (around line 93):

```typescript
        user = await prisma.user.update({
          where: { id: user.id },
          data: { providerId: providerId, authProvider: "GITHUB", emailVerified: true }
        });
```

- [ ] **Step 5: Commit**

```bash
git add app/api/auth/login/google/callback/route.ts app/api/auth/login/github/callback/route.ts
git commit -m "feat: auto-verify email for OAuth users (Google + GitHub)"
```

---

## Task 6: Expose emailVerified in API + UserContext

**Files:**
- Modify: `app/api/user/me/route.ts`
- Modify: `app/context/UserContext.tsx`

### API route

- [ ] **Step 1: Add `emailVerified` to the Prisma select**

In `app/api/user/me/route.ts`, find the `prisma.user.findUnique` select block and add `emailVerified: true`:

```typescript
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatarUrl: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        emailVerified: true,
      },
```

- [ ] **Step 2: Add `emailVerified` to the response JSON**

In the `return NextResponse.json({...})` block, add:

```typescript
      emailVerified: user.emailVerified,
```

### UserContext

- [ ] **Step 3: Add `emailVerified` to the `UserData` interface**

In `app/context/UserContext.tsx`, in the `UserData` interface, add:

```typescript
  emailVerified: boolean;
```

- [ ] **Step 4: Commit**

```bash
git add app/api/user/me/route.ts app/context/UserContext.tsx
git commit -m "feat: expose emailVerified in user API and context"
```

---

## Task 7: EmailVerificationBanner Component

**Files:**
- Create: `app/components/Dashboard/EmailVerificationBanner.tsx`

- [ ] **Step 1: Create the component**

```typescript
"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslation } from "@/app/context/TranslationContext";
import { sendVerificationCode } from "@/actions/verify-email";

interface Props {
  emailVerified: boolean;
}

export default function EmailVerificationBanner({ emailVerified }: Props) {
  const [sending, setSending] = useState(false);
  const { language } = useTranslation();

  if (emailVerified) return null;

  async function handleResend() {
    setSending(true);
    try {
      const result = await sendVerificationCode();
      if (result.success) {
        toast.success("Kod wysłany", {
          description: "Sprawdź swoją skrzynkę mailową.",
        });
      } else {
        toast.error("Nie udało się wysłać kodu", {
          description: result.error,
        });
      }
    } catch {
      toast.error("Błąd sieci", { description: "Spróbuj ponownie." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="w-full bg-[#0A0A0A] text-[#FAFAFA] px-6 py-3 flex items-center justify-center gap-6 print:hidden">
      <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
        Twoje konto nie jest zweryfikowane
      </span>
      <button
        onClick={handleResend}
        disabled={sending}
        className="text-[10px] font-bold tracking-[0.15em] uppercase border border-[#FAFAFA] border-opacity-40 px-3 py-1 hover:border-opacity-100 transition-all disabled:opacity-30"
      >
        {sending ? "Wysyłanie..." : "Wyślij ponownie"}
      </button>
      <Link
        href={`/${language}/verify-email`}
        className="text-[10px] font-bold tracking-[0.15em] uppercase underline-offset-4 hover:underline"
      >
        Zweryfikuj →
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/Dashboard/EmailVerificationBanner.tsx
git commit -m "feat: add EmailVerificationBanner component"
```

---

## Task 8: Add Banner to Dashboard Layout

**Files:**
- Modify: `app/[locale]/(dashboard)/layout.tsx`

- [ ] **Step 1: Add import**

At the top of `app/[locale]/(dashboard)/layout.tsx`, add:

```typescript
import EmailVerificationBanner from "@/app/components/Dashboard/EmailVerificationBanner";
```

- [ ] **Step 2: Fetch `emailVerified` in the existing prisma query**

Find the existing `prisma.user.findUnique` call (around line 28) and add `emailVerified` to the select:

```typescript
  const userData = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, avatarUrl: true, emailVerified: true },
      })
    : null;
```

- [ ] **Step 3: Add banner between TopBar and main content**

Find the `<TopBar initialUser={userData} />` line and add the banner after it:

```tsx
            <div className="print:hidden">
              <TopBar initialUser={userData} />
            </div>
            <EmailVerificationBanner emailVerified={userData?.emailVerified ?? true} />
            <div className="p-4 md:p-8 flex-1 print:p-0 print:m-0">
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors (or pre-existing errors only — don't introduce new ones).

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/\(dashboard\)/layout.tsx
git commit -m "feat: add email verification banner to dashboard layout"
```

---

## Task 9: Verify Email Form + Page

**Files:**
- Create: `app/components/Forms/VerifyEmail/VerifyEmailForm.tsx`
- Create: `app/[locale]/(marketing)/verify-email/page.tsx`

### Form component

- [ ] **Step 1: Create `VerifyEmailForm.tsx`**

```typescript
"use client";

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FaArrowRight } from "react-icons/fa";
import { verifyEmailCode, sendVerificationCode } from "@/actions/verify-email";
import { useTranslation } from "@/app/context/TranslationContext";

export default function VerifyEmailForm() {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { language } = useTranslation();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (next.every((d) => d !== "") && digit) {
      handleSubmit(next.join(""));
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, i) => { next[i] = char; });
    setDigits(next);
    if (pasted.length === 6) {
      handleSubmit(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  }

  async function handleSubmit(code: string) {
    setLoading(true);
    try {
      const result = await verifyEmailCode(code);
      if (result.success) {
        toast.success("Email zweryfikowany!", {
          description: "Twoje konto jest teraz w pełni aktywne.",
        });
        router.push(`/${language}/dashboard`);
        router.refresh();
      } else {
        toast.error("Błąd weryfikacji", { description: result.error });
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      toast.error("Błąd sieci", { description: "Spróbuj ponownie." });
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const result = await sendVerificationCode();
      if (result.success) {
        toast.success("Nowy kod wysłany", {
          description: "Sprawdź swoją skrzynkę mailową.",
        });
      } else {
        toast.error("Nie udało się wysłać kodu", { description: result.error });
      }
    } catch {
      toast.error("Błąd sieci", { description: "Spróbuj ponownie." });
    } finally {
      setResending(false);
    }
  }

  const code = digits.join("");

  return (
    <section className="w-full min-h-screen px-6 py-20 flex flex-col items-center mt-24 justify-center">
      <div className="w-full max-w-[450px] flex flex-col items-center gap-12">
        {/* Header */}
        <div className="text-center flex flex-col gap-3">
          <h1 className="text-4xl lg:text-5xl font-bold text-(--primary) tracking-tight uppercase">
            Weryfikacja
          </h1>
          <p className="text-sm text-(--neutral) opacity-60 tracking-tight">
            Wpisz 6-cyfrowy kod wysłany na Twój adres e-mail.
          </p>
        </div>

        {/* 6-digit input */}
        <div className="flex gap-2">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              disabled={loading}
              className="w-12 h-14 text-center text-2xl font-bold border-b-2 border-(--tertiary) focus:border-(--primary) outline-none transition-colors bg-transparent disabled:opacity-30"
            />
          ))}
        </div>

        {/* Submit button */}
        <button
          onClick={() => handleSubmit(code)}
          disabled={loading || code.length < 6}
          className="w-full py-5 bg-(--primary) text-(--secondary) font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-30"
        >
          {loading ? "Weryfikowanie..." : (
            <>Zweryfikuj konto <FaArrowRight className="w-4 h-4" /></>
          )}
        </button>

        {/* Resend */}
        <div className="text-center text-sm tracking-tight">
          <span className="opacity-60">Nie otrzymałeś kodu? </span>
          <button
            onClick={handleResend}
            disabled={resending}
            className="font-bold hover:underline disabled:opacity-30"
          >
            {resending ? "Wysyłanie..." : "Wyślij ponownie"}
          </button>
        </div>
      </div>
    </section>
  );
}
```

### Page

- [ ] **Step 2: Create the page**

Create `app/[locale]/(marketing)/verify-email/page.tsx`:

```typescript
import VerifyEmailForm from "@/app/components/Forms/VerifyEmail/VerifyEmailForm";

export default function VerifyEmailPage() {
  return <VerifyEmailForm />;
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add app/components/Forms/VerifyEmail/VerifyEmailForm.tsx app/[locale]/\(marketing\)/verify-email/page.tsx
git commit -m "feat: add verify email page with 6-digit code input"
```

---

## Task 10: End-to-End Smoke Test

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test registration flow**

1. Go to `/pl/register`, register a new account with a real email you control
2. Verify: dashboard loads with the black banner "Twoje konto nie jest zweryfikowane"
3. Check inbox: email with 6-digit code should arrive
4. Click "Zweryfikuj →" in the banner → goes to `/pl/verify-email`
5. Enter the 6-digit code → toast "Email zweryfikowany!" → redirect to dashboard
6. Verify: banner no longer appears

- [ ] **Step 3: Test resend**

1. Register another test account
2. On verify page, click "Wyślij ponownie"
3. Toast "Nowy kod wysłany" appears
4. New code arrives in inbox and old one is invalidated (upsert replaces it)

- [ ] **Step 4: Test expired code**

1. Register a test account
2. In DB (Prisma Studio: `npx prisma studio`), manually set the token's `expires` to a past date
3. Enter the code on `/verify-email`
4. Verify: toast "Kod wygasł. Wyślij nowy."

- [ ] **Step 5: Test OAuth auto-verify**

1. Log in via Google OAuth
2. Verify: no banner in dashboard (`emailVerified` is `true`)

- [ ] **Step 6: Final commit if any tweaks were needed**

```bash
git add -A
git commit -m "fix: address smoke test findings"
```

---

## Self-Review Checklist

- [x] Prisma schema covers both `emailVerified` field and `EmailVerificationToken` model
- [x] `sendVerificationEmail` uses existing transporter — no new env vars needed
- [x] Register sends code inline (no session dependency issue)
- [x] `sendVerificationCode` (resend) reads session — safe for logged-in dashboard use
- [x] `verifyEmailCode` uses transaction to atomically update user + delete token
- [x] OAuth callbacks set `emailVerified: true` on both create AND existing-user update (handles migration of existing OAuth users)
- [x] Banner receives `emailVerified ?? true` default — won't show if userData fetch fails
- [x] Verify page auto-submits on last digit + supports paste
- [x] Rate limiting on resend uses existing `emailRateLimit` (3/hour)
- [x] All file paths are exact — no placeholders
