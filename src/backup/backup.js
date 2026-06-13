// backup.js — pure backup envelope build + parse. No native calls. The envelope
// wraps the exact serialize() payload (so deserialize's validation + forward-
// migration carry over), plus metadata for the import preview. This file is the
// single validation boundary for untrusted backup files.

import { serialize, deserialize, pickPersisted, SCHEMA_VERSION } from '../persistence/state';

export const BACKUP_FORMAT = 'daily-rituals-backup';

function countDays(entries = []) {
  return new Set(entries.map((e) => e.dayKey)).size;
}

// Build a self-describing backup envelope from a state slice.
// meta = { appVersion, now }.
export function createBackup(state, { appVersion = 'unknown', now = new Date() } = {}) {
  const slice = pickPersisted(state);
  const entries = slice.entries || [];
  return {
    format: BACKUP_FORMAT,
    appVersion,
    exportedAt: now.toISOString(),
    counts: { entries: entries.length, days: countDays(entries) },
    payload: serialize(slice),
  };
}

// Parse + validate a backup file's text. Returns
//   { ok: true, meta: { appVersion, exportedAt, counts }, state }
//   { ok: false, reason: 'not-json' | 'not-backup' | 'too-new' | 'unreadable' }
export function readBackup(rawText) {
  let env;
  try { env = JSON.parse(rawText); }
  catch (e) { return { ok: false, reason: 'not-json' }; }

  if (!env || typeof env !== 'object' || env.format !== BACKUP_FORMAT || typeof env.payload !== 'string') {
    return { ok: false, reason: 'not-backup' };
  }

  // Peek at the payload's schema version to give a precise "too new" message.
  let payloadObj;
  try { payloadObj = JSON.parse(env.payload); }
  catch (e) { return { ok: false, reason: 'unreadable' }; }
  if (payloadObj && typeof payloadObj.version === 'number' && payloadObj.version > SCHEMA_VERSION) {
    return { ok: false, reason: 'too-new' };
  }

  const state = deserialize(env.payload); // validates + migrates forward; null if unusable
  if (!state) return { ok: false, reason: 'unreadable' };

  return {
    ok: true,
    meta: { appVersion: env.appVersion, exportedAt: env.exportedAt, counts: env.counts },
    state,
  };
}

export function backupFilename(now = new Date()) {
  return `daily-rituals-${now.toISOString().slice(0, 10)}.json`;
}
