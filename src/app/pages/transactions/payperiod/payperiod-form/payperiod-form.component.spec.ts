import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayperiodFormComponent } from './payperiod-form.component';

describe('PayperiodFormComponent', () => {
  let component: PayperiodFormComponent;
  let fixture: ComponentFixture<PayperiodFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayperiodFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayperiodFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
