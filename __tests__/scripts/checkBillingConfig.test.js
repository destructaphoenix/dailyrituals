// __tests__/scripts/checkBillingConfig.test.js — the guard that stops a build
// shipping a paywall wired to the simulation. See scripts/check-billing-config.js.
const { parsePlusEnabled, billingPreflight } = require('../../scripts/check-billing-config');

describe('parsePlusEnabled', () => {
  test('reads the flag from the real config source shape', () => {
    expect(parsePlusEnabled('export const PLUS_ENABLED = false;\n')).toBe(false);
    expect(parsePlusEnabled('export const PLUS_ENABLED = true;\n')).toBe(true);
  });
  test('tolerates whitespace variations', () => {
    expect(parsePlusEnabled('export  const   PLUS_ENABLED=true')).toBe(true);
  });
  test('ignores the flag name appearing in comments or imports', () => {
    const src = "// Flip PLUS_ENABLED to true in Phase 10b\nexport const PLUS_ENABLED = false;\n";
    expect(parsePlusEnabled(src)).toBe(false);
  });
  test('throws when the declaration is absent, rather than guessing', () => {
    expect(() => parsePlusEnabled('export const SOMETHING_ELSE = true;')).toThrow(/PLUS_ENABLED/);
  });
});

describe('billingPreflight', () => {
  test('passes when Plus is off — no purchase surface ships', () => {
    expect(billingPreflight({ plusEnabled: false, androidKey: '' }).ok).toBe(true);
  });

  test('passes when Plus is on and a production Play key is present', () => {
    expect(billingPreflight({ plusEnabled: true, androidKey: 'goog_abc123' }).ok).toBe(true);
  });

  test('FAILS when Plus is on but the key is missing — the silent-sim case', () => {
    const res = billingPreflight({ plusEnabled: true, androidKey: '' });
    expect(res.ok).toBe(false);
    expect(res.reason).toMatch(/RC_ANDROID_KEY/);
  });

  test('FAILS when Plus is on but the key is undefined', () => {
    expect(billingPreflight({ plusEnabled: true, androidKey: undefined }).ok).toBe(false);
  });

  test('FAILS on a sandbox key — real buyers would not be charged', () => {
    const res = billingPreflight({ plusEnabled: true, androidKey: 'test_abc123' });
    expect(res.ok).toBe(false);
    expect(res.reason).toMatch(/goog_/);
  });

  test('FAILS on a whitespace-only key', () => {
    expect(billingPreflight({ plusEnabled: true, androidKey: '   ' }).ok).toBe(false);
  });
});
