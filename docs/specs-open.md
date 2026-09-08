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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **1068 passed, 96 suites** — verified 2026-09-08), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

---

## The queue — three rows, opened 2026-09-08 by owner instruction

**The owner asked for the Plus purchase surface to be investigated hard after IMP-099.** It was, by reading
the shipped SDK rather than our assumptions about it, and **the audit found a defect larger than IMP-099**.
Take them in order: **IMP-100 first — IMP-101 and IMP-102 are partly hidden behind it.**

| Row | What | Severity |
| --- | --- | --- |
| [IMP-100](#imp-100) | Every RevenueCat purchase error becomes `failed`. `e.code` is a **number**, our mapper matches **names**. | 🔴 **Critical — live** |
| [IMP-101](#imp-101) | The `failed` card claims "you weren't charged" and never asks the store. | 🟠 High |
| [IMP-102](#imp-102) | Completing a purchase grants **+3 freezes every time**, not once. | 🟡 Owner decision first |

---

## IMP-100

### Every purchase error becomes "failed" — `e.code` is a number and we match names

**Lane: OTA.** **This is IMP-099's defect again, one layer down**, and it was found the same way: by
reading what the SDK actually emits instead of what the code hoped it emits.

**The evidence, not the inference.** In `react-native-purchases@10.5.0`:

1. The Android bridge rejects with the **stringified numeric code** —
   `node_modules/react-native-purchases/android/src/main/java/com/revenuecat/purchases/react/RNPurchasesModule.java:708`:
   `promise.reject(errorContainer.getCode() + "", errorContainer.getMessage(), …)`.
2. Those codes are digits, not names —
   `@revenuecat/purchases-typescript-internal/dist/generated/error-codes.d.ts`:
   `PURCHASE_CANCELLED_ERROR = "1"`, `STORE_PROBLEM_ERROR = "2"`, `PRODUCT_ALREADY_PURCHASED_ERROR = "6"`,
   `RECEIPT_ALREADY_IN_USE_ERROR = "7"`, `NETWORK_ERROR = "10"`, `PAYMENT_PENDING_ERROR = "20"`,
   `OFFLINE_CONNECTION_ERROR = "35"`.
3. The SDK's own JS confirms the comparison shape — `dist/purchases.js:440`:
   `error.userCancelled = error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR` (i.e. `=== "1"`).

So in [`src/billing/mapError.js`](../src/billing/mapError.js), `String("10").toUpperCase().includes('NETWORK')`
is **false**, and so is every other `includes` in that function. **Only the `userCancelled` boolean works.**
Every non-cancel error on a real Android device returns `'failed'`.

**What that costs, in order of harm.**

- 🔴 **The `owned` rescue path is dead.** A buyer who already owns the subscription — reinstall, new phone,
  a cleared local `plus` flag, an IMP-033 quarantine — taps Subscribe, Play answers
  `PRODUCT_ALREADY_PURCHASED_ERROR` (`"6"`), and they are told **"That didn't go through … you weren't
  charged. Try again."** Worse, `buy()`'s `owned` branch in
  [`revenueCatService.js`](../src/billing/revenueCatService.js) is the code that calls `getCustomerInfo()`
  and **hands their entitlement back** — the one path designed to rescue exactly this person. It has never
  executed on a device and cannot.
- 🔴 **`PAYMENT_PENDING_ERROR` (`"20"`) is read as failure.** Deferred Play payment methods — UPI mandates,
  cash, some netbanking, all normal on the INR flows this app serves — return it while the charge is **in
  flight**. The app says "you weren't charged" and offers **Try again**, inviting a second purchase against
  a payment that may be about to succeed. This is the worst outcome in the file.
- 🟠 **`network` is unreachable**, so a genuinely offline purchase says "That didn't go through" instead of
  "No connection", and IMP-089's careful retry wording lands on the wrong card.
- 🟠 **"Change plan" is broken.** `RitualsApp.js:1016` lets a member reopen the paywall from Manage; buying
  while subscribed returns `"6"` → `failed`.

**Why the suite is green.** [`__tests__/billing/mapError.test.js`](../__tests__/billing/mapError.test.js)
feeds it `{ code: 'NETWORK_ERROR' }`, `{ code: 'PRODUCT_ALREADY_PURCHASED' }` — **names the SDK never
emits.** The fixtures agree with the code and neither has ever agreed with RevenueCat. **This is verbatim
IMP-099's failure mode**, and it is now the third time (IMP-085's `require.resolve`, IMP-099's entitlement
key, this) that a billing guard has been tested against an imagined shape.

**Do NOT import `PURCHASES_ERROR_CODE` to fix this.** `mapError.js` is pure and must stay loadable in jest;
`react-native-purchases` pulls an untransformable ESM dependency and cannot be imported there. Hard-code the
numbers **with the name in a comment**, and keep the existing name matching as a second pass so the iOS/web
and simulated shapes keep working.

**Steps.**

1. **Test first, and watch it fail.** In `mapError.test.js`, add a `describe('the codes the SDK actually
   emits — IMP-100')` block asserting: `{ code: '1' }` → `cancel`, `{ code: '10' }` → `network`,
   `{ code: '35' }` → `network`, `{ code: '6' }` → `owned`, `{ code: '7' }` → `owned`,
   `{ code: '20' }` → `deferred`, `{ code: '2' }` → `failed`. Run it. **It must fail on six of the seven
   before you touch `mapError.js`** — record which in the session note.
2. Rewrite `mapPurchaseError` as: `userCancelled === true` → `cancel` (unchanged, first, it is the only
   thing that works today); then an exact-match lookup on a `RC_CODE` map of the numeric strings above;
   then the existing name `includes` chain as a fallback; then `'failed'`. Keep it pure and dependency-free.
3. **Add the `deferred` kind.** In [`PlusFlow.js`](../src/screens/PlusFlow.js) `RESULT_META`, add exactly:
   `deferred: { tone: 'good', title: 'Payment still processing.', body: "Google Play hasn't finished
   confirming your payment. Plus unlocks by itself the moment it clears — there is nothing to buy again.",
   primary: 'OK', dismissTo: 'paywall' }`.
   ⚠️ **`dismissTo` must NOT be `'complete'`** — that calls `onComplete` → `subscribe()` → grants Plus, and
   a pending payment is not a paid one. ⚠️ **It must not offer "Try again"** — that is the whole point.
   Give it the `Info` icon in `ResultIcon` (it is not an error).
4. In `revenueCatService.js` `buy()`, pass `deferred` straight through (`return { kind }` already does);
   add a `kind === 'deferred'` case to `restore()`'s mapping so it degrades to `'failed'` there — a restore
   cannot be pending.
5. Extend `revenueCatService.test.js`: `purchasePackage` rejecting with `{ code: '6' }` now returns
   `{ kind: 'owned' }` **and calls `getCustomerInfo`** (assert the mock was called — that is the rescue
   path); rejecting with `{ code: '20' }` returns `{ kind: 'deferred' }`.
6. `npm test` green, `npx expo export --platform android` clean.

**Commit:** `fix(billing): map the error codes RevenueCat actually sends (IMP-100)`

**Walk owed.** Add a step to **WALK-19**: with a Play licence tester who **already owns** the subscription,
tap Subscribe and confirm the card reads "You already have Plus" and membership is restored — not "That
didn't go through". ⚠️ **jest cannot prove any of this**: `simService` returns `kind` directly and never
calls `mapPurchaseError` at all, which is precisely why the dev panel's outcome control has always made
`owned` and `network` look like they work.

---

## IMP-101

### The failed card claims "you weren't charged", and nothing asks the store

**Lane: OTA.** Raised during IMP-099 and deferred to its own row on purpose: IMP-099 removed the *trigger*,
this removes the *lie*.

**The defect.** `RESULT_META.failed` in [`PlusFlow.js:98`](../src/screens/PlusFlow.js#L98) reads *"Something
interrupted the purchase and **you weren't charged**. You can try again."* The app cannot know that. It is
asserted on: a resolved purchase whose entitlement we failed to read (IMP-099's exact shape), a
`PAYMENT_PENDING` charge in flight (IMP-100), a `STORE_PROBLEM_ERROR` after Play may have taken payment,
and every unrecognised error. **This is the same class of defect IMP-092 fixed for restore** — a card making
a positive claim the code has no basis for — on the one path where money is involved.

**The second half: no reconcile.** `run()` sets the result phase directly
([`PlusFlow.js:291`](../src/screens/PlusFlow.js#L291)). IMP-093's store reconcile fires **only** when a
pending flow is *abandoned* (`dismiss()`, `wasPending`). A purchase that **resolves or errors** never asks
the store again — so the app declares failure without checking, and its primary button is **"Try again"**,
which walks a possibly-subscribed buyer back into Play.

**Steps.**

1. **Reconcile before asserting failure.** In `usePurchaseFlow`'s `run()`, when `mode === 'buy'` and
   `res.kind === 'failed'`, `await checkEntitlement(service)` (from
   [`entitlementSync.js`](../src/billing/entitlementSync.js) — it never throws) **before** `clearTimer()`.
   ⚠️ **Order matters and is not negotiable:** doing it before `clearTimer()` keeps IMP-088's escape armed
   for the duration, so a hanging reconcile cannot re-create the trap that walk found. If it returns an
   entitlement, set `res = { kind: 'success', entitlement }`.
2. **Fix the copy.** `failed` for `mode === 'buy'` becomes: `title: "We couldn't confirm that."`,
   `body: "We checked with ${store} and couldn't see a subscription. If you were charged it will appear
   shortly — check before buying again."` — build the store word from the existing `storeWords(platform)`
   helper rather than a new literal. Keep `primary: 'Try again'`, but change `secondary` to `'Not now'`
   (unchanged) — the warning does the work, not the removal of the button.
   ⚠️ Leave the **restore** variant of `failed` exactly as IMP-092 wrote it (`resultCopy`'s `mode` branch).
3. Tests in `purchaseFlow.test.js`: a `buy` that returns `failed` while the store DOES hold an entitlement
   ends in `success` and never renders the failed card; one where the store holds nothing renders the new
   copy; **assert the word "charged" no longer appears as a denial** in the buy copy.
4. `npm test` green, export clean.

**Commit:** `fix(billing): stop claiming a purchase took no money (IMP-101)`

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
