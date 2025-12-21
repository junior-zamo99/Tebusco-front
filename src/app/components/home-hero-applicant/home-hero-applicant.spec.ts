import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeHeroApplicant } from './home-hero-applicant';

describe('HomeHeroApplicant', () => {
  let component: HomeHeroApplicant;
  let fixture: ComponentFixture<HomeHeroApplicant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeHeroApplicant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeHeroApplicant);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
