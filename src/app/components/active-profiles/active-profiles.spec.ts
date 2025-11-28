import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveProfiles } from './active-profiles';

describe('ActiveProfiles', () => {
  let component: ActiveProfiles;
  let fixture: ComponentFixture<ActiveProfiles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveProfiles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveProfiles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
