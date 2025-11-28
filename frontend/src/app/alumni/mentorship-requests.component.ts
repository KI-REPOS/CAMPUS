import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/services/api.service';

@Component({
  standalone: true,
  selector: 'app-mentorship-requests',
  imports: [CommonModule],
  template: `
    <div>
      <h2>My Mentorship Requests (Alumni)</h2>
      <div *ngFor="let r of requests">
        <p>{{ r.student_first_name }} {{ r.student_last_name }}: {{ r.message }}</p>
        <p>Status: {{ r.status }}</p>
        <button (click)="respond(r.id, 'accepted')">Accept</button>
        <button (click)="respond(r.id, 'rejected')">Reject</button>
      </div>
      <p *ngIf="msg">{{ msg }}</p>
    </div>
  `
})
export class MentorshipRequestsComponent implements OnInit {
  requests: any[] = [];
  msg = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any[]>('/alumni/me/requests').subscribe(data => (this.requests = data));
  }

  respond(id: string, status: 'accepted' | 'rejected') {
    this.api
      .post('/alumni/requests/' + id + '/respond', { status })
      .subscribe({
        next: () => {
          this.msg = 'Updated';
          this.ngOnInit();
        },
        error: err => (this.msg = err.error?.error || 'Failed to update')
      });
  }
}
