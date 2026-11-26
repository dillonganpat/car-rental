import { describe, it, expect } from 'vitest';
import {
  calcTotalDays, validateRentalDates, overlapQuery, toCents, MAX_RENTAL_DAYS,
} from '../lib/bookingRules.js';

const d = (s) => new Date(`${s}T00:00:00Z`);
const now = new Date('2026-06-10T15:00:00Z');

describe('calcTotalDays', () => {
  it('counts whole days between pickup and return', () => {
    expect(calcTotalDays(d('2026-06-10'), d('2026-06-13'))).toBe(3);
  });
  it('rounds a partial day up', () => {
    expect(calcTotalDays(new Date('2026-06-10T08:00:00Z'), new Date('2026-06-11T09:00:00Z'))).toBe(2);
  });
});

describe('validateRentalDates', () => {
  it('accepts a normal rental starting today', () => {
    expect(validateRentalDates(d('2026-06-10'), d('2026-06-12'), now)).toBeNull();
  });
  it('rejects a pickup in the past', () => {
    expect(validateRentalDates(d('2026-06-09'), d('2026-06-12'), now)).toMatch(/past/);
  });
  it('rejects a return on or before pickup', () => {
    expect(validateRentalDates(d('2026-06-12'), d('2026-06-12'), now)).toMatch(/after pickup/);
    expect(validateRentalDates(d('2026-06-12'), d('2026-06-11'), now)).toMatch(/after pickup/);
  });
  it('rejects rentals longer than the limit', () => {
    const end = new Date(d('2026-06-11').getTime() + (MAX_RENTAL_DAYS + 1) * 86400000);
    expect(validateRentalDates(d('2026-06-11'), end, now)).toMatch(/limited/);
  });
});

describe('overlapQuery', () => {
  it('matches existing bookings that start before the new return and end after the new pickup', () => {
    const q = overlapQuery('car1', d('2026-06-12'), d('2026-06-15'));
    expect(q.pickupDate).toEqual({ $lt: d('2026-06-15') });
    expect(q.returnDate).toEqual({ $gt: d('2026-06-12') });
    expect(q.status.$in).not.toContain('cancelled');
    expect(q.status.$in).not.toContain('completed');
  });
});

describe('toCents', () => {
  it('avoids floating point errors', () => {
    expect(toCents(19.99)).toBe(1999);
    expect(toCents(1.005 * 100)).toBe(10050);
  });
});
