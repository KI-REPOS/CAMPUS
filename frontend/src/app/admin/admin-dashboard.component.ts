import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/services/api.service';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  template: `
    <div>
      <h2>Admin Dashboard</h2>

      <h3>Analytics</h3>
      <pre>{{ analytics | json }}</pre>

      <h3>Users</h3>
      <table border="1">
        <tr>
          <th>Email</th>
          <th>Name</th>
          <th>Role</th>
          <th>Suspended</th>
          <th>Actions</th>
        </tr>
        <tr *ngFor="let u of users">
          <td>{{ u.email }}</td>
          <td>{{ u.first_name }} {{ u.last_name }}</td>
          <td>{{ u.role }}</td>
          <td>{{ u.is_suspended }}</td>
          <td>
            <button (click)="suspend(u.id)" [disabled]="u.is_suspended">Suspend</button>
            <button (click)="unsuspend(u.id)" [disabled]="!u.is_suspended">Unsuspend</button>
          </td>
        </tr>
      </table>

      <h3>Moderation Logs</h3>
      <div *ngFor="let log of logs">
        <p>
          <strong>{{ log.userName }}</strong> ({{ log.contentType }}):
          {{ log.reason }} – action: {{ log.action }}
        </p>
        <p>{{ log.flaggedContent }}</p>
        <hr />
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  analytics: any;
  users: any[] = [];
  logs: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get('/analytics').subscribe(data => (this.analytics = data));
    this.api.get<any[]>('/admin/users').subscribe(data => (this.users = data));
    this.api.get<any[]>('/admin/moderation-logs').subscribe(data => (this.logs = data));
  }

  suspend(id: string) {
    const reason = prompt('Reason for suspension?') || 'Admin action';
    this.api.post('/admin/users/' + id + '/suspend', { reason }).subscribe(() => this.ngOnInit());
  }

  unsuspend(id: string) {
    this.api.post('/admin/users/' + id + '/unsuspend', {}).subscribe(() => this.ngOnInit());
  }
}
