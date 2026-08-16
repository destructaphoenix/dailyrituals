import { dayKeyOf } from '../../src/time/dayKey';

describe('dayKeyOf', () => {
  it('returns YYYY-MM-DD for a mid-day date', () => {
    expect(dayKeyOf(new Date(2026, 0, 15, 12, 0))).toBe('2026-01-15');
  });

  it('returns the same local day for a date at 00:30 local', () => {
    expect(dayKeyOf(new Date(2026, 0, 15, 0, 30))).toBe('2026-01-15');
  });

  it('returns the same local day for a date at 23:30 local', () => {
    expect(dayKeyOf(new Date(2026, 0, 15, 23, 30))).toBe('2026-01-15');
  });

  it('zero-pads single-digit months and days', () => {
    expect(dayKeyOf(new Date(2026, 0, 5, 12, 0))).toBe('2026-01-05');
  });

  // The local-vs-UTC divergence is proven in __tests__/zone/dayKeyZone.test.js,
  // which is run under a pinned zone by `npm run test:zone`. It cannot be
  // proven here: this file runs at the machine's own zone, and under UTC the
  // two can never differ. The version that used to live here set
  // `process.env.TZ` at runtime, which is INERT under Jest (each test file gets
  // a copy of process.env), so it was never testing what it claimed — it passed
  // only because the author's machine is at UTC+05:30.

  it('reads local calendar fields, not the UTC ones, at both ends of the day', () => {
    // Zone-independent by construction: a date built from LOCAL fields must
    // read those same fields back, whatever the machine's offset.
    expect(dayKeyOf(new Date(2026, 0, 15, 0, 30))).toBe('2026-01-15');
    expect(dayKeyOf(new Date(2026, 0, 15, 23, 30))).toBe('2026-01-15');
    expect(dayKeyOf(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
    expect(dayKeyOf(new Date(2027, 0, 1, 0, 0))).toBe('2027-01-01');
  });

  it('never throws on an invalid date', () => {
    expect(() => dayKeyOf(new Date('not-a-date'))).not.toThrow();
  });
});
