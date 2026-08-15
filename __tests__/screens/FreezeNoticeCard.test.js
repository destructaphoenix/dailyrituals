import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FreezeNoticeCard from '../../src/screens/FreezeNoticeCard';

describe('FreezeNoticeCard — IMP-060', () => {
  test('renders the one-day copy', () => {
    const view = render(<FreezeNoticeCard days={['2026-06-13']} freezesLeft={2} onDismiss={() => {}} />);
    expect(view.getByText('Your streak is safe.')).toBeTruthy();
    expect(view.getByText('A candle burned for 13 Jun. 2 left.')).toBeTruthy();
  });

  test('renders the multi-day copy', () => {
    const view = render(
      <FreezeNoticeCard days={['2026-06-11', '2026-06-12', '2026-06-13']} freezesLeft={1} onDismiss={() => {}} />
    );
    expect(view.getByText('3 candles burned for 3 days you missed. 1 left.')).toBeTruthy();
  });

  test('renders "That was your last one." at zero remaining', () => {
    const view = render(<FreezeNoticeCard days={['2026-06-13']} freezesLeft={0} onDismiss={() => {}} />);
    expect(view.getByText('A candle burned for 13 Jun. That was your last one.')).toBeTruthy();
  });

  test('dismiss calls the clear handler', () => {
    const onDismiss = jest.fn();
    const view = render(<FreezeNoticeCard days={['2026-06-13']} freezesLeft={2} onDismiss={onDismiss} />);
    fireEvent.press(view.UNSAFE_getAllByProps({ hitSlop: 8 })[0]);
    expect(onDismiss).toHaveBeenCalled();
  });

  test('renders nothing for an empty array', () => {
    const view = render(<FreezeNoticeCard days={[]} freezesLeft={2} onDismiss={() => {}} />);
    expect(view.toJSON()).toBeNull();
  });
});
