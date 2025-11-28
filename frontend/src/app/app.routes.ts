import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { LectureListComponent } from './lectures/lecture-list.component';
import { LectureDetailComponent } from './lectures/lecture-detail.component';
import { LectureUploadComponent } from './lectures/lecture-upload.component';
import { AlumniListComponent } from './alumni/alumni-list.component';
import { MentorshipRequestsComponent } from './alumni/mentorship-requests.component';
import { ForumListComponent } from './forum/forum-list.component';
import { ForumThreadComponent } from './forum/forum-thread.component';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { AuthGuardFn } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    canActivate: [AuthGuardFn],
    children: [
      { path: '', redirectTo: 'lectures', pathMatch: 'full' },
      { path: 'lectures', component: LectureListComponent },
      { path: 'lectures/:id', component: LectureDetailComponent },
      { path: 'upload-lecture', component: LectureUploadComponent },
      { path: 'alumni', component: AlumniListComponent },
      { path: 'alumni/requests', component: MentorshipRequestsComponent },
      { path: 'forum', component: ForumListComponent },
      { path: 'forum/:id', component: ForumThreadComponent },
      { path: 'admin', component: AdminDashboardComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
