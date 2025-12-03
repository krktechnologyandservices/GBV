import { TestBed } from '@angular/core/testing';

import { OrgAttributesService } from './org-attributes.service';

describe('OrgAttributesService', () => {
  let service: OrgAttributesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrgAttributesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
