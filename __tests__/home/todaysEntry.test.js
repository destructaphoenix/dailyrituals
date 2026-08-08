import { findTodaysEntry, isEditableToday } from '../../src/home/todaysEntry';

const TODAY = '2026-06-13';
const YESTERDAY = '2026-06-12';

const ENTRY_TODAY = { id: 'e1', dayKey: TODAY, did: 'worked', wished: 'more rest', moods: ['Calm'] };
const ENTRY_PAST  = { id: 'e2', dayKey: YESTERDAY, did: 'old', wished: 'old wish', moods: ['Tired'] };

describe('findTodaysEntry', () => {
  it('returns the entry whose dayKey matches today', () => {
    const result = findTodaysEntry([ENTRY_TODAY, ENTRY_PAST], TODAY);
    expect(result).toBe(ENTRY_TODAY);
  });

  it('returns null when no entry matches today', () => {
    const result = findTodaysEntry([ENTRY_PAST], TODAY);
    expect(result).toBeNull();
  });

  it('returns null for an empty entries array', () => {
    const result = findTodaysEntry([], TODAY);
    expect(result).toBeNull();
  });

  it('picks the correct entry among many', () => {
    const another = { id: 'e3', dayKey: '2026-06-11', did: 'x', wished: 'y', moods: ['Happy'] };
    const result = findTodaysEntry([another, ENTRY_PAST, ENTRY_TODAY], TODAY);
    expect(result).toBe(ENTRY_TODAY);
  });

  it('does not mutate the input array', () => {
    const arr = [ENTRY_TODAY, ENTRY_PAST];
    const copy = [...arr];
    findTodaysEntry(arr, TODAY);
    expect(arr).toEqual(copy);
  });
});

describe('isEditableToday', () => {
  it('returns true when entry dayKey equals today', () => {
    expect(isEditableToday(ENTRY_TODAY, TODAY)).toBe(true);
  });

  it('returns false for a past entry', () => {
    expect(isEditableToday(ENTRY_PAST, TODAY)).toBe(false);
  });

  it('returns false for null entry', () => {
    expect(isEditableToday(null, TODAY)).toBe(false);
  });

  it('returns false for undefined entry', () => {
    expect(isEditableToday(undefined, TODAY)).toBe(false);
  });
});
