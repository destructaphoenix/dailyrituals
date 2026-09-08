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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **1079 passed, 96 suites** — verified 2026-09-08), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

---

## The queue — two rows left, opened 2026-09-08 by owner instruction

**The owner asked for the Plus purchase surface to be investigated hard after IMP-099.** It was, by reading
the shipped SDK rather than our assumptions about it, and **the audit found a defect larger than IMP-099**.

| Row | What | Severity |
| --- | --- | --- |
| IMP-100 | Every RevenueCat purchase error becomes `failed`. `e.code` is a **number**, our mapper matches **names**. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-101 | The `failed` card claims "you weren't charged" and never asks the store. | ✅ **done — archived in `docs/build-log.md`** |
| [IMP-102](#imp-102) | Completing a purchase grants **+3 freezes every time**, not once. | 🟡 Owner decision first |

---

## IMP-102

### Completing a purchase grants +3 freezes every time — owner decision first

**Lane: OTA.** ⚠️ **DO NOT BUILD THIS YET.** It needs one owner answer, recorded in `PROGRESS.md`, before a
chat may touch it.

**The finding.** `subscribe()` in [`RitualsApp.js:290`](../src/RitualsApp.js#L290) ends with
`setFreezes((f) => f + 3)`. It runs on **every** completion, not on becoming a member: `success`, `owned`
and `restored` all carry `dismissTo: 'complete'` → `onComplete` → `subscribe()`. So restoring purchases, or
an already-owning buyer reaching the `owned` card, grants **another 3 streak freezes** each time.

**Why it is not obviously live today.** `owned` is unreachable until IMP-100 lands, and after a `restored`
the paywall closes. But `RitualsApp.js:1016` ("Change plan" in Manage Subscription) reopens the paywall for
an existing member, so the loop is reachable — **and IMP-100 is about to make the `owned` half work.**
Fixing 100 without deciding this turns a latent leak into a live one.

**The owner question, and it is genuinely a design call, not a bug report.** Are the 3 freezes a
**joining gift** (grant once, ever) or a **subscription perk** (grant per new paid period)? If joining:
gate on the `plus` flag being false at the moment of grant. If per-period: it still must not fire on
`restored`/`owned`, which are re-recognitions of an existing subscription, not new ones.

**Do not guess.** Log the answer in `PROGRESS.md` → Open items, then this spec gets its Steps written.

---

### Numbers that must not be reused

- **079** — used on 2026-09-05 for a baseline-capture path written, reviewed and deleted in the same
  session. Nothing landed under it, but the note naming `IMP-079` is still in the log, so reusing the
  number would make that note read as though it described a different spec.
- **057** — reserved for the historical `dayKey` migration IMP-056 deferred. It cannot be written until a
  real device's numbers come back from the dev-panel Inspector's "Data health" reporter IMP-056 added.

### ✅ The branch rule is OVER — `main` is the lane now

Superseded 2026-09-08: `feat/design-push` fast-forwarded onto `main` and the owner pushed it (`cb3d60e`).
**Commit normally, push to `main`, and add a `Release-Lane:` trailer only when the owner asks to ship.**
CI (`release.yml`) then owns the test gate, the native-file backstop, the billing preflight and
`--environment production`. ⚠️ **Never run `eas update` by hand** — that is what the trailer is for.

### The rules the next spec inherits

**Every spec here is code-complete at green tests. None of them ends in a walk.** A build chat and a
runtime walk are **two different tasks for two different chats** — where a feature needs runtime proof,
the spec's last step names its `WALK-nn` row in [`walk-open.md`](walk-open.md). **Do not run a walk from a
build chat**, and do not read a missing walk as an unfinished spec. IMP-077 is the newest worked example:
it ended code-complete at 873 green tests, and **its green suite proves nothing about the motion** — the
Reanimated jest mock no-ops every hook. WALK-18 settles it.
