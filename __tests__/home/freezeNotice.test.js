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
      title: 'A candle burned for you.',
      body: 'You missed 13 Jun. A candle spent itself to keep your streak whole. 2 left.',
    });
  });

  test('multiple days, freezes remaining', () => {
    const copy = freezeNoticeCopy(['2026-06-11', '2026-06-12', '2026-06-13'], 1);
    expect(copy).toEqual({
      title: 'A candle burned for you.',
      body: 'You missed 3 days. 3 candles spent themselves to keep your streak whole. 1 left.',
    });
  });

  test('zero freezes left', () => {
    const copy = freezeNoticeCopy(['2026-06-13'], 0);
    expect(copy.body).toBe('You missed 13 Jun. A candle spent itself to keep your streak whole. That was your last one.');
  });

  test('one freeze left', () => {
    const copy = freezeNoticeCopy(['2026-06-13'], 1);
    expect(copy.body).toBe('You missed 13 Jun. A candle spent itself to keep your streak whole. 1 left.');
  });

  test('empty array → null', () => {
    expect(freezeNoticeCopy([], 3)).toBeNull();
  });
});
