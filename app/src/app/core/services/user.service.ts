import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from '../models/User';
import {environment} from '../../../environments/environment';

@Injectable()
export class UserService {
  apiUrl = `${environment.apiUrl}api/users/`;

  constructor(private http: HttpClient) { }

  list(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUser(userId: number): Observable<User> {
    return this.http.get<User>(this.apiUrl + userId + '/');
  }
}
