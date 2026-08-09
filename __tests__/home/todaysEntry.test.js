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
  it('a 01:00 local write in a positive-offset zone is not matched to last night\'s entry', () => {
    const originalTZ = process.env.TZ;
    process.env.TZ = 'Asia/Kolkata'; // UTC+5:30 — deterministic in CI and locally
    try {
      // 2026-06-15T01:00 IST is 2026-06-14T19:30 UTC — the 1am scenario from
      // the spec: the user's calendar says Monday, UTC still says Sunday.
      const instant = new Date(Date.UTC(2026, 5, 14, 19, 30));
      const oldBuggyKey = instant.toISOString().slice(0, 10);
      const todayLocal = dayKeyOf(instant);
      expect(oldBuggyKey).toBe('2026-06-14'); // what the old UTC derivation produced
      expect(todayLocal).toBe('2026-06-15');  // what the user's calendar actually says

      const sundayEntry = { id: 'e1', dayKey: '2026-06-14', did: 'walked at dawn', wished: '', moods: ['Grateful'] };

      // The bug: under the old UTC key, Sunday's entry looks like "today".
      expect(findTodaysEntry([sundayEntry], oldBuggyKey)).toBe(sundayEntry);
      expect(isEditableToday(sundayEntry, oldBuggyKey)).toBe(true);

      // The fix: under the local key, Sunday's entry is correctly yesterday's
      // — WriteFlow opens blank for Monday instead of prefilling and
      // overwriting it on save.
      expect(findTodaysEntry([sundayEntry], todayLocal)).toBeNull();
      expect(isEditableToday(sundayEntry, todayLocal)).toBe(false);
    } finally {
      process.env.TZ = originalTZ;
    }
  });
});
