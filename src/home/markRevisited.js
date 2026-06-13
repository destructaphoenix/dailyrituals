// Pure helper: mark the "revisit" rite as kept when the user opens a past entry.
// Returns a new quests array (immutable). Returns the same reference if no change.
export function markRevisited(quests, entry, today) {
  if (!entry.dayKey || entry.dayKey === today) return quests;
  const revisit = quests.find((q) => q.id === 'revisit');
  if (!revisit || revisit.cur >= revisit.goal) return quests;
  return quests.map((q) => (q.id === 'revisit' ? { ...q, cur: q.goal } : q));
}
