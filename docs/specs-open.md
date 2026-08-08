# Open IMP specs — the build queue

> **What this file is.** The full spec for every **open** `IMP-xxx` task. [`PROGRESS.md`](../PROGRESS.md) keeps the
> backlog table, the live blockers and the two newest session notes; it points here for the spec body.
> Finished specs move to [`docs/build-log.md`](build-log.md). Git is the full record.
>
> **How Sonnet uses this file — read ONE spec, not the file.** `PROGRESS.md`'s backlog table names the
> first unchecked task and links to its heading here. **Open that heading only.** Every other spec in this
> file is for a different chat and reading it is wasted context.
>
> **These specs are the design.** Opus decided every open question in them — file paths, function
> signatures, copy strings, the free/Plus line. Execute the Steps in order. **Do not redesign, do not
> re-litigate a "why", and do not improve the scope.** If a step turns out to be impossible or the code
> contradicts the spec, **STOP** and log it to `PROGRESS.md` → Open items rather than inventing a fix.
>
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **508 passed,
> 53 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

## Index — take them in this order

| # | Spec | Lane | Free / Plus | Depends on |
| --- | --- | --- | --- | --- |
| 1 | [IMP-046 — Annual Recap](#imp-046--annual-recap-your-year-remembered-perk-4) | OTA | **Plus** (perk #4) | — (IMP-037 ✅, IMP-047 ✅ both done) |
| — | [IMP-045 — finish Lifetime Progress](#imp-045--finish-lifetime-progress-the-imp-021-shortfall) | OTA | Free | — · **no queue slot** |

**IMP-045 does not claim a slot.** It is small, independent and fixes a live tester complaint — take it in any
chat where the queued task is blocked, or as its own short chat. Same treatment as IMP-044.

---

## IMP-046 — Annual Recap: "your year, remembered" (perk #4)

**Lane:** OTA · **Status:** ⬜ OPEN · **Depends on: — (IMP-037 ✅, IMP-047 ✅ both done)** ·
**PLUS — perk #4 of the proposed final list**

> **⚠️ Perk numbering.** "Your year, remembered" is **not in `PLUS_PERKS` at all** today
> ([`data.js:144`](../src/data.js#L144) has 5 entries and none of them is the recap). Step 6 **appends**
> it, taking the array to 6 and finally matching the proposed table in `PROGRESS.md`. **Do not renumber
> the existing entries.**

**Goal:** at the end of a year, a Plus user gets one page that tells them what their year looked like —
the roadmap piece C the legacy pivot has pointed at since 2026-06-14, and the paywall line *"Your year,
remembered."*

**Why (settled):** value in a journal **accumulates**; the paying moment is month 2–3, not signup. A recap
is the emotional payoff of a whole year and the single most quotable thing this app can produce. It also
absorbs the **milestone timeline that IMP-021 deliberately deferred to "roadmap piece C"** — this is that
piece. See [`docs/playbook.md`](playbook.md) → "Why anyone would pay".

### Decided design (Opus — do not redesign)

- **Pure core:** `src/recap/annualRecap.js`
  - `recapYears(entries, now)` → the years offerable **right now**, newest first. A year is offerable from
    **1 December of that year** onward, and every earlier year with entries is offerable forever. **No
    partial-year recaps before December** — a "year in review" in March is a lie.
  - `buildRecap(entries, year, { xp, now })` → `{ year, daysRemembered, totalWords, longestStreak,
    firstEntry, lastEntry, topMoods, peakMonth, quietestMonth, milestones }`.
    - `topMoods` — top 3 from `moodByMonth`-style counting over that year's entries (**reuse IMP-047's
      counting; do not write a second mood counter**).
    - `milestones` — the streak milestones crossed that year, from `STREAK_MILESTONES`
      ([`data.js:68`](../src/data.js#L68)), plus the year's first entry. **This is IMP-021's deferred
      timeline; it lives here and nowhere else.**
  - **Reuse, do not reimplement:** `longestConsecutiveRun` and `currentStreak` from
    [`dateKeys.js`](../src/insights/dateKeys.js), the word count from
    [`lifetime.js`](../src/insights/lifetime.js) (**extract `countWords` to a shared module rather than
    copying it** — it is currently file-private there).
- **A recap must never be empty or embarrassing.** `buildRecap` returns `null` for a year with **fewer than
  10 entries**, and `recapYears` filters those years out. A recap of four days is worse than no recap.
- **Surface:** new full-screen `src/screens/AnnualRecap.js`, opened from (a) a Home card shown **1 Dec –
  31 Jan** when a recap is available, dismissible per year via `settings.recapSeen: <year>`, and (b) a
  permanent **"Your years"** row on the You tab listing every offerable year. **(b) is what stops the
  feature disappearing for eleven months of the year.**
- **Gating:** rendered when `plus`. When `plusEnabled && !plus`, the Home card and the You row both show
  locked with a Plus chip routing to the paywall. When `!plusEnabled`, render **nothing**.
- **Sharing is out of scope for v1.** No image export, no PDF — that is IMP-022's territory and would drag
  a native module into an OTA-lane task.

### Steps

- [ ] 1. **RED first.** `__tests__/recap/annualRecap.test.js` covering every case in Tests below.
- [ ] 2. Extract `countWords` from [`lifetime.js:4`](../src/insights/lifetime.js#L4) into
      `src/insights/words.js` and re-import it there, so recap and lifetime cannot drift apart. Existing
      `lifetime` tests must stay green untouched.
- [ ] 3. `src/recap/annualRecap.js` — `recapYears` + `buildRecap`.
- [ ] 4. `src/screens/AnnualRecap.js` — presentational, `{ recap, onClose }`. Sectioned like
      `InsightsScreen`'s cards: a hero number (days remembered), the totals, top moods, the busiest and
      quietest months, and the milestone timeline.
- [ ] 5. Home card (1 Dec – 31 Jan, `settings.recapSeen` dismissal) + the permanent You-tab "Your years"
      row, both gated per Decided design.
- [ ] 6. **Make the perk line true.** **Append** `'Your year, remembered — the Annual Recap'` to
      `PLUS_PERKS` ([`data.js:144`](../src/data.js#L144)), taking it to 6 entries. Then update
      `PROGRESS.md` → the perk table: #4 becomes ✅ built.
- [ ] 7. `npm test` green (406 + new), `npx expo export --platform android` clean, commit, update
      `PROGRESS.md`, archive this spec to `docs/build-log.md`.

### Tests

`recapYears` offers the current year **on 1 Dec and not on 30 Nov** (boundary, both sides) · offers every
prior year with enough entries · **omits a year with fewer than 10 entries** · returns `[]` for empty
history · newest first · `buildRecap` returns `null` below the 10-entry floor · counts only that year's
entries (an entry on 31 Dec of the prior year and 1 Jan of the next are both excluded) · `longestStreak` is
computed **within the year**, not across it · `topMoods` returns at most 3 and is stable on a tie
(alphabetical) · `peakMonth`/`quietestMonth` on a tie return the earlier month · `milestones` lists only
milestones actually crossed in that year · malformed entries never throw.

### Commit message

```
feat(recap): the Annual Recap — your year, remembered (IMP-046)

Roadmap piece C, and the paywall line that had no code behind it. Builds
one page per completed year: days remembered, words, the longest streak
held, top moods, busiest and quietest months, and the milestones crossed.

This is also where IMP-021's deliberately-deferred milestone timeline
lands — it lives here and nowhere else.

A year is offerable from 1 December onward and forever after, never
before: a "year in review" in March is a lie. Years with fewer than ten
entries are omitted entirely, because a recap of four days is worse than
no recap. Reachable year-round from a "Your years" row on the You tab, not
only from the seasonal Home card.
```

**Ship:** OTA. No `bump:*`.

---

## IMP-045 — finish Lifetime Progress (the IMP-021 shortfall)

**Lane:** OTA · **Status:** ⬜ OPEN · **Depends on:** nothing · **Free** · **Takes no queue slot**

**Goal:** close the two deviations from the approved Lifetime Progress design that made the owner call
IMP-021 *"not properly completed"* on the 2026-08-02 device walk.

**Why (settled 2026-08-08 — the owner chose "fix both"):** the section renders and shows real progress, so
this is a completeness question, not a crash. Re-reading the code against
[`docs/superpowers/specs/2026-06-14-lifetime-progress-design.md`](superpowers/specs/2026-06-14-lifetime-progress-design.md)
found exactly two deviations. **Both are in scope. There is no decision left to make.**

> **Numbering note:** an earlier line in `PROGRESS.md` said Opus would scope this as "IMP-033". That was
> wrong — IMP-033 is the restore-quarantine task. **This is IMP-045.** The stale pointer has been removed.

### The two shortfalls — both are in scope

1. **`xpEarned` is computed and never rendered.** Design §4 says *"`xpEarned` is surfaced quietly (e.g. in
   the level context line or a tile subtitle)"*. `deriveLifetime` returns it
   ([`lifetime.js:42`](../src/insights/lifetime.js#L42)) and
   [`InsightsScreen.js:80`](../src/screens/InsightsScreen.js#L80) prints only
   `Lv N · levelName · activeSpan`. **Decided: the level context line**, not a tile subtitle.
2. **The heatmap draws `missed` and `empty` identically.**
   [`LifetimeHeat`](../src/screens/InsightsScreen.js#L176) computes
   `has = !(cell.missed || cell.empty || cell.future)` and paints every non-`has` cell as the same
   transparent bordered box. So a genuinely-missed day is indistinguishable from a day before the user
   started, and there are **no month labels and no legend**. On a short history this reads as a wall of
   blank squares — the likely source of the "doesn't look finished" impression. It also contradicts
   **IMP-014**, which established 💀 for genuinely-missed days on the other two grids.

### 🚫 Not defects — do not "fix" these

The **milestone timeline is deferred to IMP-046** (Annual Recap), the **Home hero is untouched on owner
constraint**, and the **"Days kept" / "This month" tiles were deliberately removed** (design §2). Row count
is uncapped by design ("grows over time"). **Touch none of them.**

### Decided design (Opus — do not redesign)

- **Cell states become four, not two.** The lifetime heatmap is dense (one small square per day over a
  whole history), so it must **not** use the 💀 glyph the way `ArchiveScreen`'s 5-week grid does — a skull
  is unreadable at that size. Match IMP-014's *meaning* with density-appropriate styling instead:

  | state | fill | border |
  | --- | --- | --- |
  | `done` | `c.accent` | none (or `c.accentDeep` 2px if `today`) |
  | `missed` | `c.accentSoft` | 1px `c.border` — **present but unkept: visibly a day, visibly empty** |
  | `empty` | transparent | 1px dashed `c.border` — before the user started |
  | `future` | transparent | none — not yet a day |

- **Month labels** run down the left of the grid, one per row, printed **only on the row where the month
  changes** (blank otherwise), so the column stays quiet.
- **A three-item legend** sits under the grid: *kept · missed · not yet started*.

### Steps

- [ ] 1. **RED first.** `__tests__/insights/heatCells.test.js` against a new pure
      `src/insights/heatCells.js`:
      - `cellState(cell)` → `'done' | 'missed' | 'empty' | 'future'`, precedence
        `future` > `done` > `missed` > `empty`.
      - `monthLabelsForRows(rows)` → one string per row: the short month name (`'Jan'`) on the row whose
        **first cell** begins a new month, `''` otherwise, and always a label on row 0.
- [ ] 2. `src/insights/heatCells.js` — both functions, pure, no theme imports.
- [ ] 3. `InsightsScreen.js` → `LifetimeHeat`: consume `cellState` for the four-way styling above, render
      the month-label gutter and the legend. **No change to
      [`buildLifetimeHeatmap`](../src/home/calendar.js#L67)** — its cell shape already carries everything
      needed.
- [ ] 4. The level context line at [`InsightsScreen.js:80`](../src/screens/InsightsScreen.js#L80) becomes
      `` `Lv {level} · {levelName}{activeSpan ? ` · ${activeSpan}` : ''} · {fmt(xpEarned)} XP` ``. Keep it
      one line and keep the existing `numberOfLines` / font-scale behaviour intact (IMP-030).
- [ ] 5. `npm test` green (406 + new), `npx expo export --platform android` clean, commit, update
      `PROGRESS.md` (tick IMP-021's row to ✅ and remove the "🟡 IMP-021 … NOT properly done" block from
      Open items), archive this spec to `docs/build-log.md`.

### Tests

`cellState` for each of the four inputs · precedence when a cell carries more than one flag (a `future`
cell that also reads `empty` → `'future'`) · a `done` cell that is also `today` still returns `'done'` ·
`monthLabelsForRows` labels row 0 always · labels only rows where the month changes · a run of rows inside
one month yields `''` · a single-row grid · an empty `rows` array → `[]` · rows whose cells lack `dayKey`
never throw.

### Commit message

```
fix(insights): finish Lifetime Progress — missed vs never-started, and lifetime XP (IMP-045)

Closes the two deviations from the approved 2026-06-14 design that made
the owner call IMP-021 "not properly completed" on the device walk.

The lifetime heatmap painted missed days and days-before-you-started
identically, so a short history read as a wall of blank squares and a
genuinely missed day was invisible — contradicting IMP-014, which
established that missed days are marked. Cells now carry four distinct
states with month labels down the left and a legend beneath. The dense
grid uses fill and border rather than the skull glyph, which is
unreadable at this size.

deriveLifetime has always returned xpEarned and nothing rendered it;
it now sits in the level context line, as the design specified.
```

**Ship:** OTA. No `bump:*`.
