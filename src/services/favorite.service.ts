import { Injectable, signal } from '@angular/core';
import { RecipeRecord } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private readonly STORAGE_KEY = 'recipe_app_favorites';
  favorites = signal<RecipeRecord[]>([]);

  constructor() {
    this.loadFavorites();
  }

  private loadFavorites() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.favorites.set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load favorites', e);
    }
  }

  toggleFavorite(record: RecipeRecord) {
    this.favorites.update(prev => {
      const exists = prev.some(r => r.id === record.id);
      let newFavorites;
      if (exists) {
        newFavorites = prev.filter(r => r.id !== record.id);
      } else {
        newFavorites = [record, ...prev];
      }
      this.saveToStorage(newFavorites);
      return newFavorites;
    });
  }

  isFavorite(id: string): boolean {
    return this.favorites().some(r => r.id === id);
  }

  private saveToStorage(records: RecipeRecord[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  }
}