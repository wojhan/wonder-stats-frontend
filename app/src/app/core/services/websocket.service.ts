import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class WebsocketService {
  public static instance: WebsocketService;
  public static routerInstance: Router;

  constructor(public router: Router) {
    WebsocketService.instance = this;
    WebsocketService.routerInstance = router;
  }
}
