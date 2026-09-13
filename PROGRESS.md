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

> ## 🧭 WHAT TO TAKE RIGHT NOW (2026-09-13)
>
> | If this chat is… | Take |
> | --- | --- |
> | a **build task** | ✅ **IMP-124 is DONE** (2026-09-13, `87771c4`) — the hero now reads `heroChrome.js`'s ground-based colors, not the theme. ✅ **IMP-125 is DONE** (2026-09-13, `d57dc2d`) — the candle row moved out of the hero and into the week-strip footer, `StreakFreeze`'s `onVideo` branch deleted, `HERO_HEIGHT` untouched. ✅ **IMP-126 is DONE** (2026-09-13, `0502790`) — mood mix bar opacity floors at `0.3`, index 10 no longer flattens to `0`. ✅ **IMP-127 is DONE** (2026-09-13, `402391b`) — `EmberPill` gains `showAdd`, the Shop's pill hides its `+` while `EMBER_PACKS_ENABLED` is false, Home's pill unchanged, IMP-119's centring walk moves to it. ✅ **IMP-129 is DONE** (2026-09-13, `0a2f595`) — `checkEntitlement` threads `customerInfo` through, `revenueCatService`/`simService` gained `getCustomerInfoRaw()`, and `RitualsApp.js`'s `applyEntitlementResult` now runs the ember-grant sweep silently on every launch and foreground. 🆕 **TAKE [IMP-130](docs/specs-open.md#imp-130--the-hero-card-is-one-size-whichever-sky-is-on) — specced 2026-09-14, not gated, and it is the only row a build chat may take.** The hero card is one size whichever sky is on: **both shells render at `HERO_HEIGHT` (336) with the content centred**, so applying a sky stops moving every card below it. **The ruling to not re-litigate:** 336 stays and the *default* card grows to meet it, because `design-queue.md` → "The frame" derives the near-square box, the 1:1 "generate square" choice, the 1280×1280 encode recipe and the bottom-28% scrim rule **from 336** — shrinking it to the default card's ~250dp throws away a third of every sky frame already encoded against that recipe. ⏸ **[IMP-128](docs/specs-open.md#imp-128--apply-the-motion-vocabulary) is OWNER-GATED — do NOT take it.** **IMP-124/125/126/127/129 shipped by OTA 2026-09-13** (`5ccf020`, update `01a09b18`, confirmed on the owner's phone). |
> | a **runtime walk** | 🆕 **[WALK-24](docs/walk-open.md#walk-24--one-card-two-grounds) is FILED (2026-09-14) — IMP-130's proof, device, visual.** ⬜ Blocked on the OTA push and nothing else; its one gesture is switching skies and watching whether the page below the hero moves. ⏸ **WALK-23 is HELD at the owner's instruction (2026-09-14) — do not take it.** It is otherwise ready (agent-runnable, no build/device needed). ⚠️ **The stated reason for that hold has now lapsed** — it was "WALK-22 surfaced IMP-130 and the owner wants that looked at first", and IMP-130 is specced — but **lifting the hold is the owner's call, not a walk chat's.** ✅ **WALK-22 is DONE — PASS, 2026-09-14** (device, Play `internal`, owner-run, update `01a09b18`): IMP-124's hero text and IMP-125's candle-row move both confirmed on hardware, night mode identical to day. 🔴 **Found [IMP-130](docs/specs-open.md#imp-130--not-yet-specced) live** — the video hero card is a visibly different size from the default hero card when switching skies; not fixed, routed to Opus to spec. ✅ **WALK-21 is DONE — 🟠 PARTIAL, 2026-09-13** (Play `internal` vc17, owner-run). Steps 1-3, 6-10 passed clean (corners settle IMP-121's `surfaceView` question, step 8 re-confirms WALK-19a's store-authoritative membership); steps 4-5 failed into IMP-124 above; step 11 is a named gap (thin journal, nothing to scroll). Full write-up in `walk-open.md`'s WALK-21 section. 📱 **Next:** resume **"THE DEVICE SITTING PLAN"** below — three sittings (IMP-116 lapse + IMP-114/115 · WALK-19 step 8 real money · WALK-12 last), each with the membership state it needs. ⚠️ **7C stays unwalkable** until the candle holding drains to ≤2 — do not record it as passed because nothing broke. ✅ **Step 7 is DONE — the 2026-09-10/11 lapse sitting cleared it** (hardware, owner-run, monthly tester sub). **WALK-18 ✅, WALK-07 ✅, WALK-19 steps 7A/7B/7D ✅** — IMP-108, IMP-109, IMP-110, IMP-111 and IMP-096 are all now proven on hardware. ⚠️ **7C is NOT proven** — the owner held 6 pre-cap candles, so the cap was never exercised; it re-runs once the holding drains to ≤2 ([IMP-115](docs/specs-open.md#imp-115)). Remaining 🚦: **step 8** (the one real-money purchase, held for last) and **WALK-12 (R8) LAST** — it must be walked on the exact build you ship. ✅ **WALK-08 is CLOSED (2026-09-11, emulator, agent-run)** — DeeperInsights passes at max font, IMP-095 proven, cap measured biting (scale 2, caps 1.5/1.2). It found IMP-118 on the way. 🔴 **But its IMP-117 pass was HALF WRONG and the device overturned it** — the `+` was off-centre at every font size, fixed as [IMP-119](docs/build-log.md#imp-119-the-ember-pills--lost-the-line-that-centred-it-2026-09-11) (commit `1fc0664`, walk still owed on device); the emoji half stands. **A glyph-centring claim is not emulator-provable — route that shape to `device`.** ✅ **SITTING 1 is DONE (2026-09-11, hardware, owner-run) — do not re-run it.** IMP-116 proven: on lapse both cosmetics revert under one message. **IMP-114 stays UNEXERCISED** — `buyCandles` checks the cap before affordability, so 6 candles against a cap of 3 returns at the first guard and its message cannot fire; same blocker as 7C. Step 5's control was dropped by inspection (ownership is consulted independently of `plus` in all three paths). Still owed, cheaply: the `6 kept` label and the no-ember-price check. ✅ **WALK-20 (IMP-113's ember purchase) NOW EXISTS** — written 2026-09-13, [`docs/walk-open.md`](docs/walk-open.md#walk-20--money-for-embers). ⬜ **Still not runnable**, and its own pre-flight says why: three consumables must be live in Play **and** RevenueCat, [IMP-129](docs/specs-open.md#imp-129--the-ember-grant-that-never-heals-itself) must have shipped, and `EMBER_PACKS_ENABLED` must be flipped by OTA — safe to publish because `runtimeVersion` is `appVersion` `1.0.10`, so only vc17 on `internal` can receive it. 🔴 **Its step 4 is the point:** a consumable Play does not consume returns `ITEM_ALREADY_OWNED`, and the buyer gets *"you're already up to date"* and no embers. |
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
| 130 | **The hero card changes size with the sky.** A cosmetic choice relayouts the screen: the video shell is `height: HERO_HEIGHT` (336, fixed) and the default shell has no height at all, so it sizes to content — and IMP-125 pulled `<StreakFreeze>` out of the **shared** `heroInner`, shrinking the default card by ~73dp while the video card stayed put. Both shells go to 336 with the content centred; 336 is pinned to the sky encode recipe, so the default card is the one that moves. | OTA | ⬜ **specced 2026-09-14, BUILDABLE, not gated — this is the first ⬜ row.** Spec in [`docs/specs-open.md`](docs/specs-open.md#imp-130--the-hero-card-is-one-size-whichever-sky-is-on). ⚠️ **Walk owed** — [WALK-24](docs/walk-open.md#walk-24--one-card-two-grounds), device |
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

_2026-09-13 (Sonnet — **IMP-129 built: a paid ember pack is granted on the next launch, not lost.**) —
✅ code-complete, no walk of its own (WALK-20 step 7 owns the runtime proof, not run from this chat)._

**What finished.** `emberGrants.js` documented a self-healing launch sweep that nothing ever called —
`applyEmberGrants` had exactly one call site, inside `buyEmberPack`. [`entitlementSync.js`](src/billing/entitlementSync.js)'s
`checkEntitlement` now returns a third key, `customerInfo` (the service's answer on success, `null` on the
catch path; `nextPlusState` untouched). [`revenueCatService.js`](src/billing/revenueCatService.js) gained
`getCustomerInfoRaw()` — a second method, not a change to `getEntitlement`'s shape — mirrored in
[`simService.js`](src/billing/simService.js). [`RitualsApp.js`](src/RitualsApp.js)'s `applyEntitlementResult`
(shared by the `AppState` listener and the launch hook) now calls `applyEmberGrants(result.customerInfo)`
when present — no new store call, no toast, silent self-heal on both the cold-start and
background→foreground paths.

**The proof.** New [`emberGrantSweep.test.js`](__tests__/billing/emberGrantSweep.test.js) mounts the real
`RitualsApp` (it is renderable — see `FabLabel.test.js`) with `createPurchaseService` swapped for a fake,
rather than a source assertion: an un-applied `embers_240` transaction grants 240 and lands its id in
`appliedEmberTx` (confirmed **red** before the `RitualsApp.js` wiring existed); the same transaction already
in the ledger grants 0; an unreachable store grants nothing and — the control — does not move `plus`, and
never reaches `getCustomerInfoRaw` at all. `purchaseFlow.test.js`'s ad-hoc fake service needed
`getCustomerInfoRaw` added too — a real interface change surfaced a second caller (`PlusFlow.js`'s IMP-101
reconcile) that the spec hadn't named. **1238 passed, 117 suites** (was 1230/116, +8 tests, +1 suite).
Export clean. Commit `0a2f595`. Spec archived to `docs/build-log.md`; `docs/specs-open.md`'s queue now holds
only the owner-gated IMP-128.

**Not shipped this chat** — no `Release-Lane:` trailer.

**The exact next step** — ⬆️ **superseded by the 2026-09-14 note below** (the queue is no longer empty).
Still true from this one: IMP-124/125/126/127/129 await the owner's ship go-ahead, and
`EMBER_PACKS_ENABLED` stays `false` until WALK-20 passes on hardware.

---

_2026-09-14 (Opus — **IMP-130 specced: the hero card is one size, whichever sky is on. WALK-24 filed with
it.**) — 📝 spec session, no code written._

**What finished.** WALK-22's raw finding is a buildable spec. **The defect as a rule:** a sky is a cosmetic
choice, and **a cosmetic choice must not relayout the screen** — applying Meteor Shower makes the hero ~86dp
taller and pushes every card below it down. **The ruling: `HERO_HEIGHT` (336) stays and the *default* card
grows to meet it**, both shells sharing one `HERO_BOX` with `justifyContent: 'center'` so IMP-125's freed
space is distributed, not pooled under the XP bar.

**Why 336, not ~250 — do not re-litigate.** [`docs/design-queue.md`](docs/design-queue.md) → "The frame"
derives the near-square box table, the **"generate square"** 1:1 choice (83–86% crop survival), the
**1280×1280** encode recipe and the *"bottom ~28% (96 of 336dp)"* scrim rule **from 336**. Shrinking to
~250dp takes the Pixel-class box to aspect 1.48 and 1:1 survival to ~68% — a third of every sky frame
already encoded against it. **~250dp is IMP-125's residue, not a design decision.**

**Four traps are in the spec, all read out of source** — `SkyHero`'s `absoluteFillObject` (so "let the video
card size to content" is **not available**), ~250 being an **estimate** nothing may be hardcoded to, the
fixed box vs `MAX_FONT_SCALE` 1.5 (~270dp in 288dp — fits, but not by much), and `RayFan`/`NightRays` not
stretching, so `art.js` is **not touched**.

**The proof it asks for.** One `describe` in `HomeScreenSkyHero.test.js` (it already mocks
`activeSkyManifest` both ways): both grounds measure 336 via a new `testID="streak-hero"`, and the two are
equal — **the no-video case is red before the change.** Expect **1241 / 117** (+3, no new suite). 🔴 **Green
proves the number, not the picture** — whether the classic card's now-uncovered lower third reads as
composition or as a void is [WALK-24](docs/walk-open.md#walk-24--one-card-two-grounds) step 2.

**The exact next step.** A **build chat** takes **IMP-130** — first ⬜ row, not gated; IMP-128 stays
owner-gated. A **walk chat** has nothing new: WALK-24 is blocked on IMP-130's own OTA, and WALK-23 is still
held by the owner even though its stated reason (*"look at IMP-130 first"*) has lapsed — **the owner's call.**
