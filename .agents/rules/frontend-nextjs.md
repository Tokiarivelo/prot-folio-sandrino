---
trigger: always_on
---

# Frontend Rules — Next.js Public Portfolio

Apply these rules when working on any file under `/portfolio-web`.

## Zero Hardcoded Content — Strictly Enforced

**Every visible string, image URL, and link must come from the API response.**

Allowed static content:

- HTML structure and element attributes
- CSS class names (Tailwind utilities)
- Accessibility labels (`aria-label`, `alt` computed from API data)
- Icon SVG paths
- Loading/error placeholder text

Not allowed to hardcode:

- Names, bios, titles, descriptions
- Project names, tags, links
- Social media handles or URLs
- Skill names or categories

If you need to display text and don't have an API field for it, ask — don't hardcode it.

## Server vs Client Components

Default to Server Components. Only add `'use client'` when the component genuinely needs:

- `useState`, `useEffect`, or other React hooks
- Event handlers (onClick, onChange, onSubmit)
- Browser-only APIs (window, document)
- Framer Motion client-side animations

Currently Client Components: `ProjectsSection`, `ContactSection`, `Navbar`
Everything else is a Server Component that receives props from `page.tsx`.

## API Calls: Always Through `lib/api/`

Never call `fetch` directly inline in a component. All API calls go through the typed functions in `src/lib/api/`:

```typescript
// Wrong — inline fetch in component
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/current`);

// Correct — use typed function
import { getProfile } from '@/lib/api/profile';
const profile = await getProfile();
```

All `lib/api/` functions must:

- Return typed data (or `null`/`[]` on error)
- Never throw — catch internally so SSG never fails at build time
- Use `fetch` with `next: { revalidate: 300 }` for ISR

## Images: Always `next/image`

Never use `<img>` for Supabase Storage URLs. Always use `next/image`.
Handle null image URLs by rendering a styled placeholder div (never leave an empty `src`).

```typescript
// Correct
{profile.profileImageUrl ? (
  <Image src={profile.profileImageUrl} alt={profile.fullName} fill />
) : (
  <div className="bg-zinc-800 flex items-center justify-center">
    <span>{profile.fullName[0]}</span>
  </div>
)}
```

Supabase remotePatterns are already configured in `next.config.ts`.

## Data Fetching in page.tsx

All data fetches happen in `src/app/page.tsx` using `Promise.all` — no sequential waterfalls:

```typescript
const [profile, projects, skillCategories, tags] = await Promise.all([
  getProfile(),
  getProjects(),
  getSkillCategories(),
  getTags(),
]);
```

Then pass data as props to section components.

## Environment Variables

- `NEXT_PUBLIC_API_URL` — backend URL (used server-side in `lib/api/`)
- `NEXT_PUBLIC_SITE_URL` — canonical URL for SEO metadata

Never prefix secrets with `NEXT_PUBLIC_` — they are exposed in the browser bundle.

## Ports

- Portfolio web: `http://localhost:4000` (`npm run dev`)
- Backend API: `http://localhost:3000`
