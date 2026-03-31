import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService, LoginResponse } from '../../core/services/auth.service';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './account-settings.component.html',
  styles: [`
    .settings-container {
      max-width: 800px;
      margin: 24px auto;
      padding: 0 16px;
    }
    .form-section {
      margin-bottom: 24px;
    }
    .field-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    .field-row > * {
      flex: 1;
    }
    .card-actions {
      display: flex;
      justify-content: flex-end;
      padding: 16px 0 0;
    }
    h2 {
      margin-top: 0;
      font-weight: 500;
      color: var(--mdc-theme-text-primary-on-background);
    }
    .section-description {
      color: #777;
      margin-bottom: 24px;
      font-size: 0.9rem;
    }
  `]
})
export class AccountSettingsComponent implements OnInit {
  accountForm: FormGroup;
  passwordForm: FormGroup;
  isSavingAccount = signal(false);
  isSavingPassword = signal(false);
  
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.accountForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.accountForm.patchValue({
        fullName: user.fullName,
        email: user.email,
        username: user.username
      });
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  updateAccount() {
    if (this.accountForm.invalid) return;

    this.isSavingAccount.set(true);
    this.authService.updateProfile(this.accountForm.value).subscribe({
      next: (updatedUser: LoginResponse['user']) => {
        this.authService.updateLocalUser(updatedUser);
        this.snackBar.open('Account information updated!', 'Close', { duration: 3000 });
        this.isSavingAccount.set(false);
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Failed to update account';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
        this.isSavingAccount.set(false);
      }
    });
  }

  updatePassword() {
    if (this.passwordForm.invalid) return;

    this.isSavingPassword.set(true);
    this.authService.updateProfile({ password: this.passwordForm.value.password }).subscribe({
      next: () => {
        this.snackBar.open('Password updated successfully!', 'Close', { duration: 3000 });
        this.passwordForm.reset();
        this.isSavingPassword.set(false);
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Failed to update password';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
        this.isSavingPassword.set(false);
      }
    });
  }
}
