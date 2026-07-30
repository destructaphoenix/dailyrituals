// io.js — the ONLY file that imports expo-notifications. Lazy-required
// (like src/backup/io.js's native imports, but even lazier — require() is
// called only when a function here runs) so Expo Go on Android, which has
// shipped without notification support since SDK 53, degrades to
// NATIVE_UNAVAILABLE instead of crashing at import time. No business logic
// lives here — it takes Dates + strings from src/reminders/schedule.js and
// hands back status.

export const NATIVE_UNAVAILABLE = 'unavailable';

let cached;
function load() {
  if (cached !== undefined) return cached;
  try {
    cached = require('expo-notifications');
  } catch (e) {
    cached = null;
  }
  return cached;
}

// 'granted' | 'denied' | 'undetermined' | NATIVE_UNAVAILABLE
export async function getPermissionStatus() {
  const N = load();
  if (!N) return NATIVE_UNAVAILABLE;
  const { status } = await N.getPermissionsAsync();
  return status;
}

// Only call this from a user tap (first enable) — it may show the OS prompt.
export async function ensurePermission() {
  const N = load();
  if (!N) return NATIVE_UNAVAILABLE;
  const current = await N.getPermissionsAsync();
  if (current.status === 'granted') return 'granted';
  const requested = await N.requestPermissionsAsync();
  return requested.status;
}

export async function cancelAll() {
  const N = load();
  if (!N) return;
  await N.cancelAllScheduledNotificationsAsync();
}

export async function scheduleAt(date, { title, body }) {
  const N = load();
  if (!N) return null;
  return N.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: N.SchedulableTriggerInputTypes.DATE, date },
  });
}
