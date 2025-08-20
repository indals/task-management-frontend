// src/app/features/settings/settings.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  weekStartDay: 'monday' | 'sunday';
  defaultView: 'list' | 'grid' | 'kanban';
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskReminders: boolean;
  projectUpdates: boolean;
  deadlineAlerts: boolean;
  teamMentions: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'private';
  activityTracking: boolean;
  dataSharing: boolean;
  marketingEmails: boolean;
  analytics: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number; // minutes
  loginNotifications: boolean;
  apiAccess: boolean;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Forms
  generalForm: FormGroup;
  notificationsForm: FormGroup;
  privacyForm: FormGroup;
  securityForm: FormGroup;

  // UI State
  selectedTabIndex = 0;
  isGeneralLoading = false;
  isNotificationsLoading = false;
  isPrivacyLoading = false;
  isSecurityLoading = false;
  successMessage: string | null = null;

  // Options
  timezoneOptions = [
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.generalForm = this.createGeneralForm();
    this.notificationsForm = this.createNotificationsForm();
    this.privacyForm = this.createPrivacyForm();
    this.securityForm = this.createSecurityForm();
  }

  ngOnInit(): void {
    this.loadCurrentSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createGeneralForm(): FormGroup {
    return this.fb.group({
      theme: ['light', Validators.required],
      language: ['en', Validators.required],
      timezone: ['UTC', Validators.required],
      dateFormat: ['MM/DD/YYYY', Validators.required],
      timeFormat: ['12h', Validators.required],
      weekStartDay: ['sunday', Validators.required],
      defaultView: ['list', Validators.required]
    });
  }

  private createNotificationsForm(): FormGroup {
    return this.fb.group({
      emailNotifications: [true],
      pushNotifications: [true],
      taskReminders: [true],
      projectUpdates: [true],
      deadlineAlerts: [true],
      teamMentions: [true],
      dailyDigest: [false],
      weeklyReport: [true]
    });
  }

  private createPrivacyForm(): FormGroup {
    return this.fb.group({
      profileVisibility: ['team', Validators.required],
      activityTracking: [true],
      dataSharing: [false],
      marketingEmails: [false],
      analytics: [true]
    });
  }

  private createSecurityForm(): FormGroup {
    return this.fb.group({
      twoFactorAuth: [false],
      sessionTimeout: [60, Validators.required],
      loginNotifications: [true],
      apiAccess: [false]
    });
  }

  private loadCurrentSettings(): void {
    // Load settings from localStorage or API
    const savedSettings = this.loadSettingsFromStorage();
    
    if (savedSettings.general) {
      this.generalForm.patchValue(savedSettings.general);
      // Apply theme immediately on load
      this.applyThemeChanges(savedSettings.general.theme);
    }
    
    if (savedSettings.notifications) {
      this.notificationsForm.patchValue(savedSettings.notifications);
    }
    
    if (savedSettings.privacy) {
      this.privacyForm.patchValue(savedSettings.privacy);
    }
    
    if (savedSettings.security) {
      this.securityForm.patchValue(savedSettings.security);
    }
  }

  private loadSettingsFromStorage(): any {
    const defaultSettings = {
      general: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        weekStartDay: 'sunday',
        defaultView: 'list'
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        taskReminders: true,
        projectUpdates: true,
        deadlineAlerts: true,
        teamMentions: true,
        dailyDigest: false,
        weeklyReport: true
      },
      privacy: {
        profileVisibility: 'team',
        activityTracking: true,
        dataSharing: false,
        marketingEmails: false,
        analytics: true
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 60,
        loginNotifications: true,
        apiAccess: false
      }
    };

    try {
      const stored = localStorage.getItem('userSettings');
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return defaultSettings;
    }
  }

  private saveSettingsToStorage(settings: any): void {
    try {
      const currentSettings = this.loadSettingsFromStorage();
      const updatedSettings = { ...currentSettings, ...settings };
      localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  saveGeneralSettings(): void {
    if (this.generalForm.invalid) return;

    this.isGeneralLoading = true;
    const formValue = this.generalForm.value;

    // Simulate API call
    setTimeout(() => {
      this.saveSettingsToStorage({ general: formValue });
      this.applyThemeChanges(formValue.theme);
      this.showSuccessMessage('General settings saved successfully!');
      this.isGeneralLoading = false;
    }, 1000);
  }

  saveNotificationSettings(): void {
    if (this.notificationsForm.invalid) return;

    this.isNotificationsLoading = true;
    const formValue = this.notificationsForm.value;

    // Simulate API call
    setTimeout(() => {
      this.saveSettingsToStorage({ notifications: formValue });
      this.showSuccessMessage('Notification settings saved successfully!');
      this.isNotificationsLoading = false;
    }, 1000);
  }

  savePrivacySettings(): void {
    if (this.privacyForm.invalid) return;

    this.isPrivacyLoading = true;
    const formValue = this.privacyForm.value;

    // Simulate API call
    setTimeout(() => {
      this.saveSettingsToStorage({ privacy: formValue });
      this.showSuccessMessage('Privacy settings saved successfully!');
      this.isPrivacyLoading = false;
    }, 1000);
  }

  saveSecuritySettings(): void {
    if (this.securityForm.invalid) return;

    this.isSecurityLoading = true;
    const formValue = this.securityForm.value;

    // Simulate API call
    setTimeout(() => {
      this.saveSettingsToStorage({ security: formValue });
      this.showSuccessMessage('Security settings saved successfully!');
      this.isSecurityLoading = false;
    }, 1000);
  }

  private applyThemeChanges(theme: string): void {
    const body = document.body;
    body.classList.remove('light-theme', 'dark-theme');
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
      
      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.generalForm.get('theme')?.value === 'auto') {
          body.classList.remove('light-theme', 'dark-theme');
          body.classList.add(e.matches ? 'dark-theme' : 'light-theme');
        }
      });
    } else {
      body.classList.add(`${theme}-theme`);
    }
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  // Security Actions
  changePassword(): void {
    console.log('Navigate to change password');
    // TODO: Navigate to change password page or open dialog
  }

  viewLoginHistory(): void {
    console.log('View login history');
    // TODO: Navigate to login history page or open dialog
  }

  downloadData(): void {
    console.log('Download user data');
    // TODO: Implement data export functionality
    this.showSuccessMessage('Data export request submitted. You will receive an email when ready.');
  }

  deleteAccount(): void {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
    );
    
    if (confirmed) {
      const doubleConfirmed = confirm(
        'This is your final warning. Type "DELETE" to confirm account deletion.'
      );
      
      if (doubleConfirmed) {
        console.log('Delete account');
        // TODO: Implement account deletion
        this.showSuccessMessage('Account deletion request submitted.');
      }
    }
  }
}