# Daily Rituals — Build Progress

> **Single source of truth across chats.** Read this top-to-bottom before doing anything. When you finish a phase, update the status table, tick the boxes, and fill "Last session note". Keep it honest — if a step was skipped or is blocked, say so here.

- **Plan:** [`docs/superpowers/plans/2026-06-03-daily-rituals-expo-billing.md`](docs/superpowers/plans/2026-06-03-daily-rituals-expo-billing.md) — the detailed, step-by-step build (full code in each task).
- **Design spec:** [`design_handoff_plus_compliance/README.md`](design_handoff_plus_compliance/README.md) — screens, copy, tokens, states. (Folder is git-ignored; never edit it, copy out of it.)
- **Working reference code:** `design_handoff_plus_compliance/RitualsNative_reference/` — the complete Expo app this build lifts in.

---

## Locked decisions (2026-06-03)

| Decision | Choice |
| --- | --- |
| Billing SDK | **RevenueCat** (`react-native-purchases` v8 + Expo config plugin) |
| Language | **JavaScript** — lift reference verbatim, no TS conversion |
| Scope | **Lift app + wire billing only.** All non-billing state (entries, embers, streak, settings) stays in-memory as in the reference |
| Build target | **Dev only for now.** Android dev client locally; EAS submission + iOS build = Future |
| Expo Go behavior | App must keep running in Expo Go via **sim fallback** when no SDK key / native module (so every screen stays reviewable) |

---

## Status at a glance

| Phase | Title | Status |
| --- | --- | --- |
| 0 | Bootstrap: lift reference app to root, prove it boots | ✅ Done |
| 1 | Central config + real external links (no SDK yet) | ✅ Done |
| 2 | Pure billing logic (TDD) + Jest harness | ✅ Done |
| 3 | Sim service + refactor `usePurchaseFlow` onto the seam | ✅ Done |
| 4 | RevenueCat service + provider selection | ✅ Done |
| 5 | Live entitlement → renewal/plan/price; cancel reflects willRenew | ✅ Done |
| 6 | Dev client build + real-billing verification (Android) | ✅ Done |
| 7 | Final verification + docs | ✅ Done |
| — | **Part I complete (lift + RevenueCat billing, dev-only, in-memory).** Part II below extends past the original locked scope. | — |
| 8 | Runtime verification closeout (close deferred sim-state boxes) | ⬜ Not started |
| 9 | Local persistence (state survives restart, AsyncStorage) | ✅ Done |
| 10a | **Free public release** — Plus hidden behind a flag, ship free to Play | 🟡 In review (closed testing 12×14 gate) |
| 10b | **Enable monetization** — BillDesk + products + flip `PLUS_ENABLED` → v1.1 | ⬜ Not started |
| 11 | iOS parity (App Store Connect + TestFlight) | ⛔ Blocked (needs Mac/EAS + Apple Dev) |

Legend: ⬜ Not started · 🟡 In progress · ✅ Done · ⛔ Blocked

> ## ▶️ ACTIVE TRACK (read this before picking a task)
> While the app sits in closed testing, the **live work is the [Improvements / bug-fix backlog](#-improvements--bug-fix-backlog-post-launch--active-track)** near the bottom of this file — **not** the phase ladder. **If any `IMP-xxx` task there is unchecked, work the first unchecked one BEFORE Phases 8 / 10b / 11**, which are parked until the owner explicitly resumes them. Each `IMP` task carries its full spec inline (no separate plan file unless it links one), so do **not** go hunting in the phase plan for it.

> **Part II was added 2026-06-04 and restructured around a FREE-FIRST release.** ⭐ **The big idea:** ship the app to Play as a **free** app first (Plus hidden behind a `PLUS_ENABLED` flag), then turn on paid Plus in a follow-up update (v1.1). Three independent finish lines: **A** free app live (10a) → **B** monetization live (10b) → **C** iOS (11). A free launch needs **no payments and no BillDesk** — but it **does** need a hosted privacy-policy page (built in 10a) + Play store listing. BillDesk (India PA-CB payout verification, up-to-90-day clock) gates **10b only**. Full detail + rationale in the plan's "**PART II → Release strategy**" box. Recommended order: **8 → 9 → 10a → 10b → 11**. Part II reverses two original locked decisions — "dev only" and "all state in-memory" — on purpose; each phase lists owner decisions to confirm first.

---

## Phase checklists

_(Phases 0–7 complete — detailed checklists archived in [docs/build-log.md](docs/build-log.md); status is in the table above.)_

## Phase checklists — Part II (Phases 8–11, added 2026-06-04)

> Decisions to confirm per phase live in the plan's **PART II** section. Do not start a phase until its decisions are answered.

### Phase 8 — Runtime verification closeout (no new code)
- [ ] 8.1 Walk all 5 purchase outcomes in Expo Go (success/cancel/failed/network/owned), revert `theme.js`
- [ ] 8.2 Walk both restore outcomes (found/empty); confirm sim fallback never crashes
- [ ] 8.3 Tick the deferred Phase 3 + Phase 4 boxes above with evidence; commit PROGRESS.md

_(Phase 9 complete — detailed checklist in [docs/build-log.md](docs/build-log.md).)_

### Phase 10a — Free public release (Plus hidden, no payments)
- [x] 10a.1 Gate the Plus surface behind `PLUS_ENABLED = false` (hide paywall/manage/upsell + skip onboarding premium) — CODE
- [x] 10a.2 Build + host the minimal legal website (privacy + terms + support); set `PRIVACY_URL`/`TERMS_URL` in `.env`
- [x] 10a.3 Expo/EAS account + `eas.json` (dev/preview/production profiles)
- [x] 10a.4 Production `app.config.js` (version, versionCode autoincrement, icon/splash, runtimeVersion)
- [x] 10a.5 `eas build -p android` ✅ (signed `.aab` built + uploaded; Play listing + data safety + content rating done; release **sent for review** 2026-06-06)
- [ ] 10a.6 **Closed testing gate** — Play requires **12 testers opted-in for 14 continuous days** (individual accounts post-2023-11-13) before "Apply for production" unlocks. ⏳ Recruiting testers 2026-06-06; 14-day clock starts once 12 are opted in. Then apply for production → publish **FREE**.
- _No payments, no BillDesk, no RevenueCat production key needed for 10a._

### Phase 10b — Enable monetization (turn Plus on → v1.1)
- [ ] 10b.1 BillDesk PA-CB seller verification (India payouts; up-to-90-day window — start early, finish before 10b)
- [ ] 10b.2 Live Play subscription products (annual + monthly) + swap `test_…` → production RevenueCat key
- [ ] 10b.3 Attach products to RevenueCat `plus` / `current`; confirm offerings return live prices
- [ ] 10b.4 Flip `PLUS_ENABLED = true`; `eas build`; internal-track verify real purchase (all states); promote → v1.1

### Phase 11 — iOS parity — ⛔ blocked (needs Mac or EAS macOS + Apple Developer Program)
- [ ] 11.1 Apple Developer + App Store Connect app record + bundle id
- [ ] 11.2 StoreKit subscription group (annual + monthly)
- [ ] 11.3 RevenueCat iOS key (`RC_IOS_KEY`); attach iOS products to `plus` / `current`
- [ ] 11.4 iOS config in `app.config.js` (bundleIdentifier, buildNumber, infoPlist)
- [ ] 11.5 `eas build -p ios` (or Mac); StoreKit-sandbox walk of all states
- [ ] 11.6 TestFlight + App Privacy + submit for review

---

## 🔧 Improvements / bug-fix backlog (post-launch — ACTIVE TRACK)

> **This is the live track while the app is in closed testing.** Opus scopes each issue the owner files into a numbered `IMP-xxx` task below — steps, commit message, and ship lane all inline. Sonnet picks the **first unchecked `IMP` task**, executes its steps in order, commits with the given message, then ticks the boxes and writes the Last session note. Same golden loop as the phases — but the spec lives **here**, not in the phase plan. The phase ladder (8 / 10b / 11) stays parked until the owner says otherwise.

### Ship lane — which fix ships how (decide per task)
| What changed | Lane | Command | Play review? |
| --- | --- | --- | --- |
| JS / UI / copy / logic / JS assets only | **OTA** | `eas update --branch production --message "…"` | ❌ none (minutes) |
| Native dep, permission, SDK/target, icon/splash, `app.config` native field, version bump | **Full build** | bump `android.versionCode` → `eas build -p android` → upload `.aab` | ✅ required |

- OTA only reaches builds **≥ versionCode 5**. The v4 build in review can't receive it — so the **first full build we push for improvements (versionCode 5) is what turns the OTA lane on** for everything after.
- Tag every task below with its lane so we batch OTA-able fixes and only rebuild when something native actually changes.

### Backlog at a glance
| ID | Title | Lane | Status |
| --- | --- | --- | --- |
| IMP-001 | Show the user's chosen name on the You tab (kill hardcoded "Amara") | OTA | ✅ |
| IMP-002 | Greeting + date from device local time (drop ", you"; kill hardcoded date) | OTA | ✅ |
| IMP-003 | Center the streak number in the hero card (both axes, robust 1–4 digits) | OTA | ✅ |
| IMP-004 | New-user zero-state + v1→v2 migration (existing testers auto-cleaned on update, no reset); dynamic streak subtitle | OTA (ships in v5) | ✅ |
| IMP-005 | Remove the cosmetic login/signup step from onboarding (app stays local-only, no accounts) | OTA | ✅ |
| IMP-006 | Enable + verify Android Auto Backup (new-device restore, no login) | Build (rides v5) | 🟡 |
| IMP-007 | 🔴 Streak no longer stacks on multiple same-day entries (reward once/day; same-day re-write edits) | OTA | ✅ |
| IMP-008 | Real zero-state finish: derive level from XP (kill hardcoded Lv 3), calendar + week strip from real entries (kill fake HEAT/WEEK), real entry dates (kill 31 May) | OTA | ✅ (code; runtime walk + ship pending) |
| IMP-009 | Insights tab from real entries (kill hardcoded STATS/MOOD_MIX/RHYTHM); empty state | OTA | ✅ (code; runtime walk + ship pending) |
| IMP-010 | Onboarding shows only on first ever launch (persist `onboarded`; returning testers skip it, no re-onboard on update) | OTA | ✅ (code; runtime walk + ship pending) |
| IMP-011 | Kill the last hardcoded "31 May" — WriteFlow epitaph uses the device's real date (`todayLabel()`); delete dead `TODAY_LABEL` | OTA | ✅ (code; runtime walk + ship pending) |
| IMP-012 | Achievements + Home "Keepsakes" start fresh — derive every `cur`/`earned` from real entries+streak (kill hardcoded `ACHIEVEMENTS.cur` & `BADGES.earned`); empty for new users | OTA | ✅ (code; runtime walk + ship pending) |
| IMP-013 | 🔴 "Tend an old grave" rite starts marked-done for new users / after reset — zero it AND give it a real completion trigger (revisit a past entry) so the daily keepsake stays earnable | OTA | ✅ (code; runtime walk + ship pending) |

### Tasks
_(Opus appends one block per issue, in priority order, using the template below. Sonnet works the first unchecked one.)_

_(IMP-001 – IMP-005 complete — full task detail archived in [docs/build-log.md](docs/build-log.md); one-line status in the backlog table above.)_

### IMP-006 — Enable + verify Android Auto Backup (new-device restore, no login)   ·   Lane: Build (rides v5)   ·   Status: 🟡 (code done; device verification + data-safety pending owner)
- **Goal:** A user's local data (journal, streak, settings — the AsyncStorage store) restores automatically onto a **new or reinstalled device** via Android Auto Backup to their own Google Drive — no accounts, no login, no PII handled by us. Covers "got a new phone, my stuff came back."
- **Why / context:** Chosen (2026-06-07) as the zero-login, zero-legal alternative to cloud accounts (which the owner rejected — see [[daily-rituals-local-only-decision]] / IMP-005). **Expo defaults `android.allowBackup` to `true` and `app.config.js` doesn't override it**, so the capability is *very likely already active* on the current build — the app's data dir (incl. AsyncStorage's RKStorage SQLite DB) is eligible. So this task is mostly: lock the intent explicitly, then **actually verify** the backup→reinstall→restore cycle, plus a data-safety note.
- **Files touched:** `app.config.js` (one line), `PROGRESS.md`.
- **Approach (decided by Opus — do not re-litigate):**
  - Add `allowBackup: true` explicitly to the `android` block in `app.config.js` so the intent is documented and can't silently regress if Expo's default ever changes. (Functionally identical to today's default — the value is the explicitness + the verification below.)
  - **No custom backup rules.** There's nothing sensitive on-device to exclude (no auth tokens — the RevenueCat key ships in the binary/env, not in user data), so the default full-data backup is correct. *(Flag: if a future feature ever stores a secret/token on-device, add `dataExtractionRules`/`fullBackupContent` via a config plugin to exclude it — not needed now.)*
  - **Restore robustness:** a restored backup from an older app version is handled by the persistence `migrate()` chain (schema `version`), so no special handling needed.
- **TDD:** N/A — native/manifest config + manual device verification. `npm test` unaffected (green, unchanged count).
- **Steps:**
  - [x] 1. Add `allowBackup: true` to the `android` block in `app.config.js`. Commit.
  - [ ] 2. **Device verification (owner or Sonnet-with-device; needs an emulator/device signed into a Google account with backup ON):** in the app, create data (write an entry, let streak/XP move) → force a backup `adb shell bmgr backupnow app.dailyrituals.mobile` (confirm backup manager is on: `adb shell bmgr enabled`) → `adb uninstall app.dailyrituals.mobile` → reinstall the same build → launch → **confirm the journal/streak/settings came back** with no login.
  - [ ] 3. **Play data-safety:** confirm the form reflects reality — Auto Backup data goes to the *user's own* Google Drive, not collected/transferred to the developer (typically no "data collected" change; just confirm the backup question is answered honestly).
  - [x] 4. `npm test` green (unchanged — no JS logic touched).
- **Commit:** `build(android): enable Android Auto Backup explicitly (new-device restore, no login)`
- **Acceptance (runtime walk):** After forcing a backup, uninstalling, and reinstalling on a backup-enabled device/account, the journal + streak + settings restore automatically with no sign-in. (If the device has backup disabled or no Google account, restore won't happen — that's expected OS behavior, not a bug.)
- **Ship after merge:** Rides the **v5 full build** (it's a manifest/native change — not OTA-eligible — but v5 is already a full build, so no extra build needed). Ensure the v5 `versionCode` bump covers it. Known limits to set expectations: ~daily backup cadence (Wi-Fi/charging/idle, so the most recent entries may not be captured before a loss); restore only on reinstall/new-device setup; Android-only (iOS gets its own iCloud mechanism in Phase 11); not live multi-device sync.

_(IMP-007 – IMP-008 complete — full task detail in [docs/build-log.md](docs/build-log.md).)_

_(IMP-009 – IMP-012 complete — full task detail archived in [docs/build-log.md](docs/build-log.md); one-line status in the backlog table above.)_

### IMP-013 — "Tend an old grave" rite must start at 0 (new user / after reset) + get a real completion trigger   ·   Lane: OTA   ·   Status: ✅ (code; runtime walk + ship pending)
- **Goal:** For a brand-new user, and after "Reset app data", **all three** of Today's rites read 0/1 — including "Tend an old grave". Nothing is pre-marked done. AND the revisit rite becomes genuinely completable (by revisiting a past entry) so the "all rites kept → daily keepsake" reward stays earnable.
- **Why / context:** Owner-filed bug (2026-06-13): on a fresh install / after data reset, the **"Tend an old grave"** rite in **Today's rites** (Home tab) is already shown completed. Root cause is a hardcode: [`src/data.js:61`](src/data.js#L61) seeds the `revisit` quest with `cur: 1` (the comment literally says *"revisit starts done"*). Since `quests` defaults to `DAILY_QUESTS` for new users ([`src/RitualsApp.js:61`](src/RitualsApp.js#L61)) and reset-all-data clears persisted state → falls back to the same `DAILY_QUESTS`, a user who has tended *nothing* sees the rite as kept. Owner's rule: **when data is reset or for a new user, everything must be 0.**
- **⚠️ Trap — do NOT just set `cur: 0` and stop.** `revisit` has **no completion trigger anywhere**: [`src/home/completeEntry.js:32-36`](src/home/completeEntry.js#L32-L36) only advances `write` and `feel`. It was hardcoded done purely to make the rites card look complete. So zeroing it alone makes the rite **permanently uncompletable**, and since "All rites kept" needs all three ([`src/gamify.js:66-67`](src/gamify.js#L66-L67)), that **regresses the daily keepsake to unearnable**. The fix must zero it *and* wire a real trigger.
- **Files likely touched:** `src/data.js` (the hardcode + comment), a new pure helper `src/home/markRevisited.js`, `src/RitualsApp.js` (wire the trigger at the `setReading(e)` call site), `__tests__/home/markRevisited.test.js` (new), and a tiny zero-state guard test for `DAILY_QUESTS`.
- **Approach (decided by Opus — do not re-litigate):**
  1. **Zero the seed.** In [`src/data.js`](src/data.js#L57-L61), change the `revisit` quest `cur: 1 → cur: 0` and fix the now-wrong comment (*"revisit starts done"* → "all rites start undone; revisit is kept by revisiting a past entry"). This alone fixes the reported new-user / reset symptom, because daily-reset ([`src/RitualsApp.js:197`](src/RitualsApp.js#L197)) and reset-all-data both land everything on `cur: 0`.
  2. **Give `revisit` a real trigger (a pure, tested helper).** "Tend an old grave" = open/read a **past** entry from Reflections. Add `src/home/markRevisited.js`:
     - `markRevisited(quests, entry, today)` → returns a **new** quests array (immutable spread; never mutate). It sets the `revisit` quest's `cur` to its `goal` **only when** `entry.dayKey !== today` (a genuinely older entry) **and** it isn't already at goal. Today's-own entry, missing `dayKey`, or already-kept → return `quests` unchanged. Leave `write`/`feel` untouched.
  3. **Wire it.** In [`src/RitualsApp.js`](src/RitualsApp.js), grep for every `setReading(` call site (currently the `onOpen={(e) => setReading(e)}` passed to `ArchiveScreen`, line ~240). At that site also do `setQuests((qs) => markRevisited(qs, e, todayKey()))`. `todayKey` is already imported and used in this file.
- **Expected (correct, not a bug):** A day-1 user with no past entries can't complete "Tend an old grave" yet (there's no old grave to tend) — thematically correct. It becomes kept the moment they open any entry from a prior day; daily reset re-arms it each day. The daily keepsake now legitimately requires write + feel + revisit.
- **TDD (write tests FIRST — RED → GREEN):**
  - `__tests__/home/markRevisited.test.js`: (a) opening a past entry (`dayKey` ≠ today) sets `revisit.cur === goal`; (b) opening today's entry (`dayKey` === today) leaves quests **unchanged**; (c) entry with no `dayKey` → unchanged; (d) idempotent — already-kept revisit stays kept, same reference contents; (e) `write`/`feel` never altered; (f) immutability — returns a new array, input not mutated.
  - Zero-state guard (add to an existing data test or a small new one): every quest in `DAILY_QUESTS` starts `cur: 0`. This locks the invariant so the hardcode can't silently come back.
  - **Don't churn `__tests__/home/completeEntry.test.js`** — its `baseQuests` fixture (with `revisit cur:1`) is a hypothetical `prev` state, not the seed; those tests stay green untouched.
  - **Steps:**
  - [x] 1. Write the failing tests above (RED): `__tests__/home/markRevisited.test.js` + the `DAILY_QUESTS` all-zero guard.
  - [x] 2. `src/data.js`: `revisit.cur 1 → 0`; correct the comment.
  - [x] 3. Implement `src/home/markRevisited.js` (pure, immutable) → tests GREEN.
  - [x] 4. Wire `setQuests((qs) => markRevisited(qs, e, todayKey()))` into the `setReading(e)` call site(s) in `src/RitualsApp.js`.
  - [x] 5. `npm test` green (123 passed, 17 suites — 7 new tests added).
- **Commit:** `fix(rites): zero "tend an old grave" for new/reset users; complete it by revisiting a past entry`
- **Acceptance (runtime walk — owner, no device in agent session):** Fresh install (or You → Reset app data) → Today tab → **all three rites read 0/1**, none pre-kept, "0 of 3 kept". Write today's entry + name a mood → write/feel kept, revisit still 0. Open a *previous day's* entry from Reflections → revisit flips to kept; with all three kept the daily keepsake is offered. Next calendar day → all rites reset to 0.
- **Ship after merge:** OTA — all changes are JS under `src/`. Tag the final commit `Release-Lane: ota` and push `main` when the owner is ready (reaches testers on v5+).

<!-- TEMPLATE — Opus copies this per issue, fills it, adds a row to the table above, then hands the task to Sonnet:

### IMP-00X — <short title>   ·   Lane: OTA | full-build   ·   Status: ⬜
- **Goal:** <what "done" looks like, 1–2 lines>
- **Why / context:** <the symptom, request, or screenshot the owner gave>
- **Files likely touched:** `src/...`
- **Approach (decided by Opus — do not re-litigate):** <the chosen method>
- **TDD:** <which logic gets a failing test first — or "N/A, pure cosmetic">
- **Steps:**
  - [ ] 1. …
  - [ ] 2. …
  - [ ] 3. `npm test` green (must stay ≥ 23)
- **Commit:** `<type>: <message>`
- **Acceptance:** <how to confirm it works at runtime>
- **Ship after merge:** OTA `eas update --branch production` | hold for next full build
-->

---

## Config you must supply (no secrets in git)

Fill these in `.env` (copy from `.env.example`, created in Phase 4) and record the IDs here as they're created:

| Item | Where | Value |
| --- | --- | --- |
| RevenueCat entitlement id | RevenueCat dashboard | `plus` (must match `ENTITLEMENT_ID`) |
| RevenueCat offering | dashboard | `current` (annual + monthly packages) |
| `RC_ANDROID_KEY` | RevenueCat → API keys | ✅ **Production `goog_…` key now set in `.env`** (2026-06-06; publishable, not committed). Was sandbox `test_…`. |
| `RC_IOS_KEY` | RevenueCat → API keys | _TBD (Phase 11 / iOS)_ |
| Play product ids | Play Console | _TBD (Phase **10b** — live subscription products; not needed for the free 10a launch)_ |
| `TERMS_URL` / `PRIVACY_URL` | the minimal website (Task **10a.2**, free-hosted) | `https://destructaphoenix.github.io/dailyrituals-website.github.io/terms.html` / `…/privacy.html` — ✅ live (GitHub Pages) |
| BillDesk PA-CB verification | email from `onboarding@billdesk.com` | _TBD (Phase **10b** — India payout verification; up-to-90-day window once started)_ |

---

## Architecture quick-map (where things live after the build)

- **UI / screens** — `src/screens/*` and `src/RitualsApp.js`: lifted verbatim; only purchase *outcomes* change.
- **The billing seam** — `src/billing/`:
  - `config.js` (ids, keys, links) · `format.js` + `mapError.js` (pure, tested) · `simService.js` (Expo Go) · `revenueCatService.js` (real) · `index.js` (picks one) · `links.js` (deep-links).
- **The state machine** — `usePurchaseFlow` in `src/screens/PlusFlow.js`: pending→result overlay, now `await`s the injected service. `RESULT_META` / `PurchaseOverlay` are unchanged (kinds map 1:1 to service results).
- **Service contract** — `buy(plan)` / `restore()` / `getEntitlement()` / `getPrices()`; result `kind` ∈ `success|cancel|failed|network|owned|restored|restore-empty`. Full typedef at the top of the plan.

---

## How to resume in a fresh chat (no context)

1. Read this file in full. (Open the phase plan only for phase-ladder work — see step 3.)
2. **Check the [ACTIVE TRACK callout](#️-active-track-read-this-before-picking-a-task) at the top.** If the **Improvements backlog** has an unchecked `IMP-xxx` task, that is your work — its full spec is inline in that task block (skip steps 3's "open the plan", improvements aren't in the phase plan). Only if the backlog is empty/all-done do you fall through to the phase ladder.
3. Otherwise (phase-ladder work): find the first ⬜/🟡 phase in the status table, open the plan, go to that phase, execute its steps **in order**, committing as written.
4. After the task/phase: tick its boxes here, set the status emoji, write a "Last session note" — then **archive** finished specs + the 3rd-oldest note to `docs/build-log.md` (keep PROGRESS.md lean; see DEVGUIDE Step 4).
5. If blocked, set ⛔ and write exactly what's needed to unblock under "Open items / blockers".

---

## Open items / blockers

- iOS real-billing verification needs a Mac or EAS account (out of current scope) — Phase 6 iOS row stays ⛔ until then. Phase 11 (iOS parity) is blocked on the same plus an Apple Developer Program enrollment.
- RevenueCat keys + Play products must be created by the project owner before Phase 6 real-billing checks (Phase 0–5 run fully on the sim without them).
- **Before Phase 9:** persistence engine ✅ **confirmed: AsyncStorage** (2026-06-04). Still open: whether to add a "Reset app data" control (Task 9.6, optional).
- **Before Phase 10a (free launch):** package id ✅ **confirmed: keep `app.dailyrituals.mobile`**. Still open: Expo/EAS account, Google Play Developer account ($25), and a **hosted privacy-policy + terms page** (built in Task 10a.2 — free host fine, custom domain optional). **No payments/BillDesk/production RevenueCat key needed here.**
- **Before Phase 10b (monetization):** **BillDesk PA-CB seller verification** (India — already *initiated* 2026-06-04 via Google Play; finish within the 90-day window), live Play subscription products. (RevenueCat production key already swapped 2026-06-06.) See the **Phase 10b enablement checklist** in the 2026-06-05 session note for the full step list (Google service account JSON → RevenueCat, products → entitlement/offering, flip `PLUS_ENABLED`).
- **⏳ CURRENT BLOCKER (Phase 10a.6):** Free release is in Play review, but production publish is gated by the **closed-testing 12×14 requirement**. Owner is recruiting 12 testers (2026-06-06). Nothing to code here — purely a Play Console / community process. Production unlocks ≈ 14 days after 12 testers are continuously opted in (target ~late June 2026). When back, owner may bring **bug fixes / improvements** rather than continuing the phase ladder.

---

## 🔑 Android release signing — DO NOT BREAK (critical, repo-invisible)

Production `.aab` **must** be signed with the local **`dailyrituals-release.keystore`** (git-ignored, in project root):

| Field | Value |
| --- | --- |
| Keystore file | `dailyrituals-release.keystore` (project root, git-ignored — also backed up off-repo by owner) |
| Alias | `daily-rituals` |
| Password location | `android/keystore.properties` + `credentials.json` (both git-ignored — never commit) |
| **Upload cert SHA1** | `21:88:52:36:B7:CB:5C:9F:09:86:CD:09:F9:D7:60:A9:EE:51:40:BB` |
| Upload cert SHA256 | `F4:3B:1D:1B:B5:DB:C8:4E:D4:BA:45:6B:A4:1A:F2:64:70:78:BE:D6:AA:BF:3E:2E:99:B1:B6:FA:3D:D5:ED:0D` |
| Where EAS stores it | Server-side as Build Credentials **`M7r91j0b83`** (default, production) — confirmed matches the SHA1 above |

- This SHA1 is the cert **Play App Signing registered as the upload key**. Any build signed with a *different* key (e.g. an EAS auto-generated keystore) is **rejected** ("signed with the wrong key"). **Never let EAS auto-generate a new keystore for this app.**
- Losing the keystore = forced Play **upload-key reset**. Keep it + its password backed up off-repo.
- SDK versions are pinned via **`expo-build-properties`** in `app.config.js` (the `android.minSdkVersion`/etc. config keys are no-ops in Expo): `minSdkVersion 24` (RevenueCat), `compileSdkVersion`/`targetSdkVersion 35` (Play API-35 requirement). Bump `android.versionCode` on every Play upload (currently **4**).

## Last session note

_History archived in [docs/build-log.md](docs/build-log.md) → "Session notes". Only the two newest notes stay here; every chat moves the older one out when it appends a new one (see DEVGUIDE Step 4)._

_2026-06-13 (Opus, planning) — Owner filed a new bug → scoped as **IMP-013** in the Improvements backlog. **No app code written this session — Opus only authored the task spec** (PROGRESS.md edits + this note). **Bug:** for a new user, and after "Reset app data", the **"Tend an old grave"** rite in Today's rites (Home tab) shows already-completed; owner's rule is everything must read 0 on new/reset. **Root cause:** [`src/data.js:61`](src/data.js#L61) seeds the `revisit` quest with `cur: 1` (comment even says "revisit starts done"); `quests` defaults to `DAILY_QUESTS` for new users and reset-all-data falls back to the same seed. **Trap caught:** `revisit` has **no completion trigger anywhere** ([`src/home/completeEntry.js`](src/home/completeEntry.js#L32-L36) only advances write/feel), so a bare `cur: 0` would make the rite permanently uncompletable and **regress the daily keepsake to unearnable** (all three rites gate it). **Approach decided (do not re-litigate):** zero the seed **and** give `revisit` a real trigger — kept by opening a *past* entry from Reflections, via a new pure helper `src/home/markRevisited.js` wired at the `setReading(e)` call site. Full spec + TDD + steps are inline in the IMP-013 task block._

_2026-06-13 — IMP-013 COMPLETE (code) — "Tend an old grave" zeroed for new/reset users; kept by revisiting a past entry. TDD'd new pure helper `src/home/markRevisited.js` exporting `markRevisited(quests, entry, today)` — immutable: returns a new quests array with `revisit.cur` set to `goal` only when `entry.dayKey !== today` and revisit is not already kept; today's entry, missing `dayKey`, or already-kept → returns the same reference unchanged; `write`/`feel` untouched. Also wrote a `DAILY_QUESTS` zero-state guard in the same test suite. Wrote `__tests__/home/markRevisited.test.js` FIRST (7 cases: past-entry sets goal, today's-entry no-op, no-dayKey no-op, idempotent, write/feel unchanged, new-array/no-mutation, plus zero-guard — all RED → module-not-found) then implemented (GREEN). Fixed `src/data.js`: `revisit.cur 1 → 0`; corrected the comment (was "revisit starts done" → "all rites start at 0; revisit kept by opening a past entry"). Wired in `src/RitualsApp.js`: added `import { markRevisited }` and expanded the `ArchiveScreen onOpen` handler to `(e) => { setReading(e); setQuests((qs) => markRevisited(qs, e, todayKey())); }`. `npm test` → **123 passed, 17 suites** (was 116 + 7 new cases). Last command: `git commit -m "fix(rites): zero \"tend an old grave\" for new/reset users; complete it by revisiting a past entry"` — succeeded (commit `70b1dd7`). **Acceptance (owner runtime walk — no device in session):** Fresh install (or You → Reset app data) → Today tab → all three rites read 0/1, none pre-kept, "0 of 3 kept"; write today + mood → write/feel kept, revisit still 0; open a *previous day's* entry from Reflections → revisit flips to kept; all three kept → daily keepsake offered; next calendar day → all rites reset to 0. **Ship:** OTA-eligible (all changes in `src/`) — tag a commit `Release-Lane: ota` and `git push origin main` when owner is ready. **EXACT NEXT STEP:** IMP backlog is now empty of codeable work (IMP-006 🟡 = owner device backup-verify only; IMP-008–013 all ✅ code, several runtime-walk/ship pending). Await new owner-filed improvements, or — if owner wants to monetize — resume the phase ladder at **Phase 10b** (BillDesk + live products + flip `PLUS_ENABLED`)._

---

## 🤖 Release rules (Opus/Sonnet — how shipping works now)

Shipping is automated (GitHub Actions + one-tap owner approval). **Agents NEVER run `eas` commands and never hand-edit version numbers.** To ship a finished, shippable change:

1. **Pick the lane:**
   - **OTA** — only files under `src/` changed (JS / UI / copy / logic).
   - **BUILD** — any native-affecting file changed: `app.config.js`, `package.json`, `package-lock.json`, `eas.json`, `babel.config.js`, `assets/`, or a new native dep / permission / SDK / target.
2. **BUILD lane only — bump versions with the scripts (never by hand):**
   - `npm run bump:build` — native/config change that is runtime-compatible → `versionCode +1`.
   - `npm run bump:native` — native change affecting runtime/OTA compatibility → `version` patch +1 **and** `versionCode +1`. **When unsure, use `bump:native`** (safer; scopes OTA to compatible builds).
3. **Tag the final commit** of the shippable unit with the trailer as the last line(s) of the commit message, exactly:
   - `Release-Lane: ota`  — or —  `Release-Lane: build`
   (Putting it on the PROGRESS.md closeout commit is fine; CI reads the trailer from HEAD and diffs the whole push.)
4. **Push `main`.** CI runs the test gate, then waits for the owner's one-tap approval, then ships: OTA (`eas update`) or build + auto-submit to closed testing (`alpha` track).
5. **No trailer = nothing ships** — safe for work-in-progress pushes.

Guardrails: a commit tagged `ota` that touched native files is auto-rejected by CI's backstop (re-tag as `build`). OTA reaches testers on **v5+** only. Rollback: owner runs the **Rollback OTA** workflow (Actions tab). Owner one-time setup (tokens/secrets/approval environment) is in the pipeline plan, [`docs/superpowers/plans/2026-06-07-streamlined-release-pipeline.md`](docs/superpowers/plans/2026-06-07-streamlined-release-pipeline.md), Task 8.

### Release invariants (don't relearn these)
- **runtimeVersion policy = `appVersion`, NOT `fingerprint`.** `fingerprint` is non-deterministic between this Windows dev machine and EAS's Linux servers (absolute paths + CRLF-hashed `node_modules` → mismatched hashes → OTA rejected). So OTA targets runtimeVersion = the `version` string.
- **Native change → bump `version`** (`npm run bump:native`) so OTA is scoped to compatible builds; **pure-JS fix keeps the same `version`** (`versionCode` still bumps every upload). This is the manual replacement for the lost fingerprint auto-guard.
- **First OTA-capable build = versionCode 5 / version 1.0.0** (v4 predates `expo-updates`). v5 is the OTA baseline.
- Channels = branches: production builds listen on channel `production`; `eas update --branch production` serves them.

_(Older manual `eas` lane reference archived in [docs/build-log.md](docs/build-log.md) → "Update workflow".)_
