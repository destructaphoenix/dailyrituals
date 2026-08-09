// gen-v2-fixture.js — writes a faithful vc11-era (SCHEMA_VERSION 2) backup file
// so the v2→v3 mood migration (IMP-037) can be walked WITHOUT installing vc11.
//
// readBackup() -> deserialize() -> migrate() is the exact same entry point the
// cold-start load uses (storage.loadState), so restoring this file exercises
// the real migrator, not a stand-in.
//
// Run:  node scripts/gen-v2-fixture.js   (writes next to this script)
// Then: adb push daily-rituals-v2-fixture.json /sdcard/Download/

const fs = require('fs');
const path = require('path');

const MONTHS_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_MS = 86400000;

const DIDS = [
  'walked at dawn', 'wrote three pages', 'called an old friend', 'sat in the sun',
  'cooked something new', 'finished the book', 'cleared the inbox', 'planted basil',
];
const WISHES = [
  'more quiet mornings', 'to call mom', 'a longer walk', 'less screen time',
  'to sleep earlier', 'one more chapter', 'rain this week', 'a slower day',
];
// v2 moods were a SINGLE string per entry — this is the whole point of the fixture.
const V2_MOODS = ['Grateful', 'Restless', 'Proud', 'Tender', 'Tired', 'Hopeful', 'Heavy', 'Light'];

function dayKeyOf(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

// Local-noon Date for a dayKey, matching generateEntries.js's TZ-safe labelling.
function localNoon(dayKey) {
  const [y, m, d] = dayKey.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function dateParts(dayKey) {
  const dt = localNoon(dayKey);
  return { day: String(dt.getDate()), mon: MONTHS_ABBR[dt.getMonth()], wd: WEEKDAYS[dt.getDay()] };
}

const COUNT = 12;
const todayMs = Date.now();
const entries = [];

for (let i = 0; i < COUNT; i += 1) {
  const dayKey = dayKeyOf(todayMs - i * DAY_MS);
  const e = {
    id: `v2-${dayKey}`,
    ...dateParts(dayKey),
    dayKey,
    did: DIDS[i % DIDS.length],
    wished: WISHES[i % WISHES.length],
  };

  // Three deliberate shapes the migrator must survive:
  if (i === 3) {
    // (a) an entry with NO mood at all -> must become moods: []
    // (no mood key written)
  } else if (i === 5) {
    // (b) an entry ALREADY in v3 shape -> migrator must leave it untouched
    e.moods = ['Hopeful', 'Tender'];
  } else if (i === 7) {
    // (c) an explicitly empty mood string -> must become moods: [], not ['']
    e.mood = '';
  } else {
    // (d) the ordinary v2 case
    e.mood = V2_MOODS[i % V2_MOODS.length];
  }

  entries.push(e);
}

// The persisted slice exactly as vc11 wrote it. Note what is ABSENT on purpose:
// frozenDays (IMP-039), seenTips (IMP-041), trash (IMP-036) and freeRestoresUsed
// (IMP-048) all post-date vc11, so their `?? []` / `?? 0` fallbacks get tested too.
const slice = {
  onboarded: true,
  mode: 'day',
  entries,
  xp: 610,
  done: true,
  quests: [
    { id: 'write', label: 'Lay today to rest', icon: 'write', cur: 1, goal: 1, xp: 10 },
    { id: 'feel', label: 'Name how it felt', icon: 'feel', cur: 1, goal: 1, xp: 10 },
    { id: 'revisit', label: 'Tend an old grave', icon: 'revisit', cur: 0, goal: 1, xp: 10 },
  ],
  freezes: 2,
  embers: 375,
  plus: false,
  activePalette: 'goldenhour',
  ownedPalettes: ['goldenhour'],
  activeSky: 'classic',
  ownedSkies: ['classic'],
  subCanceled: false,
  activePlan: null,
  lastActiveDay: dayKeyOf(todayMs),
  // Settings as vc11 wrote them. NOTE `accent` is an ARRAY — [accent, deep,
  // soft] (theme.js DEFAULT_SETTINGS). mergeWithDefaults is a shallow spread,
  // so a string here replaces the array outright and every derived colour
  // becomes '#', which processColor turns into null and native rejects.
  // Only the keys vc11 knew about are written: customMoods (IMP-037),
  // onThisDayDismissed (IMP-038) and recapSeen (IMP-046) are omitted on
  // purpose so mergeWithDefaults has to supply them.
  settings: {
    name: 'Migration Test',
    tone: 'gentle',
    accent: ['#f59e0b', '#d97706', '#fef3c7'],
    headlineFont: 'Quicksand',
    roundness: 1,
    reminder: { enabled: false, hour: 20, minute: 30 },
    storePurchase: 'success',
    storeRestore: 'empty',
  },
  lastBackupAt: new Date(todayMs - 3 * DAY_MS).toISOString(),
  promptDeck: [],
};

const payload = JSON.stringify({ version: 2, ...slice, lastSavedAt: todayMs });

const envelope = {
  format: 'daily-rituals-backup',
  appVersion: '1.0.5',
  exportedAt: new Date(todayMs).toISOString(),
  counts: { entries: entries.length, days: new Set(entries.map((e) => e.dayKey)).size },
  payload,
};

const out = path.join(__dirname, 'daily-rituals-v2-fixture.json');
fs.writeFileSync(out, JSON.stringify(envelope, null, 2));
console.log('wrote', out);
console.log(`${entries.length} entries · v2 payload · single-string moods`);
console.log('expected after migration:');
console.log('  - 9 entries with exactly 1 mood');
console.log('  - 1 entry (index 5) with 2 moods, untouched');
console.log('  - 2 entries with moods: [] (no mood, and empty-string mood)');
