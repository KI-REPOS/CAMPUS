import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/services/api.service';

@Component({
  standalone: true,
  selector: 'app-alumni-list',
  imports: [CommonModule],
  template: `
    <div>
      <h2>Alumni Community</h2>
      <div *ngFor="let a of alumni">
        <h3>{{ a.first_name }} {{ a.last_name }}</h3>
        <p>{{ a.company }} - {{ a.position }}</p>
        <small>{{ a.department }} • {{ a.graduation_year }}</small>
        <button (click)="askMentorship(a.id)">Request Mentorship</button>
      </div>

      <div *ngIf="msg">{{ msg }}</div>
    </div>
  `
})
export class AlumniListComponent implements OnInit {
  alumni: any[] = [];
  msg = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<any[]>('/alumni').subscribe(data => (this.alumni = data));
  }

  askMentorship(id: string) {
    const message = prompt('Enter your mentorship request message');
    if (!message) return;
    this.api.post('/alumni/' + id + '/mentorship', { message }).subscribe({
      next: () => (this.msg = 'Request sent'),
      error: err => (this.msg = err.error?.error || 'Failed to send request')
    });
  }
}
