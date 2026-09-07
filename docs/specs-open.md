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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **1059 passed, 95 suites** — verified 2026-09-07), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

---

## IMP-098 — the Annual Recap's Top moods bars start in one place

**From:** the owner, 2026-09-07, on a screenshot of the shipped Annual Recap ("Your 2025, remembered").
**Lane: OTA** — pure JS, no native surface, no measurement API.

**What was observed.** In **Top moods**, Grateful, Heavy and Hopeful all read **14** and all three bars are
drawn **different lengths** — Grateful, the longest name, gets the shortest bar. A comparison chart in which
three equal numbers look unequal is worse than no chart.

**Cause, confirmed in source.** [`AnnualRecap.js:86`](../src/screens/AnnualRecap.js#L86):

```js
<View style={{ minWidth: 84, flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
```

`minWidth` is a floor, not a width, so the label column's real width tracks its **content**: a long mood
name widens the column and pushes that row's bar right; a short one is clamped to 84 and its bar starts
left. The rows share a right edge and not a left one, so bar length encodes the label text as much as the
count. Every row in the screenshot is at `moodMax`, i.e. all three fills are **100% of their track** — the
only thing making them different lengths is the track.

**This is IMP-067 finding (c), verbatim, on the screen IMP-067 did not touch.** That spec fixed exactly this
in `InsightsScreen.js`'s Mood Mix and put the answer in a pure module: `moodLabelWidth(fontScale)` in
[`src/insights/moodMixLayout.js`](../src/insights/moodMixLayout.js) — 96dp, growing with the OS font scale,
capped at 1.5× (144dp) because uncapped leaves the bar nothing. IMP-067's scope named `InsightsScreen` only;
the Annual Recap card (IMP-046) is a copy of the same row that predates it and was never revisited.
**Nothing new is being designed here — this is the existing fix, applied to the sibling.**

**The decision (do not re-litigate).** Reuse `moodLabelWidth`. Do **not** add a second width source, do not
invent a recap-specific constant, and do not change `MOOD_LABEL_BASE_DP`. The recap card's geometry is the
same as Mood Mix's — screen `paddingHorizontal: 20`, `Card` `padding: 18`, row `gap: 12`, count column
`minWidth: 18` — so the number that works there works here.

**Steps.**
1. In `src/screens/AnnualRecap.js`, add `useWindowDimensions` to the `react-native` import and import
   `moodLabelWidth` from `../insights/moodMixLayout`.
2. Compute `const labelW = moodLabelWidth(fontScale);` **above the `if (!recap) return null;` early
   return** — below it would put a hook after a conditional return. (Same reason IMP-067 placed the call
   above `data.empty`.)
3. Replace the label column's `minWidth: 84, flexShrink: 1` with `width: labelW`. The rest of that `View`
   stays exactly as it is (`flexDirection: 'row'`, `alignItems: 'center'`, `gap: 7`).
4. Change **nothing else in the row**. The emoji `Text` at `fontSize: 15`, the name `T`'s
   `numberOfLines={1}` + `flexShrink: 1` (that is what makes a long name ellipsize *inside* the fixed column
   instead of widening it), the bar's `flex: 1` / `height: 12`, the `opacity: 1 - i * 0.1` ramp and the
   count column are all correct as they stand and already match Mood Mix.
5. After the edit this row and [`InsightsScreen.js:136-147`](../src/screens/InsightsScreen.js#L136) are the
   same row. **Do not extract them into a shared component** — that is a larger change than this defect
   earns and it is not in scope.

**Out of scope — three things you will be tempted by.**
- **The rest of the recap screen is fine.** The hero block, the 2×2 totals grid and "The year, marked" were
  all checked against the same screenshot and align correctly. The header row's `paddingHorizontal: 18`
  against the content's `20` is **not** a slip: the same 18dp header gutter is on nine other screens
  (Achievements, MoodManager, PlusPerks, TrashSheet, Shop, Paywall, PlusFlow, ReadingSheet, WriteFlow) over
  content gutters of 20 or 24, so the round ghost button and the pill sit fractionally outside the content
  column **everywhere**. Do not "fix" any of it.
- ⚠️ **[`DeeperInsights.js:139`](../src/screens/DeeperInsights.js#L139) has the same defect and is
  deliberately NOT in this spec.** "Moods that travel together" uses `minWidth: 120, flexShrink: 1`. It is
  left open on purpose: a *pairing* label is two mood names joined ("Grateful + Hopeful"), so pinning it to
  a fixed width trades a readable label for a comparable bar — a call the owner has not been asked to make,
  and one that would also disturb a file that changed under IMP-095 and still owes **WALK-08**. **If you
  notice it, leave it.**
- The stat grid's `numberOfLines={1}` values ("September" at `fontSize: 22`) get tight at 1.5× body scale.
  Not observed, not reported, not this row.

**Tests.** New `__tests__/screens/AnnualRecap.test.js`. Follow the pattern already in
`__tests__/screens/DeeperInsights.test.js`: the `mock`-prefixed `useWindowDimensions` module mock,
`@testing-library/react-native`, `StyleSheet.flatten` on style props, and a `SRC = fs.readFileSync(...)` for
the source assertion. `AnnualRecap` takes a **prebuilt** `recap` object, so hand it a literal — there is no
need to call the builder. `useTheme` reads a context with a real default, so **no provider is needed**.

Use a fixture that reproduces the report — three moods, equal counts, names of very different lengths:

```js
const recap = {
  year: 2025, daysRemembered: 111, totalWords: 8288, longestStreak: 111,
  firstEntry: '2025-09-12', lastEntry: '2025-12-31',
  topMoods: [{ m: 'Grateful', n: 14 }, { m: 'Heavy', n: 14 }, { m: 'Hopeful', n: 14 }],
  peakMonth: 'October', quietestMonth: 'September',
  milestones: [{ day: '2025-09-12', label: 'First entry of the year' }],
};
```

`T` renders a single `Text` with no wrapper element, so the label column is
`view.getByText('Grateful').parent` — read its style with `StyleSheet.flatten`. If a future RNTL version
changes that, walk up `.parent` to the first node carrying a `width`; do **not** add a `testID` to
production code for this.

- **The regression, stated as the owner saw it:** at `fontScale` 1, the label column of **every** Top-moods
  row has the same numeric `width`, and it is **96**. ⚠️ **Verify this fails against today's screen
  first** — it must, because today two of those columns are 84 and the third is its content width.
- At `fontScale` 1.5 every column is **144**; at 2.0 still **144**. The cap belongs to `moodLabelWidth`, so
  this is what proves the screen reads the helper instead of hardcoding a number.
- Source assertion: `src/screens/AnnualRecap.js` contains **no** `minWidth: 84`.
- No-op guards: the three counts still render as `14`, and the bar fill keeps the `1 - i * 0.1` ramp
  (row 0 → opacity 1, row 2 → 0.8). The fix must not touch the ramp — equal counts are meant to differ in
  *shade*, which is exactly why they must not also differ in *length*.

**Proof.** `npm test` green and **≥ 1059 passed, 95 suites** (the count at `fe25906`).
`npx expo export --platform android` clean.

**Ship.** OTA lane. **No `Release-Lane:` trailer** — the owner has not asked for a release, and IMP-094…097
are already sitting unshipped on this branch.

**Commit (exact):**

```
fix(recap): Top moods bars start in one place (IMP-098)
```

**Runtime proof.** **Add nothing to `walk-open.md`.** Unlike IMP-095/096 this defect is a style prop, not a
glyph measurement — jest can see it, and the tests above are the acceptance. If a walker is on the recap
anyway, the eye-check is one line: three equal counts, three identical bars.

---

## Still true, and not this spec's job

**IMP-094…097 are built and archived** in [`build-log.md`](build-log.md), committed on `feat/design-push`
(`085876a`, `3030bca`, `1e12cf7`, `7bced9f`) — **and none of them is shipped.** They are OTA-lane and no
`eas update` has been published, so no phone has them yet. IMP-098 joins that unshipped batch.

⚠️ **What is otherwise owed is WALKS, not builds.** **IMP-095** is the only thing keeping **WALK-08** open
and can only be accepted at max font on a screen; **IMP-096**'s acceptance is the **WALK-07** Paywall re-run
at OS `font_scale` 2.0 in **both nav modes**; **IMP-097** is dev-only and is accepted by the next walker
finding the stepper's `+` reachable. Both walks now need a build that actually **carries** the fixes.

**Do not open a new billing IMP row from reasoning alone.** Every row on that surface since IMP-084 came out
of a device sitting, and the two most recent — IMP-092's cache limit and IMP-093 — were both found by
someone holding the phone and not by reading the code. **IMP-091 has never been observed at all** and
**IMP-092's `catch` branch has never executed on a device**; `simService` fabricates both outcomes. See
[`walk-open.md`](walk-open.md) → WALK-19.

---

### Numbers that must not be reused

- **079** — used on 2026-09-05 for a baseline-capture path written, reviewed and deleted in the same
  session. Nothing landed under it, but the note naming `IMP-079` is still in the log, so reusing the
  number would make that note read as though it described a different spec.
- **057** — reserved for the historical `dayKey` migration IMP-056 deferred. It cannot be written until a
  real device's numbers come back from the dev-panel Inspector's "Data health" reporter IMP-056 added.

### 🔒 The branch rule still stands — `feat/design-push`, never pushed

Owner instruction, 2026-08-17, extended to IMP-080/081 on 2026-09-05: **none of this work reaches
GitHub.** **Never `git push`** (the branch has no upstream so a bare push fails — do not set one),
**never add a `Release-Lane:` trailer**, and **do not merge to `main`.** Merging is a separate owner
decision taken after the walks pass. It applies to every spec that lands here next, too.

### The rules the next spec inherits

**Every spec here is code-complete at green tests. None of them ends in a walk.** A build chat and a
runtime walk are **two different tasks for two different chats** — where a feature needs runtime proof,
the spec's last step names its `WALK-nn` row in [`walk-open.md`](walk-open.md). **Do not run a walk from a
build chat**, and do not read a missing walk as an unfinished spec. IMP-077 is the newest worked example:
it ended code-complete at 873 green tests, and **its green suite proves nothing about the motion** — the
Reanimated jest mock no-ops every hook. WALK-18 settles it.

