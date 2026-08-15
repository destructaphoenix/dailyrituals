// entries/emojiInput.js — validates the typed-emoji escape hatch in the
// custom-mood picker (IMP-050). Code-point based, no \p{...} regex — Hermes's
// Unicode property-escape support is not worth betting the input validator on.

export function isEmojiish(s) {
  const cps = [...String(s ?? '').trim()];
  return cps.length > 0 && cps.length <= 8 && cps.every((ch) => ch.codePointAt(0) >= 0x00a0);
}

// Removes emoji from a *name* the user typed (IMP-066). Deliberately NOT
// isEmojiish's ">= 0x00a0" rule: that would delete "Café" and every Devanagari
// character in a Hindi mood name. Only pictographic blocks and the joiners that
// glue them together go.
const EMOJI_RANGES = [
  [0x1f000, 0x1faff], // faces, hands, objects, flags, supplemental pictographs
  [0x2190, 0x21ff],   // arrows
  [0x2300, 0x23ff],   // misc technical (⌚ ⏰)
  [0x2460, 0x24ff],   // enclosed alphanumerics
  [0x25a0, 0x27bf],   // geometric shapes, misc symbols (☀ ❤ ✨), dingbats
  [0x2b00, 0x2bff],   // extra arrows and stars (⭐)
  [0xfe00, 0xfe0f],   // variation selectors — the ️ half of "❤️"
];
const EMOJI_SINGLES = new Set([0x200d, 0x20e3, 0x203c, 0x2049, 0x3030, 0x303d]);

export function stripEmoji(s) {
  return [...String(s ?? '')]
    .filter((ch) => {
      const cp = ch.codePointAt(0);
      if (EMOJI_SINGLES.has(cp)) return false;
      return !EMOJI_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi);
    })
    .join('');
}

// The first complete emoji in `s`, or '' when it doesn't start with one
// (IMP-070). Grapheme clustering by hand, because Hermes ships no
// Intl.Segmenter: take one base code point, swallow the modifiers that belong
// to it (variation selectors, skin tones, the combining keycap), and after a
// ZWJ take the next base and its modifiers too. A regional-indicator pair (a
// flag) is one cluster. Tag sequences are not handled — a subdivision flag
// truncates to its base flag, which is deliberate: those are tofu on Android 7.
const isEmojiMod = (cp) =>
  (cp >= 0xfe00 && cp <= 0xfe0f) ||    // variation selectors — the ️ half of "❤️"
  (cp >= 0x1f3fb && cp <= 0x1f3ff) ||  // skin-tone modifiers
  cp === 0x20e3;                       // combining enclosing keycap
const isRegional = (cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff;

export function firstEmoji(s) {
  const cps = [...String(s ?? '').trim()];
  if (!cps.length || cps[0].codePointAt(0) < 0x00a0) return '';
  let i = 0;
  const takeBase = () => {
    if (isRegional(cps[i].codePointAt(0)) && cps[i + 1] && isRegional(cps[i + 1].codePointAt(0))) {
      i += 2;
      return;
    }
    i += 1;
    while (cps[i] && isEmojiMod(cps[i].codePointAt(0))) i += 1;
  };
  takeBase();
  while (cps[i] && cps[i].codePointAt(0) === 0x200d && cps[i + 1]) {
    i += 1;
    takeBase();
  }
  return cps.slice(0, i).join('');
}
