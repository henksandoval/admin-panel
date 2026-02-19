import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AppPageLayoutComponent } from '@shared/templates/app-page-layout/app-page-layout.component';

@Component({
  selector: 'app-two-column-footer-example',
  standalone: true,
  imports: [CommonModule, MatIconModule, AppPageLayoutComponent],
  template: `
    <app-page-layout preset="twoColumnWithFooter" [showEmptySlots]="true">
    </app-page-layout>
  `
})
export default class TwoColumnFooterExampleComponent {
}
