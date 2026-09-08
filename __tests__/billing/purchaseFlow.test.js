// __tests__/billing/purchaseFlow.test.js
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePurchaseFlow, resultCopy } from '../../src/screens/PlusFlow';

function fakeService(buyResult, restoreResult, entitlement = null) {
  return {
    buy: jest.fn(async () => buyResult),
    restore: jest.fn(async () => restoreResult),
    getEntitlement: jest.fn(async () => entitlement),
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

  // IMP-101 — a `failed` buy had no basis for "you weren't charged": run()
  // now reconciles with the store before declaring failure.
  test('a failed buy the store confirms ends in success, not the failed card', async () => {
    const svc = fakeService({ kind: 'failed' }, { kind: 'restore-empty' }, { plan: 'annual' });
    const { result } = renderHook(() => usePurchaseFlow({ service: svc, onComplete: jest.fn() }));

    act(() => { result.current.buy('annual'); });
    await waitFor(() => expect(result.current.flow).toMatchObject({ phase: 'result', kind: 'success' }));
    expect(svc.getEntitlement).toHaveBeenCalled();
  });

  test('a failed buy the store also cannot confirm renders the new copy, not a charge denial', async () => {
    const svc = fakeService({ kind: 'failed' }, { kind: 'restore-empty' }, null);
    const { result } = renderHook(() => usePurchaseFlow({ service: svc, onComplete: jest.fn() }));

    act(() => { result.current.buy('annual'); });
    await waitFor(() => expect(result.current.flow).toMatchObject({ phase: 'result', kind: 'failed' }));

    const { body } = resultCopy(result.current.flow.kind, result.current.flow.mode);
    expect(body).not.toMatch(/weren't charged/i);
    expect(body).toMatch(/couldn't see a subscription/i);
  });

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
