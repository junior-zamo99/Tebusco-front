import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorySelectorRequest } from './category-selector-request';

describe('CategorySelectorRequest', () => {
  let component: CategorySelectorRequest;
  let fixture: ComponentFixture<CategorySelectorRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategorySelectorRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategorySelectorRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
