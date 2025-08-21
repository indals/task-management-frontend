// src/app/features/settings/settings.component.ts
import { Component, OnInit, OnDestroy, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

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

interface ThemeConfig {
  isDark: boolean;
  systemTheme: 'light' | 'dark';
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-in')
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-100px)' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class SettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private mediaQueryList: MediaQueryList;
  private currentThemeConfig: ThemeConfig = {
    isDark: false,
    systemTheme: 'light'
  };

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
    { value: 'Europe/Berlin', label: 'Berlin Time (UTC+1)' },
    { value: 'Europe/Madrid', label: 'Madrid Time (UTC+1)' },
    { value: 'Asia/Tokyo', label: 'Japan Time (UTC+9)' },
    { value: 'Asia/Shanghai', label: 'China Time (UTC+8)' },
    { value: 'Asia/Kolkata', label: 'India Time (UTC+5:30)' },
    { value: 'Asia/Dubai', label: 'UAE Time (UTC+4)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (UTC+10)' },
    { value: 'Pacific/Auckland', label: 'New Zealand Time (UTC+12)' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private renderer: Renderer2,
    private snackBar: MatSnackBar,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.generalForm = this.createGeneralForm();
    this.notificationsForm = this.createNotificationsForm();
    this.privacyForm = this.createPrivacyForm();
    this.securityForm = this.createSecurityForm();

    // Initialize media query for system theme detection
    this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    this.currentThemeConfig.systemTheme = this.mediaQueryList.matches ? 'dark' : 'light';
  }

  ngOnInit(): void {
    this.loadCurrentSettings();
    this.setupThemeListener();
    this.setupFormValueChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up media query listener
    if (this.mediaQueryList && this.mediaQueryList.removeEventListener) {
      this.mediaQueryList.removeEventListener('change', this.handleSystemThemeChange);
    }
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
      sessionTimeout: [60, [Validators.required, Validators.min(5), Validators.max(480)]],
      loginNotifications: [true],
      apiAccess: [false]
    });
  }

  private loadCurrentSettings(): void {
    try {
      const savedSettings = this.loadSettingsFromStorage();
      
      if (savedSettings.general) {
        this.generalForm.patchValue(savedSettings.general);
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
    } catch (error) {
      console.error('Error loading settings:', error);
      this.showErrorMessage('Failed to load settings. Using default values.');
    }
  }

  private loadSettingsFromStorage(): any {
    const defaultSettings = {
      general: {
        theme: 'light',
        language: 'en',
        timezone: this.detectUserTimezone(),
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
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        return this.mergeSettings(defaultSettings, parsedSettings);
      }
      return defaultSettings;
    } catch (error) {
      console.error('Error parsing stored settings:', error);
      return defaultSettings;
    }
  }

  private mergeSettings(defaults: any, stored: any): any {
    const merged = { ...defaults };
    
    Object.keys(defaults).forEach(key => {
      if (stored[key] && typeof defaults[key] === 'object') {
        merged[key] = { ...defaults[key], ...stored[key] };
      } else if (stored[key] !== undefined) {
        merged[key] = stored[key];
      }
    });
    
    return merged;
  }

  private saveSettingsToStorage(settings: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const currentSettings = this.loadSettingsFromStorage();
        const updatedSettings = this.mergeSettings(currentSettings, settings);
        localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
        resolve();
      } catch (error) {
        console.error('Error saving settings:', error);
        reject(error);
      }
    });
  }

  private detectUserTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      console.warn('Could not detect user timezone:', error);
      return 'UTC';
    }
  }

  private setupThemeListener(): void {
    // Listen for system theme changes
    this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
    
    if (this.mediaQueryList.addEventListener) {
      this.mediaQueryList.addEventListener('change', this.handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      this.mediaQueryList.addListener(this.handleSystemThemeChange);
    }
  }

  private handleSystemThemeChange = (e: MediaQueryListEvent): void => {
    this.currentThemeConfig.systemTheme = e.matches ? 'dark' : 'light';
    
    // Only apply if current theme is set to 'auto'
    const currentTheme = this.generalForm.get('theme')?.value;
    if (currentTheme === 'auto') {
      this.applyThemeChanges('auto');
    }
  };

  private setupFormValueChanges(): void {
    // Auto-save general settings with debounce
    this.generalForm.valueChanges
      .pipe(
        debounceTime(1000),
        takeUntil(this.destroy$)
      )
      .subscribe(values => {
        if (this.generalForm.valid && !this.isGeneralLoading) {
          this.autoSaveSettings('general', values);
        }
      });

    // Listen specifically to theme changes for immediate application
    this.generalForm.get('theme')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        if (theme) {
          this.applyThemeChanges(theme);
        }
      });
  }

  private autoSaveSettings(type: string, values: any): void {
    this.saveSettingsToStorage({ [type]: values })
      .then(() => {
        console.log(`${type} settings auto-saved`);
      })
      .catch(error => {
        console.error(`Error auto-saving ${type} settings:`, error);
      });
  }

  async saveGeneralSettings(): Promise<void> {
    if (this.generalForm.invalid) {
      this.markFormGroupTouched(this.generalForm);
      this.showErrorMessage('Please fix the form errors before saving.');
      return;
    }

    this.isGeneralLoading = true;
    const formValue = this.generalForm.value;

    try {
      await this.saveSettingsToStorage({ general: formValue });
      this.applyThemeChanges(formValue.theme);
      this.showSuccessMessage('General settings saved successfully!');
    } catch (error) {
      console.error('Error saving general settings:', error);
      this.showErrorMessage('Failed to save general settings. Please try again.');
    } finally {
      this.isGeneralLoading = false;
    }
  }

  async saveNotificationSettings(): Promise<void> {
    if (this.notificationsForm.invalid) {
      this.markFormGroupTouched(this.notificationsForm);
      this.showErrorMessage('Please fix the form errors before saving.');
      return;
    }

    this.isNotificationsLoading = true;
    const formValue = this.notificationsForm.value;

    try {
      // Check for push notification permission if enabled
      if (formValue.pushNotifications && 'Notification' in window) {
        const permission = await this.requestNotificationPermission();
        if (permission !== 'granted') {
          formValue.pushNotifications = false;
          this.notificationsForm.patchValue({ pushNotifications: false });
          this.showErrorMessage('Push notifications require permission. Please enable in browser settings.');
        }
      }

      await this.saveSettingsToStorage({ notifications: formValue });
      this.showSuccessMessage('Notification settings saved successfully!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      this.showErrorMessage('Failed to save notification settings. Please try again.');
    } finally {
      this.isNotificationsLoading = false;
    }
  }

  async savePrivacySettings(): Promise<void> {
    if (this.privacyForm.invalid) {
      this.markFormGroupTouched(this.privacyForm);
      this.showErrorMessage('Please fix the form errors before saving.');
      return;
    }

    this.isPrivacyLoading = true;
    const formValue = this.privacyForm.value;

    try {
      await this.saveSettingsToStorage({ privacy: formValue });
      this.showSuccessMessage('Privacy settings saved successfully!');
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      this.showErrorMessage('Failed to save privacy settings. Please try again.');
    } finally {
      this.isPrivacyLoading = false;
    }
  }

  async saveSecuritySettings(): Promise<void> {
    if (this.securityForm.invalid) {
      this.markFormGroupTouched(this.securityForm);
      this.showErrorMessage('Please fix the form errors before saving.');
      return;
    }

    this.isSecurityLoading = true;
    const formValue = this.securityForm.value;

    try {
      await this.saveSettingsToStorage({ security: formValue });
      this.showSuccessMessage('Security settings saved successfully!');
    } catch (error) {
      console.error('Error saving security settings:', error);
      this.showErrorMessage('Failed to save security settings. Please try again.');
    } finally {
      this.isSecurityLoading = false;
    }
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

  private async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  private applyThemeChanges(theme: string): void {
    const body = this.document.body;
    
    // Remove existing theme classes
    this.renderer.removeClass(body, 'light-theme');
    this.renderer.removeClass(body, 'dark-theme');
    
    let themeToApply: 'light' | 'dark';
    
    if (theme === 'auto') {
      themeToApply = this.currentThemeConfig.systemTheme;
    } else {
      themeToApply = theme as 'light' | 'dark';
    }
    
    // Apply new theme class
    this.renderer.addClass(body, `${themeToApply}-theme`);
    
    // Update theme config
    this.currentThemeConfig.isDark = themeToApply === 'dark';
    
    // Store theme preference
    try {
      localStorage.setItem('selectedTheme', theme);
    } catch (error) {
      console.warn('Could not save theme preference:', error);
    }
    
    // Dispatch custom event for other components that might need to know about theme changes
    const themeChangeEvent = new CustomEvent('themeChanged', { 
      detail: { theme: themeToApply, preference: theme } 
    });
    this.document.dispatchEvent(themeChangeEvent);
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    
    // Also show snackbar for better UX
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
    
    // Auto-hide the custom success message
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  // Security Actions
  changePassword(): void {
    // TODO: Implement password change dialog or navigation
    console.log('Navigate to change password');
    this.showSuccessMessage('Redirecting to password change...');
  }

  viewLoginHistory(): void {
    // TODO: Implement login history dialog or navigation
    console.log('View login history');
    this.showSuccessMessage('Loading login history...');
  }

  async downloadData(): Promise<void> {
    try {
      // TODO: Implement actual data export
      const userData = this.prepareUserDataForExport();
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = window.URL.createObjectURL(dataBlob);
      const link = this.document.createElement('a');
      link.href = url;
      link.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
      this.document.body.appendChild(link);
      link.click();
      this.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      this.showSuccessMessage('User data downloaded successfully!');
    } catch (error) {
      console.error('Error downloading data:', error);
      this.showErrorMessage('Failed to download data. Please try again.');
    }
  }

  private prepareUserDataForExport(): any {
    return {
      exportDate: new Date().toISOString(),
      settings: this.loadSettingsFromStorage(),
      // TODO: Add other user data as needed
      version: '1.0'
    };
  }

  async deleteAccount(): Promise<void> {
    const confirmed = await this.showDeleteAccountDialog();
    
    if (confirmed) {
      try {
        // TODO: Implement actual account deletion API call
        console.log('Account deletion requested');
        this.showSuccessMessage('Account deletion request submitted. You will receive a confirmation email.');
      } catch (error) {
        console.error('Error deleting account:', error);
        this.showErrorMessage('Failed to process account deletion. Please contact support.');
      }
    }
  }

  private showDeleteAccountDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmed = confirm(
        'Are you sure you want to delete your account?\n\n' +
        'This action cannot be undone and all your data will be permanently deleted.\n\n' +
        'Click OK to continue or Cancel to abort.'
      );
      
      if (confirmed) {
        const finalConfirm = confirm(
          'FINAL WARNING: This will permanently delete your account and all associated data.\n\n' +
          'Type DELETE in the prompt that follows to confirm.'
        );
        
        if (finalConfirm) {
          const deleteConfirmation = prompt(
            'Please type "DELETE" (without quotes) to confirm account deletion:'
          );
          resolve(deleteConfirmation === 'DELETE');
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  }

  // Utility method to get current theme
  getCurrentTheme(): { theme: string; isDark: boolean } {
    return {
      theme: this.generalForm.get('theme')?.value || 'light',
      isDark: this.currentThemeConfig.isDark
    };
  }

  // Method to programmatically switch themes (useful for testing or external triggers)
  switchTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.generalForm.patchValue({ theme });
    this.applyThemeChanges(theme);
  }
}