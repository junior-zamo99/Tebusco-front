import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingOffers } from './pending-offers';

describe('PendingOffers', () => {
  let component: PendingOffers;
  let fixture: ComponentFixture<PendingOffers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingOffers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingOffers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
