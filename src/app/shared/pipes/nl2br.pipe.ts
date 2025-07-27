import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nl2br'
})
export class Nl2brPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';
    
    return value.replace(/\n/g, '<br>');
  }
}