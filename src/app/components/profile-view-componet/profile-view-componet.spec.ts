import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileViewComponet } from './profile-view-componet';

describe('ProfileViewComponet', () => {
  let component: ProfileViewComponet;
  let fixture: ComponentFixture<ProfileViewComponet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileViewComponet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileViewComponet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
