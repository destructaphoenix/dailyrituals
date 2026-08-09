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

  it('reads the LOCAL calendar day, which differs from toISOString().slice(0, 10) once the offset crosses midnight', () => {
    // 2026-01-15T23:30:00Z is still the 15th in UTC, but Kiribati (UTC+14)
    // has already turned over to the 16th. Pin TZ explicitly so this is
    // deterministic in CI and on the owner's machine alike, not whatever
    // zone happens to be running the test.
    const originalTZ = process.env.TZ;
    process.env.TZ = 'Pacific/Kiritimati';
    try {
      const instant = new Date(Date.UTC(2026, 0, 15, 23, 30));
      expect(instant.toISOString().slice(0, 10)).toBe('2026-01-15');
      expect(dayKeyOf(instant)).toBe('2026-01-16');
    } finally {
      process.env.TZ = originalTZ;
    }
  });

  it('never throws on an invalid date', () => {
    expect(() => dayKeyOf(new Date('not-a-date'))).not.toThrow();
  });
});
