# Lifetime Progress ("Your record") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve the Insights tab into a "Your record" (legacy/cumulative) section — a big "days remembered" number, a totals grid, and an adaptive consistency heatmap that grows from the user's first entry — above the existing "Your patterns" (mood + rhythm). The Home hero is NOT touched.

**Architecture:** Two new **pure** modules derive everything from existing data (`entries` + `xp` + `streak`) — `src/insights/lifetime.js` for the stats and a new `buildLifetimeHeatmap` in the existing `src/home/calendar.js` for the adaptive grid. A small shared `src/insights/dateKeys.js` removes the duplicated longest-run logic. `InsightsScreen.js` is restructured to render both `deriveLifetime` (new) and the untouched `deriveInsights` (existing). No new persisted state, no native deps.

**Tech Stack:** React Native 0.74 / Expo 51, Jest (jest-expo). Pure-logic unit tests; UI verified by manual smoke (matches the project's testing convention).

**Design source:** `docs/superpowers/specs/2026-06-14-lifetime-progress-design.md`

**Ship lane:** OTA (pure JS/UI). No `bump:*`. `Release-Lane: ota` trailer only if the owner asks to ship.

---

## File structure

**New (pure, unit-tested):**
- `src/insights/dateKeys.js` — `dayKeyToUtcMs`, `DAY_MS`, `longestConsecutiveRun`. Shared date-key helpers (de-duplicates logic now living inside `derive.js`).
- `src/insights/lifetime.js` — `deriveLifetime(entries, { xp, currentStreak, now })`. The "Your record" stats.

**Modified:**
- `src/insights/derive.js` — drop its private `longestConsecutiveRun`; import the shared one. No behavior change.
- `src/home/calendar.js` — add `buildLifetimeHeatmap(entries, today)` (reuses the file's own private helpers).
- `src/screens/InsightsScreen.js` — accept `xp`; add "Your record" section + compact heatmap renderer; group existing cards under "Your patterns"; reword subtitle; remove the "Days kept" + "This month" tiles.
- `src/RitualsApp.js:240` — pass `xp={xp}` to `<InsightsScreen>`.

**New tests:**
- `__tests__/insights/dateKeys.test.js`
- `__tests__/insights/lifetime.test.js`
- `__tests__/home/calendar.test.js` (new file, for `buildLifetimeHeatmap`)

---

## Task 1: Extract shared date helpers (`dateKeys.js`)

De-duplicate the longest-run logic so `lifetime.js` (Task 2) doesn't copy it. The existing
`derive.js` tests prove the move is behavior-preserving.

**Files:**
- Create: `src/insights/dateKeys.js`
- Modify: `src/insights/derive.js:15-30` (remove local fn) and its import line
- Test: `__tests__/insights/dateKeys.test.js`

- [ ] **Step 1: Write the failing test**

Create `__tests__/insights/dateKeys.test.js`:

```javascript
import { longestConsecutiveRun, dayKeyToUtcMs, DAY_MS } from '../../src/insights/dateKeys';

describe('longestConsecutiveRun', () => {
  test('empty → 0', () => {
    expect(longestConsecutiveRun([])).toBe(0);
  });
  test('single day → 1', () => {
    expect(longestConsecutiveRun(['2026-06-14'])).toBe(1);
  });
  test('counts the longest consecutive run, ignoring gaps and dupes', () => {
    // 06-01,02,03 (run 3) … gap … 06-10,11 (run 2)
    expect(longestConsecutiveRun(['2026-06-02', '2026-06-01', '2026-06-03', '2026-06-10', '2026-06-11', '2026-06-01']))
      .toBe(3);
  });
});

describe('dayKeyToUtcMs', () => {
  test('two adjacent days differ by exactly DAY_MS', () => {
    expect(dayKeyToUtcMs('2026-06-02') - dayKeyToUtcMs('2026-06-01')).toBe(DAY_MS);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/insights/dateKeys.test.js`
Expected: FAIL — `Cannot find module '../../src/insights/dateKeys'`.

- [ ] **Step 3: Create the shared module**

Create `src/insights/dateKeys.js`:

```javascript
// Shared pure date-key helpers, extracted so derive.js and lifetime.js share one
// copy of the longest-run logic instead of duplicating it.

export const DAY_MS = 86400000;

// Parse 'YYYY-MM-DD' to a UTC epoch ms (timezone-independent — for day diffs).
export function dayKeyToUtcMs(key) {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

// Longest run of consecutive calendar days present in `keys` (deduped, unordered).
export function longestConsecutiveRun(keys) {
  if (!keys.length) return 0;
  const ms = [...new Set(keys)].map(dayKeyToUtcMs).sort((a, b) => a - b);
  let best = 1, cur = 1;
  for (let i = 1; i < ms.length; i++) {
    cur = ms[i] - ms[i - 1] === DAY_MS ? cur + 1 : 1;
    if (cur > best) best = cur;
  }
  return best;
}
```

- [ ] **Step 4: Re-point `derive.js` to the shared helper**

In `src/insights/derive.js`: delete the local `longestConsecutiveRun` function (lines ~15-30) and add an import at the top of the file (below the existing constants):

```javascript
import { longestConsecutiveRun } from './dateKeys';
```

Leave everything else in `derive.js` unchanged (it already calls `longestConsecutiveRun(uniqueKeys)`).

- [ ] **Step 5: Run the full suite to verify nothing broke**

Run: `npm test`
Expected: PASS — the new `dateKeys` tests AND the existing `__tests__/insights/derive.test.js` (proves the extraction is behavior-preserving).

- [ ] **Step 6: Commit**

```bash
git add src/insights/dateKeys.js src/insights/derive.js __tests__/insights/dateKeys.test.js
git commit -m "refactor(insights): extract shared longestConsecutiveRun into dateKeys"
```

---

## Task 2: `deriveLifetime` — the "Your record" stats

**Files:**
- Create: `src/insights/lifetime.js`
- Test: `__tests__/insights/lifetime.test.js`

- [ ] **Step 1: Write the failing test**

Create `__tests__/insights/lifetime.test.js`:

```javascript
import { deriveLifetime } from '../../src/insights/lifetime';

const now = new Date('2026-06-14T12:00:00.000Z');

const entries = [
  { dayKey: '2026-06-10', did: 'walked the dog', wished: 'more time' }, // 3 + 2 = 5 words
  { dayKey: '2026-06-10', did: 'second entry same day', wished: '' },   // 4 + 0 = 4 words
  { dayKey: '2026-06-11', did: 'read a book', wished: 'sleep early' },  // 3 + 2 = 5 words
];

describe('deriveLifetime', () => {
  const r = deriveLifetime(entries, { xp: 320, currentStreak: 2, now });

  test('days remembered counts unique days; total entries counts all', () => {
    expect(r.daysRemembered).toBe(2); // 06-10 (x2) + 06-11
    expect(r.totalEntries).toBe(3);
  });
  test('total words sums did + wished across all entries', () => {
    expect(r.totalWords).toBe(14); // 5 + 4 + 5
  });
  test('streaks: passes current through, derives longest', () => {
    expect(r.currentStreak).toBe(2);
    expect(r.longestStreak).toBe(2); // 06-10 → 06-11 is a 2-day run
  });
  test('level + xp from levelFromXp', () => {
    expect(r.level).toBe(3);          // 320 XP → level 3 (Contemplative)
    expect(r.levelName).toBe('Contemplative');
    expect(r.xpEarned).toBe(320);
  });
  test('activeSpan is adaptive (4 days from first entry to now)', () => {
    expect(r.activeSpan).toBe('4 days in'); // 06-10 → 06-14
  });
});

describe('deriveLifetime activeSpan buckets', () => {
  const span = (firstKey) => deriveLifetime([{ dayKey: firstKey, did: 'x', wished: '' }], { now }).activeSpan;
  test('same day → Started today', () => expect(span('2026-06-14')).toBe('Started today'));
  test('one day → 1 day in', () => expect(span('2026-06-13')).toBe('1 day in'));
  test('weeks → N days in', () => expect(span('2026-06-01')).toBe('13 days in'));
  test('months → N months in', () => expect(span('2026-02-14')).toBe('4 months in'));
  test('years → N years in (1 decimal under 2y)', () => expect(span('2025-06-14')).toBe('1.0 years in'));
});

describe('deriveLifetime empty', () => {
  test('no entries → zeros and null span', () => {
    const r = deriveLifetime([], { xp: 0, currentStreak: 0, now });
    expect(r.daysRemembered).toBe(0);
    expect(r.totalEntries).toBe(0);
    expect(r.totalWords).toBe(0);
    expect(r.activeSpan).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/insights/lifetime.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/insights/lifetime.js`:

```javascript
// lifetime.js — pure "Your record" stats for the Insights tab. Everything is
// derived from existing data (entries + xp + streak); no new persisted state.

import { levelFromXp } from '../profile/level';
import { longestConsecutiveRun, dayKeyToUtcMs, DAY_MS } from './dateKeys';

function countWords(s) {
  if (!s || typeof s !== 'string') return 0;
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}

// Adaptive "how long you've been at this" label, from the first entry to now.
function activeSpanLabel(dayKeys, now) {
  if (!dayKeys.length) return null;
  const first = dayKeys.reduce((min, k) => (k < min ? k : min), dayKeys[0]);
  // Derive "today" the same UTC way calendar.js does (keyOf) so it's timezone-
  // independent and matches how dayKeys are produced.
  const todayMs = dayKeyToUtcMs(now.toISOString().slice(0, 10));
  const days = Math.floor((todayMs - dayKeyToUtcMs(first)) / DAY_MS);
  if (days <= 0) return 'Started today';
  if (days === 1) return '1 day in';
  if (days < 31) return `${days} days in`;
  if (days < 365) {
    const m = Math.round(days / 30.4);
    return `${m} ${m === 1 ? 'month' : 'months'} in`;
  }
  const years = days / 365;
  const label = years < 2 ? years.toFixed(1) : String(Math.round(years));
  return `${label} years in`;
}

export function deriveLifetime(entries = [], { xp = 0, currentStreak = 0, now = new Date() } = {}) {
  const dayKeys = entries.map((e) => e && e.dayKey).filter(Boolean);
  const daysRemembered = new Set(dayKeys).size;
  const totalEntries = entries.length;
  const totalWords = entries.reduce((sum, e) => sum + countWords(e && e.did) + countWords(e && e.wished), 0);
  const longestStreak = Math.max(longestConsecutiveRun(dayKeys), currentStreak);
  const { level, name: levelName } = levelFromXp(xp);
  return {
    daysRemembered,
    totalEntries,
    totalWords,
    currentStreak,
    longestStreak,
    level,
    levelName,
    xpEarned: xp,
    activeSpan: activeSpanLabel(dayKeys, now),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/insights/lifetime.test.js`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add src/insights/lifetime.js __tests__/insights/lifetime.test.js
git commit -m "feat(insights): deriveLifetime stats (days remembered, words, span)"
```

---

## Task 3: `buildLifetimeHeatmap` — the adaptive grid

**Files:**
- Modify: `src/home/calendar.js` (append a new exported function; reuses the file's private helpers)
- Test: `__tests__/home/calendar.test.js` (new file)

- [ ] **Step 1: Write the failing test**

Create `__tests__/home/calendar.test.js`:

```javascript
import { buildLifetimeHeatmap } from '../../src/home/calendar';

const today = new Date('2026-06-14T12:00:00.000Z'); // a Sunday

describe('buildLifetimeHeatmap', () => {
  test('no entries → empty array', () => {
    expect(buildLifetimeHeatmap([], today)).toEqual([]);
  });

  test('each row is a Monday-first week of 7 cells', () => {
    const rows = buildLifetimeHeatmap([{ dayKey: '2026-06-14' }], today);
    expect(rows.length).toBe(1);          // first entry is in the current week
    expect(rows[0].length).toBe(7);
  });

  test('window spans the first-entry week through the current week', () => {
    // 2026-06-01 is a Monday; 2026-06-14 is a Sunday → 2 calendar weeks
    const rows = buildLifetimeHeatmap([{ dayKey: '2026-06-01' }, { dayKey: '2026-06-14' }], today);
    expect(rows.length).toBe(2);
  });

  test('cell states: done where an entry exists, missed for a gap day before today', () => {
    const rows = buildLifetimeHeatmap([{ dayKey: '2026-06-08', mood: 'calm' }], today);
    // week of 06-08 (Mon) .. 06-14 (Sun). 06-08 has an entry; 06-09 is a past gap.
    const flat = rows.flat();
    const mon = flat.find((c) => c.dayKey === '2026-06-08');
    const tue = flat.find((c) => c.dayKey === '2026-06-09');
    const sun = flat.find((c) => c.dayKey === '2026-06-14');
    expect(mon.mood).toBe('calm');     // done
    expect(tue.missed).toBe(true);     // past gap after first entry
    expect(sun.today).toBe(true);      // today
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/home/calendar.test.js`
Expected: FAIL — `buildLifetimeHeatmap` is not exported.

- [ ] **Step 3: Append the implementation to `src/home/calendar.js`**

Add at the end of `src/home/calendar.js` (it reuses `keyOf`, `shiftKey`, `weekdayMon0`, `indexByDay`, `minDayKey`, and `MOOD_EMOJI` already present in the file):

```javascript
// Adaptive lifetime heatmap: an array of week-rows (each 7 cells, Monday-first),
// spanning the week of the first entry through the week containing today. Grows
// as history accumulates; returns [] when there are no entries. Cells use the
// same shape as buildHeatmap (done has mood/emoji; otherwise missed/empty/future).
export function buildLifetimeHeatmap(entries, today = new Date()) {
  const firstKey = minDayKey(entries);
  if (!firstKey) return [];
  const byDay = indexByDay(entries);
  const todayK = keyOf(today);
  const endMonday = shiftKey(todayK, -weekdayMon0(todayK));
  const rows = [];
  let weekStart = shiftKey(firstKey, -weekdayMon0(firstKey));
  while (weekStart <= endMonday) {
    const row = [];
    for (let i = 0; i < 7; i += 1) {
      const dayKey = shiftKey(weekStart, i);
      const isToday = dayKey === todayK;
      const entry = byDay[dayKey];
      if (entry) row.push({ dayKey, mood: entry.mood, emoji: MOOD_EMOJI[entry.mood] || '', today: isToday });
      else if (dayKey > todayK) row.push({ dayKey, future: true });
      else if (dayKey >= firstKey) row.push({ dayKey, missed: true, today: isToday });
      else row.push({ dayKey, empty: true, today: isToday });
    }
    rows.push(row);
    weekStart = shiftKey(weekStart, 7);
  }
  return rows;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/home/calendar.test.js`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add src/home/calendar.js __tests__/home/calendar.test.js
git commit -m "feat(insights): adaptive buildLifetimeHeatmap (first entry → today)"
```

---

## Task 4: Evolve `InsightsScreen` + pass `xp`

**Files:**
- Modify: `src/RitualsApp.js:240` (pass `xp`)
- Modify: `src/screens/InsightsScreen.js` (subtitle; new "Your record" section + heatmap renderer; "Your patterns" heading; remove old tiles)

No unit tests (presentational — the stats/heatmap logic was tested in Tasks 2 & 3). Verified by the Task 5 smoke test.

- [ ] **Step 1: Pass `xp` to InsightsScreen from RitualsApp**

In `src/RitualsApp.js`, update the `case 'insights':` line (~240):

```javascript
      case 'insights':
        return <InsightsScreen copy={copy} entries={entries} streak={streak} xp={xp} />;
```

- [ ] **Step 2: Update imports + signature in InsightsScreen**

In `src/screens/InsightsScreen.js`, add the new imports near the existing ones:

```javascript
import { deriveLifetime } from '../insights/lifetime';
import { buildLifetimeHeatmap } from '../home/calendar';
```

Change the component signature to accept `xp`:

```javascript
export default function InsightsScreen({ copy, entries = [], streak = 0, xp = 0 }) {
```

- [ ] **Step 3: Reword the header subtitle (both the empty-state and main copies)**

In `src/screens/InsightsScreen.js` there are two header blocks (the empty-state path and the main path), each with the line `The shape of your days so far.`. Change BOTH to:

```javascript
            <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 2 }}>The record you&rsquo;re building.</T>
```

- [ ] **Step 4: Replace the old 2×2 STATS tiles with the "Your record" section**

In the main (non-empty) return, delete the existing `const STATS = [...]` array and the `{/* stat tiles 2×2 */}` block. Also change the destructure line `const { stats, moodMix, rhythm, peakWeekday } = data;` to drop the now-unused `stats`:

```javascript
  const { moodMix, rhythm, peakWeekday } = data;
```

Then compute the lifetime data right below it:

```javascript
  const life = deriveLifetime(entries, { xp, currentStreak: streak });
  const heat = buildLifetimeHeatmap(entries);
  const fmt = (n) => n.toLocaleString();
```

Then render this block where the old stat tiles were (immediately after the header `View`):

```javascript
      {/* Your record — the legacy/cumulative story */}
      <View style={{ paddingHorizontal: 20 }}>
        <T d w={700} color={c.ink} style={{ fontSize: 15, marginBottom: 10, marginLeft: 2 }}>Your record</T>
        <Card style={{ padding: 20 }}>
          {/* hero number */}
          <View style={{ alignItems: 'center', marginBottom: 18 }}>
            <T d w={800} color={c.accentDeep} style={{ fontSize: 56, lineHeight: 60 }}>{fmt(life.daysRemembered)}</T>
            <T w={700} color={c.ink} style={{ fontSize: 15, marginTop: 2 }}>days remembered</T>
            <T w={600} color={c.muted} style={{ fontSize: 12.5, marginTop: 4 }}>
              Lv {life.level} · {life.levelName}{life.activeSpan ? ` · ${life.activeSpan}` : ''}
            </T>
          </View>

          {/* totals grid 2×2 */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {[
              { label: 'Entries', value: fmt(life.totalEntries) },
              { label: 'Words', value: fmt(life.totalWords) },
              { label: 'Current streak', value: fmt(life.currentStreak) },
              { label: 'Longest streak', value: fmt(life.longestStreak) },
            ].map((s, i) => (
              <View key={s.label} style={{ width: '50%', paddingVertical: 10, paddingRight: i % 2 === 0 ? 8 : 0 }}>
                <T w={700} color={c.muted} style={{ fontSize: 11.5, letterSpacing: 0.5, textTransform: 'uppercase' }}>{s.label}</T>
                <T d w={800} color={c.ink} style={{ fontSize: 24, lineHeight: 28, marginTop: 3 }}>{s.value}</T>
              </View>
            ))}
          </View>

          {/* adaptive consistency heatmap */}
          {heat.length > 0 && (
            <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: c.border }}>
              <T w={700} color={c.muted} style={{ fontSize: 11.5, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>Consistency</T>
              <LifetimeHeat rows={heat} />
            </View>
          )}
        </Card>
      </View>

      {/* Your patterns — the existing analytical cards */}
      <View style={{ paddingHorizontal: 20, marginBottom: -6 }}>
        <T d w={700} color={c.ink} style={{ fontSize: 15, marginLeft: 2 }}>Your patterns</T>
      </View>
```

(The existing `{/* mood mix */}` and `{/* weekday rhythm */}` blocks stay exactly as they are, now visually under the "Your patterns" heading.)

- [ ] **Step 5: Add the compact heatmap renderer**

Add this component at the bottom of `src/screens/InsightsScreen.js` (emoji-free squares so it stays legible across many weeks — distinct from the Reflections emoji heatmap):

```javascript
function LifetimeHeat({ rows }) {
  const c = useTheme().colors;
  return (
    <View style={{ gap: 4 }}>
      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', gap: 4 }}>
          {row.map((cell, i) => {
            const has = !(cell.missed || cell.empty || cell.future); // an entry exists
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  borderRadius: 4,
                  backgroundColor: has ? c.accent : 'transparent',
                  borderWidth: cell.today ? 2 : has ? 0 : 1,
                  borderColor: cell.today ? c.accentDeep : c.border,
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}
```

- [ ] **Step 6: Verify bundle + suite**

Run: `npm test`
Expected: PASS (existing suites unaffected; no new UI tests).

Run: `npx expo start` → open the **Insights** tab → confirm "Your record" renders (days-remembered hero, totals, heatmap), "Your patterns" heading sits above mood mix + rhythm, and a fresh user still shows the empty state. Stop the server.

- [ ] **Step 7: Commit**

```bash
git add src/RitualsApp.js src/screens/InsightsScreen.js
git commit -m "feat(insights): Your record section (days remembered + totals + adaptive heatmap)"
```

---

## Task 5: Verify + ship prep

**Files:** PROGRESS.md, docs/build-log.md

- [ ] **Step 1: Full unit suite**

Run: `npm test`
Expected: PASS — including the three new suites (`dateKeys`, `lifetime`, `calendar`). Note the totals for the session note.

- [ ] **Step 2: Manual smoke test** (record pass/fail for each)

1. Fresh user (no entries) → Insights shows the empty state ("write your first reflection…"), no zero-filled record.
2. After 1 entry → "Your record" shows 1 day remembered, "Started today", a 1-week heatmap with one filled square.
3. Multiple entries across weeks → days vs entries diverge correctly; heatmap grows to multiple rows; missed days appear as empty (un-filled) squares; today has the accent border.
4. "Your patterns" heading appears above the unchanged mood mix + weekly rhythm.
5. No "Days kept" or "This month" tile remains anywhere.

- [ ] **Step 3: Update PROGRESS.md**

- Tick IMP-021 in the backlog table → ✅.
- Move the full IMP-021 spec block out of PROGRESS.md into `docs/build-log.md` (code-complete).
- Write the dated "Last session note": what shipped, `npm test` count, last command/commit, and the next roadmap piece (C — Annual Recap, with the deferred milestone timeline).
- Confirm `wc -l PROGRESS.md` is ≤ ~120 lines.

```bash
git add PROGRESS.md docs/build-log.md
git commit -m "docs(progress): IMP-021 lifetime progress code-complete; archive spec"
```

> **Shipping (only if the owner asked):** OTA lane — make the final commit's last line exactly `Release-Lane: ota` and `git push origin main`. No `bump:*` (no native change). No trailer = nothing ships (fine for WIP).

---

## Notes & deferrals (do NOT build now)

- **Milestone timeline** → its own later piece (net-new model + UI; pairs with C, the Annual Recap).
- **Home hero / streak** → untouched by owner constraint.
- **All-time heatmap scrolling polish** (year headers, collapse) → only if it becomes unwieldy; v1 lets it grow within the existing ScrollView.
- No new persisted state, no native deps, no `bump:*` — this is OTA.
