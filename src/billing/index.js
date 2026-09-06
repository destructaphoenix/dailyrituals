import { createSimService } from './simService';
import { hasKeyFor } from './config';

let _rcModuleOk = false;
try {
  require.resolve('react-native-purchases');
  _rcModuleOk = true;
} catch (e) {
  _rcModuleOk = false;
}

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
