import { Component, input, output, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe } from '../models';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeCardComponent {
  recipe = input.required<Recipe>();
  imageUrl = input<string | undefined>();
  isFavorite = input<boolean>(false);
  toggleFavorite = output<void>();

  // Computed properties for cleaner template logic could go here if needed
}