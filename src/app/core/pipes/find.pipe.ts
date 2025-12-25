import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'find',
  standalone: true
})
export class FindPipe implements PipeTransform {
  transform<T>(value: T[] | null, searchTerm: any, property: keyof T): T | undefined {
    if (!value) {
      return undefined;
    }
    return value.find(item => item[property] === searchTerm);
  }
}
