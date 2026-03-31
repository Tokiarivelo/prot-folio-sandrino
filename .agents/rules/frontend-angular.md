---
trigger: always_on
---

# Frontend Rules — Angular Admin Dashboard

Apply these rules when working on any file under `/portfolio-admin`.

## Standalone Components Only

Every component must have `standalone: true`. There are no NgModules in this project except the root bootstrap.

```typescript
@Component({
  standalone: true,
  imports: [MatButtonModule, MatInputModule, ReactiveFormsModule],
  // ...
})
export class MyComponent {}
```

## State: Angular Signals

Use Angular Signals for all local component state. Do not use `Subject`, `BehaviorSubject`, or `ReplaySubject` for local state.

```typescript
// Correct
loading = signal(false);
profile = signal<Profile | null>(null);

// Wrong
loading$ = new BehaviorSubject(false);
```

## HTTP: Always Through Core Services

Components must never inject `HttpClient` directly. Every HTTP call goes through one of the core services:

| Service                             | Responsibility                  |
| ----------------------------------- | ------------------------------- |
| `core/services/auth.service.ts`     | Login, logout, token management |
| `core/services/profile.service.ts`  | Profile CRUD + image upload     |
| `core/services/projects.service.ts` | Projects CRUD + links           |
| `core/services/media.service.ts`    | Media file upload/delete        |
| `core/services/skills.service.ts`   | Skills + categories CRUD        |
| `core/services/contact.service.ts`  | Contact messages                |

## Forms: Reactive Only

Always use `ReactiveFormsModule` with `FormBuilder`. Template-driven forms (`NgModel`, `ngForm`) are not used in this project.

```typescript
form = this.fb.group({
  fullName: ['', [Validators.required, Validators.minLength(2)]],
  email: ['', [Validators.required, Validators.email]],
});
```

## UI: Angular Material Only

Do not add other UI libraries (Bootstrap, PrimeNG, Clarity, etc.).
Import only the specific Material modules each component needs — do not import a barrel module.

## Auth Guard

All `/dashboard/**` routes are protected by `authGuard` from `core/guards/auth.guard.ts`.
The guard reads `AuthService.isAuthenticated()` (a Signal) and redirects to `/login` if false.
JWT is stored in `localStorage` under the key `portfolio_token`.

## API Base URL

Always use `environment.apiUrl` from `src/environments/environment.ts`.
Never hardcode `http://localhost:3000` in service files.

## File Upload Pattern

Use `ApiService.postFormData()` for multipart uploads. Never set `Content-Type: application/json` on upload requests — the browser sets the boundary automatically.

## Ports

- Angular admin: `http://localhost:4200` (`ng serve`)
- Backend API: `http://localhost:3000`
