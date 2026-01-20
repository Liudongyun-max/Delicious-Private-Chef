import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex flex-col">
      <!-- Fixed Top Navigation -->
      <nav class="sticky top-0 z-50 bg-white/60 backdrop-blur-lg border-b border-stone-100">
        <div class="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Brand -->
            <a routerLink="/" class="flex items-center gap-2 text-xl font-serif font-bold text-stone-800">
              <span class="text-2xl">🍲</span>
              <span>美味私厨</span>
            </a>
            <!-- Navigation Links -->
            <div class="flex items-center gap-4">
              <a routerLink="/" routerLinkActive="text-amber-600" [routerLinkActiveOptions]="{exact: true}"
                 class="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
                首页
              </a>
              <a routerLink="/library" routerLinkActive="text-amber-600"
                 class="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
                历史/收藏
              </a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Page Content -->
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

       <footer class="mt-auto py-8 text-center text-stone-400 text-xs tracking-widest uppercase border-t border-stone-100/80">
        <p>Powered by Google Gemini 2.5 Flash & Imagen 4.0</p>
      </footer>
    </div>
  `,
})
export class AppComponent {}