import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    username?: string;
    fullName?: string;
  };
}

export interface RegisterResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    username?: string;
    fullName?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'portfolio_token';
  private readonly USER_KEY = 'portfolio_user';

  isAuthenticated = signal(!!localStorage.getItem(this.TOKEN_KEY));
  currentUser = signal<LoginResponse['user'] | null>(
    this.parseStoredUser()
  );

  constructor(private http: HttpClient, private router: Router) {}

  private parseStoredUser(): LoginResponse['user'] | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/login`,
      { email, password }
    );
  }

  register(email: string, password: string, fullName: string) {
    return this.http.post<RegisterResponse>(
      `${environment.apiUrl}/auth/register`,
      { email, password, fullName }
    );
  }

  setToken(token: string, user: LoginResponse['user']): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.isAuthenticated.set(true);
    this.currentUser.set(user);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  updateProfile(data: any) {
    return this.http.patch<LoginResponse['user']>(
      `${environment.apiUrl}/auth/me`,
      data
    );
  }

  updateLocalUser(user: LoginResponse['user']): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
