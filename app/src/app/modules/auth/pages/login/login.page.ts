import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/User';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login-page',
  templateUrl: './login.page.html',
})
export class LoginPage implements OnInit {
  users: User[];
  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.userService.list().subscribe({
      next: (users: User[]) => {
        users.map((user) => {
          if (!user.avatar.includes('api/media')) {
            user.avatar = '/api/media/' + user.avatar;
          }
          if (!user.avatar.includes('http')) {
            user.avatar =
              environment.apiUrl.slice(0, environment.apiUrl.length - 1) +
              user.avatar;
          }
        });
        this.users = users;
      },
      error: (err) => {
        this.router.navigate(['/error']);
      },
    });
  }

  login(user: User): void {
    localStorage.setItem('user-id', '' + user.id);
    localStorage.setItem('user-name', user.username);
    this.router.navigate(['/game']);
  }
}
