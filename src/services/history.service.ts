import { Injectable, signal, effect } from '@angular/core';
import { MenuItem } from '../models';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private readonly STORAGE_KEY = 'recipe_app_history_v2';
  history = signal<MenuItem[]>([]);

  constructor() {
    this.loadHistory();
    effect(() => {
      this.saveToStorage(this.history());
    });
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

  addRecord(record: MenuItem) {
    this.history.update(prev => {
      // Avoid duplicates
      const filtered = prev.filter(item => item.id !== record.id);
      const newHistory = [record, ...filtered].slice(0, 20); // Keep last 20
      return newHistory;
    });
  }
  
  removeRecord(recordId: string) {
    this.history.update(prev => prev.filter(item => item.id !== recordId));
  }

  private saveToStorage(records: MenuItem[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  }
}