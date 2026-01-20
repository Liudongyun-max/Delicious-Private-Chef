import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AiService } from '../services/ai.service';
import { FavoriteService } from '../services/favorite.service';
import { HistoryService } from '../services/history.service';
import { Recipe, MenuItem } from '../models';
import { IngredientsComponent } from '../components/ingredients.component';
import { StepsComponent } from '../components/steps.component';

@Component({
  standalone: true,
  imports: [CommonModule, IngredientsComponent, StepsComponent],
  templateUrl: './recipe-detail.component.html',
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
export class RecipeDetailComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private aiService: AiService = inject(AiService);
  private historyService: HistoryService = inject(HistoryService);
  favoriteService = inject(FavoriteService);

  menuItem = signal<MenuItem | null>(null);
  recipe = signal<Recipe | null>(null);
  imageUrl = signal<string | undefined | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  descriptionExpanded = signal(false);

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state;

    const menuItemFromState = state && typeof state === 'object' && 'menuItem' in state ? (state as { menuItem: unknown }).menuItem : undefined;
    const recipeFromState = state && typeof state === 'object' && 'recipe' in state ? (state as { recipe: unknown }).recipe : undefined;

    if (this.isMenuItem(menuItemFromState)) {
      this.menuItem.set(menuItemFromState);
      this.imageUrl.set(menuItemFromState.imageUrl);

      if (this.isRecipe(recipeFromState)) {
        // Case 1: Full data is present (nav from home). Display immediately.
        this.recipe.set(recipeFromState);
        this.isLoading.set(false);
        if (!this.imageUrl()) {
          this.generateImage(recipeFromState.cover_image_prompt);
        }
      } else {
        // Case 2: Only MenuItem is present (nav from library). Load details.
        this.loadRecipe(menuItemFromState.title);
      }
    } else {
      // Case 3: No state (page refresh). Fallback to URL param.
      this.route.paramMap.subscribe(params => {
        const recipeId = params.get('id');
        if (!recipeId) {
          this.handleError("加载菜谱失败：未找到菜谱ID。");
          return;
        }
        const foundItem = this.historyService.history().find(i => i.id === recipeId) || this.favoriteService.favorites().find(i => i.id === recipeId);
        if (foundItem) {
          this.menuItem.set(foundItem);
          this.imageUrl.set(foundItem.imageUrl);
          this.loadRecipe(foundItem.title);
        } else {
          this.handleError("加载菜谱失败：找不到菜谱数据，它可能来自旧的会话。请返回主页生成新菜单。");
        }
      });
    }
  }

  private isMenuItem(item: any): item is MenuItem {
    return item && typeof item === 'object' && typeof item.id === 'string' && typeof item.title === 'string';
  }

  private isRecipe(recipe: any): recipe is Recipe {
    return recipe && typeof recipe === 'object' && typeof recipe.id === 'string' && Array.isArray(recipe.steps);
  }

  handleError(message: string) {
    this.error.set(message);
    this.isLoading.set(false);
  }

  async loadRecipe(dishName: string, forceRegenerate: boolean = false) {
    this.isLoading.set(true);
    this.error.set(null);
    if (forceRegenerate) {
      this.recipe.set(null);
    }

    try {
      const fullRecipe = await this.aiService.generateRecipe(dishName);
      this.recipe.set(fullRecipe);

      if (!this.imageUrl() || forceRegenerate) {
        this.generateImage(fullRecipe.cover_image_prompt);
      }
    } catch (e: any) {
      this.handleError(e.message || '加载菜谱详情失败，请稍后重试。');
    } finally {
        if(!this.error()) {
            this.isLoading.set(false);
        }
    }
  }

  async generateImage(prompt: string) {
    this.imageUrl.set(undefined); // Loading state
    try {
      const url = await this.aiService.generateImage(prompt);
      this.imageUrl.set(url);
    } catch (e) {
      this.imageUrl.set(null); // Error state
    }
  }

  regenerate() {
    if (this.menuItem()) {
      this.loadRecipe(this.menuItem()!.title, true);
    }
  }

  toggleFavorite() {
    if (this.menuItem()) {
      this.favoriteService.toggleFavorite(this.menuItem()!);
    }
  }
  
  isFavorite(): boolean {
    return this.menuItem() ? this.favoriteService.isFavorite(this.menuItem()!.id) : false;
  }
}
