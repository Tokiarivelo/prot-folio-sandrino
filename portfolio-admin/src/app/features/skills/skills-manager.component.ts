import { Component, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { SkillsService, SkillCategory, Skill } from '../../core/services/skills.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { SkillCategoryDialogComponent } from './skill-category-dialog.component';
import { SkillEditDialogComponent, SkillEditDialogResult } from './skill-edit-dialog.component';

@Component({
  selector: 'app-skills-manager',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatCardModule,
    MatDividerModule,
  ],
  templateUrl: './skills-manager.component.html',
})
export class SkillsManagerComponent implements OnInit {
  @ViewChild('addSkillFileInput') addSkillFileInput!: ElementRef<HTMLInputElement>;

  categories = signal<SkillCategory[]>([]);
  selectedCategory = signal<SkillCategory | null>(null);
  isLoading = signal(false);
  addSkillIconFile = signal<File | null>(null);

  addSkillForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private skillsService: SkillsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.addSkillForm = this.fb.group({
      name: ['', Validators.required],
      level: ['INTERMEDIATE'],
      yearsExperience: [null],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.isLoading.set(true);
    this.skillsService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        const selected = this.selectedCategory();
        if (selected) {
          const updated = categories.find((c) => c.id === selected.id);
          this.selectedCategory.set(updated ?? null);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load skills.', 'Close', { duration: 3000 });
      },
    });
  }

  selectCategory(category: SkillCategory): void {
    this.selectedCategory.set(category);
    this.addSkillForm.reset({ level: 'INTERMEDIATE' });
    this.addSkillIconFile.set(null);
  }

  onAddSkillFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.addSkillIconFile.set(file);
  }

  openAddCategoryDialog(): void {
    const dialogRef = this.dialog.open(SkillCategoryDialogComponent, {
      width: '400px',
      data: { category: null },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.formData) {
        this.skillsService.createCategory(result.formData).subscribe({
          next: () => {
            this.loadCategories();
            this.snackBar.open('Category added!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to add category.', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  openEditCategoryDialog(category: SkillCategory): void {
    const dialogRef = this.dialog.open(SkillCategoryDialogComponent, {
      width: '400px',
      data: { category },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.formData && category.id) {
        this.skillsService.updateCategory(category.id, result.formData).subscribe({
          next: () => {
            this.loadCategories();
            this.snackBar.open('Category updated!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to update category.', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  deleteCategory(category: SkillCategory): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Category',
        message: `Delete category "${category.name}" and all its skills?`,
        confirmLabel: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && category.id) {
        this.skillsService.deleteCategory(category.id).subscribe({
          next: () => {
            if (this.selectedCategory()?.id === category.id) {
              this.selectedCategory.set(null);
            }
            this.loadCategories();
            this.snackBar.open('Category deleted.', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to delete category.', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  addSkill(): void {
    if (this.addSkillForm.invalid) {
      this.addSkillForm.markAllAsTouched();
      return;
    }
    const category = this.selectedCategory();
    if (!category?.id) return;

    const formValue = this.addSkillForm.value;
    const fd = new FormData();
    fd.append('name', formValue.name);
    fd.append('level', formValue.level);
    if (formValue.yearsExperience != null) {
      fd.append('yearsExperience', String(formValue.yearsExperience));
    }
    fd.append('categoryId', category.id);
    const iconFile = this.addSkillIconFile();
    if (iconFile) fd.append('icon', iconFile);

    this.skillsService.createSkill(fd).subscribe({
      next: () => {
        this.addSkillForm.reset({ level: 'INTERMEDIATE' });
        this.addSkillIconFile.set(null);
        if (this.addSkillFileInput?.nativeElement) {
          this.addSkillFileInput.nativeElement.value = '';
        }
        this.loadCategories();
        this.snackBar.open('Skill added!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to add skill.', 'Close', { duration: 3000 });
      },
    });
  }

  openEditSkillDialog(skill: Skill): void {
    const dialogRef = this.dialog.open(SkillEditDialogComponent, {
      width: '400px',
      data: { skill },
    });

    dialogRef.afterClosed().subscribe((result: SkillEditDialogResult | null) => {
      if (result?.formData && skill.id) {
        this.skillsService.updateSkill(skill.id, result.formData).subscribe({
          next: () => {
            this.loadCategories();
            this.snackBar.open('Skill updated!', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to update skill.', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  deleteSkill(skill: Skill): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Skill',
        message: `Delete skill "${skill.name}"?`,
        confirmLabel: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && skill.id) {
        this.skillsService.deleteSkill(skill.id).subscribe({
          next: () => {
            this.loadCategories();
            this.snackBar.open('Skill deleted.', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to delete skill.', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  getLevelColor(level?: string): string {
    const colorMap: Record<string, string> = {
      BEGINNER: 'warn',
      INTERMEDIATE: 'accent',
      ADVANCED: 'primary',
      EXPERT: '',
    };
    return colorMap[level ?? ''] ?? '';
  }
}
