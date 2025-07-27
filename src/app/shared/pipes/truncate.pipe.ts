// import { Pipe, PipeTransform } from '@angular/core';

// @Pipe({
//   name: 'truncate'
// })
// export class TruncatePipe implements PipeTransform {
//   transform(value: string, limit: number = 50, completeWords: boolean = false, ellipsis: string = '...'): string {
//     if (!value) return '';
    
//     if (value.length <= limit) {
//       return value;
//     }

//     if (completeWords) {
//       const truncated = value.substring(0, limit);
//       const lastSpaceIndex = truncated.lastIndexOf(' ');
      
//       if (lastSpaceIndex > 0) {
//         return truncated.substring(0, lastSpaceIndex) + ellipsis;
//       }
//     }

//     return value.substring(0, limit) + ellipsis;
//   }
// }

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | undefined | null, limit: number = 50, trail: string = '...'): string {
    if (!value) return '';
    
    if (value.length <= limit) {
      return value;
    }
    
    return value.substring(0, limit) + trail;
  }
}