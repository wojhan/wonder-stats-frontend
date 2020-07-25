import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { take } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { Game } from '../../../../core/models/Game';
import { environment } from '../../../../../environments/environment';
import { GameWebSocket } from '../../../../core/GameWebSocket';

@Component({
  selector: 'app-game-stats',
  templateUrl: './game-stats.component.html',
  styleUrls: ['./game-stats.component.css'],
})
export class GameStatsComponent implements OnInit, OnChanges {
  @Input()
  game: Game;

  @Output()
  endGame: EventEmitter<boolean> = new EventEmitter<boolean>();

  columns;
  gameWebSocket: GameWebSocket;

  // url = `${environment.apiUrl}`.slice(0, environment.apiUrl.length - 1);

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.game) {
      if (!this.gameWebSocket) {
        this.gameWebSocket = new GameWebSocket(this.game.id, this as Component);
      }
      this.columns = [];
      this.columns = this.game.players.map((player) => ({
        player,
        points: {},
      }));
      this.columns.forEach((column) => {
        this.gameWebSocket.getPoints(this.game.id, column.player.id).subscribe({
          next: (message) => {
            column.points = {};
            const keys = [
              'military',
              'coins',
              'wonders',
              'culture',
              'trade',
              'guild',
              'science',
              'cities',
              'leaders',
            ];
            keys.forEach((key, index) => {
              column.points[key] = message.points.filter(
                (x) => x.type === index + 1
              )[0]?.value;
            });
            column.sum = Object.keys(column.points).reduce(
              (sum, key) => sum + parseFloat(column.points[key] || 0),
              0
            );
          },
          error: (err) => {
            console.log(err);
          },
        });
      });

      for (let i = this.columns.length; i < 8; i++) {
        this.columns.push(null);
      }
    }
  }

  onPointUpdate(message): void {
    this.columns
      .filter((x) => x)
      .forEach((column) => {
        if (column.player.id === message.player) {
          const keys = Object.keys(column.points);
          column.points[keys[message.point_type - 1]] = message.value;
          column.sum = Object.keys(column.points).reduce(
            (sum, key) => sum + parseFloat(column.points[key] || 0),
            0
          );
        }
      });
  }

  onGameInfoMessage(message): void {}

  finish(): void {
    this.gameWebSocket.finish().subscribe({
      next: (message) => {
        this.gameWebSocket.close();
        this.game = null;
        this.endGame.emit(true);
      },
      error: (err) => {},
    });
  }
}
