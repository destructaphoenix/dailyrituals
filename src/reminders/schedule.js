// schedule.js — the single tested boundary for reminders (mirrors src/backup/
// and src/insights/): all decisions pure, injectable `now`, zero native imports.
//
// A repeating daily trigger can't be conditional, so it would fire even when
// the user already wrote today — exactly the kind of notification people mute
// an app over. Instead we keep a rolling window of single-shot notifications
// pending and re-derive + re-schedule it on every foreground/save/settings
// change (see RitualsApp). A lapsed user still gets reminded without opening
// the app, because the window is always several days deep.

// Next `count` firing Date objects for a { hour, minute } target, skipping
// today's slot if it has already passed or if the user already wrote today.
export function nextOccurrences(now, { hour, minute }, { wroteToday = false, count = 7 } = {}) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
  const todayIsGone = today.getTime() <= now.getTime() || wroteToday;
  const startOffset = todayIsGone ? 1 : 0;

  const out = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
    d.setDate(d.getDate() + startOffset + i);
    out.push(d);
  }
  return out;
}

// Pure formatter, explicit hour12 — no locale surprises in tests or on device.
export function formatReminderTime({ hour, minute }) {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const period = hour < 12 ? 'AM' : 'PM';
  const mm = String(minute).padStart(2, '0');
  return `${h12}:${mm} ${period}`;
}

// The exact string the You-tab row shows. Three states only: nothing to see
// here ('Off'), a live time, or an honest admission the OS is blocking it.
export function reminderRowValue(reminder, permission) {
  if (!reminder || !reminder.enabled) return 'Off';
  if (permission !== 'granted') return 'Blocked in settings';
  return formatReminderTime(reminder);
}
