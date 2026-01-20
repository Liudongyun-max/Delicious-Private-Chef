// For the Home page menu generation
export interface MenuItem {
  id: string;
  title: string;
  tags: string[];
  time_min: number;
  difficulty: '简单' | '中等' | '困难';
  servings: number;
  image_prompt: string;
  imageUrl?: string; // To be populated by the client after image generation
}

export interface GeneratedMenu {
  menu_title: string;
  generated_at: string;
  items: MenuItem[];
}

// For the Recipe Detail page
export interface Ingredient {
  name: string;
  amount: string;
  note?: string;
  substitute?: string;
}

export interface RecipeStep {
  step: number;
  title: string;
  instruction: string;
  duration_min: number;
  heat: string;
  tip: string;
}

export interface Nutrition {
  kcal: number;
  protein_g: number;
  fat_g: number;
  carb_g: number;
}

export interface Recipe {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  time_min: number;
  difficulty: '简单' | '中等' | '困难';
  servings: number;
  cover_image_prompt: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  chef_tips: string[];
  nutrition: Nutrition;
}

// For local storage and state management
export interface RecipeRecord {
  menuItem: MenuItem;
  fullRecipe?: Recipe;
  imageUrl?: string;
}