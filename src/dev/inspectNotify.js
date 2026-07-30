// src/dev/inspectNotify.js
// Pure. Diffs *intent* (what schedule.js's nextOccurrences says should be
// pending) against *reality* (what expo-notifications' getAllScheduledNotificationsAsync
// actually returned). Expo's returned trigger shape differs by platform/SDK,
// so normalising defensively is the point — an "unreadable trigger" fallback
// row beats a crash.
import { SENTINEL } from './sentinel';

export const DEV_ID = `${SENTINEL}/inspectNotify`;

function extractWhen(trigger, now) {
  if (!trigger) return null;
  if (typeof trigger.timestamp === 'number') return new Date(trigger.timestamp);
  if (typeof trigger.value === 'number') return new Date(trigger.value);
  if (trigger.date != null) {
    const d = trigger.date instanceof Date ? trigger.date : new Date(trigger.date);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  // Time-interval triggers (e.g. "fire test in N seconds") report the
  // configured interval, not an absolute time — best-effort against `now`.
  if (typeof trigger.seconds === 'number') return new Date(now.getTime() + trigger.seconds * 1000);
  return null;
}

function formatInLabel(when, now) {
  const diffMs = when.getTime() - now.getTime();
  if (diffMs <= 0) return 'overdue';
  const sec = Math.round(diffMs / 1000);
  if (sec < 60) return `in ${sec}s`;
  const min = Math.round(sec / 60);
  if (min < 60) return `in ${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `in ${hr}h`;
  const day = Math.round(hr / 24);
  return `in ${day}d`;
}

// Normalises expo's scheduled-notification list into sorted, human rows.
export function describePending(scheduled, now = new Date()) {
  const rows = (scheduled || []).map((n) => {
    const title = (n.content && n.content.title) || '(untitled)';
    const when = extractWhen(n.trigger, now);
    if (!when) return { when: null, inLabel: 'unreadable trigger', title };
    return { when, inLabel: formatInLabel(when, now), title };
  });
  return rows.sort((a, b) => {
    if (!a.when && !b.when) return 0;
    if (!a.when) return 1;
    if (!b.when) return -1;
    return a.when.getTime() - b.when.getTime();
  });
}

// `intended`: Date[] from nextOccurrences. `pending`: rows from describePending.
// Answers: did the OS actually take what we asked for?
export function diffIntendedVsPending(intended, pending, toleranceMs = 60000) {
  const candidates = (pending || []).filter((p) => p.when);
  const used = new Set();
  const matched = [];
  const missing = [];

  for (const t of intended || []) {
    const tMs = t.getTime();
    const idx = candidates.findIndex((p, i) => !used.has(i) && Math.abs(p.when.getTime() - tMs) <= toleranceMs);
    if (idx === -1) {
      missing.push(t);
    } else {
      used.add(idx);
      matched.push(t);
    }
  }

  const extra = candidates.filter((_, i) => !used.has(i));
  return { matched, missing, extra };
}
