---
name: nextjs-api-client
description: Guides adding new API data fetching to the Next.js public portfolio. Use when adding a new API endpoint call, updating the typed client, or configuring ISR cache strategy for portfolio data.
---

# Next.js API Client — Portfolio Web

## Architecture overview

```
src/app/page.tsx          ← Server Component — fetches all data in parallel
  └── src/lib/api/        ← Typed fetch functions (one file per resource)
        ├── client.ts     ← Base fetch wrapper with error handling
        ├── profile.ts    ← getProfile()
        ├── projects.ts   ← getProjects(), getProjectBySlug()
        ├── skills.ts     ← getSkillCategories()
        └── tags.ts       ← getTags()
```

## How to add a new API function

### Step 1 — Add TypeScript types if missing

In `src/lib/types/<resource>.ts`:
```typescript
export interface NewResource {
  id: string;
  name: string;
  // ... match the backend response shape exactly
}
```

### Step 2 — Add the typed fetch function

```typescript
// src/lib/api/new-resource.ts
import { apiFetch } from './client';
import type { NewResource } from '../types/new-resource';

// For list endpoints
export async function getNewResources(): Promise<NewResource[]> {
  const result = await apiFetch<{ data: NewResource[] }>('/new-resources?limit=100');
  return result?.data ?? [];     // always return empty array, never throw
}

// For single-item endpoints
export async function getNewResourceBySlug(slug: string): Promise<NewResource | null> {
  return apiFetch<NewResource>(`/new-resources/slug/${slug}`);
  // returns null on 404 or network error
}
```

### Step 3 — Use in page.tsx (Server Component)

Add to the `Promise.all` call in `src/app/page.tsx`:
```typescript
const [profile, projects, skillCategories, tags, newResources] = await Promise.all([
  getProfile(),
  getProjects(),
  getSkillCategories(),
  getTags(),
  getNewResources(),   // add here
]);
```

Pass as props to the appropriate section component.

## Cache strategy by endpoint type

| Endpoint | `revalidate` | Reason |
|----------|-------------|--------|
| `/profile/current` | 300s (5 min) | Changes rarely |
| `/projects?status=PUBLISHED` | 300s | Admin publishes infrequently |
| `/skills/categories/all` | 600s (10 min) | Very stable |
| `/tags` | 600s | Very stable |
| `/projects/slug/:slug` | 300s | Per-project detail |

Set in the `apiFetch` call:
```typescript
fetch(url, { next: { revalidate: 300 } })
```

## Null safety

API functions always return `null` or `[]` on error so SSG never fails at build time:

```typescript
// In the page component
if (!profile) {
  return <ComingSoon />;     // graceful fallback, not a crash
}
```

## Contact form proxy route

The contact form posts to `/api/contact` (Next.js route handler) which proxies to the backend.
This keeps the backend URL server-side only — never expose it to the browser.

```typescript
// src/app/api/contact/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return Response.json(await res.json(), { status: res.status });
}
```

## Adding a project detail page

Project detail pages use `generateStaticParams` for static generation:
```typescript
// src/app/projects/[slug]/page.tsx
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.data.map((p) => ({ slug: p.slug }));
}
```
