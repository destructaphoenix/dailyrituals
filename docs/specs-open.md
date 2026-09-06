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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **1017 passed, 93 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

---

## The queue is EMPTY (2026-09-07)

**Nothing here is open.** The last three rows — **IMP-090**, **IMP-091** and **IMP-092**, all from the
WALK-19 hardware sitting of 2026-09-06 — landed on 2026-09-07 (commits `f38ca24`, `cba53b1`, `de5cd34`;
1017 green, was 968) and are archived in [`build-log.md`](build-log.md). IMP-089 was already
code-complete. **All four shipped in one OTA on 2026-09-07** — update group
`424b5a88-c993-44d7-91d6-db586ad22c32`, runtime 1.0.9, manifest read back with a non-empty `rcAndroidKey`.

⚠️ **None of them is PROVEN.** All four close on **WALK-19**, not on jest — and the `simService` the suite
runs fabricates every one of those outcomes, so **a green suite is not evidence about any of them.** The
next task on this repo is a **runtime walk, not a build**: [`walk-open.md`](walk-open.md) → WALK-19,
step 3 → 4a → 4c. **Do not open a new IMP row against billing until that walk has run** — three of the
four fixes were themselves written from a walk, and the fourth (IMP-091) carries an unrun measurement.

**One thing IMP-091 owes the record.** Its spec's step 0 was a measurement separating *"the timer is
throttled behind Play's sheet"* from *"the device never had the IMP-088 OTA"*, and **it was not run** — it
needs the device. The fix is correct under the first and harmless under the second, and the re-run
separates them. **Do not let "IMP-088 does not work" enter the record until it has.**

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
