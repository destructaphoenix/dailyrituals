// __tests__/billing/revenueCatService.test.js — IMP-083.
// The real SDK is never loaded here: react-native-purchases pulls in an
// untransformable ESM dependency, which is why this module had no test until
// now. `toEntitlement` is pure over a CustomerInfo shape, so a bare stub is
// enough — and the field this guards is exactly what a refactor would drop.
jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    getOfferings: jest.fn(),
    getCustomerInfo: jest.fn(),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
  },
}));

import Purchases from 'react-native-purchases';
import {
  toEntitlement, trialDaysFromProduct, createRevenueCatService,
} from '../../src/billing/revenueCatService';

beforeEach(() => { jest.clearAllMocks(); });

const customerInfo = (ent) => ({ entitlements: { active: { plus: ent } } });

describe('toEntitlement — IMP-083', () => {
  test('keeps the raw RevenueCat product identifier, suffix and all', () => {
    const e = toEntitlement(customerInfo({
      productIdentifier: 'plus_annual:annual', expirationDate: '2027-03-03T00:00:00.000Z',
    }));
    // Raw: manageUrl owns the `product:basePlan` strip, not this mapper.
    expect(e.productId).toBe('plus_annual:annual');
    expect(e.plan).toBe('annual'); // unchanged by IMP-083
  });

  test('null-safe when the store omits the identifier', () => {
    expect(toEntitlement(customerInfo({ expirationDate: null })).productId).toBeNull();
  });

  test('no active entitlement is still null overall', () => {
    expect(toEntitlement({ entitlements: { active: {} } })).toBeNull();
    expect(toEntitlement(null)).toBeNull();
  });
});

// ── IMP-090 — the offer's free phase ─────────────────────────────────────────
// WALK-19 step 3, 2026-09-06: the CTA promised a 7-day trial and Play's sheet
// said charging today. getPrices() had never read anything that could disagree.
// The shape here has moved across SDK majors, and this is the one place a
// rename would throw on a device and nowhere else — so every miss is null.
describe('trialDaysFromProduct — IMP-090', () => {
  const withDefaultOption = (iso) => ({
    defaultOption: { freePhase: { billingPeriod: { iso8601: iso } } },
  });

  test('reads the free phase off defaultOption', () => {
    expect(trialDaysFromProduct(withDefaultOption('P7D'))).toBe(7);
    expect(trialDaysFromProduct(withDefaultOption('P1W'))).toBe(7);
    expect(trialDaysFromProduct(withDefaultOption('P3D'))).toBe(3);
    expect(trialDaysFromProduct(withDefaultOption('P1M'))).toBe(30);
  });

  test('accepts a bare ISO string where the SDK gives one', () => {
    expect(trialDaysFromProduct({ defaultOption: { freePhase: { billingPeriod: 'P7D' } } })).toBe(7);
  });

  test('falls back to a zero-priced phase in subscriptionOptions', () => {
    const product = {
      subscriptionOptions: [{
        pricingPhases: [
          { price: { amountMicros: 0 }, billingPeriod: { iso8601: 'P14D' } },
          { price: { amountMicros: 2499000000 }, billingPeriod: { iso8601: 'P1Y' } },
        ],
      }],
    };
    expect(trialDaysFromProduct(product)).toBe(14);
  });

  test('reads the legacy / iOS introductory shape', () => {
    expect(trialDaysFromProduct({
      introPrice: { price: 0, periodUnit: 'DAY', periodNumberOfUnits: 7 },
    })).toBe(7);
  });

  test('a paid introductory offer is not a free trial', () => {
    expect(trialDaysFromProduct({
      introPrice: { price: 0.99, periodUnit: 'MONTH', periodNumberOfUnits: 3 },
    })).toBeNull();
  });

  test('an offer with no free phase is null', () => {
    expect(trialDaysFromProduct({ priceString: '₹2,499.00', price: 2499 })).toBeNull();
    expect(trialDaysFromProduct({})).toBeNull();
    expect(trialDaysFromProduct(null)).toBeNull();
  });

  test('a renamed or malformed field yields null instead of throwing', () => {
    expect(trialDaysFromProduct({ defaultOption: { freePhase: {} } })).toBeNull();
    expect(trialDaysFromProduct({ defaultOption: { freePhase: { billingPeriod: 'seven days' } } })).toBeNull();
    expect(trialDaysFromProduct({ subscriptionOptions: 'not an array' })).toBeNull();
    expect(trialDaysFromProduct({ get defaultOption() { throw new Error('SDK moved'); } })).toBeNull();
  });

  test('a zero-length free phase is not a trial', () => {
    expect(trialDaysFromProduct(withDefaultOption('P0D'))).toBeNull();
  });
});

describe('getPrices carries the trial — IMP-090', () => {
  const pkg = (priceString, price, iso) => ({
    product: {
      priceString,
      price,
      ...(iso ? { defaultOption: { freePhase: { billingPeriod: { iso8601: iso } } } } : {}),
    },
  });

  test('trialDays rides alongside the price it belongs to', async () => {
    Purchases.getOfferings.mockResolvedValue({
      current: { annual: pkg('₹2,499.00', 2499, 'P7D'), monthly: pkg('₹399.00', 399, 'P7D') },
    });
    const out = await createRevenueCatService().getPrices();
    expect(out.annual).toEqual({ priceString: '₹2,499.00', price: 2499, trialDays: 7 });
    expect(out.monthly).toEqual({ priceString: '₹399.00', price: 399, trialDays: 7 });
  });

  test('no free phase in the offering means null, never a guess', async () => {
    Purchases.getOfferings.mockResolvedValue({
      current: { annual: pkg('₹2,499.00', 2499, null) },
    });
    const out = await createRevenueCatService().getPrices();
    expect(out.annual.trialDays).toBeNull();
  });

  test('the existing catch still returns {} rather than throwing at the paywall', async () => {
    Purchases.getOfferings.mockRejectedValue(new Error('offline'));
    expect(await createRevenueCatService().getPrices()).toEqual({});
  });
});

// ── IMP-092 — "Nothing to restore" is also what a failed check says ──────────
// WALK-19, 2026-09-06. Every error this did not recognise became `restore-empty`
// — the one kind that makes a positive claim about the user's account. The
// person most likely to tap Restore is a real subscriber on a new phone, and
// "We couldn't find a subscription on this account" points them at support.
describe('restore does not relabel a failed check — IMP-092', () => {
  const svc = () => createRevenueCatService();
  const info = (ent) => ({ entitlements: { active: ent ? { plus: ent } : {} } });

  test('an unrecognised error is `failed` — we could not check', async () => {
    Purchases.restorePurchases.mockRejectedValue({ code: 'STORE_PROBLEM_ERROR' });
    expect(await svc().restore()).toEqual({ kind: 'failed' });
  });

  test('an error with no code at all is still `failed`', async () => {
    Purchases.restorePurchases.mockRejectedValue(new Error('boom'));
    expect(await svc().restore()).toEqual({ kind: 'failed' });
  });

  test('only a SUCCESSFUL call that finds nothing says restore-empty', async () => {
    Purchases.restorePurchases.mockResolvedValue(info(null));
    expect(await svc().restore()).toEqual({ kind: 'restore-empty' });
  });

  test('the network and owned branches are unchanged', async () => {
    Purchases.restorePurchases.mockRejectedValue({ code: 'NETWORK_ERROR' });
    expect((await svc().restore()).kind).toBe('network');
    Purchases.restorePurchases.mockRejectedValue({ code: 'PRODUCT_ALREADY_PURCHASED_ERROR' });
    expect((await svc().restore()).kind).toBe('restored');
  });

  test('a real entitlement still restores', async () => {
    Purchases.restorePurchases.mockResolvedValue(info({
      productIdentifier: 'plus_annual:annual', expirationDate: '2027-03-03T00:00:00.000Z',
    }));
    const res = await svc().restore();
    expect(res.kind).toBe('restored');
    expect(res.entitlement.plan).toBe('annual');
  });

  test('a cancelled restore is not reported as an empty account either', async () => {
    Purchases.restorePurchases.mockRejectedValue({ userCancelled: true });
    expect((await svc().restore()).kind).not.toBe('restore-empty');
  });
});
