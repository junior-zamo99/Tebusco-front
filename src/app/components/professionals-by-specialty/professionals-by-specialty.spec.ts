import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalsBySpecialty } from './professionals-by-specialty';

describe('ProfessionalsBySpecialty', () => {
  let component: ProfessionalsBySpecialty;
  let fixture: ComponentFixture<ProfessionalsBySpecialty>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalsBySpecialty]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionalsBySpecialty);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
