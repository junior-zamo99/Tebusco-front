import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroProfessional } from './hero-professional';

describe('HeroProfessional', () => {
  let component: HeroProfessional;
  let fixture: ComponentFixture<HeroProfessional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroProfessional]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroProfessional);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
