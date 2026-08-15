// entries/moodChipOrder.js — selected mood chips sort to the front of the
// filter row (IMP-065). A chip picked from deep in the horizontal scroll used
// to stay where it was, so turning it back off meant hunting for it.

// Selected first, then the rest — relative order preserved inside both groups.
// Returns the input array by reference when nothing is selected.
export function orderMoodChips(all, selected) {
  const list = Array.isArray(all) ? all : [];
  const sel = new Set(Array.isArray(selected) ? selected : []);
  const picked = list.filter((m) => sel.has(m));
  if (!picked.length) return list;
  return [...picked, ...list.filter((m) => !sel.has(m))];
}

// Every mood a chip row may offer, built-ins first, with duplicates removed
// (IMP-069). Nothing stopped a custom mood from being stored under a name a
// built-in already owned, and two chips with the same name render under the
// same React key — one of the pair then goes stale and stops answering taps.
// Case-insensitive and trimmed, because that is the collision rule
// moodNameError already enforces on the rename path. Built-ins win.
export function allMoodChips(builtIn, customMoods) {
  const all = [
    ...(Array.isArray(builtIn) ? builtIn : []),
    ...(Array.isArray(customMoods) ? customMoods : []),
  ];
  const seen = new Set();
  const out = [];
  for (const m of all) {
    if (typeof m !== 'string') continue;
    const key = m.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(m);
  }
  return out;
}
