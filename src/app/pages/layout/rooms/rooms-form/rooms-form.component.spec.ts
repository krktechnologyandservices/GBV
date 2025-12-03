import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomFormComponent } from './rooms-form.component';

describe('RoomsFormComponent', () => {
  let component: RoomFormComponent;
  let fixture: ComponentFixture<RoomFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoomFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
