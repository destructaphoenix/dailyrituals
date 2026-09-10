// src/billing/simService.js — the design simulation, now behind the service
// interface. Preserves the original reviewable timing (1500ms buy / 1300ms
// restore) so the pending overlay is still visible. `delayMs` is injectable so
// tests can run with 0.
import { RENEW_DATE, EMBER_PACKS } from '../data';

const FALLBACK_RENEW_ISO = '2026-06-12T00:00:00.000Z'; // matches RENEW_DATE
let emberTxSeq = 0;

function ent(plan) {
  // IMP-083: the sim carries a productId too, so Expo Go and the dev panel walk
  // the real manage/cancel path rather than a stub that cannot fail.
  return {
    active: true, willRenew: true, plan,
    productId: plan === 'annual' ? 'plus_annual' : 'plus_monthly',
    renewISO: FALLBACK_RENEW_ISO, priceString: null,
  };
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// sim = { purchase, restore }; alreadyPlus reflects current member state.
export function createSimService(sim, alreadyPlus, buyDelay = 1500, restoreDelay = 1300) {
  return {
    async buy(plan) {
      await wait(buyDelay);
      const o = (sim && sim.purchase) || 'success';
      if (o === 'success' || o === 'owned') return { kind: o, entitlement: ent(plan) };
      return { kind: o }; // cancel | failed | network — no entitlement
    },
    async restore() {
      await wait(restoreDelay);
      const found = alreadyPlus || (sim && sim.restore) === 'found';
      return found ? { kind: 'restored', entitlement: ent('annual') } : { kind: 'restore-empty' };
    },
    async getEntitlement() {
      return alreadyPlus ? ent('annual') : null;
    },
    async getPrices() {
      return {}; // sim uses the PLUS_PRICES constants in the UI
    },
    // IMP-113 — mirrors revenueCatService's shape so the suite (which only
    // ever runs simService) exercises the real interface.
    async getEmberProducts() {
      return EMBER_PACKS.map((p) => ({ identifier: p.productId, priceString: p.price }));
    },
    async buyEmberPack(product) {
      await wait(buyDelay);
      const o = (sim && sim.purchase) || 'success';
      if (o !== 'success' && o !== 'owned') return { kind: o };
      emberTxSeq += 1;
      return {
        kind: o,
        customerInfo: {
          nonSubscriptionTransactions: [{
            transactionIdentifier: 'sim-' + product.identifier + '-' + emberTxSeq,
            productIdentifier: product.identifier,
            purchaseDate: new Date().toISOString(),
          }],
        },
      };
    },
    renewLabel: RENEW_DATE, // convenience for callers that want the constant
  };
}
