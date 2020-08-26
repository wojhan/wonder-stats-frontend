import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

import { of, Subscription } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

import { GameFormService } from '@wonder/modules/game/services/game-form.service';
import { PointUpdate } from '@wonder/core/models/PointUpdate';
import { PointType } from '@wonder/core/models/point-type';

@Component({
  selector: 'app-game-form-control',
  templateUrl: './game-form-control.component.html',
  styleUrls: ['./game-form-control.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GameFormControlComponent),
      multi: true,
    },
  ],
})
export class GameFormControlComponent
  implements ControlValueAccessor, OnChanges, OnDestroy {
  @Input() formControl: FormControl;
  @Input() placeholder: string;
  @Input() imageUrl: string;
  @Input() color: string;
  @Input() pointType: PointType;

  @Output()
  pointUpdate: EventEmitter<PointUpdate> = new EventEmitter();

  private debounceTime = 500;
  private formControlSubscription: Subscription;
  private oldValue: string;

  public input: string;
  public inputGroupClasses: string[] = ['input-group-text'];
  public classes: string[] = ['form-control'];
  public onChange: any = () => {};
  public onTouch: any = (s) => {};

  constructor(private gameFormService: GameFormService) {}

  ngOnChanges(changes: SimpleChanges): void {
    const formControlChange = changes.formControl;
    if (formControlChange) {
      this.oldValue = '' + this.formControl.value;
      this.formControlSubscription = this.formControl.valueChanges
        .pipe(
          debounceTime(this.debounceTime),
          switchMap((value) => {
            this.onFormValueChange(value, 'change');
            return of(value);
          })
        )
        .subscribe();
    }

    if (this.color) {
      this.classes = ['form-control'];

      this.inputGroupClasses.push(this.color);
      this.classes.push(this.color);
    }
  }

  ngOnDestroy(): void {
    this.clearSubscriptions();
  }

  private clearSubscriptions(): void {
    if (this.formControlSubscription) {
      this.formControlSubscription.unsubscribe();
    }
  }

  private onFormValueChange(
    value: string,
    changeEvent: 'change' | 'blur'
  ): void {
    value = '' + value;

    if (changeEvent === 'blur') {
      this.gameFormService.removeEquation(this.formControl);
    }

    if (value === this.oldValue) {
      return;
    }

    if (
      changeEvent === 'change' &&
      (this.gameFormService.hasEquation(value) ||
        this.gameFormService.needsCalculate(value))
    ) {
      return;
    }

    this.oldValue = value;

    this.pointUpdate.emit({
      type: this.pointType,
      value: this.gameFormService.getPointValue(this.formControl),
    });
  }

  public onBlur(): void {
    this.onFormValueChange(this.formControl.value, 'blur');
  }

  public onFocus(): void {
    this.gameFormService.transformToEquation(this.formControl);
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  public registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  public writeValue(input: string): void {
    this.input = input;
  }
}
