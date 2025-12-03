import { TestBed } from '@angular/core/testing';

import { EmployeeNewService } from './employee-new.service';

describe('EmployeeNewService', () => {
  let service: EmployeeNewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeNewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
