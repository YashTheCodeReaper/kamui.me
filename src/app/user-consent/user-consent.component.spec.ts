import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserConsentComponent } from './user-consent.component';

describe('UserConsentComponent', () => {
  let component: UserConsentComponent;
  let fixture: ComponentFixture<UserConsentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserConsentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserConsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
