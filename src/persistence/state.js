export const SCHEMA_VERSION = 3;

// v2→v3 (IMP-037): mood: string -> moods: string[]. Idempotent — an entry
// that already carries `moods` is left exactly as-is, so re-running this on
// an already-migrated payload (e.g. a v1 payload passing through) is safe.
function migrateMoods(entry) {
  if (!entry || 'moods' in entry) return entry;
  const { mood, ...rest } = entry;
  return { ...rest, moods: mood ? [mood] : [] };
}

const migrators = {
  1: (data) => ({ ...data, entries: [], xp: 0, embers: 0, freezes: 0 }),
  2: (data) => ({ ...data, entries: (data.entries || []).map(migrateMoods) }),
};

export const PERSISTED_KEYS = [
  'onboarded', 'mode',
  'entries', 'xp', 'done', 'quests', 'freezes', 'frozenDays', 'embers',
  'plus', 'activePalette', 'ownedPalettes', 'activeSky', 'ownedSkies',
  'subCanceled', 'activePlan', 'lastActiveDay', 'settings', 'lastBackupAt',
  'promptDeck', 'seenTips', 'trash', 'freeRestoresUsed',
];

export function pickPersisted(state) {
  const out = {};
  for (const k of PERSISTED_KEYS) if (state[k] !== undefined) out[k] = state[k];
  return out;
}

export function serialize(slice, now = Date.now()) {
  // lastSavedAt always re-stamps to `now`, overriding any stale value already
  // in `slice` — this is what lets restoreDetect.js infer a restore (see
  // IMP-029) purely from firstInstallTime vs this stamp, with no extra flag.
  return JSON.stringify({ version: SCHEMA_VERSION, ...slice, lastSavedAt: now });
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
