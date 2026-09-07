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

  test('the annual price and the CTA both render', () => {
    const view = renderPaywall();
    expect(view.getAllByText(PLUS_PRICES.annual.price).length).toBeGreaterThan(0);
    // IMP-090: with no live offer (service={null}) there is no trial to name.
    expect(view.getByText('Subscribe')).toBeTruthy();
  });
});

// ── IMP-090 — WALK-19 step 3, 2026-09-06 ─────────────────────────────────────
// The button read "Start 7-day free trial" as a string literal while Google's
// own purchase sheet, opened from it, said charging today with the INR amount.
// A Play trial is once per Google account, ever, and the app fetched no offer
// data at all — so it could not have been right, only lucky.
describe('Paywall — the CTA never promises a trial it cannot see', () => {
  const svc = (live) => ({
    getPrices: async () => live,
    buy: async () => ({ kind: 'cancel' }),
    restore: async () => ({ kind: 'restore-empty' }),
  });

  test('no live offering: the button asks for a subscription, nothing more', () => {
    const view = renderPaywall();
    expect(view.getByText('Subscribe')).toBeTruthy();
    expect(view.queryByText(/free trial/i)).toBeNull();
    expect(view.queryByText(/7.day/i)).toBeNull();
  });

  test('no live offering: the legal disclosure drops the trial clause too', () => {
    // This text is the binding price disclosure. It used to open "Your 7-day
    // free trial converts to …" whatever the store actually offered.
    const view = renderPaywall();
    expect(view.queryByText(/Your 7-day free trial converts/i)).toBeNull();
    expect(view.getByText(/Payment is charged to your/i)).toBeTruthy();
    expect(view.getByText(/renews automatically/i)).toBeTruthy();
  });

  test('a live trial changes the button without naming the day count', async () => {
    const view = renderPaywall({
      service: svc({ annual: { priceString: '₹2,499.00', price: 2499, trialDays: 7 } }),
    });
    const cta = await view.findByText('Try free, then subscribe');
    expect(cta).toBeTruthy();
    expect(view.queryByText(/Start 7-day free trial/)).toBeNull();
  });

  test('a live trial IS described in the disclosure, as the offer not a promise', async () => {
    const view = renderPaywall({
      service: svc({ annual: { priceString: '₹2,499.00', price: 2499, trialDays: 7 } }),
    });
    expect(await view.findByText(/7 days free for new subscribers/i)).toBeTruthy();
  });

  test('a live offering with no free phase keeps the plain CTA', async () => {
    const view = renderPaywall({
      service: svc({ annual: { priceString: '₹2,499.00', price: 2499 } }),
    });
    await view.findAllByText('₹2,499.00'); // plan card + legal disclosure
    expect(view.getByText('Subscribe')).toBeTruthy();
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

// ── IMP-090, step 5 — the same promise, made in two words elsewhere ──────────
// The owner reported the button reading "Try free" during WALK-19; that is the
// shopui banner that OPENS the paywall, not the paywall's own CTA. Neither it
// nor the onboarding teaser fetches an offer, so neither may name one.
describe('surfaces that only open the paywall promise nothing', () => {
  const fs = require('fs');
  const path = require('path');
  const read = (...p) => fs.readFileSync(path.join(__dirname, '..', '..', 'src', ...p), 'utf8')
    .split('\n').filter((l) => !l.trim().startsWith('//') && !l.trim().startsWith('{/*') && !l.trim().startsWith('*/')).join('\n');

  test('the Shop / You Plus banner no longer says "Try free" or "7 days free"', () => {
    const src = read('shopui.js');
    expect(src).not.toMatch(/Try free/);
    expect(src).not.toMatch(/7 days free/);
  });

  test('the onboarding Premium teaser makes no trial claim', () => {
    const src = read('screens', 'Onboarding.js');
    expect(src).not.toMatch(/start free trial/i);
    expect(src).not.toMatch(/7 days free/);
  });

  test('the only place a trial may be named is the paywall, from live data', () => {
    const src = read('screens', 'Paywall.js');
    expect(src).not.toMatch(/7-day free trial/);
    expect(src).toMatch(/ctaLabel\(prices\[plan\]\)/);
  });
});

// IMP-096 — the "SAVE 50%" badge overlapping the Annual card's selected tick at
// max font. ⚠️ Jest renders a TREE, not pixels: it cannot see the overlap, and
// nothing below proves the two shapes are visually separated. The acceptance is
// the WALK-07 Paywall re-run at OS font_scale 2.0 in BOTH nav modes. What is
// assertable is the structural property that let them converge — a vertical
// placement that moves with the font scale — and that it is gone.
describe('Paywall — IMP-096: the savings badge and the selected tick', () => {
  const PAYWALL_SRC = fs.readFileSync(path.join(__dirname, '../../src/screens/Paywall.js'), 'utf8');

  // The badge is the only absolutely-positioned view with a pill radius sitting
  // above the card's top edge; the tick is the only 20x20 absolute circle.
  const absolutes = (view) => view.UNSAFE_root.findAll((node) => {
    if (typeof node.type !== 'string') return false;
    const flat = StyleSheet.flatten(node.props && node.props.style) || {};
    return flat.position === 'absolute';
  }).map((n) => StyleSheet.flatten(n.props.style));

  const badgeStyle = (view) => {
    const found = absolutes(view).filter((s) => s.borderRadius === 999 && s.top < 0);
    expect(found.length).toBe(1); // annual only — monthly has no `save`
    return found[0];
  };
  const tickStyles = (view) => absolutes(view).filter((s) => s.width === 20 && s.height === 20);

  test('the tick starts below the badge\'s reserved height, at every scale', () => {
    const view = renderPaywall();
    const badge = badgeStyle(view);
    const ticks = tickStyles(view);
    expect(ticks.length).toBe(2); // one per plan card

    // The badge grows downward from its own `top` as its text scales, so the
    // tick has to clear the badge's MAXIMUM height, not its height right now.
    const badgeMaxBottom = badge.top + 28;
    ticks.forEach((tick) => expect(tick.top).toBeGreaterThanOrEqual(badgeMaxBottom));
  });

  test('neither placement is derived from a font-scaled value', () => {
    const view = renderPaywall();
    expect(typeof badgeStyle(view).top).toBe('number');
    tickStyles(view).forEach((tick) => expect(typeof tick.top).toBe('number'));
    // The whole file: no offset may be multiplied by a font scale.
    expect(PAYWALL_SRC).not.toMatch(/fontScale\s*\*/);
    expect(PAYWALL_SRC).not.toMatch(/PixelRatio/);
  });

  test('the badge is capped as chrome, which is what bounds its height', () => {
    expect(PAYWALL_SRC).toMatch(/maxFontSizeMultiplier=\{CHROME_FONT_SCALE\}/);
  });

  test('the badge copy and the plan selection are untouched', () => {
    const view = renderPaywall();
    expect(view.getByText(PLUS_PRICES.annual.save.toUpperCase())).toBeTruthy();
    // both prices also appear in the legal disclosure, hence getAllByText
    expect(view.getAllByText(PLUS_PRICES.annual.price).length).toBeGreaterThan(0);
    expect(view.getAllByText(PLUS_PRICES.monthly.price).length).toBeGreaterThan(0);
  });
});
