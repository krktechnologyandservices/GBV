import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayslipviewComponent } from './payslipview.component';

describe('PayslipviewComponent', () => {
  let component: PayslipviewComponent;
  let fixture: ComponentFixture<PayslipviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayslipviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayslipviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
