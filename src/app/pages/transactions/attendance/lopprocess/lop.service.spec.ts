import { TestBed } from '@angular/core/testing';

import { LopService } from './lop.service';

describe('LopService', () => {
  let service: LopService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LopService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
