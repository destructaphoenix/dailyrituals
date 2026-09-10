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

> ## 🧭 WHAT TO TAKE RIGHT NOW (2026-09-11)
>
> | If this chat is… | Take |
> | --- | --- |
> | a **build task** | **Take the first of [IMP-114](docs/specs-open.md#imp-114), [IMP-115](docs/specs-open.md#imp-115), [IMP-117](docs/specs-open.md#imp-117)** — three independent 🎨 rows opened 2026-09-11 from the lapse sitting; they do not touch each other. ⛔ **Do NOT take [IMP-116](docs/specs-open.md#imp-116)** — it has two valid resolutions with opposite code and is blocked on an owner ruling. 108 through 113 are all done and archived. |
> | a **runtime walk** | ✅ **Step 7 is DONE — the 2026-09-10/11 lapse sitting cleared it** (hardware, owner-run, monthly tester sub). **WALK-18 ✅, WALK-07 ✅, WALK-19 steps 7A/7B/7D ✅** — IMP-108, IMP-109, IMP-110, IMP-111 and IMP-096 are all now proven on hardware. ⚠️ **7C is NOT proven** — the owner held 6 pre-cap candles, so the cap was never exercised; it re-runs once the holding drains to ≤2 ([IMP-115](docs/specs-open.md#imp-115)). Remaining 🚦: **step 8** (the one real-money purchase, held for last) and **WALK-12 (R8) LAST** — it must be walked on the exact build you ship. **WALK-08 still owes DeeperInsights at max font** — the owner's real journal cannot reach the "Moods by season" threshold, so this one goes to an emulator with a seeded journal, plus IMP-117's two circles. ⚠️ **WALK-20 (IMP-113's ember purchase) still does not exist in `docs/walk-open.md`, and cannot be walked at all while `EMBER_PACKS_ENABLED` is `false`.** |
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
`npm test` → **1164 passed, 104 suites** (verified 2026-09-10) + **3 zone tests × 2 pinned zones**.
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
| 108 | **A member is still charged embers for five palettes and skies.** `PLUS_PERKS[0]` promises *"Every palette & sky — unlocked forever"*, but [`Shop.js:38`](src/screens/Shop.js#L38) only lets `plus` unlock `tier: 'plus'` items — Marigold, Honey, Rose Dusk, Sage Eve and Harvest Moon stay ember-locked for someone who has already paid. Same family as IMP-084: the paid surface and the code telling different stories. | OTA | ✅ **code-complete, archived** in `docs/build-log.md` — `0078872`. **1109 passed, 99 suites** (was 1104/99), export clean, +5 tests. ⚠️ **Walk owed** — WALK-19 step 7 re-run |
| 109 | **The shortfall toast never mentions the shortfall.** `openGetEmbers()` serves both a deliberate "get embers" tap and a "you're 285 short" refusal with one string, so tapping an unaffordable item answers a question you didn't ask. **Three call sites**, incl. `buyCandles`, which the owner never reached. | OTA | ✅ **done, archived** in `docs/build-log.md` — `b565393`. **1113 passed, 99 suites** (was 1109/99), export clean, +4 tests. ⚠️ **Walk owed** — WALK-19 step 7 re-run |
| 110 | **The paywall sells a perk every free user already has.** `PLUS_PERKS[1]` = *"Streak insurance — a candle spends itself when you miss a day"*, shown on the paywall and in Onboarding's first three — but `applyAutoFreeze` is not gated on `plus` at all. **Owner ruled 2026-09-10 that free-for-all is correct**, so the line is what is wrong, not the feature. | OTA | ✅ **done, archived** in `docs/build-log.md` — `54b8bd5`. **1116 passed, 100 suites** (was 1113/99), export clean, +3 tests. ⚠️ **Walk owed** — folds into WALK-19's remaining re-runs |
| 111 | **The tab fade outlined every card in day mode.** `ScreenFade` animated `opacity` over a subtree whose `Card`s carry Android `elevation: 8` (day only — `t.dark ? null : t.shadow(…)`), and elevation shadows do not composite under fractional parent opacity. | OTA | ✅ **done, archived** in `docs/build-log.md` — `76c1d76`. **1116 passed, 100 suites** (unchanged — no test ever asserted on `ScreenFade` by name), export clean. ⚠️ **Walk owed** — WALK-18 re-run in day mode |
| 112 | **Stored candles are unbounded**, so a user banks them, buys once, and the ember economy has no ongoing sink. **Owner set the cap at 3** (2026-09-10). Also makes the IMP-102 renewal toast honest — it says "+3" unconditionally today. | OTA | ✅ **done, archived** in `docs/build-log.md` — `a8ef8ed`. **1129 passed, 102 suites** (was 1116/100), export clean, +13 tests. The `c5` pack is gone. ⚠️ **Walk owed** — folds into WALK-19's remaining Plus-surface re-runs |
| 113 | **Ember packs show real prices and hand over the goods for free** — `onBuy` was a bare counter increment. Consumables are a history, not a balance, so the grant needed an idempotent local ledger of `transactionIdentifier`s. | OTA | ✅ **done, archived** in `docs/build-log.md` — `4df867d`. **1164 passed, 104 suites** (was 1129/102), export clean, +35 tests. `EMBER_PACKS_ENABLED` stays `false`. ⚠️ **Owes a new WALK-20** on hardware with the license tester, alongside the IMP-112 cap interaction |
| 114 | **An unaffordable candle pack goes inert instead of explaining itself.** IMP-109's shortfall toast at [`RitualsApp.js:324`](src/RitualsApp.js#L324) can never fire: [`Shop.js:106`](src/screens/Shop.js#L106) passes `disabled={!afford}`, swallowing the tap. Palettes and skies are not disabled and *do* toast — the two priced surfaces answer the same gesture differently. | OTA | ⬜ **open, spec in [`docs/specs-open.md`](docs/specs-open.md#imp-114)** — found by source review 2026-09-11, confirmed on hardware (15 embers vs packs at 120/300, both greyed and dead) |
| 115 | **A pre-cap holding reads `6 / 3 kept`.** IMP-112 capped intake, not holdings — correctly — but [`Shop.js:98`](src/screens/Shop.js#L98) interpolates `{freezes} / {MAX_CANDLES}` unconditionally, so a user who banked 6 candles before the cap sees a fraction larger than its own limit. | OTA | ⬜ **open, spec in [`docs/specs-open.md`](docs/specs-open.md#imp-115)** — display only. 🔴 **Do not migrate holdings down**; confiscating earned candles to tidy a label is the worse outcome, and `applyAutoFreeze` drains them anyway |
| 116 | 🚦 **A palette applied under Plus is kept but never owned.** `applyPalette` ([`RitualsApp.js:301`](src/RitualsApp.js#L301)) sets `activePalette` without adding to `ownedPalettes`, and IMP-108 routes members there. Survives a lapse, then vanishes at the next switch. `PLUS_PERKS[0]` promises *"Every palette & sky — unlocked forever."* | — | ⛔ **BLOCKED on an owner ruling** — (a) honour "forever" and grant permanent ownership, or (b) drop "forever" and revert on lapse. Opposite code, and (a) has a real revenue cost. Same family as IMP-084/108/110 |
| 117 | **Max font breaks two circles.** The ember pill's `+` ([`shopui.js:31`](src/shopui.js#L31)) has a literal `lineHeight: 15` that `maxFontSizeMultiplier` does not scale, so the glyph outgrows its line box; the custom-mood emoji circles ([`WriteFlow.js:182`](src/screens/WriteFlow.js#L182), [`:196`](src/screens/WriteFlow.js#L196)) are fixed 34dp with no `maxFontSizeMultiplier` at all. | OTA | ⬜ **open, spec in [`docs/specs-open.md`](docs/specs-open.md#imp-117)** — reported off the screen 2026-09-11 at OS font scale 2.0. **Same family as IMP-067 and IMP-095.** Walk folds into WALK-08 |
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
- ✅ **MOTION — DECIDED 2026-09-10.** Owner: *"I choose b and c."* **(b) done** — IMP-111 deleted
  `ScreenFade` (`76c1d76`, archived). **(c) deferred** — applying the unused vocabulary is parked in
  [`docs/specs-open.md`](docs/specs-open.md), gated on Plus being complete.
- ✅ **EMBERS FOR MONEY — DONE, 2026-09-10.** Owner answered both gating questions (**cash → embers →
  candles**; **auto-freeze free for everyone**) and set the **candle cap at 3**. ✅ **IMP-112 (the cap)**
  and ✅ **IMP-113 (the purchase path)** are both done — archived in `docs/build-log.md` (`a8ef8ed`,
  `4df867d`). Reasoning preserved there → "The embers-for-money conversation" — **a decision without its
  reasoning gets re-litigated.** 🔴 **`EMBER_PACKS_ENABLED` still must not be flipped** — it flips only
  after **WALK-20** proves the real purchase path on hardware; that walk still needs to be written into
  `docs/walk-open.md`.
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

_2026-09-10, earlier (Sonnet — **IMP-112 built: stored candles are capped at 3, and the renewal toast no
longer lies about the amount.**) — ✅ code-complete, no walk yet._

**What finished.** [`data.js`](src/data.js) exports `MAX_CANDLES = 3`; `CANDLE_PACKS` drops the now-unsellable
`c5` entry and moves `tag: 'Best value'` onto `c3`. New pure helper [`candleCap.js`](src/home/candleCap.js)
exports `roomFor(held, wanted, cap = MAX_CANDLES)`. `buyCandles` ([`RitualsApp.js`](src/RitualsApp.js)) now
refuses a pack that would overflow the cap — checked **before** the embers check, so a full member is told
they're full, not poor — and takes no embers on refusal. The IMP-102 renewal-grant effect runs the grant
through `roomFor` first: at the cap it grants nothing and shows no toast, below the cap the toast names the
real amount (`+2 candles`, not a hardcoded `+3`). [`Shop.js`](src/screens/Shop.js) shows the cap next to the
held count (`{freezes} / {MAX_CANDLES} kept`). `applyAutoFreeze` untouched, per the spec — it only spends,
never accrues.

**The proof.** New `__tests__/home/candleCap.test.js` (`roomFor` at/below/above the cap, plus a `data.js`
assertion that no pack exceeds `MAX_CANDLES` and that `c5` is gone) and `__tests__/billing/candleCapGrant.test.js`
(source assertions — `buyCandles` and the renewal effect are closures, same pattern as
`autoFreezeStaysFree.test.js` — pinning the cap-before-embers order, no state mutated on refusal, and the
toast naming the real granted amount). **1129 passed, 102 suites** (was 1116/100), `npx expo export
--platform android` clean. Commit `a8ef8ed`. Spec archived to `docs/build-log.md`; its row dropped from
`docs/specs-open.md`'s index (one row left there now, IMP-113).

**The exact next step.** 🔨 Build **113**, last row in the backlog. It owes a new WALK-20 on hardware; no
new walk owed by 112 on its own — folds into WALK-19's remaining Plus-surface re-runs and a fresh look at
the Shop's candle row.

_2026-09-10, latest (Sonnet — **IMP-113 built: ember packs grant real embers through a store purchase, not
a free counter increment.**) — ✅ code-complete, no walk yet._

**What finished.** `onBuy` was `setEmbers((e) => e + pack.amount)` — a bare increment behind real Play
prices. [`data.js`](src/data.js) adds `productId` to each `EMBER_PACKS` entry.
[`revenueCatService.js`](src/billing/revenueCatService.js) adds `getEmberProducts()` and `buyEmberPack()`,
mirroring `buy()`'s `mapError.js` handling exactly; [`simService.js`](src/billing/simService.js) mirrors
both so `npm test` (which only ever runs simService) exercises the real shape. New pure
[`emberGrants.js`](src/billing/emberGrants.js) exports `pendingEmberGrants(transactions, applied,
packsById)` — the ledger core that keys on `transactionIdentifier` so a purchase grants exactly once
against `nonSubscriptionTransactions` (a history, not a balance). New `appliedEmberTx` persisted state
(added to `PERSISTED_KEYS` and both persisted-slice literals, same pattern as IMP-102's
`lastFreezeGrantPeriod`). New [`useLiveEmberProducts.js`](src/billing/useLiveEmberProducts.js) hook +
`mergeEmberPrices` in [`prices.js`](src/billing/prices.js) replace the `$1.99`/`$4.99`/`$9.99` literals with
the store's real `priceString`. Both purchase surfaces — the Get Embers sheet and the Shop's inline pack
row — now route through the same `buyEmberPack` closure in `RitualsApp.js`.
[`GetEmbers.js`](src/screens/GetEmbers.js) and [`Shop.js`](src/screens/Shop.js) take `packs`/`emberPacks`
props (default to the constants) instead of importing `EMBER_PACKS` unconditionally. **Accepted
deliberately, per the spec:** a reinstall re-grants the whole purchase history, since the ledger is local
and this app has no server — flagged so it's a choice, not an accident.

**The proof.** New `__tests__/billing/emberGrants.test.js` (+8), extended `revenueCatService.test.js` (+6),
`simService.test.js` (+4), `prices.test.js` (+5), `state.test.js` (+3), and new
`__tests__/billing/emberPurchaseWiring.test.js` (+9, source assertions — closures aren't unit-testable, same
pattern as `candleCapGrant.test.js`) pinning that `onBuy` is no longer a bare increment. **1164 passed, 104
suites** (was 1129/102), `npx expo export --platform android` clean. Commit `4df867d`. Spec archived to
`docs/build-log.md`; its row dropped from `docs/specs-open.md`'s index — **the backlog is now empty.**
`EMBER_PACKS_ENABLED` stays `false`.

**The exact next step.** The Improvements backlog has **no open row** — check for a newly-filed `IMP-xxx`
before starting a build chat. Otherwise take a runtime walk: **WALK-20** (IMP-113's purchase path + the
IMP-112 cap interaction) needs to be **written into `docs/walk-open.md` first** — it doesn't exist there
yet — or take one of the walks already queued in WALK-19's remaining steps (4e, 7, 10, 8), WALK-08, WALK-07,
WALK-18, or WALK-12 (last).
