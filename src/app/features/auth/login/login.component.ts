import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, of, timer } from 'rxjs';
import { takeUntil, timeout, catchError } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  hidePassword = true;
  returnUrl = '/dashboard';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    console.log('🔧 LoginComponent constructor called');
    console.log('🔧 Services available:', {
      formBuilder: !!this.formBuilder,
      authService: !!this.authService,
      router: !!this.router,
      route: !!this.route
    });

    // Create form immediately in constructor
    this.loginForm = this.createForm();
    console.log('✅ Login form created successfully');
  }

  ngOnInit(): void {
    console.log('🔧 LoginComponent ngOnInit called');
    
    // Get return URL from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    console.log('🔧 Return URL set to:', this.returnUrl);
    
    // Use setTimeout to prevent blocking
    setTimeout(() => {
      this.initializeComponent();
    }, 0);
  }

  private async initializeComponent(): Promise<void> {
    try {
      console.log('🔧 Initializing login component...');
      
      // Check authentication status
      await this.checkAuthenticationStatus();
      
      // Setup loading subscription
      this.setupLoadingSubscription();
      
      console.log('✅ LoginComponent initialization completed successfully');
    } catch (error) {
      console.error('❌ Error in login component initialization:', error);
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
    console.log('🔧 LoginComponent ngAfterViewInit called');
    
    // Add a small delay to ensure DOM is ready
    timer(100).subscribe(() => {
      console.log('🔧 View should be rendered now');
      console.log('🔧 Form element exists:', !!document.querySelector('form'));
      console.log('🔧 Login card exists:', !!document.querySelector('.login-card'));
    });
  }

  ngOnDestroy(): void {
    console.log('🔧 LoginComponent ngOnDestroy called');
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    console.log('🔧 Creating login form...');
    
    try {
      const form = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      });
      
      console.log('✅ Login form created with controls:', Object.keys(form.controls));
      return form;
    } catch (error) {
      console.error('❌ Error creating login form:', error);
      // Return minimal form as fallback
      return this.formBuilder.group({
        email: [''],
        password: ['']
      });
    }
  }

  onSubmit(): void {
    console.log('🔄 Login form submission started');
    console.log('🔧 Form valid:', this.loginForm.valid);
    console.log('🔧 Form value:', this.loginForm.value);

    if (this.loginForm.invalid) {
      console.log('❌ Form is invalid, marking fields as touched');
      this.markFormGroupTouched(this.loginForm);
      
      // Log individual field errors
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        if (control?.invalid) {
          console.log(`❌ Field '${key}' errors:`, control.errors);
        }
      });
      return;
    }

    // Check if authService is available
    if (!this.authService || typeof this.authService.login !== 'function') {
      console.error('❌ AuthService or login method not available');
      this.error = 'Authentication service is not available';
      return;
    }

    this.error = null;
    this.isLoading = true;
    const loginData: LoginRequest = this.loginForm.value;

    console.log('🔄 Attempting login with:', { email: loginData.email });

    this.authService.login(loginData)
      .pipe(
        takeUntil(this.destroy$),
        timeout(10000), // 10 second timeout
        catchError(error => {
          console.error('❌ Login error:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response) {
            console.log('✅ Login successful:', response);
            this.router.navigate([this.returnUrl]);
          } else {
            this.error = 'Login failed. Please try again.';
          }
        },
        error: (error) => {
          console.error('❌ Login subscription error:', error);
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
      return 'Login failed. Please try again.';
    }
  }

  onRegisterClick(): void {
    console.log('🔄 Navigating to register page...');
    
    try {
      this.router.navigate(['/auth/register'], {
        queryParams: { returnUrl: this.returnUrl }
      });
    } catch (error) {
      console.error('❌ Navigation error:', error);
      // Fallback: navigate without query params
      this.router.navigate(['/auth/register']);
    }
  }

  onForgotPasswordClick(): void {
    // TODO: Implement forgot password functionality
    console.log('🔄 Forgot password clicked');
    // For now, you can navigate to a forgot password page or show a message
    alert('Forgot password functionality coming soon!');
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  // Form validation helpers
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field?.errors || !field.touched) {
      return '';
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
      return `Password must be at least ${minLength} characters long`;
    }
    
    return 'Invalid input';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      password: 'Password'
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
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}