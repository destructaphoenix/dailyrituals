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

> ## 🧭 WHAT TO TAKE RIGHT NOW (2026-09-14)
>
> | If this chat is… | Take |
> | --- | --- |
> | a **build task** | ✅ **IMP-131 is DONE** (2026-09-14, `28654cb`) — the regression IMP-130 introduced is fixed: `justifyContent: 'center'` came out of `HERO_BOX`, the numeral's optical centre is back on the art's fixed focal point (card-y 80), and a flex spacer anchors the level/XP row to the bottom padding edge instead of pooling it under the bar. `art.js` and `HERO_HEIGHT` (336) stayed frozen, per the ruling. **1245 passed, 117 suites**, export clean, commit `28654cb`, **no `Release-Lane:` trailer this chat** — the regression is live on the owner's phone, so shipping it is the owner's call, not this chat's. **The backlog is now EMPTY of anything a build chat may take** — [IMP-128](docs/specs-open.md#imp-128--apply-the-motion-vocabulary) is the only row left and it is **OWNER-GATED — do NOT take it.** ✅ **IMP-130 is DONE** (2026-09-14, `111c3de`) — both hero shells now share one `HERO_BOX` at `HERO_HEIGHT` (336) with the content centred; a `testID="streak-hero"` on both `Card`s proves the two grounds measure equal. ✅ **IMP-124 is DONE** (2026-09-13, `87771c4`) — the hero now reads `heroChrome.js`'s ground-based colors, not the theme. ✅ **IMP-125 is DONE** (2026-09-13, `d57dc2d`) — the candle row moved out of the hero and into the week-strip footer, `StreakFreeze`'s `onVideo` branch deleted, `HERO_HEIGHT` untouched. ✅ **IMP-126 is DONE** (2026-09-13, `0502790`) — mood mix bar opacity floors at `0.3`, index 10 no longer flattens to `0`. ✅ **IMP-127 is DONE** (2026-09-13, `402391b`) — `EmberPill` gains `showAdd`, the Shop's pill hides its `+` while `EMBER_PACKS_ENABLED` is false, Home's pill unchanged, IMP-119's centring walk moves to it. ✅ **IMP-129 is DONE** (2026-09-13, `0a2f595`) — `checkEntitlement` threads `customerInfo` through, `revenueCatService`/`simService` gained `getCustomerInfoRaw()`, and `RitualsApp.js`'s `applyEntitlementResult` now runs the ember-grant sweep silently on every launch and foreground. **IMP-124/125/126/127/129 shipped by OTA 2026-09-13** (`5ccf020`, update `01a09b18`, confirmed on the owner's phone). **IMP-130 not shipped yet** — no `Release-Lane:` trailer this chat. |
> | a **runtime walk** | 🟠 **[WALK-24](docs/walk-open.md#walk-24--one-card-two-grounds) is PARTIAL (2026-09-14) — the owner's screenshot already answered half of it.** ✅ Step 1 passes (the classic card is 336, the page below the hero no longer moves with the sky); 🔴 steps 2/3 fail into [IMP-131](docs/specs-open.md#imp-131--the-sunburst-lost-the-numeral); steps 4 (max font, both shells — never run) and 5 (night) are still owed. ⬜ **Re-blocked on the IMP-131 OTA — do not re-run it to re-observe a filed defect.** ⏸ **WALK-23 is HELD at the owner's instruction (2026-09-14) — do not take it.** It is otherwise ready (agent-runnable, no build/device needed). ⚠️ **The stated reason for that hold has now lapsed** — it was "WALK-22 surfaced IMP-130 and the owner wants that looked at first", and IMP-130 is specced — but **lifting the hold is the owner's call, not a walk chat's.** ✅ **WALK-22 is DONE — PASS, 2026-09-14** (device, Play `internal`, owner-run, update `01a09b18`): IMP-124's hero text and IMP-125's candle-row move both confirmed on hardware, night mode identical to day. 🔴 **Found [IMP-130](docs/specs-open.md#imp-130--not-yet-specced) live** — the video hero card is a visibly different size from the default hero card when switching skies; not fixed, routed to Opus to spec. ✅ **WALK-21 is DONE — 🟠 PARTIAL, 2026-09-13** (Play `internal` vc17, owner-run). Steps 1-3, 6-10 passed clean (corners settle IMP-121's `surfaceView` question, step 8 re-confirms WALK-19a's store-authoritative membership); steps 4-5 failed into IMP-124 above; step 11 is a named gap (thin journal, nothing to scroll). Full write-up in `walk-open.md`'s WALK-21 section. 📱 **Next:** resume **"THE DEVICE SITTING PLAN"** below — three sittings (IMP-116 lapse + IMP-114/115 · WALK-19 step 8 real money · WALK-12 last), each with the membership state it needs. ⚠️ **7C stays unwalkable** until the candle holding drains to ≤2 — do not record it as passed because nothing broke. ✅ **Step 7 is DONE — the 2026-09-10/11 lapse sitting cleared it** (hardware, owner-run, monthly tester sub). **WALK-18 ✅, WALK-07 ✅, WALK-19 steps 7A/7B/7D ✅** — IMP-108, IMP-109, IMP-110, IMP-111 and IMP-096 are all now proven on hardware. ⚠️ **7C is NOT proven** — the owner held 6 pre-cap candles, so the cap was never exercised; it re-runs once the holding drains to ≤2 ([IMP-115](docs/specs-open.md#imp-115)). Remaining 🚦: **step 8** (the one real-money purchase, held for last) and **WALK-12 (R8) LAST** — it must be walked on the exact build you ship. ✅ **WALK-08 is CLOSED (2026-09-11, emulator, agent-run)** — DeeperInsights passes at max font, IMP-095 proven, cap measured biting (scale 2, caps 1.5/1.2). It found IMP-118 on the way. 🔴 **But its IMP-117 pass was HALF WRONG and the device overturned it** — the `+` was off-centre at every font size, fixed as [IMP-119](docs/build-log.md#imp-119-the-ember-pills--lost-the-line-that-centred-it-2026-09-11) (commit `1fc0664`, walk still owed on device); the emoji half stands. **A glyph-centring claim is not emulator-provable — route that shape to `device`.** ✅ **SITTING 1 is DONE (2026-09-11, hardware, owner-run) — do not re-run it.** IMP-116 proven: on lapse both cosmetics revert under one message. **IMP-114 stays UNEXERCISED** — `buyCandles` checks the cap before affordability, so 6 candles against a cap of 3 returns at the first guard and its message cannot fire; same blocker as 7C. Step 5's control was dropped by inspection (ownership is consulted independently of `plus` in all three paths). Still owed, cheaply: the `6 kept` label and the no-ember-price check. ✅ **WALK-20 (IMP-113's ember purchase) NOW EXISTS** — written 2026-09-13, [`docs/walk-open.md`](docs/walk-open.md#walk-20--money-for-embers). ⬜ **Still not runnable**, and its own pre-flight says why: three consumables must be live in Play **and** RevenueCat, [IMP-129](docs/specs-open.md#imp-129--the-ember-grant-that-never-heals-itself) must have shipped, and `EMBER_PACKS_ENABLED` must be flipped by OTA — safe to publish because `runtimeVersion` is `appVersion` `1.0.10`, so only vc17 on `internal` can receive it. 🔴 **Its step 4 is the point:** a consumable Play does not consume returns `ITEM_ALREADY_OWNED`, and the buyer gets *"you're already up to date"* and no embers. |
> | a **design request** | 📋 **Take the first row of [`docs/design-queue.md`](docs/design-queue.md)** — a ranked audit of all 14 user-facing surfaces, written 2026-09-11 from source. ✅ **D-01 (the Insights consistency grid) is built as IMP-120** — no further design pass needed, `docs/design-queue.md` still names it first and wants its own row updated by a design chat. **D-02 (Reflections)** is next. ⚠️ **One screen per request**; the four standing rules stay in [`docs/playbook.md`](docs/playbook.md) → "Claude Design — standing rules". ✅ **The "three rows want IMP numbers" note is settled and was one row too long** (2026-09-13): **D-04's defect half is now [IMP-126](docs/specs-open.md#imp-126--the-11th-moods-bar-is-invisible)** (only its remainder-line design is still open), **D-09's is [IMP-127](docs/specs-open.md#imp-127--the-shops-ember--promises-an-action-it-cannot-perform)** — and reading the source corrected D-09: the **Home** pill's `+` opens the Shop and is fine, only the **Shop's own** pill toasts into nothing. **D-10 wants no number** — its two dead rows are IMP-022, already deferred; what is left there is genuine design. |
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
| `internal` | **1.0.10 / vc17** | 36 ✅ | ✅ **SHIPPED 2026-09-12**, confirmed from `eas build:list` + `eas submit:list` not inferred. EAS build `2a2cf27c-…`, submission `bb67a4d0-…` (`releaseStatus: COMPLETED`), from commit `46cbe19`. Runtime `1.0.10` — IMP-123's clip and the channel-collision fix. ✅ **Owner confirms it is live on Play and installed on their phone (2026-09-13).** Unblocks [WALK-21](docs/walk-open.md#walk-21--the-first-video-sky-plays) — read the You tab's Version row for `1.0.10 / vc17` before starting, and re-confirm Plus is on (a licence-tester sub lapses in ~30 min). Prior vc15 build (`e97db74d`, 1.0.9) shipped 2026-09-06, superseded. |

⚠️ **vc13 and vc14 are history and on no track** — no further OTA, and **vc14 must never be promoted: no
RevenueCat key, fell back to `simService`, granted Plus free** — invisible to CI, jest and a green
preflight. Detail → [`docs/build-log.md`](docs/build-log.md).

**Ship mechanics + OTA lane rules** → [`docs/playbook.md`](docs/playbook.md) → "The OTA lane". **✅ API-36 met account-wide.**

**Current stack:** Expo SDK **54** · RN **0.81.5** · React **19.1.0** · **New Architecture** ·
**Reanimated 4.1.1 + worklets 0.5.1** · `targetSdkVersion` **36**, `minSdk` **24** ·
`npm test` → **1238 passed, 117 suites** (verified 2026-09-13, after IMP-129) + **3 zone tests × 2 pinned zones**.
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
| 099–119 | **The billing audit + the two walk-sitting runs.** The entitlement id the store actually grants (099), the numeric `e.code` that made every purchase error `failed` (100), the `failed` card that never asked the store (101), +3 freezes on every completion (102), the ship row with no code in it (103), `tier: 'owned'` wiping the ember balance on one tap (104), the reinstall that was a walk-ordering defect and not a bug (105), a build that could not name its own bundle (106), the lapsed member who kept Plus until they backgrounded the app (107), members charged embers for what the paywall promised (108), the shortfall toast that never named the shortfall (109), the perk every free user already had (110), the tab fade that outlined every card in day mode (111), unbounded candles (112), ember packs that handed over the goods for free (113), the unaffordable pack that went inert (114), `6 / 3 kept` (115), the palette kept but never owned (116), max font breaking two circles (117), the tied weekday that drew as an empty bar (118), and IMP-117's own half-regression (119). | mixed | ✅ **all done, all archived — spec, proof, test counts and commit per row in [`docs/build-log.md`](docs/build-log.md).** Do not re-derive any of it from this table. ⚠️ **Walk debts that are still live, and only these:** IMP-112/114/115/116 fold into WALK-19's remaining Plus block, **IMP-119 owes a device look at the ember `+`** (emulator overturned — and [IMP-127](docs/specs-open.md#imp-127--the-shops-ember--promises-an-action-it-cannot-perform) is written so it survives), and **091 has never been observed at all** |
| 120 | **The Insights consistency grid grows one row per week forever** — ~1,870dp for a single year. Replaced with a horizontally-scrolled month strip of constant ~124dp, direction A of the returned design. **Closes D-01.** | OTA | ✅ **done, archived** in `docs/build-log.md` — `72b0049`. **1200 passed, 108 suites** (was 1199/107), export clean, +9 `buildMonthHeat` tests, +2 fontScale-invariance tests, -10 tests for the deleted `heatGutterWidth`/`monthLabelsForRows`. ⚠️ **Walk owed** — a new `WALK` row, filed separately |
| 121 | **The streak hero is static art.** Teach it to play one looping video sky behind the numeral, against a single bundled fixture clip. **Native — new binary.** | Build | ✅ **done, archived** in `docs/build-log.md` — `d0fe2cb`. **1205 passed, 110 suites** (was 1200/108), export clean, +5 tests. `versionCode` 15→16. ⚠️ **Walk owed** — a new device `WALK` row, filed separately; `surfaceType` (surfaceView vs textureView) is the walk's call |
| 122 | **`SHOP_SKIES` knows five gradient `kind` strings.** Make a sky a manifest (clip URL, poster, mode pair, accent) and feed the shop tiles from it. | OTA | ✅ **done, archived** in `docs/build-log.md` — `738a99e`. **1214 passed, 112 suites** (was 1205/110), export clean, +9 tests. No sky carries a real clip yet (provenance gate still open on Stage 2's art), so Home correctly still shows `RayFan`/`NightRays` for everyone — the manifest mechanism is proven, not yet fed. ⚠️ **No walk of its own** — nothing plays yet to walk |
| 123 | **No sky carries a clip**, so the IMP-121/122 mechanism has never played anywhere — `activeSkyManifest()` returns `null` for every user and Home still draws `RayFan`. Give `meteor` the 2026-09-13 loop clip on R2, **and bump `version` so vc17 stops sharing an OTA channel with vc15.** | Build | ✅ **done, archived** in `docs/build-log.md` — `26e644b`. **1215 passed, 112 suites** (was 1214/112), export clean, +1 test. `versionCode` 16→17, `version` 1.0.9→1.0.10. ⚠️ **Walk owed** — [WALK-21](docs/walk-open.md#walk-21--the-first-video-sky-plays), device, needs vc17 |
| 124 | **The Meteor Shower hero doesn't read in day mode.** IMP-121 worked out that footage is as dark in day mode as at night and applied it to the text *shadow* only — every **color** stayed on the day theme, so `c.ink` `#292524` and `c.dimText` `#6f6a78` paint near-black onto moving water. The XP bar is the same sentence: its track is `accent + '40'`, the fill's own hue at 25%, and `#5AA9E6` against the clip's `#437094` is **2.05:1**. | OTA | ✅ **done, archived** in `docs/build-log.md` — `87771c4`. **1228 passed, 115 suites** (was 1215/112), export clean, +13 tests. ⚠️ **Walk owed** — [WALK-22](docs/walk-open.md#walk-22--the-day-mode-hero-re-check), device |
| 125 | **The candle indicator leaves the hero card.** The owner's remark during WALK-21: it does not need to live inside a 336dp card already carrying a numeral, a subtitle, a level and a bar. Destination: a footer row in the **week-strip** card, where `buildWeekStrip` already draws the days a candle spent itself. | OTA | ✅ **done, archived** in `docs/build-log.md` — `d57dc2d`. **1226 passed, 115 suites** (was 1228/115) — down by the two deleted `StreakFreeze` `onVideo` cases, the sanctioned exception. Export clean. ⚠️ **Walk owed** — folds into [WALK-22](docs/walk-open.md#walk-22--the-day-mode-hero-re-check) step 5, updated |
| 126 | **The 11th mood's bar is invisible.** Mood mix shades each bar `opacity: 1 - i * 0.1` ([`InsightsScreen.js:142`](src/screens/InsightsScreen.js#L142)); at index 10 that is **0**, past it negative. 8 built-in moods and **no cap on custom ones**, so three custom feelings in regular use render a bar that is in the data, labelled with its own count, and cannot be seen. **IMP-118's shape exactly.** | OTA | ✅ **done, archived** in `docs/build-log.md` — `0502790`. **1228 passed, 116 suites** (was 1226/115), export clean, +2 tests, +1 suite. Floor clamped at `0.3`; index 7 unchanged. No walk owed |
| 127 | **The Shop's ember `+` promises an action it cannot perform.** With `EMBER_PACKS_ENABLED` false, `Shop.js:78`'s pill toasts *"Embers also gather on their own"* — an honest message behind a control that cannot do what its glyph says. | OTA | ✅ **done, archived** in `docs/build-log.md` — `402391b`. **1230 passed, 116 suites** (was 1228/116), export clean, +2 tests. `EmberPill` gains `showAdd`; Shop's pill hides the `+` when `EMBER_PACKS_ENABLED` is false, Home's pill unchanged. IMP-119's owed centring walk moves to Home's pill. No walk of its own |
| 129 | **A paid ember pack that resolves while the app is dying is never granted.** [`emberGrants.js`](src/billing/emberGrants.js) documented a self-healing launch sweep; `applyEmberGrants` had exactly **one** call site, inside `buyEmberPack`, and `pendingEmberGrants` was imported nowhere else. Play charges, the embers never arrived, and relaunching did not fix it. | OTA | ✅ **done, archived** in `docs/build-log.md` — `0a2f595`. **1238 passed, 117 suites** (was 1230/116), export clean, +8 tests, +1 suite. Walk = [WALK-20](docs/walk-open.md#walk-20--money-for-embers) step 7, still owed — cannot run while `EMBER_PACKS_ENABLED` is `false` |
| 130 | **The hero card changes size with the sky.** A cosmetic choice relayouts the screen: the video shell is `height: HERO_HEIGHT` (336, fixed) and the default shell has no height at all, so it sizes to content — and IMP-125 pulled `<StreakFreeze>` out of the **shared** `heroInner`, shrinking the default card by ~73dp while the video card stayed put. Both shells go to 336 with the content centred; 336 is pinned to the sky encode recipe, so the default card is the one that moves. | OTA | ✅ **done, archived** in `docs/build-log.md` — `111c3de`. **1241 passed, 117 suites** (was 1238/117), export clean, +3 tests, no new suite. Both shells share `HERO_BOX` and a `testID="streak-hero"`. ⚠️ **Walk owed** — [WALK-24](docs/walk-open.md#walk-24--one-card-two-grounds), device |
| 131 | **The sunburst lost the numeral — regression from IMP-130, already on the owner's phone.** `RayFan`/`NightRays` are absolute at `top: -70`, `height: 300`, so their focal point is **fixed at card-y 80** and `art.js` says so; the numeral used to land on it by construction (`26 + 13 + 82/2`). IMP-130's `justifyContent: 'center'` moved the content ~46dp down and left the art behind — the rays and the night bloom converge **above** the numeral, and the meta row fell below the 300dp disc entirely. 336 and `art.js` are **not** reopened: the centring comes out and the freed space becomes one flex spacer that anchors the level/XP row to the bottom padding edge, where `SkyHero`'s bottom-28% scrim already is. | OTA | ✅ **done, archived** in `docs/build-log.md` — `28654cb`. **1245 passed, 117 suites** (was 1241/117), export clean, +4 tests, no new suite. ⚠️ **Walk owed** — [WALK-24](docs/walk-open.md#walk-24--one-card-two-grounds), re-scoped, device |
| 128 | **Apply the motion vocabulary** — `riseIn` on Home's card stack and the Keepsakes rows, `popIn` on earned badges, `useCountUp` on the streak numeral. Six of eight `motion.js` exports still have no consumer, and IMP-077 paid for them with two **native** deps and the vc14 build. | OTA | ⏸ **OWNER-GATED — specced 2026-09-13 at the owner's request, gate deliberately left ON.** A build chat must not take it until the owner lifts it. Spec in [`docs/specs-open.md`](docs/specs-open.md#imp-128--apply-the-motion-vocabulary) |
| 022 | Save as PDF + About sheet (the two dead You-tab buttons) | Build | ⏸ **deferred (owner)** — spec in build-log → "Deferred specs"; **perk #6 gate** |
| 044 | R8 on release builds (dev client was shipping to the public) | Build | 🟢 **code-complete, UNWALKED.** R8 must be walked on the build you actually ship, so it rides **vc15 or later**; walk = WALK-12, on hardware, last in the sitting |
| 057 | Historical `dayKey` migration | Build | 🔒 **reserved, not missing** — cannot be written until real device numbers come back from the dev panel's "Data health" reporter. See below |
| — | **Plus is ON** (`PLUS_ENABLED = true`, commit `7d2e515`) | Build | ✅ **and vc15 can take money for real** — proven on a device. Cash ember packs were decoupled from the flag first (`6590834`), caught mid-build: flipping `PLUS_ENABLED` had armed the Shop's "Gather Embers" purchase path as a side effect |

---

## 🎨 Claude Design (IMP-078)

**Moved to [`docs/playbook.md`](docs/playbook.md) → "Claude Design" (2026-09-10, size rule).** Stable
reference — project id, card list, regeneration steps. **The queue itself is now
[`docs/design-queue.md`](docs/design-queue.md)** (2026-09-11): 14 ranked rows across three tiers —
what degrades as the journal grows, the six disagreeing Plus surfaces, and polish. ✅ **D-01 (Insights)
is built as IMP-120** — `docs/design-queue.md` itself still wants a design chat to update its own row.
**D-02 (Reflections)** is next.

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
  `ScreenFade` (`76c1d76`, archived). **(c) deferred, and now specced without being unparked** — applying
  the unused vocabulary is **[IMP-128](docs/specs-open.md#imp-128--apply-the-motion-vocabulary)** as of
  2026-09-13, written at the owner's request with the *"when plus is complete"* gate left **on**. ⏸ **A
  build chat must not take it.** The one decision still open is whether to lift the gate.
- ✅ **EMBERS FOR MONEY — DONE, 2026-09-10.** Owner answered both gating questions (**cash → embers →
  candles**; **auto-freeze free for everyone**) and set the **candle cap at 3**. ✅ **IMP-112 (the cap)**
  and ✅ **IMP-113 (the purchase path)** are both done — archived in `docs/build-log.md` (`a8ef8ed`,
  `4df867d`). Reasoning preserved there → "The embers-for-money conversation" — **a decision without its
  reasoning gets re-litigated.** 🔴 **`EMBER_PACKS_ENABLED` still must not be flipped** — it flips only
  after **WALK-20** proves the real purchase path on hardware. ✅ **That walk is now written**
  ([`docs/walk-open.md`](docs/walk-open.md#walk-20--money-for-embers), 2026-09-13) and it is blocked on four
  pre-flight conditions, not on a build — see its own section.
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

_2026-09-14 (Opus — **IMP-133 built + walked: the sunburst was showing where it ends. Found by the owner on
the IMP-132 OTA; they guessed the fix.**) — ✅ code-complete, ✅ emulator-proven, shipped by OTA._

**What finished.** The owner's report was *"the hero card looks empty and ugly now"* and their guess —
*"would making the rays longer work?"* — was right. IMP-132 centred the disc and in doing so **made its own
outer boundary visible for the first time**: at focal 80 the disc bled off the top edge and you never saw
where it stopped; centred at 168 in a 350x336 card, all four sides fall inside the frame and the ray-tips
terminate in mid-air. [`art.js`](src/art.js) gains `reach` (default `size / 2`, frozen for other callers) —
**ray length had to be separated from box size, not just increased**, because the night bloom's
`<Svg width={size}>` maps a *fixed* `viewBox="0 0 300 300"` and scaling `size` would have grown the pool of
candlelight from r80 to r139. [`HomeScreen.js`](src/screens/HomeScreen.js) derives the reach from the card's
own diagonal (`hypot((width - 40) / 2, 336 / 2) * 1.08`), ~20dp of clearance on every width from 360 to 430.

**The proof.** IMP-132's containment case asserted the disc sat **wholly inside** the card — **that rule is
what produced the bare rim** — so it is inverted: still centred on the focal, but `reach` must exceed the
card's corner distance so the boundary is never visible. **1249 passed, 117 suites, unchanged** (a test was
corrected, not added); export clean. Full detail:
[`docs/build-log.md`](docs/build-log.md#imp-133--the-sunburst-was-showing-where-it-ends-2026-09-14).

**Runtime proof — emulator, agent-run, this chat.** Fresh local dev build on `Pixel_9_Pro`, day and night
both confirmed filled edge to edge with the bloom still tight at the numeral. **The installed dev client was
vc15/1.0.9 and died on `Cannot find native module 'ExpoVideo'` because `android/` was 28 days stale — the
prebuild staleness trap, exactly as recorded;** `expo prebuild --clean` + `expo run:android` cleared it.

**Flagged before shipping, and approved.** The rays now pass behind the "day streak" label, the subtitle and
the XP bar. That is the pre-IMP-130 composition returning, not a new liberty, but it is busier than the last
two builds — the owner saw the emulator shots and said go.

**Exact next step.** WALK-24 stays owed on device; its steps 2/3 now cover IMP-131's convergence, IMP-132's
centring and IMP-133's bleed, and its steps 4 (max font, both shells) and 5 (night) have still never run.

_2026-09-14 (Opus — **IMP-132 built: the sunburst was centred on a card that no longer exists. The OTHER
half of IMP-130's regression, found by the owner on the IMP-131 OTA.**) — ✅ code-complete, walk owed._

**What finished.** IMP-131 proved the numeral sits **on** the focal point. It never asked whether the focal
was still in the right *place*, and it was not. `80` is the middle of the **content-sized ~232dp** card the
hero was before IMP-130 — there, `top: -70, size: 300` put the disc's bottom edge on the card's bottom edge
by design. IMP-130 pinned the card to 336 and left the focal at 80, so the disc hangs 70dp off the top and
leaves a **106dp bare band** underneath, and the numeral rode 88dp too high with it.
[`art.js`](src/art.js) now takes `focal` as a prop (default 80 — frozen for any other caller);
[`HomeScreen.js`](src/screens/HomeScreen.js) derives **one** `HERO_FOCAL = HERO_HEIGHT / 2` and computes
both the art's `focal` and the numeral block's `marginTop` from it, so they cannot drift apart again. Disc
now spans 18…318 in a 336 card: **nothing clipped, top margin = bottom margin.** The three line heights
under the numeral are explicit now, and the meta row's vestigial `marginTop: 22` came out to pay for the
centring.

**The proof.** A fifth `describe` in [`HomeScreenSkyHero.test.js`](__tests__/screens/HomeScreenSkyHero.test.js)
that types no `80`, `168` or `336`: the focal the screen passes = rendered card height ÷ 2 (day + night), the
disc's top margin = its bottom margin, and the full content stack sums to ≤ the card height with ≥ 12dp of
slack. Red before on the first three. IMP-131's `focalOf` helper and its video-shell case both needed
repair — the helper measured `art.js`'s *default* focal instead of the shipped one, and the video shell has
no `RayFan` to read; **both were the test's bugs, and the invariant they guard stayed green.**
**1249 passed, 117 suites** (was 1245/117, +4). Full detail:
[`docs/build-log.md`](docs/build-log.md#imp-132--the-sunburst-was-centred-on-a-card-that-no-longer-exists-2026-09-14).

**The lesson, because it is the third time this card has bitten.** IMP-130 asserted `height === 336`.
IMP-131 asserted `numeral === focal`. Both stayed green while the card looked wrong, because an
absolutely-positioned decoration in a fixed-height card has **two** invariants — what it's aligned to, and
**where that alignment sits in the frame**. Only the second one is visible to the owner.

**Exact next step.** No `Release-Lane:` trailer this chat — it is pure JS on runtime `1.0.10` and wants an
OTA, but that is the owner's call. WALK-24 stays blocked until it ships; its steps 2/3 now test IMP-132's
centring as well as IMP-131's convergence, and its steps 4 (max font, both shells) and 5 (night) have still
never run.

_2026-09-14 (Opus — **IMP-131 specced: the sunburst lost the numeral. A regression from IMP-130, found by the
owner on the OTA I told them to ship.**) — 📝 spec session, no code written._

**What finished.** The owner's Home screenshot from the IMP-130 OTA (`433eb53`, night mode, streak 1) is a
defect and it is IMP-130's. **The rays and `NightRays`' bloom converge above the numeral, and the level row
and XP bar sit below where the art ends.** Cause: `RayFan`/`NightRays` are `position: 'absolute', top: -70,
height: 300` inside the `Card`, so their focal point is **fixed at card-y 80** whatever the card holds — and
the numeral used to land on it **by construction** (`26 + 13 + 82/2 = 80`). IMP-130's
`justifyContent: 'center'` moved the content ~46dp down and left the art where it was.

**What I got wrong, precisely.** IMP-130's trap 4 wrote down *"they do not stretch"* and WALK-24 step 3 wrote
down *"the number sits ~43dp lower than yesterday"* — **one subtraction apart, and I never did it.** I judged
the numeral against the *frame* and never against the *art*. The build-log's IMP-130 line (*"the numeral sits
mid-frame… and the 300dp disc doesn't leave a bare band"*) is inverted on both counts; IMP-131 corrects it.
**The rule to carry: absolutely-positioned art in a card is a fixed point, so changing how that card lays out
its content changes a relationship — and the relationship, not the box, is what a test must assert.**
IMP-130's three tests asserted `height === 336` and stayed green through all of this.

**The ruling.** **336 stays, `art.js` stays frozen, IMP-130 is not reopened.** `justifyContent: 'center'` comes
out of `HERO_BOX`; the freed space becomes **one flex spacer** that anchors the level/XP row to the bottom
padding edge — where `SkyHero`'s **bottom-28%** scrim already is (top-aligned as IMP-121 shipped it, that row
sat *above* its own scrim).

**The proof it asks for.** A fourth `describe` in `HomeScreenSkyHero.test.js` reads the focal point off the
**rendered** art (`top + height / 2`) and asserts it equals `paddingTop + marginTop + lineHeight / 2` off the
rendered box — **no `80` typed on either side, nothing hardcoded to the ~195/126/46 estimates** (three terms
are RN default line heights). Red before on `justifyContent`. Expect **1245 / 117** (+4, no new suite).

**The exact next step.** A **build chat** takes
[IMP-131](docs/specs-open.md#imp-131--the-sunburst-lost-the-numeral) — it is the first and only open row.
⚠️ **The regression is live on the owner's phone**, and the fix is pure JS on runtime `1.0.10`, so it wants a
`Release-Lane: ota` trailer as soon as it is green — **the owner's call, not the build chat's.**
[WALK-24](docs/walk-open.md#walk-24--one-card-two-grounds) is re-scoped to it and stays blocked on that push;
its steps 4 (max font) and 5 (night) have still never run.

---

_2026-09-14 (Sonnet — **IMP-131 built: the sunburst converges on the numeral again.**) — ✅ code-complete,
no walk of its own (WALK-24 owns the runtime proof, not run from this chat)._

**What finished.** [`HomeScreen.js`](src/screens/HomeScreen.js) — `justifyContent: 'center'` removed from
`HERO_BOX`, putting the numeral block back flush to `paddingTop` so its optical centre lands back on the
art's fixed focal point (card-y 80). A `<View testID="hero-spacer" style={{ flex: 1 }} />` between the
numeral block and the level/XP row anchors that row to the bottom padding edge. `testID`s added per spec:
`hero-box` (both shells), `hero-numeral-block`. `art.js`, `skyHero.js`, `heroChrome.js`, `ui.js` and
`HERO_HEIGHT` all untouched, per the ruling.

**The proof.** [`HomeScreenSkyHero.test.js`](__tests__/screens/HomeScreenSkyHero.test.js) gained the spec's
fourth `describe`: day/night cases read the rendered art's focal point (`top + height/2`, never a typed
`80`) against the box's `paddingTop + marginTop + lineHeight/2` (red before on the day case); a third
confirms the video shell shares the box; a fourth asserts the spacer is bare `{ flex: 1 }`. IMP-130's three
height cases stayed green. **1245 passed, 117 suites** (was 1241/117, +4, no new suite) — the exact count
expected. Export clean. Commit `28654cb`. Spec archived to `docs/build-log.md`; `docs/specs-open.md` now
holds only the owner-gated IMP-128.

**Not shipped** — no `Release-Lane:` trailer; shipping the live-regression fix is the owner's call.

**The exact next step.** Backlog has nothing left for a build chat. [WALK-24](docs/walk-open.md#walk-24--one-card-two-grounds)
is re-scoped to IMP-131 and stays blocked until this fix ships by OTA. WALK-23 stays held by the owner.
