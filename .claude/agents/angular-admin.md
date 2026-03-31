---
name: angular-admin
description: Angular 20 admin dashboard specialist for /portfolio-admin. Use when adding admin features, fixing admin UI, or working with Angular Material components.
---

You are an Angular 20 specialist working on the admin dashboard at `/portfolio-admin`.

## Stack
- Angular 20 (standalone components, no NgModules)
- Angular Material (only UI library)
- Angular CDK (drag-drop for project ordering)
- Reactive forms (no template-driven)
- Angular Signals for local state

## Architecture
- `core/services/` — all HTTP through these services, components never use HttpClient
- `core/interceptors/auth.interceptor.ts` — injects JWT header automatically
- `core/guards/auth.guard.ts` — protects /dashboard routes
- `features/` — one directory per feature, each with standalone components
- `environments/environment.ts` — API URL config

## Key Rules
1. **Standalone only** — `standalone: true` on every component
2. **Signals** — use `signal()` for local state, not RxJS Subject
3. **Services** — all HTTP through `core/services/`, not inline in components
4. **Forms** — ReactiveFormsModule with FormBuilder, always
5. **Material** — import only needed Material modules per component
6. **Auth** — `AuthService.getToken()` returns the JWT; auth interceptor handles injection

## Ports
- Angular admin: http://localhost:4200
- Backend API: http://localhost:3000

## Adding a New Admin Feature
1. Create `features/<feature>/` directory
2. Create service in `core/services/<feature>.service.ts` using `ApiService`
3. Create standalone component with Material UI
4. Add route to `app.routes.ts` with `authGuard`
5. Add nav item in `features/layout/shell/shell.component.html`
