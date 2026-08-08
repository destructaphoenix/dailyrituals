import {
  deriveAchievements,
  deriveKeepsakes,
  ACHIEVEMENT_DEFS,
} from '../../src/profile/achievements';

// Fixed reference point: Monday 8 June 2026
const NOW = new Date(2026, 5, 8);

describe('deriveAchievements', () => {
  describe('empty (new/reset user)', () => {
    const ach = deriveAchievements([], 0, NOW);

    test('returns one row per ACHIEVEMENT_DEFS entry', () => {
      expect(ach).toHaveLength(ACHIEVEMENT_DEFS.length);
    });

    test('every cur is 0', () => {
      expect(ach.every((a) => a.cur === 0)).toBe(true);
    });

    test('every done is false', () => {
      expect(ach.every((a) => a.done === false)).toBe(true);
    });

    test('earned count is 0', () => {
      expect(ach.filter((a) => a.done).length).toBe(0);
    });
  });

  describe('a fixed entry set (Jun 1–3 consecutive, 2 of 3 with a mood)', () => {
    const entries = [
      { dayKey: '2026-06-01', moods: ['Grateful'] },
      { dayKey: '2026-06-02', moods: ['Proud'] },
      { dayKey: '2026-06-03', moods: [] }, // no mood
    ];
    const ach = deriveAchievements(entries, 0, NOW);
    const byId = (id) => ach.find((a) => a.id === id);

    test('firstlight (daysKept ≥ 1) is done, cur clamped to goal 1', () => {
      expect(byId('firstlight').done).toBe(true);
      expect(byId('firstlight').cur).toBe(1);
    });

    test('seven (longestStreak, goal 7) shows cur 3, not done', () => {
      expect(byId('seven').cur).toBe(3);
      expect(byId('seven').done).toBe(false);
    });

    test('honest tracks moodsLogged (2) — excludes the mood-less entry', () => {
      expect(byId('honest').cur).toBe(2);
      expect(byId('honest').done).toBe(false);
    });

    test('moonlit tracks daysKept (3)', () => {
      expect(byId('moonlit').cur).toBe(3);
    });
  });

  describe('done flips exactly at goal', () => {
    const sevenDays = Array.from({ length: 7 }, (_, i) => ({
      dayKey: `2026-06-0${i + 1}`,
    }));

    test('7-day consecutive run → "seven" done at goal', () => {
      const ach = deriveAchievements(sevenDays, 0, NOW);
      expect(ach.find((a) => a.id === 'seven').done).toBe(true);
    });

    test('6-day run → "seven" not done, cur 6', () => {
      const ach = deriveAchievements(sevenDays.slice(0, 6), 0, NOW);
      const seven = ach.find((a) => a.id === 'seven');
      expect(seven.done).toBe(false);
      expect(seven.cur).toBe(6);
    });
  });

  describe('cur never exceeds goal', () => {
    test('large stats clamp to each goal', () => {
      // 100 consecutive days, each with a mood → every stat well over its goal.
      const many = Array.from({ length: 100 }, (_, i) => {
        const d = new Date(2026, 2, 1 + i); // start 1 Mar 2026
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return { dayKey: key, moods: ['Proud'] };
      });
      const ach = deriveAchievements(many, 0, new Date(2026, 11, 1));
      ach.forEach((a) => expect(a.cur).toBeLessThanOrEqual(a.goal));
    });
  });
});

describe('deriveKeepsakes (Home medal strip)', () => {
  test('new user → five medals, fixed order/ids, none earned', () => {
    const k = deriveKeepsakes([], 0, NOW);
    expect(k).toHaveLength(5);
    expect(k.map((m) => m.id)).toEqual([
      'firstlight',
      'seven',
      'honest',
      'steadfast',
      'fullcircle',
    ]);
    expect(k.every((m) => m.earned === false)).toBe(true);
  });

  test('first entry lights First Light only', () => {
    const k = deriveKeepsakes([{ dayKey: '2026-06-01', moods: ['Grateful'] }], 0, NOW);
    const byId = (id) => k.find((m) => m.id === id);
    expect(byId('firstlight').earned).toBe(true);
    expect(byId('seven').earned).toBe(false);
    expect(byId('steadfast').earned).toBe(false);
    expect(byId('fullcircle').earned).toBe(false);
  });
});
