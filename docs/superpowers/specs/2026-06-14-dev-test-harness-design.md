# Dev Test Harness — Design Spec

**Date:** 2026-06-14
**Status:** Approved (owner) — ready for implementation plan
**Lane:** Dev-only (no ship; never enters a release bundle)

---

## Problem

There is no fast way to put the app into an arbitrary state on the emulator to
exercise every case: different streak lengths, many entries with varied input
types, broken streaks (skull days), Plus vs non-Plus, owned palettes/skies,
done-vs-not-done-today, empty insights. Today the only way to reach these states
is to play through them by hand, which is slow and can't reliably reproduce edge
cases.

## Goal

A `__DEV__`-only in-app panel that builds a complete persisted state slice and
loads it into the running app instantly — no rebuild, no file juggling —
covering "every case" via curated scenarios **and** adjustable knobs. It must be
**provably absent from any non-dev build** (closed testing / production).

## Non-goals (YAGNI)

- No freeform JSON paste box.
- No persisting the last-used knob values (ephemeral is fine for a dev tool).
- No raw per-key override surface — only knobs that change observable behaviour.
- No UI unit tests for the dev panel chrome itself (pure cores are tested).

---

## Core idea

Everything rides the **existing** seam: `onReplaceAllData(slice)` in
[`App.js`](../../../App.js) (line ~81) saves a full state slice via `saveState`
and bumps `dataKey` to remount `RitualsApp`, which re-inits its `useState` from
the slice. This is the same path a Backup **Restore** uses. The dev panel's only
job is to *build a slice* and hand it to that function — nothing bypasses the
real load path, so what you test is exactly what a real tester gets.

`Reset to fresh` reuses the existing `onResetData` (clears storage + returns to
first-run), already a prop on `RitualsApp`.

---

## State slice shape (reference)

Persisted keys (`src/persistence/state.js` → `PERSISTED_KEYS`):

```
onboarded, mode, entries, streak, xp, done, quests, freezes, embers,
plus, activePalette, ownedPalettes, activeSky, ownedSkies,
subCanceled, activePlan, lastActiveDay, settings, lastBackupAt, promptDeck
```

Entry shape (from `RitualsApp.complete` + `src/time/clock.js`):

```js
{ id, day, mon, wd, dayKey, mood, did, wished, streak }
// dayKey: 'YYYY-MM-DD'  day: '14'  mon: 'Jun'  wd: 'Saturday'
// mood: one of MOODS (src/data.js)  did/wished: free text
```

---

## Components (all new, under `src/dev/`)

### `src/dev/enabled.js` — the single gate
```js
export const DEV_TOOLS = __DEV__;
export const SENTINEL = 'DEV_HARNESS_SENTINEL_DO_NOT_SHIP';
```
Every entry point references only `DEV_TOOLS` — no scattered `__DEV__` checks.
`SENTINEL` is exported (and referenced) from each dev module so the bundle-grep
verification has something to find.

### `src/dev/generateEntries.js` — pure workhorse (tested)
`buildEntries({ count, endDayKey, gaps = [], today })` → array of entries in the
**real shape**, newest-first, using the real `entryDateParts()` and the
`dateKeys` helpers (`dayKeyToUtcMs` / `DAY_MS`) so dates are valid and
insights / calendar / heatmap all light up correctly.

- Walks back day-by-day from `endDayKey`, skipping any day index listed in
  `gaps` (this is how broken-streak / skull days are produced).
- Cycles `mood` through `MOODS` and varies `did` / `wished` text from a small
  fixture pool → exercises the "different input types."
- `streak: true` on each (matches real entries).

### `src/dev/buildState.js` — pure assembler (tested)
`buildState(knobs, today)` → a complete persisted slice. Knobs:

| Knob | Effect |
|---|---|
| `streak` | sets `streak`; default `xp` derived as `streak * XP_GAIN` unless `xp` given |
| `entryCount` | how many entries to generate (ending today or yesterday per `done`) |
| `gaps` | day-indices to skip → skull days |
| `done` | true → last entry is today + `done:true`; false → ends yesterday, write card shows |
| `plus` | `plus`, and when true sets a sensible `activePlan` |
| `embers` | ember balance |
| `xp` | explicit XP override (else derived) |
| `palette` / `sky` | `activePalette` / `activeSky` (+ included in owned lists) |
| `ownAll` | true → `ownedPalettes` / `ownedSkies` = every SKU |
| `tone` / `gamify` | written into `settings` |
| `freezes` | freeze count |

Always sets `onboarded:true`, `lastActiveDay`, and `quests` consistent with
`done`. Returns only keys in `PERSISTED_KEYS`.

### `src/dev/scenarios.js` — named presets (tested)
Each scenario is a knob-set fed to `buildState`. Initial library:

| Name | Intent |
|---|---|
| `fresh` | empty slice (equivalent to reset / brand-new user) |
| `shortStreak` | 3-day streak, 3 consecutive entries, done today |
| `notDoneToday` | entries through yesterday, `done:false` → write card + daily prompt visible |
| `longLegacy` | ~120-day span, ~80 entries, high XP/level — exercises legacy/lifetime UI |
| `brokenStreak` | entries with gaps → 💀 skull cells in week strip + heatmap |
| `plusUser` | `plus:true` + `activePlan`, full owned palettes/skies |
| `fullShop` | large ember balance, all palettes/skies owned |
| `emptyInsights` | zero entries (insights/lifetime empty states) |

### `src/dev/DevPanel.js` — `__DEV__`-only modal UI (no unit test)
- Scenario buttons at top — tapping one **fills the knobs** (does not auto-apply).
- Knob controls: number steppers (streak, entries, embers, xp), toggles
  (Plus, done, gamify, ownAll), pickers (palette, sky, tone).
- **Apply** → `onLoadState(buildState(knobs, today))`.
- **Reset to fresh** → `onResetFresh()`.
- Themed with the usual `theme`/`T` tokens; references `SENTINEL`.

---

## Prod-file touches (both `DEV_TOOLS`-guarded — no-op / absent in release)

### `src/screens/YouScreen.js`
Wrap the existing version line in a `Pressable` whose `onLongPress` calls
`onOpenDev` **only** when `DEV_TOOLS`. No layout change, nothing visible.
`onOpenDev` is a new optional prop (undefined in prod → long-press does nothing).

### `src/RitualsApp.js`
- `const [showDev, setShowDev] = useState(false)`.
- Lazy require (NOT a static import):
  ```js
  import { DEV_TOOLS } from './dev/enabled';
  let DevPanel = null;
  if (DEV_TOOLS) DevPanel = require('./dev/DevPanel').default;
  ```
- Pass `onOpenDev={DEV_TOOLS ? () => setShowDev(true) : undefined}` to YouScreen.
- Render `{DEV_TOOLS && showDev && DevPanel && (<Modal …><DevPanel
  onLoadState={(s) => { onReplaceAllData(s); setShowDev(false); }}
  onResetFresh={() => { onResetData(); setShowDev(false); }}
  onClose={() => setShowDev(false)} /></Modal>)}`.

---

## Data flow

```
DevPanel knobs
  → buildState(knobs, today)         (pure)
  → full persisted slice
  → onReplaceAllData(slice)          (existing App.js path)
  → saveState + remount RitualsApp
  → app re-inits seeded
```
Identical to a Backup Restore.

---

## Leak-proofing (the owner's hard requirement)

Three layers guarantee the harness is **provably absent from any non-dev build**:

1. **Single gate.** All entry points reference `DEV_TOOLS` (= `__DEV__`) from one
   file. `__DEV__` is a compile-time constant: `true` under `expo start`,
   `false` in release / `expo export` / EAS builds.

2. **Lazy `require`, not static `import`.** Because `DevPanel` is required inside
   an `if (DEV_TOOLS)` branch, Metro's dead-code elimination **removes the entire
   `src/dev/` subtree from the production bundle** — not merely unreachable, but
   absent.

3. **Evidence, not faith.** Every dev module references `SENTINEL`
   (`'DEV_HARNESS_SENTINEL_DO_NOT_SHIP'`). The final implementation step runs
   `npx expo export --platform android` and greps the emitted bundle for the
   sentinel — it **must return zero matches**. (The `expo start` dev bundle will
   contain it — expected and correct.) This is the proof gate before the work is
   considered done.

---

## Testing strategy

Pure cores get full coverage; dev-only UI chrome does not.

- **`generateEntries`** — entry count; newest-first ordering; entry shape matches
  the real `complete()` shape; `gaps` produce the expected missing `dayKey`s;
  date parts (`day`/`mon`/`wd`) correct for known `dayKey`s; moods cycle.
- **`buildState`** — streak/xp wiring (derived vs override); `done` true/false
  controls last entry date + `quests`; `plus` sets `activePlan`; palette/sky +
  `ownAll`; output keys are a subset of `PERSISTED_KEYS`.
- **`scenarios`** — each scenario round-trips through
  `pickPersisted → serialize → deserialize` as a **legal** persisted state, and
  produces the intended derived values via the real functions (e.g.
  `brokenStreak` yields skull days through the real `derive`/`calendar`;
  `longLegacy` yields the expected level via `levelFromXp`).
- No assertion that the sentinel is absent from the *dev* bundle — only the
  exported/release bundle (manual verification step, see Leak-proofing #3).

---

## Files summary

**New**
- `src/dev/enabled.js`
- `src/dev/generateEntries.js`
- `src/dev/buildState.js`
- `src/dev/scenarios.js`
- `src/dev/DevPanel.js`
- `__tests__/dev/generateEntries.test.js`
- `__tests__/dev/buildState.test.js`
- `__tests__/dev/scenarios.test.js`

**Modified (DEV_TOOLS-guarded only)**
- `src/RitualsApp.js`
- `src/screens/YouScreen.js`

No new dependencies. No native modules → **no rebuild required** (pure JS + OTA-
class change, though it never ships at all). No `package.json` script changes.
