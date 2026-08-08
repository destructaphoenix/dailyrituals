// Shop.test.js — IMP-034: the "Gather Embers" cash top-up section must not
// render while the app ships free (plusEnabled=false), since it displays
// real cash prices wired to no IAP at all.
import React from 'react';
import { render } from '@testing-library/react-native';
import Shop from './Shop';

const baseProps = {
  insets: { top: 0, bottom: 0 },
  onClose: () => {},
  embers: 100,
  plus: false,
  activePalette: 'goldenhour',
  ownedPalettes: ['goldenhour'],
  onApplyPalette: () => {},
  onBuyPalette: () => {},
  activeSky: 'classic',
  ownedSkies: ['classic', 'crescent'],
  onApplySky: () => {},
  onBuySky: () => {},
  freezes: 0,
  onBuyCandles: () => {},
  onOpenPaywall: () => {},
  onGetEmbers: () => {},
  onManage: () => {},
};

const EMBER_PRICES = ['$1.99', '$4.99', '$9.99'];

test('hides the cash ember prices while the app ships free', () => {
  const { queryByText } = render(<Shop {...baseProps} plusEnabled={false} />);
  for (const price of EMBER_PRICES) {
    expect(queryByText(price)).toBeNull();
  }
  expect(queryByText('Gather Embers')).toBeNull();
});

test('shows the cash ember prices when plus is enabled', () => {
  const { queryByText } = render(<Shop {...baseProps} plusEnabled={true} />);
  for (const price of EMBER_PRICES) {
    expect(queryByText(price)).not.toBeNull();
  }
  expect(queryByText('Gather Embers')).not.toBeNull();
});
