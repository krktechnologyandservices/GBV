import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentregisterComponent } from './paymentregister.component';

describe('PaymentregisterComponent', () => {
  let component: PaymentregisterComponent;
  let fixture: ComponentFixture<PaymentregisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentregisterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentregisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
