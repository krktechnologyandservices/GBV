import { TestBed } from '@angular/core/testing';

import { SalarycomponentsService } from './salarycomponents.service';

describe('SalarycomponentsService', () => {
  let service: SalarycomponentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalarycomponentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
