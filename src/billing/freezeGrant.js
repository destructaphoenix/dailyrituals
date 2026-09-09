// IMP-102 (owner ruling, 2026-09-09): the +3 streak candles are a PER-PERIOD
// perk, not a joining gift — they must be granted once for each paid period
// and never again for a re-recognition of a period already granted. The
// device clock cannot be trusted and the local `plus` flag is only a cache,
// so the period key is the entitlement's own `renewISO` (RevenueCat's
// expirationDate) — store-authoritative, immune to the device clock, and it
// changes on a renewal and on nothing else.
export const PERIOD_FREEZES = 3;

// Returns null when nothing is owed, or { period, freezes } to grant and
// record. `'no-expiry'` is the sentinel for an entitlement with no
// expiration date: it grants exactly once, ever, rather than on every read.
export function freezeGrantFor(entitlement, lastGrantedPeriod) {
  if (!entitlement || entitlement.active !== true) return null;
  const period = entitlement.renewISO || 'no-expiry';
  if (period === lastGrantedPeriod) return null;
  return { period, freezes: PERIOD_FREEZES };
}
