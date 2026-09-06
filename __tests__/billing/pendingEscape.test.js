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
import { stuckCopy, PENDING_GRACE_MS } from '../../src/screens/PlusFlow';

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
