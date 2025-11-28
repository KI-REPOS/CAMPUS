import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/services/api.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-lecture-list',
  imports: [CommonModule],
  template: `
    <div>
      <h2>Lecture Hub</h2>
      <button (click)="upload()">Upload Lecture (Faculty)</button>
      <div *ngFor="let lecture of lectures" (click)="open(lecture.id)">
        <h3>{{ lecture.title }}</h3>
        <p>{{ lecture.description }}</p>
        <small>{{ lecture.department }} • {{ lecture.subject }} • Views: {{ lecture.views }}</small>
      </div>
    </div>
  `
})
export class LectureListComponent implements OnInit {
  lectures: any[] = [];
  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.get<any[]>('/lectures').subscribe(data => (this.lectures = data));
  }

  open(id: string) {
    this.router.navigate(['/lectures', id]);
  }

  upload() {
    this.router.navigate(['/upload-lecture']);
  }
}
