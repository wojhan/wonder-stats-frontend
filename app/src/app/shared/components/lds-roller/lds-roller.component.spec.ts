import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LdsRollerComponent } from './lds-roller.component';

describe('LdsRollerComponent', () => {
  let component: LdsRollerComponent;
  let fixture: ComponentFixture<LdsRollerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LdsRollerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LdsRollerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
