import { SCHEMA_VERSION, serialize, deserialize, mergeWithDefaults } from '../../src/persistence/state';

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
