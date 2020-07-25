import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../../../core/models/User';
import { environment } from '../../../../../environments/environment';
import { debounceTime, delay, retryWhen, switchMap, tap } from 'rxjs/operators';
import { GameWebSocket } from '../../../../core/GameWebSocket';
import { Game } from '../../../../core/models/Game';

@Component({
  selector: 'app-running-game',
  templateUrl: './running-game.component.html',
  styleUrls: ['./running-game.component.css'],
})
export class RunningGameComponent implements OnInit, OnChanges {
  @Input()
  currentGame: Game;
  @Input()
  user: User;

  formControls = {
    military: new FormControl(null),
    coins: new FormControl(null),
    wonders: new FormControl(null),
    culture: new FormControl(null),
    trade: new FormControl(null),
    guild: new FormControl(null),
    science: new FormControl(null),
    cities: new FormControl(null),
    leaders: new FormControl(null),
  };
  form: FormGroup = new FormGroup(this.formControls);
  gameWebSocket: GameWebSocket;
  subscriptions: Subscription[] = [];
  gameId: number;

  @Input()
  hasLeft: Observable<boolean>;

  @Output()
  finished: EventEmitter<number> = new EventEmitter<number>();

  @Output()
  playerChanged: EventEmitter<any> = new EventEmitter<any>();

  formUpdating = {
    military: false,
    coins: false,
    wonders: false,
    culture: false,
    trade: false,
    guild: false,
    science: false,
    cities: false,
    leaders: false,
  };

  pointsLoaded = false;

  constructor() {}

  ngOnInit(): void {}

  private closeGameWebSocket(): void {
    if (this.gameWebSocket) {
      this.gameWebSocket.close();
      this.gameWebSocket = null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.subscriptions.length) {
      this.subscriptions.forEach((sub) => {
        sub.unsubscribe();
      });
    }
    this.subscriptions = [];

    if (changes.game) {
      const game: Game = changes.game.currentValue;
      if (changes.game.currentValue.id !== this.gameId) {
        this.gameId = game.id;
        this.closeGameWebSocket();
      }
    }

    if (!this.form || !this.gameWebSocket) {
      this.formControls = {
        military: new FormControl(null),
        coins: new FormControl(null),
        wonders: new FormControl(null),
        culture: new FormControl(null),
        trade: new FormControl(null),
        guild: new FormControl(null),
        science: new FormControl(null),
        cities: new FormControl(null),
        leaders: new FormControl(null),
      };
      this.form = new FormGroup(this.formControls);
    }

    if (!this.gameWebSocket) {
      this.gameWebSocket = new GameWebSocket(
        this.currentGame.id,
        this as Component
      );
    }

    const keys = Object.keys(this.formControls);

    keys.forEach((key, index) => {
      const control = this.formControls[key] as FormControl;
      this.subscriptions.push(
        control.valueChanges
          .pipe(
            debounceTime(1000),
            switchMap((value: string) => {
              this.formUpdating[key] = true;
              return this.gameWebSocket.updatePoint(
                this.currentGame.id,
                this.user.id,
                index + 1,
                +value
              );
            })
          )
          .subscribe({
            next: (message) => {
              this.formUpdating[keys[message.point_type - 1]] = false;
            },
            error: (err) => {
              console.log(err);
            },
          })
      );
    });

    this.gameWebSocket.getPoints(this.currentGame.id, this.user.id).subscribe({
      next: (message) => {
        const points = message.points;
        points.forEach((point) => {
          console.log(this.form.controls);
          this.form.controls[keys[point.type - 1]].setValue(point.value);
        });
        this.pointsLoaded = true;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onGameInfoMessage(message): void {}

  onFinishGameMessage(message): void {
    this.finished.emit(this.currentGame.id);
  }
}
