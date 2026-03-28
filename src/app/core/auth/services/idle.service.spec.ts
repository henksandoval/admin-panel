import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IdleService } from './idle.service';
import { AUTH_DEFAULTS } from '@core/auth/models';

describe('IdleService', () => {
  let service: IdleService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(IdleService);
  });

  afterEach(() => {
    service.stop();
    vi.useRealTimers();
  });

  describe('idle timeout', () => {
    it('sets idle signal to true after the configured idle timeout elapses with no activity', () => {
      service.start(5_000, 1_000);

      vi.advanceTimersByTime(4_999);
      expect(service.idle()).toBe(false);

      vi.advanceTimersByTime(1);
      expect(service.idle()).toBe(true);
    });

    it('sets warning signal to true before the idle timeout when inactivity warning is configured', () => {
      service.start(5_000, 2_000);

      vi.advanceTimersByTime(2_999);
      expect(service.warning()).toBe(false);

      vi.advanceTimersByTime(1);
      expect(service.warning()).toBe(true);
    });

    it('does not set warning signal when the warning offset exceeds the idle timeout', () => {
      service.start(1_000, 2_000);

      vi.advanceTimersByTime(2_000);
      expect(service.warning()).toBe(false);
    });

    it('uses AUTH_DEFAULTS.idleTimeoutMs and idleWarningMs when no arguments are provided', () => {
      service.start();

      vi.advanceTimersByTime(AUTH_DEFAULTS.idleTimeoutMs - 1);
      expect(service.idle()).toBe(false);

      vi.advanceTimersByTime(1);
      expect(service.idle()).toBe(true);
    });
  });

  describe('activity reset', () => {
    it('resets the idle timer when a user activity event occurs before timeout', () => {
      const document = TestBed.inject(DOCUMENT);

      service.start(5_000, 1_000);

      vi.advanceTimersByTime(4_000);
      document.dispatchEvent(new Event('mousemove'));

      vi.advanceTimersByTime(4_999);
      expect(service.idle()).toBe(false);

      vi.advanceTimersByTime(1);
      expect(service.idle()).toBe(true);
    });

    it('resets the warning signal and restarts the warning timer when activity occurs after the warning fires', () => {
      const document = TestBed.inject(DOCUMENT);

      service.start(5_000, 2_000);

      vi.advanceTimersByTime(3_001);
      expect(service.warning()).toBe(true);

      document.dispatchEvent(new Event('keydown'));
      expect(service.warning()).toBe(false);

      vi.advanceTimersByTime(3_000);
      expect(service.warning()).toBe(true);
    });
  });

  describe('stop()', () => {
    it('cancels pending timers so that idle signal stays false after stop() is called', () => {
      service.start(5_000, 1_000);
      vi.advanceTimersByTime(3_000);
      service.stop();

      vi.advanceTimersByTime(5_000);
      expect(service.idle()).toBe(false);
    });

    it('cancels pending timers so that warning signal stays false after stop() is called', () => {
      service.start(5_000, 2_000);
      vi.advanceTimersByTime(2_000);
      service.stop();

      vi.advanceTimersByTime(5_000);
      expect(service.warning()).toBe(false);
    });

    it('removes activity event listeners so that activity does not restart timers after stop()', () => {
      const document = TestBed.inject(DOCUMENT);

      service.start(5_000, 1_000);
      service.stop();

      document.dispatchEvent(new Event('mousemove'));
      vi.advanceTimersByTime(10_000);

      expect(service.idle()).toBe(false);
    });
  });

  describe('restart via start()', () => {
    it('clears existing timers and starts fresh when start() is called while already running', () => {
      service.start(5_000, 1_000);
      vi.advanceTimersByTime(4_000);

      service.start(5_000, 1_000);

      vi.advanceTimersByTime(4_999);
      expect(service.idle()).toBe(false);

      vi.advanceTimersByTime(1);
      expect(service.idle()).toBe(true);
    });
  });
});
