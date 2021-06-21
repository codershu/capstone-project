import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataCleanNewComponent } from './data-clean-new.component';

describe('DataCleanNewComponent', () => {
  let component: DataCleanNewComponent;
  let fixture: ComponentFixture<DataCleanNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataCleanNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataCleanNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
