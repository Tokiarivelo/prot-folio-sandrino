# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A three-app dynamic portfolio monorepo. All text, images, and data are served from the database — zero hardcoded content in the frontends.

```
prot-folio-sandrino/
├── backend/          # NestJS 11 API — serves all portfolio data
├── portfolio-web/    # Next.js 15 public portfolio (http://localhost:4000)
└── portfolio-admin/  # Angular 20 admin dashboard (http://localhost:4200)
```

## Quick Start

```bash
# 1. Backend
cd backend && cp .env.example .env   # fill in secrets
bun install
bun run prisma:generate
bun run prisma:migrate:dev init
bun run prisma:seed
bun run start:dev

# 2. Public portfolio
cd portfolio-web && npm install && npm run dev   # http://localhost:4000

# 3. Admin dashboard
cd portfolio-admin && npm install && ng serve   # http://localhost:4200
```

## Backend Commands (`/backend` — BUN ONLY, never npm)

```bash
bun run start:dev          # Watch mode development
bun run build              # Production build
bun run start:prod         # Run production build

bun run test               # Jest unit tests
bun run test:cov           # Test coverage report
bun run test:e2e           # E2E tests

bun run prisma:generate    # MUST run after any schema change
bun run prisma:migrate:dev # Create + apply migration (append name: bun run prisma:migrate:dev add_field)
bun run prisma:studio      # GUI database browser
bun run prisma:seed        # Seed database with sample data

bun run lint               # ESLint with auto-fix
bun run format             # Prettier format
```

## Frontend Commands

```bash
# portfolio-web
cd portfolio-web
npm run dev    # Dev server on port 4000
npm run build  # Production build
npm start      # Run production

# portfolio-admin
cd portfolio-admin
ng serve       # Dev server on port 4200
ng build       # Production build
ng test        # Karma tests
```

## Architecture

### How Data Flows
1. Admin creates/edits content via Angular dashboard → stored in PostgreSQL (Supabase)
2. Files uploaded to Supabase Storage → stored as public CDN URLs in DB
3. Next.js portfolio fetches data from NestJS API → renders Server Components
4. All page text, images, and links come from the API response

### Backend Module Map
| Module | Public endpoints | Admin endpoints |
|--------|----------------|-----------------|
| `profile/` | GET /profile/current | POST, PATCH /:id, POST /:id/image, DELETE /:id |
| `projects/` | GET /projects?status=PUBLISHED&tag=react, GET /projects/slug/:slug | POST, PATCH /:id, DELETE /:id, POST /:id/links, DELETE /:id/links/:linkId |
| `project-media/` | GET /project-media?projectId= | POST (multipart), PATCH /:id, DELETE /:id |
| `skills/` | GET /skills, GET /skills/categories/all | POST, PATCH /:id, DELETE /:id + categories CRUD |
| `tags/` | GET /tags | — |
| `contact/` | POST /contact | GET, GET /:id, PATCH /:id/read, DELETE /:id |
| `auth/` | POST /auth/login | POST /auth/register (disabled in prod), GET /auth/me |

### Prisma Schema Key Models
- `Profile` — fullName, jobTitle, heroText, shortBio, longBio, location, availability, profileImageUrl, resumePdfUrl, socialLinks (JSON), seoMetadata (JSON), themeConfig (JSON)
- `Project` → `ProjectMedia` + `ProjectLink` + `ProjectTag` (all cascade delete)
- `Tag` — many-to-many with Project via ProjectTag
- `SkillCategory` → `Skill` (cascade delete)
- `ContactMessage`, `EmailLog`

### Schema Change Workflow (MANDATORY order)
1. Edit `backend/prisma/schema.prisma`
2. `bun run prisma:migrate:dev <migration-name>`
3. `bun run prisma:generate`
4. Update affected DTOs (add `@ApiProperty` to new fields)
5. Update seed script for meaningful defaults
6. `bun run build` to verify

### Next.js Data Fetching
- `portfolio-web/src/app/page.tsx` — Server Component, fetches profile + projects + skillCategories + tags in parallel
- `portfolio-web/src/lib/api/` — typed API functions, return null/[] on error (never throw)
- ISR: `next: { revalidate: 300 }` (5 min) on all portfolio data fetches
- Only `ProjectsSection` and `ContactSection` are Client Components

### Angular Admin Architecture
- `core/services/` — all HTTP goes through these services
- `core/interceptors/auth.interceptor.ts` — injects JWT from `portfolio_token` localStorage key
- `core/guards/auth.guard.ts` — protects `/dashboard/**` routes
- Signals for local state, reactive forms, Angular Material UI only

## Environment Variables

### Backend (`/backend/.env`)
| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | Secret for signing JWT tokens | random 64-char string |
| `JWT_EXPIRATION` | Token lifetime | `7d` |
| `SUPABASE_URL` | Supabase project URL | `https://<project>.supabase.co` |
| `SUPABASE_KEY` | Supabase anon key | `eyJ...` |
| `SUPABASE_STORAGE_BUCKET` | Storage bucket name | `portfolio-media` |
| `BREVO_API_KEY` | Brevo email API key | `xkeysib-...` |
| `BREVO_SENDER_EMAIL` | Verified sender address | `noreply@example.com` |
| `BREVO_ADMIN_EMAIL` | Admin notification recipient | `admin@example.com` |
| `CORS_ORIGIN` | Allowed frontend origins (comma-separated) | `http://localhost:4000,http://localhost:4200` |
| `NODE_ENV` | Environment | `development` or `production` |
| `PORT` | Server port | `3000` |

### portfolio-web (`/portfolio-web/.env.local`)
| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g., `http://localhost:3000`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for SEO |

### portfolio-admin
Configured in `portfolio-admin/src/environments/environment.ts` (`apiUrl`).

## Supabase Storage Setup
Create a public bucket named `portfolio-media` before first upload.
Supabase Dashboard → Storage → New Bucket → Name: `portfolio-media` → Public: ON

## API Documentation
Swagger UI: http://localhost:3000/api/docs
OpenAPI JSON: http://localhost:3000/api/docs-json

## Key Constraints
- **Bun only** for backend — never use npm in `/backend`
- **`POST /auth/register`** is disabled (`403`) when `NODE_ENV=production`
- **Rate limiting**: global 60 req/min per IP via `@nestjs/throttler`
- **File uploads**: files go to Supabase Storage — deleting a media record also deletes the file
- **JSON fields** (socialLinks, seoMetadata, themeConfig): replaced in full on update — merge on frontend before sending
- **Prisma generate** must run after every schema change before the backend will compile

## Claude Code Project Config
Project-specific rules, agents, and skills are in `.claude/`:
- `.claude/rules/backend.md` — NestJS rules (Bun, Swagger, error handling)
- `.claude/rules/frontend-nextjs.md` — Next.js rules (zero hardcoded content, Server Components)
- `.claude/rules/frontend-angular.md` — Angular rules (standalone, Signals, Material)
- `.claude/agents/backend-dev.md` — NestJS agent
- `.claude/agents/nextjs-portfolio.md` — Next.js portfolio agent
- `.claude/agents/angular-admin.md` — Angular admin agent
- `.claude/skills/add-api-endpoint.md` — Full 8-step guide for adding a new endpoint
- `.claude/skills/swagger-patterns.md` — Swagger decorator patterns and response DTOs
- `.claude/skills/prisma-patterns.md` — Prisma schema, queries, seed patterns
- `.claude/skills/schema-migration.md` — Safe migration cycle and destructive change guide
- `.claude/skills/nextjs-api-client.md` — API client, ISR strategy, contact proxy route
- `.claude/skills/angular-service-pattern.md` — Service, component, form, file upload patterns
