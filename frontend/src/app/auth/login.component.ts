import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2>Login</h2>
      <form (ngSubmit)="submit()">
        <label>Email</label>
        <input [(ngModel)]="email" name="email" type="email" required />
        <label>Password</label>
        <input [(ngModel)]="password" name="password" type="password" required />
        <button type="submit">Login</button>
        <p *ngIf="error" style="color:red">{{ error }}</p>
      </form>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => (this.error = err.error?.error || 'Login failed')
    });
  }
}
