import { onThisDay } from '../../src/memory/onThisDay';

describe('onThisDay', () => {
  test('empty history returns []', () => {
    expect(onThisDay([], '2026-08-08')).toEqual([]);
  });

  test('exact year-ago match', () => {
    const entries = [{ id: 1, dayKey: '2025-08-08', did: 'last year' }];
    const result = onThisDay(entries, '2026-08-08');
    expect(result).toEqual([{ entry: entries[0], label: 'A year ago today', monthsBack: 12 }]);
  });

  test('a non-matching year (different month or day) is excluded', () => {
    const entries = [
      { id: 1, dayKey: '2025-08-09', did: 'wrong day' },
      { id: 2, dayKey: '2025-07-08', did: 'wrong month' },
    ];
    expect(onThisDay(entries, '2026-08-08')).toEqual([]);
  });

  test('multiple years at once, ordered newest first', () => {
    const oneYear = { id: 1, dayKey: '2025-08-08', did: '1yr' };
    const threeYears = { id: 2, dayKey: '2023-08-08', did: '3yr' };
    const twoYears = { id: 3, dayKey: '2024-08-08', did: '2yr' };
    const result = onThisDay([threeYears, oneYear, twoYears], '2026-08-08');
    expect(result).toEqual([
      { entry: oneYear, label: 'A year ago today', monthsBack: 12 },
      { entry: twoYears, label: '2 years ago today', monthsBack: 24 },
      { entry: threeYears, label: '3 years ago today', monthsBack: 36 },
    ]);
  });

  test('month fallbacks at 6 / 3 / 1 months back, newest first, when no year match exists', () => {
    const oneMonth = { id: 1, dayKey: '2026-05-08', did: '1mo' };
    const threeMonths = { id: 2, dayKey: '2026-03-08', did: '3mo' };
    const sixMonths = { id: 3, dayKey: '2025-12-08', did: '6mo' };
    const result = onThisDay([sixMonths, threeMonths, oneMonth], '2026-06-08');
    expect(result).toEqual([
      { entry: oneMonth, label: 'A month ago', monthsBack: 1 },
      { entry: threeMonths, label: '3 months ago', monthsBack: 3 },
      { entry: sixMonths, label: '6 months ago', monthsBack: 6 },
    ]);
  });

  test('month fallbacks are suppressed entirely when a year match exists', () => {
    const yearAgo = { id: 1, dayKey: '2025-06-08', did: '1yr' };
    const oneMonth = { id: 2, dayKey: '2026-05-08', did: '1mo' };
    const result = onThisDay([oneMonth, yearAgo], '2026-06-08');
    expect(result).toEqual([{ entry: yearAgo, label: 'A year ago today', monthsBack: 12 }]);
  });

  test('leap day: 29 Feb does not match 28 Feb (year match, both directions)', () => {
    // Today is a non-leap 28 Feb; an entry on a leap-year 29 Feb must not match.
    const leapEntry = { id: 1, dayKey: '2024-02-29', did: 'leap' };
    expect(onThisDay([leapEntry], '2027-02-28')).toEqual([]);

    // Today is a leap-year 29 Feb; an entry on a non-leap 28 Feb must not match.
    const plainEntry = { id: 2, dayKey: '2027-02-28', did: 'plain' };
    expect(onThisDay([plainEntry], '2028-02-29')).toEqual([]);
  });

  test('a 31-day month falling back into a 30-day (or 28/29-day) month does not false-match', () => {
    // 1 month back from 31 March is February, which never has a 31st —
    // must not roll over into early March.
    const rollover = { id: 1, dayKey: '2026-03-03', did: 'would be a false match if rolled over' };
    expect(onThisDay([rollover], '2026-03-31')).toEqual([]);
  });

  test('empty history → []', () => {
    expect(onThisDay([], '2026-08-08')).toEqual([]);
  });

  test('same-day-multiple-entries returns each', () => {
    const a = { id: 1, dayKey: '2025-08-08', did: 'first' };
    const b = { id: 2, dayKey: '2025-08-08', did: 'second' };
    const result = onThisDay([a, b], '2026-08-08');
    expect(result).toEqual([
      { entry: a, label: 'A year ago today', monthsBack: 12 },
      { entry: b, label: 'A year ago today', monthsBack: 12 },
    ]);
  });

  test('malformed entries (missing dayKey, null in the array) never throw', () => {
    const entries = [null, { id: 1, did: 'no dayKey' }, undefined, { id: 2, dayKey: '2025-08-08', did: 'ok' }];
    expect(() => onThisDay(entries, '2026-08-08')).not.toThrow();
    expect(onThisDay(entries, '2026-08-08')).toEqual([
      { entry: entries[3], label: 'A year ago today', monthsBack: 12 },
    ]);
  });
});
