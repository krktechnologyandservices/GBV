import { TestBed } from '@angular/core/testing';

import { PaymentregisterService } from './paymentregister.service';

describe('PaymentregisterService', () => {
  let service: PaymentregisterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentregisterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
