import { streakSubtitle } from '../../src/home/streakCopy';

describe('streakSubtitle', () => {
  test('0 — fresh-start line (not the "n days" pattern)', () => {
    const result = streakSubtitle(0);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toMatch(/0 day/);
  });
  test('1 — singular "1 day running"', () => {
    expect(streakSubtitle(1)).toBe('1 day running — keep it tender.');
  });
  test('4 — plural "4 days running"', () => {
    expect(streakSubtitle(4)).toBe('4 days running — keep it tender.');
  });
  test('1234 — large number still uses digits, not words', () => {
    expect(streakSubtitle(1234)).toBe('1234 days running — keep it tender.');
  });
});
