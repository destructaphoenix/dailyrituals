import { SCHEMA_VERSION, serialize, deserialize, mergeWithDefaults } from '../../src/persistence/state';
import { SAMPLE_ENTRIES } from '../../src/data';

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
    expect(result.streak).toBe(0);
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

  test('a v2 payload passes through unchanged (no double-reset)', () => {
    const v2Payload = { version: 2, streak: 7, xp: 100, embers: 50, freezes: 1, entries: [], settings: { name: 'Ravi' } };
    const result = deserialize(JSON.stringify(v2Payload));
    expect(result.streak).toBe(7);
    expect(result.xp).toBe(100);
    expect(result.settings).toEqual({ name: 'Ravi' });
  });

  test('serialize stamps version 2', () => {
    expect(SCHEMA_VERSION).toBe(2);
    const out = JSON.parse(serialize({ streak: 0 }));
    expect(out.version).toBe(2);
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
});
