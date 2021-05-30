import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataCleanComponent } from './data-clean.component';

describe('DataCleanComponent', () => {
  let component: DataCleanComponent;
  let fixture: ComponentFixture<DataCleanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataCleanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataCleanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
