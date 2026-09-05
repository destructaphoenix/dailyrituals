// __tests__/ui/PlusBanner.test.js — IMP-082.
// The member banner may only name a renewal date it was handed. With no live
// date it says "Member" and nothing more; it must never reach for RENEW_DATE.
import React from 'react';
import { render } from '@testing-library/react-native';
import { PlusBanner } from '../../src/shopui';
import { RENEW_DATE } from '../../src/data';

function renderBanner(props = {}) {
  return render(
    <PlusBanner plus onOpenPaywall={() => {}} onManage={() => {}} {...props} />
  );
}

describe('PlusBanner — IMP-082', () => {
  test('with a renewLabel it names that date', () => {
    const view = renderBanner({ renewLabel: '3 Mar 2027' });
    expect(view.getByText('Member · renews 3 Mar 2027')).toBeTruthy();
  });

  test('with no renewLabel it says "Member" and never the word "renews"', () => {
    const view = renderBanner();
    expect(view.getByText('Member')).toBeTruthy();
    expect(view.queryByText(/renews/)).toBeNull();
  });

  test('never shows the RENEW_DATE design mock when the date is unknown', () => {
    const view = renderBanner({ renewLabel: null });
    expect(view.queryByText(new RegExp(RENEW_DATE))).toBeNull();
  });

  test('the non-member banner is unaffected', () => {
    const view = renderBanner({ plus: false });
    expect(view.queryByText(/renews/)).toBeNull();
  });
});
