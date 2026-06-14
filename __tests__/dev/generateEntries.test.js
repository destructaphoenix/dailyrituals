// __tests__/dev/generateEntries.test.js
import { buildEntries, shiftDayKey } from '../../src/dev/generateEntries';
import { MOODS } from '../../src/data';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

describe('shiftDayKey', () => {
  test('subtracts days across a month boundary', () => {
    expect(shiftDayKey('2026-06-01', -1)).toBe('2026-05-31');
    expect(shiftDayKey('2026-06-14', -3)).toBe('2026-06-11');
  });
});

describe('buildEntries', () => {
  test('returns `count` entries, newest-first, ending at endDayKey', () => {
    const e = buildEntries({ count: 3, endDayKey: '2026-06-14', gaps: [] });
    expect(e.map((x) => x.dayKey)).toEqual(['2026-06-14', '2026-06-13', '2026-06-12']);
  });

  test('each entry has the real entry shape', () => {
    const [first] = buildEntries({ count: 1, endDayKey: '2026-06-14' });
    expect(first).toEqual(expect.objectContaining({
      dayKey: '2026-06-14', day: '14', mon: 'Jun', wd: 'Sunday',
      streak: true,
    }));
    expect(typeof first.id).toBe('string');
    expect(typeof first.did).toBe('string');
    expect(typeof first.wished).toBe('string');
    expect(MOODS).toContain(first.mood);
    expect(WEEKDAYS).toContain(first.wd);
  });

  test('gaps create missing days (skull days)', () => {
    const e = buildEntries({ count: 3, endDayKey: '2026-06-14', gaps: [1] });
    expect(e.map((x) => x.dayKey)).toEqual(['2026-06-14', '2026-06-12', '2026-06-11']);
  });

  test('moods cycle through MOODS', () => {
    const e = buildEntries({ count: MOODS.length + 1, endDayKey: '2026-06-14' });
    expect(e[0].mood).toBe(MOODS[0]);
    expect(e[MOODS.length].mood).toBe(MOODS[0]); // wraps
  });

  test('returns [] for count 0', () => {
    expect(buildEntries({ count: 0, endDayKey: '2026-06-14' })).toEqual([]);
  });
});
