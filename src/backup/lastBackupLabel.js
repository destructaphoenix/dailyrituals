// lastBackupLabel.js — pure formatter for the "Back up my journal" subtitle.
const DAY_MS = 86400000;

export function lastBackupLabel(iso, now = new Date()) {
  if (!iso) return 'Not backed up yet';
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / DAY_MS);
  if (days <= 0) return 'Backed up today';
  if (days === 1) return 'Backed up yesterday';
  const base = `Backed up ${days} days ago`;
  return days > 30 ? `${base} — back up again soon` : base; // gentle nudge when stale
}
