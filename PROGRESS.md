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

_2026-06-08 — IMP-010 + IMP-011 complete (code), both owner-filed bugs. (1) **IMP-010 — onboarding every cold start:** root cause was `App.js`'s `onboarded` useState defaulting to `false` with nothing restoring it. Added `'onboarded'` to `PERSISTED_KEYS` (`src/persistence/state.js`); `RitualsApp` autosave now writes `onboarded: true` (it only mounts after first-run); `App.js` load now sets `onboarded` when `loaded` is truthy OR `s.onboarded` — the `loaded`-truthy clause means existing testers (who have persisted state but no `onboarded` key yet) are NOT re-onboarded on this update, so no migration and no disruption to the 12×14 gate. Reset-all-data still returns to onboarding (clears state). TDD: 2 RED→GREEN cases in `__tests__/persistence/state.test.js` (pickPersisted carries the flag; serialize/deserialize round-trip). (2) **IMP-011 — "31 May" in the reflection flow:** IMP-008 missed `WriteFlow.js`, which still rendered the hardcoded `TODAY_LABEL`. Swapped both occurrences to `todayLabel()` (the device-date helper HomeScreen already uses) and deleted the dead `TODAY_LABEL` export from `data.js` (grep-confirmed no other src usage — only docs). New entries were already date-correct via `entryDateParts()`, so the Reflections list itself was fine; this was the write-screen epitaph header. **Self-confirmed both fixes by test (owner couldn't do a device walk):** extracted the onboarding decision out of `App.js` into a pure, tested helper `src/persistence/onboarding.js` (`hasCompletedOnboarding(loaded)`) and added `__tests__/persistence/onboarding.test.js` (4 cases — new user → onboarding; flag set → skip; legacy tester w/ data but no flag → skip; real save→load round-trip → skip) + `__tests__/time/writeFlowDate.test.js` (2 cases — `TODAY_LABEL` is now undefined; the date source tracks the real day, never "31 May"). Noted the old constant even had the wrong weekday (31 May 2026 is a Sunday). `npm test` → **103 passed, 15 suites** (95 → +2 persistence flag cases +4 onboarding-gate +2 writeFlowDate). **NOT committed / NOT pushed** (owner didn't ask to ship this session; on `main`, so branch before committing per workflow). **Owner runtime walk pending** (no device in session): cold-start an already-set-up install → lands on Today, no onboarding; open the write FAB → epitaph shows today's real date; fresh install / reset → onboarding shows once, then never again. **Ship:** both OTA-eligible. Note for tagging: IMP-010 touches `App.js` (root JS entry, bundled — not native), so confirm the CI native-backstop's path rule accepts `App.js` under the `ota` lane before tagging `Release-Lane: ota`; if the backstop is a strict `src/`-only check it may need `build` (or a backstop tweak). NEXT: owner to verify on device + decide ship lane; IMP backlog otherwise empty of codeable work (IMP-006 🟡 = owner device-verify only)._

_2026-06-08 — IMP-012 COMPLETE (code) — Achievements + Home Keepsakes start fresh from real data. TDD'd a new pure helper `src/profile/achievements.js` exporting `ACHIEVEMENT_DEFS` (six achievements as metadata only: `{id,label,desc,icon,goal,stat}`, `stat ∈ daysKept|longestStreak|moodsLogged`), `KEEPSAKE_DEFS` (the five Home medals: firstlight/seven/honest/steadfast/fullcircle, fixed order+icons), `deriveAchievements(entries, streak, now)` → `[{...def, cur:min(value,goal), done:value>=goal}]`, and `deriveKeepsakes(...)` → `[{...def, earned:value>=threshold}]`. Both reuse `deriveInsights` once (moodsLogged = sum of moodMix.n) so streak/day math stays in one place. Wrote `__tests__/profile/achievements.test.js` FIRST (13 cases, RED → module-not-found) then implemented (GREEN): empty user → all cur 0/done false/earned 0; fixed Jun 1–3 set → firstlight done & clamped to 1, seven cur 3, honest tracks 2 moods (excludes mood-less entry), moonlit cur 3; done flips exactly at goal (7-day run); cur never exceeds goal (100-day clamp); keepsakes order/ids + first-entry lights First Light only. Made `Achievements.js` a dumb renderer (new `entries`/`streak` props → `deriveAchievements`; render earned-count, per-row cur/goal + Earned badge from result; dropped `ACHIEVEMENTS` import). Drove HomeScreen's Keepsakes strip off `deriveKeepsakes(entries, streak)` (dropped `BADGES` import; same 5 medals/icons/order — only earned state is now real). `RitualsApp.js`: memoized `achievements = deriveAchievements(entries, streak)`, `badgesEarned = achievements.filter(a=>a.done).length` (replaces the fake `ACHIEVEMENTS.filter(...)`), threaded `entries`/`streak` into `<Achievements />`, dropped now-unused `ACHIEVEMENTS`/`BADGES` from the data import. Deleted the dead `ACHIEVEMENTS` + `BADGES` constants from `src/data.js` (grep-confirmed no remaining src refs — only comments in achievements.js). `npm test` → **116 passed, 16 suites** (was 103 + 13 new). Last command: `git commit -m "fix(achievements): derive progress + keepsakes from real entries (kill hardcoded values)"` — succeeded (commit `1a2b6b4`). **Last step completed: step 7.** Step 6 (Expo Go runtime walk) is owner-manual — no device in session: fresh/reset account → "0 of 6 earned", all medals unlit, all bars at 0/goal; write entries / build a streak → the right achievements progress + light up; You-tab keepsakes count matches. **NOT pushed / NOT shipped** (owner didn't ask to release this session; committed on `main`, no `Release-Lane` trailer). **Ship:** OTA-eligible (all JS in `src/`) — tag the final commit `Release-Lane: ota` and `git push origin main` when owner is ready (reaches testers on v5+). **EXACT NEXT STEP for next chat:** IMP backlog is now empty of codeable work (IMP-006 🟡 = owner device backup-verify only; IMP-008/009/010/011/012 all ✅ code, several with runtime-walk/ship pending). Await new owner-filed improvements, or — if owner wants to monetize — resume the phase ladder at **Phase 10b** (BillDesk + live products + flip `PLUS_ENABLED`)._

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
