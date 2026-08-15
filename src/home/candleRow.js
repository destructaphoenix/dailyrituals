// home/candleRow.js — how many candle icons the streak hero draws, and what the
// caption under them says (IMP-064). Before this the row was a literal [0,1,2]
// map, so 3 candles and 30 candles drew the same picture and the only real
// number was in the caption text.

export const CANDLE_ICON_MAX = 5;

// → { slots, lit, overflow }. `slots` icons are drawn; the first `lit` of them
// burn. Past CANDLE_ICON_MAX the row stops growing and a "×N" badge carries the
// count — five 19dp icons is the most that stays countable at a glance.
export function candleRow(count, max = CANDLE_ICON_MAX) {
  const n = Math.max(0, Math.floor(Number(count) || 0));
  if (n === 0) return { slots: 1, lit: 0, overflow: null };
  if (n <= max) return { slots: n, lit: n, overflow: null };
  return { slots: max, lit: max, overflow: `×${n}` };
}

export function candleRowCopy(count) {
  const n = Math.max(0, Math.floor(Number(count) || 0));
  if (n === 0) return 'No candles. One keeps your flame on a day you miss.';
  if (n === 1) return '1 candle — it keeps your flame on a day you miss.';
  return `${n} candles — each keeps your flame on a day you miss.`;
}
