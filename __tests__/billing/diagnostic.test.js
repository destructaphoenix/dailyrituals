// __tests__/billing/diagnostic.test.js — IMP-087.
//
// Three separate defects have produced one identical screen: an empty You tab.
// Each cost a round trip to the owner's device to tell apart. These pin that the
// diagnostic names the right one, and — just as important — that it stays silent
// in every healthy build, because a warning that shows up when nothing is wrong
// gets ignored the one time it matters.
import { billingDiagnostic, describeUpdate, BILLING_DIAGNOSTIC } from '../../src/billing/diagnostic';

describe('billingDiagnostic', () => {
  test('silent when the surface is live — nothing to report', () => {
    expect(billingDiagnostic({ plusEnabled: true, moduleOk: true, keyPresent: true, dev: false })).toBe(null);
  });

  test('silent in a free release — nothing is missing, Plus is simply off', () => {
    expect(billingDiagnostic({ plusEnabled: false, moduleOk: false, keyPresent: false, dev: false })).toBe(null);
  });

  test('silent in dev — the simulation is legitimate in Expo Go', () => {
    expect(billingDiagnostic({ plusEnabled: true, moduleOk: false, keyPresent: false, dev: true })).toBe(null);
  });

  test('names the key when only the key is missing — the IMP-085 OTA', () => {
    const d = billingDiagnostic({ plusEnabled: true, moduleOk: true, keyPresent: false, dev: false });
    expect(d.code).toBe('key');
    expect(d.reason).toBe(BILLING_DIAGNOSTIC.key);
  });

  test('names the module when only the module is missing — vc15\'s dead probe', () => {
    const d = billingDiagnostic({ plusEnabled: true, moduleOk: false, keyPresent: true, dev: false });
    expect(d.code).toBe('module');
  });

  test('names both when both are missing', () => {
    expect(billingDiagnostic({ plusEnabled: true, moduleOk: false, keyPresent: false, dev: false }).code).toBe('none');
  });

  test('every code has copy, and none of it blames the user', () => {
    Object.values(BILLING_DIAGNOSTIC).forEach((reason) => {
      expect(typeof reason).toBe('string');
      expect(reason.length).toBeGreaterThan(0);
      expect(reason).not.toMatch(/\byou(r)?\b/i);
    });
  });
});

// The half of every past round trip that was "is the fix even on the phone?" —
// an OTA applies on the SECOND launch, so a correct fix and an unapplied one are
// the same screen. Takes the module so it needs no native mock.
describe('describeUpdate', () => {
  test('says so plainly when the embedded bundle is running', () => {
    expect(describeUpdate({ isEmbeddedLaunch: true, updateId: 'abc-def' })).toMatch(/built-in bundle/);
  });

  test('an absent updateId is the embedded case too', () => {
    expect(describeUpdate({ isEmbeddedLaunch: false, updateId: null })).toMatch(/built-in bundle/);
  });

  test('names the update short id and when it was published', () => {
    const out = describeUpdate({
      isEmbeddedLaunch: false,
      updateId: '62a8f8cf-9853-47e8-b013-907544e85f0c',
      createdAt: new Date('2026-09-06T12:34:56.000Z'),
    });
    expect(out).toContain('62a8f8cf');
    expect(out).toContain('2026-09-06 12:34 UTC');
  });

  test('an unparseable createdAt degrades to the id, never to a crash', () => {
    expect(describeUpdate({ isEmbeddedLaunch: false, updateId: 'deadbeef-1111', createdAt: 'not a date' }))
      .toBe('update deadbeef');
  });

  test('a missing module does not throw — the diagnostic must not break the screen', () => {
    expect(describeUpdate(null)).toBe('unknown build');
    expect(describeUpdate(undefined)).toBe('unknown build');
  });
});
