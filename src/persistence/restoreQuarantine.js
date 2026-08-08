// restoreQuarantine.js — pure logic for IMP-033: quarantine what Android Auto
// Backup forces on us at install time, run a genuine first install, then offer
// the backup once onboarding is done. See docs/build-log.md → IMP-033 for the
// full design; this file holds only the decisions that must be unit-testable
// without touching AsyncStorage or expo-application.
import { isRestoredInstall } from './restoreDetect';

function isFiniteNumber(n) {
  return typeof n === 'number' && Number.isFinite(n);
}

// A restore is quarantined under the exact same condition IMP-029 already
// detects one under — this just names the decision for the new flow.
export function shouldQuarantine({ lastSavedAt, installedAt } = {}) {
  return isRestoredInstall({ lastSavedAt, installedAt });
}

// Fires on stash presence AND onboarding complete — never on session state, so
// a user killed mid-onboarding or who declines and relaunches still gets it.
export function shouldOfferRestore({ hasStash, onboarded } = {}) {
  return !!hasStash && onboarded === true;
}

// Which copy is actually newer: the Google Auto Backup (`lastSavedAt`, a ms
// epoch stamped by serialize()) or the user's own JSON export (`lastBackupAt`,
// an ISO string). Ties and anything unparseable favour 'google' — the only
// copy the app can act on without user input. No coercion: a non-finite
// lastSavedAt or an unparseable lastBackupAt is treated as absent, never as 0.
export function preferredSource({ lastSavedAt, lastBackupAt } = {}) {
  if (!isFiniteNumber(lastSavedAt)) return 'google';
  if (typeof lastBackupAt !== 'string' || !lastBackupAt) return 'google';
  const backupMs = new Date(lastBackupAt).getTime();
  if (!Number.isFinite(backupMs)) return 'google';
  return backupMs > lastSavedAt ? 'file' : 'google';
}

// Orchestrates the verified stash-before-clear sequence with injected IO, so
// the safety guarantee — never clear the live key on an unverified stash — is
// testable without AsyncStorage. Mirrors backup/importFlow.js's shape.
export async function runQuarantine({ readRawState, writePendingRestore, readPendingRestore, clearState }) {
  const raw = await readRawState();
  if (!raw) return false;
  if (!(await writePendingRestore(raw))) return false;
  const readBack = await readPendingRestore();
  if (readBack == null) return false;
  try { JSON.parse(readBack); } catch (e) { return false; }
  await clearState();
  return true;
}

// Human-readable summary of the paid inventory a stash carries, so "Keep this
// fresh start" is an informed choice and the discard confirm can repeat it.
export function pendingRestoreInventory(stash) {
  if (!stash) return '';
  const parts = [];
  if (stash.embers) parts.push(`${stash.embers.toLocaleString()} Ember${stash.embers === 1 ? '' : 's'}`);
  if (stash.ownedPalettes?.length) parts.push(`${stash.ownedPalettes.length} palette${stash.ownedPalettes.length === 1 ? '' : 's'}`);
  if (stash.ownedSkies?.length) parts.push(`${stash.ownedSkies.length} ${stash.ownedSkies.length === 1 ? 'sky' : 'skies'}`);
  if (stash.freezes) parts.push(`${stash.freezes} candle${stash.freezes === 1 ? '' : 's'}`);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}
