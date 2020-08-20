import { TestBed } from '@angular/core/testing';

import { GameService } from './game.service';
import { FormGroup } from '@angular/forms';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { PointUpdateMessage } from '@wonder/core/models/websocket/PointUpdateMessage';
import { GameFormControlValues } from '@wonder/core/models/GameFormControlValues';
import { Point } from '@wonder/core/models/Point';
import { PointType } from '@wonder/core/models/point-type';

describe('GameService', () => {
  let service: GameService;
  let gameWebSocketMock;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
    gameWebSocketMock = jasmine.createSpyObj(
      'GameWebSocket',
      ['getPoints', 'updatePoint'],
      {
        gameId: 1,
      }
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('buildPointForm method', () => {
    it('should return a formGroup containing 11 controls', () => {
      const result: FormGroup = service.buildPointForm();
      const expected = Object.keys(result.controls);
      expect(expected.length).toBe(11);
    });
  });

  describe('initGame method', () => {
    it('should return an empty observable if gameWebSocket is not provided', () => {
      const result = service.initGame(undefined, 1);
      expect(result).toBe(EMPTY);
    });

    it('should return an empty observable if userId is not provided', () => {
      const result = service.initGame(gameWebSocketMock, undefined);
      expect(result).toBe(EMPTY);
    });

    it('should return an observable if parameters were provided', () => {
      const expected = of();
      gameWebSocketMock.getPoints.and.returnValue(expected);
      const result = service.initGame(gameWebSocketMock, 1);
      expect(result).toBe(expected);
    });

    it('should call gameWebSocket.getPoints if parameters were provided', () => {
      service.initGame(gameWebSocketMock, 1);
      expect(gameWebSocketMock.getPoints).toHaveBeenCalled();
    });

    it('should call gameWebSocket.getPoints with gameId and userId if parameters were provided', () => {
      service.initGame(gameWebSocketMock, 1);
      expect(gameWebSocketMock.getPoints).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('recountTotal method', () => {
    const emptyFormValues: GameFormControlValues = {};
    const oneFormValues: GameFormControlValues = { military: 3 };
    const twoFormValues: GameFormControlValues = { military: 3, coins: 5 };
    const stringFormValues: GameFormControlValues = { military: '3' };
    const nanFormValues: GameFormControlValues = { military: 'ala' };
    const equationFormValues: GameFormControlValues = { military: '1+2=3' };
    const sequenceFormValues: GameFormControlValues = { military: '1+2' };

    it('should return 0 if formValues are empty', () => {
      const result = service.recountTotal(emptyFormValues);
      expect(result).toBe(0);
    });

    it('should return value of one form value if formValues contain one element', () => {
      const result = service.recountTotal(oneFormValues);
      expect(result).toBe(+oneFormValues.military);
    });

    it('should return value of one form value if formValues contain one string element', () => {
      const result = service.recountTotal(stringFormValues);
      expect(result).toBe(+stringFormValues.military);
    });

    it('should return 0 if formValues contain one NaN element', () => {
      const result = service.recountTotal(nanFormValues);
      expect(result).toBe(0);
    });

    it('should return sum if formValues contain two elements', () => {
      const result = service.recountTotal(twoFormValues);
      expect(result).toBe(+twoFormValues.military + +twoFormValues.coins);
    });

    it('should return sum if formValues contain an equation', () => {
      const result = service.recountTotal(equationFormValues);
      expect(result).toBe(3);
    });

    it('should return sum if formValues contain a sequence', () => {
      const result = service.recountTotal(sequenceFormValues);
      expect(result).toBe(3);
    });
  });

  describe('updatePoint method', () => {
    let point: Point;
    beforeEach(() => {
      point = { game: 1, type: PointType.MILITARY, value: 1, player: 1 };
    });
    it('should call gameWebSocket.updatePoint', () => {
      gameWebSocketMock.updatePoint.and.returnValue(of());
      service.updatePoint(gameWebSocketMock, point);
      expect(gameWebSocketMock.updatePoint).toHaveBeenCalled();
    });

    it('should call error parameter if an error has occurred', () => {
      const error = {
        error: () => {},
      };
      spyOn(error, 'error');
      gameWebSocketMock.updatePoint.and.returnValue(throwError('s'));
      service.updatePoint(gameWebSocketMock, point, error.error);
      expect(error.error).toHaveBeenCalled();
    });

    it('should not call error parameter if no errors', () => {
      const error = {
        error: () => {},
      };
      spyOn(error, 'error');
      gameWebSocketMock.updatePoint.and.returnValue(of());
      service.updatePoint(gameWebSocketMock, point, error.error);
      expect(error.error).toHaveBeenCalledTimes(0);
    });
  });
});
