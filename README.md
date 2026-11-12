# Stacks

A habit-stacking app for your phone. Each habit is written as an implementation
intention ("I will [action] at [time] in [location]"), and habits are chained into
stacks ("After I [current habit], I will [new habit]"), the two techniques from
*Atomic Habits*. Hold a habit to complete it, keep your streak going, and ask the AI
coach when you get stuck.

It started as a Replit prototype called HabitFlow and was rebuilt for everyday use:
Postgres storage, a password-protected login, an app you can install on Android and
iPhone, and a deployment on Render.

## Features

- **Home:** your stacks as chains of habits. Hold a habit for 0.8 seconds to complete
  it; a progress indicator fills while you hold. Finishing every habit in a stack sets
  off a confetti burst, and habits whose time has passed are flagged as overdue.
- **Stats:** today's progress, current and best streak, total habits, active stacks,
  overall progress, and a one-tap JSON backup of all your data.
- **AI Coach:** chat about your habits with GPT-4o, guided by *Atomic Habits*
  principles. Without an OpenAI key, or when the quota runs out, it answers with
  built-in advice instead of failing.
- **Inspire:** a daily habit tip and motivation.
- **Reminders:** optional browser notifications at each habit's set time while the app
  is open.
- **Installable:** a web app manifest and icons, so it opens full screen from the home
  screen. Light and dark themes.

## How streaks work

A day counts when at least one habit is completed. The current streak runs back from
today, or from yesterday if nothing is done yet today, so an unfinished day never
breaks it, but a missed day does. The best streak is the longest run so far. Days are
counted by UTC date.

## Built with

- **Front end:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix),
  TanStack Query, Framer Motion
- **Back end:** Node.js 20, Express, Drizzle ORM, Neon Postgres, express-session with
  connect-pg-simple, OpenAI SDK
- **Hosting:** a Render web service with a Neon Postgres database

## How it's put together

```
client/   React app: Home, Stats, AI Coach and Inspire tabs, components, hooks
server/   Express REST API, storage, login, streaks, OpenAI client
shared/   Drizzle tables and Zod schemas used by both sides
```

- **Storage switches on one setting.** With `DATABASE_URL` set, data lives in
  Postgres through Drizzle (`server/pg-storage.ts`). Without it, data is saved to a
  local `habits.json` file (`server/storage.ts`). Both implement the same `IStorage`
  interface, so the rest of the app doesn't care which one is in use.
- **Tables:** `routines` (the stacks), `habits`, `routine_habits` (each habit's place
  and connector within a stack) and `habit_completions`.
- **Accurate totals:** deleting a stack, or removing a habit from one, also deletes
  habits that no longer belong to any stack, so they can't inflate the statistics.
- **One shared password.** With `APP_PASSWORD` set, every page and API call needs a
  login. Sessions are stored in Postgres and last 90 days. The login page, the app
  manifest and the icons stay public so the app can still be installed. Without
  `APP_PASSWORD` (local development) there is no login.
- **REST API** under `/api`: routines, habits, completions, stats, export, chat and
  habit suggestions (`server/routes.ts`).

## Run it locally

Needs Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5000
```

On Windows you can also double-click `Start Stacks.bat`.

Optional settings go in a `.env` file:

| Variable | What it does |
|---|---|
| `DATABASE_URL` | Postgres connection string. Without it, data is saved to `habits.json`. |
| `OPENAI_API_KEY` | Turns on GPT-4o replies in the AI Coach. Without it, built-in advice is used. |
| `APP_PASSWORD` | Turns on the login page. Leave it unset for local development. |
| `SESSION_SECRET` | Signs the login cookie. Falls back to `APP_PASSWORD` if unset. |

Other scripts:

- `npm run check`: TypeScript type check
- `npm run build`, then `npm start`: production build and server
- `npm run db:push`: create or update the database tables. drizzle-kit reads
  `DATABASE_URL` from the shell, not from `.env`.

## Deploying

`render.yaml` is a Render Blueprint for one web service. Render builds with
`npm ci --include=dev && npm run build`, starts with `npm start`, and checks `/login`
to confirm the app is up. Set `DATABASE_URL`, `OPENAI_API_KEY` and `APP_PASSWORD` in
the Render dashboard; Render generates `SESSION_SECRET`. Every push to `main`
redeploys.

On Render's free plan the service sleeps when idle, so the first visit after a quiet
spell takes 30 to 60 seconds.
