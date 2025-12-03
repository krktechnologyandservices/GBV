import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxcomponentComponent } from './taxcomponent.component';

describe('TaxcomponentComponent', () => {
  let component: TaxcomponentComponent;
  let fixture: ComponentFixture<TaxcomponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxcomponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxcomponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
