import { Pipe, PipeTransform } from '@angular/core';
import { AppFilterCriterion } from './app-filter.model';
import { formatCriterionDisplayValue } from './app-filter.utils';

@Pipe({
  name: 'criterionDisplay',
  standalone: true,
})
export class CriterionDisplayPipe implements PipeTransform {
  transform(criterion: AppFilterCriterion): string {
    return formatCriterionDisplayValue(criterion);
  }
}
