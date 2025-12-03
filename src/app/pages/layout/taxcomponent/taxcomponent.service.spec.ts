import { TestBed } from '@angular/core/testing';

import { TaxcomponentService } from './taxcomponent.service';

describe('TaxcomponentService', () => {
  let service: TaxcomponentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaxcomponentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
