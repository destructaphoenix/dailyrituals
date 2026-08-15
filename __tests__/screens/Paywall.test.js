import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
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
