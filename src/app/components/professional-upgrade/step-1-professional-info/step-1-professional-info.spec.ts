import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Step1ProfessionalInfo } from './step-1-professional-info';

describe('Step1ProfessionalInfo', () => {
  let component: Step1ProfessionalInfo;
  let fixture: ComponentFixture<Step1ProfessionalInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Step1ProfessionalInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Step1ProfessionalInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
