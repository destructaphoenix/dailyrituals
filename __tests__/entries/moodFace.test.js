import { hashKey, moodFace } from '../../src/entries/moodFace';

describe('hashKey', () => {
  test('is deterministic for the same string', () => {
    expect(hashKey('2026-08-10')).toBe(hashKey('2026-08-10'));
  });

  test('differs for different strings (generally)', () => {
    expect(hashKey('2026-08-10')).not.toBe(hashKey('2026-08-11'));
  });

  test('never throws on an empty string', () => {
    expect(() => hashKey('')).not.toThrow();
  });
});

describe('moodFace', () => {
  test('a single-mood day returns the same mood for every tick 0–10', () => {
    for (let tick = 0; tick <= 10; tick++) {
      expect(moodFace(['Proud'], tick, '2026-08-10')).toBe('Proud');
    }
  });

  test('a 3-mood day cycles all three across consecutive ticks and returns to the first', () => {
    const moods = ['Proud', 'Tender', 'Grateful'];
    const dayKey = '2026-08-10';
    const start = moods.indexOf(moodFace(moods, 0, dayKey));
    const seen = [];
    for (let tick = 0; tick < moods.length; tick++) seen.push(moodFace(moods, tick, dayKey));
    expect(new Set(seen).size).toBe(3);
    expect(moodFace(moods, moods.length, dayKey)).toBe(moodFace(moods, 0, dayKey));
    expect(start).toBeGreaterThanOrEqual(0);
  });

  test('two different dayKeys with the same moods generally differ at the same tick (phase offset)', () => {
    const moods = ['Proud', 'Tender', 'Grateful'];
    const results = new Set();
    for (let i = 0; i < 20; i++) results.add(moodFace(moods, 0, `day-${i}`));
    expect(results.size).toBeGreaterThan(1);
  });

  test('empty array, null and undefined all return an empty string', () => {
    expect(moodFace([], 0, 'x')).toBe('');
    expect(moodFace(null, 0, 'x')).toBe('');
    expect(moodFace(undefined, 0, 'x')).toBe('');
  });

  test('never throws', () => {
    expect(() => moodFace(['Proud'], 0)).not.toThrow();
    expect(() => moodFace('not-an-array', 0, 'x')).not.toThrow();
  });
});
