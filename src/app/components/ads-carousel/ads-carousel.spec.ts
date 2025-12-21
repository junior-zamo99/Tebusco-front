import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdsCarousel } from './ads-carousel';

describe('AdsCarousel', () => {
  let component: AdsCarousel;
  let fixture: ComponentFixture<AdsCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdsCarousel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdsCarousel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
