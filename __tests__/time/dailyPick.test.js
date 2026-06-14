import { dayNumber, mulberry32, pickForDay } from '../../src/time/dailyPick';

describe('dayNumber', () => {
  it('is identical for the same calendar day regardless of time', () => {
    expect(dayNumber(new Date(2026, 5, 14, 0, 1))).toBe(dayNumber(new Date(2026, 5, 14, 23, 59)));
  });
  it('increments by one the next day', () => {
    expect(dayNumber(new Date(2026, 5, 15))).toBe(dayNumber(new Date(2026, 5, 14)) + 1);
  });
});

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(123); const b = mulberry32(123);
    expect(a()).toBe(b());
    expect(a()).toBe(b());
  });
  it('returns values in [0, 1)', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 50; i++) { const v = r(); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1); }
  });
});

describe('pickForDay', () => {
  const pool = ['a', 'b', 'c', 'd', 'e'];
  it('returns the same item all day for a given date', () => {
    expect(pickForDay(pool, new Date(2026, 5, 14, 8))).toBe(pickForDay(pool, new Date(2026, 5, 14, 20)));
  });
  it('always returns an item from the pool', () => {
    for (let d = 1; d <= 28; d++) {
      expect(pool).toContain(pickForDay(pool, new Date(2026, 5, d)));
    }
  });
  it('the salt changes which item is picked', () => {
    const date = new Date(2026, 5, 14);
    const picks = new Set([pickForDay(pool, date, 0), pickForDay(pool, date, 1), pickForDay(pool, date, 2), pickForDay(pool, date, 3)]);
    expect(picks.size).toBeGreaterThan(1);
  });
  it('returns empty string for an empty pool', () => {
    expect(pickForDay([], new Date())).toBe('');
  });
});
