import { Injectable, signal, effect } from '@angular/core';
import { MenuItem } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private readonly STORAGE_KEY = 'recipe_app_favorites_v2';
  favorites = signal<MenuItem[]>([]);

  constructor() {
    this.loadFavorites();
    effect(() => {
      this.saveToStorage(this.favorites());
    });
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

  toggleFavorite(record: MenuItem) {
    this.favorites.update(prev => {
      const exists = prev.some(r => r.id === record.id);
      if (exists) {
        return prev.filter(r => r.id !== record.id);
      } else {
        return [record, ...prev];
      }
    });
  }

  isFavorite(id: string): boolean {
    return this.favorites().some(r => r.id === id);
  }

  private saveToStorage(records: MenuItem[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  }
}