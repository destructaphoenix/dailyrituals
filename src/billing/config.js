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

// Real legal + store URLs. Replace the placeholders before any store submission.
export const LINKS = {
  terms: extra.termsUrl || 'https://dailyrituals.app/terms',
  privacy: extra.privacyUrl || 'https://dailyrituals.app/privacy',
  // OS-managed subscription settings (used by Cancel / manage deep-links).
  manageIos: 'https://apps.apple.com/account/subscriptions',
  manageAndroid: 'https://play.google.com/store/account/subscriptions',
};

// True only when a key exists for this platform AND the native module loads.
// `index.js` combines this with a runtime module check.
export function hasKeyFor(platform) {
  return Boolean(platform === 'android' ? RC_KEYS.android : RC_KEYS.ios);
}
