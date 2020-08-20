import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { User } from '../models/User';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { UserService } from '../services/user.service';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { WebsocketService } from '../services/websocket.service';

@Injectable({ providedIn: 'root' })
export class UserResolve implements Resolve<User> {
  constructor(private userService: UserService) {}
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<User> {
    return this.userService.getUser(+localStorage.getItem('user-id')).pipe(
      map((user) => {
        if (user) {
          if (!user.avatar.includes('api/media')) {
            user.avatar = '/api/media/' + user.avatar;
          }
          if (!user.avatar.includes('http')) {
            user.avatar =
              environment.apiUrl.slice(0, environment.apiUrl.length - 1) +
              user.avatar;
          }
          WebsocketService.action(user.id);
          return user;
        }
      }),

      catchError((err) => of(null))
    );
  }
}
