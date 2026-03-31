import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { AppCardComponent } from '@ui-atoms/app-card';
import { PdsApiReferenceComponent, PdsApiReferencePropertyModel } from '../../molecules/pds-api-reference';
import { PdsBestPracticeItemModel, PdsBestPracticesComponent } from '../../molecules/pds-best-practices';

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
  readonly componentTag = input.required<string>();

  readonly apiProperties = input<PdsApiReferencePropertyModel[]>([]);
  readonly bestPractices = input<PdsBestPracticeItemModel[]>([]);
}
