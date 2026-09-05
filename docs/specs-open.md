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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **902 passed, 89 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

## The queue is empty — no open IMP specs (2026-09-06)

**IMP-082 and IMP-083 both landed on 2026-09-06** (commits `0e73c76` and `1f4f037`) and their specs are
archived to [`build-log.md`](build-log.md). They were the last two of the Plus-enablement sweep, and with
them the queue that opened on 2026-09-05 is closed. **The tree is on v1.0.8 / vc14, branch-only on
`feat/design-push`, never pushed.**

> **What this does NOT mean.** Both fixes are **code-complete and unproven.** They are billing surfaces,
> and jest is **structurally blind** to billing — the suite runs `simService`, which fabricates every
> purchase result, so 902 green tests say nothing about what a real subscriber sees. Their acceptance is
> **[WALK-19](walk-open.md) steps 5 and 10**, on a **device**, with a **license tester**, against the
> vc14 `internal` build. **A build chat does not run that.**
>
> ⚠️ **The one thing in IMP-083 no test can reach** is the base-plan suffix strip: `manageUrl` drops
> everything from the first `:` because RevenueCat's dashboard shows `plus_annual:annual` while Play's
> `sku` wants `plus_annual`. **The dashboard is the only evidence that is right.** If WALK-19 step 10
> lands on a "not found" page rather than the subscription, the strip is the first suspect — not the
> `?sku=&package=` shape.
>
> ✅ **Both SHIPPED by OTA on 2026-09-06**, on the owner's instruction and **ahead of their walk** —
> update group `ac5c4189-736c-44f0-96ae-6ceea4fe4712`, runtime 1.0.8, Android, from commit `8abf11f`. This is
> the **first OTA ever published on this lane**. It reaches **vc14 `internal` installs only**;
> `alpha` (vc12), `beta` and `production` (vc9) are on older runtimes and got nothing. The branch itself
> is still **not pushed** — shipping by OTA does not touch GitHub.

**Where the next spec comes from.** Nothing is queued. New work arrives from one of three places: a 🔴
finding in a walk (that is where IMP-080 and IMP-081 came from), the owner **putting the real app through
a real flow** (that is where IMP-082 and IMP-083 came from — neither was findable by reading code), or the
design doc at
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
