import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { FormGroup } from '@angular/forms';
import { EMPTY, of, throwError } from 'rxjs';
import { PointUpdateMessage } from '@wonder/core/models/websocket/PointUpdateMessage';
import { GameFormControlValues } from '@wonder/core/models/GameFormControlValues';
import { Point } from '@wonder/core/models/Point';
import { PointType } from '@wonder/core/models/point-type';
import { Game } from '@wonder/core/models/Game';
import { User } from '@wonder/core/models/User';
import { ScoreBoard } from '@wonder/core/models/ScoreBoard';
import { PointsUpdateMessage } from '@wonder/core/models/websocket/PointsUpdateMessage';

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

  describe('removePlayersFromScoreBoard method', () => {
    let playerFixture: User[];
    let scoreBoardFixture: ScoreBoard[];
    let gameFixture: Game;
    let gameWithPlayersFixture: Game;
    beforeEach(() => {
      playerFixture = [
        { id: 1, username: 'user1', avatar: '' },
        { id: 2, username: 'user2', avatar: '' },
      ];
      scoreBoardFixture = [
        {
          player: playerFixture[0],
          points: {},
          sum: 0,
        },
        {
          player: playerFixture[1],
          points: {},
          sum: 0,
        },
      ];
      gameFixture = {
        id: 1,
        players: [],
        created_at: new Date(),
        finished_at: null,
      };

      gameWithPlayersFixture = {
        id: 1,
        players: playerFixture,
        created_at: new Date(),
        finished_at: null,
      };
    });
    it('should return null if no game passed', () => {
      const result = service.removePlayersFromScoreboard(undefined, undefined);
      expect(result).toBeNull();
    });
    it('should return an empty array if no scoreBoard passed', () => {
      const result = service.removePlayersFromScoreboard(
        gameFixture,
        undefined
      );
      expect(result).toEqual([]);
    });

    it('should return the same array if game and scoreBoard have the same player list', () => {
      const result = service.removePlayersFromScoreboard(
        gameWithPlayersFixture,
        scoreBoardFixture
      );
      expect(result).toEqual(scoreBoardFixture);
    });

    it('should not return the same array if game and scoreBoard have different player lists', () => {
      // scoreBoardFixture[0].player.id = 5;
      gameWithPlayersFixture.players[0] = {
        id: 5,
        username: 'user5',
        avatar: '',
      };
      const result = service.removePlayersFromScoreboard(
        gameWithPlayersFixture,
        scoreBoardFixture
      );
      expect(result).not.toEqual(scoreBoardFixture);
    });

    it('returned array should not contain element only existing in scoreBoard', () => {
      const oldScoreBoard: ScoreBoard[] = [];
      oldScoreBoard[0] = Object.assign({}, scoreBoardFixture[0]);
      oldScoreBoard[1] = Object.assign({}, scoreBoardFixture[1]);
      scoreBoardFixture.push({
        player: { id: 7, username: 'user7', avatar: '' },
        points: {},
        sum: 0,
      });
      const result = service.removePlayersFromScoreboard(
        gameWithPlayersFixture,
        scoreBoardFixture
      );
      expect(result).toEqual(oldScoreBoard);
    });

    it('returned array length should be less then original if element not in game object', () => {
      const originalLength = scoreBoardFixture.length;
      gameWithPlayersFixture.players.pop();
      const result = service.removePlayersFromScoreboard(
        gameWithPlayersFixture,
        scoreBoardFixture
      );
      expect(result.length).toBeLessThan(originalLength);
    });
  });

  describe('addPlayerToScoreboard method', () => {
    let playerFixture: User[];
    let scoreBoardFixture: ScoreBoard[];
    let gameFixture: Game;
    let gameWithPlayersFixture: Game;

    beforeEach(() => {
      playerFixture = [
        { id: 1, username: 'user1', avatar: '' },
        { id: 2, username: 'user2', avatar: '' },
      ];
      scoreBoardFixture = [
        {
          player: playerFixture[0],
          points: {},
          sum: 0,
        },
        {
          player: playerFixture[1],
          points: {},
          sum: 0,
        },
      ];
      gameFixture = {
        id: 1,
        players: [],
        created_at: new Date(),
        finished_at: null,
      };

      gameWithPlayersFixture = {
        id: 1,
        players: playerFixture,
        created_at: new Date(),
        finished_at: null,
      };
    });

    const wrongParameters = [
      {
        gameWeboscket: undefined,
        player: {},
        scoreBoard: [],
        desc: 'no gameWebsocket provided',
      },
      {
        gameWeboscket: {},
        player: undefined,
        scoreBoard: [],
        desc: 'no player provided',
      },
      {
        gameWeboscket: {},
        player: {},
        scoreBoard: undefined,
        desc: 'no scoreBoard provided',
      },
    ];

    for (const el of wrongParameters) {
      it(`should return false if ${el.desc}`, (done) => {
        spyOn(service, 'updateWholePlayerScoreboard');
        const $result = service.addPlayerToScoreboard(
          el.gameWeboscket,
          el.player,
          el.scoreBoard
        );
        $result.subscribe((added) => {
          expect(added).toBeFalse();
          done();
        });
      });
    }

    it('should return true if parameters are passed correctly', (done) => {
      gameWebSocketMock.getPoints.and.returnValue(of({}));
      spyOn(service, 'updateWholePlayerScoreboard').and.stub();
      const $result = service.addPlayerToScoreboard(
        gameWebSocketMock,
        playerFixture[0],
        scoreBoardFixture
      );

      $result.subscribe({
        next: (added) => {
          expect(added).toBeTrue();
          done();
        },
      });
    });

    it('scoreboard should contain a new player', () => {
      const player: User = { id: 5, avatar: '', username: 'user5' };
      gameWebSocketMock.getPoints.and.returnValue(of({}));
      service.addPlayerToScoreboard(
        gameWebSocketMock,
        player,
        scoreBoardFixture
      );

      expect(scoreBoardFixture[scoreBoardFixture.length - 1].player).toEqual(
        player
      );
    });

    it('scoreboard length should be one more than original if added a new player', () => {
      const originalLength = scoreBoardFixture.length;
      const player: User = { id: 5, avatar: '', username: 'user5' };
      gameWebSocketMock.getPoints.and.returnValue(of());
      service.addPlayerToScoreboard(
        gameWebSocketMock,
        player,
        scoreBoardFixture
      );

      expect(scoreBoardFixture.length).toBe(originalLength + 1);
    });

    it('should return false if websocket throws an error', (done) => {
      gameWebSocketMock.getPoints.and.returnValue(throwError('error'));
      const player: User = { id: 5, avatar: '', username: 'user5' };
      const $result = service.addPlayerToScoreboard(
        gameWebSocketMock,
        player,
        scoreBoardFixture
      );

      $result.subscribe({
        next: (added) => {
          expect(added).toBeFalse();
          done();
        },
      });
    });

    it('should not call updateWholePlayerScoreboard if websocket throws an error', (done) => {
      gameWebSocketMock.getPoints.and.returnValue(throwError('error'));
      spyOn(service, 'updateWholePlayerScoreboard');
      const player: User = { id: 5, avatar: '', username: 'user5' };
      const $result = service.addPlayerToScoreboard(
        gameWebSocketMock,
        player,
        scoreBoardFixture
      );

      $result.subscribe({
        next: () => {
          expect(service.updateWholePlayerScoreboard).toHaveBeenCalledTimes(0);
          done();
        },
      });
    });

    it('should call updateWholePlayerScoreboard if websocket emits a value', (done) => {
      gameWebSocketMock.getPoints.and.returnValue(of({}));
      spyOn(service, 'updateWholePlayerScoreboard');
      const player: User = { id: 5, avatar: '', username: 'user5' };
      const $result = service.addPlayerToScoreboard(
        gameWebSocketMock,
        player,
        scoreBoardFixture
      );

      $result.subscribe({
        next: () => {
          expect(service.updateWholePlayerScoreboard).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should call updateWholePlayerScoreboard with playerScoreboard and update point message', (done) => {
      const message: PointsUpdateMessage = {
        message_type: 'update',
        points: [{ game: 1, player: 1, type: PointType.CITIES, value: 2 }],
      };
      gameWebSocketMock.getPoints.and.returnValue(of(message));
      spyOn(service, 'updateWholePlayerScoreboard');
      const player: User = { id: 5, avatar: '', username: 'user5' };
      const $result = service.addPlayerToScoreboard(
        gameWebSocketMock,
        player,
        scoreBoardFixture
      );

      $result.subscribe({
        next: () => {
          expect(service.updateWholePlayerScoreboard).toHaveBeenCalledWith(
            { player, points: {}, sum: 0 },
            message
          );
          done();
        },
      });
    });
  });

  describe('updatePlayerScoreboard method', () => {
    let playerFixture: User[];
    let scoreBoardFixture: ScoreBoard[];
    let pointUpdateMessageFixture: PointUpdateMessage;
    let missingPlayerUpdateMessageFixture: PointUpdateMessage;
    beforeEach(() => {
      playerFixture = [
        { id: 1, username: 'user1', avatar: '' },
        { id: 2, username: 'user2', avatar: '' },
        { id: 5, username: 'user5', avatar: '' },
      ];
      scoreBoardFixture = [
        {
          player: playerFixture[0],
          points: {},
          sum: 0,
        },
        {
          player: playerFixture[1],
          points: {},
          sum: 0,
        },
      ];
      pointUpdateMessageFixture = {
        message_type: '',
        point_type: PointType.CITIES,
        player: 2,
        value: 3,
      };
      missingPlayerUpdateMessageFixture = {
        message_type: '',
        point_type: PointType.CITIES,
        player: 7,
        value: 3,
      };
    });

    it('should not change a scoreboard if player does not match', () => {
      const originalScoreboard: ScoreBoard[] = JSON.parse(
        JSON.stringify(scoreBoardFixture)
      );

      service.updatePlayerScoreboard(
        missingPlayerUpdateMessageFixture,
        scoreBoardFixture
      );
      expect(scoreBoardFixture).toEqual(originalScoreboard);
    });

    it('should change a scoreboard if player matches', () => {
      const originalScoreboard: ScoreBoard[] = JSON.parse(
        JSON.stringify(scoreBoardFixture)
      );
      spyOn(scoreBoardFixture, 'sort').and.returnValue(scoreBoardFixture);

      service.updatePlayerScoreboard(
        pointUpdateMessageFixture,
        scoreBoardFixture
      );
      expect(scoreBoardFixture).not.toEqual(originalScoreboard);
    });

    it('should change value in scoreboard if player matches', () => {
      const originalScoreboard: ScoreBoard[] = JSON.parse(
        JSON.stringify(scoreBoardFixture)
      );
      spyOn(scoreBoardFixture, 'sort').and.returnValue(scoreBoardFixture);

      service.updatePlayerScoreboard(
        pointUpdateMessageFixture,
        scoreBoardFixture
      );
      expect(originalScoreboard[1].points.CITIES).not.toEqual(
        scoreBoardFixture[1].points.CITIES
      );
    });

    it('a scoreboard value should be equal to a changed value', () => {
      spyOn(scoreBoardFixture, 'sort').and.returnValue(scoreBoardFixture);
      service.updatePlayerScoreboard(
        pointUpdateMessageFixture,
        scoreBoardFixture
      );
      expect(scoreBoardFixture[1].points.CITIES).toBe(3);
    });
  });

  describe('updateWholePlayerScoreboard', () => {
    let scoreBoardFixture: ScoreBoard;
    let pointsUpdateMessageFixture: PointsUpdateMessage;
    beforeEach(() => {
      scoreBoardFixture = {
        player: { id: 1, avatar: '', username: 'user1' },
        points: {},
        sum: 0,
      };
      pointsUpdateMessageFixture = {
        message_type: '',
        points: [
          {
            game: 1,
            player: 1,
            type: PointType.CITIES,
            value: 3,
          },
          {
            game: 1,
            player: 1,
            type: PointType.COINS,
            value: 5,
          },
        ],
      };
    });

    it('player scoreboard should be changed if it is empty', () => {
      const originalScoreBoard: ScoreBoard = JSON.parse(
        JSON.stringify(scoreBoardFixture)
      );
      service.updateWholePlayerScoreboard(
        scoreBoardFixture,
        pointsUpdateMessageFixture
      );
      expect(originalScoreBoard).not.toEqual(scoreBoardFixture);
    });

    it('player scoreboard should be equal to expected values', () => {
      const originalScoreboard: ScoreBoard = JSON.parse(
        JSON.stringify(scoreBoardFixture)
      );
      originalScoreboard.points.CITIES = 3;
      originalScoreboard.points.COINS = 5;

      service.updateWholePlayerScoreboard(
        scoreBoardFixture,
        pointsUpdateMessageFixture
      );

      expect([
        originalScoreboard.points.CITIES,
        originalScoreboard.points.COINS,
      ]).toEqual([
        +scoreBoardFixture.points.CITIES,
        +scoreBoardFixture.points.COINS,
      ]);
    });
  });

  describe('updatePlayers method', () => {
    let removePlayersFromScoreboardSpy;
    let addPlayerToScoreboardSpy;
    let playersFixture: User[];
    let gameFixture: Game;
    beforeEach(() => {
      removePlayersFromScoreboardSpy = spyOn(
        service,
        'removePlayersFromScoreboard'
      );
      addPlayerToScoreboardSpy = spyOn(service, 'addPlayerToScoreboard');
      playersFixture = [
        { id: 1, username: 'user1', avatar: '' },
        { id: 2, username: 'user2', avatar: '' },
      ];

      gameFixture = {
        id: 1,
        players: playersFixture,
        created_at: new Date(),
        finished_at: null,
      };
    });

    const wrongParameters = [
      {
        gamewebSocket: undefined,
        game: {},
        scoreBoard: [],
        desc: 'no gameWebSocket provided',
      },
      {
        gamewebSocket: {},
        game: undefined,
        scoreBoard: [],
        desc: 'no game provided',
      },
      {
        gamewebSocket: {},
        game: {},
        scoreBoard: undefined,
        desc: 'no scoreboard provided',
      },
    ];

    for (const wrongParameter of wrongParameters) {
      it(`should complete an observable if ${wrongParameter.desc}`, (done) => {
        const { gamewebSocket, game, scoreBoard } = wrongParameter;
        const $result = service.updatePlayers(gamewebSocket, game, scoreBoard);

        $result.subscribe({
          complete: () => {
            expect(true).toBeTrue();
            done();
          },
        });
      });
    }

    it('should return an empty array if a game has not players', (done) => {
      gameFixture.players = [];
      const $result = service.updatePlayers(gameWebSocketMock, gameFixture, []);
      $result.subscribe({
        next: (scoreBoard: ScoreBoard[]) => {
          expect(scoreBoard).toEqual([]);
          done();
        },
      });
    });

    it('should call a removePlayersFromScoreboard if a game has players', (done) => {
      removePlayersFromScoreboardSpy.and.returnValue([]);
      addPlayerToScoreboardSpy.and.returnValue(of(true));
      const $result = service.updatePlayers(gameWebSocketMock, gameFixture, []);
      $result.subscribe({
        next: () => {
          expect(removePlayersFromScoreboardSpy).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should call an addPlayerToScoreboard if a game has a new player', (done) => {
      removePlayersFromScoreboardSpy.and.returnValue([]);
      addPlayerToScoreboardSpy.and.returnValue(of(true));
      const $result = service.updatePlayers(gameWebSocketMock, gameFixture, []);
      $result.subscribe({
        next: () => {
          expect(addPlayerToScoreboardSpy).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should call an addPlayerToScoreboard twice if a game has two new players', (done) => {
      removePlayersFromScoreboardSpy.and.returnValue([]);
      addPlayerToScoreboardSpy.and.returnValue(of(true));
      const $result = service.updatePlayers(gameWebSocketMock, gameFixture, []);
      $result.subscribe({
        next: () => {
          expect(addPlayerToScoreboardSpy).toHaveBeenCalledTimes(2);
          done();
        },
      });
    });
    it('should call an addPlayerToScoreboard with gameWebSocket, player and scoreboard params if a game has a new player', (done) => {
      removePlayersFromScoreboardSpy.and.returnValue([]);
      addPlayerToScoreboardSpy.and.returnValue(of(true));
      const player = gameFixture.players.slice(0, 1);
      gameFixture.players = player;
      const $result = service.updatePlayers(gameWebSocketMock, gameFixture, []);
      $result.subscribe({
        next: () => {
          expect(addPlayerToScoreboardSpy).toHaveBeenCalledWith(
            gameWebSocketMock,
            player[0],
            []
          );
          done();
        },
      });
    });

    it('should not call an addPlayerToScoreBoard if game has no new players', (done) => {
      const scoreboard = [{ player: playersFixture[0], points: {}, sum: 0 }];
      removePlayersFromScoreboardSpy.and.returnValue(scoreboard);
      gameFixture.players = gameFixture.players.slice(0, 1);
      const $result = service.updatePlayers(
        gameWebSocketMock,
        gameFixture,
        scoreboard
      );
      $result.subscribe({
        next: () => {
          expect(addPlayerToScoreboardSpy).toHaveBeenCalledTimes(0);
          done();
        },
      });
    });

    it('should return an original scoreboard if game has no new players', (done) => {
      const scoreboard = [{ player: playersFixture[0], points: {}, sum: 0 }];
      const originalScoreboard = JSON.parse(JSON.stringify(scoreboard));
      removePlayersFromScoreboardSpy.and.returnValue(scoreboard);
      gameFixture.players = gameFixture.players.slice(0, 1);
      const $result = service.updatePlayers(
        gameWebSocketMock,
        gameFixture,
        scoreboard
      );
      $result.subscribe({
        next: (sb: ScoreBoard[]) => {
          expect(sb).toEqual(originalScoreboard);
          done();
        },
      });
    });

    it('should return an array of one element if game has a new player', (done) => {
      removePlayersFromScoreboardSpy.and.returnValue([]);
      addPlayerToScoreboardSpy.and.callFake((gsocket, player, scoreboard) => {
        scoreboard.push({ player, points: {}, sum: 0 });
        return of(true);
      });
      gameFixture.players = gameFixture.players.slice(0, 1);
      const $result = service.updatePlayers(gameWebSocketMock, gameFixture, []);
      $result.subscribe({
        next: (scoreboard: ScoreBoard[]) => {
          expect(scoreboard.length).toBe(1);
          done();
        },
      });
    });

    it('should return an array of two elements if game has new two players', (done) => {
      removePlayersFromScoreboardSpy.and.returnValue([]);
      addPlayerToScoreboardSpy.and.callFake((gsocket, player, scoreboard) => {
        scoreboard.push({ player, points: {}, sum: 0 });
        return of(true);
      });
      const $result = service.updatePlayers(gameWebSocketMock, gameFixture, []);
      $result.subscribe({
        next: (scoreboard: ScoreBoard[]) => {
          expect(scoreboard.length).toBe(2);
          done();
        },
      });
    });

    it('should throw an error if an addplayerToScoreboard returns false', (done) => {
      removePlayersFromScoreboardSpy.and.returnValue([]);
      addPlayerToScoreboardSpy.and.returnValue(of(false));
      const $result = service.updatePlayers(gameWebSocketMock, gameFixture, []);
      $result.subscribe({
        error: (err) => {
          expect(err).not.toBeNull();
          done();
        },
      });
    });

    it('should return a value only once', (done) => {
      removePlayersFromScoreboardSpy.and.returnValue([]);
      addPlayerToScoreboardSpy.and.callFake((gsocket, player, scoreboard) => {
        scoreboard.push({ player, points: {}, sum: 0 });
        return of(true);
      });
      const messages = [];
      const $result = service.updatePlayers(gameWebSocketMock, gameFixture, []);
      $result.subscribe({
        next: (scoreboard: ScoreBoard[]) => {
          messages.push(scoreboard);
        },
        complete: () => {
          expect(messages.length).toBe(1);
          done();
        },
      });
    });
  });
});
