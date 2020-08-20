import { TestBed } from '@angular/core/testing';

import { GameFormService } from './game-form.service';
import { FormControl } from '@angular/forms';

describe('GameFormServiceService', () => {
  let service: GameFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameFormService],
    });
    service = TestBed.inject(GameFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('helper methods', () => {
    it('hasEquation should return true if has equal sign included', () => {
      expect(service.hasEquation('1+2=3')).toBeTrue();
    });

    it('hasEquation should return false if has not equal sign included', () => {
      expect(service.hasEquation('1+2')).toBeFalse();
    });
  });

  describe('transformToEquation method', () => {
    let formControl;
    beforeEach(() => {
      formControl = new FormControl();
    });

    it('should not call updateFormControl if no an equal sign is in control value', () => {
      formControl.setValue('1');
      spyOn(service, 'updateFormControl');
      service.transformToEquation(formControl);

      expect(service.updateFormControl).toHaveBeenCalledTimes(0);
    });

    it('should call updateFormControl if an equal sign is in control value', () => {
      formControl.setValue('1+2=3');
      spyOn(service, 'updateFormControl');
      service.transformToEquation(formControl);

      expect(service.updateFormControl).toHaveBeenCalledTimes(1);
    });

    it('should transform to equation if control value contains an equal sign', () => {
      formControl.setValue('1+2=3');
      spyOn(service, 'updateFormControl');
      service.transformToEquation(formControl);

      expect(service.updateFormControl).toHaveBeenCalledWith(
        formControl,
        '1+2'
      );
    });
  });

  describe('getPointValue method', () => {
    let formControl: FormControl;
    beforeEach(() => {
      formControl = new FormControl(null);
    });

    it('should return a control value if the value is an integer', () => {
      formControl.setValue(1);
      const result = service.getPointValue(formControl);
      expect(result).toBe(1);
    });

    it('should return a control value if the value is a string', () => {
      formControl.setValue('1');
      const result = service.getPointValue(formControl);
      expect(result).toBe(1);
    });

    it('should return a result of equation if contains a plus sign', () => {
      formControl.setValue('1+2');
      const result = service.getPointValue(formControl);
      expect(result).toBe(3);
    });

    it('should return a result of equation if contains an equal sign', () => {
      formControl.setValue('1+2=3');
      const result = service.getPointValue(formControl);
      expect(result).toBe(3);
    });
  });

  describe('removeEquation method', () => {
    let formControl: FormControl;
    beforeEach(() => {
      formControl = new FormControl(null);
    });

    it('should not call updateFormControl if a control value does not contain an equation', () => {
      formControl.setValue(1);
      spyOn(service, 'updateFormControl');
      service.removeEquation(formControl);

      expect(service.updateFormControl).toHaveBeenCalledTimes(0);
    });

    it('should call updateFormControl if a control value contains an equation', () => {
      formControl.setValue('1+2');
      spyOn(service, 'updateFormControl');
      service.removeEquation(formControl);

      expect(service.updateFormControl).toHaveBeenCalledTimes(1);
    });

    it('should call updateFormControl if a control value contains an equal sign', () => {
      formControl.setValue('1+2+3=6');
      spyOn(service, 'updateFormControl');
      service.removeEquation(formControl);

      expect(service.updateFormControl).toHaveBeenCalledTimes(1);
    });

    it('should call updateFormControl with result if a control value contains an expression', () => {
      formControl.setValue('1+2');
      spyOn(service, 'updateFormControl');
      service.removeEquation(formControl);

      expect(service.updateFormControl).toHaveBeenCalledWith(
        formControl,
        '1+2=3'
      );
    });

    it('should call updateFormControl with result if a control value contains an equal sign', () => {
      formControl.setValue('1+2=3');
      spyOn(service, 'updateFormControl');
      service.removeEquation(formControl);

      expect(service.updateFormControl).toHaveBeenCalledWith(
        formControl,
        '1+2=3'
      );
    });
  });

  describe('updateFormControl method', () => {
    let formControl: FormControl;
    let emitOptions;
    beforeEach(() => {
      formControl = new FormControl(null);

      emitOptions = { emitEvent: false, emitViewToModelChange: false };
    });

    it('should call formControl.setValue', () => {
      spyOn(formControl, 'setValue');
      service.updateFormControl(formControl, 1);

      expect(formControl.setValue).toHaveBeenCalled();
    });

    it('should call formControl.setValue without emit event when a passed value and not a emitEvent passed', () => {
      const value = 1;
      spyOn(formControl, 'setValue');
      service.updateFormControl(formControl, value);

      expect(formControl.setValue).toHaveBeenCalledWith(value, emitOptions);
    });

    it('should call formControl.setValue with emit event if emitEvent is true', () => {
      spyOn(formControl, 'setValue');
      service.updateFormControl(formControl, 1, true);

      expect(formControl.setValue).toHaveBeenCalledWith(1, undefined);
    });

    it('should call formControl.setValue without emit event if emitEvent is false', () => {
      spyOn(formControl, 'setValue');
      service.updateFormControl(formControl, 1, false);
      expect(formControl.setValue).toHaveBeenCalledWith(1, emitOptions);
    });
  });
});
