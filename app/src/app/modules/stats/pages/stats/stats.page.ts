import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/internal-compatibility';
import { Observable, Subscription } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { Game } from '../../../../core/models/Game';
import { environment } from '../../../../../environments/environment';
import { LobbyWebSocket } from '../../../../core/LobbyWebSocket';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
})
export class StatsPage implements OnInit {
  lobbyWebSocket: LobbyWebSocket;

  game: Game;

  constructor() {}

  ngOnInit(): void {
    this.lobbyWebSocket = new LobbyWebSocket(this as Component, true);
  }

  onGameInfoMessage(message): void {
    this.game = message.game;
    if (this.game) {
      this.game.players.forEach((player) => {
        if (!player.avatar.includes('api/media')) {
          player.avatar = '/api/media/' + player.avatar;
        }
        if (!player.avatar.includes('http')) {
          player.avatar =
            environment.apiUrl.slice(0, environment.apiUrl.length - 1) +
            player.avatar;
        }
      });
    }
  }

  onEndGame($event): void {
    this.game = null;
  }

  onGameCreated($event): void {
    this.lobbyWebSocket.createGame().subscribe({
      next: (message) => {},
    });
  }
}
