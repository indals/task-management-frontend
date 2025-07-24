/**
 * Utility class for date operations
 */
export class DateUtil {
  /**
   * Format date to display format
   */
  static formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format date to API format (yyyy-MM-dd)
   */
  static formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Check if date is overdue
   */
  static isOverdue(dueDate: string | Date): boolean {
    const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);
    return dateObj < today;
  }

  /**
   * Get days until due date
   */
  static getDaysUntilDue(dueDate: string | Date): number {
    const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const today = new Date();
    const diffTime = dateObj.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if date is today
   */
  static isToday(date: string | Date): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return dateObj.toDateString() === today.toDateString();
  }
}