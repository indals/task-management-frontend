import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, of } from 'rxjs';
import { takeUntil, catchError, delay } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { EnumService } from '../../../core/services/enum.service';
import { RegisterRequest, DropdownOption } from '../../../core/models';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy, AfterViewInit {
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
    console.log('🔧 RegisterComponent constructor called');
    console.log('🔧 Services available:', {
      formBuilder: !!this.formBuilder,
      authService: !!this.authService,
      enumService: !!this.enumService,
      router: !!this.router,
      route: !!this.route
    });
    
    try {
      this.registerForm = this.createForm();
      console.log('✅ Form created successfully');
    } catch (error) {
      console.error('❌ Error creating form:', error);
      // Create a minimal form as fallback
      this.registerForm = this.formBuilder.group({
        name: [''],
        email: [''],
        password: [''],
        confirmPassword: [''],
        role: ['DEVELOPER'],
        timezone: ['UTC'],
        daily_work_hours: [8],
        agreedToTerms: [false]
      });
    }
  }

  ngOnInit(): void {
    console.log('🔧 RegisterComponent ngOnInit called');
    
    try {
      // Get return URL from route parameters or default to dashboard
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
      console.log('🔧 Register component initialized with returnUrl:', this.returnUrl);
      
      // Check if already logged in
      if (this.authService && this.authService.isLoggedIn && this.authService.isLoggedIn()) {
        console.log('🔄 User already logged in, redirecting...');
        this.router.navigate([this.returnUrl]);
        return;
      }

      // Load role options
      this.loadRoleOptions();

      // Setup loading subscription with error handling
      if (this.authService && this.authService.loading$) {
        this.authService.loading$
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (loading) => {
              console.log('🔧 Loading state changed:', loading);
              this.isLoading = loading;
            },
            error: (error) => {
              console.error('❌ Loading subscription error:', error);
            }
          });
      }
      
      console.log('✅ RegisterComponent ngOnInit completed successfully');
    } catch (error) {
      console.error('❌ Error in ngOnInit:', error);
    }
  }

  ngAfterViewInit(): void {
    console.log('🔧 RegisterComponent ngAfterViewInit called');
    
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
      console.log('🔧 View should be rendered now');
      console.log('🔧 Form element exists:', !!document.querySelector('form'));
      console.log('🔧 Register card exists:', !!document.querySelector('.register-card'));
    }, 100);
  }

  ngOnDestroy(): void {
    console.log('🔧 RegisterComponent ngOnDestroy called');
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    console.log('🔧 Creating form...');
    
    const form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      role: ['DEVELOPER', [Validators.required]],
      timezone: ['UTC', [Validators.required]],
      daily_work_hours: [8, [Validators.required, Validators.min(1), Validators.max(24)]],
      agreedToTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: [this.passwordMatchValidator.bind(this)]
    });
    
    console.log('✅ Form created with controls:', Object.keys(form.controls));
    return form;
  }

  // Password match validator
  private passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control) return null;
    
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) return null;
    
    if (password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  // Load role options with extensive error handling
  private loadRoleOptions(): void {
    console.log('🔧 Loading role options...');
    
    try {
      // Set fallback options first
      this.setFallbackRoleOptions();
      
      // Then try to get from enum service if available
      if (this.enumService && typeof this.enumService.getUserRoleOptions === 'function') {
        const enumOptions = this.enumService.getUserRoleOptions();
        
        if (enumOptions && Array.isArray(enumOptions) && enumOptions.length > 0) {
          const allowedRoles = [
            'DEVELOPER',
            'SENIOR_DEVELOPER', 
            'QA_ENGINEER',
            'DEVOPS_ENGINEER',
            'UI_UX_DESIGNER',
            'BUSINESS_ANALYST'
          ];
          
          this.roleOptions = enumOptions.filter(role => allowedRoles.includes(role.value));
          console.log('✅ Role options loaded from enum service:', this.roleOptions.length);
        } else {
          console.log('⚠️ No valid role options from enum service, using fallback');
        }
      } else {
        console.log('⚠️ EnumService not available, using fallback role options');
      }
      
    } catch (error) {
      console.error('❌ Error loading role options:', error);
      this.setFallbackRoleOptions();
    }
  }

  private setFallbackRoleOptions(): void {
    this.roleOptions = [
      { value: 'DEVELOPER', label: 'Developer' },
      { value: 'SENIOR_DEVELOPER', label: 'Senior Developer' },
      { value: 'QA_ENGINEER', label: 'QA Engineer' },
      { value: 'DEVOPS_ENGINEER', label: 'DevOps Engineer' },
      { value: 'UI_UX_DESIGNER', label: 'UI/UX Designer' },
      { value: 'BUSINESS_ANALYST', label: 'Business Analyst' }
    ];
    console.log('✅ Fallback role options set:', this.roleOptions.length);
  }

  onSubmit(): void {
    console.log('🔄 Form submission started');
    console.log('🔧 Form valid:', this.registerForm.valid);
    console.log('🔧 Form value:', this.registerForm.value);
    console.log('🔧 Form errors:', this.registerForm.errors);

    if (this.registerForm.invalid) {
      console.log('❌ Form is invalid, marking fields as touched');
      this.markFormGroupTouched(this.registerForm);
      
      // Log individual field errors
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          console.log(`❌ Field '${key}' errors:`, control.errors);
        }
      });
      return;
    }

    this.error = null;
    this.isLoading = true;
    
    const formValue = this.registerForm.value;
    
    const registerData: RegisterRequest = {
      name: formValue.name?.trim(),
      email: formValue.email?.trim().toLowerCase(),
      password: formValue.password,
      role: formValue.role,
      timezone: formValue.timezone,
      daily_work_hours: Number(formValue.daily_work_hours)
    };

    console.log('🔄 Attempting registration with:', {
      name: registerData.name,
      email: registerData.email,
      role: registerData.role,
      timezone: registerData.timezone,
      daily_work_hours: registerData.daily_work_hours
    });

    // Check if authService exists and has register method
    if (!this.authService || typeof this.authService.register !== 'function') {
      console.error('❌ AuthService or register method not available');
      this.error = 'Authentication service is not available';
      this.isLoading = false;
      return;
    }

    this.authService.register(registerData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Registration successful:', response);
          this.isLoading = false;
          // Auto-login after successful registration
          this.autoLogin(registerData.email!, registerData.password);
        },
        error: (error) => {
          console.error('❌ Registration failed:', error);
          this.isLoading = false;
          this.error = this.getErrorMessage(error);
        }
      });
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    } else if (error?.message) {
      return error.message;
    } else if (typeof error === 'string') {
      return error;
    } else {
      return 'Registration failed. Please try again.';
    }
  }

  private autoLogin(email: string, password: string): void {
    console.log('🔄 Attempting auto-login after registration...');
    
    if (!this.authService || typeof this.authService.login !== 'function') {
      console.error('❌ AuthService or login method not available');
      this.redirectToLogin('Registration successful! Please log in.');
      return;
    }
    
    this.authService.login({ email, password })
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('❌ Auto-login failed:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response) {
            console.log('✅ Auto-login successful');
            this.router.navigate([this.returnUrl]);
          } else {
            console.log('⚠️ Auto-login failed, redirecting to login page');
            this.redirectToLogin('Registration successful! Please log in.');
          }
        },
        error: (error) => {
          console.error('❌ Auto-login subscription error:', error);
          this.redirectToLogin('Registration successful! Please log in.');
        }
      });
  }

  private redirectToLogin(message: string): void {
    this.router.navigate(['/auth/login'], {
      queryParams: { 
        returnUrl: this.returnUrl,
        message: message
      }
    });
  }

  onLoginClick(): void {
    console.log('🔄 Navigating to login page...');
    
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
    if (!field?.errors || !field.touched) {
      return '';
    }

    // Check form-level errors for password mismatch
    if (fieldName === 'confirmPassword' && this.registerForm.errors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }

    const errors = field.errors;
    
    if (errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (errors['email']) {
      return 'Please enter a valid email address';
    }
    if (errors['minlength']) {
      const minLength = errors['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters long`;
    }
    if (errors['maxlength']) {
      const maxLength = errors['maxlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} cannot exceed ${maxLength} characters`;
    }
    if (errors['min']) {
      const min = errors['min'].min;
      return `${this.getFieldLabel(fieldName)} must be at least ${min}`;
    }
    if (errors['max']) {
      const max = errors['max'].max;
      return `${this.getFieldLabel(fieldName)} cannot exceed ${max}`;
    }
    if (errors['requiredTrue']) {
      return 'You must agree to the terms and conditions';
    }
    
    return 'Invalid input';
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
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    
    // Special case for confirm password - check form-level password mismatch error
    if (fieldName === 'confirmPassword') {
      return !!(
        (field?.invalid && field?.touched) || 
        (this.registerForm.errors?.['passwordMismatch'] && field?.touched)
      );
    }
    
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