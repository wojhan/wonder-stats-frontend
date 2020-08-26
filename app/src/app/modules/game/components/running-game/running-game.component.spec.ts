/* tslint:disable:no-string-literal */
import { SimpleChanges } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { FontAwesomeTestingModule } from '@fortawesome/angular-fontawesome/testing';
import { of } from 'rxjs';

import { RunningGameComponent } from './running-game.component';
import { SharedModule } from '@wonder/shared/shared.module';
import { DOMHelper } from '../../../../../testing/dom-helper';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { GameFormControlComponent } from '@wonder/modules/game/components/game-form-control/game-form-control.component';
import { GameFormService } from '@wonder/modules/game/services/game-form.service';
import { GameService } from '@wonder/core/services/game.service';
import { Game } from '@wonder/core/models/Game';
import { GameWebSocket } from '@wonder/core/GameWebSocket';
import { PointsUpdateMessage } from '@wonder/core/models/websocket/PointsUpdateMessage';
import { PointType } from '@wonder/core/models/point-type';

const exampleGameFixture: Game = {
  id: 1,
  players: [],
  created_at: new Date(),
  finished_at: null,
};

const exampleSimpleChangesFixture: SimpleChanges = {
  currentGame: {
    previousValue: undefined,
    currentValue: exampleGameFixture,
    firstChange: true,
    isFirstChange: () => true,
  },
};

describe('RunningGameComponent', () => {
  let component: RunningGameComponent;
  let fixture: ComponentFixture<RunningGameComponent>;
  let gameFormServiceMock;
  let gameServiceMock;
  let gameWebSocketMock;
  beforeEach(async(() => {
    gameFormServiceMock = jasmine.createSpyObj('GameFormService', [
      'removeEquation',
    ]);
    gameServiceMock = jasmine.createSpyObj('GameService', [
      'initGame',
      'buildPointForm',
      'generateGameFormComponents',
      'recountTotal',
    ]);
    gameWebSocketMock = jasmine.createSpyObj('GameWebSocket', ['close']);
    TestBed.configureTestingModule({
      declarations: [RunningGameComponent, GameFormControlComponent],
      imports: [
        MatDialogModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        FontAwesomeTestingModule,
      ],
      providers: [{ provide: GameFormService, useValue: gameFormServiceMock }],
    }).compileComponents();
  }));

  beforeEach(() => {
    TestBed.overrideProvider(GameService, { useValue: gameServiceMock });
    const form = new FormGroup({ military: new FormControl(null) });
    gameServiceMock.buildPointForm.and.returnValue(form);
    gameServiceMock.generateGameFormComponents.and.returnValue([
      {
        formControl: form.get('military') as FormControl,
        placeholder: 'punkty za wojsko',
        colorClass: 'military',
        pointType: PointType.MILITARY,
      },
    ]);
    fixture = TestBed.createComponent(RunningGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('HTML elements', () => {
    let helper: DOMHelper<RunningGameComponent>;
    beforeEach(() => {
      helper = new DOMHelper(fixture);
    });
    it('should be a loading spinner if gameLoaded is false', () => {
      expect(helper.count('.lds-roller')).toBe(1);
    });

    it('should be no loading spinner if gameLoaded is true', () => {
      component.gameLoaded = true;
      component.form = new FormGroup({});
      component.gameComponents = [];
      fixture.detectChanges();
      expect(helper.count('.lds-roller')).toBe(0);
    });

    it('should be 2 form controls after initialization', () => {
      fixture.detectChanges();
      component.gameLoaded = true;
      fixture.detectChanges();
      expect(helper.count('.game-form-control')).toBe(2);
    });
  });

  describe('', () => {
    it('after ngOnInit should be a formGroup instance', () => {
      component.ngOnInit();
      expect(component.form).toBeTruthy();
    });

    it('after ngOnInit should be gameComponent containing one element', () => {
      component.ngOnInit();
      expect(component.gameComponents.length).toBe(1);
    });

    it('after ngOnInit should be game unloaded', () => {
      component.ngOnInit();
      expect(component.gameLoaded).toBeFalse();
    });

    it('after ngOnInit gameId should be undefined', () => {
      component.ngOnInit();
      expect(component['gameId']).toBeUndefined();
    });

    it('after ngOnChanges not containing a currentGame initGame should not be called', () => {
      spyOn<any>(component, 'initGame');
      component.ngOnChanges({});
      expect(component['initGame']).toHaveBeenCalledTimes(0);
    });

    it('after ngOnChanges containing a currentGame initGame should be called', () => {
      spyOn<any>(component, 'initGame');
      component.ngOnChanges(exampleSimpleChangesFixture);
      expect(component['initGame']).toHaveBeenCalled();
    });

    it('initGame should be called only once if ngOnChanges is called with the same game', () => {
      spyOn<any>(component, 'initGame');
      component.ngOnChanges(exampleSimpleChangesFixture);
      component.ngOnChanges(exampleSimpleChangesFixture);
      expect(component['initGame']).toHaveBeenCalledTimes(1);
    });

    it('initGame should be called as many times as ngOnChanges contains another game', () => {
      spyOn<any>(component, 'initGame');
      component.ngOnChanges(exampleSimpleChangesFixture);
      const newFixture = exampleSimpleChangesFixture;
      newFixture.currentGame.currentValue.id = 2;
      component.ngOnChanges(newFixture);
      expect(component['initGame']).toHaveBeenCalledTimes(2);
    });

    it('a form control should contain received value if available', () => {
      const pointMessage: PointsUpdateMessage = {
        points: [{ player: 1, value: 1, type: PointType.MILITARY, game: 1 }],
        message_type: 'points_update_message',
      };
      component.ngOnInit();
      fixture.detectChanges();
      spyOn<any>(component, 'onPointMessage').and.callThrough();
      spyOn<any>(component, 'initGame').and.callFake(() => {
        component['onPointMessage'](pointMessage);
      });

      component['initGame']();
      fixture.detectChanges();

      expect(component.form.get('military').value).toBe(1);
    });

    it('a form control should be null if no data received', () => {
      const pointMessage: PointsUpdateMessage = {
        points: [],
        message_type: 'points_update_message',
      };
      component.ngOnInit();
      fixture.detectChanges();
      spyOn<any>(component, 'onPointMessage').and.callThrough();
      spyOn<any>(component, 'initGame').and.callFake(() => {
        component['onPointMessage'](pointMessage);
      });

      component['initGame']();

      expect(component.form.get('military').value).toBe(null);
    });

    it('onPointMessage should be called only once', () => {
      spyOn<any>(component, 'onPointMessage');
      spyOn<any>(component, 'initGameWebSocket').and.returnValue(
        gameWebSocketMock
      );

      gameServiceMock.initGame.and.returnValue(of([]));
      component.user = { id: 1, avatar: '', username: 'user' };
      component.ngOnChanges(exampleSimpleChangesFixture);
      component.ngOnInit();
      fixture.detectChanges();

      expect(component['onPointMessage']).toHaveBeenCalledTimes(1);
    });

    it('', () => {
      const pointMessage: PointsUpdateMessage = {
        points: [{ player: 1, value: 1, type: PointType.MILITARY, game: 1 }],
        message_type: 'points_update_message',
      };
      component.ngOnInit();
      fixture.detectChanges();
      spyOn<any>(component, 'onPointMessage').and.callThrough();
      spyOn<any>(component, 'initGame').and.callFake(() => {
        component['onPointMessage'](pointMessage);
      });

      component['initGame']();

      expect(component.gameLoaded).toBeTrue();
    });
  });
});
