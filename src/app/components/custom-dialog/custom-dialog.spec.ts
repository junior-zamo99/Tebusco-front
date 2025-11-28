import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDialog } from './custom-dialog';

describe('CustomDialog', () => {
  let component: CustomDialog;
  let fixture: ComponentFixture<CustomDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
