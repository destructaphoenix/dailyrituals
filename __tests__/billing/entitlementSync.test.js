import { renderHook, waitFor } from '@testing-library/react-native';
import { checkEntitlement, nextPlusState, useLaunchEntitlementSync } from '../../src/billing/entitlementSync';

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

describe('useLaunchEntitlementSync — IMP-107', () => {
  test('plus true at mount, store verifies no entitlement → still reports it (the lapsed-member case the old hook skipped)', async () => {
    const svc = fakeService(async () => null);
    const onResult = jest.fn();
    renderHook(() => useLaunchEntitlementSync({ plus: true, service: svc, onResult }));

    await waitFor(() => expect(onResult).toHaveBeenCalledWith({ verified: true, entitlement: null }));
    expect(svc.getEntitlement).toHaveBeenCalledTimes(1);
  });

  test('plus true at mount, store unreachable → reports verified:false (IMP-043: caller must change nothing)', async () => {
    const svc = fakeService(async () => { throw new Error('offline'); });
    const onResult = jest.fn();
    renderHook(() => useLaunchEntitlementSync({ plus: true, service: svc, onResult }));

    await waitFor(() => expect(onResult).toHaveBeenCalledWith({ verified: false, entitlement: null }));
  });

  test('plus false at mount, entitlement found → reports it (the lost-phone case, unregressed)', async () => {
    const entitlement = { active: true, plan: 'annual' };
    const svc = fakeService(async () => entitlement);
    const onResult = jest.fn();
    renderHook(() => useLaunchEntitlementSync({ plus: false, service: svc, onResult }));

    await waitFor(() => expect(onResult).toHaveBeenCalledWith({ verified: true, entitlement }));
  });

  test('checks exactly once per mount, regardless of plus', async () => {
    const svc = fakeService(async () => null);
    const onResult = jest.fn();
    renderHook(() => useLaunchEntitlementSync({ plus: true, service: svc, onResult }));

    await waitFor(() => expect(svc.getEntitlement).toHaveBeenCalledTimes(1));
    await new Promise((r) => setTimeout(r, 0));
    expect(svc.getEntitlement).toHaveBeenCalledTimes(1);
  });
});

// RitualsApp.js is never fully rendered in this suite (1000+ lines, the whole
// app's dependency graph) — the existing convention for pinning its wiring
// (see __tests__/billing/pendingEscape.test.js) is a source assertion on the
// file itself. The decision logic (nextPlusState) is already proven pure
// above; what's new here is that the AppState listener and the launch hook
// now go through the SAME function, closing the cold-start gap IMP-107 found.
describe('RitualsApp wires the launch hook into one downgrade policy — IMP-107', () => {
  const fs = require('fs');
  const path = require('path');
  const app = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'RitualsApp.js'), 'utf8');

  test('one shared applyEntitlementResult, called from both the listener and the launch hook', () => {
    expect(app).toMatch(/const applyEntitlementResult = \(result\) => \{/);
    // One definition + two call sites (the AppState listener, the launch
    // hook) means both paths run through the same decision rather than each
    // carrying its own copy of nextPlusState.
    const matches = app.match(/applyEntitlementResult/g) || [];
    expect(matches.length).toBe(3);
  });

  test('the AppState listener (foreground transition) calls the shared function', () => {
    expect(app).toMatch(/applyEntitlementResult\(await checkEntitlement\(service\)\);/);
  });

  test('the launch hook (cold start, IMP-107) calls the same shared function, unconditionally', () => {
    const i = app.indexOf('useLaunchEntitlementSync({');
    expect(i).toBeGreaterThan(-1);
    const block = app.slice(i, app.indexOf('});', i) + 3);
    expect(block).toMatch(/onResult: applyEntitlementResult,/);
    // No toast in this block either way — opening the journal must not be
    // interrupted by a billing notice on the downgrade edge, and the upgrade
    // edge here was always silent too (the toast lives only in
    // reconcileAfterAbandon / doRestore, both explicit user actions).
    expect(block).not.toMatch(/showToast/);
  });

  test('the hook is no longer named for the upgrade-only case it used to be', () => {
    expect(app).not.toMatch(/useLaunchEntitlementCheck/);
  });
});
