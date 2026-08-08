import { applyCompletion } from '../../src/home/completeEntry';

const config = {
  XP_GAIN: 50,
  EMBER_GAIN: 15,
  milestones: { 7: 'Seven Suns' },
};

const baseQuests = [
  { id: 'write', cur: 0, goal: 1, xp: 10 },
  { id: 'feel', cur: 0, goal: 1, xp: 10 },
  { id: 'revisit', cur: 1, goal: 1, xp: 10 },
];

const makeEntry = (overrides = {}) => ({
  id: 'new1', day: '07', mon: 'Jun', wd: 'Sunday',
  dayKey: '2026-06-07', did: 'wrote', wished: '', streak: true, ...overrides,
});

// Newest-first entries on consecutive days ending the day BEFORE `todayKey`.
const priorRun = (todayKey, n) => {
  const [y, m, d] = todayKey.split('-').map(Number);
  return Array.from({ length: n }, (_, i) => {
    const dt = new Date(Date.UTC(y, m - 1, d - 1 - i));
    const key = dt.toISOString().slice(0, 10);
    return makeEntry({ id: 'prev' + i, dayKey: key });
  });
};

describe('applyCompletion', () => {
  describe('first entry of the day (done: false)', () => {
    const prev = { entries: [], xp: 100, embers: 200, done: false, quests: baseQuests };

    test('rewards: xp +gain, embers +gain, done true, rewarded', () => {
      const next = applyCompletion(prev, makeEntry({ mood: 'Tender' }), { config });
      expect(next.rewarded).toBe(true);
      expect(next.xp).toBe(150);
      expect(next.embers).toBe(215);
      expect(next.done).toBe(true);
    });

    test('prepends the new entry', () => {
      const existing = makeEntry({ id: 'old', dayKey: '2026-06-06' });
      const next = applyCompletion(
        { ...prev, entries: [existing] },
        makeEntry({ id: 'new1' }),
        { config }
      );
      expect(next.entries).toHaveLength(2);
      expect(next.entries[0].id).toBe('new1');
    });

    test('celebrate.streak is 1 for a first/lone entry', () => {
      const next = applyCompletion(prev, makeEntry(), { config });
      expect(next.celebrate.streak).toBe(1);
    });

    test('celebrate.streak counts consecutive prior days (continuity)', () => {
      // 6 consecutive days before today + today = a run of 7 → milestone.
      const next = applyCompletion(
        { ...prev, entries: priorRun('2026-06-07', 6) },
        makeEntry({ dayKey: '2026-06-07' }),
        { config }
      );
      expect(next.celebrate).toEqual({ streak: 7, xp: 50, embers: 15, milestone: 'Seven Suns' });
    });

    test('celebrate.streak resets to 1 when logging after a gap', () => {
      const stale = [
        makeEntry({ id: 'a', dayKey: '2026-06-01' }),
        makeEntry({ id: 'b', dayKey: '2026-06-02' }),
      ];
      const next = applyCompletion({ ...prev, entries: stale }, makeEntry({ dayKey: '2026-06-07' }), { config });
      expect(next.celebrate.streak).toBe(1);
    });

    test('celebrate.streak counts a frozen gap day (IMP-039 streak insurance)', () => {
      // 06-05 real, 06-06 frozen (candle covered the miss), today 06-07 → 3.
      const withGap = [makeEntry({ id: 'a', dayKey: '2026-06-05' })];
      const next = applyCompletion(
        { ...prev, entries: withGap },
        makeEntry({ dayKey: '2026-06-07' }),
        { config, frozenDays: ['2026-06-06'] }
      );
      expect(next.celebrate.streak).toBe(3);
    });

    test('celebrate.streak ignores frozenDays that do not connect to today', () => {
      const next = applyCompletion(prev, makeEntry({ dayKey: '2026-06-07' }), { config, frozenDays: ['2026-01-01'] });
      expect(next.celebrate.streak).toBe(1);
    });

    test('celebrate milestone null when no milestone for that streak', () => {
      const next = applyCompletion(prev, makeEntry(), { config });
      expect(next.celebrate.milestone).toBeNull();
    });

    test('xp accumulates uncapped (no XP_MAX ceiling)', () => {
      const next = applyCompletion({ ...prev, xp: 480 }, makeEntry(), { config });
      expect(next.xp).toBe(530);
    });

    test('feel quest completes only when entry.mood is set', () => {
      const withMood = applyCompletion(prev, makeEntry({ mood: 'Tender' }), { config });
      const writeQ = withMood.quests.find((q) => q.id === 'write');
      const feelQ = withMood.quests.find((q) => q.id === 'feel');
      expect(writeQ.cur).toBe(writeQ.goal);
      expect(feelQ.cur).toBe(feelQ.goal);

      const noMood = applyCompletion(prev, makeEntry({ mood: undefined }), { config });
      expect(noMood.quests.find((q) => q.id === 'write').cur).toBe(1);
      expect(noMood.quests.find((q) => q.id === 'feel').cur).toBe(0);
    });
  });

  describe('same-day re-write (done: true)', () => {
    const todays = makeEntry({ id: 'first', dayKey: '2026-06-07' });
    const prev = {
      entries: [todays],
      xp: 150, embers: 215, done: true, quests: baseQuests,
    };

    test('does not reward: xp/embers/done unchanged, not rewarded', () => {
      const next = applyCompletion(prev, makeEntry({ id: 'second' }), { config });
      expect(next.rewarded).toBe(false);
      expect(next.xp).toBe(150);
      expect(next.embers).toBe(215);
      expect(next.done).toBe(true);
    });

    test('replaces today\'s entry instead of stacking (length does not grow)', () => {
      const next = applyCompletion(prev, makeEntry({ id: 'second', dayKey: '2026-06-07' }), { config });
      expect(next.entries).toHaveLength(1);
      expect(next.entries[0].id).toBe('second');
    });

    test('keeps prior days\' entries while replacing today', () => {
      const older = makeEntry({ id: 'yesterday', dayKey: '2026-06-06' });
      const next = applyCompletion(
        { ...prev, entries: [todays, older] },
        makeEntry({ id: 'second', dayKey: '2026-06-07' }),
        { config }
      );
      expect(next.entries).toHaveLength(2);
      expect(next.entries[0].id).toBe('second');
      expect(next.entries.some((e) => e.id === 'yesterday')).toBe(true);
    });

    test('no celebration on a re-write', () => {
      const next = applyCompletion(prev, makeEntry({ id: 'second' }), { config });
      expect(next.celebrate).toBeNull();
    });

    test('quests unchanged on a re-write', () => {
      const next = applyCompletion(prev, makeEntry({ id: 'second' }), { config });
      expect(next.quests).toEqual(prev.quests);
    });
  });
});
