import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { API_ENDPOINTS } from '../constants/api.constants';
import { 
  EnumResponse,
  EnumValue,
  UserRoleEnum,
  TaskStatusEnum,
  TaskPriorityEnum,
  TaskTypeEnum,
  ProjectStatusEnum,
  SprintStatusEnum,
  EstimationUnitEnum,
  DropdownOption,
  ApiResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class EnumService {
  private enumsSubject = new BehaviorSubject<EnumResponse | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public enums$ = this.enumsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadAllEnums();
  }

  // 🔧 IMPROVED: Better response handling for new format
  loadAllEnums(): Observable<EnumResponse> {
    this.loadingSubject.next(true);
    
    return this.http.get<ApiResponse<EnumResponse>>(API_ENDPOINTS.ENUMS.BASE)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to load enums');
          }
        }),
        tap(enums => {
          this.enumsSubject.next(enums);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // 🔧 IMPROVED: Individual enum getters with better response handling
  getUserRoles(): Observable<UserRoleEnum[]> {
    return this.http.get<ApiResponse<UserRoleEnum[]>>(API_ENDPOINTS.ENUMS.USER_ROLES)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to load user roles');
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  getTaskStatuses(): Observable<TaskStatusEnum[]> {
    return this.http.get<ApiResponse<TaskStatusEnum[]>>(API_ENDPOINTS.ENUMS.TASK_STATUSES)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to load task statuses');
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  getTaskPriorities(): Observable<TaskPriorityEnum[]> {
    return this.http.get<ApiResponse<TaskPriorityEnum[]>>(API_ENDPOINTS.ENUMS.TASK_PRIORITIES)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to load task priorities');
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  getTaskTypes(): Observable<TaskTypeEnum[]> {
    return this.http.get<ApiResponse<TaskTypeEnum[]>>(API_ENDPOINTS.ENUMS.TASK_TYPES)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to load task types');
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  getProjectStatuses(): Observable<ProjectStatusEnum[]> {
    return this.http.get<ApiResponse<ProjectStatusEnum[]>>(API_ENDPOINTS.ENUMS.PROJECT_STATUSES)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to load project statuses');
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  getSprintStatuses(): Observable<SprintStatusEnum[]> {
    return this.http.get<ApiResponse<SprintStatusEnum[]>>(API_ENDPOINTS.ENUMS.SPRINT_STATUSES)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to load sprint statuses');
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // Cached enum getters (from memory)
  getCachedUserRoles(): UserRoleEnum[] {
    return this.enumsSubject.value?.user_roles || [];
  }

  getCachedTaskStatuses(): TaskStatusEnum[] {
    return this.enumsSubject.value?.task_statuses || [];
  }

  getCachedTaskPriorities(): TaskPriorityEnum[] {
    return this.enumsSubject.value?.task_priorities || [];
  }

  getCachedTaskTypes(): TaskTypeEnum[] {
    return this.enumsSubject.value?.task_types || [];
  }

  getCachedProjectStatuses(): ProjectStatusEnum[] {
    return this.enumsSubject.value?.project_statuses || [];
  }

  getCachedSprintStatuses(): SprintStatusEnum[] {
    return this.enumsSubject.value?.sprint_statuses || [];
  }

  getCachedEstimationUnits(): EstimationUnitEnum[] {
    return this.enumsSubject.value?.estimation_units || [];
  }

  // Convert enums to dropdown options
  getUserRoleOptions(): DropdownOption[] {
    return this.getCachedUserRoles().map(role => ({
      value: role.value,
      label: role.label,
      icon: role.icon,
      color: role.color
    }));
  }

  getTaskStatusOptions(): DropdownOption[] {
    return this.getCachedTaskStatuses().map(status => ({
      value: status.value,
      label: status.label,
      icon: status.icon,
      color: status.color
    }));
  }

  getTaskPriorityOptions(): DropdownOption[] {
    return this.getCachedTaskPriorities().map(priority => ({
      value: priority.value,
      label: priority.label,
      icon: priority.icon,
      color: priority.color
    }));
  }

  getTaskTypeOptions(): DropdownOption[] {
    return this.getCachedTaskTypes().map(type => ({
      value: type.value,
      label: type.label,
      icon: type.icon,
      color: type.color
    }));
  }

  getProjectStatusOptions(): DropdownOption[] {
    return this.getCachedProjectStatuses().map(status => ({
      value: status.value,
      label: status.label,
      icon: status.icon,
      color: status.color
    }));
  }

  getSprintStatusOptions(): DropdownOption[] {
    return this.getCachedSprintStatuses().map(status => ({
      value: status.value,
      label: status.label,
      icon: status.icon,
      color: status.color
    }));
  }

  getEstimationUnitOptions(): DropdownOption[] {
    return this.getCachedEstimationUnits().map(unit => ({
      value: unit.value,
      label: unit.label,
      icon: unit.icon,
      color: unit.color
    }));
  }

  // Utility methods
  getEnumLabel(enumArray: EnumValue[], value: string): string {
    const enumItem = enumArray.find(item => item.value === value);
    return enumItem?.label || value;
  }

  getEnumColor(enumArray: EnumValue[], value: string): string {
    const enumItem = enumArray.find(item => item.value === value);
    return enumItem?.color || 'primary';
  }

  getEnumIcon(enumArray: EnumValue[], value: string): string {
    const enumItem = enumArray.find(item => item.value === value);
    return enumItem?.icon || '';
  }

  // Specific utility methods
  getUserRoleLabel(role: string): string {
    return this.getEnumLabel(this.getCachedUserRoles(), role);
  }

  getTaskStatusLabel(status: string): string {
    return this.getEnumLabel(this.getCachedTaskStatuses(), status);
  }

  getTaskStatusColor(status: string): string {
    return this.getEnumColor(this.getCachedTaskStatuses(), status);
  }

  getTaskStatusIcon(status: string): string {
    return this.getEnumIcon(this.getCachedTaskStatuses(), status);
  }

  getTaskPriorityLabel(priority: string): string {
    return this.getEnumLabel(this.getCachedTaskPriorities(), priority);
  }

  getTaskPriorityColor(priority: string): string {
    return this.getEnumColor(this.getCachedTaskPriorities(), priority);
  }

  getTaskPriorityIcon(priority: string): string {
    return this.getEnumIcon(this.getCachedTaskPriorities(), priority);
  }

  getTaskTypeLabel(type: string): string {
    return this.getEnumLabel(this.getCachedTaskTypes(), type);
  }

  getTaskTypeColor(type: string): string {
    return this.getEnumColor(this.getCachedTaskTypes(), type);
  }

  getTaskTypeIcon(type: string): string {
    return this.getEnumIcon(this.getCachedTaskTypes(), type);
  }

  getProjectStatusLabel(status: string): string {
    return this.getEnumLabel(this.getCachedProjectStatuses(), status);
  }

  getProjectStatusColor(status: string): string {
    return this.getEnumColor(this.getCachedProjectStatuses(), status);
  }

  getSprintStatusLabel(status: string): string {
    return this.getEnumLabel(this.getCachedSprintStatuses(), status);
  }

  getSprintStatusColor(status: string): string {
    return this.getEnumColor(this.getCachedSprintStatuses(), status);
  }

  // Status transition helpers
  getNextTaskStatuses(currentStatus: string): TaskStatusEnum[] {
    const currentStatusEnum = this.getCachedTaskStatuses().find(s => s.value === currentStatus);
    if (!currentStatusEnum?.next_statuses) {
      return this.getCachedTaskStatuses();
    }
    
    return this.getCachedTaskStatuses().filter(status => 
      currentStatusEnum.next_statuses!.includes(status.value)
    );
  }

  canTransitionTaskStatus(fromStatus: string, toStatus: string): boolean {
    const statusEnum = this.getCachedTaskStatuses().find(s => s.value === fromStatus);
    if (!statusEnum?.next_statuses) {
      return true; // Allow all transitions if no restrictions defined
    }
    return statusEnum.next_statuses.includes(toStatus);
  }

  isActiveTaskStatus(status: string): boolean {
    const statusEnum = this.getCachedTaskStatuses().find(s => s.value === status);
    return statusEnum?.is_active || false;
  }

  isCompletedTaskStatus(status: string): boolean {
    const statusEnum = this.getCachedTaskStatuses().find(s => s.value === status);
    return statusEnum?.is_completed || false;
  }

  isActiveProjectStatus(status: string): boolean {
    const statusEnum = this.getCachedProjectStatuses().find(s => s.value === status);
    return statusEnum?.is_active || false;
  }

  isActiveSprintStatus(status: string): boolean {
    const statusEnum = this.getCachedSprintStatuses().find(s => s.value === status);
    return statusEnum?.is_active || false;
  }

  // Priority and role hierarchy helpers
  getUserRoleHierarchy(role: string): number {
    const roleEnum = this.getCachedUserRoles().find(r => r.value === role);
    return roleEnum?.hierarchy_level || 0;
  }

  getTaskPrioritySeverity(priority: string): number {
    const priorityEnum = this.getCachedTaskPriorities().find(p => p.value === priority);
    return priorityEnum?.severity_level || 0;
  }

  // Check if enums are loaded
  areEnumsLoaded(): boolean {
    return this.enumsSubject.value !== null;
  }

  // 🔧 IMPROVED: Better error handling for new response format
  private handleError(error: HttpErrorResponse): Observable<never> {
    this.loadingSubject.next(false);
    
    let errorMessage = 'An error occurred while loading enums';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error - handle new response format
      if (error.error?.success === false) {
        // New standardized error format
        errorMessage = error.error.message || `Error ${error.status}`;
      } else if (error.error?.message) {
        // Legacy error format
        errorMessage = error.error.message;
      } else if (error.error?.errors && error.error.errors.length > 0) {
        errorMessage = error.error.errors[0];
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('Enum Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}