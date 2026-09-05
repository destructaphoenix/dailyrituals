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

// The footer is the only view carrying both a top border and an absolute position.
function footerStyle(view) {
  const match = view.UNSAFE_root.findAll((node) => {
    if (typeof node.type !== 'string') return false; // host views only, not the composite wrapper
    const flat = StyleSheet.flatten(node.props && node.props.style) || {};
    return flat.borderTopWidth === 1 && flat.position === 'absolute';
  });
  expect(match.length).toBe(1);
  return StyleSheet.flatten(match[0].props.style);
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

describe('Paywall — IMP-080 (supersedes IMP-074)', () => {
  test('the root view is exactly the window height, so bottom: 0 means the viewport', () => {
    const view = renderPaywall();
    const flat = StyleSheet.flatten(view.getByTestId('paywallRoot').props.style) || {};
    expect(flat.height).toBe(Dimensions.get('window').height);
    expect(flat.maxHeight).toBeUndefined();
  });

  // A source assertion on purpose: "the height must track the window" is a decision
  // about which API is used, and a single rendered frame cannot show that a
  // one-shot read would have gone stale on rotation.
  test('the height comes from useWindowDimensions, not a one-shot Dimensions.get', () => {
    const src = fs.readFileSync(path.join(__dirname, '../../src/screens/Paywall.js'), 'utf8');
    expect(src).toMatch(/useWindowDimensions\(\)/);
    expect(src).not.toMatch(/Dimensions\.get\(/);
  });

  test('the footer is pinned to the bottom, out of the flex column', () => {
    const flat = footerStyle(renderPaywall());
    expect(flat.bottom).toBe(0);
    expect(flat.left).toBe(0);
    expect(flat.right).toBe(0);
  });

  test('the ScrollView reserves the footer height under its content', () => {
    const view = renderPaywall();
    const scrollView = view.UNSAFE_getAllByType(ScrollView)[0];
    const flat = StyleSheet.flatten(scrollView.props.contentContainerStyle) || {};
    expect(flat.paddingBottom).toBeGreaterThan(18);
  });

  // The WALK-07 defect itself: the footer drawn over the last perk, the disclaimer
  // and the annual price. Jest renders a tree, not pixels, so it CANNOT see the
  // overlap — only WALK-07 on a device can. What is assertable is the structural
  // property that made the overlap possible: the footer being a later sibling in the
  // same flex column. So assert it is no longer in that column at all.
  test('with zero insets, the content renders and the footer is not a flex sibling', () => {
    const view = renderPaywall({ insets: { top: 0, bottom: 0 } });
    expect(view.getByText(PLUS_PERKS[PLUS_PERKS.length - 1])).toBeTruthy();
    expect(view.getAllByText(PLUS_PRICES.annual.price).length).toBeGreaterThan(0);
    expect(footerStyle(view).position).toBe('absolute');
  });
});
