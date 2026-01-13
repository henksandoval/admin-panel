import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonAppearance, MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {Router} from '@angular/router';
import { ButtonComponent } from '@shared/atoms/button/button.component';
import {ButtonColor, ButtonOptions, ButtonShape, ButtonSize} from '@shared/atoms/button/button.model';

interface ButtonConfig {
  readonly buttonOptions: ButtonOptions;
  readonly label: string;
}

interface MatCardInfo {
  readonly title: string;
  readonly description: string;
  readonly buttons: ButtonConfig[];
}

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatButtonToggleModule,
    ButtonComponent
  ],
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.scss'
})
export default class ButtonsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly buttonVariants: MatButtonAppearance[] = ['text', 'elevated', 'outlined', 'filled', 'tonal'];
  private readonly colorRoles: Array<{ color: ButtonColor, label: string, disabled: boolean }> = [
    { color: 'primary', label: 'Primary', disabled: false },
    { color: 'secondary', label: 'Secondary', disabled: false },
    { color: 'tertiary', label: 'Tertiary', disabled: false },
    { color: 'primary', label: 'Disabled', disabled: true }
  ];

  shape = signal<ButtonShape>('rounded');
  size = signal<ButtonSize>('large');
  matCardConfig = signal<MatCardInfo[]>([]);

  ngOnInit(): void {
    this.matCardConfig.set(this.buildAllMatCardConfigs());
  }

  private buildAllMatCardConfigs(): MatCardInfo[] {
    const buttonsData = this.buttonVariants.map(variant => this.buildMatCardConfig(variant));
    console.log(`Buttons data: ${JSON.stringify(buttonsData, null, 2)}`);
    return buttonsData;
  }

  private buildMatCardConfig(variant: MatButtonAppearance): MatCardInfo {
    const variantTitle = variant.charAt(0).toUpperCase() + variant.slice(1);
    return {
      title: `${variantTitle} Buttons`,
      description: `Buttons with ${variant} appearance.`,
      buttons: this.colorRoles.map(role => ({
        label: role.label,
        buttonOptions: {
          variant,
          color: role.color,
          shape: this.shape(),
          size: this.size(),
          type: 'button',
          disabled: role.disabled
        },
      }))
    };
  }

  goBack(): void {
    this.router.navigate(['/pds/index']);
  }

  setShape(shape: ButtonShape): void {
    this.shape.set(shape);
    this.matCardConfig.set(this.buildAllMatCardConfigs());
  }

  setSize(size: ButtonSize): void {
    this.size.set(size);
    this.matCardConfig.set(this.buildAllMatCardConfigs());
  }
}
