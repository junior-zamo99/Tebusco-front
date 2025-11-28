import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Step3SelectPlan } from './step-3-select-plan';

describe('Step3SelectPlan', () => {
  let component: Step3SelectPlan;
  let fixture: ComponentFixture<Step3SelectPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Step3SelectPlan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Step3SelectPlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
