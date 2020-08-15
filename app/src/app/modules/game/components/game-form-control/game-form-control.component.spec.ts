import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameFormControlComponent } from './game-form-control.component';

describe('GameFormControlComponent', () => {
  let component: GameFormControlComponent;
  let fixture: ComponentFixture<GameFormControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameFormControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameFormControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
