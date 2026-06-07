import { levelFromXp } from '../../src/profile/level';

describe('levelFromXp', () => {
  it('starts a fresh user at Lv 1 Waking', () => {
    expect(levelFromXp(0)).toEqual({ level: 1, name: 'Waking', into: 0, toNext: 100 });
  });

  it('reports progress within level 1', () => {
    expect(levelFromXp(99)).toEqual({ level: 1, name: 'Waking', into: 99, toNext: 100 });
  });

  it('crosses into level 2 at exactly 100 XP', () => {
    expect(levelFromXp(100)).toEqual({ level: 2, name: 'Noticing', into: 0, toNext: 150 });
  });

  it('reports progress within level 2', () => {
    expect(levelFromXp(120)).toEqual({ level: 2, name: 'Noticing', into: 20, toNext: 150 });
  });

  it('reaches Contemplative at level 3 (250 XP)', () => {
    expect(levelFromXp(250)).toEqual({ level: 3, name: 'Contemplative', into: 0, toNext: 250 });
  });

  it('caps at Lv 7 Keeper of Days with no next level', () => {
    expect(levelFromXp(1900)).toEqual({ level: 7, name: 'Keeper of Days', into: 0, toNext: null });
  });

  it('keeps counting into XP past the top threshold but stays Lv 7', () => {
    expect(levelFromXp(2500)).toEqual({ level: 7, name: 'Keeper of Days', into: 600, toNext: null });
  });

  it('treats negative XP as 0', () => {
    expect(levelFromXp(-5)).toEqual({ level: 1, name: 'Waking', into: 0, toNext: 100 });
  });

  it('treats undefined XP as 0', () => {
    expect(levelFromXp(undefined)).toEqual({ level: 1, name: 'Waking', into: 0, toNext: 100 });
  });
});
