# IMP-008 — Real zero-state finish (level + calendar + week strip + entry dates)

**Date:** 2026-06-07
**Status:** Design approved (owner, 2026-06-07)
**Lane:** OTA (`Release-Lane: ota`) — all changes under `src/` + `__tests__/`. Inaugural real-feature ship through the release pipeline.
**Tracker:** PROGRESS.md → IMP-008 (Improvements backlog, ACTIVE TRACK)

---

## Problem

Even after IMP-004 zeroed new-user progress, four surfaces still render hardcoded
prototype demo data, so a fresh/low-activity user sees a dishonest profile:

1. **Level** — `src/RitualsApp.js` hardcodes `LEVEL = 3` / `LEVEL_NAME = 'Contemplative'`,
   passed to HomeScreen hero + YouScreen header. No XP→level model exists anywhere.
   Complication: XP hard-caps at `XP_MAX = 500` and both bars show `xp / xpMax`, so a
   real level system needs the cap removed.
2. **Calendar** — `src/data.js` `HEAT` is a fake 35-cell grid; `ArchiveScreen.Heat()`
   renders it and shows 💀 for every empty cell. Real `entries` already carry a real
   `dayKey` but are ignored by the heatmap.
3. **Week strip** — `src/data.js` `WEEK` is a fake Mon–Sun row (skull Monday, checks
   Tue–Fri) on the Today screen, unrelated to real activity. *(Not in IMP-008's original
   three items — found during design, folded in by owner decision.)*
4. **Entry dates** — `src/RitualsApp.js` builds entries with `day:'31', mon:'May',
   wd:'Saturday'`; only `dayKey` is real. (The IMP-007 deferred follow-up.)

## Goal

Replace all four fake surfaces with values derived from real state through pure, tested
helpers, keeping every screen "dumb." A new user (0 XP, no entries) sees: **Lv 1 ·
Waking**, an empty-but-friendly calendar (no skulls), an honest week strip, and entries
stamped with the real date.

## Non-goals (flagged, not touched)

- **Achievements / badges** (`BADGES`, `ACHIEVEMENTS` in `data.js`) are still hardcoded
  with fake `earned`/`cur` values. Making those real needs an achievement-tracking
  system — a separate, larger task. Out of scope.
- **Cosmetics ownership** (palettes/skies) — shop/monetization concern, untouched.
- No welcome bonus, no new gamification mechanics.

---

## Design

### 1. Level model — `src/profile/level.js` (new, TDD)

Pure helper:

```js
levelFromXp(totalXp) -> { level, name, into, toNext }
```

- `level` — 1-based level number.
- `name` — contemplative level name.
- `into` — XP earned within the current level (`totalXp - threshold(level)`).
- `toNext` — XP span of the current level (`threshold(level+1) - threshold(level)`);
  `null` at max level.

**XP cap removed.** Total XP grows forever. Progress bars become `into / toNext`
(within-level) instead of `xp / 500`. At max level the bar shows full and the
"Next level" label reads "Max."

**Threshold + name table** (cumulative total XP to *reach* each level; copy is tweakable):

| Lv | Name           | Reached at total XP | ≈ days @50 XP/entry |
|----|----------------|---------------------|---------------------|
| 1  | Waking         | 0                   | day 1               |
| 2  | Noticing       | 100                 | 2                   |
| 3  | Contemplative  | 250                 | 5                   |
| 4  | Reflective     | 500                 | 10                  |
| 5  | Steadfast      | 850                 | 17                  |
| 6  | Luminous       | 1300                | 26                  |
| 7  | Keeper of Days | 1900                | 38 (top)            |

A fresh user (0 XP) is **Lv 1 · Waking**.

### 2. Calendar + week strip — `src/home/calendar.js` (new, TDD)

One module, a shared internal "entry exists for this date" index (keyed by `dayKey`),
two exports. Both take `today` as an injectable param (default `new Date()`) so tests
are deterministic.

```js
buildHeatmap(entries, today) -> Cell[35]   // 5 rows × 7, today is the last cell
buildWeekStrip(entries, today) -> Cell[7]  // Mon..Sun
```

**Heatmap cells:**
- Entry day → `{ dayKey, mood, emoji, today }` (emoji via `MOOD_EMOJI` from `data.js`).
- No-entry day → `{ empty: true, today }` rendered as a quiet dashed cell — **no skull**.
- The grid spans the 35 calendar days ending today (today = cell index 34).

**Week-strip cells** (`{ l, state }`, Mon-first to match the current layout):
- `done` — an entry exists for that day.
- `today` — that day is today (renders the orb when not yet done, a check when done).
- `future` — after today.
- `empty` — a past day with no entry → neutral dashed, **no fake skull** (consistent
  with the heatmap's neutral-empties decision).

`HEAT` and `WEEK` consts are deleted from `data.js`.

### 3. Entry dates — extend `src/time/clock.js` (TDD)

Add:

```js
entryDateParts(date = new Date()) -> { day: '7', mon: 'Jun', wd: 'Sunday' }
```

- `day` — `String(date.getDate())` (e.g. `'7'`).
- `mon` — 3-letter abbreviation via a new `MONTHS_ABBR` array (e.g. `'Jun'`), matching
  ArchiveScreen's uppercase month display.
- `wd` — full weekday via the existing `WEEKDAYS` array (e.g. `'Sunday'`).

`complete()` in `RitualsApp.js` builds the entry with `...entryDateParts()` instead of
the hardcoded `day:'31', mon:'May', wd:'Saturday'`. `dayKey` stays. ArchiveScreen already
renders `e.day`/`e.mon`/`e.wd` — now real.

**No migration needed:** IMP-004's v1→v2 migrator already empties `entries`, so no stale
fake-date entries survive the update; every entry created henceforth carries a real date.

### 4. Wiring (no logic added to screens)

- `RitualsApp.js`:
  - Delete `LEVEL`, `LEVEL_NAME`, `XP_MAX`.
  - Compute `const { level, name, into, toNext } = levelFromXp(xp)`; pass to HomeScreen
    + YouScreen (replacing `level`/`levelName`/`xpMax` props with `level`/`name`/`into`/`toNext`).
  - Pass `entries` to HomeScreen (it currently doesn't receive them) for the week strip.
  - Build the entry with `...entryDateParts()`.
- `completeEntry.js`: uncap the XP reward (remove the `Math.min(XP_MAX, …)`); update its
  existing "capped at XP_MAX" test to assert uncapped growth.
- `HomeScreen.js`: render `Lv {level} · {name}` and the bar from `into`/`toNext`;
  feed the week strip from `buildWeekStrip(entries, …)`.
- `YouScreen.js`: render `Lv {level} · {name}` and the bar from `into`/`toNext`.
- `ArchiveScreen.js`: compute `buildHeatmap(entries, …)`, render neutral empties (drop
  the per-empty-cell 💀).

---

## Components & boundaries

| Unit | Purpose | Depends on |
|------|---------|------------|
| `src/profile/level.js` | XP → `{ level, name, into, toNext }` | nothing (pure data table) |
| `src/home/calendar.js` | entries + today → heatmap / week-strip cells | `MOOD_EMOJI` from `data.js` |
| `src/time/clock.js` (`entryDateParts`) | a Date → display `{ day, mon, wd }` | nothing |
| screens | render the above; no derivation logic | the helpers |

Each helper is understandable and testable in isolation, communicates through a small
return shape, and has no React/Date hidden dependency (today is injected).

## Data flow

`xp` / `entries` (state in RitualsApp, hydrated from AsyncStorage)
→ `levelFromXp(xp)` and `buildHeatmap/buildWeekStrip(entries, today)`
→ plain props down to HomeScreen / YouScreen / ArchiveScreen
→ render.

## Error handling / edge cases

- `levelFromXp(0)` → Lv 1; negative/undefined XP treated as 0.
- `levelFromXp(>=1900)` → Lv 7, `toNext: null`, bar full.
- `buildHeatmap([], today)` → 35 empty cells, today outlined (no crash, no skull).
- Entries with a `dayKey` outside the 35-day / 7-day window are simply not placed.
- Duplicate `dayKey` (shouldn't happen post-IMP-007) → last one wins in the index.

## Testing

All pure, deterministic (inject `today`), no RN/`Date.now` dependency:

- `__tests__/profile/level.test.js` — boundaries (0, each threshold ±1, max), `into`/`toNext`,
  `null` at max.
- `__tests__/home/calendar.test.js` — heatmap places entries by date, empties have no
  skull, today flagged; week strip done/today/future/empty states.
- `__tests__/time/clock.test.js` — add `entryDateParts` cases.
- `__tests__/home/completeEntry.test.js` — update the cap case → uncapped XP growth.

`npm test` stays green (current 59 passing + the new cases).

## Ship

OTA. All changes under `src/` and `__tests__/`; no native/config files touched. Final
commit trailer: `Release-Lane: ota`. Reaches testers on v5+ only (the v4 build in review
can't receive OTA). This is the first real feature shipped through the automated pipeline.
