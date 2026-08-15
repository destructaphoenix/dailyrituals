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
