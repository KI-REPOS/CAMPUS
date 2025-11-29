import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'campus_token';

  constructor(private api: ApiService) {}

  login(email: string, password: string) {
    return this.api.post<any>('/api/auth/login', { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
      })
    );
  }

  register(data: any) {
    return this.api.post('/api/auth/register', data);
  }

  loginWithGoogle(idToken: string) {
    return this.api.post<any>('/api/auth/google', { idToken }).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
      })
    );
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }
}
