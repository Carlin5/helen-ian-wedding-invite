# Helen & Ian — Wedding Invitation

A Paperless Post–style digital wedding invitation for Helen and Ian (Saturday, November 28, 2026 — Kabale, Uganda), built with Vite, React 19, TypeScript, Tailwind CSS 3, and framer-motion. RSVP submissions are handled by Vercel serverless functions (`api/`).

## Pages

- `/` — invitation: envelope hero, details, love story, recommended accommodation carousel, wedding support team, floating RSVP bar.
- `/rsvp` — guest RSVP form (pre-fills attending via `?attending=yes|no`).
- `/admin` — password-protected guest dashboard with totals, search, and CSV export.

## Local development

```bash
pnpm install
pnpm dev        # frontend only (vite)
```

For the API locally, either:

- run `vercel dev` (serves both the frontend and `api/` functions), or
- run just `pnpm dev` — without `BLOB_READ_WRITE_TOKEN` set, submissions are stored in `data/guests.json` (local file fallback), but the API routes still need `vercel dev` (or any @vercel/node-compatible server) to be reachable.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token. Without it, guests are stored in `data/guests.json` (dev only). |
| `ADMIN_PASSWORD` | Password for `/admin` login. Required — without it login returns "Admin access is not configured". |
| `ADMIN_SECRET` | Optional HMAC secret for admin tokens; defaults to `ADMIN_PASSWORD`. |

## Deployment

Deploy on Vercel (no build settings needed beyond the defaults for Vite). `vercel.json` rewrites everything except `/api/*` to `index.html`. Create a Vercel Blob store and set `BLOB_READ_WRITE_TOKEN`, `ADMIN_PASSWORD`, and optionally `ADMIN_SECRET` in the project environment.

## Scripts

- `pnpm dev` — vite dev server
- `pnpm build` — `tsc -b && vite build`
- `pnpm lint` — eslint
- `pnpm preview` — preview production build
