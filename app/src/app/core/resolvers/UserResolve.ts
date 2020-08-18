import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { User } from '../models/User';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { UserService } from '../services/user.service';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserResolve implements Resolve<User> {
  constructor(private userService: UserService) {}
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<User> {
    return this.userService
      .getUser(+localStorage.getItem('user-id'))
      .pipe(catchError((err) => of(null)));
  }
}
