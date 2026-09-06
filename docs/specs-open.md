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

---

## The queue — three rows, all from the WALK-19 device sitting on 2026-09-06

**These are walk findings, not inventions.** The owner ran WALK-19 steps 1–4 on hardware
(1.0.9 / vc15, `internal`, license tester, OTAs applied) and the sitting stopped at step 4 without a
purchase being attempted, deliberately. **IMP-089 was fixed in the same session at the owner's explicit
instruction** and is archived in [`build-log.md`](build-log.md); the three below are open.

⚠️ **Nothing here is walkable without a device.** All three close on WALK-19, not on jest — and the
`simService` the suite runs fabricates every one of these outcomes, so **a green suite is not evidence
about any of them.**

---

## IMP-090 — the paywall stops promising a trial it cannot see

**Lane: OTA** (pure JS). **From:** WALK-19 step 3, 2026-09-06.

**What was observed on hardware.** Our button reads `Start 7-day free trial`. Google Play's own purchase
sheet, opened from that button on the license-tester account, said **charging today** with the INR amount
and no free period. **The owner has subscribed and unsubscribed on this account before**, and a Play free
trial is **once per Google account, ever** — so Play is almost certainly correct and the product config is
probably fine. The defect is that our button asserts a trial regardless.

**Why the app cannot currently be right.** The claim is a hardcoded string literal at
[`Paywall.js:122`](../src/screens/Paywall.js#L122), and the app never fetches anything that could
contradict it: [`revenueCatService.getPrices()`](../src/billing/revenueCatService.js#L69) returns exactly
`priceString` and `price` per plan and drops the rest of the package. There is no trial data anywhere in
the app's model, so the CTA is not "wrong about the offer" — it has never had an offer to be right about.

**The decision, and it is not "read the offer and print the days."** RevenueCat's Android products do
expose the offer's free phase (`defaultOption` / `subscriptionOptions`), but **that describes the offer,
not this buyer's eligibility** — Play decides eligibility at purchase time and Android has no equivalent
of iOS's eligibility check. So reading the offer and printing *"Start 7-day free trial"* would reproduce
exactly today's bug for every returning subscriber. **The CTA must never name a trial it cannot confirm
the buyer will get.**

**Steps.**
1. `getPrices()` gains a third field per plan, `trialDays` — the free-phase length from the package's
   product when one exists, `null` otherwise. Wrap the read so a missing/renamed SDK field yields `null`
   rather than throwing; the existing `catch` returning `{}` stays.
2. `mergePrices` carries `trialDays` through under the same rule the file already states: the constants
   never assert what the live data contradicts. With no live offering, `trialDays` is `null`.
3. New pure `ctaLabel({ trialDays })` in `src/billing/prices.js`, exported and unit-tested:
   `null` → `'Subscribe'`; a number → `'Try free, then subscribe'`. **It never interpolates the day
   count into the button**, because the count is the part we cannot promise.
4. `Paywall.js` renders `ctaLabel(...)` instead of the literal. The trial *detail* may stay in the
   descriptive copy near the plan selector, where it reads as a description of the offer rather than a
   promise to this buyer — reword it to *"7 days free for new subscribers"* if it currently promises.
5. Same sweep for the onboarding paywall mount and `shopui.js`'s **"Try free"** banner
   ([`shopui.js:77`](../src/shopui.js#L77)) — it makes the same promise in two words and must take the
   same treatment.

**Acceptance:** WALK-19 step 3. On an account that has burned its trial, our button and Play's sheet must
agree. Jest closes only the pure `ctaLabel` / `mergePrices` half.

---

## IMP-091 — the pending escape never appeared on hardware

**Lane: OTA** (pure JS). **From:** WALK-19 step 4's `network` case, 2026-09-06. **This is IMP-088's
acceptance failing.**

**What was observed on hardware.** Airplane mode, tap buy. The card showed *"Confirming with Play Store…"*
and *"Don't close the app."* Google's sheet then raised its own no-connection error on top; behind it the
app was still confirming. **At 22s, 32s and past 60s the Close button never appeared** and the copy never
changed. IMP-088 shipped exactly that escape by OTA (group `82bc2b16`), so either it does not work on a
device or it was not running.

**What has been ruled out.** The wiring is correct and was re-read this session: `Paywall.js` renders
`flow.overlay` ([`Paywall.js:127`](../src/screens/Paywall.js#L127)), and the hook's `overlay` passes
`stuck` into `PurchaseOverlay` — so this is **not** a missing prop, and not the class of bug where a call
site builds its own overlay.

**The prime suspect, unconfirmed.** The only thing that arms the escape is a `setTimeout` in `run()`
([`PlusFlow.js:198`](../src/screens/PlusFlow.js#L198)). Google Play's purchase sheet is a **separate
Android activity**, so while it is up our app is backgrounded — and Android throttles background JS
timers. A timer that does not run cannot arm anything, and the user is looking at Play's sheet for the
whole grace period.

⚠️ **Step 0 of this spec is a measurement, not a code change.** The two candidate causes need separating
before anything is written, because they have different fixes:
- **(a) the timer is throttled behind Play's sheet** → the fix below, or
- **(b) the device never had the IMP-088 OTA** → not a code defect at all.

Separate them with `adb logcat | grep -i "expo-updates\|EXUpdates"` on launch, or by reading the running
bundle id off the IMP-087 diagnostic. **Do not write the fix until (b) is excluded.** The restore path
cannot be used as a proxy — see IMP-092; it never hangs.

**The fix, if (a).** Arm the escape off **elapsed time**, not off a timer that may not run.
1. `run()` stamps `startedAt = Date.now()` in a ref alongside the existing timer, which stays (it is
   correct whenever the app is in the foreground the whole time — the restore path).
2. Subscribe to `AppState`. On transition to `active`, if a flow is pending and
   `Date.now() - startedAt >= graceMs`, `setStuck(true)` immediately.
3. Unsubscribe on unmount alongside the existing `alive` teardown.

⚠️ **IMP-088's rule is inherited verbatim and must not be relaxed:** this **never asserts an outcome**. It
unlocks a way out; `stuckCopy()` still refuses to claim the purchase failed, and `onAbandon` still
reconciles with the store. A real INR/3DS charge takes minutes and declaring failure mid-charge remains
the one outcome worse than a spinner.

**Acceptance:** WALK-19 step 4, `network` case, on a device. Jest can pin the AppState reducer pure-ly but
**cannot see the throttling that caused this** — it has no Play sheet and no Android activity lifecycle.

---

## IMP-092 — "Nothing to restore" is also what a failed check says

**Lane: OTA** (pure JS). **From:** WALK-19, 2026-09-06 — found while trying to test IMP-091.

**What was observed on hardware.** In **airplane mode**, tapping Restore returned **"Nothing to restore."
instantly** — no pending phase, no delay. The owner's note is the important half: *it has been instant all
this time.*

**The defect, which is provable from the code and does not depend on which branch fired.**
[`revenueCatService.restore()`](../src/billing/revenueCatService.js#L52) collapses its whole error space
into three outcomes:

```js
return { kind: kind === 'owned' ? 'restored' : kind === 'network' ? 'network' : 'restore-empty' };
```

**Every error that is not recognised as `network` or `owned` becomes `restore-empty`** — the one kind
that makes a positive claim about the user's account. `mapPurchaseError` returns `'failed'` for anything
it does not recognise, and that `'failed'` is silently relabelled *"We couldn't find a subscription on
this account."* The same sentence therefore means both *"we checked, you have nothing"* and *"we could not
check."*

This is the **exact inverse** of the rule `getEntitlement()` states four lines below it, which
deliberately does not swallow its error because *"a failed call must be distinguishable from a successful
one that finds no entitlement"* (IMP-043). `restore()` does the thing its neighbour is commented against.

**Why it matters more than it looks.** The person most likely to tap Restore is a **real subscriber on a
new phone**. Telling them their subscription does not exist — when the truth is that we could not reach
the store — is the worst sentence this flow can produce, and it points them at support.

**Steps.**
1. `restore()` stops relabelling. An unrecognised error returns `{ kind: 'failed' }`; only a *successful*
   call that finds no entitlement returns `restore-empty`.
2. `RESULT_META.failed`'s copy is currently purchase-shaped (*"Something interrupted the purchase and you
   weren't charged"*), which is wrong for a restore. Give `PurchaseOverlay` a restore-mode variant of the
   `failed` card: *"We couldn't check."* / *"Something stopped us reaching the store. Nothing has changed
   — try again in a moment."* Keep it pure and testable in the shape `stuckCopy()` already uses.
3. **Separately, and worth a source comment where it will be read:** an instant answer in airplane mode
   means `Purchases.restorePurchases()` resolved from RevenueCat's **local cache** rather than failing.
   That is SDK behaviour, not ours, but it means `restore-empty` is reachable offline for a genuine
   subscriber whose cache is cold. Step 1 does not fix that; record it as a known limit in the walk row.

**Acceptance:** WALK-19 step 4, the `restore-empty` case, re-run **twice** — once online with no
subscription (must still say "Nothing to restore") and once in airplane mode (must **not**).

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
