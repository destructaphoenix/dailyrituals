// src/billing/diagnostic.js — IMP-087. The gate stops failing silently.
//
// Three times the paid surface has vanished with nothing on screen to say why,
// and each one cost a round trip to the owner's device to identify:
//   vc14  — no key reached the build, so simService faked purchases (IMP-084)
//   vc15  — require.resolve is not a Metro API, so the probe always said no (IMP-085)
//   OTA   — `eas update` without --environment published an empty key (IMP-086)
// All three render identically: an empty You tab. PAYWALL_LIVE is one boolean,
// but the facts behind it are not, and this names which one is false.
//
// Deliberately says nothing when the surface is working, when Plus is off, or in
// dev — a diagnostic that shows up in a healthy build is just noise.

export const BILLING_DIAGNOSTIC = {
  none: 'The store library and its key are both missing from this build.',
  module: 'The store library did not load in this build.',
  key: 'This build shipped without its store key.',
};

export function billingDiagnostic({ plusEnabled, moduleOk, keyPresent, dev }) {
  if (!plusEnabled) return null;              // free release — nothing is missing
  if (dev) return null;                       // the simulation is legitimate in Expo Go
  if (moduleOk && keyPresent) return null;    // live — there is nothing to report
  const code = !moduleOk && !keyPresent ? 'none' : !moduleOk ? 'module' : 'key';
  return { code, reason: BILLING_DIAGNOSTIC[code] };
}

// Which JS is actually running. A release build carries no version string
// (IMP-022, deferred), so "the fix didn't work" has never been distinguishable
// from "the OTA never applied" without a cable — and the OTA applies on the
// SECOND launch, which makes the difference easy to mistake. expo-updates has
// always known; nothing asked it. Takes the module so it stays pure and testable.
export function describeUpdate(Updates) {
  if (!Updates) return 'unknown build';
  const id = Updates.updateId ? String(Updates.updateId).replace(/-/g, '').slice(0, 8) : null;
  if (Updates.isEmbeddedLaunch || !id) return 'built-in bundle (no update applied)';
  const at = Updates.createdAt ? new Date(Updates.createdAt) : null;
  const when = at && !isNaN(at.getTime()) ? at.toISOString().slice(0, 16).replace('T', ' ') + ' UTC' : null;
  return when ? `update ${id} · ${when}` : `update ${id}`;
}
