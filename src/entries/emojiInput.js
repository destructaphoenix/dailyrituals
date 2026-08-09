// entries/emojiInput.js — validates the typed-emoji escape hatch in the
// custom-mood picker (IMP-050). Code-point based, no \p{...} regex — Hermes's
// Unicode property-escape support is not worth betting the input validator on.

export function isEmojiish(s) {
  const cps = [...String(s ?? '').trim()];
  return cps.length > 0 && cps.length <= 8 && cps.every((ch) => ch.codePointAt(0) >= 0x00a0);
}
