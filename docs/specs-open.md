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

## The queue — five rows left

**The owner asked for the Plus purchase surface to be investigated hard after IMP-099.** It was, by reading
the shipped SDK rather than our assumptions about it, and **the audit found a defect larger than IMP-099**.
**Three more rows came out of the WALK-19 re-run on 2026-09-08 (hardware, owner-run)**, and all three were
re-scoped the same day by reading source rather than trusting the field report. **Two of the three moved:
IMP-103 is not a defect at all, and IMP-104 no longer needs the device dump it asked for.** The
investigation also opened IMP-106.

| Row | What | Severity |
| --- | --- | --- |
| IMP-100 | Every RevenueCat purchase error becomes `failed`. `e.code` is a **number**, our mapper matches **names**. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-101 | The `failed` card claims "you weren't charged" and never asks the store. | ✅ **done — archived in `docs/build-log.md`** |
| [IMP-102](#imp-102) | Completing a purchase grants **+3 freezes every time**, not once. | 🟢 **UNBLOCKED — owner ruled per-period 2026-09-09. Ready to build** |
| [IMP-103](#imp-103) | Step 4e failed on a bundle without IMP-100/101 — **neither was ever pushed or shipped**. | 🟢 **Ship + re-walk. NO code change** |
| [IMP-104](#imp-104) | `tier: 'owned'` means free and `Shop.js` never reads it — and tapping such an item **wipes the ember balance to 0**. | 🟢 **Ready to build — cause found, no dump needed** |
| [IMP-105](#imp-105) | 🚦 Reinstall + Restore says "Nothing to restore." **Leading explanation is now a test subscription that expired mid-walk, not a defect.** | 🟠 **Four checks (C1–C4) settle it. Still gates promotion — unproven, not known broken. The walk protocol is defective regardless** |
| [IMP-106](#imp-106) | A healthy build cannot say which JS bundle it is running — the gap that mis-scoped IMP-103. | 🟢 **Ready to build** |
| [IMP-107](#imp-107) | A lapsed member keeps Plus until they happen to background the app — no launch-time downgrade check. | 🟢 **Ready to build** |

---

## IMP-102

### The +3 streak freezes are a PER-PERIOD perk — grant once per paid period, never on a re-recognition

**Lane: OTA.** ✅ **UNBLOCKED — owner ruled 2026-09-09: per-period perk, not a joining gift.** The
design below follows from that ruling; do not re-open it.

**The finding.** `subscribe()` at [`RitualsApp.js:290-298`](../src/RitualsApp.js#L290) ends with
`setFreezes((f) => f + 3)`, and it runs on **every** completion rather than on entering a new paid period.
`success`, `owned` and `restored` all carry `dismissTo: 'complete'` → `onComplete` → `subscribe()`, so
restoring purchases or reaching the `owned` card grants another 3 freezes each time. `RitualsApp.js:1016`
("Change plan" in Manage Subscription) reopens the paywall for an existing member, so the loop is
reachable by hand — and IMP-100 makes the `owned` half work.

**What "per period" has to mean in an app with no server.** The grant must fire once for each paid period
and never for a re-recognition of a period already granted. The device clock cannot be trusted and the
local `plus` flag is a cache, so the only durable, store-authoritative marker of *which* period this is
is the entitlement's own **`renewISO`** (RevenueCat's `expirationDate`, carried through
[`toEntitlement`](../src/billing/revenueCatService.js#L29)). It changes on every renewal and on nothing
else. Store the period already paid for; grant only when the live entitlement names a different one.

That single rule covers every case without special-casing any of them:

| Situation | `renewISO` | Grant? |
| --- | --- | --- |
| First purchase | `X` vs stored `null` | ✅ grant, store `X` |
| `restored` / `owned` in the same period | `X` vs stored `X` | ❌ correctly silent |
| "Change plan" reopening the paywall | `X` vs stored `X` | ❌ correctly silent |
| Relaunch, launch check, AppState refresh | `X` vs stored `X` | ❌ correctly silent |
| Renewal | `Y` vs stored `X` | ✅ grant, store `Y` |
| Cancel, then resubscribe later | `Z` vs stored `X` | ✅ a genuinely new paid period |

**Where the grant must live — NOT in `subscribe()`.** A renewal is learned in the background, never
through the paywall. The app learns a live entitlement in **five** places
([`subscribe`](../src/RitualsApp.js#L290), [`reconcileAfterAbandon`](../src/RitualsApp.js#L330),
[`doRestore`](../src/RitualsApp.js#L344), the [AppState listener](../src/RitualsApp.js#L364), and
`useLaunchEntitlementCheck`'s `onEntitlementFound`), and every one of them ends by calling
`setLiveEntitlement`. So the grant hangs off **`liveEntitlement` changing**, which covers all five with
one piece of code and cannot be missed by a sixth added later.

**Steps.**

1. **New file `src/billing/freezeGrant.js`** — pure, so the whole rule is pinnable in jest:

   ```js
   export const PERIOD_FREEZES = 3;

   // Returns null when nothing is owed, or { period, freezes } to grant and record.
   // `'no-expiry'` is the sentinel for an entitlement with no expiration date: it
   // grants exactly once, ever, rather than on every read.
   export function freezeGrantFor(entitlement, lastGrantedPeriod) {
     if (!entitlement || entitlement.active !== true) return null;
     const period = entitlement.renewISO || 'no-expiry';
     if (period === lastGrantedPeriod) return null;
     return { period, freezes: PERIOD_FREEZES };
   }
   ```

   Header comment: the owner's 2026-09-09 ruling, and why `renewISO` is the period key (store-authoritative,
   immune to the device clock, changes on renewal and nothing else).

2. **`src/persistence/state.js`** — add `'lastFreezeGrantPeriod'` to `PERSISTED_KEYS`. **No schema bump
   and no migrator**: an absent key reads as `undefined` → `?? null`, which is exactly right for a user
   who has never been granted. `SCHEMA_VERSION` stays `3`.

3. **`src/RitualsApp.js`** —
   - Add state beside `freezes`: `const [lastFreezeGrantPeriod, setLastFreezeGrantPeriod] = useState(initialState.lastFreezeGrantPeriod ?? null);`
   - **Delete `setFreezes((f) => f + 3);` from `subscribe()`.** Leave the rest of `subscribe()` alone,
     including its `'Welcome to Plus — enjoy.'` toast.
   - Add the effect:

     ```js
     React.useEffect(() => {
       const grant = freezeGrantFor(liveEntitlement, lastFreezeGrantPeriod);
       if (!grant) return;
       setFreezes((f) => f + grant.freezes);
       // Only a RENEWAL is otherwise invisible; a first grant is already covered
       // by subscribe()'s welcome toast.
       if (lastFreezeGrantPeriod !== null) showToast('+3 candles — your Plus perk renewed');
       setLastFreezeGrantPeriod(grant.period);
     }, [liveEntitlement, lastFreezeGrantPeriod]);
     ```
   - Add `lastFreezeGrantPeriod` to **both** persisted-slice literals (the save effect at
     `RitualsApp.js:521-531` **and** the export slice at `~645`) and to the save effect's dependency
     array. ⚠️ Missing either one is the whole bug back again — an unsaved marker re-grants on every
     launch.

4. **Tests**, each proven red first:
   - `__tests__/billing/freezeGrant.test.js` — the six rows of the table above, plus: `null` entitlement →
     `null`; `active: false` → `null`; `renewISO: null` twice in a row grants once then never again.
   - A persistence assertion that `lastFreezeGrantPeriod` survives `serialize` → `deserialize`.
   - Regression: a `restored` result for the same `renewISO` does **not** change `freezes`.

5. `npm test` green, **≥ 1079 passed / 96 suites**. `npx expo export --platform android` clean.

6. Commit exactly:
   `fix(plus): 3 streak candles per paid period, not per completion (IMP-102)`

7. Update `PROGRESS.md` and move this spec into `docs/build-log.md`.

**One accepted side effect — state it in the session note, do not try to prevent it.** An existing member
upgrading to this build has no `lastFreezeGrantPeriod`, so the first entitlement read after the update
grants +3 once. That is correct under the owner's ruling — they are in a paid period the app never
recorded — and the population is the internal testers. **Do not add a back-fill or a "seed from the
current period without granting" path; it would cheat a real subscriber out of a period they paid for.**

**Acceptance.** No new walk row. WALK-19 gains one line at step 4f/5: after a Restore or a "Change plan"
that does not start a new period, **the candle count must be unchanged.** The renewal half is not
walkable by hand — an annual test subscription renews every 30 minutes, so it is observable on a long
sitting but is not being made a gate.

---

## IMP-103

### The device that failed step 4e never had IMP-100 or IMP-101 — ship them, then re-walk

**Lane: OTA (ship only). NO CODE CHANGE.** Opened from the WALK-19 re-run, 2026-09-08 (hardware,
owner-run), step 4e; re-scoped 2026-09-08 after reading what was actually running on that phone.

**The finding as walked.** Tapped Subscribe while already a Plus member. Google's own sheet said the
account already holds the subscription; the app showed **"That didn't go through."**

**Why it is not a mapping defect.** The phone was running OTA group `d42b7ec7`, published from commit
`768bc88` at 04:58 on 2026-09-08. IMP-100 landed at 12:30 (`3774195`) and IMP-101 at 12:39 (`f170c0a`) —
**after** it. Neither commit is pushed (`main` is 4 ahead of `origin/main`, which still points at
`ea02d23`) and **neither carries a `Release-Lane: ota` trailer**, so CI never published them. The last
commit that carries one is `c2f35a1`, which also predates both. Read the shipped tree and it is
unambiguous:

- `git show 768bc88:src/billing/mapError.js` is the **pre-IMP-100 name matcher** — twelve lines, no
  `RC_CODE` table. `e.code` of `"6"` falls straight through to `return 'failed'`.
- `git show 768bc88:src/screens/PlusFlow.js` has **no reconcile in `run()`** and a two-argument
  `resultCopy(kind, mode)` — IMP-101 is absent.

**The copy is the timestamp.** After IMP-101, a `failed` card in *buy* mode never says "That didn't go
through" — `resultCopy` rewrites it to **"We couldn't confirm that."** ([`PlusFlow.js:119-125`](../src/screens/PlusFlow.js#L119)).
The only build that renders the literal `RESULT_META.failed` title is one without IMP-101. The owner's own
words date the bundle.

**So step 4e reproduced the bug IMP-100 fixed, on a build without the fix.** There is nothing here to
diagnose and nothing to guess a second mapping for.

**Steps.**

1. **No source file changes.** If you find yourself editing `mapError.js`, stop — you are on the wrong row.
2. Push `main` (`3774195`, `90c6759`, `f170c0a`, `469a4d2`) and ship IMP-100 + IMP-101 by OTA the normal
   way: a `Release-Lane: ota` trailer on the pushed commit. **Never `eas update` by hand.**
3. Read the manifest back and record the new group id in `PROGRESS.md`, same as `768bc88` did for
   `d42b7ec7`. The OTA applies on the **second** launch — say so when handing the phone back.
4. Re-open WALK-19 step 4e as owed. Move this spec to `docs/build-log.md`.

**Acceptance.** Not a test count — a walk. WALK-19 step 4e on a device confirmed (via IMP-106's row) to be
running the new group: tapping Subscribe while already a member must not re-charge and must not show a
`failed` card.

**One residual, deliberately left open and NOT a blocker.** Nobody has yet observed which numeric code
Play actually sends for "already subscribed" — `6` (`PRODUCT_ALREADY_PURCHASED_ERROR`) and `7`
(`RECEIPT_ALREADY_IN_USE_ERROR`) are what `mapError.js` bets on, and the bet is reasonable but unproven.
It is low-stakes now: with IMP-101 shipped, a buy that maps to `failed` for an account that *does* hold
the entitlement gets reconciled by `run()` and lands on the `success` card instead
([`PlusFlow.js:299-303`](../src/screens/PlusFlow.js#L299)). Worst case the wording reads "You're in."
instead of "You already have Plus." — cosmetic, and no one is charged twice either way. Record what 4e
shows; do not pre-emptively widen the table.

---

## IMP-104

### `tier: 'owned'` means free, and the Shop does not read it

**Lane: OTA.** Found on the WALK-19 re-run, 2026-09-08 (hardware, owner-run), step 7 — reproduces with
Plus active, so it is not a Plus-gating bug. **Root cause found in source; the device-state dump the first
write-up asked for is neither needed nor obtainable — see "Why there is no dump" below.**

**The finding.** Golden Hour (palette), Golden Sun and Crescent Moon (skies) are declared
`tier: 'owned'` in [`data.js:130,142,143`](../src/data.js#L130) — the tier `data.js:126` documents as free
by default. On the device they rendered as ember-priced.

**Cause 1 — `data.js` declares the tier and `Shop.js` ignores it.**
[`Shop.js:33-38`](../src/screens/Shop.js#L33) reads:

```js
const palState = (p) => p.id === activePalette ? 'active'
  : ownedPalettes.includes(p.id) ? 'owned'
  : p.tier === 'plus' ? (plus ? 'owned' : 'plus') : 'buy';
```

`'plus'` is the only tier value ever consulted. An item tagged `tier: 'owned'` that is not currently
applied and not in the `ownedPalettes` / `ownedSkies` array falls to the final `'buy'` — its declared tier
never enters the decision. With Plus active the owner had applied a Plus palette and a Plus sky, so none
of the three defaults was the `'active'` one, and all three fell through together. That is why the walk
saw exactly these three and nothing else.

**Cause 2 — `PalTag` then prints the tier as a price.** [`shopui.js:135-139`](../src/shopui.js#L135) ends
in an unconditional ember pill rendering `{tier}`. For these items `tier` is the string `'owned'`, so the
card shows an ember icon beside the literal word **"owned"**. That is the "ember-locked" the walk
recorded — not a price at all.

**Cause 3 — and the part the first write-up missed: the card is tappable, and tapping it destroys the
ember balance.** `st === 'buy'` routes the press to `onBuyPalette`
([`Shop.js:125`](../src/screens/Shop.js#L125)), and
[`RitualsApp.js:265-271`](../src/RitualsApp.js#L265) guards with a numeric compare:

```js
if (embers < p.tier) { openGetEmbers(); return; }   // embers < 'owned'  →  NaN compare  →  false
setEmbers((e) => e - p.tier);                        // e - 'owned'       →  NaN
```

`embers < 'owned'` is a NaN comparison, which is **false**, so the affordability guard passes for a user
with any balance at all — including zero. Execution continues and the balance becomes `NaN`.
`JSON.stringify` writes `NaN` as `null`, so `serialize()` persists `"embers": null`, and the next launch
reads `initialState.embers ?? 0` — `null ?? 0` is `0`. **The user's entire ember balance is silently wiped
by one tap on a free item.** `buySky` ([`RitualsApp.js:273-279`](../src/RitualsApp.js#L273)) is the same
code with the same defect. This is the reason IMP-104 is worth more than its cosmetic report.

**Why there is no dump.** The first write-up made the fix conditional on reading `ownedPalettes` /
`ownedSkies` off the affected device via the dev panel. Two reasons that is dropped:

1. **It cannot be done.** `RitualsApp.js:73-77` requires the dev panel under a literal `__DEV__` so Metro
   strips `src/dev/*` from release bundles. The phone is running a Play release build. There is no
   Inspect screen on it.
2. **It would not change the fix.** Every write path was read — `pickPersisted` / `serialize` /
   `deserialize` / `migrate` / `mergeWithDefaults` ([`state.js`](../src/persistence/state.js)),
   `runQuarantine` and `pendingRestoreInventory` ([`restoreQuarantine.js`](../src/persistence/restoreQuarantine.js)),
   `createBackup` / `readBackup` ([`backup.js`](../src/backup/backup.js)), `buildState`
   ([`buildState.js:61-66`](../src/dev/buildState.js#L61), which seeds the defaults unconditionally), and
   `handleResetData` / `handleReplaceAllData` ([`App.js:124-136`](../App.js#L124)). **No path in this
   repository empties those arrays or drops an id from them.** So a one-off migration would be a fix
   aimed at a cause that does not exist in the code, and the invariant would still be unenforced the next
   time any state arrived from anywhere.

The invariant `data.js` already states is the fix: **`tier: 'owned'` means free, full stop.** The
`ownedPalettes` / `ownedSkies` arrays record what was *purchased*; they were never meant to be the only
proof that a default is free. Make `data.js` authoritative and every possible persisted state renders
correctly, including ones this repo cannot produce.

**Steps.**

1. [`src/screens/Shop.js`](../src/screens/Shop.js) — in `palState` and `skyState`, honour the declared
   tier. Both become:

   ```js
   const palState = (p) => p.id === activePalette ? 'active'
     : (p.tier === 'owned' || ownedPalettes.includes(p.id)) ? 'owned'
     : p.tier === 'plus' ? (plus ? 'owned' : 'plus') : 'buy';
   ```

   and the same shape for `skyState` over `s.tier` / `ownedSkies`. Order matters: `'active'` still wins,
   so an applied default keeps reading "Applied", not "Apply". Comment it with the IMP number and the
   one-line reason (*the tier is the source of truth for free; the array is the record of purchases*).
2. [`src/RitualsApp.js`](../src/RitualsApp.js) — make `buyPalette` and `buySky` refuse a non-numeric
   tier before they touch the balance. Add as the first line of each, above the affordability check:

   ```js
   if (typeof p.tier !== 'number') return;   // buySky: s.tier
   ```

   Comment it: a string tier reaching this function is a bug upstream, but the NaN it produces is
   unrecoverable — `NaN` serialises to `null` and reads back as `0`, so this guard is the balance's last
   line of defence, not a redundancy. **Keep it even though step 1 makes it unreachable today.**
3. Tests — new assertions, each proven red against the current tree first:
   - `__tests__/screens/Shop.test.js` (or a sibling): with `activePalette: 'lavender'`,
     `activeSky: 'aurora'`, `ownedPalettes: []`, `ownedSkies: []` and `plus: true`, the three default
     items render the **"Apply"** pill and no ember pill. Assert on Golden Hour, Golden Sun **and**
     Crescent Moon by name — the three the walk named.
   - Same fixture with `plus: false` — the defaults are still free. This is not a Plus-gated behaviour.
   - An applied default (`activePalette: 'goldenhour'`) still reads **"Applied"**, not "Apply".
   - A priced item (`marigold`, `tier: 240`) is unaffected: still an ember pill reading `240`.
   - A unit test for step 2: calling the buy handler with a `tier: 'owned'` item leaves `embers`
     unchanged and never reaches `setEmbers`. If the handlers are not reachable from a test today,
     extract the guard as a tiny pure predicate in the same file and pin that instead — do not restructure
     `RitualsApp.js` for this.
4. `npm test` green, **≥ 1079 passed / 96 suites**. `npx expo export --platform android` clean.
5. Commit exactly:
   `fix(shop): default palettes and skies are free, and a free item can never eat the ember balance (IMP-104)`
6. Update `PROGRESS.md` (tick the row, session note) and move this spec into `docs/build-log.md`.

**Acceptance.** WALK-19 step 7, or the Shop opened directly: Golden Hour, Golden Sun and Crescent Moon
always read "Apply" (or "Applied") and never carry an ember price — with Plus on or off, whatever
`ownedPalettes` / `ownedSkies` hold. Add to WALK-19 step 7 a check that the ember balance is unchanged
after tapping each of the three.

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

## IMP-106

### A healthy build cannot say which JS it is running — and that is what mis-scoped IMP-103

**Lane: OTA.** Opened 2026-09-08 out of the IMP-103 investigation. Small, and it pays for itself on the
next walk.

**The finding.** IMP-103 was written up as a live billing defect and reserved a device-log measurement,
when the real answer was that the phone was running a bundle two fixes behind. Nothing on screen could
have said so. `describeUpdate(Updates)` ([`diagnostic.js:33-40`](../src/billing/diagnostic.js#L33))
already computes exactly the right string — it was added by IMP-087 for this reason — and
`RUNNING_BUNDLE` is computed at [`RitualsApp.js:115`](../src/RitualsApp.js#L115). But its **only** consumer
is the `explainBillingDiagnostic` alert at [`RitualsApp.js:243`](../src/RitualsApp.js#L243), which is
reachable only through the You-tab card at [`YouScreen.js:120-126`](../src/screens/YouScreen.js#L120) —
and that card renders only when `billingDiagnostic` is non-null **and** `!plus`. In other words: the
running bundle is legible exactly when billing is broken and the user is not a member. On a working build,
and on any member's device, it is invisible.

Every walk from here depends on knowing which bundle is on the phone. The OTA applies on the **second**
launch, which makes "the fix didn't work" and "the fix isn't there yet" look identical — the exact
confusion IMP-087's comment predicted, and the one that has now cost a spec.

**Steps.**

1. [`src/screens/YouScreen.js`](../src/screens/YouScreen.js) — add a new prop `runningBundle = null` and
   render it as a quiet, always-present row at the **bottom** of the tab, near the existing
   About/data rows rather than up in the Plus block. Not a warning, not an alert: label
   `Version`, value the `runningBundle` string. No `onPress`. Unconditional on `plus` and on
   `plusEnabled` — the whole point is that it survives a healthy build.
2. [`src/RitualsApp.js`](../src/RitualsApp.js) — pass `runningBundle={RUNNING_BUNDLE}` where the other
   You-tab props are handed over (alongside `billingDiagnostic` at line ~795). Leave
   `explainBillingDiagnostic` exactly as it is; it stays the loud path for a broken gate.
3. Do **not** change `describeUpdate` — its strings (`'built-in bundle (no update applied)'`,
   `'update d42b7ec7 · 2026-09-08 04:58 UTC'`) are already written for a human and are already pinned by
   tests.
4. Tests, proven red first: a YouScreen render asserting the row is present with `plus: true` and
   `billingDiagnostic: null` — the combination that renders nothing today.
5. `npm test` green, **≥ 1079 passed / 96 suites**. `npx expo export --platform android` clean.
6. Commit exactly:
   `feat(you): the running bundle is readable on a healthy build (IMP-106)`
7. Update `PROGRESS.md` and move this spec into `docs/build-log.md`.

**Acceptance.** No walk of its own — it is *how* the next walk is read. WALK-19's pre-flight gains one
step: read the Version row on the You tab and record the update id in the result block **before** running
any step. A walk that does not record it cannot scope a defect.

---

## IMP-107

### A lapsed member keeps Plus until they happen to background the app

**Lane: OTA.** Opened 2026-09-09 from an owner observation: Play showed no subscription, RevenueCat
showed no active entitlement, **and the app still said "member."** After the app was backgrounded and
reopened, Plus disappeared.

**This is not a bug in the downgrade — it is a gap in when the downgrade is allowed to run.** The app is
right to treat `plus` as a cache and only act on a *verified* answer (IMP-043); what is missing is a
verification opportunity at the one moment every session is guaranteed to have.

**The two entitlement checks, and the hole between them.**

- [`useLaunchEntitlementCheck`](../src/billing/entitlementSync.js#L33) runs at mount and **returns
  immediately when `plus` is true** (`if (plus || ran.current) return;`). It exists for the *upgrade*
  case — the returning subscriber whose cache says `false`. A member is deliberately never asked.
- The AppState listener at [`RitualsApp.js:365-378`](../src/RitualsApp.js#L365) is the *downgrade* path,
  and it is gated the other way (`if (s !== 'active' || !plus) return;`). But `AppState` emits `'change'`
  on a **transition**. A cold launch comes up already `active`, so on Android this does not reliably fire
  at startup — the app must first go to the background and come back.

`entitlementSync.js:30-32` states the assumption in as many words: *"a true member has nothing to gain
here and the periodic AppState check (RitualsApp.js) already covers the downgrade side for members."*
**That is only true after a background→foreground round trip.** A user who opens the app, reads, writes
and closes it — never backgrounding it — is never re-checked. Their subscription can have lapsed weeks
ago and the app will still show Plus, the perks, and a stale renewal date.

**Why it matters beyond correctness.** It also makes the app useless as a *walk instrument*: "the app says
I'm a member" carried no information until this is fixed, which is exactly the confusion that cost a
sitting on 2026-09-09.

**What must NOT change.** IMP-043's rule stands: only `verified: true` may move the flag, and an
unreachable store changes nothing. This spec adds an *occasion* to ask, not a new reason to revoke. Do
not touch `nextPlusState`.

**Steps.**

1. [`src/billing/entitlementSync.js`](../src/billing/entitlementSync.js) — generalise the launch hook so
   it runs for **both** directions. Rename to `useLaunchEntitlementSync` (keep the old export as an alias
   only if a test needs it; otherwise update callers) and drop the `if (plus)` bail:

   ```js
   export function useLaunchEntitlementSync({ plus, service, onResult }) {
     const ran = useRef(false);
     useEffect(() => {
       if (ran.current) return;
       ran.current = true;
       checkEntitlement(service).then(onResult);   // caller decides; nextPlusState still rules
     }, []); // launch-only by design
   }
   ```

   Rewrite the header comment: it now covers the lost-phone upgrade **and** the lapsed-member downgrade,
   and it says why the AppState listener alone was not enough (no `'change'` event on a cold start).

2. [`src/RitualsApp.js`](../src/RitualsApp.js) — the caller applies the same rules the AppState listener
   already uses, so there is exactly one downgrade policy in the app. Extract the listener's body into a
   local `applyEntitlementResult(result)` that sets `liveEntitlement` / `subCanceled` / `activePlan` when
   there is one and then `setPlus(nextPlusState(plus, result))`, and call it from **both** the AppState
   listener and the new launch hook. Keep the existing "Your subscription is active" toast on the
   upgrade edge only; **add no toast on the downgrade edge** — a person who opens their journal should not
   be greeted by a notice about billing.

3. **Tests**, proven red first:
   - `plus: true` + a verified `entitlement: null` at launch ⇒ the hook fires and the caller downgrades.
     This is the case the current hook skips entirely.
   - `plus: true` + `verified: false` (unreachable store) at launch ⇒ **no change.** IMP-043's guarantee,
     and the most important assertion in this spec.
   - `plus: false` + a verified entitlement ⇒ still upgrades (the existing lost-phone behaviour must not
     regress).
   - The hook runs exactly once per mount regardless of `plus` flipping afterwards.
4. `npm test` green, **≥ 1079 passed / 96 suites**. `npx expo export --platform android` clean.
5. Commit exactly:
   `fix(plus): re-check the store at launch for members too, not only at foreground (IMP-107)`
6. Update `PROGRESS.md` and move this spec into `docs/build-log.md`.

**Acceptance.** WALK-19 gains one step: with a lapsed or cancelled-and-expired subscription, **cold-start
the app without ever backgrounding it** — Plus must be gone on that first screen. And with the device in
aeroplane mode, a real member cold-starting must **keep** Plus (IMP-043 — the check fails, nothing
changes).

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
