import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppPageLayoutComponent, AppSlotContainerDirective } from '@ui-templates/app-page-layout';
import { LayoutZoneCardComponent } from '@features/pds/shared/molecules/layout-zone-card';
import { PdsLayoutShowcaseComponent } from '@features/pds/shared/templates/pds-layout-showcase';

const CODE = `\
<app-page-layout preset="threeColumn">
  <ng-template appSlot="col1"><!-- Column 1 (1/3) --></ng-template>
  <ng-template appSlot="col2"><!-- Column 2 (1/3) --></ng-template>
  <ng-template appSlot="col3"><!-- Column 3 (1/3) --></ng-template>
</app-page-layout>`;

@Component({
  selector: 'app-three-column-example',
  standalone: true,
  imports: [
    AppPageLayoutComponent,
    AppSlotContainerDirective,
    LayoutZoneCardComponent,
    PdsLayoutShowcaseComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-pds-layout-showcase
      title="Three Column Layout"
      description="Three equal content columns. Best for dashboard overviews, KPI metric cards, or categorized content where parallel scanning of three independent areas adds value."
      preset="threeColumn"
      [codeExample]="code">
      <app-page-layout preset="threeColumn">
        <ng-template appSlot="col1">
          <app-layout-zone-card zone="column" span="1/3" />
        </ng-template>
        <ng-template appSlot="col2">
          <app-layout-zone-card zone="column" span="1/3" />
        </ng-template>
        <ng-template appSlot="col3">
          <app-layout-zone-card zone="column" span="1/3" />
        </ng-template>
      </app-page-layout>
    </app-pds-layout-showcase>
  `,
})
export default class ThreeColumnExampleComponent {
  protected readonly code = CODE;
}
