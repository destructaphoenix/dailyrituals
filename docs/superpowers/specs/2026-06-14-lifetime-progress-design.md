# Design — A+B: "Your record" (Lifetime Progress on the Insights tab)

**Date:** 2026-06-14
**Status:** Approved (owner) — ready for implementation plan
**Track:** Improvements backlog (next IMP-xxx). Second piece of the four-part "legacy" roadmap.

---

## 0. Context: where this sits

Roadmap (see [[daily-rituals-legacy-roadmap]] / `2026-06-14-backup-restore-design.md`): **D → A+B → C.**
D (Backup/Restore, IMP-020) is code-complete. This spec is **A+B**:

- **A** — surface the "days of life" idea as an emotional centerpiece.
- **B** — a Lifetime Progress / personal-growth dashboard.

A and B are the same feature at two zoom levels, so they ship together here.

**Two owner constraints that shaped this design:**
1. **Do not touch the Today hero card.** The owner loves the current Home hero (light + dark).
   So A does **not** modify HomeScreen at all — the streak stays its centerpiece.
2. Because Home is untouched, the legacy centerpiece needs a *visible* home. The **Insights tab**
   (a top-level tab, already "the shape of your days so far") is evolved to carry it.

**Milestone timeline is explicitly deferred** to its own later piece (net-new model + UI; pairs
naturally with C, the Annual Recap). This spec is **core stats + an adaptive lifetime heatmap**.

---

## 1. Goal & scope

Evolve the **Insights tab** into two clearly-headed sections:

- **"Your record"** (new) — the cumulative legacy story: a big **"days remembered"** number, a
  totals grid, and an **adaptive consistency heatmap** that grows from the user's first entry.
- **"Your patterns"** (existing, unchanged) — the mood mix + weekly rhythm cards, now grouped
  under a heading.

**No changes to:** HomeScreen, the tab bar, navigation, or persistence. **Ship lane: OTA**
(pure JS/UI, no native deps). Being purely additive to one screen, revert = an OTA revert.

**Out of scope (YAGNI / later):**
- Milestone timeline (its own piece, with C).
- Any change to the Home hero or streak mechanics.
- New persisted state (everything is derived from existing `entries` + `xp` + `streak`).

---

## 2. Wording (locked)

- Hero number label: **"days remembered"** (on-voice for the memorial-garden theme — entries are
  graves you tend; this is the life you've kept from being forgotten). Not "captured" (off-voice).
- Insights header subtitle changes from "The shape of your days so far." to **"The record you're
  building."**
- The standalone **"Days kept"** and **"This month"** tiles are removed — "days kept" *becomes*
  the hero "days remembered" number (no redundant tile); "This month" is dropped per owner.

---

## 3. Data layer (new, pure, fully unit-tested)

Mirrors the existing `deriveInsights` pattern — new code sits beside it, doesn't modify its
behavior.

### `src/insights/lifetime.js` — `deriveLifetime(entries, { xp, currentStreak, now })`

Returns (all derived from existing data — **no new persisted state**):

| Field | Meaning | Source |
| --- | --- | --- |
| `daysRemembered` | unique `dayKey` count — **the hero number** | `new Set(dayKeys).size` |
| `totalEntries` | total reflections written | `entries.length` (distinct from days — a day can hold >1) |
| `totalWords` | words across all entries | sum of word-count of each entry's `did` + `wished` |
| `currentStreak` | passed through | arg |
| `longestStreak` | best consecutive run | shared `longestConsecutiveRun` (see below) |
| `level`, `levelName` | current level | `levelFromXp(xp)` |
| `xpEarned` | lifetime XP | `xp` arg |
| `activeSpan` | friendly span label, **adaptive** | first `dayKey` → `now` |

`activeSpan` adaptivity (the "fills in over time" feel):
- no entries → `null`
- 0 days (first day) → `"Started today"`
- 1 day → `"1 day in"`; < 31 days → `"N days in"`
- < 365 days → `"N months in"` (rounded)
- ≥ 365 days → `"N years in"` (rounded to 1 decimal when < 2 years, else whole)

`totalWords` counts words as whitespace-separated tokens of the concatenated `did` + `wished`
strings (trim, ignore empty). Missing fields count as 0.

### `src/home/calendar.js` — add `buildLifetimeHeatmap(entries, today = new Date())`

**Adaptive window** (the key change from the earlier fixed-6-month idea): the heatmap spans from
the **week of the user's first entry** to the **current week** — so a new user sees a tiny grid
that literally grows week-by-week as their record accumulates.

- Reuses the existing cell model + day-state logic from `buildHeatmap` (`done` / `missed` /
  `empty` / `today`), Monday-first, 7 columns.
- Rows = whole weeks from the Monday of the first-entry week through the week containing today.
- No entries → returns `[]` (UI shows the empty-record state, §5).
- Output: an array of week-rows, each a 7-cell array, newest week last (so it reads top-old →
  bottom-recent and the freshest week sits nearest the rest of the screen). Each cell keeps the
  same shape `buildHeatmap` produces (`{ dayKey, mood?, emoji?, missed?, empty?, today? }`).

To stay DRY, extract the small shared date helpers currently duplicated between `derive.js` and
`calendar.js` (dayKey parsing, `shiftKey`, `longestConsecutiveRun`) into **`src/insights/dateKeys.js`**
and import them in `derive.js`, `lifetime.js`, and `calendar.js`. No logic changes — pure move +
re-import, with the existing tests proving nothing broke.

---

## 4. UI — evolved `src/screens/InsightsScreen.js`

Reuses the screen's existing stat-tile, `Card`, and chart components — no new design language.

```
Insights
"The record you're building."

╔═ Your record ═══════════════════╗
║              1,247               ║   ← big number (same scale/weight as
║         days remembered          ║      the app's other hero numbers)
║        Lv 7 · Keeper · 5 mo      ║   ← context line (level + activeSpan)
║                                  ║
║   312          84,120            ║   ┐
║   entries      words             ║   │ 2×2 totals grid
║   42           88                ║   │ (existing tile component)
║   streak now   longest           ║   ┘
║                                  ║
║   Consistency                    ║   ← adaptive lifetime heatmap
║   ▢▢▣▣▢▣▣                         ║      (grows from first entry;
║   ▣▣▣▢▣▣▣  …                      ║       scrolls within the page)
╚══════════════════════════════════╝

╔═ Your patterns ═════════════════╗
║   Mood mix       (unchanged)    ║
║   Weekly rhythm  (unchanged)    ║
╚══════════════════════════════════╝
```

- The screen calls **both** `deriveLifetime(...)` (for "Your record") and the existing
  `deriveInsights(...)` (for "Your patterns") — they're independent.
- `xpEarned` is surfaced quietly (e.g. in the level context line or a tile subtitle), not as a
  loud tile — level + name is the friendlier face of XP.
- Heatmap renders with the same cell styling already used for the Reflections heatmap.

---

## 5. Edge / empty / new-user states (the "adaptive" requirement)

- **No entries at all:** keep the existing Insights empty state ("write your first reflection…").
  Do not show an empty "Your record" with zeroes.
- **First days (1–6 entries):** "Your record" shows real small numbers; `activeSpan` =
  "Started today" / "N days in"; the heatmap is just the short real history. Copy should feel
  like a beginning, not a deficiency (the record visibly grows).
- **Single-day / same-day multiple entries:** `daysRemembered` counts the day once;
  `totalEntries` counts each — the two numbers diverging is intentional and meaningful.

---

## 6. Testing & ship

- **Unit tests (pure, hits the 80% bar):**
  - `deriveLifetime`: days vs entries divergence; `totalWords` counting (incl. empty/missing
    fields); each `activeSpan` bucket (today / N days / N months / N years); empty input.
  - `buildLifetimeHeatmap`: empty → `[]`; window spans first-entry week → current week; cell
    states (done/missed/empty/today) correct; same-day collision handled.
  - `dateKeys` extraction: existing `derive`/`calendar` tests still pass unchanged (proves the
    refactor is behavior-preserving).
- **Manual smoke:** Insights tab shows "Your record" with correct numbers, heatmap grows with
  history, "Your patterns" still renders mood + rhythm, empty state intact for a fresh user.
- **Ship lane: OTA.** No `bump:*`. `Release-Lane: ota` trailer only if the owner asks to ship.

---

## 7. Open questions

None blocking. Deferred by explicit decision: milestone timeline (own piece, with C); any Home
hero change (owner constraint).
