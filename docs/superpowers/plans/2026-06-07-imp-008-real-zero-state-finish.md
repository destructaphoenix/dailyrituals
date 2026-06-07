# IMP-008 — Real zero-state finish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace four hardcoded fake surfaces (level, calendar heatmap, week strip, entry dates) with values derived from real state through pure, tested helpers.

**Architecture:** Add three pure helper modules (`level.js`, `calendar.js`, plus a new function in the existing `clock.js`), uncap the XP reward, then wire the helpers into RitualsApp/HomeScreen/YouScreen/ArchiveScreen. Screens stay "dumb" — all derivation lives in the tested helpers. Every helper takes its time/data as arguments so tests are deterministic.

**Tech Stack:** React Native (Expo), JavaScript (no TS), Jest + jest-expo. Pure helpers in `src/`, tests in `__tests__/` mirroring the source path.

**Spec:** [`docs/superpowers/specs/2026-06-07-imp-008-real-zero-state-finish-design.md`](../specs/2026-06-07-imp-008-real-zero-state-finish-design.md)

**Lane:** OTA. All changes under `src/` + `__tests__/`. Final commit trailer (added at close-out, not in this plan): `Release-Lane: ota`.

**Baseline:** `npm test` is currently **59 passing**. It must stay green after every task; the count grows as new helper tests are added.

---

### Task 1: Level model helper

**Files:**
- Create: `src/profile/level.js`
- Test: `__tests__/profile/level.test.js`

- [ ] **Step 1: Write the failing test**

Create `__tests__/profile/level.test.js`:

```js
import { levelFromXp } from '../../src/profile/level';

describe('levelFromXp', () => {
  it('starts a fresh user at Lv 1 Waking', () => {
    expect(levelFromXp(0)).toEqual({ level: 1, name: 'Waking', into: 0, toNext: 100 });
  });

  it('reports progress within level 1', () => {
    expect(levelFromXp(99)).toEqual({ level: 1, name: 'Waking', into: 99, toNext: 100 });
  });

  it('crosses into level 2 at exactly 100 XP', () => {
    expect(levelFromXp(100)).toEqual({ level: 2, name: 'Noticing', into: 0, toNext: 150 });
  });

  it('reports progress within level 2', () => {
    expect(levelFromXp(120)).toEqual({ level: 2, name: 'Noticing', into: 20, toNext: 150 });
  });

  it('reaches Contemplative at level 3 (250 XP)', () => {
    expect(levelFromXp(250)).toEqual({ level: 3, name: 'Contemplative', into: 0, toNext: 250 });
  });

  it('caps at Lv 7 Keeper of Days with no next level', () => {
    expect(levelFromXp(1900)).toEqual({ level: 7, name: 'Keeper of Days', into: 0, toNext: null });
  });

  it('keeps counting into XP past the top threshold but stays Lv 7', () => {
    expect(levelFromXp(2500)).toEqual({ level: 7, name: 'Keeper of Days', into: 600, toNext: null });
  });

  it('treats negative XP as 0', () => {
    expect(levelFromXp(-5)).toEqual({ level: 1, name: 'Waking', into: 0, toNext: 100 });
  });

  it('treats undefined XP as 0', () => {
    expect(levelFromXp(undefined)).toEqual({ level: 1, name: 'Waking', into: 0, toNext: 100 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- level`
Expected: FAIL — "Cannot find module '../../src/profile/level'".

- [ ] **Step 3: Write minimal implementation**

Create `src/profile/level.js`:

```js
// Pure XP -> level model. Total XP grows forever (no cap); a level's progress
// bar is `into / toNext` (XP earned within the current level / the level's span).
// At the top level `toNext` is null and the bar reads full / "Max".

const LEVELS = [
  { level: 1, name: 'Waking',         at: 0 },
  { level: 2, name: 'Noticing',       at: 100 },
  { level: 3, name: 'Contemplative',  at: 250 },
  { level: 4, name: 'Reflective',     at: 500 },
  { level: 5, name: 'Steadfast',      at: 850 },
  { level: 6, name: 'Luminous',       at: 1300 },
  { level: 7, name: 'Keeper of Days', at: 1900 },
];

export function levelFromXp(totalXp) {
  const xp = Math.max(0, totalXp || 0);
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].at) i += 1;
  const cur = LEVELS[i];
  const next = LEVELS[i + 1];
  return {
    level: cur.level,
    name: cur.name,
    into: xp - cur.at,
    toNext: next ? next.at - cur.at : null,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- level`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/profile/level.js __tests__/profile/level.test.js
git commit -m "feat(level): pure XP-to-level model (levelFromXp)"
```

---

### Task 2: Uncap the XP reward

**Files:**
- Modify: `src/home/completeEntry.js:30` (the `Math.min(config.XP_MAX, …)` line) and the header comment
- Test: `__tests__/home/completeEntry.test.js` (update the existing cap test + the config object)

- [ ] **Step 1: Update the test to expect uncapped growth**

In `__tests__/home/completeEntry.test.js`, remove `XP_MAX: 500,` from the `config` object (lines 3-8) so it reads:

```js
const config = {
  XP_GAIN: 50,
  EMBER_GAIN: 15,
  milestones: { 7: 'Seven Suns' },
};
```

Then replace the existing test (lines 55-58):

```js
    test('xp is capped at XP_MAX', () => {
      const next = applyCompletion({ ...prev, xp: 480 }, makeEntry(), { config });
      expect(next.xp).toBe(500);
    });
```

with:

```js
    test('xp accumulates uncapped (no XP_MAX ceiling)', () => {
      const next = applyCompletion({ ...prev, xp: 480 }, makeEntry(), { config });
      expect(next.xp).toBe(530);
    });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- completeEntry`
Expected: FAIL — the uncapped test expects 530 but the code still returns `Math.min(500, …)` = 500.

- [ ] **Step 3: Update the implementation**

In `src/home/completeEntry.js`, change line 30 from:

```js
  const xp = Math.min(config.XP_MAX, prev.xp + config.XP_GAIN);
```

to:

```js
  const xp = prev.xp + config.XP_GAIN;
```

And update the header comment (line 10) from:

```js
// `opts`  = { config: { XP_GAIN, EMBER_GAIN, XP_MAX, milestones } }
```

to:

```js
// `opts`  = { config: { XP_GAIN, EMBER_GAIN, milestones } }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- completeEntry`
Expected: PASS (all `applyCompletion` tests, including the new uncapped case).

- [ ] **Step 5: Commit**

```bash
git add src/home/completeEntry.js __tests__/home/completeEntry.test.js
git commit -m "feat(level): uncap the XP reward so XP feeds the level model"
```

---

### Task 3: Calendar + week-strip helpers

**Files:**
- Create: `src/home/calendar.js`
- Test: `__tests__/home/calendar.test.js`

- [ ] **Step 1: Write the failing test**

Create `__tests__/home/calendar.test.js`:

```js
import { buildHeatmap, buildWeekStrip } from '../../src/home/calendar';

// 2026-06-07 is a Sunday; 2026-06-03 is a Wednesday. Use a midday UTC time so
// toISOString().slice(0,10) yields the intended date regardless of test host TZ.
const sun = new Date('2026-06-07T12:00:00Z');
const wed = new Date('2026-06-03T12:00:00Z');

describe('buildHeatmap', () => {
  it('returns 35 cells with today as the last cell', () => {
    const cells = buildHeatmap([], sun);
    expect(cells).toHaveLength(35);
    expect(cells[34].today).toBe(true);
    expect(cells[0].today).toBe(false);
  });

  it('renders no-entry days as quiet empties (no skull, no emoji)', () => {
    const cells = buildHeatmap([], sun);
    expect(cells[0]).toEqual({ dayKey: '2026-05-04', empty: true, today: false });
    expect(cells[34]).toEqual({ dayKey: '2026-06-07', empty: true, today: true });
  });

  it('places an entry on its real date with the mood emoji', () => {
    const cells = buildHeatmap([{ dayKey: '2026-06-01', mood: 'Proud' }], sun);
    const cell = cells.find((c) => c.dayKey === '2026-06-01');
    expect(cell).toEqual({ dayKey: '2026-06-01', mood: 'Proud', emoji: '😌', today: false });
  });

  it('marks today when an entry exists for today', () => {
    const cells = buildHeatmap([{ dayKey: '2026-06-07', mood: 'Tender' }], sun);
    expect(cells[34]).toEqual({ dayKey: '2026-06-07', mood: 'Tender', emoji: '🫶', today: true });
  });

  it('ignores entries outside the 35-day window', () => {
    const cells = buildHeatmap([{ dayKey: '2026-01-01', mood: 'Proud' }], sun);
    expect(cells.every((c) => c.empty)).toBe(true);
  });

  it('keeps the newest entry when two share a dayKey', () => {
    const cells = buildHeatmap(
      [{ dayKey: '2026-06-05', mood: 'Tender' }, { dayKey: '2026-06-05', mood: 'Proud' }],
      sun
    );
    expect(cells.find((c) => c.dayKey === '2026-06-05').mood).toBe('Tender');
  });
});

describe('buildWeekStrip', () => {
  it('labels Monday-first', () => {
    expect(buildWeekStrip([], wed).map((c) => c.l)).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
  });

  it('marks today, future, done and empty states', () => {
    const cells = buildWeekStrip([{ dayKey: '2026-06-02', mood: 'Proud' }], wed);
    expect(cells.map((c) => c.state)).toEqual([
      'empty',   // Mon 06-01, no entry
      'done',    // Tue 06-02, has entry
      'today',   // Wed 06-03
      'future',  // Thu 06-04
      'future',  // Fri 06-05
      'future',  // Sat 06-06
      'future',  // Sun 06-07
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- calendar`
Expected: FAIL — "Cannot find module '../../src/home/calendar'".

- [ ] **Step 3: Write minimal implementation**

Create `src/home/calendar.js`:

```js
// Pure date-grid helpers for the Reflections heatmap and the Today week strip.
// Both derive cells from real `entries` (each carrying a `dayKey` = YYYY-MM-DD,
// produced the same UTC way as todayKey() in RitualsApp) and an injectable
// `today` Date. No-entry days are neutral empties — never skulls.

import { MOOD_EMOJI } from '../data';

const keyOf = (date) => date.toISOString().slice(0, 10);

// Shift a YYYY-MM-DD key by whole days in UTC (timezone-independent).
function shiftKey(key, deltaDays) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + deltaDays)).toISOString().slice(0, 10);
}

// 0 = Monday .. 6 = Sunday for a YYYY-MM-DD key.
function weekdayMon0(key) {
  const [y, m, d] = key.split('-').map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

// Index entries by dayKey; newest (first in the array) wins on a collision.
function indexByDay(entries) {
  const map = {};
  for (const e of entries || []) {
    if (e && e.dayKey && !(e.dayKey in map)) map[e.dayKey] = e;
  }
  return map;
}

// 35 cells (5 rows x 7), ending today (today = index 34).
export function buildHeatmap(entries, today = new Date()) {
  const byDay = indexByDay(entries);
  const todayK = keyOf(today);
  const cells = [];
  for (let i = 34; i >= 0; i -= 1) {
    const dayKey = shiftKey(todayK, -i);
    const isToday = dayKey === todayK;
    const entry = byDay[dayKey];
    if (entry) {
      cells.push({ dayKey, mood: entry.mood, emoji: MOOD_EMOJI[entry.mood] || '', today: isToday });
    } else {
      cells.push({ dayKey, empty: true, today: isToday });
    }
  }
  return cells;
}

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// 7 cells, Monday-first, for the calendar week containing today.
export function buildWeekStrip(entries, today = new Date()) {
  const byDay = indexByDay(entries);
  const todayK = keyOf(today);
  const mondayK = shiftKey(todayK, -weekdayMon0(todayK));
  const cells = [];
  for (let i = 0; i < 7; i += 1) {
    const dayKey = shiftKey(mondayK, i);
    let state;
    if (dayKey === todayK) state = 'today';
    else if (dayKey > todayK) state = 'future';
    else state = byDay[dayKey] ? 'done' : 'empty';
    cells.push({ l: WEEK_LABELS[i], state });
  }
  return cells;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- calendar`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/home/calendar.js __tests__/home/calendar.test.js
git commit -m "feat(calendar): pure heatmap + week-strip helpers from real entries"
```

---

### Task 4: Real entry dates (`entryDateParts`)

**Files:**
- Modify: `src/time/clock.js` (add `MONTHS_ABBR` + `entryDateParts`)
- Test: `__tests__/time/clock.test.js` (add a describe block)

- [ ] **Step 1: Write the failing test**

Append to `__tests__/time/clock.test.js`:

```js
import { entryDateParts } from '../../src/time/clock';

describe('entryDateParts', () => {
  it('returns day, 3-letter month and full weekday', () => {
    expect(entryDateParts(new Date(2026, 5, 7))).toEqual({ day: '7', mon: 'Jun', wd: 'Sunday' });
  });
  it('handles a two-digit day and end of month', () => {
    expect(entryDateParts(new Date(2026, 4, 31))).toEqual({ day: '31', mon: 'May', wd: 'Sunday' });
  });
});
```

(The existing `import { greetingFor, todayLabel } …` line at the top stays; this adds a second import line, which Jest allows.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- clock`
Expected: FAIL — `entryDateParts is not a function` (not yet exported).

- [ ] **Step 3: Write minimal implementation**

In `src/time/clock.js`, add a `MONTHS_ABBR` array after the existing `MONTHS` array (line 2) and export `entryDateParts` at the end of the file:

```js
const MONTHS_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function entryDateParts(date = new Date()) {
  return {
    day: String(date.getDate()),
    mon: MONTHS_ABBR[date.getMonth()],
    wd: WEEKDAYS[date.getDay()],
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- clock`
Expected: PASS (existing `greetingFor`/`todayLabel` tests + 2 new `entryDateParts` tests).

- [ ] **Step 5: Commit**

```bash
git add src/time/clock.js __tests__/time/clock.test.js
git commit -m "feat(clock): entryDateParts for real per-entry display dates"
```

---

### Task 5: Wire the level model into RitualsApp + the two screens

**Files:**
- Modify: `src/RitualsApp.js` (imports, remove hardcodes, derive level, pass props, build entry, drop XP_MAX from config)
- Modify: `src/screens/HomeScreen.js` (level label + bar)
- Modify: `src/screens/YouScreen.js` (level label + bar)

This task is UI wiring; it is verified by `npm test` staying green plus the runtime walk in Task 8. No new unit tests.

- [ ] **Step 1: Update RitualsApp imports and remove hardcoded constants**

In `src/RitualsApp.js`, add these imports next to the existing helper imports (after line 36):

```js
import { levelFromXp } from './profile/level';
import { entryDateParts } from './time/clock';
```

Then delete these three lines (40-41 and 39):

```js
const XP_MAX = 500;
const LEVEL = 3;
const LEVEL_NAME = 'Contemplative';
```

(Keep `const XP_GAIN = 50;`.)

- [ ] **Step 2: Derive the live level**

In `src/RitualsApp.js`, add this right after the `gamify` line (currently line 52, `const gamify = settings.gamify !== false;`):

```js
  const { level, name: levelName, into: xpInto, toNext: xpToNext } = levelFromXp(xp);
```

- [ ] **Step 3: Build the entry with real dates and drop XP_MAX from the reward config**

In `src/RitualsApp.js` `complete()`, replace the entry line (currently line 212):

```js
    const entry = { id: 'new' + Date.now(), day: '31', mon: 'May', wd: 'Saturday', dayKey: todayKey(), mood, did, wished, streak: true };
```

with:

```js
    const entry = { id: 'new' + Date.now(), ...entryDateParts(), dayKey: todayKey(), mood, did, wished, streak: true };
```

And in the same function replace the config (currently line 216):

```js
      { config: { XP_GAIN, EMBER_GAIN, XP_MAX, milestones: STREAK_MILESTONES } }
```

with:

```js
      { config: { XP_GAIN, EMBER_GAIN, milestones: STREAK_MILESTONES } }
```

- [ ] **Step 4: Pass the new props to YouScreen and HomeScreen**

In `src/RitualsApp.js` YouScreen JSX, replace (currently line 239):

```js
            streak={streak} xp={xp} xpMax={XP_MAX} level={LEVEL} levelName={LEVEL_NAME}
```

with:

```js
            streak={streak} level={level} levelName={levelName} xpInto={xpInto} xpToNext={xpToNext}
```

In the HomeScreen JSX, replace (currently line 253):

```js
            streak={streak} xp={xp} xpMax={XP_MAX} level={LEVEL} levelName={LEVEL_NAME}
```

with:

```js
            streak={streak} level={level} levelName={levelName} xpInto={xpInto} xpToNext={xpToNext} entries={entries}
```

- [ ] **Step 5: Update HomeScreen to render the level + within-level bar**

In `src/screens/HomeScreen.js`, change the component signature (line 15) from:

```js
export default function HomeScreen({ copy, gamify, mode, streak, xp, xpMax, level, levelName, quests, freezes, onOpenAchievements, done, onWrite, onToggleMode, embers, plus, onOpenShop }) {
```

to:

```js
export default function HomeScreen({ copy, gamify, mode, streak, level, levelName, xpInto, xpToNext, entries, quests, freezes, onOpenAchievements, done, onWrite, onToggleMode, embers, plus, onOpenShop }) {
```

Then replace the level/XP block (lines 57-61) from:

```js
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 7 }}>
                <T d w={700} color={c.ink} style={{ fontSize: 14 }}>Lv {level} · {levelName}</T>
                <T w={700} color={c.muted} style={{ fontSize: 12 }}>{xp} / {xpMax} XP</T>
              </View>
              <ProgressBar value={Math.min(100, (xp / xpMax) * 100)} />
```

to:

```js
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 7 }}>
                <T d w={700} color={c.ink} style={{ fontSize: 14 }}>Lv {level} · {levelName}</T>
                <T w={700} color={c.muted} style={{ fontSize: 12 }}>{xpToNext == null ? 'Max' : `${xpInto} / ${xpToNext} XP`}</T>
              </View>
              <ProgressBar value={xpToNext == null ? 100 : Math.min(100, (xpInto / xpToNext) * 100)} />
```

- [ ] **Step 6: Update YouScreen to render the level + within-level bar**

In `src/screens/YouScreen.js`, change the destructured props (lines 12-16) from:

```js
export default function YouScreen({
  mode, onToggleMode, settings, setSettings,
  streak, xp, xpMax, level, levelName, entriesCount, badgesEarned, onOpenAchievements,
  embers, plus, onOpenShop, onOpenPaywall, onOpenManage, plusEnabled = true,
}) {
```

to:

```js
export default function YouScreen({
  mode, onToggleMode, settings, setSettings,
  streak, level, levelName, xpInto, xpToNext, entriesCount, badgesEarned, onOpenAchievements,
  embers, plus, onOpenShop, onOpenPaywall, onOpenManage, plusEnabled = true,
}) {
```

Then replace the XP progress block (lines 46-52) from:

```js
          <View style={{ marginTop: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }}>
              <T w={700} color={c.muted} style={{ fontSize: 12 }}>Next level</T>
              <T w={700} color={c.muted} style={{ fontSize: 12 }}>{xp} / {xpMax} XP</T>
            </View>
            <ProgressBar value={Math.min(100, (xp / xpMax) * 100)} />
          </View>
```

to:

```js
          <View style={{ marginTop: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }}>
              <T w={700} color={c.muted} style={{ fontSize: 12 }}>Next level</T>
              <T w={700} color={c.muted} style={{ fontSize: 12 }}>{xpToNext == null ? 'Max' : `${xpInto} / ${xpToNext} XP`}</T>
            </View>
            <ProgressBar value={xpToNext == null ? 100 : Math.min(100, (xpInto / xpToNext) * 100)} />
          </View>
```

- [ ] **Step 7: Run the full suite**

Run: `npm test`
Expected: PASS, green (count unchanged from Task 4 — this task adds no tests).

- [ ] **Step 8: Commit**

```bash
git add src/RitualsApp.js src/screens/HomeScreen.js src/screens/YouScreen.js
git commit -m "feat(level): derive Lv/name/progress from XP across Today + You; real entry dates"
```

---

### Task 6: Wire the heatmap into ArchiveScreen (neutral empties)

**Files:**
- Modify: `src/screens/ArchiveScreen.js` (compute heatmap from entries, drop the per-empty 💀, accept `cells` in `Heat`)

This task is UI wiring; verified by `npm test` green + the Task 8 runtime walk.

- [ ] **Step 1: Swap the HEAT import for the helper**

In `src/screens/ArchiveScreen.js`, replace the two import lines (lines 7-8):

```js
import { moodEmoji } from '../data';
import { HEAT } from '../data';
```

with:

```js
import { moodEmoji } from '../data';
import { buildHeatmap } from '../home/calendar';
```

- [ ] **Step 2: Compute the heatmap and pass it to `Heat`**

In `src/screens/ArchiveScreen.js`, inside the component body after `const c = t.colors;` (line 12), add:

```js
  const heat = buildHeatmap(entries);
```

Then change the `<Heat />` usage (line 32) to:

```js
            <Heat cells={heat} />
```

- [ ] **Step 3: Make `Heat` consume the prop and render neutral empties**

In `src/screens/ArchiveScreen.js`, change the `Heat` function signature (line 65) from:

```js
function Heat() {
```

to:

```js
function Heat({ cells }) {
```

Then change the row-building line (line 69) from:

```js
  for (let r = 0; r < HEAT.length; r += 7) rows.push(HEAT.slice(r, r + 7));
```

to:

```js
  for (let r = 0; r < cells.length; r += 7) rows.push(cells.slice(r, r + 7));
```

Then replace the cell-content block (lines 89-91) from:

```js
              {!cell.empty
                ? <Text style={{ fontSize: 19, lineHeight: 23 }}>{cell.emoji}</Text>
                : <Text style={{ fontSize: 17, lineHeight: 21, opacity: 0.5 }}>💀</Text>}
```

with:

```js
              {!cell.empty
                ? <Text style={{ fontSize: 19, lineHeight: 23 }}>{cell.emoji}</Text>
                : null}
```

(The existing cell `style` already renders empties as a dashed transparent box, so empty cells now show as quiet dashed squares with nothing inside.)

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: PASS, green (unchanged count).

- [ ] **Step 5: Commit**

```bash
git add src/screens/ArchiveScreen.js
git commit -m "feat(calendar): drive the Reflections heatmap from real entries, neutral empties"
```

---

### Task 7: Wire the real week strip into HomeScreen

**Files:**
- Modify: `src/screens/HomeScreen.js` (import `buildWeekStrip`, compute from `entries`, render it, drop the dead `miss` skull branch and the `WEEK` import)

This task is UI wiring; verified by `npm test` green + the Task 8 runtime walk.

- [ ] **Step 1: Swap the WEEK import for the helper**

In `src/screens/HomeScreen.js`, change the data import (line 9) from:

```js
import { WEEK, BADGES, SAMPLE_ENTRIES } from '../data';
```

to:

```js
import { BADGES, SAMPLE_ENTRIES } from '../data';
```

And update the calendar import (line 11 — the `streakSubtitle` import is on its own line, the `buildWeekStrip` import is new) by adding after the `streakSubtitle` import:

```js
import { buildWeekStrip } from '../home/calendar';
```

- [ ] **Step 2: Compute the week strip from real entries**

In `src/screens/HomeScreen.js`, after `const greeting = greetingFor();` (line 19), add:

```js
  const week = buildWeekStrip(entries || []);
```

- [ ] **Step 3: Render the computed strip and drop the dead skull branch**

In `src/screens/HomeScreen.js`, change the week-strip map (line 80) from:

```js
              {WEEK.map((d, i) => {
```

to:

```js
              {week.map((d, i) => {
```

Then remove the now-dead miss/skull line (line 88):

```js
                      {d.state === 'miss' && <Text style={{ fontSize: 17, lineHeight: 21 }}>💀</Text>}
```

(Delete that one line entirely. `buildWeekStrip` never returns `'miss'`; `'empty'` past days fall through `Dot` to the neutral default style — no skull.)

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: PASS, green (unchanged count).

- [ ] **Step 5: Commit**

```bash
git add src/screens/HomeScreen.js
git commit -m "feat(home): drive the week strip from real entries (no fake skull)"
```

---

### Task 8: Remove dead consts, full verification

**Files:**
- Modify: `src/data.js` (remove the now-unused `HEAT` and `WEEK` exports)

- [ ] **Step 1: Confirm `HEAT` and `WEEK` have no remaining consumers**

Run:

```bash
git grep -n "\bHEAT\b" -- src
git grep -n "\bWEEK\b" -- src
```

Expected: the only matches are the definitions in `src/data.js`. (`WEEKDAYS`, `WEEK_LABELS` won't match — `\b` requires a non-word boundary. If anything else references `HEAT`/`WEEK`, stop and re-check Tasks 6/7.)

- [ ] **Step 2: Delete the dead exports**

In `src/data.js`, delete the `WEEK` export (the block beginning `export const WEEK = [` and its closing `];`, currently lines 60-64) and the `HEAT` export (the IIFE block beginning `export const HEAT = (() => {` through its closing `})();`, currently lines 127-136). Leave the explanatory comments above them only if they no longer reference removed code; otherwise delete those comment lines too (the `// week strip — …` comment above `WEEK` and the `// 35-cell calendar …` comment above `HEAT`).

- [ ] **Step 3: Run the full suite**

Run: `npm test`
Expected: PASS, green. Total ≈ 78 (59 baseline + 9 level + 8 calendar + 2 entryDateParts; completeEntry count unchanged — one test was edited, not added).

- [ ] **Step 4: Commit**

```bash
git add src/data.js
git commit -m "refactor(data): remove dead HEAT and WEEK demo constants"
```

- [ ] **Step 5: Runtime walk (owner manual — no device in session)**

Confirm in Expo Go / a build:
- Fresh user (0 XP, no entries): Today + You show **Lv 1 · Waking**, bar near empty; Reflections heatmap is all quiet dashed squares (no skulls); week strip has no fake checks/skulls.
- Write one entry today: streak → 1, XP → 50, level still Lv 1 (50/100), today's heatmap cell + week-strip cell show the mood / done state; the entry in Reflections shows **today's real date** (e.g. "7 Jun · Sunday").
- Keep writing across days: level advances through the table; at ≥1900 XP the bar reads "Max."

---

## Self-Review

**Spec coverage:**
- Level model (XP-threshold, uncapped, names/thresholds) → Tasks 1, 2, 5. ✅
- Calendar heatmap from real entries, neutral empties → Tasks 3, 6. ✅
- Week strip from real entries → Tasks 3, 7. ✅
- Entry dates from real date → Tasks 4, 5 (step 3). ✅
- Dead-const cleanup (HEAT/WEEK) → Task 8. ✅
- No migration needed (entries already emptied by IMP-004) → noted in spec; nothing to build. ✅
- Non-goals (achievements, cosmetics) → untouched. ✅

**Placeholder scan:** No TBD/TODO; every code step shows full code; every command shows expected output. ✅

**Type/name consistency:** `levelFromXp` returns `{ level, name, into, toNext }`. RitualsApp maps `name→levelName`, `into→xpInto`, `toNext→xpToNext` and passes those exact prop names to both screens; both screens destructure `level, levelName, xpInto, xpToNext` and use the `xpToNext == null ? 'Max' …` form identically. `buildHeatmap`/`buildWeekStrip` names match between `calendar.js`, its test, ArchiveScreen, and HomeScreen. `entryDateParts` returns `{ day, mon, wd }` matching the entry shape ArchiveScreen renders. ✅
