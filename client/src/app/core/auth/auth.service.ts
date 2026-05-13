import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserDto
} from './auth.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<UserDto | null>(null);
  private readonly _accessToken = signal<string | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  private get base(): string {
    return environment.apiBaseUrl + '/auth';
  }

  async register(req: RegisterRequest): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.base}/register`, req, {
        withCredentials: true
      })
    );
    this.applyAuth(res);
  }

  async login(req: LoginRequest): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.base}/login`, req, {
        withCredentials: true
      })
    );
    this.applyAuth(res);
  }

  async tryRefresh(): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.base}/refresh`, null, {
          withCredentials: true
        })
      );
      this.applyAuth(res);
      return true;
    } catch {
      this.clear();
      return false;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.base}/forgot-password`, { email })
    );
  }

  async resetPassword(
    email: string,
    token: string,
    newPassword: string
  ): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.base}/reset-password`, { email, token, newPassword })
    );
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.base}/logout`, null, { withCredentials: true })
      );
    } catch {
      // ignorer — vi rydder lokalt uansett
    } finally {
      this.clear();
      this.router.navigate(['/login']);
    }
  }

  async loadCurrentUser(): Promise<void> {
    if (!this._accessToken()) return;
    try {
      const user = await firstValueFrom(
        this.http.get<UserDto>(`${this.base}/me`)
      );
      this._currentUser.set(user);
    } catch {
      this.clear();
    }
  }

  private applyAuth(res: AuthResponse): void {
    this._accessToken.set(res.accessToken);
    this._currentUser.set(res.user);
  }

  private clear(): void {
    this._accessToken.set(null);
    this._currentUser.set(null);
  }
}
