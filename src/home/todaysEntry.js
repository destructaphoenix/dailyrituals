// Pure helpers for finding and gating today's entry.
// "editable" means: the entry exists and its dayKey matches today.
// Past entries are read-only; there is no edit affordance for them.

export function findTodaysEntry(entries, today) {
  return entries.find((e) => e.dayKey === today) ?? null;
}

export function isEditableToday(entry, today) {
  return !!entry && entry.dayKey === today;
}
