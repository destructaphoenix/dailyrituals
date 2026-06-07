export const SCHEMA_VERSION = 2;

const migrators = {
  1: (data) => ({ ...data, entries: [], streak: 0, xp: 0, embers: 0, freezes: 0 }),
};

export const PERSISTED_KEYS = [
  'entries', 'streak', 'xp', 'done', 'quests', 'freezes', 'embers',
  'plus', 'activePalette', 'ownedPalettes', 'activeSky', 'ownedSkies',
  'subCanceled', 'activePlan', 'lastActiveDay', 'settings',
];

export function pickPersisted(state) {
  const out = {};
  for (const k of PERSISTED_KEYS) if (state[k] !== undefined) out[k] = state[k];
  return out;
}

export function serialize(slice) {
  return JSON.stringify({ version: SCHEMA_VERSION, ...slice });
}

export function deserialize(raw) {
  if (!raw) return null;
  let parsed;
  try { parsed = JSON.parse(raw); } catch (e) { return null; }
  if (!parsed || typeof parsed !== 'object') return null;
  const migrated = migrate(parsed);
  if (!migrated) return null;
  const { version, ...rest } = migrated;
  return rest;
}

function migrate(parsed) {
  let v = parsed.version || 0;
  let data = parsed;
  if (v > SCHEMA_VERSION) return null;
  while (v < SCHEMA_VERSION) {
    if (migrators[v]) data = migrators[v](data);
    v += 1;
  }
  return { ...data, version: SCHEMA_VERSION };
}

export function mergeWithDefaults(loaded, defaults) {
  return { ...defaults, ...(loaded || {}) };
}
