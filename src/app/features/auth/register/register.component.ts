import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { EnumService } from '../../../core/services/enum.service';
import { RegisterRequest, DropdownOption } from '../../../core/models';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  registerForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  hidePassword = true;
  hideConfirmPassword = true;
  returnUrl = '/dashboard';
  roleOptions: DropdownOption[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private enumService: EnumService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.registerForm = this.createForm();
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }

    // Load role options
    this.loadRoleOptions();

    // Setup loading subscription
    this.authService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      role: ['DEVELOPER', [Validators.required]],
      timezone: ['UTC', [Validators.required]],
      daily_work_hours: [8, [Validators.required, Validators.min(1), Validators.max(24)]],
      agreedToTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  private loadRoleOptions(): void {
    // Filter roles appropriate for registration (exclude admin roles)
    const allowedRoles = [
      'DEVELOPER',
      'SENIOR_DEVELOPER', 
      'QA_ENGINEER',
      'DEVOPS_ENGINEER',
      'UI_UX_DESIGNER',
      'BUSINESS_ANALYST'
    ];

    this.roleOptions = this.enumService.getUserRoleOptions()
      .filter(role => allowedRoles.includes(role.value));
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.error = null;
    const formValue = this.registerForm.value;
    
    const registerData: RegisterRequest = {
      name: formValue.name,
      email: formValue.email,
      password: formValue.password,
      role: formValue.role,
      timezone: formValue.timezone,
      daily_work_hours: formValue.daily_work_hours
    };

    this.authService.register(registerData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          console.log('Registration successful:', user);
          // Auto-login after successful registration
          this.autoLogin(formValue.email, formValue.password);
        },
        error: (error) => {
          console.error('Registration failed:', error);
          this.error = error.message || 'Registration failed. Please try again.';
        }
      });
  }

  private autoLogin(email: string, password: string): void {
    this.authService.login({ email, password })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          console.error('Auto-login failed:', error);
          // Redirect to login page if auto-login fails
          this.router.navigate(['/auth/login'], {
            queryParams: { 
              returnUrl: this.returnUrl,
              message: 'Registration successful! Please log in.'
            }
          });
        }
      });
  }

  onLoginClick(): void {
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: this.returnUrl }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  // Form validation helpers
  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters long`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} cannot exceed ${maxLength} characters`;
      }
      if (field.errors['min']) {
        const min = field.errors['min'].min;
        return `${this.getFieldLabel(fieldName)} must be at least ${min}`;
      }
      if (field.errors['max']) {
        const max = field.errors['max'].max;
        return `${this.getFieldLabel(fieldName)} cannot exceed ${max}`;
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
      if (field.errors['requiredTrue']) {
        return 'You must agree to the terms and conditions';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Full Name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      role: 'Role',
      timezone: 'Timezone',
      daily_work_hours: 'Daily Work Hours'
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  // Get common timezones for the dropdown
  getTimezoneOptions(): { value: string; label: string }[] {
    return [
      { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
      { value: 'America/New_York', label: 'Eastern Time (UTC-5)' },
      { value: 'America/Chicago', label: 'Central Time (UTC-6)' },
      { value: 'America/Denver', label: 'Mountain Time (UTC-7)' },
      { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-8)' },
      { value: 'Europe/London', label: 'London Time (UTC+0)' },
      { value: 'Europe/Paris', label: 'Central European Time (UTC+1)' },
      { value: 'Asia/Tokyo', label: 'Japan Time (UTC+9)' },
      { value: 'Asia/Shanghai', label: 'China Time (UTC+8)' },
      { value: 'Asia/Kolkata', label: 'India Time (UTC+5:30)' },
      { value: 'Australia/Sydney', label: 'Australian Eastern Time (UTC+10)' }
    ];
  }
}