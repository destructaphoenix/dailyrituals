// __tests__/home/streakFreezeComponent.test.js — IMP-124. The `StreakFreeze`
// component (src/gamify.js) sits inside the streak hero, so over a video sky
// its top rule and label must take the same white ramp as the rest of the
// hero, not the day theme's c.border/c.muted.
//
// Named apart from __tests__/home/streakFreeze.test.js on purpose: that file
// tests the unrelated applyAutoFreeze logic in src/home/streakFreeze.js — a
// same-name collision with this component, not the same module.
import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet, View } from 'react-native';
import { StreakFreeze } from '../../src/gamify';
import { ThemeContext, makeTheme, DEFAULT_SETTINGS } from '../../src/theme';

const theme = makeTheme('day', DEFAULT_SETTINGS);
const wrap = (ui) => render(<ThemeContext.Provider value={theme}>{ui}</ThemeContext.Provider>);

describe('StreakFreeze onVideo (IMP-124)', () => {
  test('onVideo: the top rule takes the white ramp', () => {
    const view = wrap(<StreakFreeze count={2} onVideo />);
    const row = StyleSheet.flatten(view.UNSAFE_getByType(View).props.style);
    expect(row.borderTopColor).toBe('rgba(255,255,255,0.26)');
  });

  test('onVideo: the label colour is the white ramp', () => {
    const view = wrap(<StreakFreeze count={0} onVideo />);
    const label = view.getByText('No candles. One keeps your flame on a day you miss.');
    const flat = StyleSheet.flatten(label.props.style);
    expect(flat.color).toBe('rgba(255,255,255,0.80)');
  });

  test('without onVideo the rule and label stay on theme tokens', () => {
    const view = wrap(<StreakFreeze count={0} />);
    const row = StyleSheet.flatten(view.UNSAFE_getByType(View).props.style);
    const label = view.getByText('No candles. One keeps your flame on a day you miss.');
    expect(row.borderTopColor).toBe(theme.colors.border);
    expect(StyleSheet.flatten(label.props.style).color).toBe(theme.colors.muted);
  });
});
