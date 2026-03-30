import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('emits a success toast with correct type, message and title when success() is called', async () => {
    service.success('Guardado', 'OK');

    const toasts = await firstValueFrom(service.toasts$);

    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].message).toBe('Guardado');
    expect(toasts[0].title).toBe('OK');
  });

  it('automatically removes a toast after its configured duration elapses', async () => {
    vi.useFakeTimers();

    service.error('Falló', undefined, 3000);

    let toasts = await firstValueFrom(service.toasts$);
    expect(toasts).toHaveLength(1);

    vi.advanceTimersByTime(3000);

    toasts = await firstValueFrom(service.toasts$);
    expect(toasts).toHaveLength(0);
  });

  it('immediately removes the specified toast when remove() is called with its id', async () => {
    service.info('Mensaje');

    let toasts = await firstValueFrom(service.toasts$);
    const toastId = toasts[0].id;

    service.remove(toastId);

    toasts = await firstValueFrom(service.toasts$);
    expect(toasts).toHaveLength(0);
  });

  it('allows multiple toasts of different types to coexist without overwriting each other', async () => {
    service.success('OK');
    service.warning('Aviso');
    service.error('Error');

    const toasts = await firstValueFrom(service.toasts$);

    expect(toasts).toHaveLength(3);
    expect(toasts.find((t) => t.type === 'success')).toBeDefined();
    expect(toasts.find((t) => t.type === 'warning')).toBeDefined();
    expect(toasts.find((t) => t.type === 'error')).toBeDefined();
  });
});
