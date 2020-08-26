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
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import {
  faCalculator,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { PartialObserver } from 'rxjs';
import { filter } from 'rxjs/operators';

import { GameWebSocket } from '@wonder/core/GameWebSocket';
import { User } from '@wonder/core/models/User';
import { WebsocketService } from '@wonder/core/services/websocket.service';
import { calculateControlValue } from '@wonder/core/utils';
import { GameScienceCalculatorComponent } from '../game-science-calculator/game-science-calculator.component';
import { Game } from '@wonder/core/models/Game';
import { GameService } from '@wonder/core/services/game.service';
import { Point } from '@wonder/core/models/Point';
import { GameMessageReceiver } from '@wonder/core/models/websocket/GameMessageReceiver';
import { PointUpdateMessage } from '@wonder/core/models/websocket/PointUpdateMessage';
import { PointUpdate } from '@wonder/core/models/PointUpdate';
import { PointsUpdateMessage } from '@wonder/core/models/websocket/PointsUpdateMessage';

@Component({
  selector: 'app-running-game',
  templateUrl: './running-game.component.html',
  styleUrls: ['./running-game.component.css'],
})
export class RunningGameComponent
  implements OnInit, OnChanges, OnDestroy, GameMessageReceiver {
  @Input() currentGame: Game;
  @Input() user: User;
  @Output() finished: EventEmitter<number> = new EventEmitter<number>();

  private gameWebSocket: GameWebSocket;
  private gameId: number;
  private gameChanged = false;

  form: FormGroup;
  formControls;
  gameComponents;
  gameLoaded = false;
  faCalculator: IconDefinition = faCalculator;
  total = 0;

  constructor(private matDialog: MatDialog, private gameService: GameService) {}

  ngOnInit(): void {
    this.buildForm();
    this.generateGameComponents();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentGame) {
      const game: Game = changes.currentGame.currentValue;
      if (game.id !== this.gameId) {
        this.gameId = game.id;
        this.gameChanged = true;
        this.closeGameWebSocket();
      }
      if (!this.gameWebSocket) {
        this.gameWebSocket = this.initGameWebSocket();
        this.initGame();
      }
    }
  }

  ngOnDestroy(): void {
    this.closeGameWebSocket();
  }

  private initGameWebSocket(): GameWebSocket {
    return new GameWebSocket(this.gameId, this as Component);
  }

  private buildForm(): void {
    this.form = this.gameService.buildPointForm();
  }

  private generateGameComponents(): void {
    this.gameComponents = this.gameService.generateGameFormComponents(
      this.form
    );
  }

  private closeGameWebSocket(): void {
    if (this.gameWebSocket) {
      this.gameWebSocket.close();
      this.gameWebSocket = null;
    }

    this.gameLoaded = false;
  }

  private initGame(): void {
    const pointMessageObserver: PartialObserver<any> = {
      next: (message) => this.onPointMessage(message),
      error: (err) => WebsocketService.routerInstance.navigate(['/error']),
    };
    this.gameService
      .initGame(this.gameWebSocket, this.user.id)
      .subscribe(pointMessageObserver);
  }

  private updateFormControl(
    control: FormControl,
    value: string | number,
    emitEvent: boolean = true
  ): void {
    let options;
    if (!emitEvent) {
      options = { emitEvent: false, emitViewToModelChange: false };
    }
    control.setValue(value, options);
  }

  private updatePoints(points: Point[]): void {
    points.forEach((point: Point) => {
      const control = this.gameComponents[point.type.value - 1].formControl;
      this.updateFormControl(control, point.value, false);
    });
    this.recountTotal();
  }

  private recountTotal(): void {
    this.total = this.gameService.recountTotal(this.form.value);
  }

  private onPointMessage(message: PointsUpdateMessage): void {
    this.updatePoints(message.points);
    this.gameLoaded = true;
  }

  calculateScience(): void {
    const dialog = this.matDialog.open(GameScienceCalculatorComponent, {});

    dialog
      .afterClosed()
      .pipe(filter((x) => x))
      .subscribe((value) => {
        // TODO: Change to enum
        const scienceKey = Object.keys(this.formControls).indexOf('science');
        const pointType = this.gameComponents[scienceKey].pointType;
        const pointValue = calculateControlValue(value);
        this.formControls.science.setValue(`${value}=${pointValue}`);
        this.onPointChange({
          type: pointType,
          value: pointValue,
        });
        this.recountTotal();
      });
  }

  onPointChange(pointUpdate: PointUpdate): void {
    const point: Point = {
      ...pointUpdate,
      game: this.currentGame.id,
      player: this.user.id,
    };
    this.gameService.updatePoint(this.gameWebSocket, point, () =>
      WebsocketService.routerInstance.navigate(['/error'])
    );
  }

  onPointUpdate(message: PointUpdateMessage): void {
    if (message.player === this.user.id) {
      const control = this.gameComponents[message.point_type - 1].formControl;
      this.updateFormControl(control, message.value, false);
      this.recountTotal();
    }
  }

  onGameInfoMessage(message): void {}

  onFinishGameMessage(message): void {
    this.finished.emit(this.currentGame.id);
  }
}
