// __tests__/screens/ManageSubscription.test.js — IMP-082.
// Manage and its cancel sheet may only name a renewal date they were handed.
// With renewLabel null the "until …" clauses are dropped entirely; the
// RENEW_DATE design mock must never surface to a real subscriber.
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ManageSubscription, CancelSheet } from '../../src/screens/PlusFlow';
import { RENEW_DATE } from '../../src/data';

function renderManage(props = {}) {
  return render(
    <ManageSubscription
      insets={{ top: 0, bottom: 0 }} platform="android" plan="annual" canceled={false}
      renewLabel={null} priceString={null}
      onClose={() => {}} onChangePlan={() => {}} onRestore={() => {}}
      onCancel={() => {}} onResume={() => {}} onLink={() => {}} onGetHelp={() => {}}
      {...props}
    />
  );
}

const noMock = (view) => expect(view.queryByText(new RegExp(RENEW_DATE))).toBeNull();

describe('ManageSubscription — IMP-082', () => {
  test('a live date is shown on the status row', () => {
    const view = renderManage({ renewLabel: '3 Mar 2027' });
    expect(view.getByText('Annual · renews 3 Mar 2027')).toBeTruthy();
  });

  test('no date: the active status row is the plan label alone', () => {
    const view = renderManage();
    // Two "Annual" nodes: the status row (bare label) and the Change-plan value.
    expect(view.getAllByText('Annual').length).toBe(2);
    expect(view.queryByText(/renews/)).toBeNull();
    noMock(view);
  });

  test('no date: the canceled status row says "Ends soon"', () => {
    const view = renderManage({ canceled: true });
    expect(view.getByText('Ends soon · access until then')).toBeTruthy();
    noMock(view);
  });

  test('no date: the billing footnote drops the "until" clause', () => {
    const view = renderManage();
    expect(view.getByText(/Cancelling stops the next renewal\.$/)).toBeTruthy();
    expect(view.queryByText(/until/)).toBeNull();
    noMock(view);
  });

  test('no date: the canceled footnote drops the "until" clause', () => {
    const view = renderManage({ canceled: true });
    expect(view.getByText(/Your subscription won't renew\.$/)).toBeTruthy();
    noMock(view);
  });

  test('a live date still reaches both footnote branches', () => {
    expect(renderManage({ renewLabel: '3 Mar 2027' })
      .getByText(/Cancelling stops the next renewal — you keep Plus until 3 Mar 2027\./)).toBeTruthy();
    expect(renderManage({ renewLabel: '3 Mar 2027', canceled: true })
      .getByText(/You'll keep Plus until 3 Mar 2027\./)).toBeTruthy();
  });
});

describe('CancelSheet — IMP-082', () => {
  const renderSheet = (props = {}) => render(
    <CancelSheet platform="android" renewLabel={null} onKeep={() => {}} onConfirm={() => {}} {...props} />
  );

  test('with a date it promises access until that date', () => {
    const view = renderSheet({ renewLabel: '3 Mar 2027' });
    expect(view.getByText(/you'll keep\s+Plus until 3 Mar 2027\./)).toBeTruthy();
  });

  test('with no date the sentence ends at "so you can cancel."', () => {
    const view = renderSheet();
    expect(view.getByText(/so you can cancel\.$/)).toBeTruthy();
    expect(view.queryByText(/keep\s+Plus until/)).toBeNull();
    noMock(view);
  });

  test('the sheet Manage opens inherits Manage\'s null date', () => {
    const view = renderManage();
    fireEvent.press(view.getByText('Cancel subscription'));
    expect(view.getByText(/so you can cancel\.$/)).toBeTruthy();
    noMock(view);
  });
});
