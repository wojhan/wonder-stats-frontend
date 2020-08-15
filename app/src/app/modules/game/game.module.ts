import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamePage } from './pages/game/game.page';
import { RouterModule } from '@angular/router';
import { GameRoutes } from './game.routes';
import { SharedModule } from '../../shared/shared.module';
import { AvailableGamesComponent } from './components/available-games/available-games.component';
import { RunningGameComponent } from './components/running-game/running-game.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { UserHeaderComponent } from './components/user-header/user-header.component';
import { UserResolve } from '../../core/resolvers/UserResolve';
import { GameFormControlComponent } from './components/game-form-control/game-form-control.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";

@NgModule({
  declarations: [
    GamePage,
    AvailableGamesComponent,
    RunningGameComponent,
    UserHeaderComponent,
    GameFormControlComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(GameRoutes),
    SharedModule,
    ReactiveFormsModule,
    FontAwesomeModule,
  ],
})
export class GameModule {}
