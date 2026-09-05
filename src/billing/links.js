// src/billing/links.js — open real external destinations. Replaces the
// placeholder "Opening…" toasts. `kind` matches the LegalFooter / Manage links.
import { Linking } from 'react-native';
import { LINKS, PACKAGE_NAME } from './config';

// IMP-083: Play's subscription-settings URL takes `?sku=<productId>&package=<pkg>`
// to open ONE subscription instead of the account-wide list. Two rules make it
// safe to send a subscriber there mid-cancel:
//   • Missing productId or packageName ⇒ the generic URL. A degraded link must
//     be today's link, never a 404.
//   • RevenueCat returns Google Play ids as `product:basePlan` (the dashboard
//     shows `plus_annual:annual`). Play's `sku` wants the product alone, so
//     everything from the first ':' is dropped.
// iOS is unchanged in every case — Apple has no equivalent parameter.
export function manageUrl({ platform, productId, packageName } = {}) {
  if (platform !== 'android') return LINKS.manageIos;
  const sku = String(productId || '').split(':')[0];
  if (!sku || !packageName) return LINKS.manageAndroid;
  return `${LINKS.manageAndroid}?sku=${encodeURIComponent(sku)}&package=${encodeURIComponent(packageName)}`;
}

// `opts` is optional so the existing two-argument calls keep working.
export async function openExternal(kind, platform, opts = {}) {
  const url =
    kind === 'terms' ? LINKS.terms :
    kind === 'privacy' ? LINKS.privacy :
    kind === 'manage' ? manageUrl({ platform, productId: opts.productId, packageName: PACKAGE_NAME }) :
    null;
  if (!url) return false;
  try {
    await Linking.openURL(url);
    return true;
  } catch (e) {
    console.warn('openExternal failed', kind, e); // eslint: surfaced, not swallowed
    return false;
  }
}
