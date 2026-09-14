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

> ## 🧭 WHAT TO TAKE RIGHT NOW (2026-09-15)
>
> | If this chat is… | Take |
> | --- | --- |
> | a **build task** | ⬜ **The backlog is EMPTY of takeable rows.** [IMP-128](docs/specs-open.md#imp-128--apply-the-motion-vocabulary) is the only row left and it is **OWNER-GATED — do NOT take it** without the owner's explicit yes. ✅ **IMP-136 is DONE** (2026-09-15, `2c2ab5a`) — Sunrise, the hero's empty band: `HERO_ART_FOCAL = 96` decoupled from the numeral's `HERO_FOCAL`, `RayFan` gained a radial `<Mask>` fade and a `rayOpacity` prop, a new day-only `Bloom`, both ramped by a new pure `heroLight(streak)`. Art-only — the video shells and the numeral's position are untouched. **1271 passed, 119 suites** (was 1257/118), export clean, +14 tests, +2 suites. ⚠️ **Walk owed** — [WALK-26](docs/walk-open.md#walk-26--the-band-is-full-of-light), device, both modes, streak 0/1/210, at max font. ✅ **IMP-135 is DONE** (2026-09-14, `bbb2d20`) — tooling only, ships nothing, no OTA. Home's screen now renders straight from `src/screens/HomeScreen.js` with `react-native-web`: [`design-system/screens/home-day.html`](docs/design-queue.md) / `home-night.html` show both grounds (classic rays + video-sky poster) side by side, regenerated with `node scripts/gen-screens.js`, and cannot go stale — there is nothing to re-capture. The fixture mapping (`scripts/screenFixtures.js`'s `homePropsFromState`) is guarded by a test that parses `HomeScreen`'s own signature and fails if a prop is added or renamed. The other six screens are a follow-up row, not yet specced. ✅ **IMP-134 is DONE** (2026-09-14, `c9dc2dc`) — the design system's frozen card renders the rays at the app's real `focal 168` / diagonal-derived `reach`, not stale component defaults. **1257 passed, 118 suites** (was 1252/117), export clean. ✅ **The hero-regression run (IMP-124–133) is CLOSED, SHIPPED and PROVEN on hardware** — [WALK-24](docs/build-log.md#walk-24--one-card-two-grounds--closed-2026-09-14-device-owner-run) closed 2026-09-14, device, owner-run, all five steps PASS. Full detail per row in `docs/build-log.md`; the backlog table above has the one-line summary and commit for each. |
> | a **runtime walk** | ✅ **[WALK-24](docs/build-log.md#walk-24--one-card-two-grounds--closed-2026-09-14-device-owner-run) is CLOSED — PASS, 2026-09-14, hardware, owner-run, update `01a09cc2`.** All five steps passed: the card holds its size across sky switches, the numeral sits centred in the convergence with rays running to every edge, the meta row reads as one composition (over both the default sky and Meteor Shower footage), nothing clips at max font, and night mode matches day. **IMP-130, IMP-131, IMP-132 and IMP-133 are all proven on device — nothing residual.** Full detail archived in `build-log.md` → "Walk log". 📦 **NEW ROW — [WALK-25](docs/walk-open.md#walk-25--recapture-the-shot-set), re-capture the shot set** (emulator, 🤖 agent-runnable): `store/play/`'s seven **live Play listing** assets were shot 2026-08-16/17, and shot 01 pictures a hero that no longer exists while shot 05 pictures a grid [IMP-120](docs/build-log.md) **deleted**. ⚠️ **Its finished assets are sequenced behind [D-16](docs/design-queue.md); raw captures may be taken any time.** 📍 **Next per THE DEVICE SITTING PLAN below: Sitting 2 — [WALK-19](docs/walk-open.md#walk-19--money-actually-changes-hands) step 8**, the one real-money purchase, held for last; Sitting 3 (WALK-12, R8) still goes after it. ⏸ **WALK-23 stays HELD at the owner's instruction — do not take it without them lifting the hold**, even though its stated reason (WALK-22 → IMP-130) has since been resolved; lifting it is the owner's call, not a walk chat's. ✅ **WALK-22 is DONE — PASS, 2026-09-14** (device, Play `internal`, owner-run, update `01a09b18`): IMP-124's hero text and IMP-125's candle-row move both confirmed on hardware, night mode identical to day. 🔴 **Found [IMP-130](docs/specs-open.md#imp-130--not-yet-specced) live** — the video hero card is a visibly different size from the default hero card when switching skies; not fixed, routed to Opus to spec. ✅ **WALK-21 is DONE — 🟠 PARTIAL, 2026-09-13** (Play `internal` vc17, owner-run). Steps 1-3, 6-10 passed clean (corners settle IMP-121's `surfaceView` question, step 8 re-confirms WALK-19a's store-authoritative membership); steps 4-5 failed into IMP-124 above; step 11 is a named gap (thin journal, nothing to scroll). Full write-up in `walk-open.md`'s WALK-21 section. 📱 **Next:** resume **"THE DEVICE SITTING PLAN"** below — three sittings (IMP-116 lapse + IMP-114/115 · WALK-19 step 8 real money · WALK-12 last), each with the membership state it needs. ⚠️ **7C stays unwalkable** until the candle holding drains to ≤2 — do not record it as passed because nothing broke. ✅ **Step 7 is DONE — the 2026-09-10/11 lapse sitting cleared it** (hardware, owner-run, monthly tester sub). **WALK-18 ✅, WALK-07 ✅, WALK-19 steps 7A/7B/7D ✅** — IMP-108, IMP-109, IMP-110, IMP-111 and IMP-096 are all now proven on hardware. ⚠️ **7C is NOT proven** — the owner held 6 pre-cap candles, so the cap was never exercised; it re-runs once the holding drains to ≤2 ([IMP-115](docs/specs-open.md#imp-115)). Remaining 🚦: **step 8** (the one real-money purchase, held for last) and **WALK-12 (R8) LAST** — it must be walked on the exact build you ship. ✅ **WALK-08 is CLOSED (2026-09-11, emulator, agent-run)** — DeeperInsights passes at max font, IMP-095 proven, cap measured biting (scale 2, caps 1.5/1.2). It found IMP-118 on the way. 🔴 **But its IMP-117 pass was HALF WRONG and the device overturned it** — the `+` was off-centre at every font size, fixed as [IMP-119](docs/build-log.md#imp-119-the-ember-pills--lost-the-line-that-centred-it-2026-09-11) (commit `1fc0664`, walk still owed on device); the emoji half stands. **A glyph-centring claim is not emulator-provable — route that shape to `device`.** ✅ **SITTING 1 is DONE (2026-09-11, hardware, owner-run) — do not re-run it.** IMP-116 proven: on lapse both cosmetics revert under one message. **IMP-114 stays UNEXERCISED** — `buyCandles` checks the cap before affordability, so 6 candles against a cap of 3 returns at the first guard and its message cannot fire; same blocker as 7C. Step 5's control was dropped by inspection (ownership is consulted independently of `plus` in all three paths). Still owed, cheaply: the `6 kept` label and the no-ember-price check. ✅ **WALK-20 (IMP-113's ember purchase) NOW EXISTS** — written 2026-09-13, [`docs/walk-open.md`](docs/walk-open.md#walk-20--money-for-embers). ⬜ **Still not runnable**, and its own pre-flight says why: three consumables must be live in Play **and** RevenueCat, [IMP-129](docs/specs-open.md#imp-129--the-ember-grant-that-never-heals-itself) must have shipped, and `EMBER_PACKS_ENABLED` must be flipped by OTA — safe to publish because `runtimeVersion` is `appVersion` `1.0.10`, so only vc17 on `internal` can receive it. 🔴 **Its step 4 is the point:** a consumable Play does not consume returns `ITEM_ALREADY_OWNED`, and the buyer gets *"you're already up to date"* and no embers. |
> | a **design request** | 📍 **The front of the queue is new: Tier 0, added 2026-09-14, and both rows have packets written.** **[D-15 — the hero card's top third holds nothing](docs/design-requests/D-15-hero-top.md):** 127dp of the 336dp hero (38%) sits above the numeral holding no content at all — the card grew 104dp for the video crop and 88 of it went to the top. **Nothing is broken** (WALK-24 passed every step); it has simply never been composed. **[D-16 — the Play listing](docs/design-requests/D-16-the-listing.md):** the seven live store assets are from 2026-08-16/17 — shot 01 shows a hero that no longer exists, shot 05 a grid that was deleted from the app. Its capture half is [WALK-25](docs/walk-open.md#walk-25--recapture-the-shot-set); **the design half comes first.** 🗑️ **The 14 baselines are DELETED** (owner, 2026-09-14 — nothing stale in the design system), so **every request pastes source except Home**, which now has a generated card ([IMP-135](docs/build-log.md), `design-system/screens/home-day.html` / `home-night.html`) Claude Design can read and edit directly; the packets in [`docs/design-requests/`](docs/design-requests/) are generated from the real files so they cannot drift. ⚠️ **The standing rules were rewritten the same day** ([`playbook.md`](docs/playbook.md) → "Claude Design — standing rules"): five rules, they exist only to stop a design being unshippable or untrue, and rule 5 is **it has to sell the app, not only serve it.** 📋 **Also ready:** [D-02 Reflections](docs/design-requests/D-02-reflections.md). ✅ D-01 is built as IMP-120. |
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
`npm test` → **1271 passed, 119 suites** (verified 2026-09-15, after IMP-136) + **3 zone tests × 2 pinned zones**.
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
| 130 | **The hero card changes size with the sky.** A cosmetic choice relayouts the screen: the video shell is `height: HERO_HEIGHT` (336, fixed) and the default shell has no height at all, so it sizes to content — and IMP-125 pulled `<StreakFreeze>` out of the **shared** `heroInner`, shrinking the default card by ~73dp while the video card stayed put. Both shells go to 336 with the content centred; 336 is pinned to the sky encode recipe, so the default card is the one that moves. | OTA | ✅ **done, archived** in `docs/build-log.md` — `111c3de`. **1241 passed, 117 suites** (was 1238/117), export clean, +3 tests, no new suite. Both shells share `HERO_BOX` and a `testID="streak-hero"`. ✅ **Walked — [WALK-24](docs/build-log.md#walk-24--one-card-two-grounds--closed-2026-09-14-device-owner-run) PASS, 2026-09-14**, update `01a09cc2` |
| 131 | **The sunburst lost the numeral — regression from IMP-130, already on the owner's phone.** `RayFan`/`NightRays` are absolute at `top: -70`, `height: 300`, so their focal point is **fixed at card-y 80** and `art.js` says so; the numeral used to land on it by construction (`26 + 13 + 82/2`). IMP-130's `justifyContent: 'center'` moved the content ~46dp down and left the art behind — the rays and the night bloom converge **above** the numeral, and the meta row fell below the 300dp disc entirely. 336 and `art.js` are **not** reopened: the centring comes out and the freed space becomes one flex spacer that anchors the level/XP row to the bottom padding edge, where `SkyHero`'s bottom-28% scrim already is. | OTA | ✅ **done, archived** in `docs/build-log.md` — `28654cb`. **1245 passed, 117 suites** (was 1241/117), export clean, +4 tests, no new suite. ✅ **Shipped by OTA 2026-09-14** (`d82c61f`). ✅ **Walked — [WALK-24](docs/build-log.md#walk-24--one-card-two-grounds--closed-2026-09-14-device-owner-run) PASS, 2026-09-14**, update `01a09cc2` |
| 132 | **The sunburst was centred on a card that no longer exists.** IMP-131 proved the numeral sits **on** the focal point and never asked whether the focal was in the right *place*. `80` is the middle of the content-sized ~232dp card the hero was **before** IMP-130; pinned to 336, the same disc hangs 70dp off the top and leaves a **106dp bare band** under it. `art.js` takes `focal` as a prop (default 80, frozen for other callers); `HomeScreen.js` derives one `HERO_FOCAL = HERO_HEIGHT / 2` and computes both the art's focal and the numeral's `marginTop` from it, so they cannot drift apart again. | OTA | ✅ **done, archived** in `docs/build-log.md` — `bcaebb6`. **1249 passed, 117 suites** (was 1245/117, +4), export clean. ✅ **Shipped by OTA 2026-09-14** (`fc85377`). ✅ **Walked — [WALK-24](docs/build-log.md#walk-24--one-card-two-grounds--closed-2026-09-14-device-owner-run) PASS, 2026-09-14**, update `01a09cc2` |
| 133 | **The sunburst was showing where it ends.** Found by the owner on IMP-132's OTA — *"empty and ugly"* — and they guessed the fix. Centring the disc **made its own outer boundary visible for the first time**: at focal 80 it bled off the top edge, at 168 all four sides fall inside the frame and the ray-tips terminate in mid-air. `art.js` gains `reach` (default `size / 2`, frozen for other callers) — **ray length had to be separated from box size**, or the night bloom's fixed `viewBox` would have grown the candlelight pool from r80 to r139. `HomeScreen.js` derives the reach from the card's own diagonal. | OTA | ✅ **done, archived** in `docs/build-log.md` — `e258694`. **1249 passed, 117 suites** — unchanged, a test was **corrected** (IMP-132's containment case was what produced the bare rim, so it is inverted), not added. Export clean. ✅ **Shipped by OTA 2026-09-14** (`7d08eb5`). ✅ **Walked — [WALK-24](docs/build-log.md#walk-24--one-card-two-grounds--closed-2026-09-14-device-owner-run) PASS, 2026-09-14**, update `01a09cc2` |
| 134 | **The design system says the app draws something it stopped drawing.** `gen-design-system.js`'s `frozenPage()` renders `RayFan`/`NightRays` with `{ size }` only, so both PNGs come out at the component defaults — `focal 80`, `reach 150` — which the app stopped passing at IMP-132 (it now passes `focal 168` and a reach derived from the card's diagonal). The card's own copy says *"what you see is what renders"*. Same failure class as the Plus card in September. Also: give the hero frame one home so the generator and a guard test can read it without importing a screen. | tooling | ✅ **done, archived** in `docs/build-log.md` — `c9dc2dc`. **1252 passed, 117 suites** (was 1249/117), export clean, +3 tests, no new suite. Ships nothing — no OTA, the app bundle is byte-identical |
| 135 | **Claude Design has no picture of any screen and never had the code.** The 14 baselines are deleted, a design project holds HTML cards not `src/`, so screen-level truth only reaches it pasted inside a request. Render the screens from the shipped code with `react-native-web` (already a dependency) instead — generated cards cannot go stale, and Claude Design can edit the real screen. **Home only**; the other six are a follow-up. | tooling | ✅ **done, archived** in `docs/build-log.md` — `bbb2d20`. **1257 passed, 118 suites** (was 1252/117), export clean, +5 tests, +1 suite. `design-system/screens/home-day.html` / `home-night.html` show both grounds (classic rays + video-sky poster) side by side. Ships nothing — the app bundle is byte-identical |
| 136 | **The hero card's top third holds nothing — and it is the most-looked-at rectangle in the app.** Ports the locked D-15 design (`hero-band-v3.html`, direction A · "Sunrise"). The band reads empty not because it holds nothing but because the rays are *faintest* where there is most of them to see. Raise the **art's** focal to 96 (the numeral does not move), fade the ray tips, add a bloom behind the convergence, ramp both with the streak. **Art only — no content enters the card, and the video shells are untouched.** | OTA | ✅ **done, archived** in `docs/build-log.md` — `2c2ab5a`. **1271 passed, 119 suites** (was 1257/118), export clean, +14 tests, +2 suites. ⚠️ **Walk owed** — [WALK-26](docs/walk-open.md#walk-26--the-band-is-full-of-light), device |
| 128 | **Apply the motion vocabulary** — `riseIn` on Home's card stack and the Keepsakes rows, `popIn` on earned badges, `useCountUp` on the streak numeral. Six of eight `motion.js` exports still have no consumer, and IMP-077 paid for them with two **native** deps and the vc14 build. | OTA | ⏸ **OWNER-GATED — specced 2026-09-13 at the owner's request, gate deliberately left ON.** A build chat must not take it until the owner lifts it. Spec in [`docs/specs-open.md`](docs/specs-open.md#imp-128--apply-the-motion-vocabulary) |
| 022 | Save as PDF + About sheet (the two dead You-tab buttons) | Build | ⏸ **deferred (owner)** — spec in build-log → "Deferred specs"; **perk #6 gate** |
| 044 | R8 on release builds (dev client was shipping to the public) | Build | 🟢 **code-complete, UNWALKED.** R8 must be walked on the build you actually ship, so it rides **vc15 or later**; walk = WALK-12, on hardware, last in the sitting |
| 057 | Historical `dayKey` migration | Build | 🔒 **reserved, not missing** — cannot be written until real device numbers come back from the dev panel's "Data health" reporter. See below |
| — | **Plus is ON** (`PLUS_ENABLED = true`, commit `7d2e515`) | Build | ✅ **and vc15 can take money for real** — proven on a device. Cash ember packs were decoupled from the flag first (`6590834`), caught mid-build: flipping `PLUS_ENABLED` had armed the Shop's "Gather Embers" purchase path as a side effect |

---

## 🎨 Claude Design (IMP-078)

**Moved to [`docs/playbook.md`](docs/playbook.md) → "Claude Design" (2026-09-10, size rule).** Stable
reference — project id, card list, regeneration steps. **The queue itself is now
[`docs/design-queue.md`](docs/design-queue.md)**: **16 rows** as of 2026-09-14 — a new **Tier 0** (how the
app presents itself), then what degrades as the journal grows, the six disagreeing Plus surfaces, and
polish. ✅ **D-01 (Insights) is built as IMP-120.** ✅ **D-15 (the hero's empty top) is ANSWERED and LOCKED, 2026-09-15** —
the returned card is `screens/hero-band-v3.html`, direction **A · "Sunrise"**, mirrored to
[`design-system/proposals/hero-band-v3.html`](design-system/proposals/hero-band-v3.html) and specced as
**IMP-136**. 📋 **Two packets are still written and ready to send:**
[D-16 the Play listing](docs/design-requests/D-16-the-listing.md) and [D-02 Reflections](docs/design-requests/D-02-reflections.md).
🗑️ **No baselines exist any more** — all 14 were deleted 2026-09-14; packets paste generated source instead.

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
- ✅ **THE HERO'S EMPTY BAND — DECIDED 2026-09-15.** Owner locked **take three, direction A ("Sunrise")**
  of the returned D-15 design. Specced as [IMP-136](docs/specs-open.md#imp-136--sunrise-the-heros-empty-band-is-filled-with-light-not-content),
  walk filed as [WALK-26](docs/walk-open.md#walk-26--the-band-is-full-of-light). ⚠️ **One carried-over
  recommendation was DECLINED in the same breath** — a per-sky `tone: 'pale' | 'dark'` field driving a
  second ink set over video. Owner: *"I want consistency in the app… we will stick to the colour scheme of
  the app for light and dark mode."* **One treatment over footage** (`heroChrome`'s white ramp, IMP-124),
  theme tokens everywhere else. 🔴 **Do not re-open it and do not add `tone` to `SHOP_SKIES`.**
- ✅ **THE SKY PROVENANCE GATE — CLOSED 2026-09-15, in two passes.** (a) The tool question: Higgsfield/Veo
  paid tiers grant commercial use and output ownership, so **requirement #2 is closed and must not be
  re-asked**; stock sourcing declined. (b) The per-clip classification, owner: *"Fernlight, train hero and
  tideline hero cards video are derived from pinterest. Everything else is Veo or Higgsfield directly."*
  🔴 **BLOCKED FOREVER — never upload to R2, never put in `SHOP_SKIES`: `Fernlight`, `Local Line` ("train
  hero"), `Tideline`** (incl. `tideline-hero` and the `-v2` pair). They stay fine as private mockups.
  ✅ **CLEARED: `Aurora`, `Sakura Fuji`, `Event Horizon`, `Emberfield`, `Starfall`, `Meteorfall`** (CSS) —
  plus the already-live `meteor` → `ocean.mp4` (Pexels). **The loss is two heroes, not three** — `Local
  Line` was already dead on the loop rule. Full table + per-sky readiness in
  [`docs/skies-route.md`](docs/skies-route.md) → Stage 0 ruling 1.
  ▶️ **The next action is the owner's, and it is not a decision — it is a file export.** `Aurora` and
  `Sakura Fuji` are complete (footage **and** posters); `Event Horizon`, `Emberfield` and `Starfall` need
  one poster frame each. **The clips cannot travel through `DesignSync` (binary, 256 KiB cap), so the owner
  must export them to disk**; everything after that — crop offsets, encode, SSIM loop check, R2 upload — is
  scriptable (**[`scripts/encode-sky.py`](scripts/encode-sky.py)**, drop clips in `sky-src/`), and the
  app side is a **data-only edit** to `SHOP_SKIES` with no code at all.
  ⏸ **Meteorfall is PARKED — owner, 2026-09-15:** *"hold off on meteorfall. I do not like it and will
  replace it with something better so leave it."* **Do not port it and do not offer it as the cheap win.**
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

_2026-09-15 (Sonnet — **IMP-136 built: the hero's empty band is filled with light, not content.**) — ✅
code-complete, walk owed (WALK-26, device)._

**What finished.** [`src/home/heroFrame.js`](src/home/heroFrame.js) gains `HERO_ART_FOCAL = 96`, decoupled
from the numeral's `HERO_FOCAL`, and re-derives `heroReach` from the new focal; a new pure `heroLight(streak)`
ramps `rayOpacity` (0.18 → 0.5) and a `Bloom` `strength` (none → 1) across streaks 0–7+.
[`src/art.js`](src/art.js): `RayFan` gains `rayOpacity` (default `0.5`, every caller untouched) and a
`<Mask>` + `<RadialGradient>` radial fade inside its rotating `<Svg>`; new exported `Bloom`, **day only**
(`NightRays` already has its own amber pool — see IMP-019). `HomeScreen.js`'s classic shell wires both;
the numeral's `marginTop` and the video branch are untouched, exactly as scoped.

**The proof.** Trap 4 (`<Mask>` unproven in this tree) was retired alone, first, in
[`__tests__/art.test.js`](__tests__/art.test.js) before any screen was touched. The five tests the spec
named as coupled to the old shared-focal invariant were **corrected, not deleted** — they now read
`HERO_FOCAL`/`HERO_ART_FOCAL` off `heroFrame.js` and assert the numeral and the art no longer share a focal.
New [`__tests__/home/heroFrame.test.js`](__tests__/home/heroFrame.test.js) covers the ramp; new cases in
`HomeScreenSkyHero.test.js` cover `Bloom` absence/presence and that it never renders on night or video.
Regenerated `design-system/frozen/*.png` and `home-{day,night}.html` (`gen-design-system.js`'s SVG stub was
missing `Mask` — added). **1271 passed, 119 suites** (was 1257/118, +14, +2 suites), export clean. Committed
`2c2ab5a`.

**Not in this row.** The runtime look — a green suite proves the wiring, not the composition (three of
IMP-130→133 exist because a prior green suite hid exactly this). No `Release-Lane` trailer.

**The exact next step.** Owner's call: **[WALK-26](docs/walk-open.md#walk-26--the-band-is-full-of-light)**
(device, both modes, streak 0/1/210, at max font) proves this on a screen. In parallel, per the note below,
the owner exports the cleared sky clips into `sky-src/`, starting with Aurora and Sakura Fuji.

_2026-09-15 (Opus — **the hero design is locked and specced, the sky provenance gate is closed, and the
sky pipeline is a command.**) — ✅ specs + tooling; no app behaviour changed._

**What the owner decided, in their words.** Three rulings, all recorded where they will be read rather than
where they were said:

1. **The hero band.** Locked **take three, direction A ("Sunrise")** of the returned D-15 design. On the
   card's carried-over per-sky ink proposal: *"I want consistency in the app, I don't care how a design
   system 'felt', we will stick to the colour scheme of the app for light and dark mode."* → **declined**,
   no `tone` field, one treatment over footage (`heroChrome`'s white ramp, IMP-124).
2. **Sky provenance.** *"Fernlight, train hero and tideline hero cards video are derived from pinterest.
   Everything else is Veo or Higgsfield directly."* Stock sourcing declined. **The gate is CLOSED.**
3. **Meteorfall.** *"Hold off on meteorfall. I do not like it and will replace it with something better."*

**What finished.** **[IMP-136](docs/specs-open.md#imp-136--sunrise-the-heros-empty-band-is-filled-with-light-not-content)**
is specced (art-only: `HERO_ART_FOCAL = 96` decoupled from the numeral's `HERO_FOCAL`, a radial fade on the
fan, a day-only bloom, both ramped by streak) with **[WALK-26](docs/walk-open.md#walk-26--the-band-is-full-of-light)**
filed behind it. The locked card is mirrored to
[`design-system/proposals/hero-band-v3.html`](design-system/proposals/hero-band-v3.html) — it was
project-only, and the spec cites it. **[`scripts/encode-sky.py`](scripts/encode-sky.py)** now runs the whole
clip pipeline in one command, with `sky-src/` (drop zone) and `sky-build/` gitignored.

**The proof, and it is the part worth keeping.** The pipeline was **validated against the one clip whose
answer was already on record** — the committed IMP-121 fixture. It independently re-found both defects the
build log documents (the black opening frame; the wrap that does not hold) and passed on the shipped window
(frames 226–345). That exercise found **three real defects, two of them in instructions this repo has been
following**:

- 🔴 **The recipe's SSIM checks said `-v error`, which suppresses the SSIM line itself.** The loop check has
  been printing nothing and reading as a pass. Corrected in `design-queue.md`.
- 🔴 **The recipe judged a black poster frame by file size.** The fixture's frame 0 is **luma 16 against
  ~115** mid-clip and still compressed to **9.6 KB** — past any size threshold. Now measured by luma
  against a mid-clip frame, which is exact and does not false-positive on a night sky.
- 🔴 **I gated the loop at 0.95× the floor and it rejected the clip that is currently live.** The shipped
  window scores **0.87×** at full-resolution SSIM; the build log's "1.08×" for the same frames is
  `find-loop.py`'s coarse 32×32 MAD and is not comparable. The verdict is **banded** now, with the middle
  band explicitly undecided. This is the exact trap `design-queue.md` warns about and it still caught me.

**Two owner questions answered from source, not from the pictures.** **Sakura Fuji:** there is no
downloader — `expo-video` streams from R2 on first play and caches LRU under the 128 MB ceiling at
[`RitualsApp.js:576`](src/RitualsApp.js#L576), so a second clip is ~2.5–3.5 MB, lazy, and only for owners
who switch mode. Recommended **day clip only** as a one-clip sky, noting this cuts against the loop-rule
table (written before either clip existed) and is a reversible data edit. **Event Horizon:** its card states
the crop outright (69% across, 43% down, 1.35×), so `encode-sky.py` gained `--focus-x/--focus-y/--zoom` and
the framing is now free. **But the card's picture hid two blockers:** the source is **736×414**, cut to
**307** by the zoom — a 4.17× upscale against a 1080 floor — and **the clip does not loop**; the card's fix
is two cross-dissolved copies, which `skyHero.js` (one `VideoView`, `p.loop = true`) cannot do.

**Not in this row.** No app behaviour changed — the only `src/` edit is a corrected comment in `data.js`.
No `Release-Lane:` trailer. IMP-136 is **not built**; a build chat takes it. **1257 passed, 118 suites**
throughout.

**The exact next step.** A build chat takes **IMP-136**. In parallel the owner exports the cleared clips
(`Aurora`, `Sakura Fuji`, `Emberfield`, `Starfall`, and `Event Horizon` only if its master beats 414) into
`sky-src/` — **no chat can do this**, the clips are binary and `DesignSync get_file` caps at 256 KiB. Start
with **Aurora and Sakura Fuji**: both already have posters and neither has a known blocker.

