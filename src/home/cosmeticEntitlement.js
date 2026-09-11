// IMP-116 — a Plus cosmetic applied for free is active but not owned; the
// moment membership lapses (or, before this fix, the moment it is switched
// away from) the entitlement backing it is gone. Pure so RitualsApp.js's
// effect and the tests can share one source of truth for "what should be
// active right now."
export function entitledId(activeId, ownedIds, items, plus, defaultId) {
  const item = items.find((i) => i.id === activeId);
  if (!item) return defaultId;
  if (item.tier === 'owned') return activeId;
  if (ownedIds.includes(activeId)) return activeId;
  if (plus) return activeId;
  return defaultId;
}
