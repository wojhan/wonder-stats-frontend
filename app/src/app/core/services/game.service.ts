import { Injectable } from '@angular/core';
import { PointType } from '@wonder/core/models/point-type';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { EMPTY, Observable, concat, of, throwError } from 'rxjs';
import { GameWebSocket } from '@wonder/core/GameWebSocket';
import { Point } from '@wonder/core/models/Point';
import { GameControl } from '@wonder/core/models/GameControl';
import { GameFormControlValues } from '@wonder/core/models/GameFormControlValues';
import { Game } from '@wonder/core/models/Game';
import { User } from '@wonder/core/models/User';
import { ScoreBoard } from '@wonder/core/models/ScoreBoard';
import { PointsUpdateMessage } from '@wonder/core/models/websocket/PointsUpdateMessage';
import { PointUpdateMessage } from '@wonder/core/models/websocket/PointUpdateMessage';
import { catchError, last, map, switchMap, take } from 'rxjs/operators';

const pointTypes = [
  PointType.MILITARY,
  PointType.COINS,
  PointType.WONDERS,
  PointType.CULTURE,
  PointType.TRADE,
  PointType.GUILD,
  PointType.SCIENCE,
  PointType.CITIES,
  PointType.LEADERS,
  PointType.SHIPYARD,
  PointType.ISLANDS,
];

const images = {
  coins: '/assets/images/form-icons/coins.png',
  wonders: '/assets/images/form-icons/stage.png',
  leaders: '/assets/images/form-icons/leader.png',
};

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor() {}

  buildPointForm(): FormGroup {
    const formControls: { [p: string]: AbstractControl } = {};

    pointTypes.forEach((pointType: PointType) => {
      const name = pointType.toString().toLowerCase();
      formControls[name] = new FormControl(null);
    });

    return new FormGroup(formControls);
  }

  generateGameFormComponents(formGroup: FormGroup): GameControl[] {
    return pointTypes.map((pointType: PointType) => {
      const pointTypeName = pointType.toString().toLowerCase();
      return {
        formControl: formGroup.get(pointTypeName),
        placeholder: pointType.placeholder,
        colorClass: pointType.cssClasses[0],
        pointType: pointType.value,
        imageUrl: images[pointTypeName] ? images[pointTypeName] : undefined,
      };
    });
  }

  initGame(gameWebSocket: GameWebSocket, userId: number): Observable<any> {
    if (!gameWebSocket || !userId) {
      return EMPTY;
    }
    return gameWebSocket.getPoints(gameWebSocket.gameId, userId);
  }

  recountTotal(formValues: GameFormControlValues): number {
    return Object.keys(formValues).reduce((sum, key) => {
      let value = '' + formValues[key];
      if (value.includes('+')) {
        value = value.replace(/\s/g, '');
        if (value.includes('=')) {
          value = value.slice(0, value.indexOf('='));
        }
        const values = value.split('+');
        const points = values.map((v) => +v).reduce((a, b) => a + b);
        return sum + points;
      } else {
        if (!formValues[key]) {
          return sum;
        }
        return sum + parseFloat('' + formValues[key]) || 0;
      }
    }, 0);
  }

  updatePoint(
    gameWebSocket: GameWebSocket,
    point: Point,
    error = () => {}
  ): void {
    gameWebSocket
      .updatePoint(point.game, point.player, point.type, point.value)
      .subscribe({ error });
  }

  removePlayersFromScoreboard(
    game: Game,
    scoreBoard: ScoreBoard[]
  ): ScoreBoard[] {
    if (!game) {
      return null;
    }

    if (!scoreBoard) {
      return [];
    }

    const tmpScoreBoard = [];
    scoreBoard.forEach((playerScore: ScoreBoard) => {
      for (const gamePlayer of game.players) {
        if (playerScore.player.id === gamePlayer.id) {
          tmpScoreBoard.push(playerScore);
          break;
        }
      }
    });
    return tmpScoreBoard;
  }

  updatePlayerScoreboard(
    message: PointUpdateMessage,
    scoreBoard: ScoreBoard[]
  ): void {
    for (const playerScoreboard of scoreBoard) {
      if (playerScoreboard.player.id === message.player) {
        playerScoreboard.points[message.point_type.toString()] = message.value;
        playerScoreboard.sum = this.recountTotal(playerScoreboard.points);
        break;
      }
    }

    scoreBoard = scoreBoard.sort((a, b) => b.sum - a.sum);
  }

  updateWholePlayerScoreboard(
    scoreBoard: ScoreBoard,
    pointMessage: PointsUpdateMessage
  ): void {
    const keys = Object.keys(PointType);
    keys.forEach((key: string) => {
      scoreBoard.points[key] = pointMessage.points.filter(
        (x) => x.type.toString() === key
      )[0]?.value;
    });

    scoreBoard.sum = this.recountTotal(scoreBoard.points);
  }

  addPlayerToScoreboard(
    gameWebSocket: GameWebSocket,
    player: User,
    scoreBoard: ScoreBoard[]
  ): Observable<boolean> {
    if (!gameWebSocket || !player || !scoreBoard) {
      return of(false);
    }
    const newEntry: ScoreBoard = { player, points: {}, sum: 0 };
    scoreBoard.push(newEntry);

    return gameWebSocket.getPoints(gameWebSocket.gameId, player.id).pipe(
      map((message: PointsUpdateMessage) => {
        this.updateWholePlayerScoreboard(newEntry, message);
        return true;
      }),
      take(1),
      catchError(() => of(false))
    );
  }

  updatePlayers(
    gameWebSocket: GameWebSocket,
    game: Game,
    scoreBoard: ScoreBoard[]
  ): Observable<ScoreBoard[]> {
    if (!gameWebSocket || !game || !scoreBoard) {
      return EMPTY;
    }

    if (game.players.length === 0) {
      return of([]);
    }

    let newScoreboard = this.removePlayersFromScoreboard(game, scoreBoard);
    const playerSubjects: Observable<boolean>[] = [];

    game.players.forEach((player: User) => {
      let inGame = false;
      for (const scoreBoardEntry of newScoreboard) {
        if (player.id === scoreBoardEntry.player.id) {
          inGame = true;
          break;
        }
      }

      if (!inGame) {
        playerSubjects.push(
          this.addPlayerToScoreboard(gameWebSocket, player, newScoreboard)
        );
      }
    });

    newScoreboard = newScoreboard.sort((a, b) => b.sum - a.sum);

    if (playerSubjects.length === 0) {
      return of(newScoreboard);
    }

    return concat(...playerSubjects).pipe(
      switchMap((playerAdded: boolean) => {
        if (!playerAdded) {
          throw throwError('error during getting points from game');
        }

        return of(newScoreboard);
      }),
      last()
    );
  }
}
