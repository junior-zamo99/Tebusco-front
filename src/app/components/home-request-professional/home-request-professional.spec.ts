import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeRequestProfessional } from './home-request-professional';

describe('HomeRequestProfessional', () => {
  let component: HomeRequestProfessional;
  let fixture: ComponentFixture<HomeRequestProfessional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeRequestProfessional]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeRequestProfessional);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
