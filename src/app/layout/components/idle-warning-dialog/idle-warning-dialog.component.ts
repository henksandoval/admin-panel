import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '@core/auth/services';
import { IDLE_WARNING_DIALOG_DEFAULTS } from './idle-warning-dialog.component.model';

interface DialogData {
  warningDurationMs?: number;
}

@Component({
  selector: 'app-idle-warning-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './idle-warning-dialog.component.html',
  styleUrl: './idle-warning-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdleWarningDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<IdleWarningDialogComponent>);
  private readonly authService = inject(AuthService);
  private readonly dialogData = inject<DialogData>(MAT_DIALOG_DATA);

  private readonly warningDurationMs = signal(
    this.dialogData?.warningDurationMs ??
      IDLE_WARNING_DIALOG_DEFAULTS.warningDurationMs
  );
  private readonly remainingMs = signal(this.warningDurationMs());

  protected readonly countdownDisplay = computed(() => {
    const ms = this.remainingMs();
    const seconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  });

  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      const duration = this.warningDurationMs();
      this.remainingMs.set(duration);
      this.startCountdown();
    });
  }

  protected onExtend(): void {
    this.stopCountdown();
    this.dialogRef.close();
    this.authService.resetIdleTimer();
  }

  protected onLogout(): void {
    this.stopCountdown();
    this.dialogRef.close();
  }

  private startCountdown(): void {
    this.stopCountdown();
    const interval = 100;

    this.countdownTimer = setInterval(() => {
      this.remainingMs.update((current) => {
        const next = current - interval;
        if (next <= 0) {
          this.stopCountdown();
          this.dialogRef.close();
          return 0;
        }
        return next;
      });
    }, interval);
  }

  private stopCountdown(): void {
    if (this.countdownTimer !== null) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }
}
