import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * Mock indicator component for PDS - for demonstrating indicator states.
 * This is used in showcase routes and does not depend on the dashboard feature.
 */
@Component({
  selector: 'app-mock-indicator',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div style="padding: 40px; text-align: center; border: 1px solid #e0e0e0; border-radius: 4px;">
      <div style="font-size: 48px; margin-bottom: 16px;">
        <mat-icon style="display: inline-block;">info</mat-icon>
      </div>
      <p style="margin: 0; font-weight: 500;">{{ type | titlecase }} Indicator</p>
      <p style="margin: 8px 0 0; font-size: 12px; color: #999;">{{ type }} state showcase</p>
    </div>
  `,
  styles: []
})
export class MockIndicatorComponent {
  @Input() type: string = 'normal';
}
