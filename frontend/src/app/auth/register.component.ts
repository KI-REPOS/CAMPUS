import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2>Register</h2>
      <form (ngSubmit)="submit()">
        <label>First Name</label>
        <input [(ngModel)]="firstName" name="firstName" required />
        <label>Last Name</label>
        <input [(ngModel)]="lastName" name="lastName" required />
        <label>Email</label>
        <input [(ngModel)]="email" name="email" type="email" required />
        <label>Password</label>
        <input [(ngModel)]="password" name="password" type="password" required />
        <label>Role</label>
        <select [(ngModel)]="role" name="role">
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="alumni">Alumni</option>
        </select>
        <button type="submit">Register</button>
        <p *ngIf="error" style="color:red">{{ error }}</p>
      </form>
    </div>
  `
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  role = 'student';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = '';
    this.auth
      .register({ firstName: this.firstName, lastName: this.lastName, email: this.email, password: this.password, role: this.role })
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: err => (this.error = err.error?.error || 'Registration failed')
      });
  }
}
