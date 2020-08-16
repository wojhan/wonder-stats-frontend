import { WebSocketSubject } from 'rxjs/internal-compatibility';
import { iif, Observable, of, Subscription, throwError } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { Component, Inject } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  concatMap,
  delay,
  filter,
  retryWhen,
  take,
  timeout,
} from 'rxjs/operators';
import { getRandomHash } from './utils';
import { WebSocketI } from './WebSocketI';
import { SpinnerOverlayService } from './services/spinner-overlay.service';
import { retryPipe } from './pipes/websocket.pipes';

export class GameWebSocket implements WebSocketI {
  appComponent: Component;
  gameId: number;
  webSocketSubject: WebSocketSubject<unknown>;
  webSocketListener: Observable<any>;
  webSocketSubscription: Subscription;
  url = environment.wsUrl + 'ws/game/';

  spinner: SpinnerOverlayService;

  messages = 0;

  constructor(gameId: number, appComponent: Component) {
    this.spinner = SpinnerOverlayService.instance;
    this.appComponent = appComponent;
    this.gameId = gameId;
    this.webSocketSubject = webSocket(this.url + gameId + '/');
    this.webSocketListener = this.webSocketSubject.asObservable();

    this.webSocketSubscription = this.webSocketListener
      .pipe(retryPipe)
      .subscribe({
        next: (message) => {
          this.onMessage(message);
        },
        complete: () => {
          this.onComplete();
        },
        error: (err) => {
          console.log(err);
          this.onError(err);
        },
      });
  }

  onMessage(message): void {
    if (message.sender) {
      this.messages--;

      if (this.messages <= 0) {
        this.messages = 0;
        this.spinner.hide();
      }
    }
    if (!message.sender) {
      const property = {
        point_update: 'onPointUpdate',
        game_info_response: 'onGameInfoMessage',
        finish_game: 'onFinishGameMessage',
      };
      const method = this.appComponent[property[message.message_type]];
      if (typeof method === 'function') {
        method.call(this.appComponent, message);
      }
      // try {
      //   this.appComponent[property[message.message_type]](message);
      // } catch (e) {
      //   console.error(`Message handler for ${message.message_type} not found`);
      // }
    }
  }

  onComplete(): void {}

  onError(error): void {}

  close(): void {
    this.webSocketSubscription.unsubscribe();
  }

  updatePoint(
    gameId: number,
    playerId: number,
    pointType: any,
    value: number
  ): Observable<any> {
    this.messages++;
    this.spinner.show();
    const sender = getRandomHash();
    this.webSocketSubject.next({
      type: 'update_point_request',
      game: gameId,
      player: playerId,
      point_type: pointType,
      value,
      sender,
    });

    return this.webSocketListener.pipe(
      filter(
        (message) =>
          message.message_type === 'update_point_response' &&
          message.sender === sender
      ),
      take(1),
      timeout(5000)
    );
  }

  getPoints(gameId: number, playerId: number): Observable<any> {
    this.messages++;
    this.spinner.show();

    const sender = getRandomHash();
    this.webSocketSubject.next({
      type: 'get_points_request',
      game: gameId,
      player: playerId,
      sender,
    });

    return this.webSocketListener.pipe(
      filter(
        (message) =>
          message.message_type === 'get_points_response' &&
          message.sender === sender
      ),
      take(1),
      timeout(5000)
    );
  }

  finish(): Observable<any> {
    this.messages++;
    this.spinner.show();

    const sender = getRandomHash();
    this.webSocketSubject.next({
      type: 'finish_game_request',
      game: this.gameId,
      sender,
    });

    return this.webSocketListener.pipe(
      filter(
        (message) =>
          message.message_type === 'finish_game_response' &&
          message.sender === sender
      ),
      take(1),
      timeout(5000)
    );
  }
}
