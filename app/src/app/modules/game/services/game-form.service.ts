import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { calculateControlValue } from '@wonder/core/utils';

@Injectable()
export class GameFormService {
  constructor() {}

  private static getEquation(value: string): string {
    if (value.includes('=')) {
      return value.slice(0, value.indexOf('='));
    }
    return value;
  }

  hasEquation = (value: string): boolean => value.includes('=');
  needsCalculate = (value: string): boolean => value.includes('+');

  transformToEquation(formControl: FormControl): void {
    const value = '' + formControl.value;

    if (this.hasEquation(value)) {
      const newValue = GameFormService.getEquation(value);
      this.updateFormControl(formControl, newValue);
    }
  }

  getPointValue(formControl: FormControl): number {
    const value = GameFormService.getEquation('' + formControl.value);

    if (this.needsCalculate(value)) {
      return calculateControlValue(value);
    }

    return +value;
  }

  removeEquation(formControl: FormControl): void {
    let value = '' + formControl.value;

    if (this.needsCalculate(value)) {
      if (this.hasEquation(value)) {
        value = GameFormService.getEquation(value);
      }
      const points = calculateControlValue(value);
      const newValue = `${value}=${points}`;

      this.updateFormControl(formControl, newValue);
    }
  }

  updateFormControl(
    formControl: FormControl,
    value: string | number,
    emitEvent: boolean = false
  ): void {
    formControl.setValue(
      value,
      !emitEvent
        ? { emitEvent: false, emitViewToModelChange: false }
        : undefined
    );
  }
}
