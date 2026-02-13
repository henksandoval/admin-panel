import { Pipe, PipeTransform } from '@angular/core';
import { AppTableFilterCriterion } from './app-table-filters-advanced.model';
import { formatCriterionDisplayValue } from './app-table-filters-advanced.utils';

@Pipe({
  name: 'criterionDisplay',
  standalone: true,
})
export class CriterionDisplayPipe implements PipeTransform {
  transform(criterion: AppTableFilterCriterion): string {
    return formatCriterionDisplayValue(criterion);
  }
}
