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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **1031 passed, 93 suites** — verified 2026-09-07), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

---

## The queue is EMPTY (2026-09-07)

**Nothing here is open.** **IMP-093** landed the same day it was written (commit `061b1ff`, 1031 green)
and is archived in [`build-log.md`](build-log.md), alongside IMP-090/091/092 from earlier that day. It
**shipped by OTA the same evening** — group `964e4fc2-709c-48b1-bba1-25c603722b1c`, runtime 1.0.9,
manifest verified.

⚠️ **What is owed is a WALK, not a build.** Everything on this branch's billing surface is now
code-complete and four of the five fixes are proven or half-proven on hardware — but **IMP-091 has never
been observed at all**, and **IMP-092's `catch` branch has never executed on a device**. Neither is a
jest question; `simService` fabricates both outcomes. See [`walk-open.md`](walk-open.md) → WALK-19.

**Do not open a new billing IMP row from reasoning alone.** Every row on that surface since IMP-084 came
out of a device sitting, and the two most recent — IMP-092's cache limit and IMP-093 — were both found by
someone holding the phone and not by reading the code.

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

---

## IMP-094 — the Annual Recap must not call a month "quietest" when the journal did not exist yet

**Lane: OTA** (pure JS). **From:** WALK-11, 2026-09-07 (emulator, agent-run). **Priority: this one is
user-facing and hits the common case.**

**What was observed.** A journal whose first entry is **6 Jun 2025** opened its 2025 recap. The card read
**BUSIEST MONTH July · QUIETEST MONTH January**. January 2025 contains zero entries — the journal did not
exist. The recap presents it as the user's quietest month, as though they had been quiet in it.

**Cause, confirmed in source.** [`annualRecap.js:42-49`](../src/recap/annualRecap.js#L42-L49):

```js
function extremesByMonth(buckets) {
  let peak = 0, quiet = 0;
  buckets.forEach((b, i) => {
    if (b.total > buckets[peak].total) peak = i;
    if (b.total < buckets[quiet].total) quiet = i;
  });
```

`buckets` is all twelve months. Empty months are included, and the strict `<` with a Jan→Dec scan keeps
the **earliest** month on ties. So whenever a journal starts later in the year, every month before the
first entry is a 0 and **January always wins.** This is not an edge case: it is **every user's first
annual recap**, which is the first time anyone sees this feature.

**Why the busiest side is fine.** `peak` is only ever displaced by a strictly larger count, so empty
months can never win it. Only `quiet` is wrong. Do not touch `peak`.

**The decision (do not re-litigate).** The quietest month is chosen **only from months that fall at or
after the month of the year's first entry, and at or before the month of its last entry.** Rationale:
"quietest" is a claim about the user's writing, and a month they had not started (or had already stopped
before) is not a quiet month — it is an absent one. This matches how the heatmap already treats
pre-first-entry days, which are deliberately rendered as absent rather than as zero-activity
([`InsightsScreen.js:229`](../src/screens/InsightsScreen.js#L229)).

**Steps.**
1. In [`annualRecap.js`](../src/recap/annualRecap.js), change `extremesByMonth(buckets)` to
   `extremesByMonth(buckets, firstIdx, lastIdx)` where the two indices are the 0-based month numbers of
   the year's first and last entry. Compute `peak` over **all** buckets exactly as now. Compute `quiet`
   over **`buckets.slice(firstIdx, lastIdx + 1)`** only, keeping the existing earliest-on-ties rule
   within that window.
2. At the call site (`annualRecap.js:95`), derive `firstIdx`/`lastIdx` from the already-sorted
   `yearEntries` rather than re-sorting. If `yearEntries` is empty, return the existing empty/`null`
   shape unchanged — **do not** introduce a new one.
3. If `firstIdx === lastIdx` (a single active month), that month is both busiest and quietest. Keep it;
   it is truthful and the card already tolerates equal values.

**Tests** — extend the existing annual-recap suite; behavioural, not snapshot.
- A journal starting 6 Jun with entries every day to 31 Dec: quietest is **June** (partial) — **assert it
  is NOT January**. Verify this test FAILS against the current code before keeping it.
- A journal spanning a full Jan–Dec: behaviour is unchanged from today.
- A journal that stops in March: quietest comes from Jan–Mar, never from the empty Apr–Dec tail.
- A single-month journal: busiest === quietest === that month, no crash.
- Busiest month is unchanged in every case above.

**Commit:** `fix(recap): quietest month ignores months the journal did not cover (IMP-094)`

---

## IMP-095 — DeeperInsights "Moods by season" must survive max font

**Lane: OTA** (pure JS). **From:** WALK-08, 2026-09-07 (emulator, agent-run). **This is the only thing
keeping WALK-08 open.**

**What was observed.** At OS `font_scale` 2.0 (app body cap 1.5), the "Moods by season" card breaks in two
ways at once: month names wrap **mid-word** — "Septemb/er", "Novemb/er", "Decemb/er" — and the **third
mood in every row is ellipsised away**, so rows read "🪨 Heavy · 🪶 Light · 🙏 .." At default font all
twelve months fit one line each and all three moods render.

**Cause, confirmed in source.** [`DeeperInsights.js:103-105`](../src/screens/DeeperInsights.js#L103):

```js
<T w={700} color={c.ink} style={{ width: 84, fontSize: 13 }}>{m.month}</T>
<T w={600} color={c.muted} numberOfLines={1} style={{ flex: 1, fontSize: 13 }}>
```

`width: 84` is a hardcoded dp box that cannot grow when the text inside scales to 1.5×, so long month
names wrap inside it. `numberOfLines={1}` on the value column then clips the third mood.

**This is the same family as IMP-067**, which fixed exactly this class twice (a hardcoded
`numberOfLines={1}` in `Row.js`, and Mood Mix using `minWidth` where it needed a real width). Treat that
spec as the precedent for how this codebase solves it.

**The decision (do not re-litigate).** Rows **stack** at large font rather than fighting for one line —
the same answer the You screen already uses and which WALK-08 has repeatedly confirmed reads well.

**Steps.**
1. Read the effective body scale the app already computes ([`src/ui/textScale.js`](../src/ui/textScale.js))
   — do **not** call `PixelRatio.getFontScale()` directly here, and do not add a new source of truth.
2. Above a threshold (use the same one the You screen's stacking uses; if there is none, `>= 1.3`), render
   each month as a **stacked** block: month name on its own line, moods beneath it. Below the threshold,
   keep today's exact side-by-side row — this must be a no-op at default font.
3. In the stacked form the month label takes **no fixed width** (drop `width: 84`), and the mood line
   **raises `numberOfLines` to 2**. In the side-by-side form leave both as they are.
4. Do not change `moodByMonth`, the slice of 3, the separator string, or any copy.

**Tests.**
- Source assertion: the month label has no hardcoded `width` in the stacked branch. Verify it fails first.
- Behavioural at a stubbed large scale: the stacked branch renders, and the mood line allows 2 lines.
- Behavioural at scale 1.0: the side-by-side row renders with today's props — proving the no-op.
- A month whose three mood names are all long still renders **three** moods, not two.
- ⚠️ **Jest renders a tree, not pixels, and cannot see the mid-word wrap.** Say so in a comment in the
  test file. **Closing WALK-08 needs the emulator re-run, not a green suite.**

**Commit:** `fix(insights): Moods by season stacks instead of clipping at large font (IMP-095)`

---

## IMP-096 — the Paywall's "SAVE 50%" badge overlaps the selected checkmark at max font

**Lane: OTA** (pure JS). **From:** WALK-07, 2026-09-07 (emulator, agent-run). **Cosmetic — does not block
a purchase.** Scoped so it is not lost, not because it is urgent.

**What was observed.** At OS `font_scale` 2.0, the "SAVE 50%" badge on the Annual plan card sits low
enough to cover the top of that card's selected-state checkmark. Both are the same orange, so they read as
one shape rather than a badge and a tick. At default font the two are cleanly separated — confirmed by
cropping the same region from both screenshots. Present in **both** nav modes; the plan stays selectable.

**Steps.**
1. In [`Paywall.js`](../src/screens/Paywall.js), find the Annual card's badge and its selected-state
   checkmark. The badge is positioned against the card's top edge while the checkmark's position follows
   content that grows with font scale, so they converge.
2. Give the badge and the checkmark a layout relationship that does not depend on font scale — either
   reserve the badge's height in the card's top padding so the checkmark starts below it, or move the
   checkmark to an edge the badge never occupies. **Either is acceptable; pick one and do not add a
   scale-dependent offset**, which is the bug this file already has twice elsewhere.
3. Do not change the badge copy, the discount logic, or the plan-selection behaviour.

**Tests.** A source assertion that the badge's vertical placement is not derived from a font-scaled value.
⚠️ **State plainly in the test file that Jest cannot see this overlap** — the acceptance is the WALK-07
Paywall re-run at max font, both nav modes.

**Commit:** `fix(paywall): the savings badge stops colliding with the selected tick at large font (IMP-096)`

---

## IMP-097 — dev-harness rot: two labels that now lie

**Lane: OTA** (pure JS, **dev-only surfaces — nothing user-facing**). **From:** WALK-11 and WALK-08,
2026-09-07. Lowest priority of the four; it costs a future walker time, not a user anything.

**What was observed.**
1. [`LaunchSection.js`](../src/dev/panel/LaunchSection.js) renders the section heading **"Plus (dev-local —
   app ships free, PLUS_ENABLED stays false)"**, and its file header comment repeats the claim. Both have
   been false since `7d2e515` (2026-09-05), when `PLUS_ENABLED` became `true`
   ([`config.js:57`](../src/billing/config.js#L57)). A walker reading the panel is told the opposite of
   what the build does.
2. `DevPanel`'s **"Last backup (days ago, -1 = never)"** stepper pushes its value and its `+` control
   **off the right edge** at max font, so the knob cannot be read or incremented during exactly the walks
   that need max font.

**Steps.**
1. In `LaunchSection.js`, change the heading to **"Plus (dev-local mount — bypasses the app's own
   entry points)"**, which is what the local `Modal` actually does and stays true whichever way the flag
   goes. Update the file-header comment to match: it must no longer assert a value for `PLUS_ENABLED`.
2. Let the stepper's label wrap instead of forcing the control off-screen — give the label a flexible
   width and the control a fixed one, so the control is always reachable. Match whatever the other
   steppers in `controls.js` already do if they handle this correctly; **prefer reusing that over a new
   pattern.**
3. Touch no shipped screen. `SENTINEL`-marked dev files only.

**Tests.** A source assertion that no dev-panel string asserts `PLUS_ENABLED` is false. No behavioural
test — these are dev-only surfaces and the suite should not grow a dependency on the harness's wording
beyond that one guard.

**Commit:** `chore(dev): the harness stops claiming Plus is off (IMP-097)`
