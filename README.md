# MPF Admin

New My Perfect Fit admin dashboard — Next.js, Tailwind CSS, and shadcn/ui.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- shadcn/ui (neutral / light-first)
- next-themes

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- `/` — dashboard shell
- `/login` — UI-only login
- Sidebar modules are placeholders mirroring the legacy admin nav

## Auth

Better Auth bridges to the MPF GraphQL `login` query (same pattern as legacy next-auth Credentials).

1. Copy `.env.example` → `.env.local` and set secrets / API URLs
2. Ensure `data/` exists and run `npm run db:push` (libsql SQLite for Better Auth user/session tables)
3. Sign in at `/login` with admin email + password (+ display name)
4. Session cookie is Better Auth; GraphQL calls use `Authorization: Bearer <mpfAccessToken>`

## Notes

Legacy reference app: `../myperfectfit-admin-ui-main`

## Maintenance announcements

Before a deploy, open **System → Maintenance** (`/system/maintenance`):

1. **Schedule warning** (e.g. 30 minutes) — all open admin tabs show a countdown dialog (“save work and log out”).
2. **Start maintenance now** (or wait until the scheduled time) — full-screen lock on every session until you end it.
3. **End maintenance** — unlocks the portal.

The control page (`/system/maintenance`) stays usable while the lock is active so ops can end maintenance. All other routes show the full-screen lock.

State is stored in `prefs.db` (`maintenance_status` table). Run `npm run db:push:prefs` after pull if the table is missing.

Realtime (optional): set `ABLY_API_KEY` (server publish) and `NEXT_PUBLIC_ABLY_KEY` (client subscribe). Without Ably keys, clients poll every 20s.

Ably dashboard → API keys → Capabilities must allow channel **`mpfadmin-maintenance`** (or `*`). Do **not** use a `:` in the channel name unless the key capability includes that namespace (e.g. `mpf-admin:*`). Override channel with `NEXT_PUBLIC_ABLY_MAINTENANCE_CHANNEL` if needed.

Prefer a **subscribe-only** key for `NEXT_PUBLIC_ABLY_KEY` (browser-visible); keep the full publish key in `ABLY_API_KEY` server-only.

Emergency: `MAINTENANCE_FORCE_ACTIVE=true` forces the lock regardless of DB status.
