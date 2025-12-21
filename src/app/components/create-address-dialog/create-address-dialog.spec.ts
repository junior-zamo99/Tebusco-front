import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAddressDialog } from './create-address-dialog';

describe('CreateAddressDialog', () => {
  let component: CreateAddressDialog;
  let fixture: ComponentFixture<CreateAddressDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAddressDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAddressDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
