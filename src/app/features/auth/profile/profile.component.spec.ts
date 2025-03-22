// profile.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../../core/services/auth.service';
import { of, throwError } from 'rxjs';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authServiceMock: any;

  beforeEach(async () => {
    authServiceMock = {
      currentUser$: of({ 
        name: 'Test User', 
        email: 'test@example.com',
        role: 'EMPLOYEE' 
      }),
      updateProfile: jasmine.createSpy('updateProfile').and.returnValue(of({})),
      changePassword: jasmine.createSpy('changePassword').and.returnValue(of({}))
    };

    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});