import { SCHEMA_VERSION, serialize, deserialize, mergeWithDefaults, pickPersisted, PERSISTED_KEYS } from '../../src/persistence/state';
import { SAMPLE_ENTRIES } from '../../src/data';
import { DEFAULT_SETTINGS } from '../../src/theme';

const sample = { version: SCHEMA_VERSION, embers: 360, streak: 4, ownedSkies: ['classic'] };

describe('serialize/deserialize round-trip', () => {
  test('serialize tags the current schema version', () => {
    const out = JSON.parse(serialize({ embers: 10 }));
    expect(out.version).toBe(SCHEMA_VERSION);
    expect(out.embers).toBe(10);
  });
  test('deserialize returns null for empty/garbage input', () => {
    expect(deserialize(null)).toBeNull();
    expect(deserialize('not json')).toBeNull();
  });
  test('deserialize drops a payload from an unknown future version', () => {
    expect(deserialize(JSON.stringify({ version: 9999, embers: 1 }))).toBeNull();
  });
  test('round-trips a valid payload', () => {
    expect(deserialize(serialize(sample))).toMatchObject({ embers: 360, streak: 4 });
  });
});

describe('v1→v2 migration', () => {
  const v1Payload = {
    version: 1,
    streak: 4,
    xp: 320,
    embers: 360,
    freezes: 2,
    entries: SAMPLE_ENTRIES,
    settings: { name: 'Maya' },
    ownedSkies: ['classic', 'crescent'],
  };

  test('progress fields are zeroed after migrating a v1 payload', () => {
    const result = deserialize(JSON.stringify(v1Payload));
    // streak is no longer persisted/migrated — it derives from entries (now []).
    expect(result.xp).toBe(0);
    expect(result.embers).toBe(0);
    expect(result.freezes).toBe(0);
    expect(result.entries).toEqual([]);
  });

  test('settings and cosmetics survive migration intact', () => {
    const result = deserialize(JSON.stringify(v1Payload));
    expect(result.settings).toEqual({ name: 'Maya' });
    expect(result.ownedSkies).toEqual(['classic', 'crescent']);
  });

  test('a v2 payload passes through the v2→v3 step unchanged apart from the moods migration', () => {
    const v2Payload = { version: 2, streak: 7, xp: 100, embers: 50, freezes: 1, entries: [], settings: { name: 'Ravi' } };
    const result = deserialize(JSON.stringify(v2Payload));
    expect(result.streak).toBe(7);
    expect(result.xp).toBe(100);
    expect(result.settings).toEqual({ name: 'Ravi' });
  });
});

describe('v2→v3 migration (IMP-037 — mood: string → moods: string[])', () => {
  test('serialize stamps version 3', () => {
    expect(SCHEMA_VERSION).toBe(3);
    const out = JSON.parse(serialize({ entries: [] }));
    expect(out.version).toBe(3);
  });

  test('an entry with mood set migrates to a single-element moods array', () => {
    const v2Payload = { version: 2, entries: [{ id: 'e1', dayKey: '2026-06-01', mood: 'Tender' }] };
    const result = deserialize(JSON.stringify(v2Payload));
    expect(result.entries).toEqual([{ id: 'e1', dayKey: '2026-06-01', moods: ['Tender'] }]);
  });

  test('an entry with no mood migrates to an empty moods array', () => {
    const v2Payload = { version: 2, entries: [{ id: 'e1', dayKey: '2026-06-01' }] };
    const result = deserialize(JSON.stringify(v2Payload));
    expect(result.entries).toEqual([{ id: 'e1', dayKey: '2026-06-01', moods: [] }]);
  });

  test('an entry that already has moods is left exactly as-is (idempotent)', () => {
    const v2Payload = { version: 2, entries: [{ id: 'e1', dayKey: '2026-06-01', moods: ['Proud', 'Tired'] }] };
    const result = deserialize(JSON.stringify(v2Payload));
    expect(result.entries).toEqual([{ id: 'e1', dayKey: '2026-06-01', moods: ['Proud', 'Tired'] }]);
  });

  test('a v3 payload passes through unchanged (no double-migration)', () => {
    const v3Payload = { version: 3, entries: [{ id: 'e1', dayKey: '2026-06-01', moods: ['Grateful'] }], xp: 50 };
    const result = deserialize(JSON.stringify(v3Payload));
    expect(result.entries).toEqual([{ id: 'e1', dayKey: '2026-06-01', moods: ['Grateful'] }]);
    expect(result.xp).toBe(50);
  });

  test('a v1 payload migrates all the way through v2 to v3 without losing entries', () => {
    // v1→v2 zeroes entries entirely (pre-existing rule), so a v1 payload
    // legitimately arrives at v3 with an empty entries array, not an error.
    const v1Payload = { version: 1, entries: [{ id: 'old', dayKey: '2026-01-01', mood: 'Heavy' }], xp: 10 };
    const result = deserialize(JSON.stringify(v1Payload));
    expect(result.entries).toEqual([]);
    expect(result.xp).toBe(0);
  });

  test('every other persisted key survives the v2→v3 migration untouched', () => {
    const v2Payload = {
      version: 2, entries: [], xp: 320, embers: 360, settings: { name: 'Maya' }, ownedSkies: ['classic'],
    };
    const result = deserialize(JSON.stringify(v2Payload));
    expect(result.xp).toBe(320);
    expect(result.embers).toBe(360);
    expect(result.settings).toEqual({ name: 'Maya' });
    expect(result.ownedSkies).toEqual(['classic']);
  });

  test('a full serialize → deserialize round-trip preserves the moods array', () => {
    const slice = { entries: [{ id: 'e1', dayKey: '2026-06-01', moods: ['Hopeful', 'Tired'] }] };
    const result = deserialize(serialize(slice));
    expect(result.entries).toEqual(slice.entries);
  });
});

describe('onboarded flag persistence (first-run shows once)', () => {
  test('pickPersisted carries the onboarded flag', () => {
    expect(pickPersisted({ onboarded: true, junk: 1 })).toEqual({ onboarded: true });
  });
  test('onboarded round-trips through serialize/deserialize', () => {
    expect(deserialize(serialize({ version: SCHEMA_VERSION, onboarded: true }))).toMatchObject({ onboarded: true });
  });
});

describe('lastBackupAt persistence', () => {
  test('pickPersisted carries lastBackupAt', () => {
    expect(pickPersisted({ lastBackupAt: '2026-06-14T00:00:00.000Z', junk: 1 }))
      .toEqual({ lastBackupAt: '2026-06-14T00:00:00.000Z' });
  });
});

describe('promptDeck persistence', () => {
  test('promptDeck is a persisted key', () => {
    expect(PERSISTED_KEYS).toContain('promptDeck');
  });
  test('pickPersisted carries promptDeck through', () => {
    const deck = { day: 100, order: [2, 0, 1], pos: 1 };
    expect(pickPersisted({ promptDeck: deck }).promptDeck).toEqual(deck);
  });
  test('pickPersisted omits promptDeck when undefined', () => {
    expect('promptDeck' in pickPersisted({})).toBe(false);
  });
});

describe('frozenDays persistence (IMP-039 streak insurance)', () => {
  test('frozenDays is a persisted key', () => {
    expect(PERSISTED_KEYS).toContain('frozenDays');
  });
  test('pickPersisted carries frozenDays through', () => {
    expect(pickPersisted({ frozenDays: ['2026-06-13'], junk: 1 })).toEqual({ frozenDays: ['2026-06-13'] });
  });
  test('pickPersisted omits frozenDays when undefined', () => {
    expect('frozenDays' in pickPersisted({})).toBe(false);
  });
});

describe('lastSavedAt stamp (IMP-029 restore detection)', () => {
  test('serialize stamps lastSavedAt with the injected clock', () => {
    const out = JSON.parse(serialize({ embers: 1 }, 1700000000000));
    expect(out.lastSavedAt).toBe(1700000000000);
  });
  test('serialize defaults the clock to Date.now() when not injected', () => {
    const before = Date.now();
    const out = JSON.parse(serialize({ embers: 1 }));
    const after = Date.now();
    expect(out.lastSavedAt).toBeGreaterThanOrEqual(before);
    expect(out.lastSavedAt).toBeLessThanOrEqual(after);
  });
  test('lastSavedAt survives a serialize/deserialize round-trip', () => {
    const result = deserialize(serialize({ embers: 1 }, 1700000000000));
    expect(result.lastSavedAt).toBe(1700000000000);
  });
  test('re-serializing always refreshes lastSavedAt, even over a stale input value', () => {
    const stale = { lastSavedAt: 1000, embers: 5 };
    const out = JSON.parse(serialize(stale, 2000));
    expect(out.lastSavedAt).toBe(2000);
  });
  test('old payloads saved before this feature existed still deserialize, with no stamp', () => {
    const result = deserialize(JSON.stringify({ version: SCHEMA_VERSION, embers: 7 }));
    expect(result.embers).toBe(7);
    expect(result.lastSavedAt).toBeUndefined();
  });
});

describe('mergeWithDefaults', () => {
  test('fills missing keys from defaults but keeps loaded values', () => {
    const merged = mergeWithDefaults({ embers: 999 }, { embers: 360, streak: 4 });
    expect(merged).toMatchObject({ embers: 999, streak: 4 });
  });
  test('null loaded yields the defaults unchanged (immutably)', () => {
    const defaults = { embers: 360 };
    const merged = mergeWithDefaults(null, defaults);
    expect(merged).toEqual(defaults);
    expect(merged).not.toBe(defaults);
  });
  // IMP-031 regression: a settings object persisted before the reminder
  // feature existed must not crash every read of settings.reminder.enabled
  // on hydration (App.js merges via mergeWithDefaults, not a raw assign).
  test('a pre-IMP-031 persisted settings object gains the new reminder key on hydration', () => {
    const preExisting = { name: 'Riya', tone: 'gentle', headlineFont: 'Fredoka' };
    const merged = mergeWithDefaults(preExisting, DEFAULT_SETTINGS);
    expect(merged.reminder).toEqual({ enabled: false, hour: 20, minute: 30 });
    expect(merged.name).toBe('Riya');
    expect(merged.tone).toBe('gentle');
  });
});
