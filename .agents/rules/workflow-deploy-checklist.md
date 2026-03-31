# Workflow: Production Deploy Checklist

Run through this workflow before deploying any of the three apps to production.

## Steps

### Step 1 — Backend environment check
Verify `.env` has all required variables set (no placeholder values):
- [ ] `DATABASE_URL` — production Supabase connection string
- [ ] `JWT_SECRET` — minimum 64-character random string (not the dev default)
- [ ] `SUPABASE_URL` + `SUPABASE_KEY` + `SUPABASE_STORAGE_BUCKET`
- [ ] `BREVO_API_KEY` + `BREVO_SENDER_EMAIL` + `BREVO_ADMIN_EMAIL`
- [ ] `CORS_ORIGIN` — set to production frontend URLs only (no localhost)
- [ ] `NODE_ENV=production`

### Step 2 — Database migration
Run migrations against the production database (never use `db push` in production):
```bash
npx prisma migrate deploy
```

### Step 3 — Backend build
```bash
bun run build
```
Zero TypeScript errors required.

### Step 4 — Verify production guards
With `NODE_ENV=production`:
- `POST /auth/register` must return `403 Forbidden` — test this
- CORS must reject requests from localhost origins

### Step 5 — Supabase Storage check
- Bucket `portfolio-media` exists and is set to **Public**
- Storage policies allow public reads on the bucket
- Test a file upload via the admin dashboard

### Step 6 — Next.js portfolio build
```bash
cd portfolio-web
npm run build
```
- Zero build errors
- Check that `NEXT_PUBLIC_API_URL` points to the production backend URL
- Verify `next/image` remotePatterns matches production Supabase project URL

### Step 7 — Angular admin build
```bash
cd portfolio-admin
ng build
```
- Verify `environment.ts` has the production `apiUrl`
- Zero build errors

### Step 8 — Smoke test
After deployment:
1. Visit the public portfolio — verify Hero, About, Projects, Skills, Contact all load from API
2. Log in to admin — verify profile edit, project create, and media upload work
3. Submit the contact form — verify email notification arrives
4. Check http://<production-api>/api/docs — verify Swagger UI loads
