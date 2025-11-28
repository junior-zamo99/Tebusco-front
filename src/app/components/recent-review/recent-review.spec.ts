import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentReview } from './recent-review';

describe('RecentReview', () => {
  let component: RecentReview;
  let fixture: ComponentFixture<RecentReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentReview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentReview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
