import { MAX_CANDLES } from '../data';

// How many of `wanted` actually fit, given `held`. Never negative.
export function roomFor(held, wanted, cap = MAX_CANDLES) {
  return Math.max(0, Math.min(wanted, cap - held));
}

// IMP-115 — a holding banked before the cap landed can exceed it; showing
// "6 / 3 kept" presents a limit that is visibly not holding, so drop the
// denominator once `held` is above it.
export function keptLabel(held, cap = MAX_CANDLES) {
  return held > cap ? `${held} kept` : `${held} / ${cap} kept`;
}
