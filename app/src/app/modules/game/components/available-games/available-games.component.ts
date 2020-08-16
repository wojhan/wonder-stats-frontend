import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subscription } from 'rxjs';
import { Game } from '../../../../core/models/Game';
import { environment } from '../../../../../environments/environment';
import { IconDefinition, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-available-games',
  templateUrl: './available-games.component.html',
  styleUrls: ['./available-games.component.css'],
})
export class AvailableGamesComponent {
  @Input()
  currentGame: Game;

  @Output()
  joinClick: EventEmitter<number> = new EventEmitter<number>();

  faSignInAlt: IconDefinition = faSignInAlt;

  constructor() {}

  join(): void {
    if (this.currentGame) {
      this.joinClick.emit(this.currentGame.id);
    }
  }
}
