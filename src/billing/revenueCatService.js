import Purchases from 'react-native-purchases';
import { ENTITLEMENT_ID } from './config';
import { formatRenewDate, planFromProductId } from './format';
import { mapPurchaseError } from './mapError';

// Exported for test: IMP-083 depends on `productId` surviving onto the object,
// and a refactor that quietly drops it silently restores the account-wide list.
export function toEntitlement(customerInfo) {
  const active = customerInfo && customerInfo.entitlements && customerInfo.entitlements.active;
  if (!active) return null;
  // IMP-099. The named lookup is the assertion; the sole-entitlement fallback is
  // the safety net under it. This app sells exactly ONE thing, so "is this
  // person a member?" is fully answered by the store reporting an active
  // entitlement at all — reading its name is an optimisation, not the question.
  // Requiring a hand-kept source constant to match a dashboard string is what
  // charged the owner and then told them the purchase failed, and a single
  // active entitlement carries no ambiguity to resolve. Two or more would, so
  // the fallback declines to guess there and the named lookup stands alone.
  const names = Object.keys(active);
  const ent = active[ENTITLEMENT_ID] || (names.length === 1 ? active[names[0]] : null);
  if (!ent) return null;
  return {
    active: true,
    willRenew: ent.willRenew !== false,
    plan: planFromProductId(ent.productIdentifier),
    // IMP-083: kept raw (Play returns `product:basePlan`); manageUrl strips the
    // suffix so Cancel opens THIS subscription, not the account-wide list.
    productId: ent.productIdentifier || null,
    renewISO: ent.expirationDate || null,
    priceString: null,
  };
}

// ── The offer's free phase (IMP-090) ─────────────────────────────────────────
//
// WALK-19 step 3, 2026-09-06: our button read "Start 7-day free trial" while
// Google's own sheet said charging today. The app had never fetched anything
// that could contradict the literal — getPrices() read priceString and price
// and dropped the rest of the package.
//
// What comes back here describes THE OFFER, not this buyer. Play decides trial
// eligibility at purchase time (once per Google account, ever) and Android has
// no equivalent of iOS's eligibility check, so a returning subscriber sees a
// trial in the offer and gets charged. `null` therefore means "we do not know",
// never "there is no trial" — ctaLabel() is what turns that into copy, and it
// refuses to name a trial in either case.

const ISO_UNIT_DAYS = { Y: 365, M: 30, W: 7, D: 1 };
const LEGACY_UNIT_DAYS = { YEAR: 365, MONTH: 30, WEEK: 7, DAY: 1 };

// "P7D" / "P1W" / "P1M" → days. Months and years are nominal (30 / 365): this
// figure is never rendered as a promise, only used to decide whether an offer
// exists at all.
function iso8601Days(iso) {
  if (typeof iso !== 'string') return null;
  const m = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?$/.exec(iso.trim());
  if (!m) return null;
  const days = (Number(m[1] || 0) * ISO_UNIT_DAYS.Y) + (Number(m[2] || 0) * ISO_UNIT_DAYS.M)
    + (Number(m[3] || 0) * ISO_UNIT_DAYS.W) + (Number(m[4] || 0) * ISO_UNIT_DAYS.D);
  return days > 0 ? days : null;
}

// The shape has moved across SDK majors (introPrice → defaultOption →
// subscriptionOptions) and this is the exact place a rename would throw on a
// device and nowhere else, so every hop is guarded.
function freePhaseDays(product) {
  const options = [product.defaultOption]
    .concat(Array.isArray(product.subscriptionOptions) ? product.subscriptionOptions : [])
    .filter(Boolean);
  let phase = null;
  options.forEach((opt) => {
    if (phase) return;
    if (opt.freePhase) { phase = opt.freePhase; return; }
    const phases = Array.isArray(opt.pricingPhases) ? opt.pricingPhases : [];
    phase = phases.find((ph) => ph && ph.price && Number(ph.price.amountMicros) === 0) || null;
  });
  if (phase) {
    const period = phase.billingPeriod;
    return iso8601Days(period && typeof period === 'object' ? period.iso8601 : period);
  }
  // Legacy / iOS shape: a zero-priced introductory period.
  const intro = product.introPrice;
  if (intro && Number(intro.price) === 0) {
    const per = LEGACY_UNIT_DAYS[String(intro.periodUnit || '').toUpperCase()];
    const n = Number(intro.periodNumberOfUnits);
    if (per && Number.isFinite(n) && n > 0) return per * n;
    return iso8601Days(intro.period);
  }
  return null;
}

// Exported for test: this is pure over a product shape, and the SDK itself is
// unloadable in jest (react-native-purchases pulls an untransformable ESM dep).
export function trialDaysFromProduct(product) {
  if (!product) return null;
  try {
    return freePhaseDays(product);
  } catch (e) {
    return null;
  }
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
        // ⚠️ KNOWN LIMIT (IMP-092, recorded on WALK-19): in airplane mode this
        // call RESOLVES rather than rejecting — RevenueCat answers from its own
        // local cache — so `restore-empty` is reachable offline for a genuine
        // subscriber whose cache is cold. That is SDK behaviour, not ours, and
        // the catch below cannot see it. Fixing it needs a reachability signal.
        const customerInfo = await Purchases.restorePurchases();
        const entitlement = toEntitlement(customerInfo);
        return entitlement ? { kind: 'restored', entitlement } : { kind: 'restore-empty' };
      } catch (e) {
        // IMP-092 — WALK-19, 2026-09-06. This used to end `: 'restore-empty'`,
        // so EVERY unrecognised error became the one kind that makes a positive
        // claim about the account: "We couldn't find a subscription on this
        // account." meant both "we checked, you have nothing" and "we could not
        // check". The person most likely to tap Restore is a real subscriber on
        // a new phone. `failed` says we could not check, which is the truth, and
        // is the exact rule getEntitlement() states twenty lines below (IMP-043).
        const kind = mapPurchaseError(e);
        return { kind: kind === 'owned' ? 'restored' : kind === 'network' ? 'network' : 'failed' };
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
        // IMP-090 adds trialDays — the offer's free phase, or null when there
        // is none / the SDK shape moved. See trialDaysFromProduct above for why
        // null is not the same claim as "no trial".
        const out = {};
        if (current.annual) {
          out.annual = {
            priceString: current.annual.product.priceString,
            price: current.annual.product.price,
            trialDays: trialDaysFromProduct(current.annual.product),
          };
        }
        if (current.monthly) {
          out.monthly = {
            priceString: current.monthly.product.priceString,
            price: current.monthly.product.price,
            trialDays: trialDaysFromProduct(current.monthly.product),
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
