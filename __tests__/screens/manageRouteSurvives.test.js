// __tests__/screens/manageRouteSurvives.test.js — IMP-085.
//
// The owner-visible half of the incident: after IMP-084 gated the paid surface
// on PAYWALL_LIVE, a device with a (stale) Plus entitlement lost the Manage
// Subscription option entirely — the skins stayed unlocked and the route to
// cancel vanished. PlusBanner IS that route, and both screens rendered it only
// when `plusEnabled`. A subscriber must never lose the way to cancel, whatever
// the app's ability to SELL.
import React from 'react';
import { render } from '@testing-library/react-native';
import YouScreen from '../../src/screens/YouScreen';
import Shop from '../../src/screens/Shop';
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

const shopProps = {
  insets: { top: 0, bottom: 0 }, onClose: () => {}, embers: 0,
  activePalette: null, ownedPalettes: [], onApplyPalette: () => {}, onBuyPalette: () => {},
  activeSky: null, ownedSkies: [], onApplySky: () => {}, onBuySky: () => {},
  freezes: 0, onBuyCandles: () => {}, onOpenPaywall: () => {}, onGetEmbers: () => {},
  onManage: () => {},
};

describe('a subscriber keeps the route to Manage — IMP-085', () => {
  test('YouScreen: Plus held but the app cannot sell — the member banner still renders', () => {
    const view = wrap(<YouScreen {...youProps} plus plusEnabled={false} renewLabel={null} />);
    expect(view.getByText('Member')).toBeTruthy();
  });

  test('Shop: same — the member banner survives a dead paywall', () => {
    const view = wrap(<Shop {...shopProps} plus plusEnabled={false} renewLabel={null} />);
    expect(view.getByText('Member')).toBeTruthy();
  });

  test('YouScreen: no Plus and no ability to sell — nothing paid is shown', () => {
    const view = wrap(<YouScreen {...youProps} plus={false} plusEnabled={false} renewLabel={null} />);
    expect(view.queryByText('Member')).toBeNull();
    expect(view.queryByText(/Daily Rituals Plus/)).toBeNull();
  });

  test('YouScreen: the normal case is unchanged — sellable and not yet a member', () => {
    const view = wrap(<YouScreen {...youProps} plus={false} plusEnabled renewLabel={null} />);
    expect(view.queryByText('Member')).toBeNull();
  });
});
