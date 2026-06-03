// src/billing/simService.js — the design simulation, now behind the service
// interface. Preserves the original reviewable timing (1500ms buy / 1300ms
// restore) so the pending overlay is still visible. `delayMs` is injectable so
// tests can run with 0.
import { RENEW_DATE } from '../data';

const FALLBACK_RENEW_ISO = '2026-06-12T00:00:00.000Z'; // matches RENEW_DATE

function ent(plan) {
  return { active: true, willRenew: true, plan, renewISO: FALLBACK_RENEW_ISO, priceString: null };
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
    renewLabel: RENEW_DATE, // convenience for callers that want the constant
  };
}
