import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusColor'
})
export class StatusColorPipe implements PipeTransform {
  transform(status: string): string {
    switch (status?.toLowerCase()) {
      case 'new':
      case 'open':
        return '#3498db'; // Blue
      case 'in progress':
        return '#f39c12'; // Orange
      case 'completed':
        return '#2ecc71'; // Green
      case 'closed':
        return '#7f8c8d'; // Gray
      case 'urgent':
      case 'high':
        return '#e74c3c'; // Red
      case 'medium':
        return '#f39c12'; // Orange
      case 'low':
        return '#3498db'; // Blue
      default:
        return '#95a5a6'; // Default gray
    }
  }
}