// __tests__/home/streakFreezeComponent.test.js — the `StreakFreeze` component
// (src/gamify.js) sits under the week strip (IMP-125) and always styles on
// plain theme tokens.
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

describe('StreakFreeze', () => {
  test('the rule and label sit on theme tokens', () => {
    const view = wrap(<StreakFreeze count={0} />);
    const row = StyleSheet.flatten(view.UNSAFE_getByType(View).props.style);
    const label = view.getByText('No candles. One keeps your flame on a day you miss.');
    expect(row.borderTopColor).toBe(theme.colors.border);
    expect(StyleSheet.flatten(label.props.style).color).toBe(theme.colors.muted);
  });
});
