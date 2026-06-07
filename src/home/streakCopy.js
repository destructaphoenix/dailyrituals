export function streakSubtitle(streak) {
  if (streak === 0) return 'A fresh page — begin today.';
  if (streak === 1) return '1 day running — keep it tender.';
  return `${streak} days running — keep it tender.`;
}
