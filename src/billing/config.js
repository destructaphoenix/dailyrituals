// src/billing/config.js — single source for billing constants. RevenueCat keys
// come from env via app.config.js → expo-constants. When keys are absent (Expo
// Go / no .env), the app falls back to the simulation so every screen stays
// reviewable. RevenueCat SDK keys are publishable (client-safe) but we still
// source them from env to keep them out of source.

import Constants from 'expo-constants';

const extra = (Constants.expoConfig && Constants.expoConfig.extra) || {};

// The RevenueCat "entitlement" that grants Plus. Create this in the RevenueCat
// dashboard and keep this string in sync with it.
export const ENTITLEMENT_ID = 'plus';

// Publishable RevenueCat API keys, per platform.
export const RC_KEYS = {
  ios: extra.rcIosKey || '',
  android: extra.rcAndroidKey || '',
};

// The Android application id, read from app.config.js rather than hardcoded so
// it cannot drift from what Play actually knows. '' when absent (iOS, or a
// context with no expoConfig such as jest) — IMP-083's manageUrl treats that as
// "no deep link possible" and degrades to the generic subscriptions URL.
export const PACKAGE_NAME = (Constants.expoConfig && Constants.expoConfig.android
  && Constants.expoConfig.android.package) || '';

// Real legal + store URLs. Replace the placeholders before any store submission.
export const LINKS = {
  terms: extra.termsUrl || 'https://dailyrituals.app/terms',
  privacy: extra.privacyUrl || 'https://dailyrituals.app/privacy',
  // OS-managed subscription settings. These are the GENERIC destinations — the
  // account-wide list. IMP-083: prefer links.js's manageUrl(), which deep-links
  // straight to this app's subscription when the product id is known and falls
  // back to these only when it is not.
  manageIos: 'https://apps.apple.com/account/subscriptions',
  manageAndroid: 'https://play.google.com/store/account/subscriptions',
};

// True only when a key exists for this platform AND the native module loads.
// `index.js` combines this with a runtime module check.
export function hasKeyFor(platform) {
  return Boolean(platform === 'android' ? RC_KEYS.android : RC_KEYS.ios);
}

// Master switch for the paid Plus surface. FALSE = free release (v1): every
// paywall/upgrade/manage entry point is hidden, no purchases are possible.
//
// TRUE since 2026-09-05 (Phase 10b): Play subscription products are live and
// attached to the RevenueCat "current" offering, and RC_ANDROID_KEY now exists
// as an EAS project env var + a GitHub repo secret. Without that last one a
// cloud build resolves the key to '' and silently ships simService — a paywall
// that fakes a successful purchase and grants Plus for free. That combination
// is guarded by scripts/check-billing-config.js, but ONLY from
// .github/workflows/release.yml: a local "eas build" skips the preflight
// entirely, so run the script by hand before any off-CI build.
export const PLUS_ENABLED = true;

// Cash ember top-ups are a SEPARATE surface from Plus and must NOT ride its
// flag. EMBER_PACKS in src/data.js carry real price strings ($1.99 / $4.99 /
// $9.99), but every buy handler behind them is a bare counter increment — no
// purchaseService, no RevenueCat, no IAP of any kind. They were gated on
// PLUS_ENABLED on the assumption that consumables would be wired by the time
// Plus went live. They were not, so on 2026-09-05 the two were decoupled:
// flipping PLUS_ENABLED must not put a priced surface on screen that gives its
// goods away. While this is false the Shop's "Gather Embers" section and the
// GetEmbers sheet stay hidden, and embers stay free-only — one per day kept,
// which is exactly what ships today. Flip it only once the packs are attached
// to real Play consumable products.
export const EMBER_PACKS_ENABLED = false;
