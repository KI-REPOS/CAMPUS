import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-lecture-upload',
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2>Upload Lecture</h2>
      <form (ngSubmit)="submit()">
        <label>Title</label>
        <input [(ngModel)]="title" name="title" required />
        <label>Description</label>
        <textarea [(ngModel)]="description" name="description"></textarea>
        <label>Department</label>
        <input [(ngModel)]="department" name="department" required />
        <label>Subject</label>
        <input [(ngModel)]="subject" name="subject" required />
        <label>Video File</label>
        <input type="file" (change)="onVideoChange($event)" />
        <label>Audio File (for STT, optional)</label>
        <input type="file" (change)="onAudioChange($event)" />
        <button type="submit">Upload</button>
        <p *ngIf="msg">{{ msg }}</p>
      </form>
    </div>
  `
})
export class LectureUploadComponent {
  title = '';
  description = '';
  department = '';
  subject = '';
  videoFile?: File;
  audioFile?: File;
  msg = '';

  constructor(private http: HttpClient) {}

  onVideoChange(e: any) {
    this.videoFile = e.target.files[0];
  }

  onAudioChange(e: any) {
    this.audioFile = e.target.files[0];
  }

  submit() {
    if (!this.videoFile) {
      this.msg = 'Video file is required';
      return;
    }
    const form = new FormData();
    form.append('title', this.title);
    form.append('description', this.description);
    form.append('department', this.department);
    form.append('subject', this.subject);
    form.append('video', this.videoFile);
    if (this.audioFile) form.append('audio', this.audioFile);

    this.http.post(`${environment.apiBaseUrl}/lectures/upload`, form).subscribe({
      next: () => (this.msg = 'Uploaded successfully'),
      error: err => (this.msg = err.error?.error || 'Upload failed')
    });
  }
}
