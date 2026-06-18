import { longestConsecutiveRun, currentStreak, dayKeyToUtcMs, DAY_MS } from '../../src/insights/dateKeys';

describe('longestConsecutiveRun', () => {
  test('empty → 0', () => {
    expect(longestConsecutiveRun([])).toBe(0);
  });
  test('single day → 1', () => {
    expect(longestConsecutiveRun(['2026-06-14'])).toBe(1);
  });
  test('counts the longest consecutive run, ignoring gaps and dupes', () => {
    // 06-01,02,03 (run 3) … gap … 06-10,11 (run 2)
    expect(longestConsecutiveRun(['2026-06-02', '2026-06-01', '2026-06-03', '2026-06-10', '2026-06-11', '2026-06-01']))
      .toBe(3);
  });
});

describe('currentStreak', () => {
  const TODAY = '2026-06-14';

  test('empty entries → 0', () => {
    expect(currentStreak([], TODAY)).toBe(0);
  });

  test('a single entry today → 1', () => {
    expect(currentStreak(['2026-06-14'], TODAY)).toBe(1);
  });

  test('today logged with a 3-day run → 3', () => {
    expect(currentStreak(['2026-06-12', '2026-06-13', '2026-06-14'], TODAY)).toBe(3);
  });

  test('today not logged but yesterday logged → run is still alive', () => {
    expect(currentStreak(['2026-06-11', '2026-06-12', '2026-06-13'], TODAY)).toBe(3);
  });

  test('yesterday also missed (gap ≥ 2) → 0', () => {
    expect(currentStreak(['2026-06-10', '2026-06-11'], TODAY)).toBe(0);
  });

  test('an old run plus only today → 1 (the gap resets it)', () => {
    expect(currentStreak(['2026-06-01', '2026-06-14'], TODAY)).toBe(1);
  });

  test('handles unordered + duplicate keys', () => {
    expect(currentStreak(['2026-06-14', '2026-06-13', '2026-06-14', '2026-06-12'], TODAY)).toBe(3);
  });
});

describe('dayKeyToUtcMs', () => {
  test('two adjacent days differ by exactly DAY_MS', () => {
    expect(dayKeyToUtcMs('2026-06-02') - dayKeyToUtcMs('2026-06-01')).toBe(DAY_MS);
  });
});
