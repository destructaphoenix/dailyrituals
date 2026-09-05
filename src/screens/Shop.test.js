// Shop.test.js — IMP-034, re-cut 2026-09-05: the "Gather Embers" cash top-up
// section displays real cash prices wired to no IAP at all, so it must not
// render until those packs are attached to real Play consumable products.
//
// It used to key off `plusEnabled`, which meant enabling Plus put a priced
// surface on screen that gave its goods away for free. The two are now
// decoupled — the section keys off `embersForCash` alone — and the third test
// below is the one that stops them being re-coupled.
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

test('hides the cash ember prices while the packs are wired to nothing', () => {
  const { queryByText } = render(<Shop {...baseProps} embersForCash={false} />);
  for (const price of EMBER_PRICES) {
    expect(queryByText(price)).toBeNull();
  }
  expect(queryByText('Gather Embers')).toBeNull();
});

test('shows the cash ember prices once the packs are enabled', () => {
  const { queryByText } = render(<Shop {...baseProps} embersForCash={true} />);
  for (const price of EMBER_PRICES) {
    expect(queryByText(price)).not.toBeNull();
  }
  expect(queryByText('Gather Embers')).not.toBeNull();
});

// The regression this file exists to prevent. Enabling Plus must not, on its
// own, surface a priced ember pack — that combination shows $1.99/$4.99/$9.99
// against a bare counter increment.
test('enabling Plus alone never surfaces the cash ember packs', () => {
  const { queryByText } = render(
    <Shop {...baseProps} plusEnabled={true} embersForCash={false} />
  );
  for (const price of EMBER_PRICES) {
    expect(queryByText(price)).toBeNull();
  }
  expect(queryByText('Gather Embers')).toBeNull();
});

// The default must be the safe one: a caller that forgets the prop gets no
// priced surface, not a free giveaway.
test('omitting embersForCash defaults to hidden', () => {
  const { queryByText } = render(<Shop {...baseProps} plusEnabled={true} />);
  expect(queryByText('Gather Embers')).toBeNull();
});
