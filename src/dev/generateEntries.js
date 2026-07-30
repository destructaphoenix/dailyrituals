// src/dev/generateEntries.js
// Pure generator of test entries for the dev harness. Produces entries in the
// EXACT shape RitualsApp.complete() builds, using the real date helpers so the
// insights / calendar / heatmap derivations light up correctly.
import { DAY_MS, dayKeyToUtcMs } from '../insights/dateKeys';
import { entryDateParts } from '../time/clock';
import { MOODS } from '../data';
import { SENTINEL } from './sentinel';

export const DEV_ID = `${SENTINEL}/generateEntries`;

const DIDS = [
  'walked at dawn', 'wrote three pages', 'called an old friend', 'sat in the sun',
  'cooked something new', 'finished the book', 'cleared the inbox', 'planted basil',
];
const WISHES = [
  'more quiet mornings', 'to call mom', 'a longer walk', 'less screen time',
  'to sleep earlier', 'one more chapter', 'rain this week', 'a slower day',
];

// Long fixture pool — stress ReadingSheet / Archive / (future) PDF wrapping
// with multi-sentence, multi-paragraph entries instead of the short pool's
// single clauses.
const LONG_DIDS = [
  "Walked at dawn before the street woke up, further than planned. Stopped at the old bridge and just stood there for a while, watching the water. Didn't think about anything in particular, which was the point.\n\nCame home and made coffee slower than usual.",
  "Spent the whole afternoon on three pages I'd been avoiding for a week. It felt clumsy at first, then it didn't. Read it back twice and only changed one line.\n\nCalled it done and went for a walk to let it settle.",
  "Finally called an old friend I'd been meaning to reach for months. We talked for almost two hours about nothing important and everything that mattered. Promised we wouldn't let it go so long next time — we probably will, but it was good to hear their voice.",
];
const LONG_WISHES = [
  "More quiet mornings like this one, where nothing is scheduled and the light comes in slow. I keep saying I'll protect this time and then I don't, so maybe writing it down here will help.",
  "To call mom before the week gets away from me again. Not because anything is wrong, just because it's been too long and she'd like to hear about the garden.",
  "A longer walk tomorrow, somewhere without a destination. Today's felt too short and too purposeful — I want one that just wanders until it's done wandering.",
];

// 'YYYY-MM-DD' + delta days -> 'YYYY-MM-DD' (UTC math, then UTC formatting).
export function shiftDayKey(key, deltaDays) {
  const dt = new Date(dayKeyToUtcMs(key) + deltaDays * DAY_MS);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Local noon Date for a dayKey — TZ-safe for deriving day/mon/wd labels.
function localNoon(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

// buildEntries({ count, endDayKey, gaps, textLength }) -> newest-first array of
// entries. Walks back from endDayKey by day offset; offsets listed in `gaps`
// are skipped (no entry that day) so the run has holes. Stops once `count`
// entries exist. `textLength: 'long'` pulls from a multi-paragraph pool
// instead of the default short one — for stressing ReadingSheet / Archive.
export function buildEntries({ count, endDayKey, gaps = [], textLength = 'short' }) {
  const dids = textLength === 'long' ? LONG_DIDS : DIDS;
  const wishes = textLength === 'long' ? LONG_WISHES : WISHES;
  const out = [];
  let offset = 0;
  let made = 0;
  while (made < count) {
    if (!gaps.includes(offset)) {
      const dayKey = shiftDayKey(endDayKey, -offset);
      out.push({
        id: `dev-${dayKey}`,
        ...entryDateParts(localNoon(dayKey)),
        dayKey,
        mood: MOODS[made % MOODS.length],
        did: dids[made % dids.length],
        wished: wishes[made % wishes.length],
        streak: true,
      });
      made += 1;
    }
    offset += 1;
  }
  return out;
}
