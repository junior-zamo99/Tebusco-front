import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddresDialog } from './addres-dialog';

describe('AddresDialog', () => {
  let component: AddresDialog;
  let fixture: ComponentFixture<AddresDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddresDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddresDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
