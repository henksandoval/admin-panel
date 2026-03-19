import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IdleService } from './idle.service';
import { AUTH_DEFAULTS } from '@auth/models';

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
    it('emits onIdle$ after the configured idle timeout elapses with no activity', () => {
      let idleFired = false;
      service.onIdle$.subscribe(() => { idleFired = true; });

      service.start(5_000, 1_000);

      vi.advanceTimersByTime(4_999);
      expect(idleFired).toBe(false);

      vi.advanceTimersByTime(1);
      expect(idleFired).toBe(true);
    });

    it('emits onWarning$ before the idle timeout when inactivity warning is configured', () => {
      let warningFired = false;
      service.onWarning$.subscribe(() => { warningFired = true; });

      service.start(5_000, 2_000);

      vi.advanceTimersByTime(2_999);
      expect(warningFired).toBe(false);

      vi.advanceTimersByTime(1);
      expect(warningFired).toBe(true);
    });

    it('does not emit onWarning$ when the warning offset exceeds the idle timeout', () => {
      let warningFired = false;
      service.onWarning$.subscribe(() => { warningFired = true; });

      service.start(1_000, 2_000);

      vi.advanceTimersByTime(2_000);
      expect(warningFired).toBe(false);
    });

    it('uses AUTH_DEFAULTS.idleTimeoutMs and idleWarningMs when no arguments are provided', () => {
      let idleFired = false;
      service.onIdle$.subscribe(() => { idleFired = true; });

      service.start();

      vi.advanceTimersByTime(AUTH_DEFAULTS.idleTimeoutMs - 1);
      expect(idleFired).toBe(false);

      vi.advanceTimersByTime(1);
      expect(idleFired).toBe(true);
    });
  });

  describe('activity reset', () => {
    it('resets the idle timer when a user activity event occurs before timeout', () => {
      const document = TestBed.inject(DOCUMENT);
      let idleFired = false;
      service.onIdle$.subscribe(() => { idleFired = true; });

      service.start(5_000, 1_000);

      vi.advanceTimersByTime(4_000);
      document.dispatchEvent(new Event('mousemove'));

      vi.advanceTimersByTime(4_999);
      expect(idleFired).toBe(false);

      vi.advanceTimersByTime(1);
      expect(idleFired).toBe(true);
    });

    it('resets the warning timer when activity occurs after the warning fires', () => {
      const document = TestBed.inject(DOCUMENT);
      let warningCount = 0;
      service.onWarning$.subscribe(() => { warningCount++; });

      service.start(5_000, 2_000);

      vi.advanceTimersByTime(3_001);
      expect(warningCount).toBe(1);

      document.dispatchEvent(new Event('keydown'));

      vi.advanceTimersByTime(3_000);
      expect(warningCount).toBe(2);
    });
  });

  describe('stop()', () => {
    it('cancels pending timers so that onIdle$ does not emit after stop() is called', () => {
      let idleFired = false;
      service.onIdle$.subscribe(() => { idleFired = true; });

      service.start(5_000, 1_000);
      vi.advanceTimersByTime(3_000);
      service.stop();

      vi.advanceTimersByTime(5_000);
      expect(idleFired).toBe(false);
    });

    it('cancels pending timers so that onWarning$ does not emit after stop() is called', () => {
      let warningFired = false;
      service.onWarning$.subscribe(() => { warningFired = true; });

      service.start(5_000, 2_000);
      vi.advanceTimersByTime(2_000);
      service.stop();

      vi.advanceTimersByTime(5_000);
      expect(warningFired).toBe(false);
    });

    it('removes activity event listeners so that activity does not restart timers after stop()', () => {
      const document = TestBed.inject(DOCUMENT);
      let idleFired = false;
      service.onIdle$.subscribe(() => { idleFired = true; });

      service.start(5_000, 1_000);
      service.stop();

      document.dispatchEvent(new Event('mousemove'));
      vi.advanceTimersByTime(10_000);

      expect(idleFired).toBe(false);
    });
  });

  describe('restart via start()', () => {
    it('clears existing timers and starts fresh when start() is called while already running', () => {
      let idleFired = false;
      service.onIdle$.subscribe(() => { idleFired = true; });

      service.start(5_000, 1_000);
      vi.advanceTimersByTime(4_000);

      service.start(5_000, 1_000);

      vi.advanceTimersByTime(4_999);
      expect(idleFired).toBe(false);

      vi.advanceTimersByTime(1);
      expect(idleFired).toBe(true);
    });
  });
});
