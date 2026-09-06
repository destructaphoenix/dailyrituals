import { createSimService } from './simService';
import { hasKeyFor } from './config';

// IMP-085 — ask the module what it IS, not whether a path resolves.
//
// This probe used to be `require.resolve('react-native-purchases')`. Metro does
// not implement it: metro-runtime's require polyfill assigns `resolveWeak` and
// never `resolve`, and metro's collectDependencies rewrites `resolveWeak` and
// `require.context` but not `require.resolve`. So it threw in EVERY bundle, the
// catch below swallowed it, and isBillingConfigured() returned false in every
// build this app ever shipped — every release ran simService. Under jest
// `require` is node's, where require.resolve works, so the suite could not see
// it. A plain static require IS collected by Metro, and the shape of what comes
// back is what proves the native module actually linked.
export function billingModuleOk(mod) {
  return Boolean(mod) && typeof mod.configure === 'function';
}

let _rcModule = null;
try {
  const m = require('react-native-purchases');
  _rcModule = (m && m.default) || m;
} catch (e) {
  _rcModule = null; // Expo Go, web, or no native module linked.
}
const _rcModuleOk = billingModuleOk(_rcModule);

export function isBillingConfigured(platform) {
  return _rcModuleOk && hasKeyFor(platform);
}

// IMP-084 — the gate that decides whether the paid surface is shown at all.
// `plusEnabled` is intent (config.js); `billingConfigured` is capability. A store
// build with intent but no capability falls back to simService, which fakes
// purchases and grants Plus free — that is how vc14 shipped, so the surface
// hides instead. `dev` keeps the simulation reviewable in Expo Go, the only
// place it is legitimate. Pure and parameterised so it is testable without a
// render and without __DEV__.
export function paywallLive({ plusEnabled, billingConfigured, dev }) {
  return Boolean(plusEnabled) && (Boolean(billingConfigured) || Boolean(dev));
}

export function createPurchaseService({ sim, alreadyPlus, platform }) {
  if (isBillingConfigured(platform)) {
    const { createRevenueCatService } = require('./revenueCatService');
    return createRevenueCatService();
  }
  return createSimService(sim, alreadyPlus);
}
