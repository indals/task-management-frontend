import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/auth.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  currentUser: User | null = null;
  isSubmitting = false;
  isChangingPassword = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
          this.profileForm.patchValue({
            name: user.name,
            email: user.email
          });
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load user profile';
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully';
        this.isSubmitting = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to update profile';
        this.isSubmitting = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.isChangingPassword = true;
    this.successMessage = null;
    this.errorMessage = null;

    const { currentPassword, newPassword } = this.passwordForm.value;  // Extract values

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.successMessage = 'Password changed successfully';
        this.isChangingPassword = false;
        this.passwordForm.reset();
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to change password';
        this.isChangingPassword = false;
      }
    });
  }
}