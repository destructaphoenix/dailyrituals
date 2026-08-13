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

// `identifier` comes from schedule.js's reminderId — passing it makes the call
// idempotent (scheduling the same id twice replaces, never duplicates). Omitting
// it lets expo mint a uuid, which is how the same instant used to end up with
// two pending notifications.
export async function scheduleAt(date, { title, body, data }, identifier) {
  const N = load();
  if (!N) return null;
  return N.scheduleNotificationAsync({
    identifier,
    content: { title, body, data },
    trigger: { type: N.SchedulableTriggerInputTypes.DATE, date },
  });
}

// Suppresses the OS banner in the foreground so the app can show its own Toast
// instead. Android: shouldPlaySound: false also drops the banner no matter what
// the priority is — that side effect is *why* this works, not a bug to "fix".
export function setForegroundBehavior() {
  const N = load();
  if (!N) return;
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export function onNotificationReceived(cb) {
  const N = load();
  if (!N) return { remove() {} };
  return N.addNotificationReceivedListener(cb);
}

// Catches taps while the app is running (the listener) and the cold start
// where the tap launched the app before the listener could register (the
// getLastNotificationResponseAsync check) — both are required, neither alone
// covers both cases.
export function onNotificationTapped(cb) {
  const N = load();
  if (!N) return { remove() {} };
  const sub = N.addNotificationResponseReceivedListener(cb);
  N.getLastNotificationResponseAsync().then((response) => {
    if (response) cb(response);
  });
  return sub;
}
