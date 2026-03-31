# Portfolio — Sandrino

A fully dynamic portfolio where **all text, images, and data come from the database**. Zero hardcoded content on the frontends.

```
┌─────────────────────────────────────────────────────────────┐
│                    Portfolio Monorepo                        │
│                                                             │
│  ┌──────────────┐    REST API    ┌──────────────────────┐  │
│  │  portfolio-  │ ←────────────→ │      backend/        │  │
│  │  web/        │                │  NestJS 11 + Bun     │  │
│  │  Next.js 15  │                │  Prisma + PostgreSQL │  │
│  │  :4000       │                │  Supabase Storage    │  │
│  └──────────────┘                │  :3000               │  │
│                                  └──────────────────────┘  │
│  ┌──────────────┐    REST API           │                   │
│  │  portfolio-  │ ←─────────────────────┘                  │
│  │  admin/      │                                           │
│  │  Angular 20  │                                           │
│  │  :4200       │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

## Stack

| Layer | Technology |
|-------|-----------|
| Backend API | NestJS 11, Bun, Prisma 7, PostgreSQL |
| Database | Supabase (PostgreSQL + Storage) |
| Public Portfolio | Next.js 15, TailwindCSS, Framer Motion |
| Admin Dashboard | Angular 20, Angular Material |
| Email | Brevo (transactional) |
| Auth | JWT (Passport.js, bcrypt) |

## Quick Start

### 1. Backend
```bash
cd backend
cp .env.example .env        # Fill in DATABASE_URL, JWT_SECRET, SUPABASE_*, BREVO_*, CORS_ORIGIN
bun install
bun run prisma:generate
bun run prisma:migrate:dev init
bun run prisma:seed         # Creates sample data
bun run start:dev           # http://localhost:3000
```

### 2. Public Portfolio
```bash
cd portfolio-web
cp .env.example .env.local  # Set NEXT_PUBLIC_API_URL=http://localhost:3000
npm install
npm run dev                 # http://localhost:4000
```

### 3. Admin Dashboard
```bash
cd portfolio-admin
npm install
ng serve                    # http://localhost:4200
# Login: use the admin account created by seed or POST /auth/register
```

## API Documentation

Swagger UI at http://localhost:3000/api/docs
OpenAPI JSON at http://localhost:3000/api/docs-json

## Supabase Setup

Create a **public** bucket named `portfolio-media` in your Supabase project before uploading any files:
Supabase Dashboard → Storage → New Bucket → Name: `portfolio-media` → Public: ON

## Production Checklist

- [ ] Set `NODE_ENV=production` (disables `/auth/register`)
- [ ] Set `CORS_ORIGIN` to your production frontend URLs (comma-separated)
- [ ] Run `npx prisma migrate deploy` (not `db push`) for production migrations
- [ ] Use `bun run start:prod` after `bun run build`
- [ ] Configure Supabase RLS policies for the storage bucket

## Documentation

- [`CLAUDE.md`](./CLAUDE.md) — Claude Code guidance for this repo
- [`backend/ARCHITECTURE.md`](./backend/ARCHITECTURE.md) — Backend architecture
- [`backend/SETUP.md`](./backend/SETUP.md) — Detailed setup guide
- [`backend/API_TESTING.md`](./backend/API_TESTING.md) — cURL examples
