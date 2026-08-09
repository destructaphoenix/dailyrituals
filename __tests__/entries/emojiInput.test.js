import { isEmojiish } from '../../src/entries/emojiInput';

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
