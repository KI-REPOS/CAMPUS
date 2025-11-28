import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/services/api.service';

@Component({
  standalone: true,
  selector: 'app-forum-list',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2>Student Community Forum</h2>

      <form (ngSubmit)="createPost()">
        <input [(ngModel)]="title" name="title" placeholder="Title" required />
        <input [(ngModel)]="category" name="category" placeholder="Category" required />
        <textarea [(ngModel)]="content" name="content" placeholder="Content" required></textarea>
        <button type="submit">Post</button>
      </form>
      <p *ngIf="msg">{{ msg }}</p>

      <div *ngFor="let p of posts" (click)="open(p._id)">
        <h3>{{ p.title }}</h3>
        <p>{{ p.content | slice:0:120 }}...</p>
        <small>{{ p.category }} • {{ p.userName }}</small>
      </div>
    </div>
  `
})
export class ForumListComponent implements OnInit {
  posts: any[] = [];
  title = '';
  category = '';
  content = '';
  msg = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.get<any[]>('/forum').subscribe(data => (this.posts = data));
  }

  createPost() {
    this.api
      .post('/forum', {
        title: this.title,
        content: this.content,
        category: this.category
      })
      .subscribe({
        next: () => {
          this.msg = 'Posted';
          this.title = '';
          this.content = '';
          this.category = '';
          this.ngOnInit();
        },
        error: err => (this.msg = err.error?.error || 'Post rejected')
      });
  }

  open(id: string) {
    this.router.navigate(['/forum', id]);
  }
}
