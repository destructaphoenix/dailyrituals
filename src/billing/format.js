// src/billing/format.js — pure formatters bridging SDK data to the existing UI
// strings. Falls back to the design constant so the UI never shows a blank.
import { RENEW_DATE } from '../data';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function formatRenewDate(iso) {
  if (!iso) return RENEW_DATE;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return RENEW_DATE;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function planFromProductId(productId) {
  const id = String(productId || '').toLowerCase();
  if (id.includes('month')) return 'monthly';
  return 'annual'; // annual/yearly and unknowns default to annual
}
