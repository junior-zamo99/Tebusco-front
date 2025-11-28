import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalCta } from './professional-cta';

describe('ProfessionalCta', () => {
  let component: ProfessionalCta;
  let fixture: ComponentFixture<ProfessionalCta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalCta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionalCta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
