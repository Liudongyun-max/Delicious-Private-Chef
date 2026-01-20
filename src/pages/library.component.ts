import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HistoryService } from '../services/history.service';
import { FavoriteService } from '../services/favorite.service';
import { MenuItem } from '../models';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <header class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-serif font-bold text-stone-800 tracking-tight">我的菜谱库</h1>
        <p class="text-stone-500 mt-2">您最近生成的菜谱和收藏的美味佳肴。</p>
      </header>
      
      <!-- Tabs -->
      <div class="mb-8 flex justify-center border-b border-stone-200">
        <button (click)="activeTab = 'history'" 
                [class.border-amber-500]="activeTab === 'history'"
                [class.text-amber-600]="activeTab === 'history'"
                [class.border-transparent]="activeTab !== 'history'"
                class="px-6 py-3 text-sm font-medium border-b-2 transition-colors">
          历史记录
        </button>
        <button (click)="activeTab = 'favorites'"
                [class.border-amber-500]="activeTab === 'favorites'"
                [class.text-amber-600]="activeTab === 'favorites'"
                [class.border-transparent]="activeTab !== 'favorites'"
                class="px-6 py-3 text-sm font-medium border-b-2 transition-colors">
          我的收藏
        </button>
      </div>

      <!-- Content -->
      <div>
        @if (activeTab === 'history') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            @for(item of history(); track item.id) {
              <div class="bg-white rounded-lg shadow-md border border-stone-100 p-3 group relative">
                <div (click)="viewRecipe(item)" class="cursor-pointer">
                  <div class="h-40 bg-stone-100 rounded-md mb-3 overflow-hidden">
                    @if(item.imageUrl) {
                      <img [src]="item.imageUrl" [alt]="item.title" class="w-full h-full object-cover transition-transform group-hover:scale-105"/>
                    }
                  </div>
                  <h3 class="font-serif text-md font-semibold truncate">{{ item.title }}</h3>
                  <p class="text-xs text-stone-400">{{ item.difficulty }} &middot; {{ item.time_min }}分钟</p>
                </div>
                <button (click)="historyService.removeRecord(item.id)" class="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">&times;</button>
              </div>
            }
            @if(history().length === 0) {
              <p class="col-span-full text-center text-stone-500 py-16">您的历史记录为空。</p>
            }
          </div>
        }
        @if (activeTab === 'favorites') {
           <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            @for(item of favorites(); track item.id) {
              <div (click)="viewRecipe(item)" class="bg-white rounded-lg shadow-md border border-stone-100 p-3 cursor-pointer group">
                <div class="h-40 bg-stone-100 rounded-md mb-3 overflow-hidden">
                   @if(item.imageUrl) {
                      <img [src]="item.imageUrl" [alt]="item.title" class="w-full h-full object-cover transition-transform group-hover:scale-105"/>
                    }
                </div>
                <h3 class="font-serif text-md font-semibold truncate">{{ item.title }}</h3>
                 <p class="text-xs text-stone-400">{{ item.difficulty }} &middot; {{ item.time_min }}分钟</p>
              </div>
            }
             @if(favorites().length === 0) {
              <p class="col-span-full text-center text-stone-500 py-16">您还没有收藏任何菜谱。</p>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class LibraryComponent {
  // FIX: Explicitly type injected Router to resolve 'navigate' property access error on type 'unknown'.
  private router: Router = inject(Router);
  historyService = inject(HistoryService);
  favoriteService = inject(FavoriteService);
  
  history = this.historyService.history;
  favorites = this.favoriteService.favorites;

  activeTab: 'history' | 'favorites' = 'history';

  viewRecipe(item: MenuItem) {
    this.router.navigate(['/recipe', item.id], { state: { menuItem: item } });
  }
}
