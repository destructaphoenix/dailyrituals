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

## The queue — one row, from the WALK-19 re-run on 2026-09-07

**IMP-090, IMP-091 and IMP-092 all landed** (commits `f38ca24`, `cba53b1`, `de5cd34`; 1017 green) and
shipped with IMP-089 in one OTA — group `424b5a88-c993-44d7-91d6-db586ad22c32`, runtime 1.0.9. The re-run
of WALK-19 that afternoon **proved IMP-090 and IMP-089 on hardware**, closed **IMP-092's online half**,
and could not observe **IMP-091** at all — because of the row below, which it found.

⚠️ **This is not urgent and the spec says so.** Nothing here loses money or strands a subscriber; the cost
is a delay and a confusing minute. It is written now because it is the reason a 🚦 walk row cannot close.

---

## IMP-093 — the paywall must not vanish mid-purchase

**Lane: OTA** (pure JS). **From:** WALK-19 step 4c re-run, 2026-09-07.

**What was observed on hardware.** Aeroplane mode, tap Subscribe. Our pending card appears, then **Google's
no-connection page covers it — and that page carries no X and no dismiss control, only Back.** Pressing
Back dismisses Google's page **and closes the entire paywall**, returning to the app. Waiting **30 seconds
without touching anything** does not help: Play's error page **does not self-dismiss**.

**What that breaks.** The `Modal` wrapping `Paywall` closes on `onRequestClose`, which unmounts the screen
and with it `usePurchaseFlow`. The pending flow is discarded silently: the unmount cleanup sets
`alive.current = false`, and **`onAbandon` never fires** — it is called only from `dismiss()`. So the app
walks away from a purchase it started **without asking the store what happened.**

**How much it actually costs — measured, not assumed.** `useLaunchEntitlementCheck`
([`entitlementSync.js:33`](../src/billing/entitlementSync.js#L33)) runs on every launch where `plus` is
false, asks the store and grants Plus if an entitlement exists. So the bad version — charged, backed out,
never noticed — **does not happen.** The user gets their Plus on the next launch. **This is a delay and a
moment of confusion, not a lost payment.** Scope it accordingly and do not gold-plate it.

**The second cost, which is why it is written at all.** It makes **IMP-091 unobservable**: the escape's
container is destroyed before the Close button can be seen, so WALK-19 step 4c cannot close either way.

⚠️ **The obvious fix is the wrong one.** Making Back a no-op while a flow is pending would keep the card
alive to be looked at — and would **re-create the exact IMP-088 trap** for the first 20 seconds, during
which no exit exists at all. **Do not do that.** Back is a *good* exit; the defect is that it exits
*without reconciling*, and that we tell the user not to use it.

**Steps.**
1. Both real mount sites — [`RitualsApp.js:980`](../src/RitualsApp.js#L980) and
   [`Onboarding.js:70`](../src/screens/Onboarding.js#L70) — must route `onRequestClose` through the flow
   rather than straight to `setPaywall(false)`. `usePurchaseFlow` already returns `flow`; expose what the
   call site needs (the pending state and `dismiss`) and, **when a flow is pending, call `dismiss()` so
   `onAbandon` fires and the app reconciles with the store** exactly as the overlay's own Close does.
   Closing the paywall afterwards is fine and expected — the point is that it reconciles on the way out.
   The dev-panel mount ([`LaunchSection.js:72`](../src/dev/panel/LaunchSection.js#L72)) may stay as-is.
2. `dismiss()` currently fires `onAbandon` **only when `stuck` was true** (`if (wasStuck && onAbandon)`).
   That guard was right when the only way to reach it was the 20-second escape. It is wrong now: a Back
   press at 3 seconds abandons a real purchase just as much as one at 30. **Reconcile whenever a flow was
   pending**, not only when it was stuck. ⚠️ Keep `onAbandon` failure-tolerant — it already goes through
   `checkEntitlement`/`nextPlusState` (IMP-043), so an unreachable store changes nothing rather than
   downgrading. That property must survive.
3. **The copy is the other half of the defect.** The pending card says *"Don't close the app."* Back
   closes it, that is safe, and after step 2 it reconciles — so the line is actively false and it is
   talking the user out of the one thing that works. Replace it with something true that still discourages
   *force-quitting* (which is what genuinely loses the reconciliation): keep it pure and testable in the
   shape `stuckCopy()` already uses. **It must still never assert an outcome** — IMP-088's rule is
   inherited verbatim and does not relax here.

**Acceptance.** Jest closes the reconciliation branch and the copy. **The device half is NOT "step 4c now
shows a Close button"** — after this fix Back still closes the paywall, deliberately, so IMP-091's escape
stays unobservable on the Play-error path and that is the correct outcome, not a regression. The device
half is: **back out of a pending purchase and confirm the app asks the store on the way out.**

⚠️ **Record honestly in the walk row:** IMP-091 may never be provable via the Play no-connection route.
Its value is the case where our card holds the foreground on its own, and the copy fix in step 3 is
arguably the larger share of what IMP-088 was really for.

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
