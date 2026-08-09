import { moodEmoji, MOODS, NO_MOOD_EMOJI, CUSTOM_MOOD_FALLBACK } from '../../src/data';

describe('moodEmoji', () => {
  test('a built-in mood resolves without a custom map', () => {
    expect(moodEmoji('Proud')).toBe('😌');
  });

  test('a built-in mood resolves the same with a custom map passed', () => {
    expect(moodEmoji('Proud', { Sleepy: '😴' })).toBe('😌');
  });

  test('a custom mood present in the map resolves to the map\'s emoji', () => {
    expect(moodEmoji('Sleepy', { Sleepy: '😴' })).toBe('😴');
  });

  test('a custom mood absent from the map falls back to CUSTOM_MOOD_FALLBACK', () => {
    expect(moodEmoji('Sleepy', {})).toBe(CUSTOM_MOOD_FALLBACK);
    expect(moodEmoji('Sleepy')).toBe(CUSTOM_MOOD_FALLBACK);
  });

  test('empty string, undefined and null all fall back to NO_MOOD_EMOJI', () => {
    expect(moodEmoji('')).toBe(NO_MOOD_EMOJI);
    expect(moodEmoji(undefined)).toBe(NO_MOOD_EMOJI);
    expect(moodEmoji(null)).toBe(NO_MOOD_EMOJI);
  });

  test('a built-in name in the custom map is still resolved by the built-in table', () => {
    expect(moodEmoji('Proud', { Proud: '🙂' })).toBe('😌');
  });

  test('never returns an empty string for any input, even with no second argument', () => {
    expect(moodEmoji('Sleepy')).not.toBe('');
    expect(moodEmoji('')).not.toBe('');
    expect(moodEmoji(undefined)).not.toBe('');
    for (const m of MOODS) expect(moodEmoji(m)).not.toBe('');
  });
});
