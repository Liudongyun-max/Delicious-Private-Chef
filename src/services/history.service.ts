import { Injectable, signal } from '@angular/core';
import { RecipeRecord } from '../models';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private readonly STORAGE_KEY = 'recipe_app_history';
  history = signal<RecipeRecord[]>([]);

  constructor() {
    this.loadHistory();
  }

  private loadHistory() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.history.set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }

  addRecord(record: RecipeRecord) {
    this.history.update(prev => {
      const newHistory = [record, ...prev].slice(0, 10); // Keep last 10
      this.saveToStorage(newHistory);
      return newHistory;
    });
  }

  private saveToStorage(records: RecipeRecord[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  }

  getHistory(): RecipeRecord[] {
    return this.history();
  }
}