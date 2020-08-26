import { AbstractControl } from '@angular/forms';

export interface GameControl {
  formControl: AbstractControl;
  placeholder: string;
  colorClass: string;
  pointType: number;
  imageUrl?: string;
}
