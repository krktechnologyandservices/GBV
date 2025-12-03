import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflinepaymentmodalComponent } from './offlinepaymentmodal.component';

describe('OfflinepaymentmodalComponent', () => {
  let component: OfflinepaymentmodalComponent;
  let fixture: ComponentFixture<OfflinepaymentmodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfflinepaymentmodalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfflinepaymentmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
