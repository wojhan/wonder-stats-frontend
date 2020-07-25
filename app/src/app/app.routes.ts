import { Routes } from '@angular/router';
import { ErrorComponent } from './error.component';

export const AppRoutes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'game',
    loadChildren: () =>
      import('./modules/game/game.module').then((m) => m.GameModule),
  },
  {
    path: 'manage',
    loadChildren: () =>
      import('./modules/stats/stats.module').then((m) => m.StatsModule),
  },
  { path: 'error', component: ErrorComponent },
  // { path: 'auth', loadChildren: () => import(‘./modules/auth/auth.module’).then(m => m.UserModule)}; },
];
