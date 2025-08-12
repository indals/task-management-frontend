import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, of, timer } from 'rxjs';
import { takeUntil, catchError, delay, timeout } from 'rxjs/operators';

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
    
    // Create form immediately in constructor
    this.registerForm = this.createForm();
    console.log('✅ Form created successfully');
  }

  ngOnInit(): void {
    console.log('🔧 RegisterComponent ngOnInit called');
    
    // Wrap everything in try-catch and use setTimeout to prevent blocking
    setTimeout(() => {
      this.initializeComponent();
    }, 0);
  }

  private async initializeComponent(): Promise<void> {
    try {
      // Get return URL from route parameters or default to dashboard
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
      console.log('🔧 Return URL set to:', this.returnUrl);
      
      // Check if already logged in (with timeout to prevent hanging)
      await this.checkAuthenticationStatus();
      
      // Load role options (non-blocking)
      this.loadRoleOptions();

      // Setup loading subscription with timeout
      this.setupLoadingSubscription();
      
      console.log('✅ RegisterComponent initialization completed successfully');
    } catch (error) {
      console.error('❌ Error in component initialization:', error);
      // Continue with default setup even if initialization fails
      this.setFallbackRoleOptions();
    }
  }

  private async checkAuthenticationStatus(): Promise<void> {
    try {
      // Add timeout to prevent hanging if authService is stuck
      const isLoggedIn = await Promise.race([
        new Promise<boolean>((resolve) => {
          try {
            if (this.authService && typeof this.authService.isLoggedIn === 'function') {
              resolve(this.authService.isLoggedIn());
            } else {
              resolve(false);
            }
          } catch (error) {
            console.error('❌ Error checking auth status:', error);
            resolve(false);
          }
        }),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1000)) // 1 second timeout
      ]);

      if (isLoggedIn) {
        console.log('🔄 User already logged in, redirecting...');
        this.router.navigate([this.returnUrl]);
      }
    } catch (error) {
      console.error('❌ Error checking authentication status:', error);
      // Continue with component initialization even if auth check fails
    }
  }

  private setupLoadingSubscription(): void {
    try {
      if (this.authService?.loading$) {
        this.authService.loading$
          .pipe(
            takeUntil(this.destroy$),
            timeout(5000), // 5 second timeout
            catchError(error => {
              console.error('❌ Loading subscription error:', error);
              return of(false); // Return default loading state
            })
          )
          .subscribe({
            next: (loading) => {
              console.log('🔧 Loading state changed:', loading);
              this.isLoading = loading;
            },
            error: (error) => {
              console.error('❌ Loading subscription error:', error);
              this.isLoading = false;
            }
          });
      }
    } catch (error) {
      console.error('❌ Error setting up loading subscription:', error);
    }
  }

  ngAfterViewInit(): void {
    console.log('🔧 RegisterComponent ngAfterViewInit called');
    
    // Add a small delay to ensure DOM is ready
    timer(100).subscribe(() => {
      console.log('🔧 View should be rendered now');
      console.log('🔧 Form element exists:', !!document.querySelector('form'));
      console.log('🔧 Register card exists:', !!document.querySelector('.register-card'));
    });
  }

  ngOnDestroy(): void {
    console.log('🔧 RegisterComponent ngOnDestroy called');
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    console.log('🔧 Creating form...');
    
    try {
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
    } catch (error) {
      console.error('❌ Error creating form:', error);
      // Return minimal form as fallback
      return this.formBuilder.group({
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
      
      // Then try to get from enum service if available (with timeout)
      Promise.race([
        new Promise<void>((resolve, reject) => {
          try {
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
              }
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        }),
        new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        )
      ]).catch(error => {
        console.log('⚠️ Could not load role options from enum service:', error.message);
        // Fallback options are already set
      });
      
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

    if (this.registerForm.invalid) {
      console.log('❌ Form is invalid, marking fields as touched');
      this.markFormGroupTouched(this.registerForm);
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

    console.log('🔄 Attempting registration...');

    // Check if authService exists and has register method
    if (!this.authService || typeof this.authService.register !== 'function') {
      console.error('❌ AuthService or register method not available');
      this.error = 'Authentication service is not available';
      this.isLoading = false;
      return;
    }

    this.authService.register(registerData)
      .pipe(
        takeUntil(this.destroy$),
        timeout(10000), // 10 second timeout
        catchError(error => {
          console.error('❌ Registration error:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response) {
            console.log('✅ Registration successful:', response);
            this.autoLogin(registerData.email!, registerData.password);
          } else {
            this.error = 'Registration failed. Please try again.';
          }
        },
        error: (error) => {
          console.error('❌ Registration subscription error:', error);
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
        timeout(10000), // 10 second timeout
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
    
    try {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.returnUrl }
      });
    } catch (error) {
      console.error('❌ Navigation error:', error);
      // Fallback: navigate without query params
      this.router.navigate(['/auth/login']);
    }
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

  // TrackBy functions for performance optimization
trackByRoleValue(index: number, item: DropdownOption): string {
  return item.value;
}

trackByTimezoneValue(index: number, item: { value: string; label: string }): string {
  return item.value;
}
}