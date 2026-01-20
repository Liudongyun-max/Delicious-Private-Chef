import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent),
    title: '首页 - 美味私厨'
  },
  {
    path: 'recipe/:id',
    loadComponent: () => import('./pages/recipe-detail.component').then(m => m.RecipeDetailComponent),
    title: '菜谱详情 - 美味私厨'
  },
  {
    path: 'library',
    loadComponent: () => import('./pages/library.component').then(m => m.LibraryComponent),
    title: '历史与收藏 - 美味私厨'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];