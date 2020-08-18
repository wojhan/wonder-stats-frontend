import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { LobbyWebSocket } from '../../../../core/LobbyWebSocket';
import { Game } from '../../../../core/models/Game';
import { User } from '../../../../core/models/User';
import { UserService } from '../../../../core/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
})
export class GamePage implements OnInit, OnDestroy {
  lobbyWebSocket: LobbyWebSocket;

  currentGame: Game;
  playerInGame: boolean;

  user: User;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.user = this.route.snapshot.data.user;
    if (!this.user) {
      this.router.navigate(['/auth', 'login']);
    }
    this.initWebSocket();
  }

  ngOnDestroy(): void {
    this.lobbyWebSocket.close();
  }

  initWebSocket(): void {
    this.lobbyWebSocket = new LobbyWebSocket(this as Component);
  }

  onGameInfoMessage(message): void {
    this.playerInGame = false;
    this.currentGame = message.game;
    if (this.currentGame && this.currentGame.players) {
      message.game.players.forEach((player) => {
        if (this.user.id === player.id) {
          this.playerInGame = true;
        }

        if (!player.avatar.includes('http')) {
          player.avatar =
            environment.apiUrl.slice(0, environment.apiUrl.length - 1) +
            player.avatar;
        }
      });
    }
  }

  onJoinClick(gameId: number): void {
    this.lobbyWebSocket.joinToGame(gameId, this.user.id).subscribe({
      next: (game: Game) => {
        this.currentGame = game;
      },
      error: (err) => {
        this.router.navigate(['/error']);
      },
    });
  }

  onLeave(hasLeft: boolean): void {
    const gameId = this.currentGame.id;
    if (hasLeft) {
      this.lobbyWebSocket.leaveGame(gameId, this.user.id).subscribe({
        next: (game: Game) => {},
        error: (err) => {
          this.router.navigate(['/error']);
        },
      });
    }
  }

  onFinished($event): void {
    this.currentGame = null;
    this.playerInGame = false;
  }
}
