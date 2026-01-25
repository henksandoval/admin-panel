import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { PdsCodeBlockComponent } from '../../molecules/pds-code-block/pds-code-block.component';
import { PdsApiReferenceComponent } from '../../molecules/pds-api-reference/pds-api-reference.component';
import { PdsBestPracticesComponent } from '../../molecules/pds-best-practices/pds-best-practices.component';
import { PdsApiReferencePropertyModel } from '../../molecules/pds-api-reference/pds-api-reference-property.model';
import { PdsBestPracticeItemModel } from '../../molecules/pds-best-practices/pds-best-practice-item.model';

@Component({
  selector: 'app-pds-tabs-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    PdsCodeBlockComponent,
    PdsApiReferenceComponent,
    PdsBestPracticesComponent
  ],
  templateUrl: './pds-tabs-layout.component.html',
  styleUrl: './pds-tabs-layout.component.scss'
})
export class PdsTabsLayoutComponent {
  title = input.required<string>();
  description = input.required<string>();
  componentTag = input.required<string>();

  code = input<string>('');
  apiProperties = input<PdsApiReferencePropertyModel[]>([]);
  bestPractices = input<PdsBestPracticeItemModel[]>([]);

  showCodeTab = input<boolean>(true);
  showApiTab = input<boolean>(true);
  showBestPracticesTab = input<boolean>(true);
  showCustomTabs = input<boolean>(false);

  backRoute = input<string>('/pds/index');
  showBackButton = input<boolean>(true);
}
