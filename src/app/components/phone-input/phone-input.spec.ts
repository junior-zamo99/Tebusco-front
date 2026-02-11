import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhoneInput } from './phone-input';

describe('PhoneInput', () => {
  let component: PhoneInput;
  let fixture: ComponentFixture<PhoneInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhoneInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
