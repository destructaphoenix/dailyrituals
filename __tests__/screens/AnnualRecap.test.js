// IMP-098 — the Annual Recap's Top moods bars start in one place.
//
// Grateful, Heavy and Hopeful all read 14 but drew three different bar
// lengths: AnnualRecap.js:86 gave the label column `minWidth: 84`, a floor
// not a width, so the column tracked its content and every row's bar track
// started at a different x. IMP-067 already fixed the identical row in
// InsightsScreen's Mood Mix with `moodLabelWidth` — this is that fix reused,
// not a new design.
import React from 'react';
import fs from 'fs';
import path from 'path';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

let mockDims = { width: 411, height: 891, scale: 2.6, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => mockDims,
}));

import AnnualRecap from '../../src/screens/AnnualRecap';

const SRC = fs.readFileSync(path.join(__dirname, '../../src/screens/AnnualRecap.js'), 'utf8');

const recap = {
  year: 2025, daysRemembered: 111, totalWords: 8288, longestStreak: 111,
  firstEntry: '2025-09-12', lastEntry: '2025-12-31',
  topMoods: [{ m: 'Grateful', n: 14 }, { m: 'Heavy', n: 14 }, { m: 'Hopeful', n: 14 }],
  peakMonth: 'October', quietestMonth: 'September',
  milestones: [{ day: '2025-09-12', label: 'First entry of the year' }],
};

const setScale = (fontScale) => { mockDims = { ...mockDims, fontScale }; };

// `T` wraps its own `Text` (host Text -> composite T), so the label column
// View is three levels up from the mood name's host text node.
const labelStyle = (view, mood) => StyleSheet.flatten(view.getByText(mood).parent.parent.parent.props.style);

afterEach(() => setScale(1));

describe('Top moods — the label column width', () => {
  test('at fontScale 1 every label column has the same width, 96', () => {
    setScale(1);
    const view = render(<AnnualRecap recap={recap} />);
    expect(labelStyle(view, 'Grateful').width).toBe(96);
    expect(labelStyle(view, 'Heavy').width).toBe(96);
    expect(labelStyle(view, 'Hopeful').width).toBe(96);
  });

  test('at fontScale 1.5 and 2.0 every column is capped at 144', () => {
    setScale(1.5);
    let view = render(<AnnualRecap recap={recap} />);
    expect(labelStyle(view, 'Grateful').width).toBe(144);
    expect(labelStyle(view, 'Hopeful').width).toBe(144);

    setScale(2.0);
    view = render(<AnnualRecap recap={recap} />);
    expect(labelStyle(view, 'Grateful').width).toBe(144);
    expect(labelStyle(view, 'Hopeful').width).toBe(144);
  });

  test('source contains no minWidth: 84', () => {
    expect(SRC).not.toMatch(/minWidth:\s*84/);
  });

  test('counts and the opacity ramp are untouched', () => {
    const view = render(<AnnualRecap recap={recap} />);
    expect(view.getAllByText('14').length).toBe(3);
    // The fix touches only the label column; the bar fill's shade ramp
    // (row 0 -> opacity 1, row 2 -> 0.8) is what still tells equal-count
    // rows apart, so it must survive untouched.
    expect(SRC).toContain('opacity: 1 - i * 0.1');
  });
});
