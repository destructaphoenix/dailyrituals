import Purchases from 'react-native-purchases';
import { ENTITLEMENT_ID } from './config';
import { formatRenewDate, planFromProductId } from './format';
import { mapPurchaseError } from './mapError';

function toEntitlement(customerInfo) {
  const ent = customerInfo && customerInfo.entitlements
    && customerInfo.entitlements.active && customerInfo.entitlements.active[ENTITLEMENT_ID];
  if (!ent) return null;
  return {
    active: true,
    willRenew: ent.willRenew !== false,
    plan: planFromProductId(ent.productIdentifier),
    renewISO: ent.expirationDate || null,
    priceString: null,
  };
}

async function findPackage(plan) {
  const offerings = await Purchases.getOfferings();
  const current = offerings && offerings.current;
  if (!current) return null;
  if (plan === 'annual') return current.annual || current.availablePackages.find((p) => /annual|year/i.test(p.identifier));
  return current.monthly || current.availablePackages.find((p) => /month/i.test(p.identifier));
}

export function createRevenueCatService() {
  return {
    async buy(plan) {
      try {
        const pkg = await findPackage(plan);
        if (!pkg) return { kind: 'failed' };
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        const entitlement = toEntitlement(customerInfo);
        return entitlement
          ? { kind: 'success', entitlement }
          : { kind: 'failed' };
      } catch (e) {
        const kind = mapPurchaseError(e);
        if (kind === 'owned') {
          const info = await Purchases.getCustomerInfo().catch(() => null);
          return { kind: 'owned', entitlement: toEntitlement(info) || undefined };
        }
        return { kind };
      }
    },
    async restore() {
      try {
        const customerInfo = await Purchases.restorePurchases();
        const entitlement = toEntitlement(customerInfo);
        return entitlement ? { kind: 'restored', entitlement } : { kind: 'restore-empty' };
      } catch (e) {
        const kind = mapPurchaseError(e);
        return { kind: kind === 'owned' ? 'restored' : kind === 'network' ? 'network' : 'restore-empty' };
      }
    },
    // Deliberately does NOT swallow the error (IMP-043): a failed call must be
    // distinguishable from a successful one that finds no entitlement — see
    // src/billing/entitlementSync.js, which is the only caller that matters.
    async getEntitlement() {
      const info = await Purchases.getCustomerInfo();
      return toEntitlement(info);
    },
    async getPrices() {
      try {
        const offerings = await Purchases.getOfferings();
        const current = offerings && offerings.current;
        if (!current) return {};
        // Both forms matter: priceString is the store's localized display text
        // (never format it ourselves), price is the numeric used to compute the
        // real annual saving. See src/billing/prices.js.
        const out = {};
        if (current.annual) {
          out.annual = {
            priceString: current.annual.product.priceString,
            price: current.annual.product.price,
          };
        }
        if (current.monthly) {
          out.monthly = {
            priceString: current.monthly.product.priceString,
            price: current.monthly.product.price,
          };
        }
        return out;
      } catch (e) {
        return {};
      }
    },
  };
}

export { formatRenewDate };
