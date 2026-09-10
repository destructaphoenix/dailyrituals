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

// The number of free days the live offer carries, or null when we do not know.
// Null is the only honest default: the design constants have never described an
// offer, so there is nothing here for them to assert. Same rule as the savings
// badge above — a claim we cannot compute from live data is dropped, not guessed.
function liveTrialDays(entry) {
  const n = entry && Number(entry.trialDays);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// fallback: the PLUS_PRICES shape. live: { annual?: { priceString, price,
// trialDays }, … } from PurchaseService.getPrices(). Returns a new object;
// never mutates either. Every entry carries `trialDays` on the way out, null
// when unknown — ctaLabel below is the only thing allowed to read it.
export function mergePrices(fallback, live) {
  const l = live || {};
  const out = {};
  Object.keys(fallback).forEach((key) => {
    const entry = l[key];
    out[key] = entry && entry.priceString
      ? { ...fallback[key], price: entry.priceString, trialDays: liveTrialDays(entry) }
      : { ...fallback[key], trialDays: null };
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

// ── The CTA (IMP-090) ────────────────────────────────────────────────────────
//
// WALK-19 step 3, 2026-09-06: the button said "Start 7-day free trial" and
// Play's own sheet said charging today, because the owner had subscribed on
// that Google account before and a Play trial is once per account, ever.
//
// So this deliberately does NOT print the day count, even when we have one.
// `trialDays` describes the OFFER; only Play knows whether THIS buyer is still
// eligible, and it does not tell us until the sheet is already open. A button
// that names a number is making a promise on Play's behalf that Play may
// refuse — which is exactly the bug. "Try free, then subscribe" is true for an
// eligible buyer and not a lie to an ineligible one; the day count lives in the
// disclosure copy, worded as a description of the offer.
export function ctaLabel({ trialDays } = {}) {
  const n = Number(trialDays);
  return Number.isFinite(n) && n > 0 ? 'Try free, then subscribe' : 'Subscribe';
}

// ── Ember packs (IMP-113) ─────────────────────────────────────────────────────
//
// Same rule as mergePrices: a live priceString replaces the fallback string;
// everything else about a pack (amount, tag) is the constants' to assert —
// the store has no opinion on what an ember pack is worth in embers.
export function mergeEmberPrices(fallback, products) {
  const byId = {};
  (Array.isArray(products) ? products : []).forEach((p) => {
    if (p && p.identifier) byId[p.identifier] = p;
  });
  return fallback.map((pack) => {
    const live = byId[pack.productId];
    return live && live.priceString ? { ...pack, price: live.priceString } : { ...pack };
  });
}
