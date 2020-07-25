import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsPage } from './stats.page';

describe('StatsComponent', () => {
  let component: StatsPage;
  let fixture: ComponentFixture<StatsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatsPage ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
