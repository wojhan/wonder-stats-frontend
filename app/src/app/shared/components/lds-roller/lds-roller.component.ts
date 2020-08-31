import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-lds-roller',
  templateUrl: './lds-roller.component.html',
  styleUrls: ['./lds-roller.component.css'],
})
export class LdsRollerComponent implements OnInit {
  @Input() dark = false;

  classes = ['lds-roller'];
  constructor() {}

  ngOnInit(): void {
    if (this.dark) {
      this.classes.push('dark-spinner');
    }
  }
}
