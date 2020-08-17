import {
  Component,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

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
  implements ControlValueAccessor, OnChanges {
  @Input()
  formControl: FormControl;

  @Input()
  placeholder: string;

  @Input()
  imageUrl: string;

  @Input()
  color: string;

  @Output()
  blur: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  focus: EventEmitter<string> = new EventEmitter<string>();

  input: string;

  inputGroupClasses: string[] = ['input-group-text'];
  classes: string[] = ['form-control'];

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.color) {
      this.classes = ['form-control'];

      this.inputGroupClasses.push(this.color);
      this.classes.push(this.color);
    }
  }

  onChange: any = () => {};

  onTouch: any = (s) => {};

  onBlur(): void {
    this.blur.emit(this.formControl.value);
  }

  onFocus(): void {
    this.focus.emit(this.formControl.value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  writeValue(input: string): void {
    this.input = input;
  }
}
