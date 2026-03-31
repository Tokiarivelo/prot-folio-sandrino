# Frontend Rules — Angular Admin Dashboard (/portfolio-admin)

> Extends global common rules for the Angular admin.

## Standalone Components Only
Every component must have `standalone: true`. No NgModules except root bootstrapping.

## State Management: Signals
Use Angular Signals for local component state:
```typescript
// Correct
loading = signal(false);
profile = signal<Profile | null>(null);

// Wrong
loading$ = new BehaviorSubject(false);
```

## HTTP: Always Through Core Services
Components must never inject `HttpClient` directly.
All HTTP calls go through `core/services/`:
- `ProfileService`, `ProjectsService`, `MediaService`, `SkillsService`, `ContactService`
- These extend `ApiService` (base service with JWT header injection)

## Forms: Reactive Only
Use `ReactiveFormsModule` with `FormBuilder`. No template-driven forms.
```typescript
// Correct
form = this.fb.group({ name: ['', Validators.required] });

// Wrong
@ViewChild('form') form: NgForm;
```

## Angular Material: Only Allowed UI Library
Do not add other UI libraries (Bootstrap, PrimeNG, etc.).
Import only the specific Material modules needed per component.

## Auth Guard Pattern
All `/dashboard/**` routes must use `authGuard` from `core/guards/auth.guard.ts`.
The guard reads `AuthService.isAuthenticated()` signal and redirects to `/login` if false.

## API Base URL
Always use `environment.apiUrl` from `src/environments/environment.ts`.
Never hardcode `http://localhost:3000` in service files.

## File Upload Pattern
Use `MediaService.uploadMedia()` or `ProfileService.uploadImage()` for all file uploads.
These create `FormData` and POST with multipart headers — never set `Content-Type: application/json` on upload requests.
