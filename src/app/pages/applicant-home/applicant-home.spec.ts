import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantHome } from './applicant-home';

describe('ApplicantHome', () => {
  let component: ApplicantHome;
  let fixture: ComponentFixture<ApplicantHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicantHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
