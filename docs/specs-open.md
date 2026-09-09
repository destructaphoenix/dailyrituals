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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **1102 passed, 98 suites** — verified 2026-09-09), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

---

## The queue — one row left, and it is not a code task

**The owner asked for the Plus purchase surface to be investigated hard after IMP-099.** It was, by reading
the shipped SDK rather than our assumptions about it, and **the audit found a defect larger than IMP-099**.
**Three more rows came out of the WALK-19 re-run on 2026-09-08 (hardware, owner-run)**, and all three were
re-scoped the same day by reading source rather than trusting the field report. **Two of the three moved:
IMP-103 is not a defect at all, and IMP-104 no longer needs the device dump it asked for.** The
investigation also opened IMP-106, now code-complete and archived.

| Row | What | Severity |
| --- | --- | --- |
| IMP-100 | Every RevenueCat purchase error becomes `failed`. `e.code` is a **number**, our mapper matches **names**. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-101 | The `failed` card claims "you weren't charged" and never asks the store. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-102 | Completing a purchase grants **+3 freezes every time**, not once. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-103 | Step 4e failed on a bundle without IMP-100/101 — **neither was ever pushed or shipped**. | ✅ **done — shipped 2026-09-10, group `f961b427`; archived in `docs/build-log.md`** |
| IMP-104 | `tier: 'owned'` means free and `Shop.js` never reads it — and tapping such an item **wipes the ember balance to 0**. | ✅ **done — archived in `docs/build-log.md`** |
| [IMP-105](#imp-105) | 🚦 Reinstall + Restore says "Nothing to restore." **Leading explanation is now a test subscription that expired mid-walk, not a defect.** | 🟠 **Four checks (C1–C4) settle it. Still gates promotion — unproven, not known broken. The walk protocol is defective regardless** |
| IMP-106 | A healthy build cannot say which JS bundle it is running — the gap that mis-scoped IMP-103. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-107 | A lapsed member kept Plus until they happened to background the app — no launch-time downgrade check. | ✅ **done — archived in `docs/build-log.md`** |

---

## IMP-105

### 🚦 Reinstall + Restore says "Nothing to restore" — the leading explanation is now test-subscription expiry, not a bug

**Lane: TBD — no cause established, and the balance of evidence has moved AWAY from a code defect.**
Still gates `internal` → `production`, because the case remains **unproven**, not because it is known
broken. Found on the WALK-19 re-run, 2026-09-08 (hardware, owner-run), step 9.

**The finding as walked.** With an active, just-purchased subscription: uninstalled the app, reinstalled
from Play, tapped Restore. Result: **"Nothing to restore."**

### Round 1 — what reading the source ruled out (2026-09-08)

- **Not the embedded vc15 bundle.** On it, IMP-085's dead `require.resolve` probe makes
  `isBillingConfigured` false, so `PAYWALL_LIVE` is false, so
  [`YouScreen.js:134-140`](../src/screens/YouScreen.js#L134) hides the "Restore purchases" row and the
  paywall cannot open. **There is no Restore button to tap on that bundle.** The observation came from the
  OTA'd bundle, second launch or later.
- **Not `ENTITLEMENT_ID` / IMP-099.** That bundle is `d42b7ec7`, which contains IMP-099.
- **Not `restore()`, `toEntitlement()` or `mapPurchaseError()`.** Step 4f is the control: same device,
  same account, same bundle, minutes earlier, Restore returned "Plus Restored." Identical code ran both
  times. The only variable that changed is the reinstall.

### Round 2 — the owner's dashboard checks (2026-09-08). Results, and what they mean

| Check | Result | Verdict |
| --- | --- | --- |
| **A1** Restore Behavior | **"Transfer to new App User ID"** | ❌ **Candidate 1 is DEAD.** The transfer policy is the permissive one. A reinstall's new anonymous App User ID *should* receive the purchase |
| **A2** Customer record | **No customer with an active entitlement.** 3 records, all dated the day before | 🔴 **The new lead — see below** |
| **A3** Entitlement identifier | `Daily Rituals Plus` | ✅ Clean, matches `config.js` |
| **A4** Play credentials | Valid | ✅ Clean |
| **A5** Play Console order | Not findable | ⬜ **Inconclusive by design, not a finding.** Google Play **license-tester purchases are test purchases and never appear in Play Console Order Management.** Do not read this as evidence of anything. The place a test subscription *is* visible is on the phone: Play Store → Payments & subscriptions → Subscriptions |

### Round 2.5 — a second, independent witness nobody read (2026-09-10)

**`restore()` was not the only call that said "no entitlement" on 2026-09-08. `getEntitlement()` said it
too, seconds earlier, and nobody noticed.** This was found by reading the shipped tree, not by a new walk.

On the live group `d42b7ec7`, `useLaunchEntitlementCheck` runs **exactly** the step-9 scenario:

```
git show 768bc88:src/billing/entitlementSync.js
  useLaunchEntitlementCheck({ plus, service, onEntitlementFound })
    if (plus || ran.current) return;          // a reinstall has plus === false
    checkEntitlement(service).then(...)       // → service.getEntitlement()
    if (result.verified && result.entitlement) onEntitlementFound(...)
```

A reinstall mounts with `plus: false`, so the hook fires on its own at launch and asks the store
directly. And the Restore row is gated on `!plus`
([`YouScreen.js:134`](../src/screens/YouScreen.js#L134), identical on both bundles):

```
{plusEnabled && !plus && onRestorePurchases && ( … "Restore purchases" … )}
```

**So the row the owner tapped could only have been on screen because the launch check had already come
back empty.** Had `getEntitlement()` found a live entitlement, `plus` would have flipped, the row would
have vanished, and there would have been nothing to tap.

**Why this matters: it is a different SDK call reaching the same verdict.** `restorePurchases()` and
`getCustomerInfo()` are separate entry points; a defect confined to `restore()`, `toEntitlement()` or
`mapPurchaseError()` cannot explain both. What explains both in one stroke is the customer genuinely
having no active entitlement at that moment — **which is the expiry story.** ⚖️ **This pushes the balance
back TOWARD expiry, partially offsetting C1.**

⚠️ **Two caveats, and they are why this does not close the row on its own.**

1. **A race is possible.** The check is async and unawaited. If the owner reached the You tab and tapped
   before it resolved, the row's presence proves nothing. Unknowable after the fact.
2. **First launch is exempt.** vc15's embedded bundle has IMP-085's broken probe, so on the reinstall's
   *first* launch the service is not live and the check is meaningless. This argument applies only to the
   second (post-OTA) launch — which is the one the owner tapped Restore on.

**Consequence for WALK-19a: the Restore row's presence at step 6 is now itself a recorded observation,
not scenery.** If the row is **absent** and the app already says member, the entitlement survived the
reinstall by the launch path and IMP-105 is answered without a Restore tap at all. That is a pass, and it
is a *cleaner* pass than tapping. The walk has been amended to say so.

### The new leading candidate: the test subscription expired mid-walk — **weakened by C1**

**A2 is the whole story, and it fits a documented Google behaviour.** Google Play compresses test
subscriptions for license testers: **a monthly subscription renews every 5 minutes and a yearly one every
30 minutes, and Google auto-cancels the test subscription after 6 renewals.** So a license-tester
subscription has a total lifetime of roughly **30 minutes if monthly, ~3 hours if annual** — after which
it is genuinely, correctly gone.

WALK-19's re-run ran steps 4e, 4f, 5, 6 and a full step-7 perks tour between the purchase (4d) and the
reinstall (9) — and step 9 itself includes an uninstall, a Play re-download and install, a first launch,
a second launch for the OTA to apply, and only then the Restore tap.

⚠️ **C1 is answered and it cuts against this theory. The owner bought ANNUAL (2026-09-09).** That is the
long-lived test subscription — roughly **three hours**, not thirty minutes. The 4d→9 gap has to have
exceeded three hours for expiry to explain step 9, and a perks tour plus a reinstall is more plausibly
one to two. **Expiry is no longer the comfortable answer; it is one of two live possibilities, and the
other one is a real bug.** Do not close this row on the expiry story without C3.

If so: RevenueCat holding **no active customer** is not a missing record, it is an **expired** one, and
`restorePurchases()` resolving with nothing active was **correct**. "Nothing to restore." would be the
truth, and there is no defect in this app.

**This is the leading candidate, not a conclusion.** It is not yet confirmed, and the row stays open.

### What settles it — four checks, still no code

- **C0 · `getEntitlement()` agreed with `restore()`.** ✅ **ANSWERED 2026-09-10 from source** — see Round 2.5. Two independent SDK calls both found nothing, which no `restore()`-only defect explains. Weakens the bug theory; does not kill it (a race is possible).
- **C1 · Which plan was bought at step 4d?** ✅ **ANSWERED 2026-09-09: annual.** Lifetime ≈ 3 hours, not
  30 minutes. **This weakens the expiry theory rather than confirming it** — see above.
- **C2 · Wall-clock gap between step 4d and step 9.** Owner's recollection to within ten minutes is
  enough. Under three hours ⇒ expiry does **not** explain step 9 and the defect is real.
- **C3 · 🚦 THE DECIDING CHECK, and it is still available.** RevenueCat → Customers, **with the SANDBOX
  filter ON** — Play license-tester purchases are sandbox transactions and the default view may exclude
  them, which would explain "no active customer" all by itself. Open the 2026-09-08 customer and read
  **the entitlement's `expiration date`** and the event timeline. ⚠️ **A lapsed subscription does not
  delete the customer record** — RevenueCat keeps the history, so the fact that the subscription is now
  long dead costs nothing here. Compare that expiry stamp against when Restore was tapped: **before ⇒
  expiry, no bug. After ⇒ a real defect, and Round 3 begins.**
- **C4 · On the phone: Play Store → Payments & subscriptions → Subscriptions.** ⬜ **Now moot** — the test
  subscription is ~12 hours dead as of 2026-09-09, so this can no longer distinguish anything. Skip it.

**Outcomes and what each means.**

- **Expiry confirmed (C1+C2+C3 agree):** there is no bug. Close IMP-105 as *not reproducible — walk
  protocol defect*, unblock the promotion, and fix the **walk**, not the app (see below). The row still
  cannot be ticked until step 9 actually passes on a live subscription.
- **The customer is there and active, only hidden by the sandbox filter:** the defect is real and
  unexplained, and Check B (below) becomes the next step.
- **The customer exists but the reinstall never created a second App User ID:** the SDK never
  initialised on the reinstalled app. Different bug entirely — look at `Purchases.configure` in
  [`App.js:50-55`](../App.js#L50) running before the RC key resolves.

**Check B is now dead too.** Tapping Restore on the phone today cannot distinguish anything: the
subscription has genuinely lapsed, so "Nothing to restore" is the correct answer regardless of which
theory is true. **Do not run it and do not read anything into it.** C3 is the only check left that
carries information.

### 🚦 The walk protocol is defective regardless of the outcome

**This is the durable fix and it is owed even if the app is innocent.** A license-tester subscription
cannot survive a leisurely walk, so WALK-19's step ordering — purchase at 4d, reinstall at 9, an entire
perks tour in between — **structurally cannot test what step 9 exists to test.** Amend WALK-19:

1. **Buy → uninstall → reinstall → Restore must be ONE tight block**, run immediately after the purchase,
   before anything else. Everything non-urgent (perks tour, renewal date, ember packs) moves after it, or
   onto a second purchase.
2. **Record the plan bought** (monthly / annual) and the **wall-clock time of every step**. Neither was
   captured on 2026-09-08, and their absence is why this row cannot be closed today.
3. **Prefer annual for any test that needs the subscription to outlive several steps** — ~3 hours of life
   instead of ~30 minutes.
4. Note in the row that Play Console Order Management will never show these purchases, so nobody burns
   another ten minutes looking (A5).

**Do not write a code fix on this row.** Not a retry loop, not a delay, not softer `restore-empty` copy —
the last would undo IMP-092. If C1–C4 implicate timing rather than expiry, the shape to reach for is
`Purchases.syncPurchasesForResult()`, present in `react-native-purchases` 10.5.0 and confirmed in
`dist/purchases.d.ts`. Named so the next chat need not rediscover it; **not authorised.**

**Acceptance.** WALK-19 step 9, re-run under the amended protocol above: uninstall → reinstall from Play →
Restore recovers a **still-live** entitlement without a second charge. Step 10 (cancel flow) stays behind
it.

---

### Parked: embers for money — a conversation, not yet a spec

**Owner, 2026-09-08:** *"embers need to be made acquirable for money — without embers you cannot buy
candles."* **Parked for its own chat. Nothing here is authorised to build.** This section exists so that
chat starts from findings instead of re-deriving them. It is not an `IMP-xxx` and must not be given a
number until the two questions at the bottom are answered.

**Where it actually stands.** `EMBER_PACKS_ENABLED` is `false` ([`config.js:82`](../src/billing/config.js#L82)).
`EMBER_PACKS` already exist in [`data.js:157-161`](../src/data.js#L157) carrying real prices
(`$1.99` / `$4.99` / `$9.99`). But the buy handler at
[`RitualsApp.js:985`](../src/RitualsApp.js#L985) is `onBuy={(pack) => setEmbers((e) => e + pack.amount)}`
— a bare counter increment. No purchase service, no RevenueCat, no IAP of any kind.
⚠️ **Flipping the flag today ships a store that displays dollar prices and hands over the goods for
free** — the exact vc14 giveaway shape IMP-084 was opened for. The flag is the only thing preventing it.

**The economy as built.** `EMBER_GAIN` is 15 per day kept. Candles cost 120 / 300 / 450 for 1 / 3 / 5;
palettes 240–420; skies 300. One candle ≈ 8 days of writing; the $1.99 pack ≈ 16 days of earning.

**Three findings the decision turns on.**

1. **Selling embers is selling streak protection.** Candles auto-spend to repair a broken streak
   ([`streakFreeze.js:14`](../src/home/streakFreeze.js#L14)). Once embers are purchasable, a user who
   breaks a streak can buy it back with cash. For an app whose proposition is an honest record, that is
   the one mechanic where money buying a better outcome costs something real. Mitigations exist (candles
   must be *held before* the missed day; or cash buys cosmetics only and candles stay earned) — but the
   choice has to be deliberate.
2. **A shipped promise is already wrong, independent of this.** `PLUS_PERKS[1]` sells *"Streak insurance
   — a candle spends itself when you miss a day"* as a **Plus** perk, and `Onboarding.js:31` shows it in
   the first three. **`applyAutoFreeze` is not gated on `plus` at all** — free users already get it. Either
   gate it or rewrite the line. This is a live mis-sell today and it decides what ember money would be
   buying.
3. **Consumables are a build lane and harder than the subscription was.** New Play *consumable* products
   attached in RevenueCat; `revenueCatService.buy()` only knows subscription packages and would need
   `purchaseStoreProduct` plus `getProducts(..., 'NON_SUBSCRIPTION')` (both confirmed present in
   `react-native-purchases` 10.5.0). The sharp edge: **consumables are not restorable the way a
   subscription is.** `CustomerInfo.nonSubscriptionTransactions` exists, but the app must track which
   grants it has already applied or a reinstall double-grants / loses them. **Do not build this while
   IMP-105 is open** — that is a reinstall-restore question on the *simple* case. The `$1.99` literals
   must also become store-fetched, the way IMP-090 made the trial copy honest, especially on INR.

**Recommendation on the table (owner has not ruled).** Ship **cosmetics-first**: cash buys embers, embers
buy palettes and skies, candles stay earned. Captures nearly all the revenue upside, costs none of the
streak integrity, and avoids the consumable-ledger problem entirely because cosmetics are durable state
the app already persists.

**The two questions that must be answered before any spec is written.**

1. **Does cash buy candles, or only cosmetics?**
2. **Is auto-freeze a Plus perk or free for everyone?** The code says free; the paywall says Plus.

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
