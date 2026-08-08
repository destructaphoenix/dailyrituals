import {
  shouldQuarantine, shouldOfferRestore, preferredSource, runQuarantine, pendingRestoreInventory,
} from '../../src/persistence/restoreQuarantine';

describe('shouldQuarantine', () => {
  test('delegates to isRestoredInstall — restore detected', () => {
    expect(shouldQuarantine({ lastSavedAt: 1000, installedAt: 2000 })).toBe(true);
  });
  test('delegates to isRestoredInstall — no restore', () => {
    expect(shouldQuarantine({ lastSavedAt: 2000, installedAt: 1000 })).toBe(false);
  });
  test('delegates to isRestoredInstall — missing fields stay false, no crash', () => {
    expect(shouldQuarantine({})).toBe(false);
    expect(shouldQuarantine()).toBe(false);
  });
});

describe('shouldOfferRestore', () => {
  test('stash present + onboarded ⇒ true', () => {
    expect(shouldOfferRestore({ hasStash: true, onboarded: true })).toBe(true);
  });
  test('stash present + not onboarded ⇒ false', () => {
    expect(shouldOfferRestore({ hasStash: true, onboarded: false })).toBe(false);
  });
  test('no stash ⇒ false regardless of onboarded', () => {
    expect(shouldOfferRestore({ hasStash: false, onboarded: true })).toBe(false);
    expect(shouldOfferRestore({ hasStash: false, onboarded: false })).toBe(false);
  });
});

describe('preferredSource', () => {
  test('the export is newer than the Google copy ⇒ file', () => {
    const lastSavedAt = new Date(2026, 5, 1).getTime();
    const lastBackupAt = new Date(2026, 5, 10).toISOString();
    expect(preferredSource({ lastSavedAt, lastBackupAt })).toBe('file');
  });
  test('the Google copy is newer than the export ⇒ google', () => {
    const lastSavedAt = new Date(2026, 5, 10).getTime();
    const lastBackupAt = new Date(2026, 5, 1).toISOString();
    expect(preferredSource({ lastSavedAt, lastBackupAt })).toBe('google');
  });
  test('export missing ⇒ google', () => {
    expect(preferredSource({ lastSavedAt: Date.now() })).toBe('google');
  });
  test('exactly equal ⇒ google (tie goes to the Google copy)', () => {
    const ms = new Date(2026, 5, 5).getTime();
    expect(preferredSource({ lastSavedAt: ms, lastBackupAt: new Date(ms).toISOString() })).toBe('google');
  });
  test('non-numeric lastSavedAt ⇒ google, no coercion', () => {
    expect(preferredSource({ lastSavedAt: 'nope', lastBackupAt: new Date().toISOString() })).toBe('google');
  });
  test('unparseable lastBackupAt ⇒ google, no coercion', () => {
    expect(preferredSource({ lastSavedAt: Date.now(), lastBackupAt: 'not-a-date' })).toBe('google');
  });
});

describe('runQuarantine', () => {
  const okEffects = () => ({
    readRawState: jest.fn(async () => '{"a":1}'),
    writePendingRestore: jest.fn(async () => true),
    readPendingRestore: jest.fn(async () => '{"a":1}'),
    clearState: jest.fn(async () => true),
  });

  test('happy path: stashes, verifies the read-back, then clears the live key', async () => {
    const eff = okEffects();
    const ok = await runQuarantine(eff);
    expect(ok).toBe(true);
    expect(eff.writePendingRestore).toHaveBeenCalledWith('{"a":1}');
    expect(eff.clearState).toHaveBeenCalledTimes(1);
  });

  test('no raw state ⇒ nothing to quarantine, main key untouched', async () => {
    const eff = { ...okEffects(), readRawState: jest.fn(async () => null) };
    const ok = await runQuarantine(eff);
    expect(ok).toBe(false);
    expect(eff.clearState).not.toHaveBeenCalled();
  });

  test('failed stash write ⇒ abort, main key left intact', async () => {
    const eff = { ...okEffects(), writePendingRestore: jest.fn(async () => false) };
    const ok = await runQuarantine(eff);
    expect(ok).toBe(false);
    expect(eff.clearState).not.toHaveBeenCalled();
  });

  test('read-back returns null ⇒ abort, main key left intact', async () => {
    const eff = { ...okEffects(), readPendingRestore: jest.fn(async () => null) };
    const ok = await runQuarantine(eff);
    expect(ok).toBe(false);
    expect(eff.clearState).not.toHaveBeenCalled();
  });

  test('read-back fails to parse ⇒ abort, main key left intact', async () => {
    const eff = { ...okEffects(), readPendingRestore: jest.fn(async () => 'not json{{{') };
    const ok = await runQuarantine(eff);
    expect(ok).toBe(false);
    expect(eff.clearState).not.toHaveBeenCalled();
  });
});

describe('pendingRestoreInventory', () => {
  test('lists every non-zero paid-inventory field, joined with commas and "and"', () => {
    expect(pendingRestoreInventory({ embers: 1500, ownedPalettes: ['a', 'b'], ownedSkies: ['c'], freezes: 3 }))
      .toBe('1,500 Embers, 2 palettes, 1 sky and 3 candles');
  });
  test('a single item has no separators', () => {
    expect(pendingRestoreInventory({ embers: 15 })).toBe('15 Embers');
  });
  test('singular counts stay singular', () => {
    expect(pendingRestoreInventory({ embers: 1, ownedPalettes: ['a'], ownedSkies: ['b'], freezes: 1 }))
      .toBe('1 Ember, 1 palette, 1 sky and 1 candle');
  });
  test('nothing paid in the stash ⇒ empty string', () => {
    expect(pendingRestoreInventory({})).toBe('');
    expect(pendingRestoreInventory(null)).toBe('');
  });
});
