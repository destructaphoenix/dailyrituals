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
  stuckCopy, pendingCopy, PENDING_GRACE_MS, graceSpent, resultCopy, usePurchaseFlow,
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

  test('the not-yet-stuck sub-line is shown only BEFORE the flow is stuck', () => {
    // Leaving that line up next to a Close button is the contradiction that
    // made the original trap feel deliberate. IMP-093 replaced the literal
    // "Don't close the app." with pendingCopy(); the structure is unchanged.
    const i = src.indexOf('pendingCopy(flow.mode, platform)');
    const j = src.indexOf('escape ? (');
    expect(i).toBeGreaterThan(j); // it lives in the else branch
  });

  test('the timer is cleared on unmount — no setState after teardown', () => {
    expect(src).toMatch(/if \(timer\.current\) clearTimeout\(timer\.current\);/);
  });

  test('abandoning fires onAbandon whenever a flow was in flight (IMP-093)', () => {
    // Was `wasStuck`. A back press at 3 seconds abandons a real purchase just
    // as much as one at 30 — what matters is that something was pending.
    expect(src).toMatch(/if \(wasPending && onAbandon\) onAbandon\(mode\);/);
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

  // IMP-101: a `failed` buy was never actually confirmed with the store, so
  // the card can no longer assert nothing was charged.
  test('a failed BUY no longer denies being charged', () => {
    const { title, body } = resultCopy('failed', 'buy');
    expect(title).toBe("We couldn't confirm that.");
    expect(body).not.toMatch(/weren't charged/i);
    expect(body).toMatch(/couldn't see a subscription/i);
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

// ── IMP-093 — the paywall must not vanish mid-purchase ───────────────────────
// WALK-19 step 4c re-run, 2026-09-07. Play's no-connection page carries no
// dismiss control but Back, and Back closed the WHOLE paywall — unmounting
// usePurchaseFlow and discarding a purchase in flight without asking the store.
// Closing stays correct; refusing to close would re-create IMP-088's trap for
// the first 20 seconds, when no exit exists at all.
describe('backing out of a pending flow reconciles — IMP-093', () => {
  const hanging = () => ({
    buy: jest.fn(() => new Promise(() => {})),
    restore: jest.fn(() => new Promise(() => {})),
  });

  test('dismissing a pending purchase asks the store, even before the escape arms', async () => {
    const onAbandon = jest.fn();
    const { result } = renderHook(() => usePurchaseFlow({
      service: hanging(), onComplete: jest.fn(), onAbandon,
    }));
    act(() => { result.current.buy('annual'); });
    expect(result.current.stuck).toBe(false); // nowhere near the grace period
    act(() => { result.current.dismiss(); });
    expect(onAbandon).toHaveBeenCalledWith('buy');
  });

  test('it reports the mode, so the reconcile knows what was abandoned', () => {
    const onAbandon = jest.fn();
    const { result } = renderHook(() => usePurchaseFlow({
      service: hanging(), onComplete: jest.fn(), onAbandon,
    }));
    act(() => { result.current.restore(); });
    act(() => { result.current.dismiss(); });
    expect(onAbandon).toHaveBeenCalledWith('restore');
  });

  test('dismissing when nothing is in flight asks nothing', () => {
    const onAbandon = jest.fn();
    const { result } = renderHook(() => usePurchaseFlow({
      service: hanging(), onComplete: jest.fn(), onAbandon,
    }));
    act(() => { result.current.dismiss(); });
    expect(onAbandon).not.toHaveBeenCalled();
  });

  test('dismissing a SETTLED result asks nothing — it is already known', async () => {
    const onAbandon = jest.fn();
    const svc = { buy: jest.fn(async () => ({ kind: 'failed' })), restore: jest.fn() };
    const { result } = renderHook(() => usePurchaseFlow({
      service: svc, onComplete: jest.fn(), onAbandon,
    }));
    act(() => { result.current.buy('annual'); });
    await waitFor(() => expect(result.current.flow).toMatchObject({ phase: 'result' }));
    act(() => { result.current.dismiss(); });
    expect(onAbandon).not.toHaveBeenCalled();
  });

  test('the hook exposes what a Modal owner needs to close honestly', () => {
    const { result } = renderHook(() => usePurchaseFlow({
      service: hanging(), onComplete: jest.fn(),
    }));
    expect(result.current.pending).toBe(false);
    act(() => { result.current.buy('annual'); });
    expect(result.current.pending).toBe(true);
    expect(typeof result.current.dismiss).toBe('function');
  });
});

describe('pendingCopy — IMP-093', () => {
  test('it no longer tells the user not to close the app', () => {
    ['buy', 'restore'].forEach((mode) => {
      expect(pendingCopy(mode, 'android')).not.toMatch(/don't close|do not close|keep the app open/i);
    });
  });

  test('it says going back is safe, because after IMP-093 it is', () => {
    expect(pendingCopy('buy', 'android')).toMatch(/going back is safe/i);
    expect(pendingCopy('restore', 'android')).toMatch(/going back is safe/i);
  });

  test('a pending purchase still asserts NO outcome — IMP-088 inherited', () => {
    const line = pendingCopy('buy', 'android');
    expect(line).not.toMatch(/failed|success|complete|charged you|didn't work/i);
  });

  test('it names the right store per platform', () => {
    expect(pendingCopy('buy', 'android')).toMatch(/Play/);
    expect(pendingCopy('buy', 'ios')).toMatch(/App Store/);
  });

  test('a restore may say nothing is being charged — nothing is', () => {
    expect(pendingCopy('restore', 'android')).toMatch(/nothing is being charged/i);
  });
});

describe('the Modal that owns the paywall closes honestly — IMP-093', () => {
  const fs = require('fs');
  const path = require('path');
  const app = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'RitualsApp.js'), 'utf8');
  const pay = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'screens', 'Paywall.js'), 'utf8');

  test('Paywall hands its caller the pending state and the reconciling dismiss', () => {
    expect(pay).toMatch(/closeGuard\.current = \{ pending: flow\.pending, abandon: flow\.dismiss \};/);
  });

  test('it clears the guard on unmount — a stale flow must not be abandonable', () => {
    expect(pay).toMatch(/return \(\) => \{ closeGuard\.current = null; \};/);
  });

  test('back on the paywall Modal reconciles before it closes', () => {
    expect(app).toMatch(/if \(guard && guard\.pending\) guard\.abandon\(\);/);
    expect(app).toMatch(/closeGuard=\{paywallCloseGuard\}/);
  });

  test('back still CLOSES — refusing would rebuild the IMP-088 trap', () => {
    // The first 20 seconds have no other exit, so a no-op here would be the
    // original defect wearing a fix's clothes.
    const i = app.indexOf('if (guard && guard.pending) guard.abandon();');
    const j = app.indexOf('setPaywall(false);', i);
    expect(i).toBeGreaterThan(-1);
    expect(j).toBeGreaterThan(i);
  });
});
