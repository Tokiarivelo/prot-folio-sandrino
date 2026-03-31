import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ProfileService, Profile } from '../../core/services/profile.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './profile-edit.component.html',
})
export class ProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  existingProfile = signal<Profile | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  previewImageUrl = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      jobTitle: ['', Validators.required],
      heroText: [''],
      shortBio: [''],
      longBio: [''],
      location: [''],
      availability: [false],
      resumePdfUrl: [''],
      github: [''],
      linkedin: [''],
      twitter: [''],
      email: ['', Validators.email],
      isPublic: [false],
      seoTitle: [''],
      seoDescription: [''],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.isLoading.set(true);
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        if (profile) {
          this.existingProfile.set(profile);
          this.previewImageUrl.set(profile.profileImageUrl ?? null);
          this.profileForm.patchValue({
            fullName: profile.fullName,
            jobTitle: profile.jobTitle,
            heroText: profile.heroText,
            shortBio: profile.shortBio,
            longBio: profile.longBio,
            location: profile.location,
            availability: profile.availability ?? false,
            resumePdfUrl: profile.resumePdfUrl,
            github: profile.socialLinks?.github,
            linkedin: profile.socialLinks?.linkedin,
            twitter: profile.socialLinks?.twitter,
            email: profile.socialLinks?.email,
            isPublic: profile.isPublic ?? false,
            seoTitle: profile.seoMetadata?.title,
            seoDescription: profile.seoMetadata?.description,
          });
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const formValue = this.profileForm.value;
    const payload: Profile = {
      fullName: formValue.fullName,
      jobTitle: formValue.jobTitle,
      heroText: formValue.heroText,
      shortBio: formValue.shortBio,
      longBio: formValue.longBio,
      location: formValue.location,
      availability: formValue.availability,
      isPublic: formValue.isPublic,
      resumePdfUrl: formValue.resumePdfUrl,
      socialLinks: {
        github: formValue.github,
        linkedin: formValue.linkedin,
        twitter: formValue.twitter,
        email: formValue.email,
      },
      seoMetadata: {
        title: formValue.seoTitle,
        description: formValue.seoDescription,
      },
    };

    this.isSaving.set(true);
    const profile = this.existingProfile();

    const request$ = profile?.id
      ? this.profileService.updateProfile(profile.id, payload)
      : this.profileService.createProfile(payload);

    request$.subscribe({
      next: (saved) => {
        this.existingProfile.set(saved);
        this.isSaving.set(false);
        this.snackBar.open('Profile saved successfully!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.isSaving.set(false);
        const message = err?.error?.message ?? 'Failed to save profile. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      },
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const profile = this.existingProfile();
    if (!profile?.id) {
      this.snackBar.open('Please save the profile first before uploading an image.', 'Close', {
        duration: 4000,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewImageUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    this.profileService.uploadImage(profile.id, file).subscribe({
      next: (updated) => {
        this.previewImageUrl.set(updated.profileImageUrl ?? null);
        this.snackBar.open('Profile image updated!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to upload image. Please try again.', 'Close', {
          duration: 5000,
        });
      },
    });
  }
}
