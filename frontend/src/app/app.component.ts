import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  template: `
    <header class="header">
      <div class="logo">Campus Portal</div>
    </header>
    <main class="main">
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {}
