# StudyDesk — Student Task Manager

A feature-rich, gamified task management application designed specifically for students. Built with Next.js 16, TypeScript, Prisma, and styled with [PaperCSS](https://www.getpapercss.com/) for a hand-drawn, paper-notebook aesthetic.

---

## Overview

StudyDesk helps students manage homework, exams, projects, and personal tasks with priorities, due dates, subtasks, recurring tasks, a calendar view, a Pomodoro focus timer, achievement badges, streak tracking, and more — all wrapped in a delightful paper-themed UI with light/dark modes.

### Key Highlights

- Full CRUD task management with subtasks/checklists
- Monthly calendar view with color-coded due dates
- Recurring tasks (daily/weekly/monthly) with auto-advance on completion
- Gamification: streaks, study points, 12 achievement badges
- Pomodoro focus timer with customizable durations
- Browser notifications for due-soon and overdue tasks
- Quick-add templates for common student tasks
- CSV export/import for data portability
- Drag-and-drop manual task reordering
- Loading skeletons, confetti, and celebration animations
- Dark "midnight desk" theme toggle
- Fully responsive, keyboard-accessible, with 7+ keyboard shortcuts

---

## Features

### Core Task Management

| Feature | Description |
|---------|-------------|
| Create / Edit / Delete | Full CRUD with inline form validation (Zod) and character counters |
| Mark Complete | One-click toggle with confetti animation and toast feedback |
| Pending vs Completed | Auto-grouped sections with live count badges |
| Priority Levels | Low / Medium / High with color-coded left stripes and chips |
| Due Dates | DateTime picker with overdue/today/tomorrow detection and pulse indicators |
| Categories | Homework, Exam, Project, Personal, Reading, Other (custom categories supported) |
| Search | Live search across titles and descriptions |
| Filter | By status, priority, and category with a "Clear" reset button |
| Sort | By due date, priority, recently added, or manual (drag-and-drop) — ascending/descending |

### Subtasks / Checklists

- Add unlimited subtasks to any task
- Toggle individual subtask completion
- Progress bar showing done/total on both task cards and detail drawer
- Subtasks auto-reset when a recurring task auto-advances

### Recurring Tasks

- Set recurrence to none, daily, weekly, or monthly
- Completing a recurring task **auto-advances** the due date to the next cycle
- Subtasks are reset for the new cycle
- Visual recurrence badge (blue pill with Repeat icon) on cards and detail drawer

### Calendar View

- Full month grid with weekday headers
- Navigation: previous/next month + "Today" jump button
- Color-coded dots per day (red=high, yellow=medium, green=low, hollow=completed)
- Completion count per day (e.g., "2/3")
- Today highlighted with blue circle
- Click any task dot to open the detail drawer
- Hover reveals "+" button to add a task on that day

### Task Detail Drawer

- Slide-in drawer from the right (460px wide)
- Shows: full title, priority/category/status meta chips, due date card with overdue/today detection, full description, subtask checklist with progress bar, created/updated timestamps
- Edit and Complete/Reopen action buttons
- Escape to close, click backdrop to close

### Bulk Actions

- "Select" toggle button in header activates bulk mode
- Per-card selection checkboxes
- "Select all visible" and "Clear selection" controls
- Sticky BulkActionBar with Complete / Restore / Delete / Clear actions
- Bulk API endpoint for efficient batch operations

### Gamification

#### Streak Tracking
- Current streak (consecutive days with task completion)
- Best/longest streak ever
- Total completed tasks (all-time)
- Study points: high=30pts, medium=20pts, low=10pts per task
- Flame flicker animation on active streak
- Persisted to localStorage

#### Achievements / Badges (12 milestones)
| Badge | Emoji | Unlock Condition |
|-------|-------|-------------------|
| First Step | 🎯 | Complete 1 task |
| Getting Started | 🌱 | Complete 5 tasks |
| On Fire | 🔥 | Complete 10 tasks |
| Task Master | ⭐ | Complete 25 tasks |
| Centurion | 🏆 | Complete 100 tasks |
| Spark | ✨ | Start a 1-day streak |
| Consistent | 📅 | 3-day streak |
| Week Warrior | ⚔️ | 7-day streak |
| Unstoppable | 💎 | 30-day streak |
| Century Club | 💯 | Earn 100 study points |
| Scholar | 🎓 | Earn 500 study points |
| Legend | 👑 | Earn 1000 study points |

- Collapsible widget with progress bar (X/12)
- Unlocked badges: full color, locked: grayscale with lock icon
- Toast notification + full-screen burst animation on unlock

### Pomodoro Focus Timer

- Focus mode (default 25 min) + Break mode (default 5 min)
- Customizable durations: 5 focus presets (15/25/35/45/50m) + 5 break presets (3/5/10/15/20m)
- Circular SVG progress ring with animated stroke
- Start / Pause / Resume / Reset controls
- Session counter (🍅 ×N)
- Web Audio API beep on completion (660Hz focus, 440Hz break)
- Encouraging messages based on session count
- Durations persist to localStorage

### Notifications

- Browser notifications for tasks due within 24 hours
- Overdue task alerts
- Deduplication via localStorage-tracked notified IDs
- Permission management (request/grant/deny)
- Toggle in Tools menu with due-soon/overdue summary

### Quick Add Templates (8 presets)

| Template | Emoji | Priority | Category | Default Due |
|----------|-------|----------|----------|-------------|
| Problem Set | ✏️ | High | Homework | +48h |
| Reading | 📖 | Low | Reading | +72h |
| Exam Prep | 📝 | High | Exam | +168h |
| Essay Draft | 📄 | Medium | Homework | +96h |
| Project | 🔧 | Medium | Project | +120h |
| Lab Report | 🧪 | High | Homework | +72h |
| Presentation | 🎯 | Medium | Project | +96h |
| Quiz Review | ⚡ | Medium | Exam | +24h |

### Export / Import

- Export all tasks to CSV with proper escaping (title, description, priority, status, category, dueDate, recurrence, timestamps)
- Import CSV with merge or replace modes
- Drag-and-drop file upload or paste CSV text
- Import result display with per-row error reporting

### Dashboard & Analytics

- 6 stat cards: Total, Pending, Done, Overdue, Due Today, High Priority
- Animated number counters (requestAnimationFrame easing)
- Circular SVG progress ring showing overall completion %
- Priority breakdown bar (stacked horizontal: red/yellow/green with legend)
- "Clear completed" button
- Loading skeleton screens with shimmer animation

### Weekly Recap Modal

- 4 summary stats: week's completions, points, avg/day, current streak
- 7-day bar chart with heatmap-colored bars (green gradient based on completion count)
- Today's bar highlighted with blue star marker
- "Best day" callout
- Earned badges display

### Dark Theme

- "Midnight desk" warm palette (#2a2520 bg, not pure black)
- Smart-invert CSS approach preserves semantic accent colors
- Animated Sun/Moon toggle button
- FOUC prevention via inline init script
- Respects system `prefers-color-scheme`
- Persisted to localStorage

### UX Polish

- Confetti animation on task completion (30 paper-style pieces from checkbox position)
- Full-screen achievement burst celebration (24 radiating pieces + badge card)
- "All done!" celebration empty state with PartyPopper icon
- Overdue task glow animation (red box-shadow pulse)
- Card hover lift effect (translateY + rotate + shadow)
- Delete confirmation overlay (prevents accidental data loss)
- Drag-and-drop task reordering with dnd-kit (manual sort mode)
- Sticky footer with completion summary and keyboard shortcut hints
- Loading skeleton screens with staggered shimmer
- Motivational quote widget (15 quotes, daily rotation)

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + [PaperCSS](https://www.getpapercss.com/) 1.9.2 |
| **Database** | Prisma ORM 6 + SQLite |
| **Validation** | Zod 4 |
| **Icons** | Lucide React |
| **Drag & Drop** | @dnd-kit/core + @dnd-kit/sortable |
| **Package Manager** | Bun |
| **Linting** | ESLint 9 + eslint-config-next |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (or [Bun](https://bun.sh/) runtime)
- Bun package manager (`curl -fsSL https://bun.sh/install | bash`)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd studydesk

# Install dependencies
bun install
```

### Database Setup

The app uses SQLite via Prisma. The database file lives at `db/custom.db`.

```bash
# Push the schema to create/update tables
bun run db:push

# (Optional) Regenerate the Prisma client
bun run db:generate
```

### Environment Variables

Copy `.env.example` to `.env` (already git-ignored, never commit it):

```bash
cp .env.example .env
```

```env
DATABASE_URL=file:./db/custom.db
```

### Running the Dev Server

```bash
bun run dev
```

The app will be available at `http://localhost:3000`.

### Linting

```bash
bun run lint
```

### Production Build

```bash
bun run build
bun run start
```

---

## API Reference

All API routes are under `/api` and return JSON.

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | List tasks with filters: `status`, `priority`, `category`, `search`, `sort` (due/priority/created/manual), `dir` (asc/desc) |
| `POST` | `/api/tasks` | Create a task (Zod-validated body: title, description, priority, category, dueDate, recurrence) |
| `GET` | `/api/tasks/:id` | Get a single task with subtasks |
| `PUT` | `/api/tasks/:id` | Update a task (partial fields). Recurring tasks auto-advance due date on completion |
| `DELETE` | `/api/tasks/:id` | Delete a task (cascades to subtasks) |
| `POST` | `/api/tasks/bulk` | Bulk action: `{ ids: string[], action: "complete" \| "pending" \| "delete" }` |
| `DELETE` | `/api/tasks/clear-completed` | Delete all completed tasks |
| `GET` | `/api/tasks/export` | Download all tasks as CSV |
| `POST` | `/api/tasks/import` | Import tasks from CSV: `{ csv: string, mode: "merge" \| "replace" }` |

### Subtasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks/:id/subtasks` | List subtasks for a task |
| `POST` | `/api/tasks/:id/subtasks` | Create a subtask |
| `PUT` | `/api/tasks/:id/subtasks/:subId` | Update a subtask (title, done) |
| `DELETE` | `/api/tasks/:id/subtasks/:subId` | Delete a subtask |

### Stats

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Dashboard statistics: total, pending, completed, overdue, dueToday, dueThisWeek, highPriority, byPriority, byCategory, completionRate |

### Example API Calls

```bash
# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Read Chapter 8","priority":"low","category":"Reading","dueDate":"2026-09-20T09:00:00.000Z","recurrence":"weekly"}'

# List pending tasks sorted by due date
curl http://localhost:3000/api/tasks?status=pending&sort=due&dir=asc

# Mark task complete (recurring tasks auto-advance)
curl -X PUT http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# Bulk complete
curl -X POST http://localhost:3000/api/tasks/bulk \
  -H "Content-Type: application/json" \
  -d '{"ids":["id1","id2","id3"],"action":"complete"}'

# Export to CSV
curl -o tasks.csv http://localhost:3000/api/tasks/export
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` | Create new task |
| `/` | Focus the search bar |
| `V` | Switch to list view |
| `C` | Switch to calendar view |
| `B` | Toggle bulk select mode |
| `A` | Select all visible tasks (in bulk mode) |
| `?` | Open help & shortcuts modal |
| `Esc` | Close modal / drawer / clear focus |

---

## Project Structure

```
studydesk/
├── prisma/
│   └── schema.prisma              # Task + Subtask models with indexes
├── public/
│   ├── papercss/
│   │   └── paper.min.css          # PaperCSS framework (static)
│   ├── logo.svg
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (PaperCSS + theme init script)
│   │   ├── page.tsx               # Main page (all UI orchestration)
│   │   ├── globals.css            # Global styles, animations, dark theme
│   │   └── api/
│   │       ├── route.ts           # Health check
│   │       ├── stats/route.ts     # Dashboard statistics
│   │       └── tasks/
│   │           ├── route.ts       # GET (list+filters) / POST (create)
│   │           ├── [id]/
│   │           │   ├── route.ts   # GET / PUT / DELETE single task
│   │           │   └── subtasks/
│   │           │       ├── route.ts       # GET / POST subtasks
│   │           │       └── [subId]/route.ts  # PUT / DELETE subtask
│   │           ├── bulk/route.ts          # Bulk update/delete
│   │           ├── clear-completed/route.ts  # Delete all completed
│   │           ├── export/route.ts       # CSV export
│   │           └── import/route.ts       # CSV import
│   ├── components/
│   │   ├── achievement-burst.tsx  # Full-screen achievement celebration
│   │   ├── achievements-widget.tsx# Collapsible badge grid
│   │   ├── bulk-action-bar.tsx    # Sticky bulk action toolbar
│   │   ├── calendar-view.tsx     # Monthly calendar grid
│   │   ├── confetti.tsx          # Confetti burst on task completion
│   │   ├── export-import-modal.tsx # CSV export/import modal
│   │   ├── filter-bar.tsx        # Search + filters + sort
│   │   ├── help-modal.tsx        # Keyboard shortcuts + tips modal
│   │   ├── motivation-quote.tsx  # Daily rotating quote widget
│   │   ├── notification-settings.tsx # Browser notification toggle
│   │   ├── pomodoro-timer.tsx    # Focus/break timer with SVG ring
│   │   ├── quick-add-templates.tsx # 8 student task presets
│   │   ├── skeleton.tsx          # Loading skeleton components
│   │   ├── sortable-task-list.tsx# DnD wrapper (dnd-kit)
│   │   ├── stats-dashboard.tsx   # 6 stat cards + circular ring + priority bar
│   │   ├── streak-widget.tsx     # Streak/points/best/total widget
│   │   ├── subtask-list.tsx      # Subtask CRUD with progress bar
│   │   ├── task-card.tsx         # Task card with priority stripe, subtask progress
│   │   ├── task-detail.tsx       # Slide-in detail drawer
│   │   ├── task-form.tsx         # Create/edit modal with recurrence picker
│   │   ├── theme-toggle.tsx      # Animated Sun/Moon dark mode toggle
│   │   ├── weekly-recap-modal.tsx# 7-day bar chart + badges
│   │   └── ui/
│   │       ├── toast.tsx         # Toast primitives (shadcn)
│   │       └── toaster.tsx       # Toast viewport (shadcn)
│   ├── hooks/
│   │   ├── use-mobile.ts         # Responsive breakpoint hook
│   │   ├── use-notifications.ts   # Browser notification management
│   │   ├── use-streak.ts         # Streak/points/achievements tracking
│   │   ├── use-tasks.ts          # Task fetching + filter state + localStorage
│   │   ├── use-theme.ts          # Dark/light theme management
│   │   └── use-toast.ts          # Toast notification hook (shadcn)
│   └── lib/
│       ├── achievements.ts       # 12 achievement definitions
│       ├── db.ts                 # Prisma client singleton
│       ├── task-templates.ts     # 8 quick-add template definitions
│       ├── task-utils.ts         # Zod schemas, types, CSV utils, recurrence
│       └── utils.ts              # cn() class merge utility
├── .env.example                  # Copy to .env (git-ignored)
├── .gitignore
├── components.json               # shadcn/ui config
├── eslint.config.mjs
├── next.config.ts                # Standalone output + security headers
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Database Schema

```prisma
model Task {
  id          String      @id @default(cuid())
  title       String
  description String?
  priority    String      @default("medium")    // low | medium | high
  status      String      @default("pending")   // pending | completed
  category    String?                            // Homework, Exam, Project, etc.
  dueDate     DateTime?
  recurrence  String      @default("none")       // none | daily | weekly | monthly
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
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

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database file path | `file:./db/custom.db` |

### localStorage Keys

The app uses localStorage for client-side state (no server-side sessions):

| Key | Purpose |
|-----|---------|
| `studydesk:filters:v1` | Persisted filter/sort state |
| `studydesk:theme` | Dark/light theme preference |
| `studydesk:streak` | Streak data (current, longest, total, last completion date) |
| `studydesk:points` | Study points + history |
| `studydesk:notif-enabled` | Browser notification toggle |
| `studydesk:notified-ids` | Notification dedup tracking |
| `studydesk:pomodoro-durations` | Custom Pomodoro focus/break lengths |
| `studydesk:manual-order` | Drag-and-drop task order map |

### Next.js Config

```typescript
const nextConfig: NextConfig = {
  output: "standalone", // Optimized production build
  reactStrictMode: true, // Strict checks on
  // + security headers (nosniff, DENY framing, restricted permissions)
};
```

> **Security note:** this app has no authentication — every API route is
> open. Only run it locally or behind your own auth/proxy. Do not expose
> it directly to the internet.

---

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server on port 3000 (Turbopack) |
| `bun run build` | Production build (standalone output) |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:generate` | Regenerate Prisma client |
| `bun run db:migrate` | Create and apply a migration |
| `bun run db:reset` | Reset database (destructive) |

---

## Styling

The app uses a dual-framework approach:

1. **PaperCSS** (loaded via `<link>` in `layout.tsx`) — provides the hand-drawn, sketchy aesthetic with irregular borders, paper shadows, and the Patrick Hand SC / Neucha fonts
2. **Tailwind CSS 4** — used for utility classes and the shadcn/ui base reset

Most component styling is done via inline `style` props with PaperCSS-compatible color values. The dark theme uses a smart-invert CSS filter approach (`invert(0.92) hue-rotate(180deg)`) on the main app wrapper to transform light surfaces to dark while preserving semantic accent colors.

### Color Palette (PaperCSS)

| Token | Light | Dark |
|-------|-------|------|
| Background | `#f4f1ea` | `#2a2520` |
| Surface | `#fffdf7` | `#34302a` |
| Border | `#41403e` | `#8b867d` |
| Text | `#1a1a1a` | `#f4f1ea` |
| Primary (dark) | `#41403e` | — |
| Secondary (blue) | `#0b74d5` | — |
| Success (green) | `#86a361` | — |
| Warning (yellow) | `#ddcd45` | — |
| Danger (red) | `#a7342d` | — |

---

## Acknowledgments

- [PaperCSS](https://www.getpapercss.com/) — The less-than-900-line CSS framework
- [Next.js](https://nextjs.org/) — The React framework for the web
- [Prisma](https://www.prisma.io/) — Next-generation TypeScript ORM
- [dnd-kit](https://dndkit.com/) — Modern drag-and-drop toolkit
- [Lucide](https://lucide.dev/) — Beautiful, consistent icons
- [Zod](https://zod.dev/) — TypeScript-first schema validation

---

## License

This project is private and unlicensed.
