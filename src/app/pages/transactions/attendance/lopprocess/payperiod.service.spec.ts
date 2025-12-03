import { TestBed } from '@angular/core/testing';

import { PayperiodService } from './payperiod.service';

describe('PayperiodService', () => {
  let service: PayperiodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayperiodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
