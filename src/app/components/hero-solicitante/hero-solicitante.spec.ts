import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroSolicitante } from './hero-solicitante';

describe('HeroSolicitante', () => {
  let component: HeroSolicitante;
  let fixture: ComponentFixture<HeroSolicitante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSolicitante]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroSolicitante);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
