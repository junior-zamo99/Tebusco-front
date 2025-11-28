import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Step4ConfirmSubscription } from './step-4-confirm-subscription';

describe('Step4ConfirmSubscription', () => {
  let component: Step4ConfirmSubscription;
  let fixture: ComponentFixture<Step4ConfirmSubscription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Step4ConfirmSubscription]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Step4ConfirmSubscription);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
