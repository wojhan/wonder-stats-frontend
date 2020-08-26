import { Location } from '@angular/common';
import { SimpleChanges } from '@angular/core';
import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { of, throwError } from 'rxjs';

import { GameWebSocket } from '@wonder/core/GameWebSocket';
import { Game } from '@wonder/core/models/Game';
import { PointType } from '@wonder/core/models/point-type';
import { ScoreBoard } from '@wonder/core/models/ScoreBoard';
import { User } from '@wonder/core/models/User';
import { PointUpdateMessage } from '@wonder/core/models/websocket/PointUpdateMessage';
import { GameService } from '@wonder/core/services/game.service';
import { SpinnerOverlayService } from '@wonder/core/services/spinner-overlay.service';
import { SharedModule } from '@wonder/shared/shared.module';
import { GameStatsComponent } from './game-stats.component';
import { ErrorComponent } from '../../../../error.component';
import { DOMHelper } from '../../../../../testing/dom-helper';

describe('GameStatsComponent', () => {
  let component: GameStatsComponent;
  let fixture: ComponentFixture<GameStatsComponent>;

  let usersFixture: User[];
  let gameFixture: Game;
  let gameChangeFixture: SimpleChanges;
  let gameWebSocketMock;
  let spinnerServiceMock;
  let gameServiceMock;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GameStatsComponent],
      imports: [
        SharedModule,
        RouterTestingModule.withRoutes([
          {
            path: 'error',
            component: ErrorComponent,
          },
        ]),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    usersFixture = [
      { id: 1, avatar: '', username: 'user1' },
      { id: 2, avatar: '', username: 'user2' },
    ];

    gameFixture = {
      id: 1,
      players: usersFixture,
      created_at: new Date(),
      finished_at: null,
    };
    gameChangeFixture = {
      game: {
        currentValue: gameFixture,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true,
      },
    };
    gameServiceMock = jasmine.createSpyObj('GameService', [
      'removePlayersFromScoreboard',
      'updatePlayers',
      'updatePlayerScoreboard',
    ]);
    spinnerServiceMock = jasmine.createSpyObj(
      'SpinnerService',
      ['create', 'show', 'hide'],
      { shown: true }
    );
    gameWebSocketMock = jasmine.createSpyObj(
      'GameWebSocket',
      ['close', 'getPoints', 'finish'],
      {
        spinner: SpinnerOverlayService.create(),
      }
    );
    TestBed.overrideProvider(GameService, { useValue: gameServiceMock });
    fixture = TestBed.createComponent(GameStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('after ngOnChanges with game should be gameId equal to id of the passed game', () => {
    spyOn(component, 'initGameWebSocket').and.callFake(() => {
      component.gameWebSocket = gameWebSocketMock;
    });
    spyOn(component, 'updatePlayers');
    gameWebSocketMock.getPoints.and.returnValue(of());
    component.ngOnChanges(gameChangeFixture);
    expect(component.gameId).toBe(1);
  });

  it('after ngOnChanges with new game should be gameId updated', () => {
    spyOn(component, 'initGameWebSocket').and.callFake(() => {
      component.gameWebSocket = gameWebSocketMock;
    });
    spyOn(component, 'updatePlayers');
    gameWebSocketMock.getPoints.and.returnValue(of());
    component.ngOnChanges(gameChangeFixture);
    const newFixture = gameChangeFixture;
    newFixture.game.currentValue.id = 2;
    component.ngOnChanges(newFixture);
    expect(component.gameId).toBe(2);
  });

  const ngOnChangeWithoutGameConditions = [
    { method: 'initGameWebSocket' },
    { method: 'reloadGame' },
    { method: 'updatePlayers' },
  ];

  for (const el of ngOnChangeWithoutGameConditions) {
    it(`after ngOnchanges without game ${el.method} is not called`, () => {
      spyOn(component, el.method as any);
      component.ngOnChanges({});
      expect(component[el.method]).toHaveBeenCalledTimes(0);
    });
  }

  const ngOnChangeWithFirstGameConditions = [
    { method: 'initGameWebSocket', called: true },
    { method: 'reloadGame', called: false },
    { method: 'updatePlayers', called: true },
  ];

  for (const el of ngOnChangeWithFirstGameConditions) {
    it(`after ngOnChanges with first game passed ${el.method} ${
      el.called ? 'is called' : 'is not called'
    }`, () => {
      spyOn(component, 'updatePlayers');
      spyOn(component, 'reloadGame');
      spyOn(component, 'initGameWebSocket').and.callFake(() => {
        component.gameWebSocket = gameWebSocketMock;
      });
      gameWebSocketMock.getPoints.and.returnValue(of());
      component.ngOnChanges(gameChangeFixture);
      expect(component[el.method]).toHaveBeenCalledTimes(el.called ? 1 : 0);
    });
  }

  const callesWhenTheSameGame = [
    { method: 'initGameWebSocket', calledTimes: 1 },
    { method: 'reloadGame', calledTimes: 0 },
    { method: 'updatePlayers', calledTimes: 1 },
  ];

  for (const el of callesWhenTheSameGame) {
    it(`after ngOnChanges if two calls has the same game should call ${el.method} ${el.calledTimes} times`, () => {
      spyOn(component, 'initGameWebSocket');
      spyOn(component, 'reloadGame');
      spyOn(component, 'updatePlayers');
      component.ngOnChanges(gameChangeFixture);
      component.gameWebSocket = gameWebSocketMock;
      component.columns = [undefined, undefined];
      component.ngOnChanges(gameChangeFixture);

      expect(component[el.method]).toHaveBeenCalledTimes(el.calledTimes);
    });
  }

  const callesWhenTheSameGameWithDifferentPlayers = [
    { method: 'initGameWebSocket', calledTimes: 1 },
    { method: 'reloadGame', calledTimes: 0 },
    { method: 'updatePlayers', calledTimes: 2 },
  ];

  for (const el of callesWhenTheSameGameWithDifferentPlayers) {
    it(`after ngOnChanges if two calls has the same game (different player list) should call ${el.method} ${el.calledTimes} times`, () => {
      spyOn(component, 'initGameWebSocket');
      spyOn(component, 'reloadGame');
      spyOn(component, 'updatePlayers');
      component.ngOnChanges(gameChangeFixture);
      component.gameWebSocket = gameWebSocketMock;
      component.columns = [undefined, undefined];
      gameChangeFixture.game.currentValue.players = gameChangeFixture.game.currentValue.players.slice(
        0,
        1
      );
      component.ngOnChanges(gameChangeFixture);

      expect(component[el.method]).toHaveBeenCalledTimes(el.calledTimes);
    });
  }

  const callesWhenDifferentGames = [
    { method: 'initGameWebSocket', calledTimes: 2 },
    { method: 'reloadGame', calledTimes: 1 },
    { method: 'updatePlayers', calledTimes: 2 },
  ];

  for (const el of callesWhenDifferentGames) {
    it(`after ngOnChanges if two calls has different games should call ${el.method} ${el.calledTimes} times`, () => {
      spyOn(component, 'initGameWebSocket');
      spyOn(component, 'reloadGame').and.callFake(() => {
        component.initGameWebSocket();
      });
      spyOn(component, 'updatePlayers');
      component.ngOnChanges(gameChangeFixture);
      component.gameWebSocket = gameWebSocketMock;
      component.columns = [undefined, undefined];
      const differentChange: SimpleChanges = {
        game: gameChangeFixture.game,
      };
      differentChange.game.currentValue.id = 2;
      component.ngOnChanges(gameChangeFixture);

      expect(component[el.method]).toHaveBeenCalledTimes(el.calledTimes);
    });
  }

  describe('updatePlayers method', () => {
    it('updatingScoreboard should be true after call the method', () => {
      gameServiceMock.updatePlayers.and.returnValue(of());
      component.updatePlayers();
      expect(component.updatingScoreboard).toBeTrue();
    });

    it('updatingScoreboard should be false after received scoreboard info', fakeAsync(() => {
      gameServiceMock.updatePlayers.and.returnValue(of({}));
      component.updatePlayers();
      tick();
      expect(component.updatingScoreboard).toBeFalse();
    }));

    it('scoreboard should be updated after received scoreboard info', fakeAsync(() => {
      const scoreboardFixture: ScoreBoard[] = [
        {
          player: { id: 1, username: 'user1', avatar: '' },
          points: {},
          sum: 0,
        },
      ];
      gameServiceMock.updatePlayers.and.returnValue(of(scoreboardFixture));
      component.updatePlayers();
      tick();
      expect(component.columns).toEqual(scoreboardFixture);
    }));

    it('location should changed to /error if service throws an error', fakeAsync(() => {
      gameServiceMock.updatePlayers.and.returnValue(throwError(''));
      const location: Location = TestBed.inject(Location);
      fixture.ngZone.run(() => {
        component.updatePlayers();
        tick();
        fixture.whenStable().then(() => {
          expect(location.path()).toBe('/error?backUrl=%2Fmanage');
        });
      });
    }));
  });

  describe('onPointUpdate method', () => {
    let pointUpdateMessageFixture: PointUpdateMessage;
    beforeEach(() => {
      pointUpdateMessageFixture = {
        message_type: '',
        point_type: PointType.COINS,
        value: 1,
        player: 1,
      };
    });
    it('should call a gameservice.updatePlayerScoreboard', () => {
      component.onPointUpdate(pointUpdateMessageFixture);
      expect(component.gameService.updatePlayerScoreboard).toHaveBeenCalled();
    });

    it('should call a gameservice.updatePlayerScoreboard with point update message and current scoreboard', () => {
      component.columns = [];
      component.onPointUpdate(pointUpdateMessageFixture);
      expect(component.gameService.updatePlayerScoreboard).toHaveBeenCalledWith(
        pointUpdateMessageFixture,
        []
      );
    });
  });

  describe('finish method', () => {
    beforeEach(() => {
      component.gameWebSocket = gameWebSocketMock;
      component.game = gameFixture;
    });

    it('should set game to null if websocket has received a message', fakeAsync(() => {
      gameWebSocketMock.finish.and.returnValue(of({}));
      component.finish();
      tick();
      expect(component.game).toBeNull();
    }));

    it('should call gameWebSocket.close if websocket has received a message', fakeAsync(() => {
      gameWebSocketMock.finish.and.returnValue(of({}));
      component.finish();
      tick();
      expect(gameWebSocketMock.close).toHaveBeenCalled();
    }));

    it('should emit an endGame event if websocket has received a message', fakeAsync(() => {
      gameWebSocketMock.finish.and.returnValue(of({}));
      spyOn(component.endGame, 'emit');
      component.finish();
      tick();
      expect(component.endGame.emit).toHaveBeenCalled();
    }));

    it('should emit true by endGame event if websocket has received a message', fakeAsync(() => {
      gameWebSocketMock.finish.and.returnValue(of({}));
      spyOn(component.endGame, 'emit');
      component.finish();
      tick();
      expect(component.endGame.emit).toHaveBeenCalledWith(true);
    }));

    it('should change location to /error if websocket has thrown an error', fakeAsync(() => {
      gameWebSocketMock.finish.and.returnValue(throwError(''));
      const location: Location = TestBed.inject(Location);
      fixture.ngZone.run(() => {
        component.finish();
        tick();
        expect(location.path()).toBe('/error?backUrl=%2Fmanage');
      });
    }));
  });

  describe('HTML elements', () => {
    let helper: DOMHelper<GameStatsComponent>;
    beforeEach(() => {
      helper = new DOMHelper<GameStatsComponent>(fixture);
    });

    describe('when updatingScoreboard is true', () => {
      beforeEach(() => {
        component.updatingScoreboard = true;
        fixture.detectChanges();
      });

      it('should not display a table if updatingScoreboard is true', () => {
        const count = helper.count('.table');
        expect(count).toBe(0);
      });

      it('finish button should be disabled if updatingScoreboard is true', () => {
        const isDisabled = helper.isDisabled('.btn');
        expect(isDisabled).toBe(true);
      });

      it('should display .loading-scoreboard if updateScoreboard is true', () => {
        const count = helper.count('.loading-scoreboard');
        expect(count).toBe(1);
      });
    });

    describe('when updatingScoreboard is false', () => {
      it('should display a table if at least one entry in scoreboard', () => {
        component.columns = [
          {
            player: { id: 1, avatar: '', username: 'user' },
            points: {},
            sum: 0,
          },
        ];
        fixture.detectChanges();
        const count = helper.count('.table');
        expect(count).toBe(1);
      });

      it('should not display a table if no entries in scoreboard', () => {
        const count = helper.count('.table');
        expect(count).toBe(0);
      });

      it('should display .loading-scoreboard if columns is undefined', () => {
        const count = helper.count('.loading-scoreboard');
        expect(count).toBe(1);
      });

      it('should not display .loading-scoreboard if columns are not undefined', () => {
        component.columns = [];
        fixture.detectChanges();
        const count = helper.count('.loading-scoreboard');
        expect(count).toBe(0);
      });

      it('should display .waiting-for-players if columns is not undefined and no entries in scoreboard', () => {
        component.columns = [];
        fixture.detectChanges();
        const count = helper.count('.waiting-for-players');
        expect(count).toBe(1);
      });

      it('should not display .waiting-for-players if columns is undefined', () => {
        const count = helper.count('.waiting-for-players');
        expect(count).toBe(0);
      });
    });
  });
});
