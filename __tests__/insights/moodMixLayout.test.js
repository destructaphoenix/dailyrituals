import { moodLabelWidth } from '../../src/insights/moodMixLayout';

describe('moodLabelWidth', () => {
  test('1x scale stays at the base width', () => {
    expect(moodLabelWidth(1)).toBe(96);
  });

  test('1.5x scale grows to 144', () => {
    expect(moodLabelWidth(1.5)).toBe(144);
  });

  test('2.0x scale is capped at 144', () => {
    expect(moodLabelWidth(2.0)).toBe(144);
  });

  test('a scale below 1 never shrinks the column', () => {
    expect(moodLabelWidth(0.85)).toBe(96);
  });

  test('undefined, NaN and non-numeric input fall back to the base width', () => {
    expect(moodLabelWidth(undefined)).toBe(96);
    expect(moodLabelWidth(NaN)).toBe(96);
    expect(moodLabelWidth('abc')).toBe(96);
  });
});
