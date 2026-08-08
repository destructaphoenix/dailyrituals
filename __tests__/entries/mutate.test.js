import { applyEdit, applyDelete, applyRestore, pruneTrash, streakAfterDelete } from '../../src/entries/mutate';
import { currentStreak, DAY_MS } from '../../src/insights/dateKeys';

const entry = (dayKey, extra = {}) => ({ id: dayKey, dayKey, did: 'did ' + dayKey, wished: 'wished ' + dayKey, mood: 'calm', streak: true, ...extra });

describe('applyEdit — IMP-036', () => {
  test('replaces the day in place, preserving id/dayKey/array position', () => {
    const entries = [entry('2026-06-14'), entry('2026-06-13'), entry('2026-06-12')];
    const next = applyEdit(entries, '2026-06-13', { did: 'new did', wished: 'new wished', mood: 'joyful' });
    expect(next).toHaveLength(3);
    expect(next[0]).toEqual(entries[0]);
    expect(next[2]).toEqual(entries[2]);
    expect(next[1]).toEqual({ id: '2026-06-13', dayKey: '2026-06-13', did: 'new did', wished: 'new wished', mood: 'joyful', streak: true });
  });

  test('does not mutate the input array or its objects', () => {
    const entries = [entry('2026-06-14')];
    const snapshot = JSON.parse(JSON.stringify(entries));
    applyEdit(entries, '2026-06-14', { did: 'changed', wished: 'changed', mood: 'sad' });
    expect(entries).toEqual(snapshot);
  });

  test('editing text does not affect streak or xp — only the entry text changes', () => {
    const entries = [entry('2026-06-14'), entry('2026-06-13')];
    const before = currentStreak(entries.map((e) => e.dayKey), '2026-06-14', {});
    const next = applyEdit(entries, '2026-06-13', { did: 'x', wished: 'y', mood: 'calm' });
    const after = currentStreak(next.map((e) => e.dayKey), '2026-06-14', {});
    expect(after).toBe(before);
  });

  test('on an absent dayKey returns entries unchanged (same reference) — back-fill is unreachable', () => {
    const entries = [entry('2026-06-14')];
    const next = applyEdit(entries, '2026-05-01', { did: 'x', wished: 'y', mood: 'calm' });
    expect(next).toBe(entries);
  });
});

describe('applyDelete — IMP-036', () => {
  const NOW = new Date('2026-06-14T12:00:00Z').getTime();

  test('moves the entry into trash, stamped with deletedAt', () => {
    const entries = [entry('2026-06-14'), entry('2026-06-13')];
    const trash = [];
    const result = applyDelete({ entries, trash }, '2026-06-13', NOW);
    expect(result.entries).toEqual([entry('2026-06-14')]);
    expect(result.trash).toEqual([{ ...entry('2026-06-13'), deletedAt: NOW }]);
  });

  test('never touches xp or embers — the return carries only entries and trash', () => {
    const entries = [entry('2026-06-14')];
    const result = applyDelete({ entries, trash: [] }, '2026-06-14', NOW);
    expect(Object.keys(result).sort()).toEqual(['entries', 'trash']);
  });

  test('does not mutate the input entries/trash arrays', () => {
    const entries = [entry('2026-06-14')];
    const trash = [];
    applyDelete({ entries, trash }, '2026-06-14', NOW);
    expect(entries).toHaveLength(1);
    expect(trash).toHaveLength(0);
  });

  test('a mid-run delete retroactively breaks the streak', () => {
    // Three-day run ending today; deleting the middle day should sever it.
    const entries = [entry('2026-06-14'), entry('2026-06-13'), entry('2026-06-12')];
    const before = currentStreak(entries.map((e) => e.dayKey), '2026-06-14', {});
    expect(before).toBe(3);
    const result = applyDelete({ entries, trash: [] }, '2026-06-13', NOW);
    const after = currentStreak(result.entries.map((e) => e.dayKey), '2026-06-14', {});
    expect(after).toBe(1); // only today remains connected; 06-12 is now orphaned by the gap
  });

  test('on an absent dayKey is a no-op, same references', () => {
    const entries = [entry('2026-06-14')];
    const trash = [];
    const result = applyDelete({ entries, trash }, '2026-01-01', NOW);
    expect(result.entries).toBe(entries);
    expect(result.trash).toBe(trash);
  });
});

describe('streakAfterDelete — IMP-036', () => {
  test('matches what currentStreak returns on the post-delete entries', () => {
    const entries = [entry('2026-06-14'), entry('2026-06-13'), entry('2026-06-12')];
    const n = streakAfterDelete(entries, '2026-06-13', '2026-06-14', []);
    const expected = currentStreak(
      entries.filter((e) => e.dayKey !== '2026-06-13').map((e) => e.dayKey),
      '2026-06-14',
      { frozenDays: [] }
    );
    expect(n).toBe(expected);
    expect(n).toBe(1);
  });

  test('honors frozenDays exactly like currentStreak', () => {
    const entries = [entry('2026-06-14'), entry('2026-06-12')];
    const n = streakAfterDelete(entries, '2026-06-12', '2026-06-14', ['2026-06-13']);
    // deleting 06-12 leaves only 06-14 + the frozen 06-13 bridging nothing new
    expect(n).toBe(2);
  });
});

describe('applyRestore — IMP-036', () => {
  test('re-inserts the entry in dayKey order (newest-first) and empties it from trash', () => {
    const entries = [entry('2026-06-14'), entry('2026-06-12')];
    const trash = [{ ...entry('2026-06-13'), deletedAt: 123 }];
    const result = applyRestore({ entries, trash }, '2026-06-13');
    expect(result.entries).toEqual([entry('2026-06-14'), entry('2026-06-13'), entry('2026-06-12')]);
    expect(result.trash).toEqual([]);
  });

  test('restoring the oldest entry appends at the end', () => {
    const entries = [entry('2026-06-14')];
    const trash = [{ ...entry('2026-06-10'), deletedAt: 123 }];
    const result = applyRestore({ entries, trash }, '2026-06-10');
    expect(result.entries).toEqual([entry('2026-06-14'), entry('2026-06-10')]);
  });

  test('restoring the newest entry prepends at the start', () => {
    const entries = [entry('2026-06-12')];
    const trash = [{ ...entry('2026-06-14'), deletedAt: 123 }];
    const result = applyRestore({ entries, trash }, '2026-06-14');
    expect(result.entries).toEqual([entry('2026-06-14'), entry('2026-06-12')]);
  });

  test('drops the deletedAt stamp on restore', () => {
    const trash = [{ ...entry('2026-06-13'), deletedAt: 999 }];
    const result = applyRestore({ entries: [], trash }, '2026-06-13');
    expect(result.entries[0]).not.toHaveProperty('deletedAt');
  });

  test('on an absent dayKey is a no-op, same references', () => {
    const entries = [entry('2026-06-14')];
    const trash = [];
    const result = applyRestore({ entries, trash }, '2026-01-01');
    expect(result.entries).toBe(entries);
    expect(result.trash).toBe(trash);
  });

  test('does not mutate the input arrays', () => {
    const entries = [entry('2026-06-14')];
    const trash = [{ ...entry('2026-06-13'), deletedAt: 5 }];
    applyRestore({ entries, trash }, '2026-06-13');
    expect(entries).toHaveLength(1);
    expect(trash).toHaveLength(1);
  });
});

describe('pruneTrash — IMP-036', () => {
  const NOW = new Date('2026-06-14T00:00:00Z').getTime();

  test('drops items older than 30 days', () => {
    const trash = [{ dayKey: '2026-04-01', deletedAt: NOW - 31 * DAY_MS }];
    expect(pruneTrash(trash, NOW)).toEqual([]);
  });

  test('keeps the exact 30-day boundary', () => {
    const trash = [{ dayKey: '2026-05-15', deletedAt: NOW - 30 * DAY_MS }];
    expect(pruneTrash(trash, NOW)).toEqual(trash);
  });

  test('one millisecond past the boundary is dropped', () => {
    const trash = [{ dayKey: '2026-05-15', deletedAt: NOW - 30 * DAY_MS - 1 }];
    expect(pruneTrash(trash, NOW)).toEqual([]);
  });

  test('keeps items well within the window', () => {
    const trash = [{ dayKey: '2026-06-10', deletedAt: NOW - 2 * DAY_MS }];
    expect(pruneTrash(trash, NOW)).toEqual(trash);
  });

  test('does not mutate the input array', () => {
    const trash = [{ dayKey: '2026-06-10', deletedAt: NOW - 2 * DAY_MS }, { dayKey: '2026-04-01', deletedAt: NOW - 40 * DAY_MS }];
    const before = [...trash];
    pruneTrash(trash, NOW);
    expect(trash).toEqual(before);
  });
});
