import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingformsComponent } from './bookingforms.component';

describe('BookingformsComponent', () => {
  let component: BookingformsComponent;
  let fixture: ComponentFixture<BookingformsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookingformsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingformsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
