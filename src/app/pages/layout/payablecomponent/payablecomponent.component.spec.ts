import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayablecomponentComponent } from './payablecomponent.component';

describe('PayablecomponentComponent', () => {
  let component: PayablecomponentComponent;
  let fixture: ComponentFixture<PayablecomponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayablecomponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayablecomponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
