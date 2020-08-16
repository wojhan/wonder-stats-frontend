import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-spinner-overlay',
  templateUrl: './spinner-overlay.component.html',
  styleUrls: ['./spinner-overlay.component.scss'],
})
export class SpinnerOverlayComponent implements OnChanges {
  @Input() public message: string;
  constructor() {}

  public ngOnChanges(changes: SimpleChanges): void {
    console.log(this.message);
  }
}
