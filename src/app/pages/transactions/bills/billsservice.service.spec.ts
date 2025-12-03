import { TestBed } from '@angular/core/testing';

import { BillsserviceService } from './billsservice.service';

describe('BillsserviceService', () => {
  let service: BillsserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BillsserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
