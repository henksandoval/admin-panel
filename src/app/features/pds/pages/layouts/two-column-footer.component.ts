import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppPageLayoutComponent, AppSlotContainerDirective } from '@ui-templates/app-page-layout';
import { LayoutZoneCardComponent } from '@features/pds/shared/molecules/layout-zone-card';
import { PdsLayoutShowcaseComponent } from '@features/pds/shared/templates/pds-layout-showcase';

const CODE = `\
<app-page-layout preset="twoColumnWithFooter">
  <ng-template appSlot="left"><!-- Left column (1/2) --></ng-template>
  <ng-template appSlot="right"><!-- Right column (1/2) --></ng-template>
  <ng-template appSlot="footer"><!-- Spanning footer: pagination, batch actions --></ng-template>
</app-page-layout>`;

@Component({
  selector: 'app-two-column-footer-example',
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
      title="Two Column + Footer Layout"
      description="Two equal columns with a spanning footer row. Extends the two-column layout with a full-width bottom area for pagination controls, batch operations, or summary information."
      preset="twoColumnWithFooter"
      [codeExample]="code">
      <app-page-layout preset="twoColumnWithFooter">
        <ng-template appSlot="left">
          <app-layout-zone-card zone="column" span="1/2" />
        </ng-template>
        <ng-template appSlot="right">
          <app-layout-zone-card zone="column" span="1/2" />
        </ng-template>
        <ng-template appSlot="footer">
          <app-layout-zone-card zone="footer" span="full" />
        </ng-template>
      </app-page-layout>
    </app-pds-layout-showcase>
  `,
})
export default class TwoColumnFooterExampleComponent {
  protected readonly code = CODE;
}
