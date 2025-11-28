import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthRequire } from './auth-require';

describe('AuthRequire', () => {
  let component: AuthRequire;
  let fixture: ComponentFixture<AuthRequire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthRequire]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthRequire);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
