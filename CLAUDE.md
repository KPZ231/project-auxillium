# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project Overview

**Auxillium** - A business management platform built with Next.js 16, featuring project management, lead tracking, employee management, and financial operations.

# Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 with Material UI, Tailwind CSS v4
- **Styling**: Emotion, motion (Framer Motion)
- **Database**: PostgreSQL with Prisma (custom generated client at `lib/generated/client`)
- **Caching**: Upstash Redis for caching and rate limiting
- **Authentication**: JWT-based sessions with `jose`, Argon2 for password hashing
- **Forms**: React Hook Form with Zod validation

# Project Structure

```
app/
├── (marketing)/          # Public pages (marketing site)
│   ├── page.tsx
│   ├── about/
│   ├── pricing/
│   └── layout.tsx
├── (dashboard)/          # Protected dashboard routes
│   ├── dashboard/
│   │   ├── projects/   # Project management (CRUD, grid/timeline view)
│   │   ├── leads/      # Lead management (CRUD, filtering, drag-drop)
│   │   ├── clients/    # Client management
│   │   ├── costs-expenses/  # Finance (expenses, incomes, revenue goals)
│   │   ├── tasks/      # Kanban task board
│   │   └── space/      # Space/employee management
│   └── layout.tsx      # Dashboard layout with SidePanelWrapper + TopBar
├── api/                  # API routes
│   └── user/me/route.ts
└── components/           # Shared components
```

# Architecture Highlights

**Multi-Tenancy via Spaces**: Each user can belong to multiple "spaces" (workspaces). The active space is stored in cookies (`active_space_id`) and determines data scoping for projects, leads, clients, tasks, and financial records.

**Server Actions Pattern**: All business logic lives in `actions/*.ts` files, called from server components or client components via fetch. Common actions include:
- `space.ts`: Space management (create, switch, get active)
- `employee.ts`: Employee CRUD with workload tracking
- `finance.ts`: Expenses, incomes, revenue goals with Redis caching
- `tasks.ts`: Kanban-style task management with order persistence
- `clients.ts`: Client management with caching

**Caching Strategy**: 
- Redis cache keys follow patterns like `space:{spaceId}:tasks`, `finance:summary:{spaceId}`, `employees:{spaceId}`
- Cache TTL: 5 minutes for tasks, 1 hour for employees/finance summaries

**Authentication Flow**:
1. Session encrypted with `jose` (HS256, 24h expiry)
2. Session cookie stored with httpOnly flag
3. `getUser()` from session retrieves current user
4. `getActiveSpaceId()` retrieves current workspace context

# Common Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npx prisma studio # Open Prisma schema editor
```

# Key Conventions

1. **Zod schemas** in `lib/validators.ts` define form validation
2. **Server actions** use `use server` directive and return `{ success, data/error }` pattern
3. **Revalidate paths** after mutations with `revalidatePath()`
4. **Invalidate Redis cache** with `invalidateCache()` after data changes
5. **Danish ordering**: Drag-and-drop uses `order` field for sorting (projects, leads, tasks)
6. **TypeScript**: All generated Prisma types in `lib/generated/client/`

# Space Navigation

The dashboard uses dynamic side panels:
- Main dashboard: `SidePanelWrapper` (chooses between main/employee space panels)
- Space-specific: `SpaceSidePanel` (employee management context)

# Marketing Site

Public pages use `app/(marketing)/layout.tsx` wrapping content with Navbar, Footer, and CookieBanner.
