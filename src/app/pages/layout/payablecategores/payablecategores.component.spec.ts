import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayablecategoresComponent } from './payablecategores.component';

describe('PayablecategoresComponent', () => {
  let component: PayablecategoresComponent;
  let fixture: ComponentFixture<PayablecategoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayablecategoresComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayablecategoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
