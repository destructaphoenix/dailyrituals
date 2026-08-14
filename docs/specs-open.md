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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **764 passed, 78 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

## Index — take them in this order

| # | Spec | Lane |
| --- | --- | --- |
| — | **The queue is empty.** Waiting on Opus to scope the next `IMP-xxx`. | — |

> **IMP-056 is done (2026-08-10), IMP-050 is done (2026-08-10), IMP-051 is done (2026-08-10), IMP-052 is
> done (2026-08-13), IMP-053 is done (2026-08-13), IMP-054 is done (2026-08-13), IMP-055 is done
> (2026-08-13), IMP-060 is done (2026-08-13), IMP-059 is done (2026-08-13), IMP-058 is done (2026-08-14)
> and IMP-061 is done (2026-08-14) — see `docs/build-log.md`.**
> **IMP-057 is still deliberately absent.** It is reserved
> for the historical `dayKey` migration IMP-056 deferred, and it cannot be written until a real device's
> numbers come back from the dev-panel Inspector's "Data health" reporter IMP-056 added. **Do not reuse the
> number.**
>
> **Every spec here is code-complete at green tests. None of them ends in a walk.** A build chat and a
> runtime walk are **two different tasks for two different chats** — where a feature needs runtime proof,
> the spec's last step names its `WALK-nn` row in [`walk-open.md`](walk-open.md). **Do not run a walk from a
> build chat**, and do not read a missing walk as an unfinished spec.

---
