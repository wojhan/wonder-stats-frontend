import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { SpinnerOverlayComponent } from '../../shared/components/spinner-overlay/spinner-overlay.component';

@Injectable()
export class SpinnerOverlayService {
  static instance;

  shown = false;

  private overlayRef: OverlayRef = null;

  constructor(private overlay: Overlay) {
    SpinnerOverlayService.instance = this;
    console.log('test');
  }

  public show(message = '') {
    // Returns an OverlayRef (which is a PortalHost)

    if (this.shown) {
      return;
    }

    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create();
    }

    // Create ComponentPortal that can be attached to a PortalHost
    const spinnerOverlayPortal = new ComponentPortal(SpinnerOverlayComponent);
    const component = this.overlayRef.attach(spinnerOverlayPortal); // Attach ComponentPortal to PortalHost
    component.instance.message = message;
    this.shown = true;
  }

  public hide() {
    if (!this.shown) {
      return;
    }
    this.shown = false;
    if (!!this.overlayRef) {
      this.overlayRef.detach();
    }
  }
}
