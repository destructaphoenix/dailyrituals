// src/billing/links.js — open real external destinations. Replaces the
// placeholder "Opening…" toasts. `kind` matches the LegalFooter / Manage links.
import { Linking } from 'react-native';
import { LINKS } from './config';

export async function openExternal(kind, platform) {
  const url =
    kind === 'terms' ? LINKS.terms :
    kind === 'privacy' ? LINKS.privacy :
    kind === 'manage' ? (platform === 'android' ? LINKS.manageAndroid : LINKS.manageIos) :
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
