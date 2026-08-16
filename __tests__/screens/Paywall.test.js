import React from 'react';
import fs from 'fs';
import path from 'path';
import { ScrollView, StyleSheet, Dimensions } from 'react-native';
import { render } from '@testing-library/react-native';
import Paywall from '../../src/screens/Paywall';
import { PLUS_PERKS, PLUS_PRICES } from '../../src/data';

function renderPaywall(props = {}) {
  return render(
    <Paywall insets={{ top: 0, bottom: 0 }} platform="android" service={null}
      onClose={() => {}} onSubscribe={() => {}} onLink={() => {}}
      {...props}
    />
  );
}

describe('Paywall — IMP-068', () => {
  test('the ScrollView is constrained to the space above the footer', () => {
    const view = renderPaywall();
    const scrollView = view.UNSAFE_getAllByType(ScrollView)[0];
    const flat = StyleSheet.flatten(scrollView.props.style) || {};
    expect(flat.flex).toBe(1);
  });

  test('the last perk renders, unobscured by the footer', () => {
    const view = renderPaywall();
    expect(view.getByText(PLUS_PERKS[PLUS_PERKS.length - 1])).toBeTruthy();
  });

  test('the annual price and the trial CTA both render', () => {
    const view = renderPaywall();
    expect(view.getAllByText(PLUS_PRICES.annual.price).length).toBeGreaterThan(0);
    expect(view.getByText('Start 7-day free trial')).toBeTruthy();
  });
});

describe('Paywall — IMP-074', () => {
  test('the root view is capped at the window height, so the first measure pass is bounded', () => {
    const view = renderPaywall();
    const flat = StyleSheet.flatten(view.getByTestId('paywallRoot').props.style) || {};
    expect(flat.maxHeight).toBe(Dimensions.get('window').height);
    expect(flat.flex).toBe(1);
  });

  // A source assertion on purpose: "the cap must track the window" is a decision
  // about which API is used, and a single rendered frame cannot show that a
  // one-shot read would have gone stale on rotation.
  test('the cap comes from useWindowDimensions, not a one-shot Dimensions.get', () => {
    const src = fs.readFileSync(path.join(__dirname, '../../src/screens/Paywall.js'), 'utf8');
    expect(src).toMatch(/useWindowDimensions\(\)/);
    expect(src).not.toMatch(/Dimensions\.get\(/);
  });
});
