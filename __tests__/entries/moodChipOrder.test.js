import { orderMoodChips } from '../../src/entries/moodChipOrder';

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
