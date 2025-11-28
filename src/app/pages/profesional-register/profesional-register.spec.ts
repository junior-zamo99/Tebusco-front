import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesionalRegister } from './profesional-register';

describe('ProfesionalRegister', () => {
  let component: ProfesionalRegister;
  let fixture: ComponentFixture<ProfesionalRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesionalRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfesionalRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
