function pad2(n) {
  return String(n).padStart(2, '0');
}

// The calendar day the user is actually living, derived from local time —
// never UTC. See docs/specs-open.md IMP-056 for why this matters.
export function dayKeyOf(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}
