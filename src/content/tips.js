// content/tips.js — the verbatim explainer copy for the "How it works" card
// (YouScreen) and the "What's in Plus" sheet. Pure content; no rendering here.
//
// IMP-041's per-screen dismissible tips were removed by IMP-075 — the owner's
// call after walking them in WALK-10, not a defect. TIPS, pendingTip,
// markTipSeen and the persisted `seenTips` key went with them; "How it works"
// already carries the same six mechanics on demand. The filename is kept so
// the build-log and walk history that cite this path still resolve.

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
