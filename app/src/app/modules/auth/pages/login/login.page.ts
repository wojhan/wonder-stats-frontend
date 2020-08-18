import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/User';
import { Router } from '@angular/router';

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
