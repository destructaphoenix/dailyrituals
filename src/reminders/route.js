// route.js — what a reminder notification means, once it exists. Zero native
// imports, pure decisions only (mirrors schedule.js's stated architecture).

// True only for a notification this app scheduled itself — checked before
// acting on any notification event, so a foreign notification (OS, another
// app's deep link, anything) is never mistaken for the daily reminder.
export function isOurReminder(notification) {
  return notification?.request?.content?.data?.kind === 'daily-reminder';
}

// 'nudge'  — foreground, unwritten: show the in-app Toast (a system banner
//            would need shouldPlaySound, which suppresses the banner on Android).
// 'write'  — background tap, unwritten: open WriteFlow.
// 'none'   — already written, either path: the day is done, don't nag or force
//            the editor open — IMP-018 already makes today re-editable from Home.
export function reminderAction({ wroteToday, foreground }) {
  if (wroteToday) return 'none';
  return foreground ? 'nudge' : 'write';
}
