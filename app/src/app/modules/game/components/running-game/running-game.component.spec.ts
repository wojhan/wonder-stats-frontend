import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunningGameComponent } from './running-game.component';

describe('RunningGameComponent', () => {
  let component: RunningGameComponent;
  let fixture: ComponentFixture<RunningGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RunningGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunningGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
