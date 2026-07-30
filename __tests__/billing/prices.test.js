// __tests__/billing/prices.test.js — the paywall must never show a price the
// store won't charge. These lock the merge of live RevenueCat offerings over
// the design constants, and the refusal to assert an unverified saving.
import { mergePrices, savePercent, ANNUAL_SUB_LIVE } from '../../src/billing/prices';

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
  test('returns the fallback constants unchanged when no live prices exist', () => {
    expect(mergePrices(FALLBACK, null)).toEqual(FALLBACK);
    expect(mergePrices(FALLBACK, {})).toEqual(FALLBACK);
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
    expect(out.annual).toEqual(FALLBACK.annual);
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
    expect(out.annual).toEqual(FALLBACK.annual);
  });
});
