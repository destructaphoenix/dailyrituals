// __tests__/billing/prices.test.js — the paywall must never show a price the
// store won't charge. These lock the merge of live RevenueCat offerings over
// the design constants, and the refusal to assert an unverified saving.
import { mergePrices, savePercent, ANNUAL_SUB_LIVE, ctaLabel, mergeEmberPrices } from '../../src/billing/prices';

const FALLBACK = {
  monthly: { id: 'monthly', label: 'Monthly', price: '$4.99', per: 'per month', sub: 'Billed monthly' },
  annual: { id: 'annual', label: 'Annual', price: '$29.99', per: 'per year', sub: '$2.50 / mo · billed yearly', save: 'Save 50%' },
};

describe('savePercent', () => {
  test('computes the annual saving against twelve monthly payments', () => {
    expect(savePercent(4.99, 29.99)).toBe(50); // 29.99 vs 59.88
    expect(savePercent(100, 900)).toBe(25);
  });
  test('returns null when either price is missing or not a number', () => {
    expect(savePercent(undefined, 29.99)).toBeNull();
    expect(savePercent(4.99, undefined)).toBeNull();
    expect(savePercent('abc', 29.99)).toBeNull();
    expect(savePercent(null, null)).toBeNull();
  });
  test('returns null when a price is zero or negative', () => {
    expect(savePercent(0, 29.99)).toBeNull();
    expect(savePercent(4.99, 0)).toBeNull();
    expect(savePercent(-4.99, 29.99)).toBeNull();
  });
  test('returns null when annual is not actually cheaper', () => {
    expect(savePercent(4.99, 59.88)).toBeNull(); // identical
    expect(savePercent(4.99, 99.99)).toBeNull(); // more expensive
  });
});

describe('mergePrices', () => {
  // IMP-090: every entry now carries trialDays on the way out. Null, not
  // absent — the constants have never described an offer, so with no live
  // offering there is nothing for them to assert.
  const noTrial = (entry) => ({ ...entry, trialDays: null });

  test('returns the fallback constants unchanged when no live prices exist', () => {
    const expected = { monthly: noTrial(FALLBACK.monthly), annual: noTrial(FALLBACK.annual) };
    expect(mergePrices(FALLBACK, null)).toEqual(expected);
    expect(mergePrices(FALLBACK, {})).toEqual(expected);
  });

  test('does not mutate the fallback it was given', () => {
    const before = JSON.parse(JSON.stringify(FALLBACK));
    mergePrices(FALLBACK, { annual: { priceString: '₹2,499', price: 2499 }, monthly: { priceString: '₹399', price: 399 } });
    expect(FALLBACK).toEqual(before);
  });

  test('live store prices replace the hardcoded ones', () => {
    const out = mergePrices(FALLBACK, {
      annual: { priceString: '₹2,499.00', price: 2499 },
      monthly: { priceString: '₹399.00', price: 399 },
    });
    expect(out.annual.price).toBe('₹2,499.00');
    expect(out.monthly.price).toBe('₹399.00');
  });

  test('keeps the non-price display fields from the constants', () => {
    const out = mergePrices(FALLBACK, { monthly: { priceString: '₹399.00', price: 399 } });
    expect(out.monthly.label).toBe('Monthly');
    expect(out.monthly.per).toBe('per month');
    expect(out.monthly.sub).toBe('Billed monthly');
  });

  test('a plan with no live price keeps its fallback entry', () => {
    const out = mergePrices(FALLBACK, { monthly: { priceString: '₹399.00', price: 399 } });
    expect(out.annual).toEqual(noTrial(FALLBACK.annual));
  });

  test('drops the hardcoded per-month sub line once the annual price is live', () => {
    const out = mergePrices(FALLBACK, { annual: { priceString: '₹2,499.00', price: 2499 } });
    expect(out.annual.sub).toBe(ANNUAL_SUB_LIVE);
    expect(out.annual.sub).not.toContain('$2.50');
  });

  test('recomputes the savings badge from the real store prices', () => {
    const out = mergePrices(FALLBACK, {
      annual: { priceString: '₹2,499.00', price: 2499 },
      monthly: { priceString: '₹399.00', price: 399 },
    });
    expect(out.annual.save).toBe('Save 48%'); // 2499 vs 4788
  });

  test('removes the savings badge when the real saving cannot be verified', () => {
    // Annual live but no monthly numeric to compare against — asserting the
    // constant "Save 50%" here would be a claim we cannot stand behind.
    const out = mergePrices(FALLBACK, { annual: { priceString: '₹2,499.00', price: 2499 } });
    expect(out.annual.save).toBeUndefined();
  });

  test('removes the savings badge when annual is not cheaper than monthly x12', () => {
    const out = mergePrices(FALLBACK, {
      annual: { priceString: '₹5,000.00', price: 5000 },
      monthly: { priceString: '₹399.00', price: 399 },
    });
    expect(out.annual.save).toBeUndefined();
  });

  test('ignores a live entry that carries no priceString', () => {
    const out = mergePrices(FALLBACK, { annual: { price: 2499 } });
    expect(out.annual).toEqual(noTrial(FALLBACK.annual));
  });
});

// ── IMP-090 — WALK-19 step 3, 2026-09-06 ─────────────────────────────────────
// Our button read "Start 7-day free trial"; Play's own sheet, opened from it on
// the license-tester account, said charging today with the INR amount. The owner
// had subscribed on that Google account before and a Play trial is once per
// account, ever — so Play was right and the button was asserting an offer the
// app had never fetched.
describe('mergePrices carries the trial through — IMP-090', () => {
  test('a live free phase survives onto the plan entry', () => {
    const out = mergePrices(FALLBACK, {
      annual: { priceString: '₹2,499.00', price: 2499, trialDays: 7 },
      monthly: { priceString: '₹399.00', price: 399, trialDays: 7 },
    });
    expect(out.annual.trialDays).toBe(7);
    expect(out.monthly.trialDays).toBe(7);
  });

  test('an offer with no free phase is null, not the constants guessing', () => {
    const out = mergePrices(FALLBACK, { annual: { priceString: '₹2,499.00', price: 2499 } });
    expect(out.annual.trialDays).toBeNull();
  });

  test('a nonsense trialDays is null rather than propagated', () => {
    const out = mergePrices(FALLBACK, {
      monthly: { priceString: '₹399.00', price: 399, trialDays: 'seven' },
    });
    expect(out.monthly.trialDays).toBeNull();
  });

  test('zero free days is not a trial', () => {
    const out = mergePrices(FALLBACK, {
      monthly: { priceString: '₹399.00', price: 399, trialDays: 0 },
    });
    expect(out.monthly.trialDays).toBeNull();
  });

  test('the live annual rebuild does not drop the trial', () => {
    // out.annual is destructured and reassembled to strip the savings badge —
    // easy place for a new field to fall out silently.
    const out = mergePrices(FALLBACK, {
      annual: { priceString: '₹2,499.00', price: 2499, trialDays: 14 },
      monthly: { priceString: '₹399.00', price: 399, trialDays: 14 },
    });
    expect(out.annual.save).toBe('Save 48%');
    expect(out.annual.trialDays).toBe(14);
  });
});

describe('ctaLabel — IMP-090', () => {
  test('no known trial means the button promises nothing', () => {
    expect(ctaLabel({ trialDays: null })).toBe('Subscribe');
    expect(ctaLabel({})).toBe('Subscribe');
    expect(ctaLabel()).toBe('Subscribe');
  });

  test('a live trial changes the label', () => {
    expect(ctaLabel({ trialDays: 7 })).toBe('Try free, then subscribe');
    expect(ctaLabel({ trialDays: 14 })).toBe('Try free, then subscribe');
  });

  // The whole point of the spec: the day count is the part we cannot promise,
  // because Play decides eligibility at purchase time and only tells us then.
  test('it NEVER interpolates the day count into the button', () => {
    [1, 3, 7, 14, 30].forEach((d) => {
      expect(ctaLabel({ trialDays: d })).not.toMatch(/\d/);
    });
  });

  test('it never names a period at all', () => {
    expect(ctaLabel({ trialDays: 7 })).not.toMatch(/day|week|month/i);
  });

  test('junk is treated as "we do not know", not as a trial', () => {
    expect(ctaLabel({ trialDays: 'seven' })).toBe('Subscribe');
    expect(ctaLabel({ trialDays: 0 })).toBe('Subscribe');
    expect(ctaLabel({ trialDays: -7 })).toBe('Subscribe');
    expect(ctaLabel({ trialDays: NaN })).toBe('Subscribe');
  });
});

// ── IMP-113 — the ember packs must show what the store will actually charge,
// not the $1.99/$4.99/$9.99 design constants (wrong on INR and everywhere
// else that isn't USD).
describe('mergeEmberPrices', () => {
  const FALLBACK_PACKS = [
    { id: 'e1', amount: 240, price: '$1.99', productId: 'embers_240' },
    { id: 'e2', amount: 680, price: '$4.99', tag: 'Popular', productId: 'embers_680' },
    { id: 'e3', amount: 1500, price: '$9.99', tag: 'Best value', productId: 'embers_1500' },
  ];

  test('returns the fallback packs unchanged when no live products exist', () => {
    expect(mergeEmberPrices(FALLBACK_PACKS, null)).toEqual(FALLBACK_PACKS);
    expect(mergeEmberPrices(FALLBACK_PACKS, [])).toEqual(FALLBACK_PACKS);
  });

  test('does not mutate the fallback it was given', () => {
    const before = JSON.parse(JSON.stringify(FALLBACK_PACKS));
    mergeEmberPrices(FALLBACK_PACKS, [{ identifier: 'embers_240', priceString: '₹199.00' }]);
    expect(FALLBACK_PACKS).toEqual(before);
  });

  test('a live priceString replaces the hardcoded price, matched by productId', () => {
    const out = mergeEmberPrices(FALLBACK_PACKS, [
      { identifier: 'embers_240', priceString: '₹199.00' },
      { identifier: 'embers_1500', priceString: '₹799.00' },
    ]);
    expect(out.find((p) => p.id === 'e1').price).toBe('₹199.00');
    expect(out.find((p) => p.id === 'e3').price).toBe('₹799.00');
    expect(out.find((p) => p.id === 'e2').price).toBe('$4.99'); // no live match — untouched
  });

  test('keeps amount and tag from the constants — the store never asserts those', () => {
    const out = mergeEmberPrices(FALLBACK_PACKS, [{ identifier: 'embers_680', priceString: '₹499.00' }]);
    const e2 = out.find((p) => p.id === 'e2');
    expect(e2.amount).toBe(680);
    expect(e2.tag).toBe('Popular');
  });

  test('a product with no priceString does not blank out the fallback', () => {
    const out = mergeEmberPrices(FALLBACK_PACKS, [{ identifier: 'embers_240' }]);
    expect(out.find((p) => p.id === 'e1').price).toBe('$1.99');
  });
});
