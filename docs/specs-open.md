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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **1063 passed, 96 suites** — verified 2026-09-08), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

---

## The queue is EMPTY (2026-09-08)

**Nothing here is open.** **IMP-098** — the Annual Recap's Top moods bars starting at three different x —
was built the day after it was scoped and is archived in [`build-log.md`](build-log.md). **1063 passed, 96
suites** (was 1059, 95), export clean, commit `edcea0b` on `feat/design-push`. **Not shipped**: OTA-lane,
no `eas update` published, joining IMP-094…097 in the same unshipped state. **Owes no walk** — it's a style
prop, not a glyph measurement, so jest proved it directly.

⚠️ **What is owed on the rest of the branch is WALKS, not builds — and most of it can only be accepted on
a screen.**

- **IMP-094** and **IMP-098** are the exceptions: both are pure logic/style and their tests are the
  acceptance. Nothing runtime is owed on either.
- **IMP-095** is the only thing keeping **WALK-08** open. Jest renders a tree, not pixels: it cannot see
  a mid-word wrap. **WALK-08 must be re-run at max font**, and only that closes it.
- **IMP-096**'s acceptance is the **WALK-07** Paywall re-run at OS `font_scale` 2.0, **both nav modes**.
- **IMP-097** is dev-only. It is accepted by the next walker finding the stepper's `+` reachable.

**Do not open a new billing IMP row from reasoning alone.** Every row on that surface since IMP-084 came
out of a device sitting, and the two most recent — IMP-092's cache limit and IMP-093 — were both found by
someone holding the phone and not by reading the code. **IMP-091 has never been observed at all** and
**IMP-092's `catch` branch has never executed on a device**; `simService` fabricates both outcomes. See
[`walk-open.md`](walk-open.md) → WALK-19.

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
