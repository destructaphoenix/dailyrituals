// entries/restoreAllowance.js — who may bring a deleted day back, and how many
// times. Deleting is free forever; the first three restores are free too, and
// after that restoring is the Plus half. The allowance is disclosed on the
// Recently deleted screen BEFORE it is spent — a locked button nobody was
// warned about is the defect this file exists to prevent.
//
// The allowance is enforced identically whether or not Plus is purchasable
// yet: what a tester sees today is exactly what ships once PLUS_ENABLED flips,
// so "free 3 times" is never quietly worth more than it says.

export const FREE_RESTORES = 3;

// A stored count is only believed when it is a real, non-negative number —
// anything else (missing key, corrupt backup, hand-edited JSON) reads as
// "none used" rather than silently costing someone their allowance.
function normalizeUsed(used) {
  if (typeof used !== 'number' || !Number.isFinite(used) || used < 0) return 0;
  return used;
}

export function freeRestoresLeft(used) {
  return Math.max(0, FREE_RESTORES - normalizeUsed(used));
}

// kind:
//   'plus'        — subscriber, unlimited, spends nothing
//   'free'        — one of the three, go ahead
//   'locked'      — three spent, Plus is on sale, route to the paywall
//   'unavailable' — three spent, Plus is not on sale yet (PLUS_ENABLED false)
export function restoreAccess({ used, plus, plusEnabled } = {}) {
  const left = freeRestoresLeft(used);
  if (plus) return { kind: 'plus', left };
  if (left > 0) return { kind: 'free', left };
  return { kind: plusEnabled ? 'locked' : 'unavailable', left };
}

export function consumeFreeRestore(used, plus) {
  const current = normalizeUsed(used);
  if (plus) return current;
  return Math.min(FREE_RESTORES, current + 1);
}
