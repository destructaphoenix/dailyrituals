import { renderHook, waitFor } from '@testing-library/react-native';
import { checkEntitlement, nextPlusState, useLaunchEntitlementCheck } from '../../src/billing/entitlementSync';

function fakeService(impl) {
  return { getEntitlement: jest.fn(impl) };
}

describe('checkEntitlement', () => {
  test('resolves with entitlement → verified true, entitlement returned', async () => {
    const svc = fakeService(async () => ({ active: true, plan: 'annual' }));
    await expect(checkEntitlement(svc)).resolves.toEqual({ verified: true, entitlement: { active: true, plan: 'annual' } });
  });
  test('resolves with null (definitively no entitlement) → verified true, entitlement null', async () => {
    const svc = fakeService(async () => null);
    await expect(checkEntitlement(svc)).resolves.toEqual({ verified: true, entitlement: null });
  });
  test('rejects (network/unavailable) → verified false, entitlement null', async () => {
    const svc = fakeService(async () => { throw new Error('offline'); });
    await expect(checkEntitlement(svc)).resolves.toEqual({ verified: false, entitlement: null });
  });
});

describe('nextPlusState', () => {
  test('unverified check never changes plus, even for a real subscriber (offline-first)', () => {
    expect(nextPlusState(true, { verified: false, entitlement: null })).toBe(true);
    expect(nextPlusState(false, { verified: false, entitlement: null })).toBe(false);
  });
  test('verified with no entitlement downgrades — the missing branch', () => {
    expect(nextPlusState(true, { verified: true, entitlement: null })).toBe(false);
  });
  test('verified with entitlement upgrades', () => {
    expect(nextPlusState(false, { verified: true, entitlement: { plan: 'annual' } })).toBe(true);
  });
  test('verified result already matching current state is a no-op value', () => {
    expect(nextPlusState(true, { verified: true, entitlement: { plan: 'annual' } })).toBe(true);
    expect(nextPlusState(false, { verified: true, entitlement: null })).toBe(false);
  });
});

describe('useLaunchEntitlementCheck', () => {
  test('plus false at mount → checks exactly once and reports a found entitlement', async () => {
    const entitlement = { active: true, plan: 'annual' };
    const svc = fakeService(async () => entitlement);
    const onEntitlementFound = jest.fn();
    renderHook(() => useLaunchEntitlementCheck({ plus: false, service: svc, onEntitlementFound }));

    await waitFor(() => expect(onEntitlementFound).toHaveBeenCalledWith(entitlement));
    expect(svc.getEntitlement).toHaveBeenCalledTimes(1);
  });

  test('plus true at mount → never checks (the periodic AppState check owns that user)', async () => {
    const svc = fakeService(async () => ({ active: true, plan: 'annual' }));
    const onEntitlementFound = jest.fn();
    renderHook(() => useLaunchEntitlementCheck({ plus: true, service: svc, onEntitlementFound }));

    await new Promise((r) => setTimeout(r, 0));
    expect(svc.getEntitlement).not.toHaveBeenCalled();
    expect(onEntitlementFound).not.toHaveBeenCalled();
  });

  test('plus false but nothing found → silent, no callback', async () => {
    const svc = fakeService(async () => null);
    const onEntitlementFound = jest.fn();
    renderHook(() => useLaunchEntitlementCheck({ plus: false, service: svc, onEntitlementFound }));

    await waitFor(() => expect(svc.getEntitlement).toHaveBeenCalledTimes(1));
    expect(onEntitlementFound).not.toHaveBeenCalled();
  });

  test('plus false and the check fails → silent, no callback, no throw', async () => {
    const svc = fakeService(async () => { throw new Error('offline'); });
    const onEntitlementFound = jest.fn();
    renderHook(() => useLaunchEntitlementCheck({ plus: false, service: svc, onEntitlementFound }));

    await waitFor(() => expect(svc.getEntitlement).toHaveBeenCalledTimes(1));
    expect(onEntitlementFound).not.toHaveBeenCalled();
  });
});
