import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineuploadComponent } from './offlineupload.component';

describe('OfflineuploadComponent', () => {
  let component: OfflineuploadComponent;
  let fixture: ComponentFixture<OfflineuploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfflineuploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfflineuploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
