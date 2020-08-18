import { Component } from '@angular/core';
import { SpinnerOverlayService } from './core/services/spinner-overlay.service';
import { WebsocketService } from './core/services/websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'wonder-stats-frontend';

  constructor(
    private spinner: SpinnerOverlayService,
    private websocketService: WebsocketService
  ) {}
}
