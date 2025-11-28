import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import { SocketService } from '../core/services/socket.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-forum-thread',
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="post">
      <h2>{{ post.title }}</h2>
      <p>{{ post.content }}</p>
      <small>{{ post.category }} • {{ post.userName }}</small>
    </div>

    <div>
      <h3>Live Chat (Thread Room)</h3>
      <div *ngFor="let m of messages">
        <strong>{{ m.userName }}:</strong> {{ m.message }}
      </div>
      <input [(ngModel)]="message" placeholder="Type message..." />
      <button (click)="send()">Send</button>
      <p *ngIf="chatMsg">{{ chatMsg }}</p>
    </div>
  `
})
export class ForumThreadComponent implements OnInit {
  post: any;
  threadId = '';
  messages: any[] = [];
  message = '';
  chatMsg = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private socket: SocketService
  ) {}

  ngOnInit() {
    this.threadId = this.route.snapshot.paramMap.get('id')!;
    this.api.get('/forum/' + this.threadId).subscribe(data => (this.post = data));

    this.socket.connect();
    this.socket.joinRoom('thread:' + this.threadId);

    this.socket.onMessage().subscribe(m => {
      if (m.room === 'thread:' + this.threadId) this.messages.push(m);
    });

    this.socket.onSuspended().subscribe(_ => {
      this.chatMsg = 'You have been suspended due to policy violation.';
    });

    this.socket.onMessageRejected().subscribe(_ => {
      this.chatMsg = 'Message rejected by moderation.';
    });
  }

  send() {
    if (!this.message.trim()) return;
    this.socket.sendMessage('thread:' + this.threadId, this.message.trim());
    this.message = '';
  }
}
