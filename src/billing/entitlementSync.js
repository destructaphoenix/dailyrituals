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

// Fixes the lost-phone bug: a returning subscriber whose local cache says
// `plus: false` (fresh install, IMP-033 quarantine, forged-then-corrected
// backup, ...) is otherwise never re-asked. Runs the check once, only when
// the app mounts with `plus` already false — a true member has nothing to
// gain here and the periodic AppState check (RitualsApp.js) already covers
// the downgrade side for members.
export function useLaunchEntitlementCheck({ plus, service, onEntitlementFound }) {
  const ran = useRef(false);
  useEffect(() => {
    if (plus || ran.current) return;
    ran.current = true;
    checkEntitlement(service).then((result) => {
      if (result.verified && result.entitlement) onEntitlementFound(result.entitlement);
    });
    // Launch-only by design — deliberately not re-run on later `plus` flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
