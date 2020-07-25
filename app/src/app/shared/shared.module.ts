import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LdsRollerComponent } from './components/lds-roller/lds-roller.component';



@NgModule({
  declarations: [LdsRollerComponent],
  imports: [
    CommonModule
  ],
  exports: [LdsRollerComponent]
})
export class SharedModule { }
