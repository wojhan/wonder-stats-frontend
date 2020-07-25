import { Routes } from '@angular/router';
import { GamePage } from './pages/game/game.page';
import { UserResolve } from '../../core/resolvers/UserResolve';

export const GameRoutes: Routes = [
  { path: '', component: GamePage, resolve: { user: UserResolve } },
];
