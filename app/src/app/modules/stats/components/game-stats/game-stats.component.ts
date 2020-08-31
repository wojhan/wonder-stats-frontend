import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';

import { take } from 'rxjs/operators';

import { GameWebSocket } from '@wonder/core/GameWebSocket';
import { Game } from '@wonder/core/models/Game';
import { ScoreBoard } from '@wonder/core/models/ScoreBoard';
import { GameMessageReceiver } from '@wonder/core/models/websocket/GameMessageReceiver';
import { PointUpdateMessage } from '@wonder/core/models/websocket/PointUpdateMessage';
import { GameService } from '@wonder/core/services/game.service';

@Component({
  selector: 'app-game-stats',
  templateUrl: './game-stats.component.html',
  styleUrls: ['./game-stats.component.css'],
})
export class GameStatsComponent
  implements OnInit, OnChanges, OnDestroy, GameMessageReceiver {
  @Input() game: Game;
  @Output() endGame: EventEmitter<boolean> = new EventEmitter<boolean>();

  gameId;
  players;
  columns: ScoreBoard[];
  gameWebSocket: GameWebSocket;
  updatingScoreboard = false;

  shipyardBoards = ['1a', '1b', '2a', '2b', '3a', '3b', '4a', '4b'];

  constructor(public gameService: GameService, public router: Router) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.game && changes.game.currentValue) {
      const game: Game = changes.game.currentValue;

      if (!this.gameWebSocket) {
        this.columns = [];
        this.gameId = game.id;
        this.initGameWebSocket();
      } else {
        if (game.id !== this.gameId) {
          this.reloadGame(game.id);
          this.updatePlayers();
          return;
        }
      }
      if (game.players.length !== this.columns.length) {
        this.updatePlayers();
      }
    }
  }

  ngOnDestroy(): void {
    this.closeGameWebSocket();
  }

  reloadGame(gameId: number): void {
    this.gameId = gameId;
    this.columns = [];
    this.players = [];
    this.closeGameWebSocket();
    this.initGameWebSocket();
    this.shipyardBoards = ['1a', '1b', '2a', '2b', '3a', '3b', '4a', '4b'];
  }

  updatePlayers(): void {
    this.updatingScoreboard = true;
    this.gameService
      .updatePlayers(this.gameWebSocket, this.game, this.columns)
      .pipe(take(1))
      .subscribe({
        next: (newScoreBoard: ScoreBoard[]) => {
          this.columns = newScoreBoard;
          this.updatingScoreboard = false;
        },
        error: () => {
          this.router
            .navigate(['/error'], { queryParams: { backUrl: '/manage' } })
            .then();
        },
      });
  }

  initGameWebSocket(): void {
    this.gameWebSocket = new GameWebSocket(
      this.gameId,
      this as Component,
      true
    );
  }

  closeGameWebSocket(): void {
    if (this.gameWebSocket) {
      this.gameWebSocket.close();
    }

    this.gameWebSocket = null;
  }

  onPointUpdate(message: PointUpdateMessage): void {
    this.gameService.updatePlayerScoreboard(message, this.columns);
  }

  onGameInfoMessage(): void {}

  finish(): void {
    this.gameWebSocket.finish().subscribe({
      next: () => {
        this.gameWebSocket.close();
        this.game = null;
        this.endGame.emit(true);
      },
      error: () => {
        this.router.navigate(['/error'], {
          queryParams: { backUrl: '/manage' },
        });
      },
    });
  }

  onFinishGameMessage(): void {}
}
