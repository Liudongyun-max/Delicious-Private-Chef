export interface Ingredient {
  name: string;
  amount: string;
  optional: boolean;
  substitute?: string;
}

export interface Step {
  step: number;
  text: string;
  timeMinutes: number;
  heatLevel: string;
  tips: string;
}

export interface TimeInfo {
  prepMinutes: number;
  cookMinutes: number;
  totalMinutes: number;
}

export interface Nutrition {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
}

export interface Recipe {
  title: string;
  description: string;
  servings: number;
  difficulty: string;
  time: TimeInfo;
  ingredients: Ingredient[];
  steps: Step[];
  tips: string[];
  nutrition?: Nutrition;
}

export interface RecipeRecord {
  id: string;
  timestamp: number;
  recipe: Recipe;
  imageUrl?: string;
}