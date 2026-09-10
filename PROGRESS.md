# Daily Rituals — Build Progress (live cursor)

> **The memory between chats. Read top-to-bottom every chat — and keep it SMALL.** Only: the ACTIVE
> TRACK, the backlog table, live blockers, and the **2 newest** session notes.
>
> - **Open IMP specs → [`docs/specs-open.md`](docs/specs-open.md).** **Open the ONE spec you are building
>   and no others** — every other spec there is for a different chat.
> - **Open runtime walks → [`docs/walk-open.md`](docs/walk-open.md).** Same rule: **one walk, not the file.**
>   A failed walk is not fixed in place — it becomes a new `IMP-xxx` row here.
> - Stable reference (locked decisions, release/signing rules, monetization strategy, parked phases
>   8/10b/11, config, architecture) → [`docs/playbook.md`](docs/playbook.md) — open only when you need it.
> - Finished specs, resolved findings, older session notes → [`docs/build-log.md`](docs/build-log.md).
>   Git is the full record.
> - How to drive a Sonnet chat → [`DEVGUIDE.md`](DEVGUIDE.md).
>
> **Size budget (hard rule, ≤250 lines):** the moment a task is **code-complete** (don't wait for ship or
> walk), move its spec to `docs/build-log.md` and leave only its one-line row below. Specs never live
> inline here. Resolved blockers move out too — this file carries what is **live**, not what was.

---

## ▶️ ACTIVE TRACK

**One chat does exactly ONE task, and there are two kinds. Take whichever you were sent here for:**

| Chat type | Queue | Take |
| --- | --- | --- |
| **Build task** | [`docs/specs-open.md`](docs/specs-open.md) | the **first ⬜ `IMP-xxx`** in the backlog below — **but check 🧭 below first: a row can be blocked** |
| **Runtime walk** | [`docs/walk-open.md`](docs/walk-open.md) | the **first ⬜ `WALK-nn`** in that file's own index |

**Never both in one chat.** A spec is **code-complete at `npm test` green + `npx expo export` clean** — its
runtime proof is a separate WALK row for a separate chat, so a missing walk is *not* an unfinished spec.
Neither queue is the phase ladder (8 / 10b / 11), parked in [`docs/playbook.md`](docs/playbook.md).

> ## 🧭 WHAT TO TAKE RIGHT NOW (2026-09-09)
>
> | If this chat is… | Take |
> | --- | --- |
> | a **build task** | 🔨 **[108](docs/specs-open.md#imp-108) → 109 → 110 → 111 → 112 → 113**, one chat each, **all six specced and ready — nothing is blocked.** ⚠️ **111 is a deletion; its test count legitimately DROPS.** ⚠️ **112 deletes the 5-candle pack** (a cap of 3 makes it unsellable — owner ratified). ⚠️ **113's store products are live and its ids are settled** — `embers_240`/`embers_680`/`embers_1500`, **no `:standard` suffix**; it owes a new WALK-20 on hardware. |
> | a **runtime walk** | 🚦 **This is where all remaining work is.** ✅ WALK-19a passed 2026-09-10 and closed IMP-105. Owed now, on group `f961b427` / update `01a0877d`: **WALK-19 steps 4e, 7, 10** (all need a LIVE test subscription — buy annual and run them as one block, ~3 hr budget), then **step 8** (the one real-money purchase, held for last). Then **WALK-08** (DeeperInsights at max font), **WALK-07** (Paywall badge at font scale 2.0), **WALK-18** (motion, mid-range device), and **WALK-12 (R8) LAST** — it must be walked on the exact build you ship. |
> | a **design request** | See "Claude Design" below. The live request is **Insights**. |
>
> **The billing surface, honestly.** ✅ **Proven end to end on hardware:** purchase, already-owns (4e),
> reinstall + entitlement survival (WALK-19a), cancel, and lapse-at-cold-start (IMP-107). **089/090/099 too.**
> **092 is half proven** (its `catch` never ran on a device); **091 has never been observed.** ⚠️ **None of
> that is a jest question — `npm test` runs `simService`, which fabricates every purchase result.**
>
> ⚠️ **Standing warnings — read before touching this surface:** the two OTA traps and the five billing
> warnings both live in [`docs/playbook.md`](docs/playbook.md) → "Two OTA traps" / "Billing — standing
> warnings". CI owns `--environment production` now. Narrative → [`docs/build-log.md`](docs/build-log.md).**

**✅ The branch is merged** — `feat/design-push` fast-forwarded onto `main` 2026-09-08 (`cb3d60e`), ending
the no-push rule. ⚠️ **Ship through CI now**: `release.yml` runs on `main`, so the test gate, the native-file
backstop, the billing preflight and `--environment production` are the workflow's job. **Never `eas update`
by hand** — a `Release-Lane: ota` trailer on the pushed commit is the whole ceremony.
**The free-app track is CLOSED** (owner, 2026-08-16): `IMP-001`–`IMP-075` done bar the deferred `IMP-022`
and reserved `IMP-057`; **do not open new free-track rows.** **`IMP-079` is burnt.** **IMP-044 claims no
queue slot** — it rides the next build and needs only WALK-12.

---

**App status — all four Play tracks.** Read from the Play Developer API 2026-09-05 and corrected 2026-09-06;
authoritative, do not re-derive from an older note.

| Track | Active | API | Note |
| --- | --- | --- | --- |
| `production` (public) | **1.0.3 / vc9** | 36 ✅ | live since 2026-07-30 |
| `beta` (open testing) | **1.0.3 / vc9** | 36 ✅ | was vc8/API 35 — promoted, compliance gap closed |
| `alpha` (closed testing) | **1.0.6 / vc12** | 36 ✅ | ⚠️ **NOT the owner's track** — their phone is on `internal`. The lesson this row cost two rounds of confusion to learn: Play serves the **highest-priority track the account qualifies for** (internal > closed > open > production), so **a build on `internal` is invisible to a device that is only a closed tester** |
| `internal` | **1.0.9 / vc15** | 36 ✅ | ✅ **SHIPPED 2026-09-06**, confirmed from `eas submit:list` not inferred. EAS build `e97db74d-…`, submission `a43f49c1-…`, from commit `980cdad`. Runtime `1.0.9`. ✅ **With the OTAs applied it takes money for real** — proven on a device (WALK-19). ⚠️ **The binary alone does NOT** — vc15's embedded bundle carries IMP-085's broken probe, so a device that has not taken the OTAs is back to a dead paywall. **The capability lives in the update, not the build.** Unblocks WALK-19, WALK-18, WALK-11, WALK-12 |

⚠️ **vc13 and vc14 are history and on no track** — no further OTA, and **vc14 must never be promoted: no
RevenueCat key, fell back to `simService`, granted Plus free** — invisible to CI, jest and a green
preflight. Detail → [`docs/build-log.md`](docs/build-log.md).

**Ship mechanics + OTA lane rules** → [`docs/playbook.md`](docs/playbook.md) → "The OTA lane". **✅ API-36 met account-wide.**

**Current stack:** Expo SDK **54** · RN **0.81.5** · React **19.1.0** · **New Architecture** ·
**Reanimated 4.1.1 + worklets 0.5.1** · `targetSdkVersion` **36**, `minSdk` **24** ·
`npm test` → **1104 passed, 99 suites** (verified 2026-09-09) + **3 zone tests × 2 pinned zones**.
⚠️ **Run `npm test`, not bare `npx jest`**, or the zone half is skipped. Version-checking a phone, the
track-reading script and the rest of the stack notes are in [`docs/playbook.md`](docs/playbook.md).

---

## 🔧 Improvements backlog (post-launch — ACTIVE TRACK)

Opus scopes each owner-filed issue into a numbered `IMP-xxx` spec in
[`docs/specs-open.md`](docs/specs-open.md). Sonnet takes the **first ⬜** row, opens **only that spec**,
executes it, commits with the exact message given, ticks the row, moves the spec to `docs/build-log.md`, and
writes the session note. **Full detail for every ✅ row is in [`docs/build-log.md`](docs/build-log.md).**

| ID | Title | Lane | Status |
| --- | --- | --- | --- |
| 001–075 | **Every free-track task.** Search, custody + 30-day trash, multi-moods, Annual Recap, deeper insights, heatmaps, local `dayKey`, prompt packs, a11y labels, the IMP-063…075 polish run, R8, dev harness, backup/restore, reminders. | mixed | ✅ **all done except the two rows below** — full detail per task in [`docs/build-log.md`](docs/build-log.md); git is the record. Do not re-derive from this table. |
| 076–093 | **The design-push + billing run.** New Architecture (076), motion vocabulary (077), design system (078), Paywall footer (080), backup warning (081), renewal date (082), cancel deep-link (083), the release build's simulation (084), the SDK probe (085), the OTA lane's empty key (086), the paid surface's reason (087), the purchase-overlay trap (088), restore-must-not-buy (089), the trial it cannot see (090), the pending escape (091), "nothing to restore" (092), the vanishing paywall (093). | mixed | ✅ **all code-complete, all shipped by OTA where the lane allowed, all archived** — specs in [`docs/build-log.md`](docs/build-log.md). ✅ **on `main` since 2026-09-08.** ⚠️ **Code-complete is not proven** — 089/090 are proven on hardware, 092 is half proven, **091 has never been observed**; see WALK-19 |
| 094–098 | **The 2026-09-07 walk-sitting fixes + the Recap's bar alignment.** The Annual Recap's phantom "quietest" month (094), DeeperInsights at max font (095), the Paywall badge over the selected tick (096), the dev harness's two lying labels (097), the Top moods bars starting at three different x (098). | OTA | ✅ **all code-complete, archived** in [`docs/build-log.md`](docs/build-log.md) — `085876a`, `3030bca`, `1e12cf7`, `7bced9f`, `edcea0b`. ✅ **shipped by OTA 2026-09-08, group `d42b7ec7`, manifest read back** (`rcAndroidKey` live). ⚠️ **095 and 096 are accepted on a screen, not by the suite** — WALK-08 at max font and WALK-07 at `font_scale` 2.0 in both nav modes. 094 and 098 are logic/style and owe nothing runtime |
| 099 | **The entitlement the store grants is the one the app must read.** `ENTITLEMENT_ID` was `'plus'`; the RevenueCat identifier is `Daily Rituals Plus`, so a **successful** purchase mapped to `null` and `buy()` reported `failed`. | OTA | ✅ **done, archived** — proven on hardware 2026-09-08. ⚠️ The walk proved the outcome, **not which of two routes granted it** (named lookup vs IMP-099's sole-entitlement fallback) — **the fallback is not dead code, do not remove it** |
| 100 | **Every purchase error becomes `failed`.** `e.code` is the stringified numeric enum (`"6"`, `"10"`, `"20"`), `mapError.js` matched names, so only `userCancelled` worked. Killed the `owned` rescue path, read `PAYMENT_PENDING` as "you weren't charged", broke Change plan. | OTA | ✅ **code-complete, archived** in `docs/build-log.md` — `3774195`. **1077 passed, 96 suites** (was 1068/96), export clean, +9 tests, 6/7 new assertions proven red first. ⚠️ **Walk owed** — WALK-19 needs an already-owns-it Subscribe tap |
| 101 | **The `failed` card claims "you weren't charged" and never asks the store.** Asserted on a resolved purchase, a pending charge, and every unrecognised error; `run()` reaches the result phase with no reconcile, and offers "Try again". | OTA | ✅ **code-complete, archived** in `docs/build-log.md` — `f170c0a`. **1079 passed, 96 suites** (was 1077/96), export clean, +2 tests. ⚠️ **No new walk owed** — covered by WALK-19 |
| 102 | **+3 freezes on every completion, not once.** `subscribe()` granted them for `success`, `owned` **and** `restored`. | OTA | ✅ **done, shipped `f961b427`** — `3e7cf1c`, archived. Renewal grant seen firing on hardware 2026-09-10 ("+3 candles — your Plus perk renewed") on a test-compressed 30-min renewal |
| 103 | **Not a defect — the phone never had IMP-100 or IMP-101.** A ship row with no code in it: step 4e ran on group `d42b7ec7`, published before either fix landed, and neither was ever pushed. | OTA | ✅ **done — shipped 2026-09-10 in group `f961b427`, archived in `docs/build-log.md`.** WALK-19 step 4e owes a re-run on the new bundle |
| 104 | **`tier: 'owned'` means free and `Shop.js` never reads it.** `palState`/`skyState` consult only `'plus'`, so a default that isn't currently applied falls to `'buy'` and `PalTag` prints the tier string as an ember price. **Worse: the card is tappable — `embers < 'owned'` is a NaN compare, so the guard passes, `embers` becomes `NaN`, serialises to `null`, and reads back as 0. One tap on a free item wipes the balance.** | OTA | ✅ **code-complete, archived** in `docs/build-log.md` — `792a611`. **1085 passed, 97 suites** (was 1079/96), export clean, +6 tests, the two bug-reproducing pairs proven red first. ✅ **PROVEN ON HARDWARE 2026-09-10 (~02:00):** with a non-zero balance (15 embers) the owner tapped the free Golden Sun sky — it applied and **the balance did not change.** That is the tap-wipes-your-embers half, which was invisible at 0 embers earlier in the sitting. **Row fully closed** |
| 105 | 🚦 **Reinstall + Restore said "Nothing to restore."** Ruled out from source: not the embedded bundle, not `ENTITLEMENT_ID`, not `restore()`/`toEntitlement()`. The dashboard round killed the transfer theory; Round 2.5 showed the launch-time `getEntitlement()` had independently agreed, which no `restore()`-only defect explains. | — | ✅ **CLOSED 2026-09-10 by WALK-19a — not reproducible, walk-protocol defect. No code was ever written on this row.** Archived in `docs/build-log.md` |
| 107 | **A lapsed member kept Plus until they happened to background the app.** `useLaunchEntitlementCheck` bailed when `plus` was true (it existed for the *upgrade* case only), and the downgrade path was an `AppState` `'change'` listener — which does not fire on a cold start, because the app comes up already `active`. Observed by the owner 2026-09-09: no sub in Play, none in RevenueCat, app still said member. | OTA | ✅ **code-complete, archived** in `docs/build-log.md` — `f7b27bb`. **1089 passed, 97 suites** (was 1085/97), export clean, +8 tests, all proven red first. ✅ **PROVEN ON HARDWARE 2026-09-10 (~02:00):** the annual sub bought at 00:43 expired at 01:43 and the app no longer showed Plus on re-open — the first and only test of this row. ✅ **Owner confirmed the app was swiped away and reopened fresh, so this is a true cold start and an UNCONDITIONAL pass of the new launch check** — not the old `AppState` path |
| 106 | **A healthy build cannot say which JS it is running.** `describeUpdate()` already computes it and `RUNNING_BUNDLE` is built at `RitualsApp.js:115`, but its only consumer is the broken-gate alert, which renders only when `billingDiagnostic` is non-null **and** `!plus`. This is the gap that let IMP-103 be scoped as a billing defect. | OTA | ✅ **code-complete, archived** in `docs/build-log.md` — `5ab7da7`. **1104 passed, 99 suites** (was 1102/98), export clean, +2 tests, proven red first. ⚠️ **No walk of its own** — WALK-19's pre-flight gains reading the new Version row |
| 108 | **A member is still charged embers for five palettes and skies.** `PLUS_PERKS[0]` promises *"Every palette & sky — unlocked forever"*, but [`Shop.js:38`](src/screens/Shop.js#L38) only lets `plus` unlock `tier: 'plus'` items — Marigold, Honey, Rose Dusk, Sage Eve and Harvest Moon stay ember-locked for someone who has already paid. Same family as IMP-084: the paid surface and the code telling different stories. | OTA | ⬜ **specced, ready** — owner-reported 2026-09-10, WALK-19 step 7. 🔴 **Access must stay a live read on `plus`, never written into `ownedPalettes`** or a lapsed member keeps them forever |
| 109 | **The shortfall toast never mentions the shortfall.** `openGetEmbers()` serves both a deliberate "get embers" tap and a "you're 285 short" refusal with one string, so tapping an unaffordable item answers a question you didn't ask. **Three call sites**, incl. `buyCandles`, which the owner never reached. | OTA | ⬜ **specced, ready** — owner-reported 2026-09-10 (*"hella confusing"*). ⚠️ Leave the ember-pill copy alone and do not touch `EMBER_PACKS_ENABLED` |
| 110 | **The paywall sells a perk every free user already has.** `PLUS_PERKS[1]` = *"Streak insurance — a candle spends itself when you miss a day"*, shown on the paywall and in Onboarding's first three — but `applyAutoFreeze` is not gated on `plus` at all. **Owner ruled 2026-09-10 that free-for-all is correct**, so the line is what is wrong, not the feature. | OTA | ⬜ **specced, ready.** Reword to the +3-candles-per-period grant, which IS members-only. 🔴 **Do NOT gate `applyAutoFreeze`** — the acceptance test guards against exactly that |
| 111 | **The tab fade outlines every card in day mode.** `ScreenFade` animates `opacity` over a subtree whose `Card`s carry Android `elevation: 8` (day only — `t.dark ? null : t.shadow(…)`), and elevation shadows do not composite under fractional parent opacity. | OTA | ⬜ **specced — a DELETION.** Owner chose removal over a fix 2026-09-10. 🔴 **Do NOT remove `react-native-reanimated`/`react-native-worklets`** — `usePressScale` still uses them, they are native, dropping them closes the OTA lane. Test count legitimately drops |
| 112 | **Stored candles are unbounded**, so a user banks them, buys once, and the ember economy has no ongoing sink. **Owner set the cap at 3** (2026-09-10). Also makes the IMP-102 renewal toast honest — it says "+3" unconditionally today. | OTA | ⬜ **specced, ready.** ⚠️ **A cap of 3 makes the 5-candle pack unsellable in every state — the spec deletes it.** Keeping it would require a cap of 5 |
| 113 | **Ember packs show real prices and hand over the goods for free** — `onBuy` at `RitualsApp.js:985` is a bare counter increment. Consumables are a history, not a balance, so the grant needs an idempotent local ledger of `transactionIdentifier`s. | OTA (SDK already installed — **corrected from BUILD**) | ⬜ **UNBLOCKED 2026-09-10 — specced and ready.** Products live: `embers_240` / `embers_680` / `embers_1500`, Active, **Consumable**, **no entitlement**. ✅ **No `:standard` suffix — RevenueCat reports the bare id; do not re-guess this.** Owes a new **WALK-20** |
| 022 | Save as PDF + About sheet (the two dead You-tab buttons) | Build | ⏸ **deferred (owner)** — spec in build-log → "Deferred specs"; **perk #6 gate** |
| 044 | R8 on release builds (dev client was shipping to the public) | Build | 🟢 **code-complete, UNWALKED.** R8 must be walked on the build you actually ship, so it rides **vc15 or later**; walk = WALK-12, on hardware, last in the sitting |
| 057 | Historical `dayKey` migration | Build | 🔒 **reserved, not missing** — cannot be written until real device numbers come back from the dev panel's "Data health" reporter. See below |
| — | **Plus is ON** (`PLUS_ENABLED = true`, commit `7d2e515`) | Build | ✅ **and vc15 can take money for real** — proven on a device. Cash ember packs were decoupled from the flag first (`6590834`), caught mid-build: flipping `PLUS_ENABLED` had armed the Shop's "Gather Embers" purchase path as a side effect |

---

## 🎨 Claude Design (IMP-078)

**Moved to [`docs/playbook.md`](docs/playbook.md) → "Claude Design" (2026-09-10, size rule).** Stable
reference — project id, card list, regeneration steps. The live design request is still **Insights**.

## Open items / blockers

> Only what is **live**. Resolved findings and closed walk debts are in
> [`docs/build-log.md`](docs/build-log.md) → "Resolved findings"; monetization strategy, the subscription
> track, the parked phase ladder and the standing test-date rule are in
> [`docs/playbook.md`](docs/playbook.md).

**✅ No live blocker.** Everything below the line is a walk, an owner decision, or a reserved number —
runtime proof, not code. ✅ **Plus works on hardware (owner, 2026-09-08)** — a real Play entitlement now
resolves and the paywall grants membership. ⚠️ **That did NOT validate the `ENTITLEMENT_ID` string**: the
shipped bundle grants Plus by the named lookup **or** IMP-099's sole-entitlement fallback, and from outside
the two are indistinguishable. **Do not remove the fallback** — see WALK-19.

### ▶️ Owner decisions still open

- **🚦 The `internal` → `production` promotion.** vc15 is the only candidate; remaining work is the device
  walks, then promote by hand (~7d review). ✅ **IMP-105 no longer gates it — WALK-19a passed 2026-09-10.**
  🚦 **Still gated on WALK-19's leftovers (4e, 7, 10, 8) and WALK-12 (R8, must be last).** ⚠️ vc12 will not
  be promoted (owner, 2026-09-05) and vc14 must never be.
- ✅ **IMP-105 — CLOSED 2026-09-10, no code ever written on it.** WALK-19a passed in 4 minutes: the
  entitlement survives a reinstall. The 2026-09-08 failure was the walk's own ordering, not the app.
- ✅ **WALK-19's defective ordering is fixed** — carved out as **WALK-19a** (buy → uninstall → reinstall →
  Restore as one tight block). Durable rule + steps in [`docs/walk-open.md`](docs/walk-open.md).
- ✅ **The `rcAndroidKey` in `3b28b70`'s commit message STAYS — owner's call, 2026-09-10** (*"let the
  message be"*). It is a RevenueCat **public** client key, already inside every installed APK and served
  from the unauthenticated manifest endpoint, so there is nothing to rotate and a force-push of a public
  repo buys nothing. 🔴 **Do not propose rewriting that history again, and never record the VALUE of a key
  anywhere** — the read-back check is a boolean; the rule is in the playbook.
- ✅ **MOTION — DECIDED 2026-09-10.** Owner: *"I choose b and c."* **(b) now** —
  [IMP-111](docs/specs-open.md#imp-111) deletes `ScreenFade`. **(c) deferred** — applying the unused
  vocabulary is parked in [`docs/specs-open.md`](docs/specs-open.md), gated on Plus being complete.
- ✅ **EMBERS FOR MONEY — DECIDED 2026-09-10, no longer parked.** Owner answered both gating questions
  (**cash → embers → candles**; **auto-freeze free for everyone**) and set the **candle cap at 3**. Now
  [IMP-112](docs/specs-open.md#imp-112) (the cap) + [IMP-113](docs/specs-open.md#imp-113) (the purchase
  path). Reasoning preserved in [`docs/build-log.md`](docs/build-log.md) → "The embers-for-money
  conversation" — **a decision without its reasoning gets re-litigated.** 🔴 **`EMBER_PACKS_ENABLED` still
  must not be flipped** until IMP-113 is built AND walked: `onBuy` is still a bare counter increment, so
  the flag alone ships a store showing dollar prices and giving the goods away (the vc14 shape).
  ✅ **The three consumables are LIVE as of 2026-09-10** — Active, Consumable, no entitlement, ids settled.
  ⚠️ **Candle cap 3 and the pack lineup are coupled** — the 5-pack becomes unsellable
  and IMP-112 deletes it; keeping it would mean a cap of 5.
- **Perk #6, the PDF, is still not built** (IMP-022, deferred). It was **cut** from `PLUS_PERKS` rather
  than built, which is how `PLUS_ENABLED` flipped honestly. Gate checklist in the playbook → Phase 10b.

### 🟡 IMP-056 residual + the IMP-057 decision

**Moved to [`docs/playbook.md`](docs/playbook.md) (2026-09-10, size rule).** Nothing to act on; **IMP-057
stays reserved until real device numbers come back from the dev panel's "Data health" reporter.**

### ⛔ Parked

- **iOS (Phase 11):** blocked on a Mac / EAS macOS + Apple Developer Program enrollment. The Phase 6 iOS
  real-billing row is blocked on the same. Per-step runbook in the playbook → Phase ladder.
- **IMP-044 (R8):** on for release builds since 2026-08-08, and **jest cannot prove it** — the failure mode
  is silent stripping at runtime, not a compile error. It rides the next build; **WALK-12** is the checklist.

---

## Last session note

_Only the **two newest** notes stay here; each chat moves the older one into
[`docs/build-log.md`](docs/build-log.md) → "Session notes". Keep them to the shape below: what finished,
the proof, the exact next step._

_2026-09-10, earlier (Opus + owner — **WALK-19a PASSED in four minutes and closed IMP-105.**) — walk, no code._

**What finished.** **IMP-105**, which had blocked `internal` → `production` since 2026-09-08, **closed with
no code ever written on it.** Annual bought **00:43**, uninstalled **00:44**, reinstalled **00:45**, and at
**00:47** the second launch already showed Member — **no Restore row to tap.** Four minutes against a ~3-hour
test-sub life, so expiry is arithmetically impossible: the first run that tested what step 9 always meant to.

**Why 2026-09-08 needed no fix.** ⚠️ **The code was never the variable.** On the failing bundle
`d42b7ec7`, `useLaunchEntitlementCheck` guards on `if (plus || ran.current) return;` — a reinstall mounts
with `plus: false`, so it ran the same check, same route, same store. What differed was elapsed time: a
perks tour sat between purchase and reinstall. **C3 was never needed — the walk outranked the dashboard**,
and C0 (Round 2.5, from source hours earlier) had predicted both outcome and mechanism.

**Corroborations nobody asked for.** Play confirmed at uninstall that the sub outlives the app; and the
owner chose **"keep the fresh start"**, discarding local data, **and Plus still came back** — membership is
store-authoritative, IMP-043 proven on hardware. ⚠️ **Named gap:** `restorePurchases()` was never tapped
(no button to tap). Not a blocker — step 4f already proved `restore()`.

**The durable lesson.** A walk whose steps cannot fit inside the lifetime of the thing being tested does not
produce a null result — it produces a **false** one. This one cost two rounds of source review, a dashboard
audit and an owner's evening. **The fix was to the walk.**

_2026-09-10, latest (Opus + owner — **a full WALK-19 sitting on hardware: two rows closed, two proven, and
FOUR new rows opened by the owner noticing things the walk was not looking for.**) — walk + specs, no code._

**What finished — three rows closed on hardware, none needing code.** **IMP-104** ✅ with 15 embers the free
Golden Sun sky applied and **the balance did not move** — the tap-wipes-your-embers half, invisible earlier
at 0. **IMP-107** ✅ **unconditional** — the sub bought 00:43 expired 01:43 and after a confirmed
**swipe-away cold start** Plus was gone: the new launch check, not the old `AppState` path, and this row's
first ever test. **IMP-103's residual** ✅ — 4e returned **"You already have Plus"**, so `mapError.js`'s
unproven bet on codes `6`/`7` was right.

**WALK-19 steps** (`f961b427` / `01a0877d`): **4e ✅**, **7 ⚠️ found two defects instead**, **9 ✅ via
WALK-19a**, **10 ✅** — the deep link worked and keeping Plus after cancelling is *correct*. **Owed: step 8.**

**🔴 Six new rows, all owner-found, all specced, none built.** **[108](docs/specs-open.md#imp-108)** —
`PLUS_PERKS[0]` promises *"Every palette & sky"* but [`Shop.js:38`](src/screens/Shop.js#L38) unlocks only
`tier: 'plus'`, so **a paying member is still charged embers for five items**; live since 2026-09-05.
**[109](docs/specs-open.md#imp-109)** — the shortfall toast never names price or balance (*"hella
confusing"*), three call sites. **[110](docs/specs-open.md#imp-110)** — the paywall sells a perk every free
user has. **[111](docs/specs-open.md#imp-111)** — the tab fade outlines every card in day mode.
**[112](docs/specs-open.md#imp-112)** — the candle cap of 3. **[113](docs/specs-open.md#imp-113)** — ember
packs for cash, ✅ **unblocked: the three consumables are live and confirmed.**

**Two owner decisions.** **Auto-freeze stays FREE for everyone** — IMP-110 rewords the line rather than
gating the feature, and its test guards against a chat "fixing" it the wrong way. **Motion: remove the fade
now, apply the vocabulary later.** Both ember questions are answered — **cash → embers → candles is
decided**; the **cap (3 or 5?) is the only one left**.

**The exact next step.** 🔨 **Build 108 → 109 → 110 → 111 → 112, one chat each**, all specced. **113 is
blocked on the owner creating three Play consumables.** ⚠️ **111 is a deletion — its test count legitimately
DROPS**; **112 deletes the 5-candle pack.** 🔴 **Do not remove `react-native-reanimated`/`-worklets`** —
`usePressScale` uses them, they are native, dropping them closes the OTA lane. Then WALK-19 step 8,
WALK-08/07, WALK-18 (day mode), **WALK-12 last**.
