# BAZOCON Q&A

Realtime schedule and session-specific Q&A for BAZOCON.

## Screens

- `/` attendee schedule and session entry page
- `/s/[sessionSlug]` attendee Q&A room for a talk
- `/admin` operator moderation page
- `/screen/current` live display for the current session
- `/screen/[sessionSlug]` live display pinned to one session

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without Supabase environment variables, the app renders the static schedule as a local preview. Realtime Q&A requires Supabase.

## Supabase

Apply `supabase/migrations/20260619000000_bazocon_qna.sql` to the project database.

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
```

The public client subscribes to `sessions`, `questions`, `question_votes`, and `event_state` through Supabase Realtime. Mutations go through Next.js Route Handlers so attendee writes do not require direct table insert policies.

## Verification

```bash
npm run lint
npm run build
```
