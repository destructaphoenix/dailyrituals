// src/dev/generateEntries.js
// Pure generator of test entries for the dev harness. Produces entries in the
// EXACT shape RitualsApp.complete() builds, using the real date helpers so the
// insights / calendar / heatmap derivations light up correctly.
import { DAY_MS, dayKeyToUtcMs } from '../insights/dateKeys';
import { entryDateParts } from '../time/clock';
import { MOODS } from '../data';

const DIDS = [
  'walked at dawn', 'wrote three pages', 'called an old friend', 'sat in the sun',
  'cooked something new', 'finished the book', 'cleared the inbox', 'planted basil',
];
const WISHES = [
  'more quiet mornings', 'to call mom', 'a longer walk', 'less screen time',
  'to sleep earlier', 'one more chapter', 'rain this week', 'a slower day',
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

// buildEntries({ count, endDayKey, gaps }) -> newest-first array of entries.
// Walks back from endDayKey by day offset; offsets listed in `gaps` are skipped
// (no entry that day) so the run has holes. Stops once `count` entries exist.
export function buildEntries({ count, endDayKey, gaps = [] }) {
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
        did: DIDS[made % DIDS.length],
        wished: WISHES[made % WISHES.length],
        streak: true,
      });
      made += 1;
    }
    offset += 1;
  }
  return out;
}
