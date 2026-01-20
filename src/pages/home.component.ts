import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AiService } from '../services/ai.service';
import { HistoryService } from '../services/history.service';
import { MenuItem, GeneratedMenu } from '../models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <header class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-serif font-bold text-stone-800 tracking-tight">探索今日菜单</h1>
        <p class="text-stone-500 mt-2 max-w-2xl mx-auto">
          输入您的喜好，让我们用一份AI生成的美味菜单给您带来惊喜。
        </p>
      </header>

      <!-- New Generation Form -->
      <div class="w-full max-w-3xl mx-auto mb-16">
        <div class="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100">
          <div class="flex justify-between items-start mb-8">
            <div>
              <h2 class="text-2xl font-bold text-stone-800">说出你想吃的菜</h2>
              <p class="text-stone-500 text-sm mt-1">输入菜名 + 偏好设置，一次生成结构化菜谱。</p>
            </div>
            <span class="text-xs font-medium bg-orange-100 text-orange-700 px-3 py-1 rounded-full whitespace-nowrap">AI 菜谱工坊</span>
          </div>

          <!-- Form Grid -->
          <div class="space-y-6">
            <div>
              <div class="flex justify-between items-baseline mb-2">
                <label for="dishName" class="block text-sm font-medium text-stone-700">菜名</label>
                <button (click)="generateRandom()" [disabled]="isLoading()" class="text-xs font-medium text-orange-500 hover:text-orange-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span>一键随机生成</span>
                </button>
              </div>
              <input type="text" id="dishName" [(ngModel)]="dishName" maxlength="30" placeholder="例如: 糖醋里脊" class="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition">
              <p class="text-xs text-stone-400 mt-1 text-right">{{ dishName().length }}/30 字</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="flavor" class="block text-sm font-medium text-stone-700 mb-2">口味</label>
                <select id="flavor" [(ngModel)]="flavor" class="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition appearance-none bg-no-repeat bg-right pr-8" style="background-image: url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e'); background-position: right 0.5rem center; background-size: 1.5em 1.5em;">
                  @for(opt of flavorOptions; track opt) { <option [value]="opt">{{ opt }}</option> }
                </select>
              </div>
              <div>
                <label for="spiciness" class="block text-sm font-medium text-stone-700 mb-2">辣度</label>
                <select id="spiciness" [(ngModel)]="spiciness" class="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition appearance-none bg-no-repeat bg-right pr-8" style="background-image: url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e'); background-position: right 0.5rem center; background-size: 1.5em 1.5em;">
                  @for(opt of spicinessOptions; track opt) { <option [value]="opt">{{ opt }}</option> }
                </select>
              </div>
              <div>
                <label for="servings" class="block text-sm font-medium text-stone-700 mb-2">人数</label>
                <select id="servings" [(ngModel)]="servings" class="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition appearance-none bg-no-repeat bg-right pr-8" style="background-image: url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e'); background-position: right 0.5rem center; background-size: 1.5em 1.5em;">
                   @for(opt of servingsOptions; track opt) { <option [value]="opt">{{ opt }}</option> }
                </select>
              </div>
              <div>
                <label for="restrictions" class="block text-sm font-medium text-stone-700 mb-2">饮食限制</label>
                <select id="restrictions" [(ngModel)]="restrictions" class="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition appearance-none bg-no-repeat bg-right pr-8" style="background-image: url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e'); background-position: right 0.5rem center; background-size: 1.5em 1.5em;">
                   @for(opt of restrictionsOptions; track opt) { <option [value]="opt">{{ opt }}</option> }
                </select>
              </div>
            </div>
            
            <div class="pt-2 flex items-center gap-4">
              <button (click)="generate()" [disabled]="isLoading() || !dishName().trim()" class="px-8 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all shadow-lg shadow-orange-500/30 active:scale-95 flex items-center justify-center min-w-[140px] disabled:bg-orange-300 disabled:cursor-not-allowed">
                @if (isLoading()) {
                  <div class="flex items-center gap-2">
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>生成中...</span>
                  </div>
                } @else {
                  <span>生成菜谱</span>
                }
              </button>
              <span class="text-sm text-stone-500 hidden md:inline">生成内容为结构化 JSON，可直接渲染。</span>
            </div>
          </div>
        </div>
      </div>
      
      @if (error()) {
        <div class="text-center my-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 max-w-2xl mx-auto">
          <p><strong>生成失败</strong></p>
          <p class="text-sm">{{ error() }}</p>
        </div>
      }

      <!-- Results Area -->
      <div class="animate-fade-in-up">
        @if (isLoading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for(i of [1,2,3]; track i) {
              <div class="bg-white/80 rounded-2xl shadow-lg shadow-stone-100 border border-stone-100 p-4 animate-pulse">
                <div class="h-48 bg-stone-200 rounded-lg mb-4"></div>
                <div class="h-6 w-3/4 bg-stone-200 rounded mb-2"></div>
                <div class="flex flex-wrap gap-2">
                  <div class="h-5 w-1/4 bg-stone-200 rounded-full"></div>
                  <div class="h-5 w-1/3 bg-stone-200 rounded-full"></div>
                </div>
              </div>
            }
          </div>
        } @else if (menu(); as m) {
          <div class="text-center mb-8">
            <h2 class="text-2xl font-serif font-semibold">{{ m.menu_title }}</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for(item of m.items; track item.id) {
              <div (click)="viewRecipe(item)" class="bg-white rounded-2xl shadow-lg shadow-stone-100 border border-stone-100 p-4 cursor-pointer transition-all hover:shadow-2xl hover:shadow-stone-200/80 hover:-translate-y-2 group">
                <div class="relative h-48 bg-stone-100 rounded-lg mb-4 overflow-hidden">
                   @if (item.imageUrl && item.imageUrl !== 'generating') {
                      <img [src]="item.imageUrl" [alt]="item.title" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
                   } @else if (item.imageUrl === 'generating') {
                      <div class="w-full h-full flex items-center justify-center animate-pulse bg-stone-200 text-stone-500 text-sm">正在生成图片...</div>
                   } @else {
                      <div class="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400">
                        <p>图片生成失败</p>
                        <button class="text-xs mt-2 px-2 py-1 bg-white rounded-md" (click)="$event.stopPropagation(); generateImageForItem(item)">重试</button>
                      </div>
                   }
                </div>
                <h3 class="text-lg font-serif font-semibold text-stone-800 truncate">{{ item.title }}</h3>
                <div class="flex flex-wrap gap-2 mt-2">
                   @for(tag of item.tags; track tag) {
                     <span class="px-2 py-0.5 text-xs rounded-full bg-stone-100 text-stone-600">{{ tag }}</span>
                   }
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-16 text-stone-400">
             <p>👆 填写您的偏好，开启美食之旅</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.6s ease-out forwards;
    }
  `]
})
export class HomeComponent {
  private aiService = inject(AiService);
  private router: Router = inject(Router);
  private historyService = inject(HistoryService);

  // Form state
  dishName = signal('');
  flavor = signal('正常');
  spiciness = signal('微辣');
  servings = signal('2人');
  restrictions = signal('无');

  // Options for select dropdowns
  readonly flavorOptions = ['正常', '清淡', '重口味', '酸甜', '咸鲜'];
  readonly spicinessOptions = ['不辣', '微辣', '中辣', '特辣'];
  readonly servingsOptions = ['1人', '2人', '3-4人', '5人以上'];
  readonly restrictionsOptions = ['无', '素食', '无海鲜', '无坚果', '低碳水'];

  // Other state signals
  isLoading = signal(false);
  error = signal<string | null>(null);
  menu = signal<GeneratedMenu | null>(null);

  async generateRandom() {
    if (this.isLoading()) return;
    this.dishName.set(''); // Clear dish name for random generation
    await this.generate();
  }

  async generate() {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.menu.set(null);
    
    const dish = this.dishName().trim();
    const preferences = `为 ${this.servings()} 准备。口味偏好: ${this.flavor()}。辣度要求: ${this.spiciness()}。饮食限制: ${this.restrictions()}。`;
    const baseInstructions = `The output must be in Chinese (Simplified) and strictly adhere to the provided JSON schema. Do not output any text outside the JSON structure. For each ID, generate a unique UUID. The generated_at value should be the current date in ISO format.`;

    let prompt: string;

    if (dish) {
      prompt = `Generate a dinner menu containing ONLY the dish "${dish}".
        Incorporate the following preferences when generating the details for this single dish: ${preferences}.
        The menu's 'items' array should contain exactly one dish.
        The 'menu_title' should be the name of the dish.
        ${baseInstructions}`;
    } else {
      prompt = `Generate a random, balanced, and appealing home-style dinner menu with 3 dishes.
        The menu should include a mix of meat and vegetable dishes and avoid repeating main ingredients.
        Incorporate the following preferences for the overall menu: ${preferences}.
        Give the menu an appealing and creative title for 'menu_title'.
        ${baseInstructions}`;
    }
    
    try {
      const generatedMenu = await this.aiService.generateMenu(prompt);
      
      // If a single dish was requested, generate full details BEFORE navigating.
      if (dish && generatedMenu.items.length === 1) {
        const menuItem = generatedMenu.items[0];
        const fullRecipe = await this.aiService.generateRecipe(menuItem.title);
        
        // Add to history and navigate with the complete data package.
        this.historyService.addRecord(menuItem);
        this.router.navigate(['/recipe', menuItem.id], { 
          state: { 
            menuItem: menuItem,
            recipe: fullRecipe 
          } 
        });
        return; // Navigation will occur, so we can exit.
      }
      
      this.menu.set(generatedMenu);
      
      this.menu()?.items.forEach(item => {
        this.generateImageForItem(item);
      });

    } catch (e: any) {
      this.error.set(e.message || 'An unknown error occurred.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async generateImageForItem(item: MenuItem) {
    item.imageUrl = 'generating';
    this.menu.update(m => m ? { ...m } : null);

    try {
      const imageUrl = await this.aiService.generateImage(item.image_prompt);
      item.imageUrl = imageUrl;
    } catch (e) {
      console.error(`Failed to generate image for ${item.title}`, e);
      item.imageUrl = undefined;
    }
    this.menu.update(m => m ? { ...m } : null);
  }

  viewRecipe(item: MenuItem) {
    this.historyService.addRecord(item);
    this.router.navigate(['/recipe', item.id], { state: { menuItem: item } });
  }
}
