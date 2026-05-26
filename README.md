<div align="center">

# Auxillium

### Business OS dla małych i średnich firm

<p align="center">
  <img src="https://img.shields.io/badge/status-w%20budowie-01696f?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-Prisma-3982CE?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/licencja-MIT-15803d?style=for-the-badge" alt="MIT" />
</p>

</div>

---

## O projekcie

Auxillium to platforma CRM/ERP dla MŚP łącząca zarządzanie projektami, leadami, klientami, finansami, pracownikami i dokumentami w jednym systemie. Zbudowana na Next.js 16 z wielojęzyczną obsługą (PL/EN/DE) i systemem wielodostępu (Spaces).

## Stack technologiczny

| Warstwa | Technologie |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| UI | Tailwind CSS v4, Material UI, Framer Motion |
| Baza danych | PostgreSQL + Prisma |
| Auth | JWT (jose), Argon2, OAuth (Google, GitHub) |
| Pliki | Supabase Storage |
| Cache | Upstash Redis |
| Płatności | Stripe (subskrypcje) |
| AI | OpenRouter + Vercel AI SDK |

## Funkcje

- **Projekty** — kanban, oś czasu, priorytety, drag-and-drop
- **Leady i klienci** — CRM z filtrowaniem i statusami
- **Finanse** — przychody, koszty, P&L, raporty
- **Zadania** — tablica kanban, przypisywanie do członków
- **Pracownicy** — zarządzanie zespołem, obciążenie pracą
- **Dokumenty** — kreator szablonów z placeholderami, eksport PDF
- **AI Chat** — asystent z dostępem do danych workspace + Google (Docs, Sheets, Calendar)
- **Subskrypcje** — FREE / PRO / ENTERPRISE przez Stripe

## Uruchomienie

```bash
npm install
npm run dev
```

Wymagane zmienne środowiskowe: `.env` z danymi PostgreSQL, Supabase, Redis, Stripe, OpenRouter, Google OAuth.

```bash
npx prisma generate   # regeneracja klienta po zmianie schematu
npx prisma db push    # synchronizacja schematu z bazą
```

## Struktura

```
app/
├── [locale]/
│   ├── (marketing)/   # strony publiczne
│   └── (dashboard)/   # chronione strony aplikacji
├── api/               # REST endpoints (auth, stripe, AI, PDF)
├── components/        # komponenty React
└── context/           # UserContext, TranslationContext
actions/               # server actions (logika biznesowa)
lib/                   # session, redis, supabase, i18n
prisma/schema.prisma   # schemat bazy danych
public/locales/        # tłumaczenia (pl/en/de)
```

---

<div align="center">
  <sub>Zbudowane z Next.js · Tailwind · Prisma · Stripe</sub>
</div>
