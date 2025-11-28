import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalHero } from './professional-hero';

describe('ProfessionalHero', () => {
  let component: ProfessionalHero;
  let fixture: ComponentFixture<ProfessionalHero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalHero]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionalHero);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
