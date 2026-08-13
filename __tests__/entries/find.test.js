import { entryForDayKey } from '../../src/entries/find';

const entry = (dayKey, extra = {}) => ({ id: dayKey, dayKey, did: 'did ' + dayKey, wished: 'wished ' + dayKey, moods: ['calm'], ...extra });

describe('entryForDayKey — IMP-052', () => {
  test('finds the entry for a matching dayKey', () => {
    const entries = [entry('2026-06-14'), entry('2026-06-13')];
    expect(entryForDayKey(entries, '2026-06-13')).toEqual(entries[1]);
  });

  test('two entries on one dayKey → the first in array order wins (same as buildHeatmap)', () => {
    const first = entry('2026-06-13', { id: 'newer' });
    const second = entry('2026-06-13', { id: 'older' });
    expect(entryForDayKey([first, second], '2026-06-13')).toBe(first);
  });

  test('no match → null', () => {
    const entries = [entry('2026-06-14')];
    expect(entryForDayKey(entries, '2026-01-01')).toBeNull();
  });

  test('null entries → null, never throws', () => {
    expect(entryForDayKey(null, '2026-06-14')).toBeNull();
  });

  test('empty array → null', () => {
    expect(entryForDayKey([], '2026-06-14')).toBeNull();
  });

  test('a null in the array is skipped, never throws', () => {
    const entries = [null, entry('2026-06-14')];
    expect(entryForDayKey(entries, '2026-06-14')).toEqual(entries[1]);
  });

  test('a row with no dayKey is skipped, never throws', () => {
    const entries = [{ id: 'no-key', did: 'x', wished: 'y' }, entry('2026-06-14')];
    expect(entryForDayKey(entries, '2026-06-14')).toEqual(entries[1]);
  });

  test('no dayKey argument → null', () => {
    const entries = [entry('2026-06-14')];
    expect(entryForDayKey(entries, null)).toBeNull();
  });
});
