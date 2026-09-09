import { freezeGrantFor, PERIOD_FREEZES } from '../../src/billing/freezeGrant';

describe('freezeGrantFor (IMP-102 — per-period, not per-completion)', () => {
  test('first purchase: renewISO vs stored null → grants and names the period', () => {
    const entitlement = { active: true, renewISO: 'X' };
    expect(freezeGrantFor(entitlement, null)).toEqual({ period: 'X', freezes: PERIOD_FREEZES });
  });

  test('restored/owned in the same period → correctly silent', () => {
    const entitlement = { active: true, renewISO: 'X' };
    expect(freezeGrantFor(entitlement, 'X')).toBeNull();
  });

  test('"Change plan" reopening the paywall in the same period → correctly silent', () => {
    const entitlement = { active: true, renewISO: 'X' };
    expect(freezeGrantFor(entitlement, 'X')).toBeNull();
  });

  test('relaunch / launch check / AppState refresh, same period → correctly silent', () => {
    const entitlement = { active: true, renewISO: 'X' };
    expect(freezeGrantFor(entitlement, 'X')).toBeNull();
  });

  test('renewal: renewISO vs a different stored period → grants and names the new period', () => {
    const entitlement = { active: true, renewISO: 'Y' };
    expect(freezeGrantFor(entitlement, 'X')).toEqual({ period: 'Y', freezes: PERIOD_FREEZES });
  });

  test('cancel then resubscribe later, a genuinely new period → grants', () => {
    const entitlement = { active: true, renewISO: 'Z' };
    expect(freezeGrantFor(entitlement, 'X')).toEqual({ period: 'Z', freezes: PERIOD_FREEZES });
  });

  test('null entitlement → null', () => {
    expect(freezeGrantFor(null, null)).toBeNull();
    expect(freezeGrantFor(null, 'X')).toBeNull();
  });

  test('active: false → null, even with a renewISO the caller has not cleared', () => {
    expect(freezeGrantFor({ active: false, renewISO: 'X' }, null)).toBeNull();
  });

  test('an entitlement with no expiration date grants once via the no-expiry sentinel, then never again', () => {
    const entitlement = { active: true, renewISO: null };
    const first = freezeGrantFor(entitlement, null);
    expect(first).toEqual({ period: 'no-expiry', freezes: PERIOD_FREEZES });
    expect(freezeGrantFor(entitlement, first.period)).toBeNull();
  });

  test('regression: a restored result for the same renewISO does not change the freeze count', () => {
    // subscribe()/doRestore() no longer grant candles directly — the only
    // path is this function, keyed on the period already recorded.
    const entitlement = { active: true, renewISO: 'X' };
    expect(freezeGrantFor(entitlement, 'X')).toBeNull();
  });
});
