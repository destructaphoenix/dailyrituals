import { foldDiacritics, normalize, searchEntries } from '../../src/insights/search';

const entries = [
  { id: '1', dayKey: '2026-06-01', did: 'Went to the market', wished: 'Rested more', mood: 'Tired' },
  { id: '2', dayKey: '2026-06-03', did: 'Had café con leche', wished: 'A slower morning', mood: 'Grateful' },
  { id: '3', dayKey: '2026-06-02', did: 'Fixed the fence', wished: 'To see the market again', mood: 'Proud' },
  { id: '4', dayKey: '2026-06-05', did: 'Quiet day', wished: 'Nothing much', mood: 'Grateful' },
];

describe('foldDiacritics', () => {
  test('strips diacritics', () => {
    expect(foldDiacritics('café')).toBe('cafe');
  });

  test('returns the input unchanged when normalize throws', () => {
    const original = String.prototype.normalize;
    // eslint-disable-next-line no-extend-native
    String.prototype.normalize = () => { throw new Error('unsupported'); };
    expect(foldDiacritics('café')).toBe('café');
    String.prototype.normalize = original;
  });
});

describe('normalize', () => {
  test('folds diacritics, lowercases and trims', () => {
    expect(normalize('  CAFÉ  ')).toBe('cafe');
  });
});

describe('searchEntries', () => {
  test('empty/omitted query returns everything', () => {
    expect(searchEntries(entries)).toHaveLength(4);
    expect(searchEntries(entries, {})).toHaveLength(4);
  });

  test('text matches across both did and wished', () => {
    const byDid = searchEntries(entries, { text: 'fence' });
    expect(byDid.map((e) => e.id)).toEqual(['3']);

    const byWished = searchEntries(entries, { text: 'slower morning' });
    expect(byWished.map((e) => e.id)).toEqual(['2']);
  });

  test('case folding — "MARKET" finds "market"', () => {
    const result = searchEntries(entries, { text: 'MARKET' });
    expect(result.map((e) => e.id).sort()).toEqual(['1', '3']);
  });

  test('diacritic folding — "cafe" finds "café"', () => {
    const result = searchEntries(entries, { text: 'cafe' });
    expect(result.map((e) => e.id)).toEqual(['2']);
  });

  test('mood filter — single', () => {
    const result = searchEntries(entries, { moods: ['Proud'] });
    expect(result.map((e) => e.id)).toEqual(['3']);
  });

  test('mood filter — multi (any-of)', () => {
    const result = searchEntries(entries, { moods: ['Tired', 'Proud'] });
    expect(result.map((e) => e.id).sort()).toEqual(['1', '3']);
  });

  test('date bounds are inclusive at both ends', () => {
    const result = searchEntries(entries, { from: '2026-06-02', to: '2026-06-03' });
    expect(result.map((e) => e.id).sort()).toEqual(['2', '3']);
  });

  test('combined text + mood + date', () => {
    const result = searchEntries(entries, { text: 'market', moods: ['Proud'], from: '2026-06-01', to: '2026-06-05' });
    expect(result.map((e) => e.id)).toEqual(['3']);
  });

  test('no matches → []', () => {
    expect(searchEntries(entries, { text: 'nonexistent word' })).toEqual([]);
  });

  test('results are newest-first', () => {
    const result = searchEntries(entries);
    expect(result.map((e) => e.dayKey)).toEqual(['2026-06-05', '2026-06-03', '2026-06-02', '2026-06-01']);
  });

  test('malformed entries never throw', () => {
    const malformed = [
      { id: 'a', dayKey: '2026-06-01' }, // missing did, wished, mood
      null,
      { id: 'b', dayKey: '2026-06-02', did: 'ok', wished: null, mood: undefined },
    ];
    expect(() => searchEntries(malformed, { text: 'ok' })).not.toThrow();
    expect(() => searchEntries(malformed, { moods: ['Tired'] })).not.toThrow();
    expect(searchEntries(malformed, { text: 'ok' }).map((e) => e && e.id)).toEqual(['b']);
  });
});
