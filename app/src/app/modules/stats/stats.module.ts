import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsPage } from './pages/stats/stats.page';
import { RouterModule } from '@angular/router';
import { StatsRoutes } from './stats.routes';
import { NoGameComponent } from './components/no-game/no-game.component';
import { GameStatsComponent } from './components/game-stats/game-stats.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [StatsPage, NoGameComponent, GameStatsComponent],
  imports: [CommonModule, RouterModule.forChild(StatsRoutes), SharedModule],
})
export class StatsModule {}
