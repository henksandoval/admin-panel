import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router } from '@angular/router';

type ButtonShape = 'square' | 'rounded';
type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatButtonToggleModule
  ],
  templateUrl: './buttons.component.html'
})
export default class ButtonsComponent {
  private router = inject(Router);

  selectedShape: ButtonShape = 'square';
  selectedSize: ButtonSize = 'medium';

  goBack() {
    this.router.navigate(['/pds/index']);
  }

  onShapeChange(shape: ButtonShape) {
    this.selectedShape = shape;
  }

  onSizeChange(size: ButtonSize) {
    this.selectedSize = size;
  }

  getButtonClasses(): string {
    const classes: string[] = [];

    if (this.selectedShape === 'rounded') {
      classes.push('btn-rounded');
    } else {
      classes.push('btn-square');
    }

    if (this.selectedSize === 'small') {
      classes.push('btn-small');
    } else if (this.selectedSize === 'large') {
      classes.push('btn-large');
    } else {
      classes.push('btn-medium');
    }

    return classes.join(' ');
  }
}
