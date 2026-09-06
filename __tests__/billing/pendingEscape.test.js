// __tests__/billing/pendingEscape.test.js — IMP-088.
//
// Found on a device, 2026-09-06, running WALK-19 step 0(c): in airplane mode the
// purchase hung on "Confirming with Play Store…" and never resolved. usePurchaseFlow
// awaited the service with no bound, and the pending card rendered no dismiss
// control while telling the user "Don't close the app" — force-quit was the only
// exit. RevenueCat's getOfferings/purchasePackage can both hang with no network.
//
// The fix must never assert an OUTCOME. A real purchase legitimately takes minutes
// (Play sheet, adding a card, a bank running 3DS/OTP — the norm on the INR flows
// this app now serves), so a timeout that says "failed" would tell someone who was
// charged that nothing happened. These pin that the copy stays honest.
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import {
  stuckCopy, PENDING_GRACE_MS, graceSpent, resultCopy, usePurchaseFlow,
} from '../../src/screens/PlusFlow';

describe('stuckCopy', () => {
  test('a stuck purchase never claims the purchase failed', () => {
    const { line } = stuckCopy('buy', 'android');
    expect(line).not.toMatch(/failed|unsuccessful|didn't work|error/i);
  });

  test('it protects the user who WAS charged', () => {
    const { line } = stuckCopy('buy', 'android');
    expect(line).toMatch(/if you were charged/i);
    expect(line).toMatch(/won't cancel/i);
  });

  test('it names the right store per platform', () => {
    expect(stuckCopy('buy', 'android').line).toMatch(/Play/);
    expect(stuckCopy('buy', 'ios').line).toMatch(/App Store/);
  });

  test('a stuck restore may say nothing changed — nothing was being bought', () => {
    const { line } = stuckCopy('restore', 'android');
    expect(line).toMatch(/nothing has changed/i);
  });

  test('both modes offer a way out', () => {
    expect(stuckCopy('buy', 'android').action).toBeTruthy();
    expect(stuckCopy('restore', 'android').action).toBeTruthy();
  });

  test('the grace period is long enough not to fire mid-payment-sheet', () => {
    // Short enough to rescue a hang, long enough that a user reading the Play
    // sheet never sees it. If this is ever lowered, say why here.
    expect(PENDING_GRACE_MS).toBeGreaterThanOrEqual(15000);
    expect(PENDING_GRACE_MS).toBeLessThanOrEqual(45000);
  });
});

// The trap was structural: no dismiss control existed in the pending phase at all.
describe('the pending phase has an exit', () => {
  const fs = require('fs');
  const path = require('path');
  const raw = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'screens', 'PlusFlow.js'), 'utf8');
  // Comment lines out, or the block explaining the trap matches the assertions
  // about the trap — the same reason the require.resolve check strips them.
  const src = raw.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');

  test('a stuck pending card renders a dismiss button', () => {
    expect(src).toMatch(/escape \? \(/);
    expect(src).toMatch(/<GhostButton label=\{escape\.action\} onPress=\{onDismiss\} \/>/);
  });

  test('"Don\'t close the app" is shown only BEFORE the flow is stuck', () => {
    // Leaving that line up next to a Close button is the contradiction that
    // made the original trap feel deliberate.
    const i = src.indexOf("Don't close the app");
    const j = src.indexOf('escape ? (');
    expect(i).toBeGreaterThan(j); // it lives in the else branch
  });

  test('the timer is cleared on unmount — no setState after teardown', () => {
    expect(src).toMatch(/if \(timer\.current\) clearTimeout\(timer\.current\);/);
  });

  test('abandoning fires onAbandon only when it was actually stuck', () => {
    expect(src).toMatch(/if \(wasStuck && onAbandon\) onAbandon\(mode\);/);
  });
});

// Leaving a stuck flow asserts nothing, so the app must ask the store.
describe('abandoning reconciles instead of guessing', () => {
  const fs = require('fs');
  const path = require('path');
  const app = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'RitualsApp.js'), 'utf8');
  const onb = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'screens', 'Onboarding.js'), 'utf8');

  test('RitualsApp reconciles through the IMP-043 failure-tolerant pair', () => {
    expect(app).toMatch(/const reconcileAfterAbandon = async \(\) => \{/);
    expect(app).toMatch(/const result = await checkEntitlement\(service\);/);
    expect(app).toMatch(/const next = nextPlusState\(plus, result\);/);
    expect(app).toMatch(/onAbandon=\{reconcileAfterAbandon\}/);
  });

  test('onboarding reconciles too — a charge there must not land as a free user', () => {
    expect(onb).toMatch(/onAbandon=\{async \(\) => \{/);
    expect(onb).toMatch(/result\.verified && result\.entitlement/);
  });

  test('onboarding grants only on a VERIFIED answer', () => {
    // nextPlusState's rule, restated at the one call site that cannot use it:
    // an unreachable store must never be read as "no entitlement".
    expect(onb).not.toMatch(/if \(result\.entitlement\) \{ setPayOpen/);
  });
});

// ── IMP-091 — the escape never appeared on hardware ──────────────────────────
// WALK-19 step 4c, 2026-09-06: airplane mode, tap buy, and at 22s, 32s and past
// 60s the Close button IMP-088 shipped never showed. The wiring was correct. The
// only thing arming it was a setTimeout, and Play's purchase sheet is a separate
// Android activity — our app is backgrounded for the whole grace period and
// Android throttles background JS timers.
//
// ⚠️ Jest cannot see the thing that caused this: it has no Play sheet and no
// Android activity lifecycle. What it CAN pin is that arming no longer depends
// on a timer having run.
describe('graceSpent — IMP-091', () => {
  test('the grace period is measured in elapsed time, not in timer callbacks', () => {
    const t0 = 1_000_000;
    expect(graceSpent(t0, t0 + PENDING_GRACE_MS, PENDING_GRACE_MS)).toBe(true);
    expect(graceSpent(t0, t0 + PENDING_GRACE_MS + 40_000, PENDING_GRACE_MS)).toBe(true);
  });

  test('it does not arm early — a user reading the Play sheet must not see it', () => {
    const t0 = 1_000_000;
    expect(graceSpent(t0, t0 + PENDING_GRACE_MS - 1, PENDING_GRACE_MS)).toBe(false);
    expect(graceSpent(t0, t0, PENDING_GRACE_MS)).toBe(false);
  });

  test('no pending flow arms nothing, however long the app was away', () => {
    expect(graceSpent(0, 9_999_999, PENDING_GRACE_MS)).toBe(false);
  });
});

describe('the escape survives a backgrounded app — IMP-091', () => {
  const service = () => ({
    // Never settles: this is the airplane-mode hang, exactly as observed.
    buy: jest.fn(() => new Promise(() => {})),
    restore: jest.fn(() => new Promise(() => {})),
  });

  function mountWithAppState(svc) {
    let handler = null;
    const spy = jest.spyOn(AppState, 'addEventListener').mockImplementation((evt, fn) => {
      if (evt === 'change') handler = fn;
      return { remove: jest.fn() };
    });
    const hook = renderHook(() => usePurchaseFlow({ service: svc, onComplete: jest.fn() }));
    return { hook, fire: (state) => act(() => { handler(state); }), spy };
  }

  test('returning to the foreground after the grace period arms the escape', async () => {
    jest.useFakeTimers();
    const svc = service();
    const { hook, fire, spy } = mountWithAppState(svc);
    try {
      act(() => { hook.result.current.buy('annual'); });
      expect(hook.result.current.stuck).toBe(false);

      // The app is backgrounded behind Play's sheet: no timer runs at all.
      // Only wall-clock time passes.
      const realNow = Date.now;
      Date.now = () => realNow() + PENDING_GRACE_MS + 5_000;
      fire('active');
      Date.now = realNow;

      await waitFor(() => expect(hook.result.current.stuck).toBe(true));
    } finally {
      spy.mockRestore();
      jest.useRealTimers();
    }
  });

  test('coming back BEFORE the grace period is up does not arm it', async () => {
    jest.useFakeTimers();
    const svc = service();
    const { hook, fire, spy } = mountWithAppState(svc);
    try {
      act(() => { hook.result.current.buy('annual'); });
      fire('active');
      expect(hook.result.current.stuck).toBe(false);
    } finally {
      spy.mockRestore();
      jest.useRealTimers();
    }
  });

  test('a settled flow is never re-armed by a later foreground', async () => {
    jest.useFakeTimers();
    const svc = { buy: jest.fn(async () => ({ kind: 'failed' })), restore: jest.fn() };
    const { hook, fire, spy } = mountWithAppState(svc);
    try {
      act(() => { hook.result.current.buy('annual'); });
      await waitFor(() => expect(hook.result.current.flow).toMatchObject({ phase: 'result' }));

      const realNow = Date.now;
      Date.now = () => realNow() + 600_000;
      fire('active');
      Date.now = realNow;

      expect(hook.result.current.stuck).toBe(false);
    } finally {
      spy.mockRestore();
      jest.useRealTimers();
    }
  });

  test('the subscription is torn down on unmount', () => {
    const remove = jest.fn();
    const spy = jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove });
    try {
      const { unmount } = renderHook(() => usePurchaseFlow({ service: service(), onComplete: jest.fn() }));
      unmount();
      expect(remove).toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  // IMP-088's rule, inherited verbatim: this unlocks a way out, it never
  // asserts an outcome. A real INR/3DS charge takes minutes.
  test('arming the escape still settles nothing', async () => {
    jest.useFakeTimers();
    const svc = service();
    const { hook, fire, spy } = mountWithAppState(svc);
    try {
      act(() => { hook.result.current.buy('annual'); });
      const realNow = Date.now;
      Date.now = () => realNow() + PENDING_GRACE_MS + 1_000;
      fire('active');
      Date.now = realNow;
      await waitFor(() => expect(hook.result.current.stuck).toBe(true));
      expect(hook.result.current.flow).toMatchObject({ phase: 'pending' });
    } finally {
      spy.mockRestore();
      jest.useRealTimers();
    }
  });
});

// ── IMP-092 — the restore card must not talk about a purchase ────────────────
describe('resultCopy — IMP-092', () => {
  test('a failed RESTORE says we could not check, not that a purchase failed', () => {
    const { title, body } = resultCopy('failed', 'restore');
    expect(title).toBe("We couldn't check.");
    expect(body).toMatch(/nothing has changed/i);
    expect(body).not.toMatch(/charged|purchase/i);
  });

  test('a failed BUY keeps the purchase copy — it is the one that was charged-adjacent', () => {
    const { title, body } = resultCopy('failed', 'buy');
    expect(title).toBe("That didn't go through.");
    expect(body).toMatch(/weren't charged/i);
  });

  test('a failed restore never claims the account has no subscription', () => {
    const { title, body } = resultCopy('failed', 'restore');
    expect(`${title} ${body}`).not.toMatch(/couldn't find|no subscription|nothing to restore/i);
  });

  test('every other kind is untouched by the mode', () => {
    ['success', 'owned', 'restored', 'network', 'restore-empty'].forEach((kind) => {
      expect(resultCopy(kind, 'restore')).toEqual(resultCopy(kind, 'buy'));
    });
  });

  test('an unknown kind still falls back to the failed card', () => {
    expect(resultCopy('nonsense', 'buy').title).toBe("That didn't go through.");
  });

  test('the result phase carries the mode the overlay needs', async () => {
    const svc = { buy: jest.fn(), restore: jest.fn(async () => ({ kind: 'failed' })) };
    const { result } = renderHook(() => usePurchaseFlow({ service: svc, onComplete: jest.fn() }));
    act(() => { result.current.restore(); });
    await waitFor(() => expect(result.current.flow).toMatchObject({
      phase: 'result', kind: 'failed', mode: 'restore',
    }));
  });
});
