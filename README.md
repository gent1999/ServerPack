# ServerPack

Backend for Wolfpack.fm: admin authentication + a text-article API. PERN stack (PostgreSQL + Express + React frontend + Node) with Prisma as the ORM.

This first pass covers **admin authentication** and **text-only articles** only. No images, artists, playlists, submissions, or additional roles yet.

## Stack

- Node.js + Express 5
- PostgreSQL via Prisma ORM
- JWT authentication (7-day expiry)
- bcrypt password hashing (`bcryptjs`)
- helmet, CORS allowlist, rate-limited login, centralized JSON error handling

## Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Copy `.env.example` to `.env` and fill in real values first. Required variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection string (app runtime) |
| `DIRECT_URL` | Unpooled Postgres connection string (Prisma Migrate) |
| `JWT_SECRET` | Random secret used to sign admin JWTs |
| `ADMIN_EMAIL` | Email for the seeded admin account |
| `ADMIN_PASSWORD` | Password for the seeded admin account (hashed before storage) |
| `PORT` | Port Express listens on (default 5000) |
| `FRONTEND_URL` | Deployed frontend origin, allowed via CORS in addition to `localhost:5173` |

The seed script (`npm run seed`) is idempotent: re-running it updates the existing admin's password hash instead of creating a duplicate.

## API

### Auth

- `POST /api/auth/login` — `{ email, password }` → `{ token, admin }`. Rate-limited (10 attempts / 15 min). Returns a generic 401 on any bad credentials.
- `GET /api/auth/me` — protected, returns the authenticated admin (no password hash ever included).

### Admin articles (protected, `Authorization: Bearer <token>`)

- `GET /api/admin/articles` — all articles (draft + published), newest first.
- `GET /api/admin/articles/:id`
- `POST /api/admin/articles` — `{ title, excerpt?, content, authorName?, status? }`. Slug is auto-generated from the title and de-duplicated (`-2`, `-3`, ...).
- `PUT /api/admin/articles/:id`
- `DELETE /api/admin/articles/:id`
- `PATCH /api/admin/articles/:id/status` — `{ status: "DRAFT" | "PUBLISHED" }`. Sets `publishedAt` the first time an article is published; does not clear it when reverted to draft.

### Public articles (no auth)

- `GET /api/articles` — published articles only, newest published first.
- `GET /api/articles/:slug` — 404 for missing or draft articles.

## Notes on decisions

- Slugs are generated once at creation and are **not** regenerated on edit, so published URLs stay stable even if the title changes later.
- `bcryptjs` (pure JS) is used instead of native `bcrypt` to avoid native build-toolchain requirements — same hashing algorithm, same security properties.
