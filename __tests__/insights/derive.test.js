import { deriveInsights } from '../../src/insights/derive';

// Fixed reference point: Monday 8 June 2026
const NOW = new Date(2026, 5, 8);

// 7 entries spanning May 28–Jun 5 with a gap after Jun 2.
// Days: Thu 28-May, Fri 29-May, Sat 30-May, Sun 31-May, Mon 1-Jun, Tue 2-Jun, Fri 5-Jun.
const entries = [
  { dayKey: '2026-05-28', mood: 'Grateful' },
  { dayKey: '2026-05-29', mood: 'Tender' },
  { dayKey: '2026-05-30', mood: 'Grateful' },
  { dayKey: '2026-05-31', mood: 'Hopeful' },
  { dayKey: '2026-06-01', mood: 'Proud' },
  { dayKey: '2026-06-02' },                // no mood
  { dayKey: '2026-06-05', mood: 'Grateful' },
];

describe('deriveInsights', () => {
  describe('empty entries', () => {
    test('returns empty:true', () => {
      const d = deriveInsights([], 0, NOW);
      expect(d.empty).toBe(true);
    });

    test('all stats are 0', () => {
      const d = deriveInsights([], 0, NOW);
      expect(d.stats.currentStreak).toBe(0);
      expect(d.stats.longestStreak).toBe(0);
      expect(d.stats.daysKept).toBe(0);
      expect(d.stats.thisMonth).toBe(0);
    });

    test('moodMix is empty array', () => {
      expect(deriveInsights([], 0, NOW).moodMix).toEqual([]);
    });

    test('all rhythm buckets are 0 and peakWeekday is null', () => {
      const d = deriveInsights([], 0, NOW);
      expect(d.rhythm.every((b) => b.n === 0)).toBe(true);
      expect(d.peakWeekday).toBeNull();
    });
  });

  describe('multi-day entries spanning two months', () => {
    test('empty is false', () => {
      expect(deriveInsights(entries, 3, NOW).empty).toBe(false);
    });

    test('daysKept = number of unique dayKeys', () => {
      expect(deriveInsights(entries, 3, NOW).stats.daysKept).toBe(7);
    });

    test('thisMonth counts only entries in NOW\'s month (June 2026 → 3)', () => {
      expect(deriveInsights(entries, 3, NOW).stats.thisMonth).toBe(3);
    });

    test('longestStreak = longest consecutive calendar-day run (May28→Jun2 = 6)', () => {
      expect(deriveInsights(entries, 3, NOW).stats.longestStreak).toBe(6);
    });

    test('currentStreak is passed through in stats', () => {
      expect(deriveInsights(entries, 3, NOW).stats.currentStreak).toBe(3);
    });
  });

  describe('longestStreak guard', () => {
    test('is always >= currentStreak even when derived run is shorter', () => {
      const d = deriveInsights(entries, 10, NOW);
      expect(d.stats.longestStreak).toBe(10);
    });
  });

  describe('moodMix', () => {
    test('counts moods correctly and excludes mood-less entries', () => {
      const { moodMix } = deriveInsights(entries, 3, NOW);
      const grateful = moodMix.find((x) => x.m === 'Grateful');
      expect(grateful).toBeDefined();
      expect(grateful.n).toBe(3);
      // mood-less Jun-02 entry must NOT appear as a mood bucket
      const undef = moodMix.find((x) => x.m === undefined || x.m === null || x.m === '');
      expect(undef).toBeUndefined();
    });

    test('sorted by n descending (Grateful first with 3)', () => {
      const { moodMix } = deriveInsights(entries, 3, NOW);
      expect(moodMix[0].m).toBe('Grateful');
      expect(moodMix[0].n).toBe(3);
    });

    test('only includes moods with n > 0', () => {
      const { moodMix } = deriveInsights(entries, 3, NOW);
      expect(moodMix.every((x) => x.n > 0)).toBe(true);
    });
  });

  describe('rhythm', () => {
    test('returns 7 buckets with Mon-first labels', () => {
      const { rhythm } = deriveInsights(entries, 3, NOW);
      expect(rhythm).toHaveLength(7);
      expect(rhythm.map((b) => b.l)).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
    });

    test('Friday bucket (index 4) has 2 entries (May-29 + Jun-05)', () => {
      const { rhythm } = deriveInsights(entries, 3, NOW);
      expect(rhythm[4].n).toBe(2);
    });

    test('Wednesday bucket (index 2) has 0 entries', () => {
      const { rhythm } = deriveInsights(entries, 3, NOW);
      expect(rhythm[2].n).toBe(0);
    });

    test('peakWeekday is "Friday"', () => {
      expect(deriveInsights(entries, 3, NOW).peakWeekday).toBe('Friday');
    });
  });
});
