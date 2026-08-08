// content/tips.js — one-per-screen dismissible tips (IMP-041) and the
// verbatim explainer copy for the "How it works" card + "What's in Plus"
// sheet. Pure content + pure helpers; no rendering here.

export const TIPS = [
  {
    id: 'today-streak',
    screen: 'today',
    title: 'Your streak',
    body: "That number is how many days in a row you've laid to rest. Miss a day and it starts again at one — unless a candle is lit for you.",
  },
  {
    id: 'archive-heat',
    screen: 'archive',
    title: 'Your days, at a glance',
    body: 'Every square is a day. 💀 marks one that got away. Tap any reflection to read it again.',
  },
  {
    id: 'you-safety',
    screen: 'you',
    title: 'It all lives here',
    body: 'Your journal is kept on this phone and nowhere else. Back it up here, and it will be waiting on your next one.',
  },
];

export const EXPLAINERS = [
  {
    id: 'streak',
    label: 'Your streak',
    title: 'Your streak',
    body: "Your streak is the number of days in a row you've written. It's counted from your reflections themselves, so it's always the truth — miss a day and it returns to one. Writing again on a day you've already kept edits that day rather than adding to it.",
  },
  {
    id: 'embers',
    label: 'Embers',
    title: 'Embers',
    body: 'You gather 15 embers for every day you lay to rest. Spend them in the Shop on palettes, skies and streak candles. They also gather on their own — one handful for every day you keep.',
  },
  {
    id: 'candles',
    label: 'Streak candles',
    title: 'Streak candles',
    body: "A candle spends itself when you miss a day, and your streak holds. One candle covers one missed day. If you're away longer than the candles you own, the ones you have are still spent on the days they can cover. Buy them in the Shop with embers.",
  },
  {
    id: 'rites',
    label: 'Daily rites',
    title: 'Daily rites',
    body: 'Three small acts that renew at midnight: lay today to rest, name how it felt, and tend an old grave by opening a past reflection. Each one is worth 10 XP.',
  },
  {
    id: 'levels',
    label: 'Levels',
    title: 'Levels',
    body: 'Writing a day is worth 50 XP, and each rite another 10. XP only ever adds up, carrying you from Waking to Keeper of Days. Nothing you earn is ever taken back.',
  },
  {
    id: 'keepsakes',
    label: 'Keepsakes',
    title: 'Keepsakes',
    body: "Keepsakes arrive on their own for what you've already written — days kept, streaks held, words laid down. There's nothing to claim; they're simply there when you've earned them.",
  },
];

export function pendingTip(screen, seenTips) {
  const seen = seenTips || [];
  const tip = TIPS.find((t) => t.screen === screen && !seen.includes(t.id));
  return tip || null;
}

export function markTipSeen(seenTips, id) {
  const seen = seenTips || [];
  if (seen.includes(id)) return seen;
  return [...seen, id];
}
