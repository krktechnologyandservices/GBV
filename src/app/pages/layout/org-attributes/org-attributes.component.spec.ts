import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgAttributesComponent } from './org-attributes.component';

describe('OrgAttributesComponent', () => {
  let component: OrgAttributesComponent;
  let fixture: ComponentFixture<OrgAttributesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgAttributesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
