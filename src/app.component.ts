import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiService } from './services/ai.service';
import { HistoryService } from './services/history.service';
import { FavoriteService } from './services/favorite.service';
import { RecipeCardComponent } from './components/recipe-card.component';
import { RecipeRecord, Recipe } from './models';
import { v4 as uuidv4 } from 'uuid';

type Tab = 'history' | 'favorites';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RecipeCardComponent],
  templateUrl: './app.component.html',
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
export class AppComponent {
  private aiService = inject(AiService);
  private historyService = inject(HistoryService);
  private favoriteService = inject(FavoriteService);

  isLoading = signal<boolean>(false);
  // Add a specific status message for granular feedback
  statusMessage = signal<string>(''); 
  error = signal<string | null>(null);
  currentRecord = signal<RecipeRecord | null>(null);
  
  // Data sources
  history = this.historyService.history;
  favorites = this.favoriteService.favorites;
  
  // UI State
  activeTab = signal<Tab>('history');
  searchQuery = signal<string>('');

  recommend() {
    const dishName = this.aiService.getRandomDishName();
    this.searchQuery.set(dishName);
    this.generate(dishName);
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  async generate(dishName: string) {
    if (!dishName.trim() || this.isLoading()) return;

    this.isLoading.set(true);
    this.statusMessage.set('正在联系 AI 主厨...'); // Initial status
    this.error.set(null);
    this.currentRecord.set(null);

    // 1. Start Image Generation in Background with fail-safe
    const imagePromise = this.aiService.generateImage(dishName)
      .catch((err) => {
        // Double safety catch, though Service handles it now
        console.warn('Image generation failed silently:', err);
        return `https://picsum.photos/800/600?random=${Date.now()}`;
      });

    try {
      // 2. Await Recipe Text (Critical Path)
      this.statusMessage.set('正在构思详细菜谱...');
      const recipe = await this.aiService.generateRecipe(dishName);
      
      const recordId = uuidv4();
      const timestamp = Date.now();

      // 3. Render Recipe Immediately
      const tempRecord: RecipeRecord = {
        id: recordId,
        timestamp: timestamp,
        recipe: recipe,
        imageUrl: undefined 
      };

      this.currentRecord.set(tempRecord);
      this.statusMessage.set('正在绘制美食画面...'); // Update status for image phase
      
      // Stop main loading spinner, but image area will show its own loader
      this.isLoading.set(false); 

      // 4. Wait for Image and Update
      const imageUrl = await imagePromise;
      
      const finalRecord: RecipeRecord = {
        ...tempRecord,
        imageUrl: imageUrl
      };

      // Update UI if we are still on the same record
      if (this.currentRecord()?.id === recordId) {
        this.currentRecord.set(finalRecord);
      }

      this.historyService.addRecord(finalRecord);

    } catch (err) {
      console.error('Generation failed:', err);
      // More descriptive error message
      this.error.set('生成超时或网络繁忙，请再试一次！');
      this.isLoading.set(false);
    }
  }

  loadFromHistory(record: RecipeRecord) {
    this.currentRecord.set(record);
    this.error.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isRecordFavorite(id: string): boolean {
    return this.favoriteService.isFavorite(id);
  }

  toggleFavorite(record: RecipeRecord) {
    this.favoriteService.toggleFavorite(record);
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  }
}