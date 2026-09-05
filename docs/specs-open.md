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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **873 passed, 85 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

## The queue is empty — no open IMP specs (2026-09-05)

**IMP-077, IMP-080 and IMP-081 all landed on 2026-09-05** and their specs are archived to
[`build-log.md`](build-log.md). With IMP-076 and IMP-078 (2026-08-17) that closes the entire
2026-08-16 design push. **The tree is on v1.0.8 / vc14, branch-only on `feat/design-push`, never
pushed.**

> **What this does NOT mean.** Three of those five specs end in a runtime walk that has not run:
> **[WALK-07](walk-open.md)** (the Paywall half — IMP-080's proof), **[WALK-03](walk-open.md) step 4**
> (`neverBackedUp`, at default *and* max font scale — IMP-081's proof) and **[WALK-18](walk-open.md)**
> (IMP-077's proof, and it needs a **mid-range device with real frame pacing** — an emulator cannot
> settle frame drops). **A build chat does not run those.** An empty spec queue with three open walks
> means the next task is a walk, not a build — see [`walk-open.md`](walk-open.md).
>
> ⚠️ **The vc14 bump means the shipped artifact no longer covers this tree.** v1.0.7 / vc13 is what is on
> Play `internal`; IMP-077 added `react-native-reanimated` and `react-native-worklets`, which are native
> deps, so **WALK-18 needs a new build** and the existing vc13 APKs cannot be used for it. WALK-07 and
> WALK-03 step 4 are pure-JS changes and can ride a debug build of this branch.

**Where the next spec comes from.** Nothing is queued. New work arrives from one of three places: a 🔴
finding in a walk (that is where IMP-080 and IMP-081 came from), the owner, or the design doc at
[`docs/superpowers/specs/2026-08-16-motion-and-design-system-design.md`](superpowers/specs/2026-08-16-motion-and-design-system-design.md)
— whose §1 and §2 are now both spent. **Do not invent a spec to fill this file.**

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
