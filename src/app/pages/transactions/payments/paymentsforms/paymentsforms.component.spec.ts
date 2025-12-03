import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsformsComponent } from './paymentsforms.component';

describe('PaymentsformsComponent', () => {
  let component: PaymentsformsComponent;
  let fixture: ComponentFixture<PaymentsformsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentsformsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentsformsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
