import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GracePeriodsComponent } from './grace-periods.component';

describe('GracePeriodsComponent', () => {
  let component: GracePeriodsComponent;
  let fixture: ComponentFixture<GracePeriodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GracePeriodsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GracePeriodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
