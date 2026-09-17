# StudyDesk - Student Task Manager

A gamified, paper-styled task manager for students. Plan homework, exams, projects
and personal goals with priorities, due dates, subtasks, recurring tasks, a calendar
view, a Pomodoro focus timer, streaks and achievement badges - wrapped in a
hand-drawn PaperCSS aesthetic with light and dark ("midnight desk") themes.

Built with **Next.js 16** (App Router), **TypeScript**, **Prisma + SQLite**,
**Tailwind CSS 4 + PaperCSS**, **Zod** validation and **Bun**.

---

## Table of Contents

- [Features](#features)
  - [Task management](#task-management)
  - [Subtasks](#subtasks--checklists)
  - [Recurring tasks](#recurring-tasks)
  - [Calendar view](#calendar-view)
  - [Bulk actions](#bulk-actions)
  - [Gamification](#gamification)
  - [Pomodoro timer](#pomodoro-focus-timer)
  - [Notifications](#notifications)
  - [Templates, export/import, dashboard](#quick-add-templates)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Security Notes](#security-notes)
- [Styling](#styling)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

### Task management

| Feature | Details |
|---------|---------|
| Create / edit / delete | Full CRUD with inline Zod validation (title 2–120 chars, description up to 600) and character counters |
| Mark complete | One-click toggle with confetti burst and toast feedback |
| Pending vs Completed | Auto-grouped sections with live count badges and an "All done!" celebration empty state |
| Priorities | Low / Medium / High with color-coded left stripes and chips |
| Due dates | Date-time picker with overdue / today / tomorrow detection, due-soon pulse dot and overdue glow |
| Categories | Homework, Exam, Project, Personal, Reading, Other - custom categories supported (max 40 chars) |
| Search | Live search across titles and descriptions (capped at 100 chars server-side) |
| Filters | By status, priority and category, with one-click reset; filter state persists in localStorage |
| Sorting | By due date (dateless tasks sort last), priority, or creation time - ascending/descending |
| Manual ordering | Drag-and-drop reordering via dnd-kit, persisted per filter view |
| Detail drawer | Slide-in panel with meta chips, due-date card, full description, subtasks, timestamps, edit/complete actions |

### Subtasks / checklists

- Unlimited subtasks per task (title 1–160 chars)
- Toggle, rename and delete individual subtasks
- Progress bar (`done/total`) on cards and in the detail drawer
- Subtasks reset automatically when a recurring task rolls over

### Recurring tasks

- Recurrence: `none` | `daily` | `weekly` | `monthly` (requires a due date)
- Completing a recurring task **auto-advances** it to the next cycle instead of
  closing it, and resets its subtasks
- Blue recurrence badge on cards and in the detail drawer

### Calendar view

- Full month grid with prev/next navigation and a "Today" jump button
- Per-day dots colored by priority (red / yellow / green; hollow = completed)
- Per-day completion counts (e.g. `2/3`), today highlighted
- Click a dot to open the task; hover a day for a quick-add (`+`) button

### Bulk actions

- `B` toggles selection mode; per-card checkboxes, select-all-visible, clear
- Sticky action bar: complete / restore / delete (max 200 tasks per batch)
- Separate one-click "clear completed" action

### Gamification

**Streaks & points** (persisted in localStorage):

- Current streak (consecutive completion days), longest streak, total completed
- Study points per completion: high = 30, medium = 20, low = 10
- Flame flicker animation while a streak is alive

**Achievements** - 12 badges with progress tracking, grayscale locked state,
toast + full-screen burst on unlock:

| Badge | Unlock condition |
|-------|------------------|
| First Step 🎯 | Complete 1 task |
| Getting Started 🌱 | Complete 5 tasks |
| On Fire 🔥 | Complete 10 tasks |
| Task Master ⭐ | Complete 25 tasks |
| Centurion 🏆 | Complete 100 tasks |
| Consistent 📅 | 3-day streak |
| Week Warrior ⚔️ | 7-day streak |
| Unstoppable 💎 | 30-day streak |
| Century Club 💯 | Earn 100 study points |
| Scholar 🎓 | Earn 500 study points |
| Legend 👑 | Earn 1000 study points |
| Spark ✨ | Start a 1-day streak |

### Pomodoro focus timer

- Focus (default 25 min) and break (default 5 min) modes with an SVG progress ring
- Preset durations (focus 15/25/35/45/50, break 3/5/10/15/20), persisted locally
- Start / pause / resume / reset, session counter, completion chime, encouragement messages

### Notifications

- Opt-in browser notifications for tasks due within 24 h and overdue tasks
- Deduplicated via a bounded notified-ID list; permission states handled gracefully
- Summary counts in the Tools menu

### Quick-add templates

8 one-click student presets (Problem Set, Reading, Exam Prep, Essay Draft,
Project, Lab Report, Presentation, Quiz Review) with sensible priority,
category, description and due offset. Smart due times: 5 PM same-day, 9 AM later.

### Export / import

- Export every task to CSV (proper quoting/escaping) with a dated filename
- Import from pasted text or file drop, in `merge` or `replace` modes
- Limits: 500 KB / 2000 rows per import; per-row error report (first 20 shown)

### Dashboard & analytics

- Stat cards: Total, Pending, Done, Overdue, Due Today, High Priority (animated counters)
- Overall completion ring + stacked priority breakdown bar
- 7-day weekly recap modal (completions, points, avg/day, streak, best day, badges)
- Shimmer skeleton screens while loading

### Dark theme

- Warm "midnight desk" palette via smart-invert CSS (semantic colors preserved)
- Animated Sun/Moon toggle, FOUC-prevention init script, follows system preference
- Persisted in localStorage

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` | New task |
| `/` | Focus search |
| `V` / `C` | List / calendar view |
| `B` | Bulk select mode |
| `A` | Select all visible (in bulk mode) |
| `?` | Help & shortcuts modal |
| `Esc` | Close modal / drawer / blur input |

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router, standalone output) |
| Language | TypeScript 5 (strict; build fails on type errors) |
| Styling | Tailwind CSS 4 + PaperCSS 1.9.2 (static vendored CSS) |
| Database | Prisma ORM 6 + SQLite |
| Validation | Zod 4 (client hints + server-side enforcement) |
| Icons | Lucide React |
| Drag & drop | @dnd-kit/core + @dnd-kit/sortable |
| Toasts | @radix-ui/react-toast (shadcn/ui primitives) |
| Runtime / PM | Bun |
| Linting | ESLint 9 + eslint-config-next |

---

## Getting Started

### Prerequisites

- **Bun** 1.x (`curl -fsSL https://bun.sh/install | bash`) - or Node.js 18+ with npm
  (adjust commands accordingly)
- No external services needed - the database is a local SQLite file

### 1. Clone & install

```bash
git clone <your-repo-url>
cd studydesk
bun install
```

### 2. Configure environment

```bash
cp .env.example .env
```

`.env` is git-ignored - never commit it. Contents:

```env
DATABASE_URL=file:./db/custom.db
```

### 3. Create the database

```bash
bun run db:push      # create tables from prisma/schema.prisma
bun run db:generate  # (re)generate the Prisma client - also runs on build
```

### 4. Run it

```bash
bun run dev          # http://localhost:3000
```

### 5. Production

```bash
bun run build
bun run start        # http://localhost:3000
```

---

## Scripts

| Command | What it does |
|---------|--------------|
| `bun run dev` | Dev server on port 3000 |
| `bun run build` | `prisma generate && next build` (standalone output) |
| `bun run start` | Production server on port 3000 |
| `bun run lint` | ESLint over the repo (must be warning-free) |
| `bun run db:push` | Push schema to SQLite (prototyping) |
| `bun run db:generate` | Regenerate Prisma client |
| `bun run db:migrate` | `prisma migrate dev` (versioned migrations) |
| `bun run db:reset` | ⚠️ Destructive database reset |

---

## API Reference

Base path `/api`, all JSON. Error responses are generic
(`{ "error": "..." }`); details are logged server-side only.

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | List with `status` (pending/completed/all), `priority`, `category`, `search` (≤100 chars), `sort` (due/priority/created), `dir` (asc/desc). Invalid filters → 400 |
| `POST` | `/api/tasks` | Create. Body: `title*` (2–120), `description` (≤600), `priority`, `category` (≤40), `dueDate` (valid date string), `recurrence`. Invalid → 400 |
| `GET` | `/api/tasks/:id` | Single task with subtasks (404 if missing) |
| `PUT` | `/api/tasks/:id` | Partial update. Completing a recurring task advances its due date and resets subtasks; response includes `recurrenceAdvanced` |
| `DELETE` | `/api/tasks/:id` | Delete (subtasks cascade) |
| `POST` | `/api/tasks/bulk` | `{ ids: string[1..200], action: "complete" \| "pending" \| "delete" }` |
| `DELETE` | `/api/tasks/clear-completed` | Delete all completed tasks (`{ deleted }`) |
| `GET` | `/api/tasks/export` | CSV download (`studydesk-tasks-YYYY-MM-DD.csv`) |
| `POST` | `/api/tasks/import` | `{ csv: string (≤500 KB), mode: "merge" \| "replace" }`, max 2000 rows. Returns `{ imported, skipped, total, errors[] }` |
| `GET` | `/api` | Health check |

### Subtasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks/:id/subtasks` | List (oldest first) |
| `POST` | `/api/tasks/:id/subtasks` | `{ title* (1–160) }` → 201 |
| `PUT` | `/api/tasks/:id/subtasks/:subId` | `{ title?, done? }` (404 on task mismatch) |
| `DELETE` | `/api/tasks/:id/subtasks/:subId` | Delete |

### Stats

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | `{ total, pending, completed, overdue, dueToday, dueThisWeek, highPriority, byPriority[], byCategory[], completionRate }` |

### Examples

```bash
# Create
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Read Chapter 8","priority":"low","category":"Reading","dueDate":"2026-09-20T09:00:00.000Z","recurrence":"weekly"}'

# List pending, due-date first
curl 'http://localhost:3000/api/tasks?status=pending&sort=due&dir=asc'

# Complete (recurring tasks roll over instead)
curl -X PUT http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# Bulk complete (≤200 ids)
curl -X POST http://localhost:3000/api/tasks/bulk \
  -H "Content-Type: application/json" \
  -d '{"ids":["id1","id2"],"action":"complete"}'

# Export
curl -o tasks.csv http://localhost:3000/api/tasks/export
```

---

## Database Schema

```prisma
model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  priority    String    @default("medium") // low | medium | high
  status      String    @default("pending") // pending | completed
  category    String?
  dueDate     DateTime?
  recurrence  String    @default("none") // none | daily | weekly | monthly
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  subtasks    Subtask[]

  @@index([status])
  @@index([priority])
  @@index([dueDate])
  @@index([category])
  @@index([recurrence])
}

model Subtask {
  id        String   @id @default(cuid())
  title     String
  done      Boolean  @default(false)
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([taskId])
}
```

SQLite file lives at `db/custom.db` (git-ignored). Delete it + re-run `db:push`
for a fresh database.

---

## Project Structure

```
studydesk/
├── prisma/schema.prisma            # Task + Subtask models
├── public/
│   ├── papercss/paper.min.css      # Vendored PaperCSS (no CDN dependency)
│   ├── logo.svg
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Metadata, PaperCSS link, theme init, toaster
│   │   ├── page.tsx                # Main UI orchestration
│   │   ├── globals.css             # Theme, animations, dark mode
│   │   └── api/                    # Route handlers (tasks, subtasks, bulk,
│   │                               # clear-completed, export, import, stats)
│   ├── components/                 # Cards, calendar, drawers, modals, widgets…
│   │   └── ui/                     # toast primitives (shadcn/ui)
│   ├── hooks/                      # tasks, stats/filters, streak, theme,
│   │                               # notifications, toast, mobile
│   └── lib/                        # db client, Zod schemas, CSV utils,
│                                   # recurrence, achievements, templates
├── .env.example                    # Copy to .env (git-ignored)
├── components.json                 # shadcn/ui config
├── next.config.ts                  # Standalone + strict mode + security headers
└── package.json
```

---

## Configuration

### Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite file URL | `file:./db/custom.db` |
| `NODE_ENV` | `development` enables warn-level Prisma logs; production logs errors only | - |

### localStorage keys (client state, no server sessions)

| Key | Purpose |
|-----|---------|
| `studydesk:filters:v1` | Filter/sort state |
| `studydesk:theme` | Light/dark preference |
| `studydesk:streak` / `studydesk:points` | Streaks, totals, points |
| `studydesk:notif-enabled` / `studydesk:notified-ids` | Notification toggle + dedup list |
| `studydesk:pomodoro-durations` | Custom timer lengths |
| `studydesk:manual-order` | Drag-and-drop order map |

### Next.js

Standalone output, React strict mode, and global security headers
(`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy`, restrictive `Permissions-Policy`).

---

## Security Notes

- **No authentication conclusively: every API route is open.** Run locally or
  behind your own auth/reverse proxy - do not expose directly to the internet.
- Inputs are Zod-validated server-side; filters whitelisted; search capped;
  uploads bounded (500 KB / 2000 rows / 200 ids per bulk batch).
- Error responses are generic; stack/ORM details stay in server logs.
- No secrets in the repo: `.env` and `*.db` are git-ignored; start from
  `.env.example`. No external CDNs (PaperCSS and icons are local).

---

## Styling

PaperCSS supplies the hand-drawn look (sketchy borders, paper shadows,
Patrick Hand SC / Neucha); Tailwind utilities + a few shadcn primitives cover
layout and toasts. Component colors live in inline `style` props using the
PaperCSS palette; dark mode smart-inverts surfaces while keeping semantic
accents (red/yellow/green/blue) intact.

| Token | Light | Dark |
|-------|-------|------|
| Background | `#f4f1ea` | `#2a2520` |
| Surface | `#fffdf7` | `#34302a` |
| Border | `#41403e` | `#8b867d` |
| Text | `#1a1a1a` | `#f4f1ea` |
| Accents | `#41403e` / `#0b74d5` / `#86a361` / `#ddcd45` / `#a7342d` | preserved |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `DATABASE_URL` missing / Prisma can't open DB | `cp .env.example .env`, then `bun run db:push` |
| Prisma Client out of sync after schema edit | `bun run db:generate` (and restart dev server) |
| Stale build artifacts | Delete `.next/` and rebuild |
| Port 3000 in use | `bun run dev` binds `-p 3000`; free the port or edit the script |
| `bun run lint` warnings | Must be zero - the repo convention is warning-free lint |
| Fresh start | Delete `db/custom.db`, re-run `db:push` (data loss!) |

---

## Acknowledgments

- [PaperCSS](https://www.getpapercss.com/) - sub-900-line sketchy CSS framework
- [Next.js](https://nextjs.org/), [Prisma](https://www.prisma.io/),
  [dnd-kit](https://dndkit.com/), [Lucide](https://lucide.dev/),
  [Zod](https://zod.dev/)

---

## License

Private project - all rights reserved unless a license file states otherwise.
