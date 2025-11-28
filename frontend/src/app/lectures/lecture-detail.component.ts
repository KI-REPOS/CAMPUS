import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/services/api.service';

@Component({
  standalone: true,
  selector: 'app-lecture-detail',
  imports: [CommonModule],
  template: `
    <div *ngIf="lecture">
      <h2>{{ lecture.title }}</h2>
      <p>{{ lecture.description }}</p>
      <video #video width="800" controls (timeupdate)="onTimeUpdate($event)">
        <source [src]="lecture.video_url" type="video/mp4" />
      </video>

      <div>
        <h3>Timeline</h3>
        <div *ngFor="let c of lecture.captions" (click)="seek(c.start)">
          [{{ c.start }}s - {{ c.end }}s] {{ c.text }}
        </div>
      </div>

      <div>
        <h3>Transcript</h3>
        <p>{{ lecture.transcript }}</p>
      </div>
    </div>
  `
})
export class LectureDetailComponent implements OnInit {
  lecture: any;
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  currentTime = 0;

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.get(`/lectures/${id}`).subscribe(data => (this.lecture = data));
  }

  onTimeUpdate(event: Event) {
    const video = event.target as HTMLVideoElement;
    this.currentTime = video.currentTime;
  }

  seek(time: number) {
    const video = this.videoRef.nativeElement;
    video.currentTime = time;
    video.play();
  }
}
