// entitlementSync.js — makes the store, not the local `plus` flag, authoritative
// (IMP-043). The flag is a CACHE: only a definitively-verified answer may
// change it. A failed/unreachable check changes NOTHING — this app is
// offline-first, and revoking Plus because the network dropped would strand a
// paying subscriber on a plane, which is worse than the forgery it prevents.
import { useEffect, useRef } from 'react';

// Never throws. `verified: false` means the store couldn't be reached at all
// (network, unavailable) — distinct from `verified: true, entitlement: null`,
// which is the store definitively saying "no subscription here".
export async function checkEntitlement(service) {
  try {
    const entitlement = await service.getEntitlement();
    return { verified: true, entitlement: entitlement || null };
  } catch (e) {
    return { verified: false, entitlement: null };
  }
}

// Pure: given the current local flag and a checkEntitlement() result, what
// should the flag become? Unverified → unchanged, always.
export function nextPlusState(plus, result) {
  if (!result.verified) return plus;
  return !!result.entitlement;
}

// Covers two bugs with one check, run once at mount regardless of `plus`:
//
// - The lost-phone bug (upgrade edge): a returning subscriber whose local
//   cache says `plus: false` (fresh install, IMP-033 quarantine,
//   forged-then-corrected backup, ...) was never re-asked, because "Restore
//   purchases" lived only behind the paywall — the one screen a
//   non-Plus-looking user has no reason to open.
// - The lapsed-member bug (downgrade edge, IMP-107): the AppState listener in
//   RitualsApp.js covers downgrade too, but only on a background→foreground
//   *transition* — `AppState` does not emit `'change'` on a cold start, which
//   comes up already `active`. A member who opens the app, writes and closes
//   it without ever backgrounding it was never re-checked, so a lapsed
//   subscription could keep showing Plus indefinitely.
//
// This hook only runs the check and hands the raw result to the caller —
// `nextPlusState` still rules on whether the flag actually moves, so a
// failed/unreachable check (`verified: false`) changes nothing either way.
export function useLaunchEntitlementSync({ plus, service, onResult }) {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    checkEntitlement(service).then(onResult); // caller decides; nextPlusState still rules
    // Launch-only by design — deliberately not re-run on later `plus` flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
