import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LogLevel, LOG_LEVEL } from '@core/logging-audit';
import { LoggingService } from './logging.service';

vi.mock('@env/environment', () => ({
  environment: { logLevel: LogLevel.warn },
}));

describe('LoggingService', () => {
  let service: LoggingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LOG_LEVEL, useValue: LogLevel.warn }
      ]
    });
    service = TestBed.inject(LoggingService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('sends warn and error messages to console when logLevel is warn', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockReturnValue(undefined);
    const errorSpy = vi.spyOn(console, 'error').mockReturnValue(undefined);

    service.warn('Advertencia');
    service.error('Error crítico');

    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('does not send debug and info messages to console when logLevel is warn', () => {
    const debugSpy = vi.spyOn(console, 'debug').mockReturnValue(undefined);
    const infoSpy = vi.spyOn(console, 'info').mockReturnValue(undefined);

    service.debug('Debug message');
    service.info('Info message');

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it('includes the [ERROR] prefix in error log messages', () => {
    const errorSpy = vi.spyOn(console, 'error').mockReturnValue(undefined);

    service.error('Fallo en el servidor');

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^\[ERROR]/),
    );
  });
});
