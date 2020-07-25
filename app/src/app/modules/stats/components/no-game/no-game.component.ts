import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-no-game',
  templateUrl: './no-game.component.html',
  styleUrls: ['./no-game.component.css']
})
export class NoGameComponent implements OnInit {
  @Output()
  gameCreated: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }

  createGame(): void {
    this.gameCreated.emit();
  }

}
