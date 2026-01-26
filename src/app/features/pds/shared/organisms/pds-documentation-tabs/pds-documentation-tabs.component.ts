import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { AppCardComponent } from '@shared/atoms/app-card/app-card.component';
import { PdsApiReferenceComponent } from '../../molecules/pds-api-reference/pds-api-reference.component';
import { PdsBestPracticesComponent } from '../../molecules/pds-best-practices/pds-best-practices.component';
import { PdsApiReferencePropertyModel } from '../../molecules/pds-api-reference/pds-api-reference-property.model';
import { PdsBestPracticeItemModel } from '../../molecules/pds-best-practices/pds-best-practice-item.model';

@Component({
  selector: 'app-pds-documentation-tabs',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTabsModule,
    AppCardComponent,
    PdsApiReferenceComponent,
    PdsBestPracticesComponent,
  ],
  templateUrl: './pds-documentation-tabs.component.html',
  styleUrl: './pds-documentation-tabs.component.scss'
})
export class PdsDocumentationTabsComponent {
  componentTag = input.required<string>();
  
  apiProperties = input<PdsApiReferencePropertyModel[]>([]);
  bestPractices = input<PdsBestPracticeItemModel[]>([]);
}
