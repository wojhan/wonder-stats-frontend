import { WebSocketSubject } from 'rxjs/internal-compatibility';
import { Observable, Subscription } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';
import { Component } from '@angular/core';
import { Game } from './models/Game';
import {
  delay,
  filter,
  map,
  retryWhen,
  take,
  tap,
  timeout,
} from 'rxjs/operators';
import { WebSocketI } from './WebSocketI';
import { getRandomHash } from './utils';

export class LobbyWebSocket implements WebSocketI {
  appComponent: any;
  webSocketSubject: WebSocketSubject<unknown>;
  webSocketListener: Observable<any>;
  webSocketSubscription: Subscription;
  url = environment.wsUrl + 'ws/game-lobby/';

  constructor(appComponent: Component) {
    this.appComponent = appComponent;
    this.webSocketSubject = webSocket(this.url);
    this.webSocketListener = this.webSocketSubject.asObservable();

    this.webSocketSubscription = this.webSocketListener
      .pipe(retryWhen((errors) => errors.pipe(delay(4000))))
      .subscribe({
        next: (message) => {
          this.onMessage(message);
        },
        complete: () => {
          this.onComplete();
        },
        error: (err) => {
          this.onError(err);
        },
      });
  }

  onMessage(message): void {
    if (!message.sender) {
      switch (message.message_type) {
        case 'game_info_response':
          this.appComponent.onGameInfoMessage(message);
          break;
        case 'game_info':
          this.appComponent.onGameInfoMessage(message);
          break;
      }
    }
  }

  onComplete(): void {}

  onError(error): void {}

  close(): void {
    this.webSocketSubscription.unsubscribe();
  }

  getLatestGame(): Observable<Game> {
    const sender = getRandomHash();
    this.webSocketSubject.next({ type: 'game_info_request', sender });
    return this.webSocketListener.pipe(
      filter(
        (message) =>
          message.message_type === 'game_info_response' &&
          message.sender === sender
      ),
      take(1),
      timeout(5000),
      map((message) => message.game)
    );
  }

  joinToGame(gameId: number, playerId: number): Observable<Game> {
    const sender = getRandomHash();
    this.webSocketSubject.next({
      type: 'player_joined_request',
      game: gameId,
      player: playerId,
      sender,
    });
    return this.webSocketListener.pipe(
      filter(
        (message) =>
          message.message_type === 'player_joined_response' &&
          message.sender === sender
      ),
      take(1),
      timeout(5000),
      map((message) => message.game)
    );
  }

  createGame(): Observable<any> {
    const sender = getRandomHash();

    this.webSocketSubject.next({
      type: 'create_game_request',
      sender,
    });

    return this.webSocketListener.pipe(
      filter(
        (msg) =>
          msg.message_type === 'create_game_response' && msg.sender === sender
      ),
      take(1),
      timeout(5000)
    );
  }

  leaveGame(gameId: number, playerId: number): Observable<Game> {
    const sender = getRandomHash();
    this.webSocketSubject.next({
      type: 'player_left_request',
      game: gameId,
      player: playerId,
      sender,
    });

    return this.webSocketListener.pipe(
      filter(
        (message) =>
          message.message_type === 'player_left_response' &&
          message.sender === sender
      ),
      take(1),
      timeout(5000),
      map((message) => message.game)
    );
  }
}
