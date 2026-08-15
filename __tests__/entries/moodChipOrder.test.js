import { orderMoodChips, allMoodChips } from '../../src/entries/moodChipOrder';

describe('orderMoodChips — IMP-065', () => {
  test('nothing selected returns the same array reference', () => {
    const all = ['Happy', 'Sad', 'Grateful'];
    expect(orderMoodChips(all, [])).toBe(all);
  });

  test('one selected moves to index 0', () => {
    const all = ['Happy', 'Sad', 'Grateful'];
    expect(orderMoodChips(all, ['Grateful'])[0]).toBe('Grateful');
  });

  test('two selected keep their order relative to each other', () => {
    const all = ['Happy', 'Sad', 'Grateful', 'Anxious'];
    expect(orderMoodChips(all, ['Anxious', 'Happy'])).toEqual(['Happy', 'Anxious', 'Sad', 'Grateful']);
  });

  test('the unselected tail keeps its original order', () => {
    const all = ['Happy', 'Sad', 'Grateful', 'Anxious'];
    expect(orderMoodChips(all, ['Grateful'])).toEqual(['Grateful', 'Happy', 'Sad', 'Anxious']);
  });

  test('a selected name not present in all is ignored — no crash, no insert', () => {
    const all = ['Happy', 'Sad'];
    expect(orderMoodChips(all, ['Nonexistent'])).toEqual(['Happy', 'Sad']);
  });

  test('non-array inputs return [] / are treated as nothing selected', () => {
    expect(orderMoodChips(undefined, ['Happy'])).toEqual([]);
    expect(orderMoodChips(null, ['Happy'])).toEqual([]);
    const all = ['Happy', 'Sad'];
    expect(orderMoodChips(all, undefined)).toBe(all);
    expect(orderMoodChips(all, null)).toBe(all);
  });
});

describe('allMoodChips', () => {
  test('no customs returns the built-ins in order', () => {
    const builtIn = ['Happy', 'Sad', 'Grateful'];
    expect(allMoodChips(builtIn, [])).toEqual(builtIn);
  });

  test('a custom that exactly equals a built-in is dropped and the built-in stays', () => {
    expect(allMoodChips(['Happy', 'Sad'], ['Happy'])).toEqual(['Happy', 'Sad']);
  });

  test('one differing only in case is dropped', () => {
    expect(allMoodChips(['Grateful', 'Sad'], ['grateful'])).toEqual(['Grateful', 'Sad']);
  });

  test('one differing only in surrounding whitespace is dropped', () => {
    expect(allMoodChips(['Grateful', 'Sad'], [' Grateful '])).toEqual(['Grateful', 'Sad']);
  });

  test('two identical customs collapse to one', () => {
    expect(allMoodChips(['Happy'], ['Sleepy', 'Sleepy'])).toEqual(['Happy', 'Sleepy']);
  });

  test('non-strings, "" and "   " are skipped and non-array inputs return []', () => {
    expect(allMoodChips(['Happy'], [null, 42, '', '   ', 'Sleepy'])).toEqual(['Happy', 'Sleepy']);
    expect(allMoodChips(undefined, undefined)).toEqual([]);
    expect(allMoodChips(null, null)).toEqual([]);
  });
});
