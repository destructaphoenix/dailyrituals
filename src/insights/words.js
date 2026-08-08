// words.js — shared word-count utility (extracted from lifetime.js, IMP-046,
// so the Annual Recap and Lifetime Progress cannot drift apart).

export function countWords(s) {
  if (!s || typeof s !== 'string') return 0;
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}
