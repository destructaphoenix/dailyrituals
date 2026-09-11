# D-01 · Insights → the consistency grid — Claude Design request

> **This whole file is the request.** Select all, paste into Claude Design, send. Nothing outside it is
> needed and nothing inside it should be summarised away — the source blocks are what replace the repo
> links Claude Design cannot open. Generated from the real files 2026-09-11; regenerate rather than
> hand-edit if the code moves. Queue row: [`docs/design-queue.md`](../design-queue.md) → D-01.
>
> **Look at `day-05-insights.png` / `night-05-insights.png`** in the project's Screens group while reading
> this. ⚠️ **Two things that shot cannot tell you:** it stops mid-grid at the bottom of the viewport (that
> cut *is* the defect, not a bad capture), and its fixture is a **210-day perfect streak**, so three of the
> four cell states you must design for never appear in it.

---

## The ask

Redesign the **"Consistency"** block inside the "Your record" card on the Insights tab so that it is
**bounded by construction** — a grid whose height does not grow with the length of the journal.

**What is wrong today.** It draws one row per calendar week from the user's first entry to today, forever.

**The measurement**, on a 360dp phone at default font scale:

| | |
| --- | --- |
| card content width | 280dp (screen padding 20 + card padding 20, both sides) |
| month-label gutter | 28dp, + one 4dp gap |
| per cell | (280 − 32 − 6×4) ÷ 7 = **32dp**, square |
| row pitch | 32 + 4 = **36dp** |
| **one year** | ~52 rows = **~1,870dp** — about **three screenfuls** |
| two years | ~6 screenfuls, and the hero number and totals grid are pushed that far above it |

**The direction we believe in** (argue with it if you have a better one): the **transpose** — 7 weekday
rows × N week columns, scrolling **horizontally**, which puts a year in ~7 rows (~250dp) instead of 52.
Month labels move to the column axis. A period control for earlier years is welcome if it stays quiet.

**The proof this is a design mistake and not a data one:** the same app already ships the bounded version
of this component one tab over. Reflections titles its heat **"Last 5 weeks"**. Insights' is the only
unbounded surface of the two.

---

## What must survive the redesign

These are not preferences — each one is a bug that was already found and fixed here.

1. **Four cell states, all four visible:** `done` · `frozen` (a candle held the streak) · `missed` ·
   `empty` (before the first entry). **The baseline screenshot shows only `done`.**
2. **Geometry must not vary by state.** Android strokes a rounded border half *outside* the bounds, so a
   bordered cell measures ~1dp larger than an unbordered one and visibly breaks the grid rhythm. Every
   state returns `borderWidth: 1`; states that show no ring return a **transparent** one. Keep that.
3. **No dashed borders.** Android renders `borderStyle: 'dashed'` with `borderRadius` inconsistently.
4. **`empty` is not in the legend, deliberately.** A faint blank tile in a grid where filled means "kept"
   needs no key, and the old dashed outline read as a state to decode.
5. **The legend indents to exactly where the first cell starts** — gutter + gap. Two magic numbers in two
   places is how they drifted apart before (24 vs 28). Whatever the new axis is, say what the legend
   aligns to.
6. **Today is marked by an inset ring child**, not by different geometry.
7. **Only a `done` cell is pressable** (it opens that day's entry) and it carries an accessibility label of
   `"<dayKey>, <moods joined>"` or `"no mood recorded"`. Keep a real press target — the current one is
   32dp with `hitSlop={3}`.
8. **The month gutter grows with the OS font scale, capped at 1.5×** (a 42dp box clears "Aug" at 9.5pt at
   the cap). If labels move to the column axis, solve the same problem there.

## What to return

An HTML/CSS preview in **both day and night**, plus a spec **written in token names** — `c.accent`,
`c.accentSoft`, `c.accentDeep`, `c.border`, `c.ghostBtn`, `c.muted`, `t.radius.card` — never hex and never
prose like "a gentle fade". Name the dp of every gap, cell and gutter. The port to React Native is a
separate build task, so the spec is the deliverable, not code.

⚠️ **Out of scope:** `RayFan` / `NightRays` (frozen — this screen does not use them anyway), anything under
`src/billing/`, and the "Your patterns" / "Deeper" cards below (they are D-03 and D-04, separate requests).

---

## The source

### Where the grid sits — `src/screens/InsightsScreen.js`

```jsx

          {/* adaptive consistency heatmap */}
          {heat.length > 0 && (
            <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: c.border }}>
              <T w={700} color={c.muted} style={{ fontSize: 11.5, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>Consistency</T>
              <LifetimeHeat rows={heat} entries={entries} onOpen={onOpen} />
            </View>
          )}
        </Card>
      </View>
```

### The renderer — `LifetimeHeat`, same file

```jsx
function LifetimeHeat({ rows, entries, onOpen }) {
  const c = useTheme().colors;
  // LifetimeHeat is its own component, so it reads the scale itself rather than
  // taking a prop — InsightsScreen's own `fontScale` is not in scope here.
  const { fontScale } = useWindowDimensions();
  const gutter = heatGutterWidth(fontScale);
  const monthLabels = monthLabelsForRows(rows);
  return (
    <View>
      <View style={{ gap: HEAT_CELL_GAP }}>
        {rows.map((row, ri) => (
          <View key={ri} style={{ flexDirection: 'row', alignItems: 'center', gap: HEAT_CELL_GAP }}>
            <View style={{ width: gutter }}>
              <T w={700} color={c.muted} numberOfLines={1} ellipsizeMode="clip" style={{ fontSize: 9.5 }}>{monthLabels[ri]}</T>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', gap: HEAT_CELL_GAP }}>
              {row.map((cell, i) => {
                const state = cellState(cell);
                const pressable = state === 'done';
                const cellStyle = {
                  flex: 1,
                  aspectRatio: 1,
                  borderRadius: 4,
                  ...heatCellStyle(state, c),
                };
                const ring = state === 'done' && cell.today ? (
                  <View
                    pointerEvents="none"
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: 2,
                      right: 2,
                      bottom: 2,
                      borderRadius: 2,
                      borderWidth: 1.5,
                      borderColor: c.accentDeep,
                    }}
                  />
                ) : null;
                if (!pressable) {
                  return <View key={i} style={cellStyle}>{ring}</View>;
                }
                const label = `${cell.dayKey}, ${(cell.moods || []).join(', ') || 'no mood recorded'}`;
                return (
                  <Pressable
                    key={i}
                    hitSlop={3}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    onPress={() => {
                      const e = entryForDayKey(entries, cell.dayKey);
                      if (e) onOpen(e);
                    }}
                    style={({ pressed }) => [cellStyle, { transform: [{ scale: pressed ? 0.92 : 1 }] }]}
                  >
                    {ring}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 8, marginTop: 12, paddingLeft: gutter + HEAT_CELL_GAP }}>
        {LEGEND.map((l) => (
          <View key={l.state} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 3, ...heatCellStyle(l.state, c) }} />
            <T w={600} color={c.muted} style={{ fontSize: 11 }}>{l.label}</T>
          </View>
        ))}
      </View>
    </View>
  );
}
```

### The four states, and the legend — same file

```jsx
export const LEGEND = [
  { state: 'done', label: 'kept' },
  { state: 'frozen', label: 'a candle kept it' },
  { state: 'missed', label: 'missed' },
];

// Geometry must NOT vary by cell state: Android strokes a rounded border half
// OUTSIDE the bounds, so a bordered cell occupies ~1dp more in each direction
// than an unbordered one and reads as a bigger block, breaking the grid rhythm.
// This comment predates IMP-073; the code did not keep the rule — `done` was the
// one state at borderWidth 0, so every kept day rendered slightly small. Every
// state now returns borderWidth: 1, and the ones that show no ring return a
// transparent one (the background paints beneath it, so nothing looks different —
// it only measures the same). Today is marked by an inset ring child instead.
export function heatCellStyle(state, c) {
  if (state === 'done') {
    return { backgroundColor: c.accent, borderWidth: 1, borderColor: 'transparent' };
  }
  if (state === 'frozen') {
    // Same fill as missed, ringed in accentDeep: a day that was held, not lost.
    return { backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.accentDeep };
  }
  if (state === 'missed') {
    return { backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.border };
  }
  if (state === 'empty') {
    // Days before the first entry. Deliberately the quietest thing on the grid,
    // and deliberately NOT in the legend (IMP-073): a faint blank tile in a grid
    // where filled means "kept" needs no key. The old dashed outline read as a
    // state to decode — and Android renders a dashed border with borderRadius
    // inconsistently anyway. Do not restore borderStyle here.
    return { backgroundColor: c.ghostBtn, borderWidth: 1, borderColor: 'transparent' };
  }
  return { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'transparent' };
}
```

### The geometry constants — `src/insights/heatCells.js`

```js
// Pure cell-state + label helpers for the Lifetime Progress heatmap (IMP-045).
// No theme imports — InsightsScreen.js maps the returned states to styling.

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Precedence: future > frozen > missed > empty > done.
export function cellState(cell) {
  if (cell.future) return 'future';
  if (cell.frozen) return 'frozen';
  if (cell.missed) return 'missed';
  if (cell.empty) return 'empty';
  return 'done';
}

// One label per row: the short month name on the row whose first cell begins
// a new month, '' otherwise. Row 0 always gets a label (when its month is
// knowable). Rows/cells missing a parseable dayKey never throw — they just
// carry no label.
export function monthLabelsForRows(rows) {
  let prevMonth = null;
  return rows.map((row) => {
    const dayKey = row && row[0] && row[0].dayKey;
    const month = typeof dayKey === 'string' ? Number(dayKey.slice(5, 7)) - 1 : NaN;
    if (Number.isNaN(month)) return '';
    const label = month === prevMonth ? '' : MONTH_SHORT[month];
    prevMonth = month;
    return label;
  });
}

// The month-label gutter and the gap between cells. Both live here rather than
// inline in InsightsScreen because the legend under the grid must indent to
// exactly where the first cell starts — gutter + gap — and two magic numbers in
// two places is precisely how they drifted apart (the gutter was 24, the legend's
// indent 28). Growing with the OS font scale and capped at 1.5, which is not a
// guess: MAX_FONT_SCALE (src/ui/textScale.js) is the most `T` will ever scale, so
// at the cap a 42dp box always clears 'Aug' at 9.5pt. (IMP-073)
export const HEAT_GUTTER_BASE_DP = 28;
export const HEAT_CELL_GAP = 4;
```

### The data — `buildLifetimeHeatmap`, `src/home/calendar.js`

This is the function whose output grows forever: one row per week from the first entry to today.

```js
export function buildLifetimeHeatmap(entries, today = new Date(), { frozenDays = [] } = {}) {
  const firstKey = minDayKey(entries);
  if (!firstKey) return [];
  const byDay = indexByDay(entries);
  const todayK = keyOf(today);
  const endMonday = shiftKey(todayK, -weekdayMon0(todayK));
  const frozen = new Set(frozenDays || []);
  const rows = [];
  let weekStart = shiftKey(firstKey, -weekdayMon0(firstKey));
  while (weekStart <= endMonday) {
    const row = [];
    for (let i = 0; i < 7; i += 1) {
      const dayKey = shiftKey(weekStart, i);
      const isToday = dayKey === todayK;
      const entry = byDay[dayKey];
      if (entry) {
        row.push({ dayKey, moods: entry.moods || [], today: isToday });
      } else if (dayKey > todayK) row.push({ dayKey, future: true });
      else if (dayKey >= firstKey) row.push(frozen.has(dayKey)
        ? { dayKey, frozen: true, today: isToday }
        : { dayKey, missed: true, today: isToday });
      else row.push({ dayKey, empty: true, today: isToday });
    }
    rows.push(row);
    weekStart = shiftKey(weekStart, 7);
  }
  return rows;
}
```

### For contrast — the bounded sibling, `src/home/calendar.js`

Reflections' heat is built by this instead, and is titled "Last 5 weeks":

```js
// 7 cells, Monday-first, for the calendar week containing today.
export function buildWeekStrip(entries, today = new Date(), { frozenDays = [] } = {}) {
  const byDay = indexByDay(entries);
  const todayK = keyOf(today);
  const mondayK = shiftKey(todayK, -weekdayMon0(todayK));
  const firstKey = minDayKey(entries);
  const frozen = new Set(frozenDays || []);
  const cells = [];
  for (let i = 0; i < 7; i += 1) {
    const dayKey = shiftKey(mondayK, i);
    let state;
    if (dayKey === todayK) state = 'today';
    else if (dayKey > todayK) state = 'future';
    else if (byDay[dayKey]) state = 'done';
    else if (firstKey && dayKey >= firstKey) state = frozen.has(dayKey) ? 'frozen' : 'missed';
    else state = 'empty';
    cells.push({ l: WEEK_LABELS[i], state });
  }
  return cells;
}
```

---

## Tokens this block uses today

| Role | Token |
| --- | --- |
| kept / `done` fill | `c.accent` |
| `frozen` fill + ring | `c.accentSoft` fill, `c.accentDeep` border |
| `missed` fill + ring | `c.accentSoft` fill, `c.border` border |
| `empty` fill | `c.ghostBtn`, transparent border |
| today's inset ring | `c.accentDeep`, 1.5dp, inset 2dp |
| month label / legend text | `c.muted` |
| section label ("CONSISTENCY") | `c.muted`, 11.5dp, uppercase, 0.5 letter-spacing |
| the card it sits in | `Card` — `c.surface`, `t.radius.card`, 1px `c.border` + day-only shadow |
| divider above the block | 1px `c.border` |

