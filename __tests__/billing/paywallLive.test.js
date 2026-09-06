// __tests__/billing/paywallLive.test.js — IMP-084.
//
// PLUS_ENABLED says the paid surface is INTENDED. This says it can actually
// transact. v1.0.8 / vc14 shipped with the first true and the second false:
// no RevenueCat key reached the build, billing fell back to simService, and the
// paywall faked purchases and granted Plus free. All eight combinations are
// pinned because the gate is one boolean expression and the wrong one ships a
// giveaway to a store track.
import { paywallLive, billingModuleOk } from '../../src/billing';

describe('paywallLive', () => {
  test('live when Plus is on and billing is configured', () => {
    expect(paywallLive({ plusEnabled: true, billingConfigured: true, dev: false })).toBe(true);
  });

  test('live in dev without a key — the simulation is legitimate in Expo Go', () => {
    expect(paywallLive({ plusEnabled: true, billingConfigured: false, dev: true })).toBe(true);
  });

  test('live when Plus is on, billing is configured, and dev is true', () => {
    expect(paywallLive({ plusEnabled: true, billingConfigured: true, dev: true })).toBe(true);
  });

  test('NOT live in a store build with no key — the vc14 giveaway', () => {
    expect(paywallLive({ plusEnabled: true, billingConfigured: false, dev: false })).toBe(false);
  });

  test('never live when Plus is off, whatever else is true', () => {
    expect(paywallLive({ plusEnabled: false, billingConfigured: true, dev: true })).toBe(false);
    expect(paywallLive({ plusEnabled: false, billingConfigured: true, dev: false })).toBe(false);
    expect(paywallLive({ plusEnabled: false, billingConfigured: false, dev: true })).toBe(false);
    expect(paywallLive({ plusEnabled: false, billingConfigured: false, dev: false })).toBe(false);
  });

  test('returns a boolean, not a truthy value — it is threaded into props', () => {
    expect(paywallLive({ plusEnabled: undefined, billingConfigured: undefined, dev: undefined })).toBe(false);
  });
});

// The gate only works if RitualsApp threads it everywhere. jest renders a tree
// with __DEV__ true, so a bare `plusEnabled={PLUS_ENABLED}` reintroducing the
// giveaway would render identically here and pass every other test in the suite.
// Only a source assertion catches it without a device.
describe('RitualsApp.js wires the gate, not the flag', () => {
  const fs = require('fs');
  const path = require('path');
  const source = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'RitualsApp.js'), 'utf8');

  test('no prop or modal is handed the bare PLUS_ENABLED flag', () => {
    // The JSX-prop form only — `plusEnabled: PLUS_ENABLED` inside the paywallLive
    // call is the one legitimate pairing, and the next test pins it exactly.
    expect(source).not.toMatch(/plusEnabled=\{\s*PLUS_ENABLED\s*\}/);
    expect(source).not.toMatch(/visible=\{\s*PLUS_ENABLED\s*&&/);
    expect(source).not.toMatch(/\{\s*PLUS_ENABLED\s*\?/);
  });

  test('PLUS_ENABLED survives only as an input to the two derived gates', () => {
    // IMP-087 added the second `plusEnabled: PLUS_ENABLED` — billingDiagnostic
    // needs the INTENT flag to know a build meant to sell and could not. Pinned
    // exactly rather than loosened to a count: the whole value of this assertion
    // is that a new bare use has to be justified here before it can ship.
    const uses = source.split('\n').filter(
      (l) => /\bPLUS_ENABLED\b/.test(l) && !l.trim().startsWith('//')
    );
    expect(uses).toEqual([
      "import { PLUS_ENABLED, EMBER_PACKS_ENABLED } from './billing/config';",
      '  plusEnabled: PLUS_ENABLED,',
      '  plusEnabled: PLUS_ENABLED,',
    ]);
  });

  test('the gate is derived from the real billing capability', () => {
    expect(source).toMatch(/const PAYWALL_LIVE = paywallLive\(\{/);
    expect(source).toMatch(/billingConfigured: isBillingConfigured\(PLATFORM\)/);
    expect(source).toMatch(/dev: __DEV__/);
  });
});

// IMP-085 — the probe that has always said no.
//
// index.js asked `require.resolve('react-native-purchases')`. Metro's runtime
// polyfill never assigns `resolve` and its transformer never rewrites it, so
// that call threw in EVERY bundle, the catch swallowed it, and
// isBillingConfigured() returned false in every build ever shipped. Under jest
// `require` is node's, where require.resolve works — which is exactly why 915
// green tests could not see it. The replacement asks the module what it IS.
describe('billingModuleOk', () => {
  test('true for a module exposing RevenueCat\'s configure entry point', () => {
    expect(billingModuleOk({ configure: () => {} })).toBe(true);
  });

  test('false for an empty module — resolved, but nothing linked', () => {
    expect(billingModuleOk({})).toBe(false);
  });

  test('false when configure is present but not callable', () => {
    expect(billingModuleOk({ configure: 'yes' })).toBe(false);
  });

  test('false for null and undefined — the Expo Go / unlinked case', () => {
    expect(billingModuleOk(null)).toBe(false);
    expect(billingModuleOk(undefined)).toBe(false);
  });

  test('returns a boolean, not a truthy value', () => {
    expect(billingModuleOk({ configure: () => {}, extra: 1 })).toBe(true);
  });
});

// The one string that is the whole defect. Nothing else in the suite can catch
// its return value, because node's require.resolve succeeds here.
describe('src/billing/index.js does not probe with require.resolve', () => {
  test('no CODE line calls require.resolve — the comment naming it is allowed', () => {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(
      path.join(__dirname, '..', '..', 'src', 'billing', 'index.js'), 'utf8');
    const code = source
      .split('\n')
      .filter((l) => !l.trim().startsWith('//'))
      .join('\n');
    expect(code).not.toMatch(/require\s*\.\s*resolve/);
  });

  test('it probes with a plain static require, which Metro collects', () => {
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(
      path.join(__dirname, '..', '..', 'src', 'billing', 'index.js'), 'utf8');
    expect(source).toMatch(/require\('react-native-purchases'\)/);
  });
});

// IMP-086 — the screen the IMP-084 audit did not read.
//
// Onboarding mounts the trial teaser and the full Paywall, and it gated all
// three on the bare PLUS_ENABLED flag. In a build that cannot transact its
// createPurchaseService falls back to simService, which returns
// {kind:'success'} after 1500ms, grants Plus free, and persists it — the vc14
// giveaway, still reachable on first run. jest renders with __DEV__ true, so
// the gate is legitimately true here and only a source assertion can see this.
describe('Onboarding.js wires the gate, not the flag', () => {
  const fs = require('fs');
  const path = require('path');
  const source = fs.readFileSync(
    path.join(__dirname, '..', '..', 'src', 'screens', 'Onboarding.js'), 'utf8');

  test('no mount is gated on the bare PLUS_ENABLED flag', () => {
    expect(source).not.toMatch(/\{\s*PLUS_ENABLED\s*&&/);
    expect(source).not.toMatch(/\{\s*PLUS_ENABLED\s*\?/);
    expect(source).not.toMatch(/=\{\s*PLUS_ENABLED\s*\}/);
  });

  test('PLUS_ENABLED survives only as the input to OB_PAYWALL_LIVE', () => {
    const uses = source.split('\n').filter(
      (l) => /\bPLUS_ENABLED\b/.test(l) && !l.trim().startsWith('//')
    );
    expect(uses).toEqual([
      "import { PLUS_ENABLED } from '../billing/config';",
      '  plusEnabled: PLUS_ENABLED,',
    ]);
  });

  test('the gate is the same expression RitualsApp uses', () => {
    expect(source).toMatch(/const OB_PAYWALL_LIVE = paywallLive\(\{/);
    expect(source).toMatch(/billingConfigured: isBillingConfigured\(OB_PLATFORM\)/);
    expect(source).toMatch(/dev: __DEV__/);
  });

  test('all three onboarding paid mounts read the gate', () => {
    const gated = source.split('\n').filter((l) => /OB_PAYWALL_LIVE/.test(l) && /&&|\?/.test(l));
    expect(gated).toHaveLength(3);
  });
});

// IMP-087 — the gate must stop failing silently. Three defects, one empty tab.
describe('the You tab reports a dead gate instead of hiding', () => {
  const fs = require('fs');
  const path = require('path');
  const you = fs.readFileSync(
    path.join(__dirname, '..', '..', 'src', 'screens', 'YouScreen.js'), 'utf8');
  const app = fs.readFileSync(
    path.join(__dirname, '..', '..', 'src', 'RitualsApp.js'), 'utf8');

  test('YouScreen renders the diagnostic where the paid surface would be', () => {
    expect(you).toMatch(/\{billingDiagnostic && !plus && \(/);
    expect(you).toMatch(/label="Plus is unavailable"/);
  });

  test('the row is NOT gated on plusEnabled — that is the gate it reports on', () => {
    // Gating the report on the thing being reported is how this stays invisible.
    expect(you).not.toMatch(/plusEnabled && billingDiagnostic/);
    expect(you).not.toMatch(/billingDiagnostic && plusEnabled/);
  });

  test('RitualsApp derives it from the split facts, not from PAYWALL_LIVE', () => {
    expect(app).toMatch(/const BILLING_DIAGNOSTIC = billingDiagnostic\(\{/);
    expect(app).toMatch(/\.\.\.billingStatus\(PLATFORM\)/);
    expect(app).toMatch(/billingDiagnostic=\{BILLING_DIAGNOSTIC\}/);
  });

  test('the running bundle is read defensively — it must not crash the screen', () => {
    expect(app).toMatch(/try \{ _updates = require\('expo-updates'\); \} catch/);
  });
});
