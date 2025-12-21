import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestApplicant } from './request-applicant';

describe('RequestApplicant', () => {
  let component: RequestApplicant;
  let fixture: ComponentFixture<RequestApplicant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestApplicant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestApplicant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
