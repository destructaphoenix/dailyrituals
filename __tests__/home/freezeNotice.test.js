import { addFreezeNotice, freezeNoticeCopy } from '../../src/home/freezeNotice';

describe('addFreezeNotice — IMP-060', () => {
  test('empty + 1 day → appends it', () => {
    const result = addFreezeNotice([], ['2026-06-13']);
    expect(result).toEqual(['2026-06-13']);
  });

  test('existing + new days → appended, order preserved', () => {
    const result = addFreezeNotice(['2026-06-10'], ['2026-06-13', '2026-06-14']);
    expect(result).toEqual(['2026-06-10', '2026-06-13', '2026-06-14']);
  });

  test('a duplicate day is not added twice', () => {
    const result = addFreezeNotice(['2026-06-10'], ['2026-06-10', '2026-06-11']);
    expect(result).toEqual(['2026-06-10', '2026-06-11']);
  });

  test('empty input returns the same reference', () => {
    const pending = ['2026-06-10'];
    const result = addFreezeNotice(pending, []);
    expect(result).toBe(pending);
  });
});

describe('freezeNoticeCopy — IMP-060', () => {
  test('one day, freezes remaining', () => {
    const copy = freezeNoticeCopy(['2026-06-13'], 2);
    expect(copy).toEqual({
      title: 'Your streak is safe.',
      body: 'A candle burned for 13 Jun. 2 left.',
    });
  });

  test('multiple days, freezes remaining', () => {
    const copy = freezeNoticeCopy(['2026-06-11', '2026-06-12', '2026-06-13'], 1);
    expect(copy).toEqual({
      title: 'Your streak is safe.',
      body: '3 candles burned for 3 days you missed. 1 left.',
    });
  });

  test('zero freezes left', () => {
    const copy = freezeNoticeCopy(['2026-06-13'], 0);
    expect(copy.body).toBe('A candle burned for 13 Jun. That was your last one.');
  });

  test('one freeze left', () => {
    const copy = freezeNoticeCopy(['2026-06-13'], 1);
    expect(copy.body).toBe('A candle burned for 13 Jun. 1 left.');
  });

  test('empty array → null', () => {
    expect(freezeNoticeCopy([], 3)).toBeNull();
  });
});
