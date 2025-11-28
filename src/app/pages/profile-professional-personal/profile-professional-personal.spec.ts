import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileProfessionalPersonal } from './profile-professional-personal';

describe('ProfileProfessionalPersonal', () => {
  let component: ProfileProfessionalPersonal;
  let fixture: ComponentFixture<ProfileProfessionalPersonal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileProfessionalPersonal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileProfessionalPersonal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
