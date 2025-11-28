import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Step2Documents } from './step-2-documents';

describe('Step2Documents', () => {
  let component: Step2Documents;
  let fixture: ComponentFixture<Step2Documents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Step2Documents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Step2Documents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
