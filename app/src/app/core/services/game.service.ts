import { Injectable } from '@angular/core';
import { PointType } from '@wonder/core/models/point-type';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { EMPTY, Observable } from 'rxjs';
import { GameWebSocket } from '@wonder/core/GameWebSocket';
import { Point } from '@wonder/core/models/Point';
import { GameControl } from '@wonder/core/models/GameControl';
import { GameFormControlValues } from '@wonder/core/models/GameFormControlValues';

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
}
