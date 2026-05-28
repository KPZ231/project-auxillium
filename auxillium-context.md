# CLAUDE.md — Auxilium Project Context

This file provides complete guidance to Claude Code when working in this repository.

---

## Project Overview

**Auxilium** — An all-in-one business management SaaS platform for small and medium-sized enterprises (5–200 employees) in Poland and the EU. Replaces the fragmented tool stack (Slack + Trello + Excel + email) with a single operational layer.

**Positioning:**
- NOT Jira/Linear — too complex, dev-centric
- NOT Monday/Asana — too generic, lacks SMB operational depth
- YES — simple, scalable operational hub for growing companies

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Material UI, Tailwind CSS v4 |
| Styling | Emotion, Framer Motion (motion) |
| Database | PostgreSQL via Prisma (generated client at `lib/generated/client`) |
| Caching | Upstash Redis (TTL: 5min tasks, 1h finance/employees) |
| Auth | JWT sessions with `jose` (HS256, 24h), Argon2 password hashing |
| Forms | React Hook Form + Zod validation |
| Deployment | Vercel |

---

## Core Architecture

### Multi-Tenancy via Spaces
- Each user belongs to one or more **Spaces** (isolated workspaces)
- Active space stored in cookie: `active_space_id`
- All data (projects, leads, clients, tasks, finances, employees) is scoped to the active space
- Spaces are fully isolated — switching spaces changes entire context
- Number of spaces per user depends on subscription plan

### Server Actions Pattern
All business logic lives in `actions/*.ts`. Return type is always:
```typescript
{ success: boolean; data?: T; error?: string }
```
After mutations: call `revalidatePath()` + `invalidateCache()` for Redis.

### Redis Cache Keys
```
space:{spaceId}:tasks
finance:summary:{spaceId}
employees:{spaceId}
clients:{spaceId}
```

### Drag-and-Drop Order
Leads, projects, and tasks use an `order` field (integer) for drag-and-drop sorting. Always persist order on reorder events.

---

## Feature Modules

### 1. Projects
- CRUD: name, description, status (`DONE` | `IN_PROGRESS` | `CANCELED`)
- Link to: client, employees, tasks (kanban), documents, expenses/incomes
- Calendar view: project deadlines shown as events
- Financial summary: cost generated per project
- Milestone tracking: progress toward a financial goal

### 2. Tasks (Kanban)
- Asana-style kanban board, scoped per project
- Columns: custom status stages
- Drag-and-drop with `order` persistence
- Assign to employees

### 3. Leads
- Pipeline management for potential clients
- Statuses: `QUALIFIED` | `NEGOTIATION` | `COLD`
- Filters: replied, no reply, interested
- Fields: notes, context, client expectations
- Drag-and-drop reordering
- **Lead Finder**: integrated Google Maps search — finds businesses without websites based on a search phrase + result limit

### 4. Clients
- Full client profiles linked to: projects, expenses, incomes, documents
- Aggregated view of all financial and project data per client
- Base for dynamic document variable injection

### 5. Finance
- **Expenses**: add receipts, bills, invoices; assign to project or client
- **Incomes**: add revenues; assign to project or client
- **Revenue Goals**: set target, track progress with milestone indicators
- **Monthly summary**: cost overview with waterfall chart (breakdown by category)
- **Financial forecasting**: predictive view
- Redis-cached summaries (1h TTL)

### 6. Document Generator
- Template editor: NDA, service agreements, etc.
- Block editor + Markdown editor
- **Dynamic variables**: select a client → client data auto-fills template placeholders
- Export as PDF/DOCX

### 7. AI Chat
- Integrated assistant scoped to user's space data
- Tools available to AI:
  - Create/update/search tasks, projects, leads, clients
  - Answer questions about any data in the platform
  - Generate CSV exports with queried data
- **Google Workspace integrations**: Google To Do, Google Calendar, Google Drive, Google Docs, Google Sheets

### 8. Employees (Space)
- Add employees to a space
- Assign roles: `founder`, `moderator`, `employee`, etc.
- **Workload view**: visual per-space workload distribution
- Assign employees to projects and tasks

### 9. Reports
- Export data as CSV or PDF
- Scoped per space

### 10. Notifications
- In-app alerts for deadlines and task assignments

---

## Design System — StudioBlank

Auxilium uses the **StudioBlank** ultra-minimal industrial design system.

### Core Principles
- **Zero border radius** (`rounded-none`) everywhere — no exceptions
- **Monochrome palette**: `#0A0A0A` (black), `#FAFAFA` (off-white), `#71717A` (zinc-500)
- **Typography as hierarchy**: uppercase labels, `tracking-widest`, bold weights
- **No shadows** — depth via spacing and border contrast only
- **Animations ≤ 200ms** — functional, never decorative
- Accent color: **teal** (single accent only)

### Color Tokens
| Token | Value | Usage |
|---|---|---|
| Primary | `#0A0A0A` | Text, actions, filled buttons |
| Secondary | `#FAFAFA` | Backgrounds, inverse text |
| Tertiary | `#D4D4D8` | Borders, dividers |
| Error | `#DC2626` | Validation errors |
| Success | `#16A34A` | Confirmations |

### Typography
- Headlines + Body: **Inter**
- Mono: **IBM Plex Mono**
- Labels: always `uppercase` + `tracking-widest`

### Form Components (from `@/app/components/UI/FormElements`)
- `PremiumInput` — text/email/number, 1px zinc border → 2px black on focus
- `PremiumTextarea` — multi-line, same border logic
- `PremiumSelect` — custom arrow, same border logic

### Button Variants
- **Primary**: `#0A0A0A` fill, `#FAFAFA` text
- **Secondary**: transparent, `1px #0A0A0A` border
- **Ghost**: transparent, no border
- **Destructive**: `#DC2626` fill, `#FAFAFA` text
- **Disabled**: 0.3 opacity

---

## Coding Conventions

### Components
- Server Components by default in App Router
- `"use client"` only when hooks or interactivity is required
- Names: `PascalCase` (e.g., `TaskCard`, `LeadRow`)
- Files: `kebab-case.tsx` (e.g., `task-card.tsx`)

### TypeScript
- All types exported from `/types`
- `interface` for objects, `type` for unions/aliases
- **No `any`** — always type component props
- Prisma types from `lib/generated/client/`

### Zod Validation
- All schemas in `lib/validators.ts`
- Used in both server actions and React Hook Form

### Database (Prisma)
- Schema: `/prisma/schema.prisma`
- Always use migrations — never edit DB directly
- Models: `PascalCase`, fields: `camelCase`
- Custom generated client path: `lib/generated/client`

### Performance
- Optimistic UI updates on mutations
- Skeleton loaders for async data
- Redis cache invalidation after every data change

---

## Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_MAPS_API_KEY=...
```

---

## Common Commands

```bash
npm run dev           # Start dev server — http://localhost:3000
npm run build         # Production build
npm run lint          # ESLint
npx prisma studio     # Visual DB editor
npx prisma migrate dev # Run migrations
```

---

## Glossary

| Term | Meaning |
|---|---|
| Space | Isolated workspace; one per company/context |
| Task | Single assignable unit of work (kanban card) |
| Workflow | Sequential process (e.g., client onboarding) |
| Lead | Potential client in the sales pipeline |
| Client | Active client with linked projects and finances |
| Workload | Per-space employee capacity/assignment view |
| Revenue Goal | Financial target with milestone progress tracking |
| Dynamic Variables | Client data auto-injected into document templates |

---

## Development Principles

1. **Simplicity over complexity** — every feature must have a clear business purpose
2. **Scale from day one** — architecture accounts for multi-space, multi-user growth
3. **Security** — RBAC enforcement, input validation, sanitization everywhere
4. **Performance** — optimistic updates, skeleton loaders, Redis caching
5. **Readable code** — comment non-obvious business logic

---
