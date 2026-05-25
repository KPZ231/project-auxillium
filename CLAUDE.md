# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project Overview

**Auxillium** - A business management platform (CRM/ERP) built with Next.js 16, featuring project management, lead tracking, employee management, financial operations, document templates, and an AI assistant.

# Tech Stack

- **Framework**: Next.js 16 (App Router) with `[locale]` dynamic routing for i18n
- **UI**: React 19 with Material UI, Tailwind CSS v4, Emotion, motion (Framer Motion)
- **Database**: PostgreSQL with Prisma (custom generated client at `lib/generated/client`)
- **File Storage**: Supabase (`lib/supabase.ts`) for avatars, receipts, and uploaded images
- **Caching**: Upstash Redis for data caching and rate limiting
- **Authentication**: JWT sessions with `jose` (HS256, 24h), Argon2 for hashing; OAuth via Google and GitHub
- **Payments**: Stripe subscriptions — webhook at `app/api/stripe/webhook/route.ts`
- **AI Chat**: OpenRouter API (`app/api/chat/route.ts`) using the Vercel AI SDK
- **Forms**: React Hook Form with Zod validation (`lib/validators.ts`)

# Project Structure

```
app/
├── [locale]/             # All pages under dynamic locale prefix (pl/en/de)
│   ├── (marketing)/      # Public pages: home, about, pricing
│   └── (dashboard)/      # Protected pages (JWT session required)
│       ├── dashboard/
│       │   ├── projects/
│       │   ├── leads/
│       │   ├── clients/
│       │   ├── costs-expenses/
│       │   ├── tasks/
│       │   ├── templates/  # Document template builder
│       │   └── space/      # Space settings, members, employees
│       └── settings/
├── api/
│   ├── chat/route.ts       # AI assistant (OpenRouter + Vercel AI SDK)
│   ├── auth/               # Google and GitHub OAuth callbacks
│   ├── stripe/             # Checkout session + webhook
│   └── documents/generate/ # PDF generation
├── components/             # Shared React components
└── context/                # React contexts (UserContext, BreadcrumbContext, TranslationContext)
actions/                    # All server actions (business logic layer)
lib/                        # Utilities, session, Redis, Supabase, Stripe, i18n
prisma/schema.prisma        # Single source of truth for DB schema
```

# Architecture Highlights

**Multi-Tenancy via Spaces**: Each user can belong to multiple "spaces" (workspaces). The active space is stored in the `active_space_id` cookie and scopes all data: projects, leads, clients, tasks, employees, and finances. `getActiveSpaceId()` in `actions/space.ts` reads this cookie.

**i18n**: Three supported languages: `pl` (default), `en`, `de`. Translation files are in `public/locales/{lang}/{namespace}.json`. Namespaces: `common`, `dashboard`, `forms`, `marketing`. Client-side i18n uses `lib/i18n-client.ts`; server-side uses `lib/i18n-server.ts`. All routes are prefixed with `[locale]`.

**Server Actions Pattern**: All business logic lives in `actions/*.ts`. They are called from client or server components. Pattern: use `"use server"` directive, return `{ success: boolean, data?: ..., error?: string }`, call `revalidatePath()` after mutations, call `invalidateCache()` to bust Redis.

**AI Chat Feature**: `app/api/chat/route.ts` uses OpenRouter with tool-calling to let users query/mutate their workspace data (projects, leads, clients, tasks, finances) and interact with Google services (Docs, Sheets, Calendar, Drive). AI tool implementations are in `actions/ai/`.

**Permissions System**: Space members have roles — `ADMIN`, `MODERATOR`, `USER` — checked via `checkPermission()` in `lib/permissions.ts`. ADMIN has full access; MODERATOR has read+assign; USER has read only.

**Caching Strategy**:
- Redis cache keys: `space:{spaceId}:tasks`, `finance:summary:{spaceId}`, `employees:{spaceId}`
- Default TTL: 5 minutes tasks, 1 hour employees/finance summaries
- Always call `invalidateCache(key)` after mutating cached data

**Document Templates**: Users can build templates with `{{variable}}` placeholders, drag-and-drop blocks, and branding config. Templates are stored in `DocumentTemplate`, rendered as PDFs via `lib/templates/pdf-generator.ts`.

**Authentication Flow**:
1. Local: credentials → Argon2 verify → `login()` sets httpOnly `session` cookie (JWT)
2. OAuth: Google/GitHub callbacks in `app/api/auth/` create or find User, then call `login()`
3. `getUser()` decrypts session and returns `{ isAuthenticatedAndLogedIn, userId }`

# Common Commands

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npx prisma studio     # Open Prisma schema editor
npx prisma db push    # Push schema changes to DB (no migration file)
npx prisma generate   # Regenerate client after schema change
```

# Key Conventions

1. **Zod schemas** in `lib/validators.ts` define form validation; error messages are in Polish
2. **Server actions** return `{ success, data/error }` — always destructure before use
3. **Revalidate paths** after mutations with `revalidatePath()`
4. **Invalidate Redis cache** with `invalidateCache()` from `lib/redis.ts` after data changes
5. **Drag-and-drop ordering**: `order` field (Int) on Project, Lead, and Task; update via dedicated reorder actions
6. **Prisma types**: import from `lib/generated/client/client` (e.g., `SpaceRole`, `ProjectStatus`)
7. **File uploads**: use Supabase client from `lib/supabase.ts`; store resulting public URL in DB

# Space Navigation

The dashboard uses dynamic side panels:
- Main dashboard: `SidePanelWrapper` (chooses between main/employee space panels)
- Space-specific: `SpaceSidePanel` (employee management context)
