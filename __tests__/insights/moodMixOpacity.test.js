// IMP-126 — mood mix shades each bar `opacity: 1 - i * 0.1`; at index 10 that
// is 0 and past it negative, so a journal with more than 8 distinct moods
// renders a bar that is in the data and cannot be seen.
import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import InsightsScreen from '../../src/screens/InsightsScreen';

// 12 distinct moods with strictly descending counts so derive's sort-by-count
// leaves them in mood0..mood11 order (mood0 logged most, mood11 least).
const entries = Array.from({ length: 12 }, (_, i) => {
  const m = `mood${i}`;
  const count = 12 - i;
  return Array.from({ length: count }, () => ({ dayKey: '2026-01-01', moods: [m] }));
}).flat();

describe('mood mix bar opacity floors at 0.3 (IMP-126)', () => {
  test('the 11th and 12th bars stay visible, not 0 or negative', () => {
    const view = render(<InsightsScreen entries={entries} streak={1} xp={0} />);
    const bar10 = StyleSheet.flatten(view.getByTestId('mood-bar-mood10').props.style);
    const bar11 = StyleSheet.flatten(view.getByTestId('mood-bar-mood11').props.style);
    expect(bar10.opacity).toBe(0.3);
    expect(bar11.opacity).toBe(0.3);
  });

  test('the 8th bar (index 7) is unchanged at 0.3 — the clamp changes nothing that already worked', () => {
    const view = render(<InsightsScreen entries={entries} streak={1} xp={0} />);
    const bar7 = StyleSheet.flatten(view.getByTestId('mood-bar-mood7').props.style);
    expect(bar7.opacity).toBe(0.3);
  });
});
