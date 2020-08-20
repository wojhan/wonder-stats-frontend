import {
  async,
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { GameFormControlComponent } from './game-form-control.component';
import { DOMHelper } from '../../../../../testing/dom-helper';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameFormService } from '@wonder/modules/game/services/game-form.service';
import { calculateControlValue } from '@wonder/core/utils';
import { SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';

describe('GameFormControlComponent', () => {
  let component: GameFormControlComponent;
  let fixture: ComponentFixture<GameFormControlComponent>;
  let helper: DOMHelper<GameFormControlComponent>;
  let gameFormComponentMock;

  beforeEach(async(() => {
    gameFormComponentMock = jasmine.createSpyObj('GameFormService', [
      'transformToEquation',
      'removeEquation',
      'getPointValue',
      'hasEquation',
      'needsCalculate',
    ]);
    TestBed.configureTestingModule({
      declarations: [GameFormControlComponent],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        { provide: GameFormService, useValue: gameFormComponentMock },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameFormControlComponent);
    component = fixture.componentInstance;
    helper = new DOMHelper<GameFormControlComponent>(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('HTML elements', () => {
    beforeEach(() => {});

    it('should not have an image if image url has not been provided', () => {
      expect(helper.count('img')).toBe(0);
    });

    it('should have an image if image url has been provided', () => {
      component.imageUrl = 'url';
      fixture.detectChanges();
      expect(helper.count('img')).toBe(1);
    });

    it('should have be an one input field', () => {
      expect(helper.count('input')).toBe(1);
    });

    it('input should contain an empty placeholder if not provided', () => {
      expect(helper.getPlaceholder('input')).toBe('');
    });

    it('input should contain a placeholder if provided', () => {
      const placeholder = 'placeholder';
      component.placeholder = placeholder;
      fixture.detectChanges();
      expect(helper.getPlaceholder('input')).toBe(placeholder);
    });
  });

  describe('Form control', () => {
    beforeEach(() => {
      component.formControl = new FormControl(null);
      gameFormComponentMock.removeEquation.and.callFake((fc: FormControl) => {
        fc.setValue(`${fc.value}=${calculateControlValue('' + fc.value)}`, {
          emitEvent: false,
          emitViewToModelChange: false,
        });
      });
      gameFormComponentMock.getPointValue.and.returnValue(3);
      gameFormComponentMock.transformToEquation.and.callFake(
        (fc: FormControl) => {
          if (fc.value) {
            fc.setValue(fc.value.slice(0, fc.value.indexOf('=')), {
              emitEvent: false,
              emitViewToModelChange: false,
            });
          }
        }
      );
      const sc: SimpleChanges = {
        formControl: {
          previousValue: undefined,
          currentValue: new FormControl(null),
          firstChange: true,
          isFirstChange: () => true,
        },
      };
      component.ngOnChanges(sc);
      fixture.detectChanges();
    });

    describe('blur events', () => {
      it('an input value should be converted to formula when equation is in it on blur', () => {
        const value = '1+2';
        component.formControl.setValue(value);
        component.onBlur();
        fixture.detectChanges();
        expect(component.formControl.value).toBe('1+2=3');
      });

      it('emit PointUpdate event on blur if a control has an equation', fakeAsync(() => {
        const value = [];
        gameFormComponentMock.hasEquation.and.returnValue(true);
        gameFormComponentMock.needsCalculate.and.returnValue(true);

        component.pointUpdate.subscribe((d) => {
          value.push(d);
        });

        component.formControl.setValue('1+2');
        component.onBlur();
        tick(500);
        fixture.detectChanges();
        expect(value.length).toBe(1);
      }));

      it('emit PointUpdate event on blur after on change event only once if a control value is the same', fakeAsync(() => {
        const value = [];
        gameFormComponentMock.hasEquation.and.returnValue(false);
        gameFormComponentMock.needsCalculate.and.returnValue(false);

        component.pointUpdate.subscribe((d) => {
          value.push(d);
        });

        component.formControl.setValue(1);
        tick(500);
        component.onBlur();
        tick(500);
        fixture.detectChanges();
        expect(value.length).toBe(1);
      }));
    });

    describe('change events', () => {
      it('emit pointUpdate event when number provided', fakeAsync(() => {
        let value;
        gameFormComponentMock.hasEquation.and.returnValue(false);
        gameFormComponentMock.needsCalculate.and.returnValue(false);

        component.pointUpdate.subscribe((d) => {
          value = d;
        });
        component.formControl.setValue(1);
        fixture.detectChanges();
        tick(500);
        expect(value).toBeTruthy();
      }));

      it('emit only one pointUpdate event when value does not change', fakeAsync(() => {
        const value = [];
        gameFormComponentMock.hasEquation.and.returnValue(false);
        gameFormComponentMock.needsCalculate.and.returnValue(false);

        component.pointUpdate.subscribe((d) => {
          value.push(d);
        });
        component.formControl.setValue(1);
        tick(500);
        component.formControl.setValue(1);
        fixture.detectChanges();
        tick(500);
        expect(value.length).toBe(1);
      }));

      it('emit two pointUpdate events when value changes', fakeAsync(() => {
        const value = [];
        gameFormComponentMock.hasEquation.and.returnValue(false);
        gameFormComponentMock.needsCalculate.and.returnValue(false);

        component.pointUpdate.subscribe((d) => {
          value.push(d);
        });
        component.formControl.setValue(1);
        tick(500);
        component.formControl.setValue(2);
        tick(500);
        fixture.detectChanges();
        expect(value.length).toBe(2);
      }));

      it('do not emit PointUpdate event on change if a control has an equation', fakeAsync(() => {
        const value = [];
        gameFormComponentMock.hasEquation.and.returnValue(true);
        gameFormComponentMock.needsCalculate.and.returnValue(true);

        component.pointUpdate.subscribe((d) => {
          value.push(d);
        });

        component.formControl.setValue('1+2');
        tick(500);
        fixture.detectChanges();
        expect(value.length).toBe(0);
      }));

      it('emit only one pointUpdate when value changes in debounce time', fakeAsync(() => {
        const value = [];
        gameFormComponentMock.hasEquation.and.returnValue(false);
        gameFormComponentMock.needsCalculate.and.returnValue(false);

        component.pointUpdate.subscribe((d) => {
          value.push(d);
        });

        component.formControl.setValue(1);
        tick(300);
        component.formControl.setValue(2);
        tick(500);

        expect(value.length).toBe(1);
      }));

      it('emit only one pointUpdate (the last value) when value changes in debounce time', fakeAsync(() => {
        const value = [];
        gameFormComponentMock.hasEquation.and.returnValue(false);
        gameFormComponentMock.needsCalculate.and.returnValue(false);

        component.pointUpdate.subscribe((d) => {
          value.push(d);
        });

        component.formControl.setValue(1);
        gameFormComponentMock.getPointValue.and.returnValue(1);
        tick(300);
        component.formControl.setValue(2);
        gameFormComponentMock.getPointValue.and.returnValue(2);
        tick(500);

        expect(value[0].value).toBe(2);
      }));

      it('emit only one pointUpdate when value changes in debounce time and input has been blurred', fakeAsync(() => {
        const value = [];
        gameFormComponentMock.hasEquation.and.returnValue(false);
        gameFormComponentMock.needsCalculate.and.returnValue(false);

        component.pointUpdate.subscribe((d) => {
          value.push(d);
        });

        component.formControl.setValue(1);
        tick(200);
        component.formControl.setValue(2);
        tick(20);
        component.onBlur();
        discardPeriodicTasks();
        expect(value.length).toBe(1);
      }));
    });

    it('an input value should be empty after focus if the input value was empty', () => {
      component.onFocus();
      expect(helper.getValue('input')).toBe('');
    });

    it('an input value should not be converted to formula on change', () => {
      const value = '1+2';
      component.formControl.setValue(value);
      fixture.detectChanges();
      expect(component.formControl.value).toBe(value);
    });

    it('an input value should be converted to equation on focus', () => {
      const value = '1+2=3';
      component.formControl.setValue(value);
      component.onFocus();
      fixture.detectChanges();
      expect(component.formControl.value).toBe('1+2');
    });
  });

  describe('hooks', () => {
    it('should be a subscription after initialization with formControl', () => {
      const sc: SimpleChanges = {
        formControl: {
          previousValue: undefined,
          currentValue: new FormControl(null),
          firstChange: true,
          isFirstChange: () => true,
        },
      };
      component.formControl = new FormControl();
      component.ngOnChanges(sc);
      fixture.detectChanges();

      const subject: Subject<any> = component.formControl
        .valueChanges as Subject<any>;

      expect(subject.observers.length).toBe(1);
    });

    it('should be no subscription after destroy', () => {
      const sc: SimpleChanges = {
        formControl: {
          previousValue: undefined,
          currentValue: new FormControl(null),
          firstChange: true,
          isFirstChange: () => true,
        },
      };
      component.formControl = new FormControl();
      component.ngOnChanges(sc);
      fixture.detectChanges();
      component.ngOnDestroy();

      const subject: Subject<any> = component.formControl
        .valueChanges as Subject<any>;

      expect(subject.observers.length).toBe(0);
    });
  });
});
