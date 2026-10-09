import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./school/shell/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'aprender',
        loadComponent: () => import('./school/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'simulacro',
        loadComponent: () => import('./school/exam/exam.page').then((m) => m.ExamPage),
      },
      {
        path: 'playground',
        loadComponent: () => import('./school/playground/playground.page').then((m) => m.PlaygroundPage),
      },
      {
        path: 'glosario',
        loadComponent: () => import('./school/glossary-page/glossary.page').then((m) => m.GlossaryPage),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./school/profile/profile.page').then((m) => m.ProfilePage),
      },
      { path: '', redirectTo: 'aprender', pathMatch: 'full' },
    ],
  },
  {
    path: 'leccion/:id',
    loadComponent: () => import('./school/lesson/lesson.page').then((m) => m.LessonPage),
  },
  { path: '**', redirectTo: '' },
];
