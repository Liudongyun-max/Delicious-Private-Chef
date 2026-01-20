import { Component, ChangeDetectionStrategy, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ingredient } from '../models';

@Component({
  selector: 'app-ingredients',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white rounded-2xl border border-stone-100 shadow-xl shadow-stone-100/50 transition-all hover:shadow-lg hover:shadow-stone-200/40 h-full">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h3 class="text-lg font-serif text-stone-800 flex items-center gap-3">
           <span class="text-amber-500 text-xl">🥕</span>
          准备食材
        </h3>
        <div class="flex items-center gap-1 bg-stone-100 p-1 rounded-full text-xs self-start sm:self-center">
          @for (s of [2, 4, 6]; track s) {
            <button
              (click)="setServings(s)"
              [class.bg-white]="servings() === s"
              [class.text-stone-800]="servings() === s"
              [class.shadow-sm]="servings() === s"
              [class.text-stone-500]="servings() !== s"
              class="px-3 py-1 rounded-full transition-all font-medium"
            >
              {{ s }}人份
            </button>
          }
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
        @for (item of scaledIngredients(); track item.name) {
          <div 
            (click)="toggleCheck(item.name)"
            class="flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200"
            [class.bg-amber-50/80]="checkedItems().has(item.name)"
            [class.hover:bg-stone-50]="!checkedItems().has(item.name)"
          >
            <div class="flex items-center gap-3">
              <div 
                class="w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200"
                [class.bg-amber-500]="checkedItems().has(item.name)"
                [class.border-amber-500]="checkedItems().has(item.name)"
                [class.border-stone-300]="!checkedItems().has(item.name)"
                [class.scale-110]="checkedItems().has(item.name)"
              >
                @if(checkedItems().has(item.name)) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                }
              </div>
              <div 
                class="flex-1 transition-colors" 
                [class.text-stone-400]="checkedItems().has(item.name)" 
                [class.line-through]="checkedItems().has(item.name)"
              >
                <span class="font-medium text-stone-700 block text-sm">{{ item.name }}</span>
                @if (item.substitute) {
                   <span class="block text-[10px] italic mt-0.5">或 {{ item.substitute }}</span>
                }
              </div>
            </div>
            <div class="flex-shrink-0 text-right min-w-[3rem]">
              <span class="font-medium whitespace-nowrap text-sm" [class.text-amber-700]="checkedItems().has(item.name)" [class.text-stone-600]="!checkedItems().has(item.name)">{{ item.amount }}</span>
            </div>
          </div>
        }
      </div>
      <button (click)="copyToClipboard()" class="w-full mt-6 bg-amber-50 text-amber-700 font-medium py-3 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 text-sm active:scale-95 disabled:opacity-50" [disabled]="checkedItems().size === 0">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
        {{ copyButtonText() }} ({{ checkedItems().size }})
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngredientsComponent {
  ingredients = input.required<Ingredient[]>();
  baseServings = input(4);

  servings = signal(this.baseServings());
  checkedItems = signal<Set<string>>(new Set());
  copyButtonText = signal('复制购物清单');
  
  scaledIngredients = computed(() => {
    const base = this.baseServings() || 4;
    const scale = this.servings() / base;
    if (isNaN(scale) || !isFinite(scale) || scale === 1) return this.ingredients();

    return this.ingredients().map(ing => {
      const amount = ing.amount;
      const numericPart = amount.match(/(\d+\/\d+|\d*\.?\d+)/);
      if (numericPart) {
        let value = 0;
        const numStr = numericPart[0];
        if (numStr.includes('/')) {
          const parts = numStr.split('/');
          value = parseFloat(parts[0]) / parseFloat(parts[1]);
        } else {
          value = parseFloat(numStr);
        }
        if (!isNaN(value)) {
          let scaledValue = value * scale;
          let newAmountStr = (Math.round(scaledValue * 100) / 100).toString();
          if (newAmountStr.endsWith('.00')) newAmountStr = newAmountStr.slice(0, -3);
          if (newAmountStr.endsWith('.0')) newAmountStr = newAmountStr.slice(0, -2);
          return { ...ing, amount: amount.replace(numStr, newAmountStr) };
        }
      }
      return ing;
    });
  });

  setServings(num: number) {
    this.servings.set(num);
  }

  toggleCheck(itemName: string) {
    this.checkedItems.update(items => {
      const newItems = new Set(items);
      newItems.has(itemName) ? newItems.delete(itemName) : newItems.add(itemName);
      return newItems;
    });
  }
  
  copyToClipboard() {
    const listText = this.scaledIngredients()
      .filter(ing => this.checkedItems().has(ing.name))
      .map(ing => `${ing.name}: ${ing.amount}`)
      .join('\n');

    navigator.clipboard.writeText(listText).then(() => {
      this.copyButtonText.set('已复制!');
      setTimeout(() => this.copyButtonText.set('复制购物清单'), 2000);
    });
  }
}