# Next.js API Client Patterns

## How the typed API client works

`src/lib/api/client.ts` exports a base `apiFetch` function that:
- Prepends `process.env.NEXT_PUBLIC_API_URL`
- Passes Next.js `next: { revalidate }` cache option
- Returns typed data or null on error (never throws)

## Adding a new API function

```typescript
// src/lib/api/items.ts
import { apiFetch } from './client';
import type { Item } from '../types/item';

export async function getItems(): Promise<Item[]> {
  const result = await apiFetch<{ data: Item[] }>('/items?limit=100');
  return result?.data ?? [];
}

export async function getItemBySlug(slug: string): Promise<Item | null> {
  return apiFetch<Item>(`/items/slug/${slug}`);
}
```

## Cache strategy by endpoint type

| Endpoint | Revalidation | Rationale |
|----------|-------------|-----------|
| GET /profile/current | 300s | Changes infrequently |
| GET /projects?status=PUBLISHED | 300s | New projects require rebuild/revalidate |
| GET /skills/categories/all | 600s | Rarely changes |
| GET /tags | 600s | Rarely changes |
| GET /projects/slug/:slug | 300s | Per-project detail |

## Error handling in Server Components

```typescript
// page.tsx
const [profile, projects] = await Promise.all([
  getProfile(),    // returns null on error
  getProjects(),   // returns { data: [], meta: {...} } on error
]);

// Graceful null handling
if (!profile) {
  return <ComingSoon />;
}
```

## Contact form proxy route

The contact form POSTs to `/api/contact` (Next.js route handler) which proxies to the backend.
This keeps the backend URL server-side only.

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
