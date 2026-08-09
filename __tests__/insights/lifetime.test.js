import { deriveLifetime } from '../../src/insights/lifetime';

const now = new Date(2026, 5, 14, 12, 0); // local noon — dayKeyOf reads local getters

const entries = [
  { dayKey: '2026-06-10', did: 'walked the dog', wished: 'more time' }, // 3 + 2 = 5 words
  { dayKey: '2026-06-10', did: 'second entry same day', wished: '' },   // 4 + 0 = 4 words
  { dayKey: '2026-06-11', did: 'read a book', wished: 'sleep early' },  // 3 + 2 = 5 words
];

describe('deriveLifetime', () => {
  const r = deriveLifetime(entries, { xp: 320, currentStreak: 2, now });

  test('days remembered counts unique days; total entries counts all', () => {
    expect(r.daysRemembered).toBe(2); // 06-10 (x2) + 06-11
    expect(r.totalEntries).toBe(3);
  });
  test('total words sums did + wished across all entries', () => {
    expect(r.totalWords).toBe(14); // 5 + 4 + 5
  });
  test('streaks: passes current through, derives longest', () => {
    expect(r.currentStreak).toBe(2);
    expect(r.longestStreak).toBe(2); // 06-10 → 06-11 is a 2-day run
  });
  test('level + xp from levelFromXp', () => {
    expect(r.level).toBe(3);          // 320 XP → level 3 (Contemplative)
    expect(r.levelName).toBe('Contemplative');
    expect(r.xpEarned).toBe(320);
  });
  test('activeSpan is adaptive (4 days from first entry to now)', () => {
    expect(r.activeSpan).toBe('4 days in'); // 06-10 → 06-14
  });
});

describe('deriveLifetime activeSpan buckets', () => {
  const span = (firstKey) => deriveLifetime([{ dayKey: firstKey, did: 'x', wished: '' }], { now }).activeSpan;
  test('same day → Started today', () => expect(span('2026-06-14')).toBe('Started today'));
  test('one day → 1 day in', () => expect(span('2026-06-13')).toBe('1 day in'));
  test('weeks → N days in', () => expect(span('2026-06-01')).toBe('13 days in'));
  test('months → N months in', () => expect(span('2026-02-14')).toBe('4 months in'));
  test('years → N years in (1 decimal under 2y)', () => expect(span('2025-06-14')).toBe('1.0 years in'));
});

describe('deriveLifetime empty', () => {
  test('no entries → zeros and null span', () => {
    const r = deriveLifetime([], { xp: 0, currentStreak: 0, now });
    expect(r.daysRemembered).toBe(0);
    expect(r.totalEntries).toBe(0);
    expect(r.totalWords).toBe(0);
    expect(r.activeSpan).toBeNull();
  });
});
