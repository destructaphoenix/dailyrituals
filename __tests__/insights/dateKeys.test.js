import { longestConsecutiveRun, dayKeyToUtcMs, DAY_MS } from '../../src/insights/dateKeys';

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

describe('dayKeyToUtcMs', () => {
  test('two adjacent days differ by exactly DAY_MS', () => {
    expect(dayKeyToUtcMs('2026-06-02') - dayKeyToUtcMs('2026-06-01')).toBe(DAY_MS);
  });
});
