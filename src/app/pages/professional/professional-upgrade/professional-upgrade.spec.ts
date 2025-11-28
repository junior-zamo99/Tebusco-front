import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalUpgrade } from './professional-upgrade';

describe('ProfessionalUpgrade', () => {
  let component: ProfessionalUpgrade;
  let fixture: ComponentFixture<ProfessionalUpgrade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalUpgrade]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionalUpgrade);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
