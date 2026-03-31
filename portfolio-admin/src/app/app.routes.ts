import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/layout/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile-edit.component').then(
            (m) => m.ProfileEditComponent
          ),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/projects/project-list.component').then(
            (m) => m.ProjectListComponent
          ),
      },
      {
        path: 'projects/new',
        loadComponent: () =>
          import('./features/projects/project-form.component').then(
            (m) => m.ProjectFormComponent
          ),
      },
      {
        path: 'projects/:id',
        loadComponent: () =>
          import('./features/projects/project-form.component').then(
            (m) => m.ProjectFormComponent
          ),
      },
      {
        path: 'skills',
        loadComponent: () =>
          import('./features/skills/skills-manager.component').then(
            (m) => m.SkillsManagerComponent
          ),
      },
      {
        path: 'tools',
        loadComponent: () =>
          import('./features/tools/tools-manager.component').then(
            (m) => m.ToolsManagerComponent
          ),
      },
      {
        path: 'contacts',
        loadComponent: () =>
          import('./features/contacts/contact-list.component').then(
            (m) => m.ContactListComponent
          ),
      },
      {
        path: 'account',
        loadComponent: () =>
          import('./features/account/account-settings.component').then(
            (m) => m.AccountSettingsComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
