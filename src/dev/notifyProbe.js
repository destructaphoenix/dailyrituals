// src/dev/notifyProbe.js
// DEV-ONLY. Native probe backing the harness's Notifications section. Lazy-
// `require()`d inside try/catch, exactly like src/reminders/io.js — Expo Go on
// Android has shipped without notification support since SDK 53, and a static
// import here would reintroduce that crash. Zero business logic: scheduling
// decisions stay in src/reminders/schedule.js; this only talks to the OS.
import { NATIVE_UNAVAILABLE } from '../reminders/io';

export { NATIVE_UNAVAILABLE };

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

export function available() {
  return !!load();
}

// 'granted' | 'denied' | 'undetermined' | NATIVE_UNAVAILABLE
export async function getPermission() {
  const N = load();
  if (!N) return NATIVE_UNAVAILABLE;
  const { status } = await N.getPermissionsAsync();
  return status;
}

// May show the OS prompt — only call from a user tap.
export async function requestPermission() {
  const N = load();
  if (!N) return NATIVE_UNAVAILABLE;
  const { status } = await N.requestPermissionsAsync();
  return status;
}

export async function listScheduled() {
  const N = load();
  if (!N) return [];
  return N.getAllScheduledNotificationsAsync();
}

export async function fireTestIn(seconds, { title, body } = {}) {
  const N = load();
  if (!N) return null;
  return N.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: N.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, repeats: false },
  });
}

export async function cancelAll() {
  const N = load();
  if (!N) return;
  await N.cancelAllScheduledNotificationsAsync();
}
