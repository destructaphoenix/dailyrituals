import { isEmojiish, stripEmoji } from '../../src/entries/emojiInput';
import { MOOD_PALETTE } from '../../src/data';

describe('isEmojiish', () => {
  test('a single emoji is valid', () => {
    expect(isEmojiish('😊')).toBe(true);
  });

  test('an emoji with a variation selector is valid', () => {
    expect(isEmojiish('❤️')).toBe(true);
  });

  test('a ZWJ family emoji is valid', () => {
    expect(isEmojiish('👨‍👩‍👧‍👦')).toBe(true);
  });

  test('a regional-indicator flag emoji is valid', () => {
    expect(isEmojiish('🇮🇳')).toBe(true);
  });

  test('plain ASCII letters are invalid', () => {
    expect(isEmojiish('abc')).toBe(false);
  });

  test('a digit is invalid', () => {
    expect(isEmojiish('1')).toBe(false);
  });

  test('an emoji with a trailing ASCII space is invalid', () => {
    expect(isEmojiish('hi 👋')).toBe(false);
  });

  test('an empty string is invalid', () => {
    expect(isEmojiish('')).toBe(false);
  });

  test('a string of only whitespace is invalid', () => {
    expect(isEmojiish('   ')).toBe(false);
  });

  test('null is invalid', () => {
    expect(isEmojiish(null)).toBe(false);
  });

  test('undefined is invalid', () => {
    expect(isEmojiish(undefined)).toBe(false);
  });

  test('a string longer than 8 code points is invalid', () => {
    expect(isEmojiish('😊'.repeat(9))).toBe(false);
  });

  test('never throws', () => {
    expect(() => isEmojiish(42)).not.toThrow();
    expect(() => isEmojiish({})).not.toThrow();
    expect(() => isEmojiish([])).not.toThrow();
  });
});

describe('stripEmoji', () => {
  test('every MOOD_PALETTE glyph strips to empty, including variation-selector pairs', () => {
    expect(MOOD_PALETTE.every((e) => stripEmoji(e) === '')).toBe(true);
  });

  test('"Café" survives byte-for-byte', () => {
    expect(stripEmoji('Café')).toBe('Café');
  });

  test('the Devanagari "थका" survives byte-for-byte', () => {
    expect(stripEmoji('थका')).toBe('थका');
  });

  test('"Sleepy😴" strips to "Sleepy"', () => {
    expect(stripEmoji('Sleepy😴')).toBe('Sleepy');
  });

  test('a ZWJ sequence strips to empty with no joiner left behind', () => {
    expect(stripEmoji('👨‍👩‍👧')).toBe('');
  });

  test('null and undefined strip to empty', () => {
    expect(stripEmoji(null)).toBe('');
    expect(stripEmoji(undefined)).toBe('');
  });

  test('digits, spaces, hyphens and apostrophes survive', () => {
    expect(stripEmoji("Half-awake 2'o clock")).toBe("Half-awake 2'o clock");
  });
});
