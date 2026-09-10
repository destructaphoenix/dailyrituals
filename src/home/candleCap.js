import { MAX_CANDLES } from '../data';

// How many of `wanted` actually fit, given `held`. Never negative.
export function roomFor(held, wanted, cap = MAX_CANDLES) {
  return Math.max(0, Math.min(wanted, cap - held));
}
