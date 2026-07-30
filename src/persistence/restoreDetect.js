// restoreDetect.js — pure detection for IMP-029. A restore is inferred, never
// flagged natively: firstInstallTime newer than the data's lastSavedAt stamp
// means the data outlived an install, which only happens via a device
// restore (Auto Backup or a manual JSON import). Pure so it's unit-testable
// without touching expo-application.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function isFiniteNumber(n) {
  return typeof n === 'number' && Number.isFinite(n);
}

export function isRestoredInstall({ lastSavedAt, installedAt } = {}) {
  if (!isFiniteNumber(lastSavedAt) || !isFiniteNumber(installedAt)) return false;
  return installedAt > lastSavedAt;
}

export function formatBackupDate(ms) {
  const d = new Date(ms);
  if (isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
