import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { defer, interval, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class WebsocketService {
  public static instance: WebsocketService;
  public static routerInstance: Router;

  public static userActions = {};

  constructor(public router: Router) {
    WebsocketService.instance = this;
    WebsocketService.routerInstance = router;
  }

  public static action(userId: number): void {
    this.userActions[userId] = new Date();
  }

  public static getActivity(): Observable<any> {
    console.log(this.userActions);
    return interval(5000).pipe(
      switchMap(() => of(this.userActions)),
      map((userActions) => {
        const keys = Object.keys(userActions);
        const now = new Date();
        const values = {};
        keys.forEach((key) => {
          values[key] = now.valueOf() - userActions[key].valueOf() < 120000;
        });
        return values;
      })
    );
  }
}
