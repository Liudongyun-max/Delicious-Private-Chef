import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeStep } from '../models';

@Component({
  selector: 'app-steps',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white rounded-2xl border border-stone-100 shadow-xl shadow-stone-100/50 h-full">
      <h3 class="text-lg font-serif text-stone-800 mb-6 flex items-center gap-3">
        <span class="text-amber-500 text-xl">📖</span>
        烹饪步骤
      </h3>
      <div class="space-y-8 relative before:absolute before:left-[19px] before:top-5 before:bottom-5 before:w-1 before:bg-stone-100">
        @for (step of steps(); track step.step) {
          <div class="relative flex gap-6 group/step">
            <div class="flex-shrink-0 z-10">
              <div class="w-10 h-10 rounded-full bg-white border-2 border-amber-500 text-amber-600 flex items-center justify-center font-serif font-bold text-lg shadow-sm group-hover/step:scale-110 transition-transform duration-300">
                {{ step.step }}
              </div>
            </div>
            <div class="flex-grow pt-1">
              <div class="flex justify-between items-start gap-4">
                  <div>
                    <h4 class="font-semibold text-stone-800 text-base">{{ step.title }}</h4>
                    <div class="flex items-center gap-2 text-xs text-stone-500 mt-1.5">
                      <span class="bg-stone-100 px-2 py-0.5 rounded-full">🕒 {{step.duration_min}} 分钟</span>
                      <span class="bg-stone-100 px-2 py-0.5 rounded-full">🔥 {{step.heat}}</span>
                    </div>
                  </div>
                   <button 
                    (click)="toggleStep(step.step)"
                    class="text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap"
                    [class.bg-amber-500]="completedSteps().has(step.step)"
                    [class.text-white]="completedSteps().has(step.step)"
                    [class.bg-stone-100]="!completedSteps().has(step.step)"
                    [class.text-stone-600]="!completedSteps().has(step.step)"
                    [class.hover:bg-stone-200]="!completedSteps().has(step.step)"
                    >
                      @if(completedSteps().has(step.step)) {
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                        <span>已完成</span>
                      } @else {
                        <span>标记为完成</span>
                      }
                   </button>
              </div>

              <p class="text-stone-600 leading-relaxed text-sm mt-3 transition-colors" [class.text-stone-400]="completedSteps().has(step.step)">
                {{ step.instruction }}
              </p>
              
              @if (step.tip) {
                <div class="mt-3 text-xs text-stone-600 bg-amber-50/70 rounded-lg p-3 border-l-2 border-amber-300">
                  <strong>💡 提示:</strong> {{ step.tip }}
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepsComponent {
  steps = input.required<RecipeStep[]>();
  completedSteps = signal<Set<number>>(new Set());

  toggleStep(stepNumber: number) {
    this.completedSteps.update(steps => {
      const newSteps = new Set(steps);
      newSteps.has(stepNumber) ? newSteps.delete(stepNumber) : newSteps.add(stepNumber);
      return newSteps;
    });
  }
}