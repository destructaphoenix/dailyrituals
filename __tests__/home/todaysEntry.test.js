import { findTodaysEntry, isEditableToday } from '../../src/home/todaysEntry';
import { dayKeyOf } from '../../src/time/dayKey';

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

describe('the destructive overwrite this closes (IMP-056)', () => {
  // This test used to set process.env.TZ = 'Asia/Kolkata' and derive both keys
  // from a UTC instant. That assignment is INERT under Jest — each test file
  // gets a copy of process.env, so the zone never changed — and the assertions
  // only passed on a machine already at a positive offset. See dayKeyZone.test.js
  // for where the local-vs-UTC divergence is actually proven.
  //
  // What belongs here is narrower and zone-independent: given the two keys the
  // 1am scenario produces, findTodaysEntry/isEditableToday must behave. Neither
  // function reads a clock — they compare dayKey strings — so the keys are
  // fixtures, not computations.
  it('a 01:00 local write is not matched to last night\'s entry', () => {
    // The scenario: a user in a positive-offset zone writing at 01:00 Monday.
    // Their calendar says Monday the 15th; UTC is still Sunday the 14th.
    const oldBuggyKey = '2026-06-14'; // what the old UTC derivation stamped
    const todayLocal = '2026-06-15';  // what the user's calendar actually says

    const sundayEntry = { id: 'e1', dayKey: '2026-06-14', did: 'walked at dawn', wished: '', moods: ['Grateful'] };

    // The bug: under the old UTC key, Sunday's entry looks like "today".
    expect(findTodaysEntry([sundayEntry], oldBuggyKey)).toBe(sundayEntry);
    expect(isEditableToday(sundayEntry, oldBuggyKey)).toBe(true);

    // The fix: under the local key, Sunday's entry is correctly yesterday's
    // — WriteFlow opens blank for Monday instead of prefilling and
    // overwriting it on save.
    expect(findTodaysEntry([sundayEntry], todayLocal)).toBeNull();
    expect(isEditableToday(sundayEntry, todayLocal)).toBe(false);
  });

  // dayKeyOf's half of the same scenario, stated so it holds in every zone:
  // build the instant from LOCAL fields, and the local key must read them back.
  it('dayKeyOf stamps the local calendar day for a 01:00 local instant', () => {
    expect(dayKeyOf(new Date(2026, 5, 15, 1, 0))).toBe('2026-06-15');
  });
});
