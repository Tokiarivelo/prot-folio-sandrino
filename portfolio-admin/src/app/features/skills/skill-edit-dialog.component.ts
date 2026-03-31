import { Component, Inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Skill } from '../../core/services/skills.service';

export interface SkillEditDialogData {
  skill: Skill;
}

/** Dialog closes with { formData: FormData } so the caller submits to the API */
export interface SkillEditDialogResult {
  formData: FormData;
}

@Component({
  selector: 'app-skill-edit-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Edit Skill</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">

        <!-- Icon upload -->
        <div class="icon-row">
          <div class="icon-preview">
            @if (iconPreview()) {
              <img [src]="iconPreview()!" alt="icon" />
            } @else {
              <mat-icon>image</mat-icon>
            }
          </div>
          <div class="icon-upload-meta">
            <button type="button" mat-stroked-button (click)="fileInput.click()">
              <mat-icon>upload</mat-icon>
              {{ selectedFile() ? selectedFile()!.name : 'Replace icon' }}
            </button>
            <span class="hint">PNG, SVG, WebP — square recommended</span>
          </div>
          <input #fileInput type="file" accept="image/*" (change)="onFile($event)" hidden />
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Skill Name</mat-label>
          <input matInput formControlName="name" />
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Level</mat-label>
          <mat-select formControlName="level">
            <mat-option value="BEGINNER">Beginner</mat-option>
            <mat-option value="INTERMEDIATE">Intermediate</mat-option>
            <mat-option value="ADVANCED">Advanced</mat-option>
            <mat-option value="EXPERT">Expert</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Years of Experience</mat-label>
          <input matInput type="number" formControlName="yearsExperience" min="0" />
        </mat-form-field>

      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancel</button>
      <button mat-flat-button color="primary" (click)="submit()">Update</button>
    </mat-dialog-actions>

    <style>
      .dialog-form {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-top: 8px;
        min-width: 340px;
      }
      .full-width { width: 100%; }

      .icon-row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 10px;
        border: 1px dashed #e0e0e0;
        border-radius: 8px;
      }
      .icon-preview {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        overflow: hidden;
      }
      .icon-preview img { width: 100%; height: 100%; object-fit: contain; }
      .icon-preview mat-icon { color: #bdbdbd; }
      .icon-upload-meta { display: flex; flex-direction: column; gap: 4px; }
      .hint { font-size: 11px; color: #9e9e9e; }
    </style>
  `,
})
export class SkillEditDialogComponent implements OnInit {
  form: FormGroup;
  iconPreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SkillEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SkillEditDialogData
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      level: ['INTERMEDIATE'],
      yearsExperience: [null],
    });
  }

  ngOnInit(): void {
    this.form.patchValue({
      name: this.data.skill.name,
      level: this.data.skill.level,
      yearsExperience: this.data.skill.yearsExperience,
    });
    if (this.data.skill.iconUrl) {
      this.iconPreview.set(this.data.skill.iconUrl);
    }
  }

  onFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = (e) => this.iconPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const fd = new FormData();
    fd.append('name', this.form.value.name);
    fd.append('level', this.form.value.level);
    if (this.form.value.yearsExperience != null) {
      fd.append('yearsExperience', String(this.form.value.yearsExperience));
    }
    const file = this.selectedFile();
    if (file) fd.append('icon', file);

    this.dialogRef.close({ formData: fd } as SkillEditDialogResult);
  }
}
