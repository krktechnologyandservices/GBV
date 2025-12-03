import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkingReasonsComponent } from './working-reasons.component';

describe('WorkingReasonsComponent', () => {
  let component: WorkingReasonsComponent;
  let fixture: ComponentFixture<WorkingReasonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkingReasonsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkingReasonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
