// deck.js — a no-repeat "shuffle-bag" for the daily reflection prompt. Unlike
// the stateless greeting, a repeated prompt is noticeable, so we deal the whole
// pool without replacement and only reshuffle once it is exhausted. State is
// persisted (see RitualsApp / persistence). selectPrompt is pure: it returns the
// SAME deck reference when nothing changed, so React effects don't churn.
import { mulberry32 } from '../time/dailyPick';

// Deterministic Fisher–Yates permutation of [0..n-1] for a given seed.
export function shuffle(n, seed) {
  const arr = Array.from({ length: n }, (_, i) => i);
  const rnd = mulberry32(seed >>> 0);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function valid(deck, len) {
  return !!deck
    && Array.isArray(deck.order) && deck.order.length === len
    && deck.order.every((x) => Number.isInteger(x) && x >= 0 && x < len)
    && Number.isInteger(deck.pos) && deck.pos >= 0 && deck.pos < len
    && Number.isInteger(deck.day);
}

// Returns { state, item }. `day` is an integer calendar-day index (dayNumber).
export function selectPrompt(pool, deck, day) {
  const len = pool.length;
  if (len === 0) return { state: null, item: '' };

  // (Re)initialize on first use, corruption, or a pool-size change.
  if (!valid(deck, len)) {
    const order = shuffle(len, day);
    return { state: { day, order, pos: 0 }, item: pool[order[0]] };
  }

  // Same day → unchanged. Return the SAME reference so consumers can skip writes.
  if (deck.day === day) {
    return { state: deck, item: pool[deck.order[deck.pos]] };
  }

  // New day → advance by exactly one; reshuffle when the deck runs out.
  let pos = deck.pos + 1;
  let order = deck.order;
  if (pos >= len) { order = shuffle(len, day); pos = 0; }
  return { state: { day, order, pos }, item: pool[order[pos]] };
}
