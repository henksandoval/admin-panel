import { TestBed } from '@angular/core/testing';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { CorrelationService } from './correlation.service';

describe('CorrelationService', () => {
  let service: CorrelationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CorrelationService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('generates a non-empty correlation ID on initialization', () => {
    expect(service.id).toBeTruthy();
    expect(typeof service.id).toBe('string');
  });

  it('returns the same correlation ID on successive reads', () => {
    const first = service.id;
    const second = service.id;
    expect(first).toBe(second);
  });

  it('generates a new correlation ID after rotate()', () => {
    const before = service.id;
    service.rotate();
    expect(service.id).not.toBe(before);
  });
});
