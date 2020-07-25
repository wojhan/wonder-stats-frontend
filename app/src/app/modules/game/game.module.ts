import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamePage } from './pages/game/game.page';
import { RouterModule } from '@angular/router';
import { GameRoutes } from './game.routes';
import { SharedModule } from '../../shared/shared.module';
import { AvailableGamesComponent } from './components/available-games/available-games.component';
import { RunningGameComponent } from './components/running-game/running-game.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UserHeaderComponent } from './components/user-header/user-header.component';
import { UserResolve } from '../../core/resolvers/UserResolve';

@NgModule({
  declarations: [
    GamePage,
    AvailableGamesComponent,
    RunningGameComponent,
    UserHeaderComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(GameRoutes),
    SharedModule,
    ReactiveFormsModule,
  ],
})
export class GameModule {}
