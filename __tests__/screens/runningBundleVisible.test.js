// __tests__/screens/runningBundleVisible.test.js — IMP-106.
//
// describeUpdate() already computes which JS bundle is running, but its only
// consumer was the broken-gate alert, which renders only when
// billingDiagnostic is non-null AND !plus. On a healthy build, and on any
// member's device, the running bundle was invisible — the exact gap that let
// IMP-103 be mis-scoped as a billing defect instead of an unshipped bundle.
import React from 'react';
import { render } from '@testing-library/react-native';
import YouScreen from '../../src/screens/YouScreen';
import { ThemeContext, makeTheme, DEFAULT_SETTINGS } from '../../src/theme';

const theme = makeTheme('day', DEFAULT_SETTINGS);
const wrap = (ui) => render(<ThemeContext.Provider value={theme}>{ui}</ThemeContext.Provider>);

const youProps = {
  mode: 'day', onToggleMode: () => {}, settings: {}, setSettings: () => {},
  streak: 0, level: 1, levelName: 'Spark', xpInto: 0, xpToNext: 10,
  entriesCount: 0, badgesEarned: 0, embers: 0, entries: [],
  onOpenShop: () => {}, onOpenPaywall: () => {}, onOpenManage: () => {},
  onRestorePurchases: () => {}, onOpenAchievements: () => {}, onResetData: () => {},
  insets: { top: 0, bottom: 0 },
};

describe('the running bundle is readable on a healthy build — IMP-106', () => {
  test('a member with no billing diagnostic still sees the Version row', () => {
    const view = wrap(
      <YouScreen {...youProps} plus billingDiagnostic={null}
        runningBundle="update d42b7ec7 · 2026-09-08 04:58 UTC" />
    );
    expect(view.getByText('Version')).toBeTruthy();
    expect(view.getByText('update d42b7ec7 · 2026-09-08 04:58 UTC')).toBeTruthy();
  });

  test('a non-member on the built-in bundle sees it too', () => {
    const view = wrap(
      <YouScreen {...youProps} plus={false} billingDiagnostic={null}
        runningBundle="built-in bundle (no update applied)" />
    );
    expect(view.getByText('built-in bundle (no update applied)')).toBeTruthy();
  });
});
