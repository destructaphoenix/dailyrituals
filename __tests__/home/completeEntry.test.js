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
  id: 'new1', day: '31', mon: 'May', wd: 'Saturday',
  dayKey: '2026-06-07', did: 'wrote', wished: '', streak: true, ...overrides,
});

describe('applyCompletion', () => {
  describe('first entry of the day (done: false)', () => {
    const prev = { entries: [], streak: 3, xp: 100, embers: 200, done: false, quests: baseQuests };

    test('rewards: streak +1, xp +gain, embers +gain, done true', () => {
      const next = applyCompletion(prev, makeEntry({ mood: 'Tender' }), { config });
      expect(next.rewarded).toBe(true);
      expect(next.streak).toBe(4);
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

    test('celebrate carries gains + milestone lookup', () => {
      const next = applyCompletion({ ...prev, streak: 6 }, makeEntry(), { config });
      expect(next.celebrate).toEqual({ streak: 7, xp: 50, embers: 15, milestone: 'Seven Suns' });
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
      streak: 4, xp: 150, embers: 215, done: true, quests: baseQuests,
    };

    test('does not reward: streak/xp/embers/done unchanged', () => {
      const next = applyCompletion(prev, makeEntry({ id: 'second' }), { config });
      expect(next.rewarded).toBe(false);
      expect(next.streak).toBe(4);
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
