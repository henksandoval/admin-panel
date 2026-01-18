import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PdsCodeBlockComponent } from '../../molecules/pds-code-block/pds-code-block.component';
import { PdsApiReferenceComponent } from '../../molecules/pds-api-reference/pds-api-reference.component';
import { PdsBestPracticesComponent } from '../../molecules/pds-best-practices/pds-best-practices.component';
import { PdsApiReferencePropertyModel } from '../../molecules/pds-api-reference/pds-api-reference-property.model';
import { PdsBestPracticeItemModel } from '../../molecules/pds-best-practices/pds-best-practice-item.model';

@Component({
  selector: 'pds-playground-template',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    PdsCodeBlockComponent,
    PdsApiReferenceComponent,
    PdsBestPracticesComponent
  ],
  templateUrl: './pds-playground-template.component.html',
  styleUrl: './pds-playground-template.component.scss'
})
export class PdsPlaygroundTemplateComponent {
  generatedCode = input.required<string>();

  apiProperties = input.required<PdsApiReferencePropertyModel[]>();

  bestPractices = input.required<PdsBestPracticeItemModel[]>();

  componentTag = input.required<string>();
}
