import { DEFAULT_SETTINGS } from '../theme';

const HEX = /^#?([\da-f]{2}){3}$/i;

function shapeOf(v) {
  if (Array.isArray(v)) return 'array';
  if (v === null) return 'null';
  return typeof v;
}

function isValidAccent(v) {
  return Array.isArray(v) && v.length === 3 && v.every((s) => typeof s === 'string' && HEX.test(s));
}

function sanitizeReminder(value, defaultValue) {
  if (shapeOf(value) !== 'object') return { ...defaultValue };
  const out = {};
  for (const key of Object.keys(value)) {
    out[key] = shapeOf(value[key]) === shapeOf(defaultValue[key]) ? value[key] : defaultValue[key];
  }
  return out;
}

// The single validation boundary for the *shape* of untrusted settings —
// readBackup only checks the envelope. A key whose type doesn't match its
// default is replaced by that default instead of poisoning makeTheme.
export function sanitizeSettings(loaded, defaults = DEFAULT_SETTINGS) {
  if (!loaded || typeof loaded !== 'object' || Array.isArray(loaded)) return {};

  const out = {};
  for (const key of Object.keys(loaded)) {
    const value = loaded[key];
    if (!(key in defaults)) {
      out[key] = value; // unknown key from a newer build — forward-compat
      continue;
    }
    if (key === 'accent') {
      out[key] = isValidAccent(value) ? value : defaults.accent;
      continue;
    }
    if (key === 'reminder') {
      out[key] = sanitizeReminder(value, defaults.reminder);
      continue;
    }
    if (key === 'recapSeen') {
      // Default is null, but a real dismissal stores a year (number) —
      // shape-vs-default alone would reset every dismissal back to null.
      out[key] = value === null || typeof value === 'number' ? value : defaults.recapSeen;
      continue;
    }
    out[key] = shapeOf(value) === shapeOf(defaults[key]) ? value : defaults[key];
  }
  return out;
}
