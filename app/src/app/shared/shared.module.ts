import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LdsRollerComponent } from './components/lds-roller/lds-roller.component';
import { SpinnerOverlayComponent } from './components/spinner-overlay/spinner-overlay.component';
import { SpinnerOverlayService } from '../core/services/spinner-overlay.service';
import { OverlayModule } from '@angular/cdk/overlay';

@NgModule({
  declarations: [LdsRollerComponent, SpinnerOverlayComponent],
  imports: [CommonModule],
  exports: [LdsRollerComponent, SpinnerOverlayComponent, OverlayModule],
  providers: [SpinnerOverlayService],
  entryComponents: [SpinnerOverlayComponent],
})
export class SharedModule {}
