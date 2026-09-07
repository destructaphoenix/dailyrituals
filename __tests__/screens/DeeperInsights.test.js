// IMP-095 — "Moods by season" at large font.
//
// ⚠️ Jest renders a TREE, not pixels. It cannot see the defect that opened this
// row: at OS font_scale 2.0 the month names wrapped MID-WORD ("Septemb/er")
// inside their 84dp box, and the third mood was ellipsised away. Nothing below
// measures a glyph. These tests pin the layout DECISION — which branch renders
// and with which props — and the mid-word wrap itself is only ever settled by
// the WALK-08 emulator re-run at max font.
import React from 'react';
import fs from 'fs';
import path from 'path';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

// `mock`-prefixed so jest's out-of-scope guard lets the factory close over it.
let mockDims = { width: 411, height: 891, scale: 2.6, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => mockDims,
}));

import DeeperInsights from '../../src/screens/DeeperInsights';

const SRC = fs.readFileSync(path.join(__dirname, '../../src/screens/DeeperInsights.js'), 'utf8');

// hasEnoughFor('month') needs 3 distinct months; moodByMonth drops empty ones.
// September/November/December are the three that wrapped on the emulator.
const entries = [
  { dayKey: '2026-09-04', moods: ['Heavy', 'Light', 'Grateful'] },
  { dayKey: '2026-09-05', moods: ['Heavy', 'Light', 'Grateful'] },
  { dayKey: '2026-11-04', moods: ['Heavy', 'Light', 'Grateful'] },
  { dayKey: '2026-12-04', moods: ['Heavy', 'Light', 'Grateful'] },
];

const setScale = (fontScale) => { mockDims = { ...mockDims, fontScale }; };

// `T` merges its own font styles in, so every style prop here is an array.
const monthStyle = (view, month) => StyleSheet.flatten(view.getByText(month).props.style);
// Three months render the same mood line; they are identical, so read the first.
const MOOD_LINE = '🪨 Heavy  ·  🪶 Light  ·  🙏 Grateful';
const moodLine = (view) => view.getAllByText(MOOD_LINE)[0];

afterEach(() => setScale(1));

describe('Moods by season — the month label', () => {
  test('the stacked branch gives the month label no hardcoded width', () => {
    // The stacked block is the branch guarded by `stackMonths ?`. Before
    // IMP-095 there was no such branch and the ONLY month label carried
    // `width: 84` — so this assertion could not be satisfied at all.
    const stacked = SRC.split('return stackMonths ? (')[1].split(') : (')[0];
    expect(stacked).toContain('{m.month}');
    expect(stacked).not.toMatch(/width:\s*\d/);
  });

  test('at scale 1.0 the side-by-side row renders with exactly today\'s props', () => {
    setScale(1);
    const view = render(<DeeperInsights entries={entries} />);
    expect(monthStyle(view, 'September')).toEqual(expect.objectContaining({ width: 84, fontSize: 13 }));

    const value = moodLine(view);
    expect(value.props.numberOfLines).toBe(1);
    expect(StyleSheet.flatten(value.props.style)).toEqual(expect.objectContaining({ flex: 1 }));
  });

  test('at a large scale the month label loses its fixed width and stacks', () => {
    setScale(2);
    const view = render(<DeeperInsights entries={entries} />);
    const style = monthStyle(view, 'September');
    expect(style.width).toBeUndefined();
    expect(style).toEqual(expect.objectContaining({ fontSize: 13 }));
  });

  test('at a large scale the mood line is allowed two lines', () => {
    setScale(2);
    const view = render(<DeeperInsights entries={entries} />);
    expect(moodLine(view).props.numberOfLines).toBe(2);
  });

  test('1.3 is the boundary: 1.29 stays inline, 1.3 stacks', () => {
    setScale(1.29);
    expect(monthStyle(render(<DeeperInsights entries={entries} />), 'September').width).toBe(84);
    setScale(1.3);
    expect(monthStyle(render(<DeeperInsights entries={entries} />), 'September').width).toBeUndefined();
  });

  test('three long mood names still render three moods, stacked or not', () => {
    const longs = entries.map((e) => ({ ...e, moods: ['Overwhelmed', 'Contemplative', 'Appreciative'] }));
    const line = '🌫 Overwhelmed  ·  🌫 Contemplative  ·  🌫 Appreciative';
    const emoji = { Overwhelmed: '🌫', Contemplative: '🌫', Appreciative: '🌫' };

    setScale(2);
    expect(render(<DeeperInsights entries={longs} customMoodEmoji={emoji} />).getAllByText(line).length).toBe(3);
    setScale(1);
    expect(render(<DeeperInsights entries={longs} customMoodEmoji={emoji} />).getAllByText(line).length).toBe(3);
  });
});
