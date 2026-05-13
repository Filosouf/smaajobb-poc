import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then((m) => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register').then((m) => m.RegisterPage)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layout/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home').then((m) => m.HomePage)
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./features/jobs/list/jobs-list').then((m) => m.JobsList)
      },
      {
        path: 'jobs/new',
        loadComponent: () =>
          import('./features/jobs/form/jobs-form').then((m) => m.JobsFormPage)
      },
      {
        path: 'jobs/mine',
        loadComponent: () =>
          import('./features/jobs/list/jobs-list').then((m) => m.JobsList),
        data: { mineOnly: true }
      },
      {
        path: 'jobs/:id/edit',
        loadComponent: () =>
          import('./features/jobs/form/jobs-form').then((m) => m.JobsFormPage)
      },
      {
        path: 'jobs/:id',
        loadComponent: () =>
          import('./features/jobs/detail/jobs-detail').then(
            (m) => m.JobsDetailPage
          )
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
