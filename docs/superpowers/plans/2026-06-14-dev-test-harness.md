# Dev Test Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `__DEV__`-only in-app panel that seeds the running app with any test state (streaks, entries of varied input types, broken streaks, Plus, owned cosmetics, done/not-done) in one tap, provably absent from any shipped build.

**Architecture:** Three pure modules under `src/dev/` build a complete persisted state slice; a dev-only `DevPanel` modal feeds that slice into the **existing** `onReplaceAllData(slice)` path in `App.js` (same plumbing as a Backup Restore), which saves it and remounts the app. The panel is reached by long-pressing the "About Daily Rituals" row on the You tab. All dev code is guarded by the literal `__DEV__` so Metro's dead-code elimination strips the entire `src/dev/` subtree from release bundles; a sentinel-grep verification proves it.

**Tech Stack:** React Native / Expo (`jest-expo` preset for tests). No new dependencies, no native modules.

---

## Leak-proofing note (read before coding)

- **Guard with the literal `__DEV__`, never an alias.** Babel's constant-folding only recognizes the literal identifier `__DEV__`. Aliasing it (e.g. `const DEV_TOOLS = __DEV__`) defeats dead-code elimination, so the guarded `require` would NOT be stripped. Every guard site uses `__DEV__` directly. (This refines the spec, which floated a `DEV_TOOLS` gate file — we drop it for correctness.)
- **Lazy `require`, not static `import`,** for `DevPanel` — so the whole subtree is dropped when `__DEV__` is false.
- **Sentinel:** `DevPanel.js` defines `const SENTINEL = 'DEV_HARNESS_SENTINEL_DO_NOT_SHIP'` and uses it as a `testID`. The final task exports a production bundle and greps for it — must be **zero matches**.

---

## File Structure

**New (committed — not gitignored):**
- `src/dev/generateEntries.js` — pure: build arrays of real-shaped entries, with gaps.
- `src/dev/buildState.js` — pure: assemble a full persisted slice from knob values.
- `src/dev/scenarios.js` — pure: named knob-set presets + lookup.
- `src/dev/DevPanel.js` — `__DEV__`-only modal UI (scenarios + knobs + Apply/Reset).
- `__tests__/dev/generateEntries.test.js`
- `__tests__/dev/buildState.test.js`
- `__tests__/dev/scenarios.test.js`

**Modified (guarded — inert in release):**
- `src/screens/YouScreen.js` — add `onOpenDev` prop; `onLongPress` on the About row; thread `onLongPress` through the local `Row` component.
- `src/RitualsApp.js` — lazy-require `DevPanel`; `showDev` state; render the dev Modal; pass `onOpenDev` to `YouScreen`; wire Apply→`onReplaceAllData`, Reset→`onResetData`.

---

## Task 1: generateEntries (pure entry generator)

**Files:**
- Create: `src/dev/generateEntries.js`
- Test: `__tests__/dev/generateEntries.test.js`

- [ ] **Step 1: Write the failing test**

```js
// __tests__/dev/generateEntries.test.js
import { buildEntries, shiftDayKey } from '../../src/dev/generateEntries';
import { MOODS } from '../../src/data';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

describe('shiftDayKey', () => {
  test('subtracts days across a month boundary', () => {
    expect(shiftDayKey('2026-06-01', -1)).toBe('2026-05-31');
    expect(shiftDayKey('2026-06-14', -3)).toBe('2026-06-11');
  });
});

describe('buildEntries', () => {
  test('returns `count` entries, newest-first, ending at endDayKey', () => {
    const e = buildEntries({ count: 3, endDayKey: '2026-06-14', gaps: [] });
    expect(e.map((x) => x.dayKey)).toEqual(['2026-06-14', '2026-06-13', '2026-06-12']);
  });

  test('each entry has the real entry shape', () => {
    const [first] = buildEntries({ count: 1, endDayKey: '2026-06-14' });
    expect(first).toEqual(expect.objectContaining({
      dayKey: '2026-06-14', day: '14', mon: 'Jun', wd: 'Sunday',
      streak: true,
    }));
    expect(typeof first.id).toBe('string');
    expect(typeof first.did).toBe('string');
    expect(typeof first.wished).toBe('string');
    expect(MOODS).toContain(first.mood);
    expect(WEEKDAYS).toContain(first.wd);
  });

  test('gaps create missing days (skull days)', () => {
    const e = buildEntries({ count: 3, endDayKey: '2026-06-14', gaps: [1] });
    expect(e.map((x) => x.dayKey)).toEqual(['2026-06-14', '2026-06-12', '2026-06-11']);
  });

  test('moods cycle through MOODS', () => {
    const e = buildEntries({ count: MOODS.length + 1, endDayKey: '2026-06-14' });
    expect(e[0].mood).toBe(MOODS[0]);
    expect(e[MOODS.length].mood).toBe(MOODS[0]); // wraps
  });

  test('returns [] for count 0', () => {
    expect(buildEntries({ count: 0, endDayKey: '2026-06-14' })).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/dev/generateEntries.test.js`
Expected: FAIL — "Cannot find module '../../src/dev/generateEntries'".

- [ ] **Step 3: Write minimal implementation**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/dev/generateEntries.test.js`
Expected: PASS (all 6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/dev/generateEntries.js __tests__/dev/generateEntries.test.js
git commit -m "feat(dev): pure test-entry generator (real shape, gaps, mood cycle)"
```

---

## Task 2: buildState (knobs → full persisted slice)

**Files:**
- Create: `src/dev/buildState.js`
- Test: `__tests__/dev/buildState.test.js`

- [ ] **Step 1: Write the failing test**

```js
// __tests__/dev/buildState.test.js
import { buildState } from '../../src/dev/buildState';
import { PERSISTED_KEYS } from '../../src/persistence/state';
import { SHOP_PALETTES, SHOP_SKIES } from '../../src/data';

const TODAY = '2026-06-14';

test('done=true: streak/xp/entries wired, ends today, quests completed', () => {
  const s = buildState({ streak: 3, entryCount: 3, done: true }, TODAY);
  expect(s.streak).toBe(3);
  expect(s.xp).toBe(150); // 3 * 50
  expect(s.done).toBe(true);
  expect(s.entries).toHaveLength(3);
  expect(s.entries[0].dayKey).toBe(TODAY);
  expect(s.onboarded).toBe(true);
  const write = s.quests.find((q) => q.id === 'write');
  expect(write.cur).toBe(write.goal);
});

test('done=false: entries end yesterday and quests are not pre-completed', () => {
  const s = buildState({ streak: 4, entryCount: 4, done: false }, TODAY);
  expect(s.done).toBe(false);
  expect(s.entries[0].dayKey).toBe('2026-06-13');
  const write = s.quests.find((q) => q.id === 'write');
  expect(write.cur).not.toBe(write.goal);
});

test('explicit xp overrides the derived value', () => {
  expect(buildState({ streak: 80, xp: 9999 }, TODAY).xp).toBe(9999);
});

test('plus sets plus + activePlan; ownAll owns every cosmetic', () => {
  const s = buildState({ plus: true, ownAll: true }, TODAY);
  expect(s.plus).toBe(true);
  expect(s.activePlan).toBe('yearly');
  expect(s.ownedPalettes).toHaveLength(SHOP_PALETTES.length);
  expect(s.ownedSkies).toHaveLength(SHOP_SKIES.length);
});

test('palette/sky knobs select the active cosmetic and are owned', () => {
  const s = buildState({ palette: 'marigold', sky: 'harvest' }, TODAY);
  expect(s.activePalette).toBe('marigold');
  expect(s.ownedPalettes).toContain('marigold');
  expect(s.activeSky).toBe('harvest');
  expect(s.ownedSkies).toContain('harvest');
});

test('every output key is a persisted key', () => {
  const s = buildState({ streak: 2, entryCount: 2 }, TODAY);
  for (const k of Object.keys(s)) expect(PERSISTED_KEYS).toContain(k);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/dev/buildState.test.js`
Expected: FAIL — "Cannot find module '../../src/dev/buildState'".

- [ ] **Step 3: Write minimal implementation**

```js
// src/dev/buildState.js
// Pure: turn a set of knob values into a complete persisted state slice that the
// existing App.js restore path (onReplaceAllData) can load. Output keys are a
// subset of PERSISTED_KEYS so it round-trips through the real serializer.
import { buildEntries, shiftDayKey } from './generateEntries';
import { DAILY_QUESTS, SHOP_PALETTES, SHOP_SKIES } from '../data';
import { DEFAULT_SETTINGS } from '../theme';

const XP_PER_DAY = 50; // mirrors XP_GAIN in RitualsApp.js

const uniq = (arr) => [...new Set(arr)];

export function buildState(knobs = {}, today) {
  const {
    streak = 0,
    entryCount = streak,
    gaps = [],
    done = true,
    plus = false,
    embers = 0,
    xp,
    palette = 'goldenhour',
    sky = 'classic',
    ownAll = false,
    tone = 'gentle',
    gamify = true,
    freezes = 0,
  } = knobs;

  const endDayKey = done ? today : shiftDayKey(today, -1);
  const entries = entryCount > 0 ? buildEntries({ count: entryCount, endDayKey, gaps }) : [];

  const resolvedXp = xp != null ? xp : streak * XP_PER_DAY;

  const ownedPalettes = ownAll
    ? SHOP_PALETTES.map((p) => p.id)
    : uniq(['goldenhour', palette]);
  const ownedSkies = ownAll
    ? SHOP_SKIES.map((s) => s.id)
    : uniq(['classic', 'crescent', sky]);

  const quests = DAILY_QUESTS.map((q) =>
    done && (q.id === 'write' || q.id === 'feel') ? { ...q, cur: q.goal } : q
  );

  return {
    onboarded: true,
    entries,
    streak,
    xp: resolvedXp,
    done,
    quests,
    freezes,
    embers,
    plus,
    activePalette: palette,
    ownedPalettes,
    activeSky: sky,
    ownedSkies,
    activePlan: plus ? 'yearly' : null,
    lastActiveDay: today,
    settings: { ...DEFAULT_SETTINGS, tone, gamify },
    promptDeck: [],
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/dev/buildState.test.js`
Expected: PASS (all 6 tests). If "every output key is a persisted key" fails, a returned key is not in `PERSISTED_KEYS` — remove it.

- [ ] **Step 5: Commit**

```bash
git add src/dev/buildState.js __tests__/dev/buildState.test.js
git commit -m "feat(dev): buildState — knobs to a full persisted slice"
```

---

## Task 3: scenarios (named presets)

**Files:**
- Create: `src/dev/scenarios.js`
- Test: `__tests__/dev/scenarios.test.js`

> Note: a genuine brand-new first-run user is the panel's **Reset to fresh** button (it calls the app's real reset). `scenarios.js` therefore covers the seven non-trivial states; `emptyInsights` is the "returning user, zero entries" zero-state.

- [ ] **Step 1: Write the failing test**

```js
// __tests__/dev/scenarios.test.js
import { SCENARIOS_LIST, buildScenario } from '../../src/dev/scenarios';
import { PERSISTED_KEYS } from '../../src/persistence/state';
import { serialize, deserialize, pickPersisted } from '../../src/persistence/state';
import { longestConsecutiveRun } from '../../src/insights/dateKeys';
import { SHOP_PALETTES } from '../../src/data';

const TODAY = '2026-06-14';

test('exposes a non-empty list, each with key/label/knobs', () => {
  expect(SCENARIOS_LIST.length).toBeGreaterThanOrEqual(7);
  for (const s of SCENARIOS_LIST) {
    expect(typeof s.key).toBe('string');
    expect(typeof s.label).toBe('string');
    expect(typeof s.knobs).toBe('object');
  }
});

test('every scenario round-trips as a legal persisted state', () => {
  for (const { key } of SCENARIOS_LIST) {
    const slice = buildScenario(key, TODAY);
    const back = deserialize(serialize(pickPersisted(slice)));
    expect(back.entries).toHaveLength(slice.entries.length);
    for (const k of Object.keys(slice)) expect(PERSISTED_KEYS).toContain(k);
  }
});

test('brokenStreak has a gap (not all entries consecutive)', () => {
  const s = buildScenario('brokenStreak', TODAY);
  const keys = s.entries.map((e) => e.dayKey);
  expect(longestConsecutiveRun(keys)).toBeLessThan(keys.length);
});

test('plusUser is Plus and owns every palette', () => {
  const s = buildScenario('plusUser', TODAY);
  expect(s.plus).toBe(true);
  expect(s.ownedPalettes).toHaveLength(SHOP_PALETTES.length);
});

test('emptyInsights has zero entries', () => {
  expect(buildScenario('emptyInsights', TODAY).entries).toHaveLength(0);
});

test('unknown scenario throws', () => {
  expect(() => buildScenario('nope', TODAY)).toThrow(/unknown scenario/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/dev/scenarios.test.js`
Expected: FAIL — "Cannot find module '../../src/dev/scenarios'".

- [ ] **Step 3: Write minimal implementation**

```js
// src/dev/scenarios.js
// Named knob-set presets for the dev harness. Each is fed to buildState.
import { buildState } from './buildState';

export const SCENARIOS_LIST = [
  { key: 'shortStreak',  label: '3-day streak (done today)', knobs: { streak: 3, entryCount: 3, done: true } },
  { key: 'notDoneToday', label: 'Not done today',           knobs: { streak: 4, entryCount: 4, done: false } },
  { key: 'longLegacy',   label: 'Long legacy (80 days)',    knobs: { streak: 80, entryCount: 80, done: true, embers: 1200 } },
  { key: 'brokenStreak', label: 'Broken streak (skulls)',   knobs: { streak: 2, entryCount: 6, gaps: [2, 5], done: true } },
  { key: 'plusUser',     label: 'Plus user',                knobs: { streak: 10, entryCount: 10, done: true, plus: true, ownAll: true, embers: 500 } },
  { key: 'fullShop',     label: 'Full shop (all owned)',    knobs: { streak: 20, entryCount: 20, done: true, ownAll: true, embers: 5000 } },
  { key: 'emptyInsights', label: 'Empty (zero entries)',    knobs: { streak: 0, entryCount: 0, done: false } },
];

export function buildScenario(key, today) {
  const s = SCENARIOS_LIST.find((x) => x.key === key);
  if (!s) throw new Error(`unknown scenario: ${key}`);
  return buildState(s.knobs, today);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/dev/scenarios.test.js`
Expected: PASS (all 6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/dev/scenarios.js __tests__/dev/scenarios.test.js
git commit -m "feat(dev): named scenario presets + lookup"
```

---

## Task 4: DevPanel UI (dev-only modal)

**Files:**
- Create: `src/dev/DevPanel.js`

> No unit test — this is dev-only UI chrome. It is exercised manually. The pure cores it calls are already covered. Adding it must keep `npm test` green.

- [ ] **Step 1: Write the component**

```js
// src/dev/DevPanel.js
// DEV-ONLY. Reached only via a __DEV__-guarded require in RitualsApp, so this
// whole file (and its imports) is stripped from release bundles. SENTINEL is the
// marker the verification step greps for — it must be ABSENT from prod bundles.
import React, { useState } from 'react';
import { View, ScrollView, Pressable, Switch, Text } from 'react-native';
import { useTheme } from '../theme';
import { T } from '../ui';
import { buildState } from './buildState';
import { SCENARIOS_LIST } from './scenarios';

const SENTINEL = 'DEV_HARNESS_SENTINEL_DO_NOT_SHIP';

const todayKey = () => new Date().toISOString().slice(0, 10);

const DEFAULT_KNOBS = {
  streak: 3, entryCount: 3, gaps: [], done: true, plus: false,
  embers: 0, palette: 'goldenhour', sky: 'classic', ownAll: false,
  tone: 'gentle', gamify: true, freezes: 0,
};

function Stepper({ label, value, onChange, step = 1 }) {
  const c = useTheme().colors;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
      <T w={700} color={c.ink} style={{ fontSize: 15 }}>{label}</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={() => onChange(Math.max(0, value - step))} hitSlop={10}>
          <T w={800} color={c.accentDeep} style={{ fontSize: 22 }}>−</T>
        </Pressable>
        <T w={700} color={c.ink} style={{ fontSize: 15, minWidth: 44, textAlign: 'center' }}>{value}</T>
        <Pressable onPress={() => onChange(value + step)} hitSlop={10}>
          <T w={800} color={c.accentDeep} style={{ fontSize: 22 }}>+</T>
        </Pressable>
      </View>
    </View>
  );
}

function Toggle({ label, value, onChange }) {
  const c = useTheme().colors;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
      <T w={700} color={c.ink} style={{ fontSize: 15 }}>{label}</T>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

export default function DevPanel({ onLoadState, onResetFresh, onClose }) {
  const c = useTheme().colors;
  const [knobs, setKnobs] = useState(DEFAULT_KNOBS);
  const set = (patch) => setKnobs((k) => ({ ...k, ...patch }));

  return (
    <View testID={SENTINEL} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <T d w={800} color={c.ink} style={{ fontSize: 22 }}>Dev Harness</T>
        <Pressable onPress={onClose} hitSlop={12}><T w={800} color={c.accentDeep} style={{ fontSize: 16 }}>Close</T></Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <T w={800} color={c.muted} style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>Scenarios</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {SCENARIOS_LIST.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => set({ ...DEFAULT_KNOBS, ...s.knobs })}
              style={{ backgroundColor: c.accentSoft, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }}
            >
              <T w={700} color={c.accentDeep} style={{ fontSize: 13 }}>{s.label}</T>
            </Pressable>
          ))}
        </View>

        <T w={800} color={c.muted} style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Knobs</T>
        <Stepper label="Streak" value={knobs.streak} onChange={(v) => set({ streak: v })} />
        <Stepper label="Entries" value={knobs.entryCount} onChange={(v) => set({ entryCount: v })} />
        <Stepper label="Embers" value={knobs.embers} step={50} onChange={(v) => set({ embers: v })} />
        <Stepper label="XP (0 = derive)" value={knobs.xp ?? 0} step={50} onChange={(v) => set({ xp: v === 0 ? undefined : v })} />
        <Stepper label="Freezes" value={knobs.freezes} onChange={(v) => set({ freezes: v })} />
        <Toggle label="Done today" value={knobs.done} onChange={(v) => set({ done: v })} />
        <Toggle label="Plus" value={knobs.plus} onChange={(v) => set({ plus: v })} />
        <Toggle label="Gamify" value={knobs.gamify} onChange={(v) => set({ gamify: v })} />
        <Toggle label="Own all cosmetics" value={knobs.ownAll} onChange={(v) => set({ ownAll: v })} />

        <Pressable
          onPress={() => onLoadState(buildState(knobs, todayKey()))}
          style={{ backgroundColor: c.accentDeep, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 24 }}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Apply</Text>
        </Pressable>

        <Pressable onPress={onResetFresh} style={{ paddingVertical: 14, alignItems: 'center', marginTop: 8 }}>
          <T w={700} color={c.red} style={{ fontSize: 15 }}>Reset to fresh</T>
        </Pressable>
      </ScrollView>
    </View>
  );
}
```

- [ ] **Step 2: Verify the suite still passes**

Run: `npm test`
Expected: PASS — same suite count as before plus the 3 new dev suites; no new failures.

- [ ] **Step 3: Commit**

```bash
git add src/dev/DevPanel.js
git commit -m "feat(dev): DevPanel modal — scenarios + knobs + apply/reset (dev-only)"
```

---

## Task 5: Wire the long-press entry point on the You tab

**Files:**
- Modify: `src/screens/YouScreen.js`

- [ ] **Step 1: Add `onOpenDev` to the props**

In `src/screens/YouScreen.js`, the component signature (around line 13–18) — add `onOpenDev` to the destructured props:

```js
export default function YouScreen({
  mode, onToggleMode, settings, setSettings,
  streak, level, levelName, xpInto, xpToNext, entriesCount, badgesEarned, onOpenAchievements,
  embers, plus, onOpenShop, onOpenPaywall, onOpenManage, plusEnabled = true, onResetData,
  lastBackupAt, onExportData, onImportData, onExplainAutoBackup, onOpenDev,
}) {
```

- [ ] **Step 2: Thread `onLongPress` through the local `Row` component**

The `Row` function (around line 177) currently is `function Row({ icon, label, labelColor, value, right, onPress }) {` and its `Pressable` (around line 181) has only `onPress`. Add `onLongPress`:

```js
function Row({ icon, label, labelColor, value, right, onPress, onLongPress }) {
```

and on its `<Pressable>`:

```js
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={!onPress && !onLongPress}
```

- [ ] **Step 3: Long-press the About row to open the dev panel**

The "About Daily Rituals" `Row` (around line 162–163) — add `onLongPress`:

```js
          <Row icon={<Info size={20} color={c.accentDeep} />} label="About Daily Rituals"
            value="v1.0" onPress={() => {}} onLongPress={onOpenDev} />
```

(`onOpenDev` is `undefined` in production → long-press is a no-op.)

- [ ] **Step 4: Verify the suite still passes**

Run: `npm test`
Expected: PASS — no behavior change to tested code.

- [ ] **Step 5: Commit**

```bash
git add src/screens/YouScreen.js
git commit -m "feat(dev): long-press About row opens the dev harness (no-op in prod)"
```

---

## Task 6: Wire RitualsApp (lazy-require + modal + handlers)

**Files:**
- Modify: `src/RitualsApp.js`

- [ ] **Step 1: Lazy-require DevPanel (guarded by literal `__DEV__`)**

Near the top of `src/RitualsApp.js`, after the import block (after line ~46, before `const XP_GAIN = 50;`), add:

```js
// Dev-only test harness. The literal __DEV__ lets Metro strip this require (and
// the entire src/dev subtree) from release bundles. Never alias __DEV__ here.
let DevPanel = null;
if (__DEV__) {
  DevPanel = require('./dev/DevPanel').default;
}
```

- [ ] **Step 2: Add `showDev` state**

After `const [showAch, setShowAch] = useState(false);` (line ~80), add:

```js
  const [showDev, setShowDev] = useState(false);
```

- [ ] **Step 3: Pass `onOpenDev` to YouScreen**

In the `<YouScreen ... />` render (around line 340–354), add this prop (e.g. after `onExplainAutoBackup={explainAutoBackup}`):

```js
            onOpenDev={__DEV__ ? () => setShowDev(true) : undefined}
```

- [ ] **Step 4: Render the dev Modal**

Immediately after the manage-subscription `</Modal>` (around line 490) and before the trailing `{toast && !shopOpen && ...}` line (~492), add:

```js
        {__DEV__ && DevPanel && (
          <Modal visible={showDev} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setShowDev(false)}>
            <DevPanel
              onLoadState={(state) => { setShowDev(false); onReplaceAllData(state); }}
              onResetFresh={() => { setShowDev(false); onResetData(); }}
              onClose={() => setShowDev(false)}
            />
          </Modal>
        )}
```

- [ ] **Step 5: Verify the suite still passes**

Run: `npm test`
Expected: PASS — full suite green (all prior suites + 3 new dev suites).

- [ ] **Step 6: Commit**

```bash
git add src/RitualsApp.js
git commit -m "feat(dev): mount DevPanel behind __DEV__; apply->restore, reset->fresh"
```

---

## Task 7: Verification — full suite + prove the harness is stripped from release

**Files:** none (verification only)

- [ ] **Step 1: Full test suite green**

Run: `npm test`
Expected: PASS — every suite, no failures. Confirm the 3 new `__tests__/dev/*` suites appear.

- [ ] **Step 2: Export a production bundle**

Run: `npx expo export --platform android`
Expected: exit 0, output written to `dist/`.

- [ ] **Step 3: Prove the sentinel is ABSENT from the release bundle**

Run (PowerShell):
```powershell
$hits = Select-String -Path dist\**\*.js,dist\**\*.hbc -Pattern 'DEV_HARNESS_SENTINEL_DO_NOT_SHIP' -SimpleMatch -ErrorAction SilentlyContinue
if ($hits) { Write-Host "LEAK: sentinel found in release bundle"; $hits } else { Write-Host "OK: harness stripped from release bundle" }
```
Expected: `OK: harness stripped from release bundle` (zero matches). If it reports LEAK, the dead-code elimination did not strip the subtree — stop and investigate (most likely an accidental static `import` of a `src/dev/*` module in a prod file, or an aliased guard instead of the literal `__DEV__`).

- [ ] **Step 4: Clean up the export artifacts**

Run (PowerShell): `Remove-Item -Recurse -Force dist`
(`dist/` is already gitignored; this just keeps the working tree clean.)

- [ ] **Step 5: Manual smoke test (emulator)**

Run the app on the emulator (`npm run android` or an existing dev build). On the **You** tab, **long-press** the "About Daily Rituals" row → the Dev Harness modal opens. Tap a scenario (e.g. **Broken streak (skulls)**) → **Apply** → the app remounts; verify the Home week strip/heatmap shows skull days. Try **Plus user** → confirm Plus cosmetics unlock. Try **Reset to fresh** → app returns to first-run onboarding.

- [ ] **Step 6: Final commit (if any progress-doc updates are made)**

```bash
git add -A
git commit -m "chore(dev): verify dev harness stripped from release bundle (sentinel grep clean)"
```

---

## Done when

- `npm test` is fully green, including the 3 new `__tests__/dev/*` suites.
- `npx expo export --platform android` produces a bundle with **zero** sentinel matches.
- Long-pressing the You-tab About row opens the panel on the emulator; scenarios + knobs + Apply seed state; Reset returns to first-run.
- No new dependencies; no native module; nothing visible to a normal (non-`__DEV__`) user.
