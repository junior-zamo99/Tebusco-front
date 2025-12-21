import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeRequestApplicant } from './home-request-applicant';

describe('HomeRequestApplicant', () => {
  let component: HomeRequestApplicant;
  let fixture: ComponentFixture<HomeRequestApplicant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeRequestApplicant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeRequestApplicant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
