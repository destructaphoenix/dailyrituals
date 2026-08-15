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
