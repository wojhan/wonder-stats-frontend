import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { User } from '../../../../core/models/User';
import { UserService } from '../../../../core/services/user.service';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Game } from '../../../../core/models/Game';
import {
  faArrowLeft,
  faSignOutAlt,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.css'],
})
export class UserHeaderComponent implements OnInit, OnChanges {
  @Input()
  game: Game;

  @Input()
  user: User;

  @Output()
  leave: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input()
  inGame: boolean;

  faSignOutAlt: IconDefinition = faSignOutAlt;
  faArrowLeft: IconDefinition = faArrowLeft;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {}

  ngOnChanges(): void {}

  onLeave(): void {
    this.leave.emit(true);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/auth', 'login']);
  }
}
