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
