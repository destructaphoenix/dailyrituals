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
> | a **build task** | ⬜ **Take [IMP-118](docs/specs-open.md#imp-118)** — the one open row, opened 2026-09-11 by WALK-08: a weekday with entries every week draws as an empty bar when its top mood ties, and the card above it says the opposite. One line in `deeper.js` plus tests; the renderer already has the branch. Prior: `docs/specs-open.md` has no open spec left. ✅ **And it has now SHIPPED: IMP-114/115/116/117 went out by OTA on 2026-09-11** (10 commits pushed to `main`, `Release-Lane: ota` on `176b782`, CI run `34594673765` green in 2m16s). **Group `95411ab6-1c03-4f2d-b261-9a7d6e2011b8`, runtime `1.0.9`, update `01a09044-cdb7-7c46-9660-0a1bedd08a0a`** — manifest read back by hand, `rcAndroidKey` **present and non-empty** (IMP-086 holds). Predecessor group was `7e97df68` (IMP-113, 2026-09-10), not `f961b427` as `176b782`'s own message says — that was the IMP-100 group, two ships back. Until that OTA is applied on the **second** launch, every walk that re-runs these four rows is walking a bundle without them. The phase ladder (8 / 10b / 11) is explicitly **parked until the owner resumes it** — do not start one on your own read of this table; ask the owner what to take next. |
> | a **runtime walk** | ✅ **The owner's phone is CONFIRMED on the IMP-114/115/116/117 bundle — it reads `update 01a09044` (2026-09-11).** ⚠️ **The You tab prints the UPDATE id, not the group** — [`diagnostic.js:35`](src/billing/diagnostic.js#L35) strips dashes and takes 8 chars of `Updates.updateId`, so look for **`01a09044`**, never the group `95411ab6`. A walk of 7C, the IMP-116 lapse block, WALK-08's circles or WALK-12 on any older bundle proves nothing; after any further OTA, re-read this string before starting. 📱 **Take the running order from [`walk-open.md`](docs/walk-open.md) → "THE DEVICE SITTING PLAN"** — three sittings (IMP-116 lapse + IMP-114/115 · WALK-19 step 8 real money · WALK-12 last), each with the membership state it needs. ⚠️ **7C stays unwalkable** until the candle holding drains to ≤2 — do not record it as passed because nothing broke. ✅ **Step 7 is DONE — the 2026-09-10/11 lapse sitting cleared it** (hardware, owner-run, monthly tester sub). **WALK-18 ✅, WALK-07 ✅, WALK-19 steps 7A/7B/7D ✅** — IMP-108, IMP-109, IMP-110, IMP-111 and IMP-096 are all now proven on hardware. ⚠️ **7C is NOT proven** — the owner held 6 pre-cap candles, so the cap was never exercised; it re-runs once the holding drains to ≤2 ([IMP-115](docs/specs-open.md#imp-115)). Remaining 🚦: **step 8** (the one real-money purchase, held for last) and **WALK-12 (R8) LAST** — it must be walked on the exact build you ship. ✅ **WALK-08 is CLOSED (2026-09-11, emulator, agent-run)** — DeeperInsights passes at max font, IMP-095 and IMP-117 both proven, cap measured biting (scale 2, caps 1.5/1.2). It found IMP-118 on the way. ⚠️ **WALK-20 (IMP-113's ember purchase) still does not exist in `docs/walk-open.md`, and cannot be walked at all while `EMBER_PACKS_ENABLED` is `false`.** |
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
`npm test` → **1187 passed, 105 suites** (verified 2026-09-11) + **3 zone tests × 2 pinned zones**.
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
| 114 | **An unaffordable candle pack goes inert instead of explaining itself.** IMP-109's shortfall toast at `RitualsApp.js:324` could never fire: `Shop.js:106` passed `disabled={!afford}`, swallowing the tap. Palettes and skies were not disabled and *did* toast — the two priced surfaces answered the same gesture differently. | OTA | ✅ **done, archived** in `docs/build-log.md` — `fa10a2a`. **1167 passed, 104 suites** (was 1164/104), export clean, +3 tests (source + render assertion), proven red first. ⚠️ **No walk of its own** — folds into WALK-19 step 7's re-run |
| 115 | **A pre-cap holding reads `6 / 3 kept`.** IMP-112 capped intake, not holdings — correctly — but [`Shop.js:98`](src/screens/Shop.js#L98) interpolated `{freezes} / {MAX_CANDLES}` unconditionally, so a user who banked 6 candles before the cap saw a fraction larger than its own limit. | OTA | ✅ **done, archived** in `docs/build-log.md` — `ea00b0c`. **1172 passed, 104 suites** (was 1167/104), export clean, +5 tests. New `keptLabel` helper drops the `/ 3` above the cap; holdings untouched |
| 116 | **A palette applied under Plus is kept but never owned.** `applyPalette` ([`RitualsApp.js:301`](src/RitualsApp.js#L301)) sets `activePalette` without adding to `ownedPalettes`, and IMP-108 routes members there. Survives a lapse, then vanishes at the next switch. `PLUS_PERKS[0]` promised *"Every palette & sky — unlocked forever."* | OTA | ✅ **done, archived** in `docs/build-log.md` — `b588f2a`. **1187 passed, 105 suites** (was 1172/104), export clean, +15 tests, the two revert cases proven red first. Owner-ruled (b) membership-scoped: `PLUS_PERKS[0]` now says "yours while you're a member"; a self-healing effect reverts an applied-but-unowned cosmetic on lapse with one toast. ⚠️ **Walk owed** — folds into WALK-19's Plus block, needs a fresh Plus-on → Plus-off sitting |
| 117 | **Max font breaks two circles.** The ember pill's `+` ([`shopui.js:31`](src/shopui.js#L31)) has a literal `lineHeight: 15` that `maxFontSizeMultiplier` does not scale, so the glyph outgrows its line box; the custom-mood emoji circles ([`WriteFlow.js:182`](src/screens/WriteFlow.js#L182), [`:196`](src/screens/WriteFlow.js#L196)) are fixed 34dp with no `maxFontSizeMultiplier` at all. | OTA | ✅ **done, archived** in `docs/build-log.md` — `a59aea9`. **1192 passed, 106 suites** (was 1187/105), export clean, +5 tests, all 5 new source assertions proven red first. ⚠️ **Walk owed** — folds into WALK-08 |
| 118 | **A tied weekday draws as an empty bar.** `moodByWeekday` assigns `n` only when one mood wins outright, so a weekday with 66 entries and a tie returns `n: 0` and [`DeeperInsights.js:83`](src/screens/DeeperInsights.js#L83) sizes the bar from `n` — pixel-identical to a weekday never written on, while "Weekly rhythm" directly above calls those same days the fullest. `top: null` on a tie is correct and test-pinned; the renderer's soft/outlined branch is simply unreachable today. | OTA | ⬜ **open** — spec in [`docs/specs-open.md`](docs/specs-open.md#imp-118). Found by WALK-08 2026-09-11 (emulator); **not a font bug**, reproduces at every font size |
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

_2026-09-11, earlier (Sonnet — **IMP-116 built: a Plus cosmetic applied for free reverts to the default on
lapse instead of staying stranded.**) — ✅ code-complete, walk owed (folds into WALK-19's Plus block)._

**What finished.** New pure [`cosmeticEntitlement.js`](src/home/cosmeticEntitlement.js) —
`entitledId(activeId, ownedIds, items, plus, defaultId)`, the five-branch rule from the spec's tier
taxonomy. One `React.useEffect` in [`RitualsApp.js`](src/RitualsApp.js), keyed on `[plus, activePalette,
activeSky, ownedPalettes, ownedSkies]`, computes both reverts, applies them (pairing `setActivePalette`
with `retint`, matching `applyPalette`'s own shape), and emits a single toast — both/palette-only/sky-only,
or nothing for a free user who never applied a Plus cosmetic. Self-healing, not transition-gated, so the
owner's own stranded Frostlight/Harvest Moon repair on next launch. `data.js` — `PLUS_PERKS[0]` dropped
"forever" for *"yours while you're a member"*; the other perks' off-by-one `#n` comments left untouched, per
the spec. `buyPalette`/`buySky` untouched — an ember purchase stays permanent.

**The proof.** New `__tests__/home/cosmeticEntitlement.test.js` — `entitledId` across all five branches for
both palettes and skies, the owner's two real cases pinned by name (Frostlight and Harvest Moon both
revert), Harvest Moon surviving after a real ember purchase, an `'owned'` item surviving under `plus:
false`; source assertions that the effect exists, is keyed on the right five deps, pairs `retint` with
`setActivePalette`, and never emits more than one `showToast(` call; a `data.js` assertion that
`PLUS_PERKS[0]` no longer contains "forever". The two revert cases and the copy/effect assertions proven
red first. **1187 passed, 105 suites** (was 1172/104), `npx expo export --platform android` clean, +15
tests. Commit `b588f2a`. Spec archived to `docs/build-log.md`; its row dropped from `docs/specs-open.md`'s
index (one row left there now — IMP-117).

**The exact next step (at the time).** Take the next unchecked build row: **IMP-117** (max font breaks two
circles). **Walk owed by IMP-116** — folds into WALK-19's Plus block, needs a fresh Plus-on → Plus-off
sitting (cannot share a sitting with the paywall rows).

_2026-09-11, latest (Sonnet — **IMP-117 built: the ember pill's `+` and the two custom-mood emoji circles
now grow with the font instead of clipping at the max OS scale.**) — ✅ code-complete, walk owed (folds
into WALK-08)._

**What finished.** [`shopui.js`](src/shopui.js) — dropped the `+`'s literal `lineHeight: 15`; its circle's
size and radius now derive from `17 * Math.min(PixelRatio.getFontScale(), CHROME_FONT_SCALE)`, so the box
grows exactly as far as the capped glyph is allowed to. [`WriteFlow.js`](src/screens/WriteFlow.js) — added
`maxFontSizeMultiplier={CHROME_FONT_SCALE}` to both the chosen-face and palette-swatch emoji `Text`s, and
sized both circles from one shared local `dot = 34 * Math.min(PixelRatio.getFontScale(), CHROME_FONT_SCALE)`
— one const, two call sites, no new module, per the spec. The file's third, unrelated 34dp circle (the
typed-emoji preview) was left untouched — out of scope. No emoji or palette contents changed.

**The proof.** New `__tests__/ui/EmberPill.test.js` — source assertions that the `+` carries no literal
`lineHeight` and the circle derives from `PixelRatio.getFontScale()`. Extended
[`__tests__/screens/WriteFlowMood.test.js`](__tests__/screens/WriteFlowMood.test.js) with source assertions
that both emoji `Text`s carry `maxFontSizeMultiplier={CHROME_FONT_SCALE}`, that neither circle hardcodes the
old `34/17` box, and that both derive from the shared `dot`. jest renders a tree, not pixels — these are
source assertions only, and all 5 were proven red first by stashing the source changes, confirming failure,
then restoring them. **1192 passed, 106 suites** (was 1187/105), `npx expo export --platform android`
clean, +5 tests. Commit `a59aea9`. Spec archived to `docs/build-log.md`; `docs/specs-open.md`'s queue is
now empty.

**The exact next step.** ✅ **The Improvements backlog (IMP-001 through IMP-117) is fully cleared** — every
row is done, deferred (022), or reserved (057, 044 code-complete/unwalked). `docs/specs-open.md` has no open
spec. The phase ladder (8 / 10b / 11) is explicitly parked until the owner resumes it — **the next build
chat should ask the owner what to take next rather than opening a phase-ladder row unprompted.** Walk debt
outstanding: WALK-08 (folds in IMP-117 + DeeperInsights at max font), WALK-19's remaining steps (4e re-run,
7 re-run, 10, 8, and the Plus-on→off block for IMP-116), WALK-12 (R8, must be last), and WALK-20 (does not
exist yet in `docs/walk-open.md`, blocked on `EMBER_PACKS_ENABLED`).
