// src/billing/prices.js — pure display-price merge.
//
// The paywall used to render the PLUS_PRICES design constants ($4.99 / $29.99)
// verbatim, while Google charged whatever the Play product is priced at in the
// buyer's country. That is a price misrepresentation, not a cosmetic bug. These
// helpers layer the live RevenueCat offering over the constants, which survive
// only as an offline/Expo-Go fallback.
//
// Rule: anything the constants assert that the live prices contradict — the
// per-month sub-line, the savings badge — is dropped rather than shown stale.
// We never assert a saving we cannot compute from the real store prices.

// Replaces "$2.50 / mo · billed yearly" once a live annual price lands. We
// deliberately do NOT recompute a per-month figure: formatting one correctly
// needs the currency's symbol, placement and grouping, which priceString has
// already solved for us and a manual divide would get wrong.
export const ANNUAL_SUB_LIVE = 'Billed yearly';

// Percent saved by the annual plan vs twelve monthly payments, or null when it
// cannot be established from real numbers. Both inputs are RevenueCat's numeric
// `product.price` (not the formatted string — currency parsing is a trap).
export function savePercent(monthlyPrice, annualPrice) {
  const m = Number(monthlyPrice);
  const a = Number(annualPrice);
  if (!Number.isFinite(m) || !Number.isFinite(a) || m <= 0 || a <= 0) return null;
  const pct = Math.round((1 - a / (m * 12)) * 100);
  return pct >= 1 && pct < 100 ? pct : null;
}

// fallback: the PLUS_PRICES shape. live: { annual?: { priceString, price }, … }
// from PurchaseService.getPrices(). Returns a new object; never mutates either.
export function mergePrices(fallback, live) {
  const l = live || {};
  const out = {};
  Object.keys(fallback).forEach((key) => {
    const entry = l[key];
    out[key] = entry && entry.priceString
      ? { ...fallback[key], price: entry.priceString }
      : { ...fallback[key] };
  });

  // Only a live annual price invalidates the annual sub-line + savings badge.
  if (!out.annual || !l.annual || !l.annual.priceString) return out;

  const pct = savePercent(l.monthly && l.monthly.price, l.annual.price);
  const { save, ...rest } = out.annual;
  out.annual = pct === null
    ? { ...rest, sub: ANNUAL_SUB_LIVE }
    : { ...rest, sub: ANNUAL_SUB_LIVE, save: `Save ${pct}%` };
  return out;
}
