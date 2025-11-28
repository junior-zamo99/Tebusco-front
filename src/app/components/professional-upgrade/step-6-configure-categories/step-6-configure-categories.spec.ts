import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Step6ConfigureCategories } from './step-6-configure-categories';

describe('Step6ConfigureCategories', () => {
  let component: Step6ConfigureCategories;
  let fixture: ComponentFixture<Step6ConfigureCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Step6ConfigureCategories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Step6ConfigureCategories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
