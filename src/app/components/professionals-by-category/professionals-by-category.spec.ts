import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalsByCategory } from './professionals-by-category';

describe('ProfessionalsByCategory', () => {
  let component: ProfessionalsByCategory;
  let fixture: ComponentFixture<ProfessionalsByCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalsByCategory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionalsByCategory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
