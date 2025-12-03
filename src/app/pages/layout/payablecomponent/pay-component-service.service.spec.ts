import { TestBed } from '@angular/core/testing';

import { PayComponentServiceService } from './pay-component-service.service';

describe('PayComponentServiceService', () => {
  let service: PayComponentServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayComponentServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
