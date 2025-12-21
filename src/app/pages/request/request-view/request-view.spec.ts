import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestView } from './request-view';

describe('RequestView', () => {
  let component: RequestView;
  let fixture: ComponentFixture<RequestView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
