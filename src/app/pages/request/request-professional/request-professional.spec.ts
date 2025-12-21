import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestProfessional } from './request-professional';

describe('RequestProfessional', () => {
  let component: RequestProfessional;
  let fixture: ComponentFixture<RequestProfessional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestProfessional]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestProfessional);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
