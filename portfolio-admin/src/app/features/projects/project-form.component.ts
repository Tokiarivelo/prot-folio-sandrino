import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  ProjectsService,
  Project,
  ProjectLink,
} from '../../core/services/projects.service';
import { ProjectMediaComponent } from './project-media.component';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    MatDividerModule,
    ProjectMediaComponent,
  ],
  templateUrl: './project-form.component.html',
})
export class ProjectFormComponent implements OnInit {
  projectForm: FormGroup;
  existingProject = signal<Project | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  projectId = signal<string | null>(null);
  tags = signal<string[]>([]);
  separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectsService: ProjectsService,
    private snackBar: MatSnackBar,
  ) {
    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      slug: [''],
      shortDescription: [''],
      fullDescription: [''],
      status: ['DRAFT', Validators.required],
      displayOrder: [0],
      linksForm: this.fb.group({
        label: [''],
        url: [''],
        type: ['github'],
      }),
    });
  }

  get links(): ProjectLink[] {
    return this.existingProject()?.links ?? [];
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.projectId.set(id);
      this.loadProject(id);
    }

    this.projectForm.get('title')?.valueChanges.subscribe((title: string) => {
      if (title && !this.existingProject()) {
        const slug = this.generateSlug(title);
        this.projectForm.patchValue({ slug }, { emitEvent: false });
      }
    });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private loadProject(id: string): void {
    this.isLoading.set(true);
    this.projectsService.getProject(id).subscribe({
      next: (project) => {
        this.existingProject.set(project);
        // Map projectTags from API response to flat tag-name array for the chip input
        this.tags.set(project.projectTags?.map((pt) => pt.tag.name) ?? []);
        this.projectForm.patchValue({
          title: project.title,
          slug: project.slug,
          shortDescription: project.shortDescription,
          fullDescription: project.fullDescription,
          status: project.status,
          displayOrder: project.displayOrder,
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load project.', 'Close', {
          duration: 3000,
        });
        this.router.navigate(['/dashboard/projects']);
      },
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const { linksForm, ...formValue } = this.projectForm.value;
    const payload: Partial<Project> & { tags: string[] } = {
      ...formValue,
      tags: this.tags(),
    };

    this.isSaving.set(true);
    const id = this.projectId();

    const request$ = id
      ? this.projectsService.updateProject(id, payload)
      : this.projectsService.createProject(payload as Omit<Project, 'id'>);

    request$.subscribe({
      next: (saved) => {
        this.existingProject.set(saved);
        if (!id && saved.id) {
          this.projectId.set(saved.id);
          this.router.navigate(['/dashboard/projects', saved.id], {
            replaceUrl: true,
          });
        }
        this.isSaving.set(false);
        this.snackBar.open('Project saved!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.isSaving.set(false);
        const message = err?.error?.message ?? 'Failed to save project.';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      },
    });
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value ?? '').trim();
    if (value && !this.tags().includes(value)) {
      this.tags.update((t) => [...t, value]);
    }
    event.chipInput?.clear();
  }

  removeTag(tag: string): void {
    this.tags.update((t) => t.filter((item) => item !== tag));
  }

  addLink(): void {
    const linksForm = this.projectForm.get('linksForm') as FormGroup;
    const { label, url } = linksForm.value;

    if (!label || !url) {
      this.snackBar.open(
        'Both Label and URL are required to add a link.',
        'Close',
        {
          duration: 3000,
        },
      );
      linksForm.markAllAsTouched();
      return;
    }

    const id = this.projectId();
    if (!id) {
      this.snackBar.open(
        'Please save the project first before adding links.',
        'Close',
        {
          duration: 4000,
        },
      );
      return;
    }

    const linkData = linksForm.value;
    this.projectsService.addLink(id, linkData).subscribe({
      next: (link) => {
        this.existingProject.update((p) => {
          if (!p) return p;
          return { ...p, links: [...(p.links ?? []), link] };
        });
        linksForm.reset({ type: 'github' });
        this.snackBar.open('Link added!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to add link.', 'Close', { duration: 3000 });
      },
    });
  }

  removeLink(link: ProjectLink): void {
    const id = this.projectId();
    if (!id || !link.id) return;

    this.projectsService.removeLink(id, link.id).subscribe({
      next: () => {
        this.existingProject.update((p) => {
          if (!p) return p;
          return {
            ...p,
            links: (p.links ?? []).filter((l) => l.id !== link.id),
          };
        });
        this.snackBar.open('Link removed.', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to remove link.', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/projects']);
  }
}
