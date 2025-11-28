import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Step5SelectCategories } from './step-5-select-categories';

describe('Step5SelectCategories', () => {
  let component: Step5SelectCategories;
  let fixture: ComponentFixture<Step5SelectCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Step5SelectCategories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Step5SelectCategories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
