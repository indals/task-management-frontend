// src/app/features/settings/settings/settings.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models';

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
  template: `
    <div class="settings-container">
      <!-- Header -->
      <div class="settings-header">
        <h1>
          <mat-icon>settings</mat-icon>
          Settings
        </h1>
        <p>Customize your experience and preferences</p>
      </div>

      <!-- Settings Tabs -->
      <mat-tab-group [(selectedIndex)]="selectedTabIndex" animationDuration="300ms">
        
        <!-- General Settings -->
        <mat-tab label="General">
          <div class="tab-content">
            <form [formGroup]="generalForm" (ngSubmit)="saveGeneralSettings()">
              
              <!-- Appearance Section -->
              <mat-card class="settings-section">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>palette</mat-icon>
                    Appearance
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="settings-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Theme</mat-label>
                      <mat-select formControlName="theme">
                        <mat-option value="light">
                          <mat-icon>light_mode</mat-icon>
                          Light
                        </mat-option>
                        <mat-option value="dark">
                          <mat-icon>dark_mode</mat-icon>
                          Dark
                        </mat-option>
                        <mat-option value="auto">
                          <mat-icon>auto_mode</mat-icon>
                          Auto (System)
                        </mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Default View</mat-label>
                      <mat-select formControlName="defaultView">
                        <mat-option value="list">
                          <mat-icon>view_list</mat-icon>
                          List View
                        </mat-option>
                        <mat-option value="grid">
                          <mat-icon>view_module</mat-icon>
                          Grid View
                        </mat-option>
                        <mat-option value="kanban">
                          <mat-icon>view_kanban</mat-icon>
                          Kanban Board
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Localization Section -->
              <mat-card class="settings-section">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>language</mat-icon>
                    Localization
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="settings-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Language</mat-label>
                      <mat-select formControlName="language">
                        <mat-option value="en">English</mat-option>
                        <mat-option value="es">Español</mat-option>
                        <mat-option value="fr">Français</mat-option>
                        <mat-option value="de">Deutsch</mat-option>
                        <mat-option value="hi">हिन्दी</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Timezone</mat-label>
                      <mat-select formControlName="timezone">
                        <mat-option *ngFor="let tz of timezoneOptions" [value]="tz.value">
                          {{ tz.label }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="settings-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Date Format</mat-label>
                      <mat-select formControlName="dateFormat">
                        <mat-option value="MM/DD/YYYY">MM/DD/YYYY</mat-option>
                        <mat-option value="DD/MM/YYYY">DD/MM/YYYY</mat-option>
                        <mat-option value="YYYY-MM-DD">YYYY-MM-DD</mat-option>
                        <mat-option value="DD MMM YYYY">DD MMM YYYY</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Time Format</mat-label>
                      <mat-select formControlName="timeFormat">
                        <mat-option value="12h">12 Hour (AM/PM)</mat-option>
                        <mat-option value="24h">24 Hour</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="settings-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Week Starts On</mat-label>
                      <mat-select formControlName="weekStartDay">
                        <mat-option value="sunday">Sunday</mat-option>
                        <mat-option value="monday">Monday</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </mat-card-content>
              </mat-card>

              <div class="form-actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="generalForm.invalid || isGeneralLoading">
                  <mat-spinner diameter="20" *ngIf="isGeneralLoading"></mat-spinner>
                  <span *ngIf="!isGeneralLoading">Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </mat-tab>

        <!-- Notifications -->
        <mat-tab label="Notifications">
          <div class="tab-content">
            <form [formGroup]="notificationsForm" (ngSubmit)="saveNotificationSettings()">
              
              <mat-card class="settings-section">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>notifications</mat-icon>
                    Notification Preferences
                  </mat-card-title>
                  <mat-card-subtitle>
                    Choose how you want to be notified about updates
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  
                  <!-- Email & Push Notifications -->
                  <div class="notification-group">
                    <h3>Delivery Methods</h3>
                    <mat-slide-toggle formControlName="emailNotifications">
                      <div class="toggle-content">
                        <mat-icon>email</mat-icon>
                        <div>
                          <strong>Email Notifications</strong>
                          <p>Receive notifications via email</p>
                        </div>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="pushNotifications">
                      <div class="toggle-content">
                        <mat-icon>notifications_active</mat-icon>
                        <div>
                          <strong>Push Notifications</strong>
                          <p>Receive browser push notifications</p>
                        </div>
                      </div>
                    </mat-slide-toggle>
                  </div>

                  <!-- Task & Project Notifications -->
                  <div class="notification-group">
                    <h3>Task & Project Updates</h3>
                    <mat-slide-toggle formControlName="taskReminders">
                      <div class="toggle-content">
                        <mat-icon>alarm</mat-icon>
                        <div>
                          <strong>Task Reminders</strong>
                          <p>Get reminded about upcoming tasks</p>
                        </div>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="projectUpdates">
                      <div class="toggle-content">
                        <mat-icon>update</mat-icon>
                        <div>
                          <strong>Project Updates</strong>
                          <p>Notifications about project changes</p>
                        </div>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="deadlineAlerts">
                      <div class="toggle-content">
                        <mat-icon>schedule</mat-icon>
                        <div>
                          <strong>Deadline Alerts</strong>
                          <p>Alerts for approaching deadlines</p>
                        </div>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="teamMentions">
                      <div class="toggle-content">
                        <mat-icon>alternate_email</mat-icon>
                        <div>
                          <strong>Team Mentions</strong>
                          <p>When someone mentions you in comments</p>
                        </div>
                      </div>
                    </mat-slide-toggle>
                  </div>

                  <!-- Digest Notifications -->
                  <div class="notification-group">
                    <h3>Digest Reports</h3>
                    <mat-slide-toggle formControlName="dailyDigest">
                      <div class="toggle-content">
                        <mat-icon>today</mat-icon>
                        <div>
                          <strong>Daily Digest</strong>
                          <p>Summary of your daily activities</p>
                        </div>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="weeklyReport">
                      <div class="toggle-content">
                        <mat-icon>date_range</mat-icon>
                        <div>
                          <strong>Weekly Report</strong>
                          <p>Weekly productivity summary</p>
                        </div>
                      </div>
                    </mat-slide-toggle>
                  </div>

                </mat-card-content>
              </mat-card>

              <div class="form-actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="notificationsForm.invalid || isNotificationsLoading">
                  <mat-spinner diameter="20" *ngIf="isNotificationsLoading"></mat-spinner>
                  <span *ngIf="!isNotificationsLoading">Save Notification Settings</span>
                </button>
              </div>
            </form>
          </div>
        </mat-tab>

        <!-- Privacy -->
        <mat-tab label="Privacy">
          <div class="tab-content">
            <form [formGroup]="privacyForm" (ngSubmit)="savePrivacySettings()">
              
              <mat-card class="settings-section">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>privacy_tip</mat-icon>
                    Privacy & Data
                  </mat-card-title>
                  <mat-card-subtitle>
                    Control your privacy and data sharing preferences
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  
                  <div class="privacy-group">
                    <h3>Profile Visibility</h3>
                    <mat-radio-group formControlName="profileVisibility">
                      <mat-radio-button value="public">
                        <div class="radio-content">
                          <mat-icon>public</mat-icon>
                          <div>
                            <strong>Public</strong>
                            <p>Your profile is visible to everyone</p>
                          </div>
                        </div>
                      </mat-radio-button>
                      <mat-radio-button value="team">
                        <div class="radio-content">
                          <mat-icon>group</mat-icon>
                          <div>
                            <strong>Team Only</strong>
                            <p>Only team members can see your profile</p>
                          </div>
                        </div>
                      </mat-radio-button>
                      <mat-radio-button value="private">
                        <div class="radio-content">
                          <mat-icon>lock</mat-icon>
                          <div>
                            <strong>Private</strong>
                            <p>Your profile is private</p>
                          </div>
                        </div>
                      </mat-radio-button>
                    </mat-radio-group>
                  </div>

                  <div class="privacy-group">
                    <h3>Data & Analytics</h3>
                    <mat-slide-toggle formControlName="activityTracking">
                      <div class="toggle-content">
                        <mat-icon>track_changes</mat-icon>
                        <div>
                          <strong>Activity Tracking</strong>
                          <p>Allow tracking of your app usage for insights</p>
                        </div>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="analytics">
                      <div class="toggle-content">
                        <mat-icon>analytics</mat-icon>
                        <div>
                          <strong>Analytics</strong>
                          <p>Help improve the app with anonymous usage data</p>
                        </div>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="dataSharing">
                      <div class="toggle-content">
                        <mat-icon>share</mat-icon>
                        <div>
                          <strong>Data Sharing</strong>
                          <p>Share aggregated data with third parties</p>
                        </div>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="marketingEmails">
                      <div class="toggle-content">
                        <mat-icon>campaign</mat-icon>
                        <div>
                          <strong>Marketing Emails</strong>
                          <p>Receive promotional emails and updates</p>
                        </div>
                      </div>
                    </mat-slide-toggle>
                  </div>

                </mat-card-content>
              </mat-card>

              <div class="form-actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="privacyForm.invalid || isPrivacyLoading">
                  <mat-spinner diameter="20" *ngIf="isPrivacyLoading"></mat-spinner>
                  <span *ngIf="!isPrivacyLoading">Save Privacy Settings</span>
                </button>
              </div>
            </form>
          </div>
        </mat-tab>

        <!-- Security -->
        <mat-tab label="Security">
          <div class="tab-content">
            <form [formGroup]="securityForm" (ngSubmit)="saveSecuritySettings()">
              
              <mat-card class="settings-section">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>security</mat-icon>
                    Security Settings
                  </mat-card-title>
                  <mat-card-subtitle>
                    Manage your account security and access
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  
                  <div class="security-group">
                    <h3>Authentication</h3>
                    <mat-slide-toggle formControlName="twoFactorAuth">
                      <div class="toggle-content">
                        <mat-icon>verified_user</mat-icon>
                        <div>
                          <strong>Two-Factor Authentication</strong>
                          <p>Add an extra layer of security to your account</p>
                        </div>
                      </div>
                    </mat-slide-toggle>

                    <div class="settings-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Session Timeout</mat-label>
                        <mat-select formControlName="sessionTimeout">
                          <mat-option [value]="15">15 minutes</mat-option>
                          <mat-option [value]="30">30 minutes</mat-option>
                          <mat-option [value]="60">1 hour</mat-option>
                          <mat-option [value]="240">4 hours</mat-option>
                          <mat-option [value]="480">8 hours</mat-option>
                          <mat-option [value]="0">Never</mat-option>
                        </mat-select>
                        <mat-hint>Automatically log out after inactivity</mat-hint>
                      </mat-form-field>
                    </div>
                  </div>

                  <div class="security-group">
                    <h3>Account Monitoring</h3>
                    <mat-slide-toggle formControlName="loginNotifications">
                      <div class="toggle-content">
                        <mat-icon>login</mat-icon>
                        <div>
                          <strong>Login Notifications</strong>
                          <p>Get notified of new login attempts</p>
                        </div>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="apiAccess">
                      <div class="toggle-content">
                        <mat-icon>api</mat-icon>
                        <div>
                          <strong>API Access</strong>
                          <p>Allow third-party applications to access your data</p>
                        </div>
                      </div>
                    </mat-slide-toggle>
                  </div>

                  <div class="security-actions">
                    <h3>Account Actions</h3>
                    <div class="action-buttons">
                      <button mat-raised-button color="accent" (click)="changePassword()">
                        <mat-icon>lock_reset</mat-icon>
                        Change Password
                      </button>
                      <button mat-raised-button (click)="viewLoginHistory()">
                        <mat-icon>history</mat-icon>
                        Login History
                      </button>
                      <button mat-raised-button (click)="downloadData()">
                        <mat-icon>file_download</mat-icon>
                        Download My Data
                      </button>
                      <button mat-raised-button color="warn" (click)="deleteAccount()">
                        <mat-icon>delete_forever</mat-icon>
                        Delete Account
                      </button>
                    </div>
                  </div>

                </mat-card-content>
              </mat-card>

              <div class="form-actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="securityForm.invalid || isSecurityLoading">
                  <mat-spinner diameter="20" *ngIf="isSecurityLoading"></mat-spinner>
                  <span *ngIf="!isSecurityLoading">Save Security Settings</span>
                </button>
              </div>
            </form>
          </div>
        </mat-tab>

      </mat-tab-group>

      <!-- Success Message -->
      <div class="success-message" *ngIf="successMessage">
        <mat-icon>check_circle</mat-icon>
        {{ successMessage }}
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .settings-header {
      margin-bottom: 2rem;
    }

    .settings-header h1 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 0 0.5rem;
      font-size: 2rem;
      font-weight: 600;
    }

    .settings-header p {
      margin: 0;
      color: #666;
    }

    .tab-content {
      padding: 2rem 0;
    }

    .settings-section {
      margin-bottom: 2rem;
      border-radius: 12px;
    }

    .settings-section mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .settings-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .notification-group,
    .privacy-group,
    .security-group {
      margin-bottom: 2rem;
    }

    .notification-group h3,
    .privacy-group h3,
    .security-group h3 {
      margin: 0 0 1rem;
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }

    .toggle-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
    }

    .toggle-content mat-icon {
      color: #667eea;
    }

    .toggle-content div {
      flex: 1;
    }

    .toggle-content strong {
      display: block;
      margin-bottom: 0.25rem;
    }

    .toggle-content p {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
    }

    .radio-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem 0;
    }

    .radio-content mat-icon {
      color: #667eea;
    }

    .radio-content strong {
      display: block;
      margin-bottom: 0.25rem;
    }

    .radio-content p {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
    }

    mat-slide-toggle {
      margin-bottom: 1rem;
      width: 100%;
    }

    mat-radio-button {
      margin-bottom: 1rem;
      width: 100%;
    }

    .security-actions {
      margin-top: 2rem;
    }

    .action-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
      padding: 1rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .form-actions button {
      min-width: 160px;
      height: 48px;
    }

    .success-message {
      position: fixed;
      top: 24px;
      right: 24px;
      background: #4caf50;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
      animation: slideInRight 0.3s ease-out;
      z-index: 1000;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .settings-container {
        padding: 1rem;
      }

      .settings-row {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        grid-template-columns: 1fr;
      }

      .form-actions {
        justify-content: stretch;
      }

      .form-actions button {
        width: 100%;
      }

      .success-message {
        top: 12px;
        right: 12px;
        left: 12px;
      }
    }
  `]
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