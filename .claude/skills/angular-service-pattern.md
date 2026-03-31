# Angular Service Pattern — Portfolio Admin

Use when adding a new feature, service, component, or admin route to `portfolio-admin`.

## Core HTTP architecture

All HTTP calls flow through `ApiService` → feature services → components. Components never inject `HttpClient` directly.

```
HttpClient (injected by Angular)
  └── ApiService (core/services/api.service.ts)
        ├── ProfileService
        ├── ProjectsService
        ├── MediaService
        ├── SkillsService
        └── ContactService
```

The `AuthInterceptor` automatically injects `Authorization: Bearer <token>` on every request — no need to set it manually in services.

## Adding a new feature service

```typescript
// core/services/my-feature.service.ts
@Injectable({ providedIn: 'root' })
export class MyFeatureService {
  constructor(private api: ApiService) {}

  getAll() {
    return this.api.get<MyFeature[]>('/my-features');
  }

  getOne(id: string) {
    return this.api.get<MyFeature>(`/my-features/${id}`);
  }

  create(dto: CreateMyFeatureDto) {
    return this.api.post<MyFeature>('/my-features', dto);
  }

  update(id: string, dto: Partial<CreateMyFeatureDto>) {
    return this.api.patch<MyFeature>(`/my-features/${id}`, dto);
  }

  remove(id: string) {
    return this.api.delete<void>(`/my-features/${id}`);
  }
}
```

## Adding a standalone component

```typescript
@Component({
  standalone: true,
  selector: 'app-my-feature',
  imports: [
    MatCardModule, MatButtonModule, MatTableModule,
    MatSnackBarModule, ReactiveFormsModule, AsyncPipe,
  ],
  templateUrl: './my-feature.component.html',
})
export class MyFeatureComponent implements OnInit {
  private service = inject(MyFeatureService);
  private snackBar = inject(MatSnackBar);

  // Signals for local state — never use BehaviorSubject
  items = signal<MyFeature[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load'); this.loading.set(false); },
    });
  }
}
```

## Reactive form pattern

```typescript
// FormBuilder via inject (not constructor)
private fb = inject(FormBuilder);

form = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(2)]],
  description: [''],
  status: ['DRAFT', Validators.required],
});

submit() {
  if (this.form.invalid) return;
  this.service.create(this.form.getRawValue()).subscribe({
    next: () => {
      this.snackBar.open('Saved!', 'Close', { duration: 3000 });
      this.form.reset();
    },
    error: () => this.snackBar.open('Save failed', 'Close', { duration: 3000 }),
  });
}
```

## File upload pattern

```typescript
onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);   // key must match backend FileInterceptor field name

  this.profileService.uploadImage(this.profileId, formData).subscribe({
    next: (res) => this.imageUrl.set(res.profileImageUrl),
    error: () => this.snackBar.open('Upload failed', 'Close'),
  });
}
```

Never set `Content-Type: multipart/form-data` manually — the browser sets it with the correct boundary.

## Adding a new admin route

```typescript
// app.routes.ts — add inside the dashboard children array
{
  path: 'my-feature',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/my-feature/my-feature.component')
      .then(m => m.MyFeatureComponent),
}
```

Add a nav link in `features/layout/shell/shell.component.html`:
```html
<a mat-list-item routerLink="/dashboard/my-feature" routerLinkActive="active-link">
  <mat-icon matListItemIcon>category</mat-icon>
  <span matListItemTitle>My Feature</span>
</a>
```

## Environment

Always use `environment.apiUrl` — never hardcode `http://localhost:3000`:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```
