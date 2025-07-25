import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeDuration'
})
export class TimeDurationPipe implements PipeTransform {
  transform(hours: number, format: 'short' | 'long' = 'short'): string {
    if (!hours || hours === 0) {
      return format === 'short' ? '0h' : '0 hours';
    }

    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    const minutes = Math.floor((hours % 1) * 60);

    if (format === 'short') {
      let result = '';
      if (days > 0) result += `${days}d `;
      if (remainingHours > 0) result += `${remainingHours}h `;
      if (minutes > 0 && days === 0) result += `${minutes}m`;
      return result.trim() || '0h';
    } else {
      let parts: string[] = [];
      if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
      if (remainingHours > 0) parts.push(`${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`);
      if (minutes > 0 && days === 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
      return parts.join(', ') || '0 hours';
    }
  }
}