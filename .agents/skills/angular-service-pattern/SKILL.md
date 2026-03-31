---
name: angular-service-pattern
description: Provides patterns for adding new features to the Angular admin dashboard. Use when creating a new Angular service, component, or admin route in the portfolio-admin app.
---

# Angular Service Pattern — Portfolio Admin

## Core service architecture

All HTTP calls go through `ApiService` which injects the JWT automatically:

```typescript
// core/services/api.service.ts — base for all feature services
@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(path: string) {
    return this.http.get<T>(`${environment.apiUrl}${path}`);
  }

  post<T>(path: string, body: unknown) {
    return this.http.post<T>(`${environment.apiUrl}${path}`, body);
  }

  patch<T>(path: string, body: unknown) {
    return this.http.patch<T>(`${environment.apiUrl}${path}`, body);
  }

  delete<T>(path: string) {
    return this.http.delete<T>(`${environment.apiUrl}${path}`);
  }

  postFormData<T>(path: string, formData: FormData) {
    return this.http.post<T>(`${environment.apiUrl}${path}`, formData);
    // Do NOT set Content-Type — browser sets multipart boundary automatically
  }
}
```

## Adding a new feature service

```typescript
// core/services/my-feature.service.ts
@Injectable({ providedIn: 'root' })
export class MyFeatureService {
  constructor(private api: ApiService) {}

  getAll() {
    return this.api.get<MyFeature[]>('/my-features');
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

## Adding a new standalone component

```typescript
@Component({
  standalone: true,
  selector: 'app-my-feature',
  imports: [
    // Only import what this component uses
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: './my-feature.component.html',
})
export class MyFeatureComponent {
  private featureService = inject(MyFeatureService);

  // Signals for local state
  items = signal<MyFeature[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.featureService.getAll().subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); },
    });
  }
}
```

## Reactive form pattern

```typescript
form = inject(FormBuilder).group({
  name: ['', [Validators.required, Validators.minLength(2)]],
  description: [''],
  status: ['DRAFT' as ProjectStatus, Validators.required],
});

submit() {
  if (this.form.invalid) return;
  const dto = this.form.getRawValue();
  this.featureService.create(dto).subscribe({
    next: () => this.snackBar.open('Created!', 'Close', { duration: 3000 }),
    error: () => this.snackBar.open('Failed', 'Close', { duration: 3000 }),
  });
}
```

## Adding a new admin route

In `app.routes.ts`:
```typescript
{
  path: 'dashboard/my-feature',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/my-feature/my-feature.component')
      .then(m => m.MyFeatureComponent),
}
```

Then add a nav item in `features/layout/shell/shell.component.html`:
```html
<a mat-list-item routerLink="/dashboard/my-feature" routerLinkActive="active-link">
  <mat-icon matListItemIcon>category</mat-icon>
  <span matListItemTitle>My Feature</span>
</a>
```

## File upload in a component

```typescript
onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  this.profileService.uploadImage(this.profileId, formData).subscribe({
    next: (res) => this.imageUrl.set(res.profileImageUrl),
    error: () => this.snackBar.open('Upload failed', 'Close'),
  });
}
```
