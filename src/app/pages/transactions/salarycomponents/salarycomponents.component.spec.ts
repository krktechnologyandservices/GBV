import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalarycomponentsComponent } from './salarycomponents.component';

describe('SalarycomponentsComponent', () => {
  let component: SalarycomponentsComponent;
  let fixture: ComponentFixture<SalarycomponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalarycomponentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalarycomponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
