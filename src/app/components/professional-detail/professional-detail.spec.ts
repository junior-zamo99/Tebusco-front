import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalDetail } from './professional-detail';

describe('ProfessionalDetail', () => {
  let component: ProfessionalDetail;
  let fixture: ComponentFixture<ProfessionalDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionalDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
