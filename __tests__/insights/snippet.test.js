import { foldChar, foldChars, indexOfSeq, entrySnippet } from '../../src/insights/snippet';

describe('foldChar', () => {
  test('folds an accent to its base letter, lowercased', () => {
    expect(foldChar('é')).toBe('e');
    expect(foldChar('É')).toBe('e');
  });

  test('leaves plain ASCII alone but lowercases it', () => {
    expect(foldChar('A')).toBe('a');
    expect(foldChar(' ')).toBe(' ');
  });

  test('returns a single code point even when lowercasing expands', () => {
    // U+0130 lowercases to two code points on some engines. Taking the first
    // keeps the 1:1 map that every index in this module depends on.
    expect([...foldChar('İ')]).toHaveLength(1);
  });

  test('returns the character unchanged when folding empties it', () => {
    // A lone combining mark folds to '' — without the guard the map would shrink.
    const combining = '́';
    expect(foldChar(combining)).toBe(combining);
  });

  test('keeps an emoji as one code point', () => {
    expect(foldChar('🎂')).toBe('🎂');
  });
});

describe('foldChars', () => {
  test('emits exactly one element per input code point', () => {
    const mixed = 'a café 🎂 Ünïcodé';
    expect(foldChars(mixed)).toHaveLength([...mixed].length);
  });

  test('folds the whole string', () => {
    expect(foldChars('Café').join('')).toBe('cafe');
  });

  test('handles null and undefined without throwing', () => {
    expect(foldChars(null)).toEqual([]);
    expect(foldChars(undefined)).toEqual([]);
  });
});

describe('indexOfSeq', () => {
  test('finds a mid-string match by code-point index', () => {
    expect(indexOfSeq([...'abcdef'], [...'cd'])).toBe(2);
  });

  test('finds a match at index 0', () => {
    expect(indexOfSeq([...'abcdef'], [...'ab'])).toBe(0);
  });

  test('returns -1 when absent', () => {
    expect(indexOfSeq([...'abcdef'], [...'xy'])).toBe(-1);
  });

  test('counts an emoji as one position, not two', () => {
    expect(indexOfSeq([...'🎂ab'], [...'ab'])).toBe(1);
  });

  test('an empty needle is not a match', () => {
    expect(indexOfSeq([...'abc'], [])).toBe(-1);
  });
});

describe('entrySnippet', () => {
  const entry = (did, wished = '') => ({ did, wished });

  test('slices around a mid-string match', () => {
    const r = entrySnippet(entry('the quick brown fox'), 'brown');
    expect(r.field).toBe('did');
    expect(r.match).toBe('brown');
    expect(r.before).toBe('the quick ');
    expect(r.after).toBe(' fox');
    expect(r.truncatedStart).toBe(false);
  });

  test('a match at index 0 does not report a truncated start', () => {
    const r = entrySnippet(entry('brown fox'), 'brown');
    expect(r.before).toBe('');
    expect(r.truncatedStart).toBe(false);
  });

  test('clips a long lead and flags it', () => {
    const r = entrySnippet(entry(`${'x'.repeat(100)}needle tail`), 'needle', { lead: 10 });
    expect(r.truncatedStart).toBe(true);
    expect(r.before).toBe('x'.repeat(10));
    expect(r.match).toBe('needle');
  });

  test('is case-insensitive and returns the original casing', () => {
    const r = entrySnippet(entry('The Quick Brown Fox'), 'brown');
    expect(r.match).toBe('Brown');
  });

  test('an unaccented needle highlights the accented original', () => {
    const r = entrySnippet(entry('un café noir'), 'cafe');
    expect(r.match).toBe('café');
    expect(r.before).toBe('un ');
    expect(r.after).toBe(' noir');
  });

  test('an accented needle matches an unaccented original', () => {
    const r = entrySnippet(entry('un cafe noir'), 'café');
    expect(r.match).toBe('cafe');
  });

  test('an emoji before the match does not shift the slice', () => {
    // The surrogate-pair case: UTF-16 indices would be one too far left here.
    const r = entrySnippet(entry('🎂 birthday cake'), 'cake');
    expect(r.match).toBe('cake');
    expect(r.after).toBe('');
  });

  test('several accents before the match keep the slice aligned', () => {
    const r = entrySnippet(entry('éàü then needle'), 'needle');
    expect(r.match).toBe('needle');
    expect(r.before).toBe('éàü then ');
  });

  test('caps the tail at `tail` code points', () => {
    const r = entrySnippet(entry(`needle${'y'.repeat(500)}`), 'needle', { tail: 12 });
    expect(r.after).toBe('y'.repeat(12));
  });

  test('falls through to wished when did does not match', () => {
    const r = entrySnippet(entry('nothing here', 'a slower morning'), 'slower');
    expect(r.field).toBe('wished');
    expect(r.match).toBe('slower');
  });

  test('did wins when both fields match', () => {
    const r = entrySnippet(entry('the market', 'the market again'), 'market');
    expect(r.field).toBe('did');
  });

  test('a match only across the did/wished join yields null', () => {
    // searchEntries concatenates with a space; this deliberately gets no snippet.
    expect(entrySnippet(entry('ends here', 'starts there'), 'here starts')).toBeNull();
  });

  test('an empty or whitespace needle yields null', () => {
    expect(entrySnippet(entry('anything'), '')).toBeNull();
    expect(entrySnippet(entry('anything'), '   ')).toBeNull();
    expect(entrySnippet(entry('anything'), null)).toBeNull();
  });

  test('a needle that is absent yields null', () => {
    expect(entrySnippet(entry('anything'), 'zebra')).toBeNull();
  });

  test('survives null, undefined and fieldless entries', () => {
    expect(entrySnippet(null, 'x')).toBeNull();
    expect(entrySnippet(undefined, 'x')).toBeNull();
    expect(entrySnippet({}, 'x')).toBeNull();
    expect(entrySnippet({ did: null, wished: undefined }, 'x')).toBeNull();
  });
});
