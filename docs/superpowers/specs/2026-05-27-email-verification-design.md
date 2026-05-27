# Email Verification Design

**Date:** 2026-05-27  
**Status:** Approved

---

## Overview

Add email verification via 6-digit code sent after registration. Users get dashboard access immediately but see a persistent banner until verified. OAuth users (Google/GitHub) are auto-verified.

---

## User Flow

```
Register → create user (emailVerified=false) → send 6-digit code → login → dashboard
    → banner "Zweryfikuj email" visible
    → click → /[locale]/verify-email page
    → enter 6-digit code → POST verifyEmailCode()
    → emailVerified=true → banner disappears
```

OAuth flow: `emailVerified: true` set on user creation — no banner shown.

Resend: button in banner and on verify page, rate-limited (reuses existing `checkRateLimit(ip, "email")`).

---

## Architecture

### 1. Prisma Schema

Add to `User` model:
```prisma
emailVerified Boolean @default(false)
verificationTokens EmailVerificationToken[]
```

New model:
```prisma
model EmailVerificationToken {
  id      String   @id @default(cuid())
  code    String   // 6-digit numeric string
  expires DateTime // now + 15 minutes
  userId  String   @unique // only one active token per user (upsert)
  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

### 2. lib/mail.ts

Add `sendVerificationEmail(email: string, code: string)` alongside `sendResetPasswordEmail`. Same nodemailer transporter, same HTML style. Subject: "Weryfikacja konta — Auxillium".

### 3. actions/verify-email.ts (new)

Two server actions:

**`sendVerificationCode()`**
- Reads userId from session
- Rate-limits by IP (`checkRateLimit(ip, "email")`)
- Generates `Math.floor(100000 + Math.random() * 900000).toString()` (6 digits)
- Upserts `EmailVerificationToken` (deletes existing, creates new)
- Calls `sendVerificationEmail(user.email, code)`
- Returns `{ success: true }` or `{ error: string }`

**`verifyEmailCode(code: string)`**
- Reads userId from session
- Finds token where `userId = userId AND code = code`
- Checks `expires > now()`
- Updates `user.emailVerified = true`
- Deletes the token
- Returns `{ success: true }` or `{ error: string }`

### 4. actions/register.ts

After `await login(user.id, false)`, call `sendVerificationCode()`. Import is safe — both are server actions.

### 5. app/api/user/me/route.ts + UserContext

Add `emailVerified` to the Prisma select and response JSON. Add `emailVerified: boolean` to `UserData` interface in `UserContext.tsx`.

### 6. Dashboard Layout

In `app/[locale]/(dashboard)/layout.tsx`:
- Fetch `emailVerified` from `prisma.user.findUnique` (already queries DB there)
- Render `<EmailVerificationBanner emailVerified={emailVerified} />` between TopBar and main content

### 7. EmailVerificationBanner component

`app/components/Dashboard/EmailVerificationBanner.tsx`

- Client component, receives `emailVerified: boolean`
- If `emailVerified` is true, renders nothing
- StudioBlank style: 40px strip, `#0A0A0A` background, `#FAFAFA` text
- Content: "Twoje konto nie jest zweryfikowane" + "WYŚLIJ PONOWNIE" ghost button + "ZWERYFIKUJ →" link to `/[locale]/verify-email`
- Resend button calls `sendVerificationCode()` and shows toast

### 8. /[locale]/verify-email page

`app/[locale]/(marketing)/verify-email/page.tsx`

- Uses marketing layout (accessible while logged in)
- Component: `VerifyEmailForm` — 6 separate `<input type="text" maxLength={1}>` in a row
- Auto-advances focus on each digit input
- On complete (6 digits filled): auto-submits or shows VERIFY button
- Calls `verifyEmailCode(code)` — on success: `router.push('/[locale]/dashboard')` + toast
- "Wyślij ponownie" button calls `sendVerificationCode()`

### 9. OAuth callbacks

In `app/api/auth/login/google/callback/route.ts` and `app/api/auth/login/github/callback/route.ts`:
- Add `emailVerified: true` to `prisma.user.create` data block

---

## UI Design (StudioBlank)

**Banner:**
- Full-width, 48px height, `bg-[#0A0A0A]` text `#FAFAFA`
- Text: 10px Inter bold tracking-widest uppercase
- "WYŚLIJ PONOWNIE" — ghost button (transparent, white border 1px, 0px border-radius)
- "ZWERYFIKUJ →" — plain link, underline on hover

**Verify page:**
- Same layout shell as `/forgot-password`
- 6 inputs: 48×56px each, `border-b border-(--tertiary)`, `text-center text-2xl font-bold`
- Gap: 8px between inputs
- Auto-focus on first input on mount
- On paste: spread digits across inputs automatically

---

## Error Handling

- Expired code: "Kod wygasł. Wyślij nowy." toast error
- Wrong code: "Nieprawidłowy kod." toast error (no detail about existence)
- Rate limit: "Osiągnięto limit. Spróbuj ponownie później."
- Already verified: `sendVerificationCode()` returns early with success (idempotent)

---

## Out of Scope

- Blocking dashboard access entirely (user chose "banner" approach)
- Forced re-verification after email change (not in current schema)
- SMS verification
