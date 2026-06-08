import { hasCompletedOnboarding } from '../../src/persistence/onboarding';
import { serialize, deserialize, pickPersisted, SCHEMA_VERSION } from '../../src/persistence/state';

// Bug 1: onboarding must show on the FIRST EVER launch only — never on every
// cold start. The gate keys off persisted state, so these cases model the three
// real launch scenarios.
describe('onboarding gate (first-run shows once)', () => {
  test('brand-new user (nothing stored) sees onboarding', () => {
    expect(hasCompletedOnboarding(null)).toBe(false);
  });

  test('returning user with the explicit onboarded flag skips onboarding', () => {
    expect(hasCompletedOnboarding({ onboarded: true })).toBe(true);
  });

  test('existing tester from before the flag (has data, no flag) skips onboarding', () => {
    // This is the migration-safety case: their saved state never had `onboarded`,
    // but an update must NOT throw them back into first-run.
    expect(hasCompletedOnboarding({ streak: 5, entries: [{ id: 'x' }] })).toBe(true);
  });

  test('the onboarded flag survives a real save→load cycle', () => {
    // Mirrors what RitualsApp persists: pickPersisted -> serialize -> deserialize.
    const saved = serialize({ version: SCHEMA_VERSION, ...pickPersisted({ onboarded: true, streak: 1 }) });
    const loaded = deserialize(saved);
    expect(hasCompletedOnboarding(loaded)).toBe(true);
  });
});
