// IMP-120 — the consistency grid's cells are dp, not type: only the month
// label and the legend text may scale with the OS font, or the constant
// ~124dp height stops being constant. This is the failure mode the old
// heatGutterWidth existed to avoid and then reintroduced anyway.
import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

let mockDims = { width: 411, height: 891, scale: 2.6, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => mockDims,
}));

import InsightsScreen from '../../src/screens/InsightsScreen';

const setScale = (fontScale) => { mockDims = { ...mockDims, fontScale }; };
afterEach(() => setScale(1));

const entries = [{ dayKey: '2026-06-14', moods: ['calm'] }];

describe('the month strip grid stays dp at large font scale (IMP-120)', () => {
  test('a day cell is 11x11 at fontScale 1', () => {
    setScale(1);
    const view = render(<InsightsScreen entries={entries} streak={1} xp={0} />);
    const style = StyleSheet.flatten(view.getByTestId('mh-cell-2026-06-14').props.style);
    expect(style.width).toBe(11);
    expect(style.height).toBe(11);
  });

  test('the same cell is still 11x11 at fontScale 1.5', () => {
    setScale(1.5);
    const view = render(<InsightsScreen entries={entries} streak={1} xp={0} />);
    const style = StyleSheet.flatten(view.getByTestId('mh-cell-2026-06-14').props.style);
    expect(style.width).toBe(11);
    expect(style.height).toBe(11);
  });
});
