// src/billing/format.js — pure formatters bridging SDK data to the existing UI
// strings.
//
// IMP-082: these never fabricate. `formatRenewDate` returns null when there is
// no usable date, and every caller must drop the claim rather than substitute
// the RENEW_DATE design mock. Same rule prices.js already states for money:
// never assert what cannot be computed from real data.

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function formatRenewDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function planFromProductId(productId) {
  const id = String(productId || '').toLowerCase();
  if (id.includes('month')) return 'monthly';
  return 'annual'; // annual/yearly and unknowns default to annual
}
