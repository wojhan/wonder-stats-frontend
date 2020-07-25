import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoGameComponent } from './no-game.component';

describe('NoGameComponent', () => {
  let component: NoGameComponent;
  let fixture: ComponentFixture<NoGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
