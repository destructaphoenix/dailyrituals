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

export function createPurchaseService({ sim, alreadyPlus, platform }) {
  if (isBillingConfigured(platform)) {
    const { createRevenueCatService } = require('./revenueCatService');
    return createRevenueCatService();
  }
  return createSimService(sim, alreadyPlus);
}
