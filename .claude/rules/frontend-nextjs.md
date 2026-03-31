# Frontend Rules — Next.js Public Portfolio (/portfolio-web)

> Extends global common rules for the Next.js public portfolio.

## Zero Hardcoded Content Policy
**All visible text, images, and URLs must come from the API response.**
Allowed static content: HTML structure, CSS class names, placeholder loading states, accessibility labels (aria-label), icon SVGs.
Not allowed: hardcoded names, bios, titles, project names, social links.

## Server vs Client Components
- Default to Server Components — only add `'use client'` when component needs:
  - `useState`, `useEffect`, event handlers, browser APIs
  - Animation (Framer Motion client animations)
  - Form handling
- Currently Client: `ProjectsSection`, `ContactSection`, `Navbar` (scroll listener)
- All section components that only render props are Server Components

## API Data Fetching
- All API calls go through `src/lib/api/` typed functions — never inline `fetch` in components
- Server Components use `fetch` with `next: { revalidate: 300 }` (5-min ISR)
- `page.tsx` fetches all data in parallel with `Promise.all` — no sequential waterfalls
- API functions return `null` or `[]` on error (never throw) so SSG never fails at build time

## Images
- All images from Supabase must use `next/image` — never `<img>` for Supabase URLs
- Always provide `alt` text from the content (project title, caption, or profile name)
- Handle null image URLs: show a styled placeholder div (gray background with initials or icon)
- `next.config.ts` already has `remotePatterns` for `**.supabase.co`

## Adding a New API Function
1. Add TypeScript types to `src/lib/types/` if not already present
2. Add the typed function to the relevant `src/lib/api/` file
3. Handle errors with try/catch, return null/[] fallback
4. Use in Server Component with `await`, or in Client Component via `useEffect`/React Query

## Environment Variables
- `NEXT_PUBLIC_API_URL` — backend URL (used server-side only via `lib/api/`)
- `NEXT_PUBLIC_SITE_URL` — site canonical URL for SEO
- Never use `NEXT_PUBLIC_` prefix for secrets — they are exposed in the browser bundle
