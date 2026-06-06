// data.js — copy, sample content and config, ported verbatim from rituals-bits.jsx.

export const TODAY_LABEL = 'Saturday, 31 May';

export const COPY = {
  gentle: {
    teaserKicker: "Today's ritual",
    teaser: ['Give ', 'yesterday', ' a few honest words before it slips away.'],
    cta: "Begin today's reflection",
    epitaph: 'Here lies',
    q1: 'What did you do with today?',
    q1help: 'No need to dress it up — just what happened.',
    q2: "What do you wish you'd done?",
    q2help: 'Name it kindly. Tomorrow is listening.',
    moodQ: 'How did the day feel?',
    moodHelp: 'Pick the one that sits closest.',
    celebrateTitle: 'Today is at rest.',
    celebrateBody: 'Another day honoured with honest words. Sleep easy.',
    arcSub: 'Every day you laid to rest, kept together.',
    finish: 'Lay the day to rest',
  },
  playful: {
    teaserKicker: "Today's ritual",
    teaser: ['Yesterday is gone — ', "let's give it", ' a proper send-off.'],
    cta: "Write today's obituary",
    epitaph: 'Here lies',
    q1: 'So… what did you actually do?',
    q1help: 'The whole day. Yes, the snacks count.',
    q2: "And what do you wish you'd done?",
    q2help: 'Be honest — future-you is nosy.',
    moodQ: 'What was the vibe?',
    moodHelp: 'One word. You know the one.',
    celebrateTitle: 'Another one in the books!',
    celebrateBody: 'Today has been lovingly buried. Onward to the next.',
    arcSub: 'Your little graveyard of well-lived days.',
    finish: 'Bury the day',
  },
};

export const MOODS = ['Grateful', 'Restless', 'Proud', 'Tender', 'Tired', 'Hopeful', 'Heavy', 'Light'];

// One emoji per vibe — kept calm/contemplative to match the tone.
export const MOOD_EMOJI = {
  Grateful: '🙏',
  Restless: '🌀',
  Proud: '😌',
  Tender: '🫶',
  Tired: '😴',
  Hopeful: '🌅',
  Heavy: '🪨',
  Light: '🪶',
};
export const moodEmoji = (m) => MOOD_EMOJI[m] || '';

// A missed day is marked with a skull, both on the week strip and the calendar.
export const MISS_EMOJI = '💀';

// week strip — Mon..Sun, today = Sat (idx 5). Monday was skipped (a "miss");
// the run rebuilt Tue–Fri, today still open.
export const WEEK = [
  { l: 'M', state: 'miss' }, { l: 'T', state: 'done' }, { l: 'W', state: 'done' },
  { l: 'T', state: 'done' }, { l: 'F', state: 'done' }, { l: 'S', state: 'today' },
  { l: 'S', state: 'future' },
];

export const BADGES = [
  { id: 'firstlight', label: 'First Light', icon: 'sunrise', earned: true },
  { id: 'seven', label: 'Seven Suns', icon: 'sun', earned: true },
  { id: 'honest', label: 'Honest Heart', icon: 'check', earned: true },
  { id: 'steadfast', label: '30 Days', icon: 'diamond', earned: false },
  { id: 'fullcircle', label: 'Full Circle', icon: 'ring', earned: false },
];

// ── Duolingo-style mechanics (solo & gentle) ────────────────────────────────
// Daily "rites" — three small quests that renew each day. revisit starts done.
export const DAILY_QUESTS = [
  { id: 'write',   label: 'Lay today to rest', icon: 'write',   cur: 0, goal: 1, xp: 10 },
  { id: 'feel',    label: 'Name how it felt',  icon: 'feel',    cur: 0, goal: 1, xp: 10 },
  { id: 'revisit', label: 'Tend an old grave', icon: 'revisit', cur: 1, goal: 1, xp: 10 },
];
export const questsXp = (qs) => qs.reduce((s, q) => s + (q.cur >= q.goal ? q.xp : 0), 0);
export const questsGoal = (qs) => qs.reduce((s, q) => s + q.xp, 0);

// Tiered achievements (progress, not binary).
export const ACHIEVEMENTS = [
  { id: 'firstlight', label: 'First Light',    desc: 'Lay your first day to rest', icon: 'sunrise', cur: 1,  goal: 1 },
  { id: 'seven',      label: 'Seven Suns',     desc: 'Keep a seven-day streak',    icon: 'sun',     cur: 7,  goal: 7 },
  { id: 'honest',     label: 'Honest Heart',   desc: 'Name twenty-five feelings',  icon: 'heart',   cur: 12, goal: 25 },
  { id: 'moonlit',    label: 'Moonlit',        desc: 'Lay ten nights to rest',     icon: 'moon',    cur: 3,  goal: 10 },
  { id: 'society',    label: 'Streak Society', desc: 'Reach a thirty-day streak',  icon: 'diamond', cur: 4,  goal: 30 },
  { id: 'keeper',     label: 'Keeper of Days', desc: 'Keep one hundred days',      icon: 'ring',    cur: 47, goal: 100 },
];

// Streak milestones worth a special send-off in the celebration.
export const STREAK_MILESTONES = { 7: 'Seven Suns', 30: 'Streak Society', 100: 'Keeper of Days' };

export const SAMPLE_ENTRIES = [
  {
    id: 'e1', day: '30', mon: 'May', wd: 'Friday', mood: 'Tender', streak: true,
    did: 'Took the long way home from the market just to walk under the planes trees. Cooked the lentil thing properly for once and ate it slowly. Watched half a film and let the other half go.',
    wished: "I'd called my brother back. He left a voicemail on Tuesday and it's still sitting there, blinking at me.",
  },
  {
    id: 'e2', day: '29', mon: 'May', wd: 'Thursday', mood: 'Proud',
    did: 'Shipped the thing I had been dreading for two weeks. Closed the laptop at six and actually meant it.',
    wished: 'I had stretched in the morning instead of going straight to the inbox.',
  },
  {
    id: 'e3', day: '28', mon: 'May', wd: 'Wednesday', mood: 'Restless',
    did: 'A lot of small errands that felt bigger than they were. Sat in the park at lunch and people-watched.',
    wished: 'I had read instead of scrolling before bed. The book is right there.',
  },
  {
    id: 'e4', day: '27', mon: 'May', wd: 'Tuesday', mood: 'Grateful',
    did: 'Long coffee with Maya that ran an hour over. Laughed until it hurt about nothing.',
    wished: 'Nothing, honestly. It was a good one. I want to remember that this is possible.',
  },
  {
    id: 'e5', day: '26', mon: 'May', wd: 'Monday', mood: 'Tired',
    did: 'Pushed through a heavy day. Made dinner from whatever was in the fridge and called it a win.',
    wished: 'I had gone to bed an hour earlier instead of chasing a second wind that never came.',
  },
];

// 35-cell calendar (5 weeks). Days with an entry carry a mood (→ emoji);
// the rest are misses (→ skull). The last filled cell is today.
export const HEAT = (() => {
  const base = [1,2,2,3,1,0,1, 2,3,1,2,2,3,1, 0,1,3,2,1,2,3, 1,2,2,3,3,1,2, 3,2,3,2,1,3,2];
  const cycle = ['Tender', 'Proud', 'Grateful', 'Hopeful', 'Restless', 'Tired', 'Light', 'Heavy'];
  let k = 0;
  return base.map((lvl, i) => {
    if (lvl === 0) return { empty: true, today: false };
    const mood = cycle[k++ % cycle.length];
    return { mood, emoji: MOOD_EMOJI[mood], today: i === 33 };
  });
})();

// ── Shop / economy ───────────────────────────────────────────────────────────
// Mirrors rituals-shop.jsx. Embers are the soft currency; Plus is the sub.
// tier: 'owned' | <ember price number> | 'plus'

export const EMBER_GAIN = 15; // earned per day kept (celebration reward)

// Palettes — swatch is [accent, deep, soft]; applying one re-themes the app.
export const SHOP_PALETTES = [
  { id: 'goldenhour', name: 'Golden Hour',  swatch: ['#f59e0b', '#d97706', '#fef3c7'], tier: 'owned', note: 'Default' },
  { id: 'marigold',   name: 'Marigold',     swatch: ['#f97316', '#c2410c', '#ffedd5'], tier: 240 },
  { id: 'honey',      name: 'Honey',        swatch: ['#eab308', '#a16207', '#fef9c3'], tier: 240 },
  { id: 'rosedusk',   name: 'Rose Dusk',    swatch: ['#fb7185', '#be123c', '#ffe4e6'], tier: 420 },
  { id: 'sageeve',    name: 'Sage Eve',     swatch: ['#84a98c', '#52796f', '#e7efe8'], tier: 420 },
  { id: 'lavender',   name: 'Lavender Hour', swatch: ['#a78bfa', '#7c3aed', '#ede9fe'], tier: 'plus' },
  { id: 'frostlight', name: 'Frostlight',   swatch: ['#7dd3fc', '#0284c7', '#e0f2fe'], tier: 'plus', season: 'Winter' },
  { id: 'bloom',      name: 'Bloom',        swatch: ['#f472b6', '#db2777', '#fce7f3'], tier: 'plus', season: 'Spring' },
];

// Skies — orb/backdrop motif behind the streak number. Cosmetic in prototype.
export const SHOP_SKIES = [
  { id: 'classic',  name: 'Golden Sun',    kind: 'sun',     tier: 'owned', note: 'Default' },
  { id: 'crescent', name: 'Crescent Moon', kind: 'moon',    tier: 'owned' },
  { id: 'harvest',  name: 'Harvest Moon',  kind: 'harvest', tier: 300 },
  { id: 'meteor',   name: 'Meteor Shower', kind: 'meteor',  tier: 'plus' },
  { id: 'aurora',   name: 'Aurora',        kind: 'aurora',  tier: 'plus' },
];

// Streak-freeze candle packs (bought with embers).
export const CANDLE_PACKS = [
  { id: 'c1', count: 1, price: 120 },
  { id: 'c3', count: 3, price: 300, tag: 'Save 17%' },
  { id: 'c5', count: 5, price: 450, tag: 'Best value' },
];

// Ember top-ups (bought with cash).
export const EMBER_PACKS = [
  { id: 'e1', amount: 240,  price: '$1.99' },
  { id: 'e2', amount: 680,  price: '$4.99', tag: 'Popular' },
  { id: 'e3', amount: 1500, price: '$9.99', tag: 'Best value' },
];

export const PLUS_PRICES = {
  monthly: { id: 'monthly', label: 'Monthly', price: '$4.99', per: 'per month', sub: 'Billed monthly' },
  annual:  { id: 'annual',  label: 'Annual',  price: '$29.99', per: 'per year', sub: '$2.50 / mo · billed yearly', save: 'Save 50%' },
};

export const PLUS_PERKS = [
  'Every palette & sky — unlocked forever',
  'Three streak-freeze candles, every month',
  'Your whole graveyard, kept forever',
  'Export your days as a keepsake PDF',
  'Deeper insights — moods & seasonal themes',
];

// Next renewal date shown across the member status + manage surfaces.
export const RENEW_DATE = '12 Jun 2026';
