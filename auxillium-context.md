# Auxillium Full Context

## File: AUXILIUM_CONTEXT.md

# AUXILIUM  Plik Kontekstowy Projektu

## Czym jest Auxilium?

Auxilium to nowoczesna platforma SaaS do zarządzania biznesem, zaprojektowana dla **małych i średnich firm (MŚP)**.

Cel: zastąpienie rozproszonych narzędzi (arkusze kalkulacyjne, e-maile, chaotyczne listy zadań) **jednym centralnym systemem operacyjnym** dla rozwijającej się firmy.

---

## Stack Technologiczny

| Warstwa       | Technologia                     |
|---------------|---------------------------------|
| Framework     | Next.js (App Router)            |
| Język         | TypeScript                      |
| Styling       | Tailwind CSS                    |
| ORM           | Prisma                          |
| Baza danych   | PostgreSQL                      |
| Auth          | (planowane  RBAC)              |
| Deployment    | Vercel                          |

---

## Struktura Projektu

```
/
├── actions/        # Server Actions (Next.js)
├── app/            # Strony i routing (App Router)
├── components/     # Komponenty UI wielokrotnego użytku
├── config/         # Konfiguracja aplikacji
├── lib/            # Helpery, klienty (Prisma, auth, itp.)
├── prisma/         # Schema bazy danych i migracje
├── public/         # Statyczne assety
├── types/          # Definicje typów TypeScript
└── utils/          # Funkcje pomocnicze
```

---

## Główne Funkcje (Roadmapa)

1. **Autoryzacja i RBAC**  logowanie, rejestracja, role: Admin / Manager / Employee
2. **Dashboard z analityką**  KPI, wykresy, przegląd operacji firmy
3. **Zarządzanie zadaniami**  tworzenie, przypisywanie, śledzenie statusu
4. **Workflow Builder**  kreator sekwencyjnych procesów biznesowych
5. **Powiadomienia i przypomnienia**  alerty in-app, terminy
6. **Współpraca zespołowa**  komentarze, przypisania, feed aktywności
7. **Raporty i analityka**  eksport danych, raporty wydajności
8. **Panel Administracji**  zarządzanie użytkownikami i uprawnieniami

---

## Konwencje Kodowania

### Komponenty
- **Server Components** jako domyślne w App Router
- `"use client"` tylko tam, gdzie potrzebna interaktywność lub hooki
- Nazwy komponentów: `PascalCase` (np. `TaskCard`, `DashboardHeader`)
- Pliki komponentów: `kebab-case.tsx` (np. `task-card.tsx`)

### Server Actions (`/actions`)
- Wszystkie mutacje danych przez Server Actions
- Walidacja: `zod`
- Zwracaj: `{ success: boolean, error?: string, data?: T }`

### Baza Danych (Prisma)
- Schema: `/prisma/schema.prisma`
- Zawsze używaj migracji  nigdy nie modyfikuj DB bezpośrednio
- Modele: `PascalCase`, pola: `camelCase`

### TypeScript
- Eksportuj typy z `/types`
- `interface` dla obiektów, `type` dla unii i aliasów
- Żadnych `any`  zawsze typuj props komponentów

---

## Zasady UI / UX

- Design system: **Tailwind CSS**  bez hardkodowanych px
- Dark/light mode obowiązkowy
- Paleta: neutralna + jeden akcent (teal)
- Typografia: czytelna, biznesowa (Inter lub Geist)
- Priorytet: desktop (aplikacja biznesowa), ale responsywna
- Komponenty: spójne, wielokrotnego użytku, dostępne (WCAG AA)

---

## Kontekst Biznesowy

### Grupa docelowa
- Firmy 5–50 pracowników wychodzące ze startupu
- Firmy 50–200 pracowników szukające kontroli operacyjnej
- Firmy zastępujące Excel/Arkusze jako narzędzia zarządzania

### Problem
Firmy MŚP zarządzają przez: Slack + Trello + Excel + e-mail = chaos.
Brak centralnej widoczności, ręczne procesy, brak odpowiedzialności.

### Auxilium = jedna warstwa operacyjna zamiast chaosu narzędzi

### Pozycjonowanie
- **NIE** Jira/Linear  za skomplikowane, zbyt dev-centryczne
- **NIE** Monday/Asana  za ogólne, brak głębi operacyjnej dla MŚP
- **TAK**  proste, skalowalne centrum operacyjne dla rozwijającej się firmy

---

## Zasady Developmentu

1. Prostota ponad złożoność  każda funkcja musi mieć cel biznesowy
2. Skalowalność od początku  architektura uwzględnia wzrost
3. Bezpieczeństwo  RBAC, walidacja wejść, sanityzacja
4. Performance  optymistyczne aktualizacje UI, skeleton loaders
5. Czytelny kod  komentarze przy nieoczywistej logice biznesowej

---

## Glossary

| Termin       | Znaczenie                                                    |
|--------------|--------------------------------------------------------------|
| Task         | Pojedyncze zadanie przypisane do użytkownika lub zespołu     |
| Workflow     | Sekwencja kroków/procesów (np. onboarding klienta, oferta)   |
| Action       | Konkretna czynność operacyjna                                |
| Team         | Dział lub grupa użytkowników w ramach firmy                  |
| Role         | Poziom dostępu: Admin / Manager / Employee                   |
| Dashboard    | Główny widok z KPI i przeglądem operacji                     |

---

## Uruchomienie

```bash
git clone https://github.com/[repo]/auxilium.git
cd auxilium
npm install
cp .env.example .env.local
npx prisma migrate dev
npm run dev  # http://localhost:3000
```

### Zmienne środowiskowe (.env.local)

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

---

## Status: 🟡 W aktywnym rozwoju

Projekt w fazie budowania fundamentów (auth, dashboard, zadania).
Każda nowa funkcja powinna być zgodna z roadmapą i konwencjami z tego pliku.


## File: CLAUDE.md

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


## File: FormDesign.md

# AUXILIUM Form Design Conventions

This document outlines the design and implementation standards for forms within the Auxilium platform. We follow the **StudioBlank** design system: an ultra-minimal, industrial-utilitarian aesthetic focused on whitespace, bold typography, and sharp geometric edges.

## 1. Design Principles

- **Zero Radius**: No rounded corners (`rounded-none`) on any inputs, buttons, or containers.
- **Monochrome Palette**: Stick to `#0A0A0A` (Black), `#FAFAFA` (Off-white), and `#71717A` (Zinc-500) for UI chrome.
- **Typography as Hierarchy**: Use uppercase, tracking-widest, and bold weights for labels instead of size variations.
- **Utilitarian Transitions**: Animations should be fast (<= 200ms) and functional (e.g., border color shifts).
- **Whitespace as Structure**: Use generous padding and gaps (`space-y-8`, `gap-8`) to separate logical sections.

## 2. Core Components

Always use the premium components from `@/app/components/UI/FormElements`:

### `PremiumInput`
- **When to use**: Standard text, email, phone, or number entries.
- **Design**: 1px Zinc border that turns 2px Black on focus. Upper-case labels.
- **Helper Text**: Use for subtle instructions below the input.

### `PremiumTextarea`
- **When to use**: Multi-line notes, descriptions, or long-form content.
- **Design**: Same border logic as input. Fixed height or specific `rows` recommended.

### `PremiumSelect`
- **When to use**: Choosing from a predefined set of options.
- **Design**: Custom arrow icon, same border logic.

## 3. Form Layout Patterns

### Steppers (Wizard Mode)
- **Header**: Use a high-contrast progress bar (Zinc background, Black active segment).
- **Sectioning**: Each step should have a clear "Step X of Y" indicator and a bold section title with a left-accent border.
- **Navigation**: "Back" (Ghost/Bordered) on the left, "Continue" (Primary/Filled) on the right.

### Edit Modals
- **Sticky Header/Footer**: Keep navigation buttons visible while scrolling long forms.
- **Section Dividers**: Use `border-l-4 border-[#0A0A0A]` with internal padding to mark logical groups (e.g., "Basic Information", "Contact Details").

### Verification (Dangerous Actions)
- Use the **Verification Input** pattern for deletions:
  - User must type the object name exactly (e.g., "Confirm delete Acme Corp").
  - Use `PremiumInput` with an `error` state if the names don't match.

## 4. Interaction & UX

- **Focus States**: Every interactive element must have a clear visual focus state (usually a 2px black border).
- **Validation**: Surface errors immediately using the `error` prop. Errors should be `#DC2626` (Red-600).
- **Submitting States**: Disable buttons and show "Saving..." or "Processing..." labels to prevent double submissions.
- **Uppercase Labels**: All labels MUST be uppercase with `tracking-widest` to maintain the industrial look.

## 5. Code Example

```tsx
<div className="space-y-12">
  <div className="border-l-4 border-[#0A0A0A] pl-6 py-1">
    <h3 className="text-[14px] font-black uppercase tracking-[0.15em]">Section Title</h3>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <PremiumInput 
      label="Label Name" 
      placeholder="Utilitarian placeholder" 
      required
    />
    <PremiumSelect 
      label="Category" 
      options={[{ value: 'A', label: 'Option A' }]}
    />
  </div>
</div>
```


## File: studioblank-design-system-DESIGN.md

# StudioBlank Design System

## Overview

StudioBlank is an ultra-minimal design system where whitespace is the primary design feature. Built for photographer and visual artist portfolios, every UI element recedes so the work itself commands attention. The system uses no shadows, no border radius, and a monochromatic palette with weight contrast in a single type family. Geometry is pure, grids are strict, and ornamentation is entirely absent.

---

## Colors

- **Color Primary** (#0A0A0A): Primary text, actions
- **Color Secondary** (#FAFAFA): Backgrounds, inverse surfaces
- **Color Tertiary** (#D4D4D8): Subtle dividers, borders
- **Surface Base** (#FAFAFA): Page background
- **Surface Inverse** (#0A0A0A): Dark sections, footer
- **Color Success** (#16A34A): Upload complete
- **Color Warning** (#CA8A04): Storage warnings
- **Color Error** (#DC2626): Validation errors
- **Color Info** (#71717A): Informational notes

## Typography

- **Headline Font**: Inter
- **Body Font**: Inter
- **Mono Font**: IBM Plex Mono

- **text-hero**: Inter 64px bold, 1.05 line height
- **text-h1**: Inter 40px bold, 1.1 line height
- **text-h2**: Inter 28px semibold, 1.2 line height
- **text-h3**: Inter 20px semibold, 1.3 line height
- **text-body**: Inter 16px light, 1.65 line height
- **text-body-sm**: Inter 14px regular, 1.6 line height
- **text-caption**: Inter 12px regular, 1.5 line height
- **text-mono**: IBM Plex Mono 13px regular, 1.5 line height

---

## Spacing

Base unit: **16px**. Very generous spacing creates openness and directs focus to imagery.
- **space-1**: 4px  Tight inline gaps
- **space-2**: 8px  Icon-to-label spacing
- **space-3**: 16px  Standard element gap
- **space-4**: 32px  Between grouped elements
- **space-5**: 48px  Section inner padding
- **space-6**: 64px  Between sections
- **space-8**: 96px  Major page-level divisions
- **space-10**: 128px  Hero top/bottom margins

## Border Radius

- **radius-none** (0px): All elements (default)
All components use 0px corners. No rounding is applied anywhere. Pure geometric edges define every surface, button, card, and input.

## Elevation

No shadows are used in StudioBlank. The system is completely flat. Depth is communicated exclusively through layering, spacing, and border contrast.
- **shadow-none**: None. Applied to all elements.
Focus states use a 2px border offset rather than a box-shadow ring.

## Components

### Buttons
All buttons are sharp-edged rectangles with no border-radius. Hover is communicated through background inversion.
#### Variants
- **Primary**: #0A0A0A fill, #FAFAFA text, no border.
- **Secondary**: transparent fill, #0A0A0A text, 1px #0A0A0A border.
- **Ghost**: transparent fill, #0A0A0A text, no border.
- **Destructive**: #DC2626 fill, #FAFAFA text, no border.
#### Sizes
Sizes: Small (32px, 16px, 12px, 64px), Medium (40px, 24px, 14px, 96px), Large (48px, 32px, 16px, 128px).
#### Disabled State
0.3 opacity, disabled cursor.
- No hover transitions

### Cards
#FFFFFF fill, 1px #E5E5E5 border, square, 0px (image bleeds to edge) padding, no shadow, Hover: Border shifts to #0A0A0A.
Image cards have zero padding; the image is the card. Caption metadata sits below with space-3 gap.

### Inputs
- **Default**: #D4D4D8 border color, #FFFFFF fill, no shadow.
- **Hover**: #A1A1AA border color, #FFFFFF fill, no shadow.
- **Focus**: #0A0A0A border color, #FFFFFF fill, no shadow.
- **Error**: #DC2626 border color, #FFFFFF fill, no shadow.
- **Disabled**: #E5E5E5 border color, #F4F4F5 fill, no shadow.
1px (bottom border only variant available) border, 0px border radius. 40px tall, 14px Inter 400 font size. Focus: 2px #0A0A0A border.

### Chips
#### Filter Chips
- **Default**: transparent fill, #71717A text, 1px #D4D4D8 border.
- **Selected**: #0A0A0A fill, #FAFAFA text, 1px #0A0A0A border.
- **Hover**: #F4F4F5 fill, #0A0A0A text, 1px #A1A1AA border.
#### Status Chips
- **Published**: #0A0A0A fill, #FAFAFA text, no border.
- **Draft**: transparent fill, #71717A text, 1px #D4D4D8 border.
- **Archived**: #F4F4F5 fill, #A1A1AA text, no border.
- **Featured**: transparent fill, #0A0A0A text, 1px #0A0A0A border.
0px border radius. 12px Inter 400 uppercase tracking 0.05em. 28px tall.

### Lists
48px row height, 16px horizontal padding, 1px #F4F4F5 divider, #F4F4F5 hover background, #0A0A0A with white text active background, square, 14px Inter 400 font.

### Checkboxes
- **Unchecked**: #FFFFFF fill, 1px #D4D4D8 border.
- **Checked**: #0A0A0A fill, 1px #0A0A0A border, #FAFAFA checkmark.
- **Disabled**: #F4F4F5 fill, 1px #E5E5E5 border, #A1A1AA checkmark.
18px, 0px border radius. Focus: 2px #0A0A0A offset 2px.

### Radio Buttons
- **Unselected**: #FFFFFF fill, 1px #D4D4D8 border.
- **Selected**: #FFFFFF fill, 1px #0A0A0A border, #0A0A0A dot.
- **Disabled**: #F4F4F5 fill, 1px #E5E5E5 border, #A1A1AA dot.
18px. 8px dot diameter. Focus: 2px #0A0A0A offset 2px.

### Tooltips
#0A0A0A fill, #FAFAFA text, 12px Inter 400 font size, 8px 12px padding, square, 200px max width, 6px triangle arrow, 200ms show, 0ms hide delay, no shadow.
---

## Do's and Don'ts

1. **Do** let images speak -- the portfolio work is the design, not the interface.
2. **Don't** add decorative elements such as gradients, patterns, or ornamental shapes.
3. **Do** use generous margins (minimum 64px between major sections) to create visual breathing room.
4. **Don't** introduce more than one accent color across the entire site. Monochrome is the identity.
5. **Do** keep UI chrome to an absolute minimum -- navigation should nearly disappear.
6. **Don't** use rounded corners, shadows, or any depth effect. The system is strictly flat and geometric.
7. **Do** use weight contrast within Inter (300 vs 700) to establish hierarchy instead of size alone.
8. **Don't** overlay text on images unless absolutely necessary -- image integrity is paramount.
9. **Do** prioritize loading performance; lazy-load gallery images with simple fade-in transitions.
10. **Don't** use animations or transitions longer than 200ms. Movement should be barely perceptible.

## File: prisma/schema.prisma

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client"
  output   = "../lib/generated/client"
}

datasource db {
  provider = "postgresql"
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  passwordHash  String
  name          String?   // User's display name
  avatarUrl     String?   // URL to user's avatar image
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  lastActiveSpaceId String?
  
  resetTokens   PasswordResetToken[]
  projects      Project[]
  leads         Lead[]
  clients       Client[]
  
  ownedSpaces   Space[]   @relation("SpaceOwner")
  memberSpaces  Space[]   @relation("SpaceMembers")

  expenses      Expense[]
  incomes       Income[]
  revenueGoals  RevenueGoal[]
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  token     String   @unique
  expires   DateTime
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
}

enum ProjectStatus {
  DONE
  IN_PROGRESS
  CANCELED
}

enum LeadStatus {
  QUALIFIED
  NEGOTIATION
  COLD
}

model Project {
  id                 String        @id @default(cuid())
  projectName        String        @unique
  projectDescription String
  projectStatus      ProjectStatus @default(IN_PROGRESS)
  images             String[]      // Tablica na URL-e do zdjęć

  // Nowe pola do edycji projektu
  budget             String?
  location           String?
  projectType        String?       // np. Residential, Commercial, Web, Branding
  priority           String?       // np. Low, Medium, High, Critical
  context            String?
  clientInfo         String?
  assignedUsersInfo  String?
  clientBrief        String?
  websiteUrl         String?
  githubUrl          String?
  timeline           String?
  milestones         Json?         // Może przechowywać listę obiektów np. [{ title, date, completed }]
  dueDate            DateTime?     // Pole daty końcowej projektu
  
  clientId           String?
  client             Client?       @relation(fields: [clientId], references: [id], onDelete: SetNull)
  
  order              Int           @default(0) // Kolejność do Drag & Drop

  userId             String
  user               User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  spaceId            String?
  space              Space?        @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  
  tasks              Task[]
  assignedEmployees  Employee[]    @relation("AssignedProjects")

  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  @@index([userId])
  @@index([spaceId])
}

model Lead {
  id               String      @id @default(cuid())
  projectType      String?
  leadName         String      @unique
  contactName      String?
  role             String?
  email            String?
  phone            String?
  status           LeadStatus  @default(COLD)
  stage            String?
  turnedIntoClient Boolean?    @default(false)
  leadInfo         String?
  order            Int         @default(0)

  userId           String
  user             User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  spaceId          String?
  space            Space?      @relation(fields: [spaceId], references: [id], onDelete: Cascade)

  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  @@index([userId])
  @@index([spaceId])
}

model Space {
  id               String     @id @default(cuid())
  spaceName        String     @unique
  spaceDescription String?
  icon             String?
  
  ownerId          String
  owner            User       @relation("SpaceOwner", fields: [ownerId], references: [id])
  
  members          User[]     @relation("SpaceMembers")
  
  projects         Project[]
  leads            Lead[]
  clients          Client[]
  employees        Employee[]
  tasks            Task[]
  expenses         Expense[]
  incomes          Income[]
  revenueGoals     RevenueGoal[]
  financialLabels  FinancialLabel[]

  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt

  @@index([ownerId])
}

model Employee {
  id            String    @id @default(cuid())
  name          String
  email         String?
  phone         String?
  role          String?   // Position title
  permissions   Json?     // Roles/Permissions details
  
  spaceId       String
  space         Space     @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  
  assignedProjects Project[] @relation("AssignedProjects")
  assignedClients  Client[]  @relation("AssignedClients")
  assignedTasks    Task[]    @relation("AssignedEmployee")
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([spaceId])
}

model Task {
  id            String    @id @default(cuid())
  title         String
  description   String?
  status        String    @default("TODO") // TODO, IN_PROGRESS, DONE
  priority      String    @default("MEDIUM") // LOW, MEDIUM, HIGH
  
  spaceId       String
  space         Space     @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  
  employeeId    String?
  employee      Employee? @relation("AssignedEmployee", fields: [employeeId], references: [id])
  
  projectId     String?
  project       Project?  @relation(fields: [projectId], references: [id])
  
  dueDate       DateTime?
  order         Int       @default(0)
  workload      Int?
  subtasks      Json?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([spaceId])
  @@index([employeeId])
  @@index([projectId])
}

model Expense {
  id          String   @id @default(cuid())
  amount      Float
  description String?
  date        DateTime @default(now())
  category    String?  // e.g. "subscription", "tax", "payment"
  isRecurring Boolean  @default(false)
  cycle       String?  // e.g. "monthly", "yearly"
  
  spaceId     String
  space       Space    @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  labels      FinancialLabel[] @relation("ExpenseLabels")

  clientId    String?
  client      Client?          @relation(fields: [clientId], references: [id], onDelete: SetNull)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([spaceId])
  @@index([userId])
}

model Income {
  id          String   @id @default(cuid())
  amount      Float
  description String?
  date        DateTime @default(now())
  source      String?  // e.g. "project", "service"
  
  spaceId     String
  space       Space    @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  labels      FinancialLabel[] @relation("IncomeLabels")

  clientId    String?
  client      Client?          @relation(fields: [clientId], references: [id], onDelete: SetNull)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([spaceId])
  @@index([userId])
}

model RevenueGoal {
  id          String   @id @default(cuid())
  amount      Float
  month       Int      // 1-12
  year        Int
  
  spaceId     String
  space       Space    @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([spaceId, month, year])
  @@index([spaceId])
  @@index([userId])
}

model FinancialLabel {
  id        String   @id @default(cuid())
  name      String
  color     String?
  type      String   // "EXPENSE" or "INCOME"
  
  spaceId   String
  space     Space    @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  
  expenses  Expense[] @relation("ExpenseLabels")
  incomes   Income[]  @relation("IncomeLabels")

  @@unique([spaceId, name, type])
}

model Client {
  id               String      @id @default(cuid())
  name             String
  email            String?
  phone            String?
  description      String?
  notes            String?
  location         String?
  photoUrl         String?
  timeline         String?
  milestones       Json?
  schedule         Json?
  
  projects         Project[] 
  incomes          Income[] 
  expenses         Expense[]
  assignedEmployees Employee[] @relation("AssignedClients")
  
  userId           String
  user             User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  spaceId          String?
  space            Space?      @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  @@index([userId])
  @@index([spaceId])
}
```

