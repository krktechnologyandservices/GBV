import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatshboardComponent } from './datshboard.component';

describe('DatshboardComponent', () => {
  let component: DatshboardComponent;
  let fixture: ComponentFixture<DatshboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatshboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatshboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
