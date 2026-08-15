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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **848 passed, 83 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

## Index — take them in this order

| # | Spec | Lane | From |
| --- | --- | --- | --- |
| IMP-071 | [The filter row stops jumping under your thumb](#imp-071--the-filter-row-stops-jumping-under-your-thumb) | OTA | WALK-04 (g) |

> **All three came out of WALK-04's second pass (2026-08-15), not from feature ideas.** They are **🎨 lane:
> they do not gate the release build.** The 🚦 walks in [`walk-open.md`](walk-open.md) still gate it. All
> three can land after the build and ride an OTA instead — **but they must not be half-landed across the
> bump**, so a build chat takes them in the order above and finishes each one.
>
> **The order is by user cost.** IMP-069 (landed 2026-08-16) was a user stuck with a mood they mis-tapped, on
> the one screen every entry passes through. IMP-070 is a field that accepts nonsense and never says what it
> is for — take it next. IMP-071 reverses one landed line and is the smallest of the three.
>
> **IMP-070 touches `src/screens/WriteFlow.js`, and IMP-070 and IMP-071 both touch a file IMP-069 edited.**
> They are sequential by design: each chat commits before the next begins. Do not take two in one chat.
>
> **IMP-057 is still deliberately absent.** It is reserved for the historical `dayKey` migration IMP-056
> deferred, and it cannot be written until a real device's numbers come back from the dev-panel Inspector's
> "Data health" reporter IMP-056 added. **Do not reuse the number.**
>
> **Every spec here is code-complete at green tests. None of them ends in a walk.** A build chat and a
> runtime walk are **two different tasks for two different chats** — where a feature needs runtime proof,
> the spec's last step names its `WALK-nn` row in [`walk-open.md`](walk-open.md). **Do not run a walk from a
> build chat**, and do not read a missing walk as an unfinished spec.

---

## IMP-071 — the filter row stops jumping under your thumb

**Lane: OTA.** No native change, no bump.
**Runtime proof: WALK-04**, re-run whole — not this chat.

**Why.** WALK-04 finding (g), 2026-08-15. **This reverses one line IMP-065 deliberately added** — it is a
design decision the owner made after living with it, not a defect in the implementation.

IMP-065 gave the Archive's mood filter row two behaviours at once: the selected chip sorts to the front, and
the row scrolls back to `x: 0` so the user can see where it went
([`ArchiveFilters.js:91-98`](../src/screens/ArchiveFilters.js#L91)). Walked live, the scroll is the problem:
picking a filter throws the whole row back to the start, so choosing a second and third mood means scrolling
right again each time to get back to where you were reading.

**The owner's call: the chip still moves to the front, the view does not move.** The consequence is
accepted knowingly — the chip you just tapped leaves the viewport, because it jumped to a front you are not
looking at. That is the trade IMP-065's comment argued against, and the owner has now made it the other way:
"selected moods live at the front of the row" is a rule you learn once and can then rely on, while losing
your scroll position is a cost you pay on every single tap.

### Decided design — do not re-litigate

1. **`orderMoodChips` stays exactly as it is** and keeps being used. Front-sorting is what answers WALK-04's
   first-pass finding (c) — a chip picked from deep in the row is still reachable later by flicking to the
   start, instead of being hunted for at an arbitrary position.
2. **The ref goes away entirely, not just the call.** A dead `useRef` on that `ScrollView` is an invitation
   to re-add a scroll, and this is the second design pass on these eight lines.
3. **The guard is a source assertion.** "This row must never programmatically scroll" is not observable
   through a rendered tree; `__tests__/shots.test.js` already establishes reading a source file in a test as
   a legitimate idiom in this repo.
4. **Out of scope:** `WriteFlow`'s chip row (it wraps, it never scrolls, and it belongs to **IMP-069**), the
   date-bound pickers, and the clear button.

### Steps

**1 — `src/screens/ArchiveFilters.js`: `toggleMood` stops scrolling.** Replace the whole function
([`:91-98`](../src/screens/ArchiveFilters.js#L91)) with:

```js
  // The selected chip sorts to the front (orderMoodChips) but the row deliberately
  // does NOT scroll to follow it (IMP-071, reversing IMP-065). Picking a second and
  // third filter used to cost a re-scroll each time. The accepted trade: the chip you
  // just tapped leaves the viewport — it is at the front, which is a fixed, learnable
  // place. Do not re-add a programmatic scroll here.
  const toggleMood = (m) => {
    const next = moods.includes(m) ? moods.filter((x) => x !== m) : [...moods, m];
    onChange({ text, moods: next, from, to });
  };
```

**2 — same file: delete the ref.** Remove `const chipScroll = useRef(null);`
([`:89`](../src/screens/ArchiveFilters.js#L89)) and the `ref={chipScroll}` prop from the horizontal
`ScrollView` ([`:142`](../src/screens/ArchiveFilters.js#L142)). Drop `useRef` from the React import — check
first that nothing else in the file uses it (nothing does today); if something does, leave the import alone.

### Tests (+2, no new suite files)

**`__tests__/screens/ArchiveFilters.test.js`** (+2, in a new `describe('ArchiveFilters — IMP-071')`) —
pressing an unselected chip calls `onChange` with that mood appended and `text`/`from`/`to` untouched · the
source of `src/screens/ArchiveFilters.js` contains no `scrollTo(`:

```js
const fs = require('fs');
const path = require('path');

// A source assertion on purpose: "never auto-scroll this row" is a decision
// about the code, and a rendered tree cannot show the absence of an imperative
// scroll (IMP-071).
test('the chip row never scrolls itself', () => {
  const src = fs.readFileSync(path.join(__dirname, '../../src/screens/ArchiveFilters.js'), 'utf8');
  expect(src).not.toMatch(/scrollTo\(/);
});
```

The file's existing IMP-065 cases — including both chip-order assertions — must stay green **untouched**;
the ordering is not what changed.

### Done

`npm test` green at **the prior count + 2** (848 → **850** if IMP-069 and IMP-070 landed first), **83 suite
files, unchanged**. `npx expo export --platform android` clean.
**Commit:** `fix(archive): the mood filter row stops jumping under your thumb (IMP-071)`.
No `Release-Lane` trailer. Then tick the backlog row, write the session note, move this spec into
`docs/build-log.md`, and leave **WALK-04** for a walk chat — **do not walk it here.**
