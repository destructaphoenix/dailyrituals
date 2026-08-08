import { moodByWeekday, moodByMonth, moodPairings, hasEnoughFor } from '../../src/insights/deeper';

describe('moodByWeekday', () => {
  test('returns 7 Mon-first buckets', () => {
    const buckets = moodByWeekday([]);
    expect(buckets).toHaveLength(7);
    expect(buckets.map((b) => b.l)).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
  });

  test('picks the most frequent mood per weekday', () => {
    const entries = [
      { dayKey: '2026-06-01', moods: ['Tender'] },       // Mon
      { dayKey: '2026-06-08', moods: ['Tender'] },       // Mon
      { dayKey: '2026-06-15', moods: ['Grateful'] },     // Mon
    ];
    const buckets = moodByWeekday(entries);
    expect(buckets[0].top).toBe('Tender');
    expect(buckets[0].n).toBe(2);
    expect(buckets[0].total).toBe(3);
  });

  test('returns top: null on a tie', () => {
    const entries = [
      { dayKey: '2026-06-01', moods: ['Tender'] },
      { dayKey: '2026-06-08', moods: ['Grateful'] },
    ];
    const buckets = moodByWeekday(entries);
    expect(buckets[0].top).toBeNull();
  });

  test('returns top: null for an empty weekday', () => {
    const buckets = moodByWeekday([{ dayKey: '2026-06-01', moods: ['Tender'] }]);
    expect(buckets[1].top).toBeNull();
    expect(buckets[1].n).toBe(0);
    expect(buckets[1].total).toBe(0);
  });

  test('tolerates entries with moods: [], missing moods, or null in the array', () => {
    const entries = [
      { dayKey: '2026-06-01', moods: [] },
      { dayKey: '2026-06-02' },
      { dayKey: '2026-06-03', moods: ['Tender', null] },
    ];
    expect(() => moodByWeekday(entries)).not.toThrow();
    const buckets = moodByWeekday(entries);
    expect(buckets[2].top).toBe('Tender');
  });
});

describe('moodByMonth', () => {
  test('returns 12 buckets sorted by count', () => {
    const buckets = moodByMonth([
      { dayKey: '2026-06-01', moods: ['Tender'] },
      { dayKey: '2026-06-02', moods: ['Tender'] },
      { dayKey: '2027-06-03', moods: ['Grateful'] },
    ]);
    expect(buckets).toHaveLength(12);
    const june = buckets[5];
    expect(june.total).toBe(3);
    expect(june.moods).toEqual([{ m: 'Tender', n: 2 }, { m: 'Grateful', n: 1 }]);
  });

  test('empty months return total: 0', () => {
    const buckets = moodByMonth([{ dayKey: '2026-06-01', moods: ['Tender'] }]);
    expect(buckets[0].total).toBe(0);
    expect(buckets[0].moods).toEqual([]);
  });

  test('tolerates entries with moods: [], missing moods, or null in the array', () => {
    const entries = [
      { dayKey: '2026-01-01', moods: [] },
      { dayKey: '2026-01-02' },
      { dayKey: '2026-01-03', moods: ['Tender', null] },
    ];
    expect(() => moodByMonth(entries)).not.toThrow();
    expect(moodByMonth(entries)[0].moods).toEqual([{ m: 'Tender', n: 1 }]);
  });
});

describe('moodPairings', () => {
  test('counts a 3-mood entry as its 3 pairs', () => {
    const pairs = moodPairings([{ dayKey: '2026-06-01', moods: ['Tender', 'Grateful', 'Hopeful'] }]);
    expect(pairs).toHaveLength(3);
    expect(pairs.reduce((s, p) => s + p.n, 0)).toBe(3);
  });

  test('normalises pair order so [b,a] and [a,b] are one row', () => {
    const pairs = moodPairings([
      { dayKey: '2026-06-01', moods: ['Grateful', 'Tender'] },
      { dayKey: '2026-06-02', moods: ['Tender', 'Grateful'] },
    ]);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toEqual({ a: 'Grateful', b: 'Tender', n: 2 });
  });

  test('sorted by n descending', () => {
    const pairs = moodPairings([
      { dayKey: '2026-06-01', moods: ['A', 'B'] },
      { dayKey: '2026-06-02', moods: ['A', 'B'] },
      { dayKey: '2026-06-03', moods: ['C', 'D'] },
    ]);
    expect(pairs[0]).toEqual({ a: 'A', b: 'B', n: 2 });
    expect(pairs[1]).toEqual({ a: 'C', b: 'D', n: 1 });
  });

  test('returns [] for entries that all have a single mood', () => {
    const pairs = moodPairings([
      { dayKey: '2026-06-01', moods: ['Tender'] },
      { dayKey: '2026-06-02', moods: ['Grateful'] },
    ]);
    expect(pairs).toEqual([]);
  });

  test('tolerates entries with moods: [], missing moods, or null in the array', () => {
    const entries = [
      { dayKey: '2026-06-01', moods: [] },
      { dayKey: '2026-06-02' },
      { dayKey: '2026-06-03', moods: ['Tender', null, 'Grateful'] },
    ];
    expect(() => moodPairings(entries)).not.toThrow();
    expect(moodPairings(entries)).toEqual([{ a: 'Grateful', b: 'Tender', n: 1 }]);
  });
});

describe('hasEnoughFor', () => {
  test('weekday needs >= 14 entries — exactly at the boundary and one below', () => {
    const at = Array.from({ length: 14 }, (_, i) => ({ dayKey: `2026-01-${String(i + 1).padStart(2, '0')}` }));
    const below = at.slice(0, 13);
    expect(hasEnoughFor('weekday', at)).toBe(true);
    expect(hasEnoughFor('weekday', below)).toBe(false);
  });

  test('month needs >= 3 distinct months — exactly at the boundary and one below', () => {
    const at = [
      { dayKey: '2026-01-01' },
      { dayKey: '2026-02-01' },
      { dayKey: '2026-03-01' },
    ];
    const below = at.slice(0, 2);
    expect(hasEnoughFor('month', at)).toBe(true);
    expect(hasEnoughFor('month', below)).toBe(false);
  });

  test('pairings needs >= 5 multi-mood entries — exactly at the boundary and one below', () => {
    const at = Array.from({ length: 5 }, (_, i) => ({ dayKey: `2026-01-${String(i + 1).padStart(2, '0')}`, moods: ['A', 'B'] }));
    const below = at.slice(0, 4);
    expect(hasEnoughFor('pairings', at)).toBe(true);
    expect(hasEnoughFor('pairings', below)).toBe(false);
  });

  test('tolerates entries with moods: [], missing moods, or null in the array', () => {
    const entries = [
      { dayKey: '2026-01-01', moods: [] },
      { dayKey: '2026-01-02' },
      { dayKey: '2026-01-03', moods: ['Tender', null] },
    ];
    expect(() => hasEnoughFor('weekday', entries)).not.toThrow();
    expect(() => hasEnoughFor('month', entries)).not.toThrow();
    expect(() => hasEnoughFor('pairings', entries)).not.toThrow();
  });
});
