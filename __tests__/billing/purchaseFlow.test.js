// __tests__/billing/purchaseFlow.test.js
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePurchaseFlow } from '../../src/screens/PlusFlow';

function fakeService(buyResult, restoreResult) {
  return {
    buy: jest.fn(async () => buyResult),
    restore: jest.fn(async () => restoreResult),
    getEntitlement: jest.fn(async () => null),
    getPrices: jest.fn(async () => ({})),
  };
}

describe('usePurchaseFlow', () => {
  test('buy goes pending then shows the result kind', async () => {
    const svc = fakeService({ kind: 'failed' }, { kind: 'restore-empty' });
    const onComplete = jest.fn();
    const { result } = renderHook(() => usePurchaseFlow({ service: svc, onComplete }));

    act(() => { result.current.buy('annual'); });
    expect(result.current.flow).toMatchObject({ phase: 'pending', mode: 'buy' });

    await waitFor(() => expect(result.current.flow).toMatchObject({ phase: 'result', kind: 'failed' }));
    expect(svc.buy).toHaveBeenCalledWith('annual');
  });

  test('cancel resolves to a silent dismiss (no flow)', async () => {
    const svc = fakeService({ kind: 'cancel' }, { kind: 'restore-empty' });
    const { result } = renderHook(() => usePurchaseFlow({ service: svc, onComplete: jest.fn() }));
    act(() => { result.current.buy('annual'); });
    await waitFor(() => expect(result.current.flow).toBeNull());
  });

  test('restore shows restored on success', async () => {
    const svc = fakeService({ kind: 'success' }, { kind: 'restored' });
    const { result } = renderHook(() => usePurchaseFlow({ service: svc, onComplete: jest.fn() }));
    act(() => { result.current.restore(); });
    expect(result.current.flow).toMatchObject({ phase: 'pending', mode: 'restore' });
    await waitFor(() => expect(result.current.flow).toMatchObject({ phase: 'result', kind: 'restored' }));
  });

  // IMP-089 — from the WALK-19 device finding, 2026-09-06. "Try again" on a
  // restore result opened Play's purchase sheet, because onRetry called buy()
  // regardless of mode. A restore is a free gesture; retrying it must never be
  // able to charge. Both restore result kinds are pinned.
  test.each(['restore-empty', 'network'])(
    'retrying a %s restore restores again — it never buys',
    async (kind) => {
      const svc = fakeService({ kind: 'success' }, { kind });
      const { result } = renderHook(() => usePurchaseFlow({ service: svc, onComplete: jest.fn() }));

      act(() => { result.current.restore(); });
      await waitFor(() => expect(result.current.flow).toMatchObject({ phase: 'result', kind }));

      act(() => { result.current.overlay.props.onRetry(); });
      await waitFor(() => expect(svc.restore).toHaveBeenCalledTimes(2));
      expect(svc.buy).not.toHaveBeenCalled();
    },
  );

  test('retrying a failed buy still buys, with the same plan', async () => {
    const svc = fakeService({ kind: 'failed' }, { kind: 'restore-empty' });
    const { result } = renderHook(() => usePurchaseFlow({ service: svc, onComplete: jest.fn() }));

    act(() => { result.current.buy('monthly'); });
    await waitFor(() => expect(result.current.flow).toMatchObject({ phase: 'result', kind: 'failed' }));

    act(() => { result.current.overlay.props.onRetry(); });
    await waitFor(() => expect(svc.buy).toHaveBeenCalledTimes(2));
    expect(svc.buy).toHaveBeenLastCalledWith('monthly');
    expect(svc.restore).not.toHaveBeenCalled();
  });
});
