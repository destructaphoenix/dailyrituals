// src/insights/snippet.js — pure helper that finds WHERE a search term matched
// inside an entry, so the result card can show the matched words instead of the
// first two lines of `did` (IMP-053). `searchEntries` decides *which* entries
// match and is untouched by this module; this one only locates the hit.
//
// ── Why this is not just indexOf on the normalized string ────────────────────
// `search.js`'s folding is NOT length-preserving: normalize('NFD') decomposes
// 'é' into two code points, and stripping the combining mark brings it back to
// one — but a string drifts by a different amount at every accent, so an index
// found in the folded string does not point at the same character in the
// original. Emoji compound it: they are surrogate pairs, so UTF-16 indices and
// code-point indices disagree the moment anyone writes 🎂 in their journal.
// Slicing the original at a folded index would therefore highlight the wrong
// characters — and only for users who write accents or emoji, i.e. it would
// look perfect in testing and be wrong in the owner's own market.
//
// The fix is to fold PER CODE POINT into an array, so folded index n always
// maps to original code point n, and to slice the original by code point too.

import { foldDiacritics } from './search';

// One input code point → exactly one output element. Both guards below are
// load-bearing: a lone combining mark folds to '' (which would shrink the map),
// and 'İ' (U+0130) lowercases to TWO code points on some engines (which would
// grow it). Either breaks the 1:1 index mapping this whole module rests on.
export function foldChar(ch) {
  const folded = foldDiacritics(ch).toLowerCase();
  const first = [...folded][0];
  return first === undefined ? ch : first;
}

export function foldChars(s) {
  return [...String(s ?? '')].map(foldChar);
}

// Naive array-substring search returning a CODE-POINT index, or -1. Entries run
// to a few hundred characters, so the obvious double loop is the right tool.
export function indexOfSeq(hay, needle) {
  if (!needle.length || needle.length > hay.length) return -1;
  for (let i = 0; i <= hay.length - needle.length; i += 1) {
    let j = 0;
    while (j < needle.length && hay[i + j] === needle[j]) j += 1;
    if (j === needle.length) return i;
  }
  return -1;
}

function sliceCp(cps, from, to) {
  return cps.slice(from, to).join('');
}

// → null, or { field, before, match, after, truncatedStart }.
// `did` is searched first and wins when both fields match. A needle that only
// spans the did/wished join (the space `searchEntries` concatenates with) is a
// deliberate miss: there is no single field to quote, so the card falls back to
// its normal rendering.
export function entrySnippet(entry, text, { lead = 30, tail = 200 } = {}) {
  if (!entry) return null;
  const needle = foldChars(String(text ?? '').trim());
  if (!needle.length) return null;

  for (const field of ['did', 'wished']) {
    const raw = entry[field];
    if (raw == null || raw === '') continue;
    const cps = [...String(raw)];
    const at = indexOfSeq(cps.map(foldChar), needle);
    if (at < 0) continue;

    const end = at + needle.length;
    const from = Math.max(0, at - lead);
    return {
      field,
      before: sliceCp(cps, from, at),
      match: sliceCp(cps, at, end),
      after: sliceCp(cps, end, end + tail),
      truncatedStart: from > 0,
    };
  }
  return null;
}
