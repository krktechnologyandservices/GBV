import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LopprocessComponent } from './lopprocess.component';

describe('LopprocessComponent', () => {
  let component: LopprocessComponent;
  let fixture: ComponentFixture<LopprocessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LopprocessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LopprocessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
