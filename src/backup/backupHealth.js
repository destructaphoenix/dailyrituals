// backupHealth.js — pure status for the You tab's backup warning (IMP-043).
// Complements lastBackupLabel.js's copy: this is the gate, that's the words.
const DAY_MS = 86400000;
const STALE_AFTER_DAYS = 30;

export function backupHealth(lastBackupAt, now = new Date()) {
  if (!lastBackupAt) return 'never';
  const days = Math.floor((now.getTime() - new Date(lastBackupAt).getTime()) / DAY_MS);
  return days > STALE_AFTER_DAYS ? 'stale' : 'ok';
}
