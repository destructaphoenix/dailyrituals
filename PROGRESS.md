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
| IMP-008 | Real zero-state finish: derive level from XP (kill hardcoded Lv 3), calendar + week strip from real entries (kill fake HEAT/WEEK), real entry dates (kill 31 May) | OTA | ✅ (shipped OTA 2026-06-13; runtime walk pending) |
| IMP-009 | Insights tab from real entries (kill hardcoded STATS/MOOD_MIX/RHYTHM); empty state | OTA | ✅ (shipped OTA 2026-06-13; runtime walk pending) |
| IMP-010 | Onboarding shows only on first ever launch (persist `onboarded`; returning testers skip it, no re-onboard on update) | OTA | ✅ (shipped OTA 2026-06-13; runtime walk pending) |
| IMP-011 | Kill the last hardcoded "31 May" — WriteFlow epitaph uses the device's real date (`todayLabel()`); delete dead `TODAY_LABEL` | OTA | ✅ (shipped OTA 2026-06-13; runtime walk pending) |
| IMP-012 | Achievements + Home "Keepsakes" start fresh — derive every `cur`/`earned` from real entries+streak (kill hardcoded `ACHIEVEMENTS.cur` & `BADGES.earned`); empty for new users | OTA | ✅ (shipped OTA 2026-06-13; runtime walk pending) |
| IMP-013 | 🔴 "Tend an old grave" rite starts marked-done for new users / after reset — zero it AND give it a real completion trigger (revisit a past entry) so the daily keepsake stays earnable | OTA | ✅ (shipped OTA 2026-06-13; runtime walk pending) |
| IMP-014 | Missed days show 💀 (skull) instead of a blank cell — in the Today week strip AND the Reflections heatmap; only for genuinely-missed days (past, no entry, on/after first activity), never pre-start or future days | OTA | ✅ (shipped OTA 2026-06-13; runtime walk pending) |
| IMP-015 | "What should we call you?" is mandatory in onboarding — can't proceed past Personalize with an empty name (new users / after reset) | OTA | ✅ (shipped OTA 2026-06-13; runtime walk pending) |
| IMP-016 | Ember/amber flame icon in the header is proportional + centered (glyph fills its box; fix tight top-biased viewBox so it isn't tiny/misaligned at small sizes) | OTA | ✅ (shipped OTA 2026-06-13; runtime walk pending) |
| IMP-017 | Greeting is Good morning / Good afternoon / Good evening by the user's local time (add the missing "afternoon" band) | OTA | ✅ (shipped OTA 2026-06-13; runtime walk pending) |
| IMP-018 | Today's reflection is editable — today ONLY — and editing pre-fills the existing text (with a "Start fresh" reset), never opens blank | OTA | ✅ (shipped OTA 2026-06-13; runtime walk pending) |
| IMP-019 | Premium dark-mode redesign ("Embers in the Dark") — true-black AMOLED, ember-glow hero (no moon), in line with light mode; behind a one-line revert flag (classic dark stays intact) | OTA | ⏳ Code done (Round 2) — **owner screenshot review on OLED before OTA** |

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

### IMP-013 — "Tend an old grave" rite must start at 0 (new user / after reset) + get a real completion trigger   ·   Lane: OTA   ·   Status: ✅ (shipped OTA 2026-06-13; runtime walk pending)
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

### IMP-014 — Missed days show a skull 💀, not a blank cell (Today week strip + Reflections heatmap)   ·   Lane: OTA   ·   Status: ✅ (shipped OTA 2026-06-13; runtime walk pending)
- **Goal:** A day the user *missed* (a past day with no entry, on/after the day they started using the app) renders a **💀 skull** instead of a neutral blank — in **both** the Today-screen week strip and the Reflections heatmap. Days the user could not have kept (before their first-ever entry, or in the future) stay neutral blanks — never skulls.
- **Why / context:** Owner-filed (2026-06-13): a missed day currently shows as an empty cell on the Today screen and Reflections (and anywhere the day grid appears); owner wants a skull there. This was discussed before — note [`src/home/calendar.js:4`](src/home/calendar.js#L4) explicitly says *"No-entry days are neutral empties — never skulls."* **This task reverses that decision, but only for genuinely-missed days** — the original concern (don't demoralize users with skulls for days before they installed, or for the future) is preserved by anchoring "missed" to the first activity date.
- **What "missed" means (precise — decide here, don't re-litigate):** For a day cell with key `dayKey` and the set of entry dayKeys, with `firstKey` = the earliest entry's dayKey:
  - `today` → today (unchanged).
  - `dayKey > today` → `future` (unchanged neutral).
  - has an entry → `done` (unchanged).
  - no entry **and** `dayKey < today` **and** `dayKey >= firstKey` → **`missed`** (skull). 
  - no entry and `dayKey < firstKey` (before the user ever started) → `empty` (neutral, no skull).
  - **New user / no entries at all → `firstKey` is undefined → there are no `missed` days** (nothing to miss). This satisfies "everything is clean for a new user".
- **Files likely touched:** `src/home/calendar.js` (add the `missed` state to both `buildWeekStrip` and `buildHeatmap`), `src/screens/HomeScreen.js` (the `Dot` renders 💀 for `missed`), `src/screens/ArchiveScreen.js` (the `Heat` cell renders 💀 for `missed`), `__tests__/home/calendar.test.js` (extend).
- **Approach (decided by Opus — do not re-litigate):**
  1. **`calendar.js` (pure):** compute `firstKey = min(dayKeys)` once (entries are keyed by `dayKey`; `indexByDay` already exists). In `buildWeekStrip`, replace the `byDay[dayKey] ? 'done' : 'empty'` branch with: entry → `done`; else `dayKey >= firstKey` → `missed`; else `empty`. In `buildHeatmap`, the no-entry branch currently pushes `{ empty: true }`; split it into `{ missed: true }` when `dayKey >= firstKey && dayKey < todayK`, else keep `{ empty: true }` (and today with no entry stays `empty` + `today:true` as now — don't skull today). Update the file's header comment to describe the new rule.
  2. **`HomeScreen.js` `Dot`:** add a `missed` branch — render a 💀 (a `<Text>` emoji, sized ~16–18 to match the `Check`/`Orb` glyphs) on a muted/neutral background (reuse the existing neutral dot bg; no accent). Keep the existing `done`/`today`/`future` visuals.
  3. **`ArchiveScreen.js` `Heat`:** when `cell.missed`, render the 💀 `<Text>` (match the existing `fontSize: 19, lineHeight: 23` used for mood emoji) on the neutral cell style (solid faint bg or the dashed border — pick the dashed/empty look but with the skull inside; keep it visually quieter than a kept day).
- **TDD (write tests FIRST — RED → GREEN), extend `__tests__/home/calendar.test.js`:** with a fixed `today` and a fixed entry set — (a) a past gap day on/after the first entry → `missed` in both builders; (b) a past day *before* the first entry → `empty`, not `missed`; (c) today with no entry → `today`/`empty`+today (never `missed`); (d) a future day → `future`/empty; (e) a day with an entry → `done`; (f) **no entries at all → zero `missed` cells** in both builders.
- **Steps:**
  - [x] 1. Extend `__tests__/home/calendar.test.js` with the cases above (RED).
  - [x] 2. Add the `missed` state to `buildWeekStrip` + `buildHeatmap` in `src/home/calendar.js`; update the header comment → GREEN.
  - [x] 3. Render 💀 for `missed` in `HomeScreen.js` `Dot` and `ArchiveScreen.js` `Heat`.
  - [x] 4. `npm test` green (131 passed, 17 suites — 8 new cases).
- **Commit:** `fix(calendar): show a skull for missed days (week strip + heatmap), never before first entry`
- **Acceptance (runtime walk — owner):** With entries that have a gap (e.g. kept Mon + Wed, skipped Tue), Tuesday shows 💀 on both the Today week strip and the Reflections heatmap. A brand-new/reset user sees **no** skulls. Days earlier in the week than your first-ever entry, and future days, show the neutral blank — not a skull. Today never shows a skull.
- **Known nuance (document, don't fix):** there's no per-day freeze record (`freezes` is just a count), so a missed day that a streak-freeze "saved" will still show a skull. Flagging for a future task if the owner wants freeze-aware cells.
- **Ship after merge:** OTA — all JS in `src/`. Tag `Release-Lane: ota`.

### IMP-015 — "What should we call you?" is mandatory (can't skip past Personalize blank)   ·   Lane: OTA   ·   Status: ✅ (shipped OTA 2026-06-13; runtime walk pending)
- **Goal:** During onboarding (new user, or after Reset app data), the user **cannot leave the Personalize step without entering a name**. The "Looks good" button is disabled until a non-blank name is typed; a blank/whitespace-only name is rejected.
- **Why / context:** Owner-filed (2026-06-13): the name question must be answered. Today [`src/screens/Onboarding.js:221`](src/screens/Onboarding.js#L221) lets "Looks good" proceed with an empty name (`name` defaults to `''`, no validation), so users land in the app nameless — which is why the You tab can show an empty identity. There is **no "Skip" on Personalize** (the only Skip is on the intro carousel, which is fine — that just skips the welcome slides, not the name). So the fix is purely: gate the "Looks good" CTA.
- **Files likely touched:** `src/screens/Onboarding.js` (the `Personalize` component), optionally a tiny pure validator `src/profile/name.js`, `__tests__/profile/name.test.js` (new, optional).
- **Approach (decided by Opus — do not re-litigate):**
  - In `Personalize`, compute `const nameOk = name.trim().length > 0;` and pass `disabled={!nameOk}` to the "Looks good" `PrimaryButton` (the component already supports `disabled` — see its use in `WriteFlow`). Keep the existing `setSettings((s) => ({ ...s, name: name.trim() }))` on press.
  - Add a small inline hint under the field shown only after the user has interacted and it's still empty (or always-muted helper text like "Required"), so the disabled button isn't a mystery. Keep it gentle/on-voice.
  - **Don't** add any new step or remove the intro Skip. **Don't** make the reminder-time question mandatory — only the name.
  - *(Optional, nicer)* extract `isValidName(raw)` → `raw.trim().length > 0` into `src/profile/name.js` and unit-test it; use it for `nameOk`. Lightweight; do it if it keeps the component clean.
- **TDD:** If you extract `isValidName`, write `__tests__/profile/name.test.js` first (empty → false; whitespace-only → false; "  Sam  " → true). If you keep it inline (pure UI gating), TDD is N/A — note it.
- **Steps:**
  - [x] 1. (If extracting) RED test for `isValidName`.
  - [x] 2. Gate "Looks good" with `disabled={!name.trim()}` + add the required-hint in `Personalize`.
  - [x] 3. `npm test` green (137 passed, 18 suites — 6 new tests added).
- **Commit:** `fix(onboarding): require a name before leaving Personalize`
- **Acceptance (runtime walk — owner):** Fresh install / reset → onboarding → Personalize: with the name field empty (or spaces only) the "Looks good" button is visibly disabled and won't proceed; typing a real name enables it; proceeding lands you in-app with that name on the You tab.
- **Ship after merge:** OTA. Tag `Release-Lane: ota`.

### IMP-016 — Ember/amber flame icon must be proportional + centered in the header   ·   Lane: OTA   ·   Status: ✅ (shipped OTA 2026-06-13; runtime walk pending)
- **Goal:** The amber **Ember** flame (the embers-balance pill, top-right of the Today header) looks correctly sized and vertically centered — not tiny and floating high in its slot.
- **Why / context:** Owner-filed (2026-06-13): the flame icon top-right is "not proportional… small and looks misaligned when small." Root cause: in [`src/icons.js:309-321`](src/icons.js#L309-L321) the `Ember` glyph path only occupies roughly **x ∈ [7.3, 16.7], y ∈ [2.3, 15.4]** of its `viewBox="0 0 24 24"` — i.e. the flame fills only ~40% of the canvas and sits **top-biased**. So at the rendered `size={17}` in `EmberPill` ([`src/shopui.js:29`](src/shopui.js#L29)) the actual flame draws ~7px tall and high up, reading as tiny and misaligned next to the `15px` number text.
- **Files likely touched:** `src/icons.js` (the `Ember` component's `viewBox` only), possibly `src/shopui.js` (a small `size` bump if still needed after the viewBox fix). **No path-data changes** (keep the flame shape + gradient identical).
- **Approach (decided by Opus — do not re-litigate):**
  - **Tighten the `viewBox` to the glyph's bounding box, kept square to avoid distortion** (the `Svg` is rendered square: `width=height=size`). Glyph center ≈ `(12, 8.85)`, max extent ≈ 13.1 (height). Use a square viewBox of side ≈ 14.5 centered on the glyph: **`viewBox="4.75 1.6 14.5 14.5"`** (start here; nudge if needed). This makes the flame fill ~90% of the rendered box and centers it. The gradient id `ember${size}` is unaffected.
  - After the viewBox fix, re-check `EmberPill`: the flame should now visually match the `15px` number and the `+` chip. If it now looks slightly large, drop `size={17}` → `15–16`; if still small, that's fine. Verify vertical centering against the number (the pill row already uses `alignItems: 'center'`).
  - Sanity-check the **other** `Ember` callsite — `PalTag` in `shopui.js` (`size={13}`) — still looks right (it will simply render a properly-filled small flame; no change expected).
- **TDD:** N/A — pure SVG/cosmetic. Confirm `npm test` stays green (unchanged count). 
- **Steps:**
  - [x] 1. Update the `Ember` `viewBox` in `src/icons.js` (square, glyph-centered).
  - [x] 2. Eyeball `EmberPill` + `PalTag`; adjust the `EmberPill` `size` only if needed.
  - [x] 3. `npm test` green (unchanged — no logic touched).
- **Commit:** `fix(icons): make the Ember flame fill + center its box (was tiny/top-biased)`
- **Acceptance (runtime walk — owner):** The amber flame in the embers pill (top-right, Today) is clearly visible, sized in proportion to the number beside it, and vertically centered within the pill — no longer a small mark floating near the top.
- **Ship after merge:** OTA. Tag `Release-Lane: ota`.

### IMP-017 — Greeting: Good morning / afternoon / evening by the user's local time   ·   Lane: OTA   ·   Status: ⬜
- **Goal:** The Today-screen greeting reads **"Good morning"**, **"Good afternoon"**, or **"Good evening"** depending on the device's local hour.
- **Why / context:** Owner-filed (2026-06-13): wants all three greetings, by the user's time. Today [`src/time/clock.js:5-7`](src/time/clock.js#L5-L7) `greetingFor()` only returns morning (`<12`) or evening (`>=12`) — **"afternoon" is missing entirely**. (The greeting is already wired to device time and rendered in `HomeScreen` line 21/35.)
- **Files likely touched:** `src/time/clock.js` (`greetingFor`), `__tests__/time/clock.test.js` (extend).
- **Approach (decided by Opus — do not re-litigate):** make `greetingFor(date = new Date())` return by local hour `h = date.getHours()`: `h < 12` → "Good morning"; `12 ≤ h < 17` → "Good afternoon"; `h ≥ 17` → "Good evening". (Boundaries: noon flips to afternoon, 5:00 PM flips to evening — standard, simple.) Pure function; no other change.
- **TDD (write tests FIRST — RED → GREEN), extend `__tests__/time/clock.test.js`:** assert greeting at representative hours by passing a fixed `date` — e.g. 06:00 → morning, 12:00 → afternoon, 16:59 → afternoon, 17:00 → evening, 21:00 → evening, 00:00 → morning. (Construct dates so `getHours()` is deterministic regardless of TZ — e.g. `new Date(2026,0,1,6,0,0)`.)
- **Steps:**
  - [x] 1. Add the afternoon-band tests to `__tests__/time/clock.test.js` (RED).
  - [x] 2. Update `greetingFor` with the three bands → GREEN.
  - [x] 3. `npm test` green (140 passed, 18 suites — 3 new cases).
- **Commit:** `fix(clock): add "Good afternoon" — greeting now morning/afternoon/evening by local time`
- **Acceptance (runtime walk — owner):** Opening the app in the afternoon shows "Good afternoon."; morning shows "Good morning."; evening shows "Good evening." — matching the device clock.
- **Ship after merge:** OTA. Tag `Release-Lane: ota`.

### IMP-018 — Today's reflection is editable (today only), pre-filled, with a reset toggle   ·   Lane: OTA   ·   Status: ⬜
- **Goal:** A reflection written **today** can be edited **the same day only**. Choosing to edit opens the write flow **pre-filled** with the existing answers (did / wished / mood) — not blank — with an explicit **"Start fresh"** control to clear it if they want to rewrite from scratch. Entries from previous days are **not** editable.
- **Why / context:** Owner-filed (2026-06-13). The same-day *replace* logic already exists ([`src/home/completeEntry.js:14-27`](src/home/completeEntry.js#L14-L27): when `prev.done`, a new write replaces today's entry with no extra reward), but the entry point — the write FAB — always opens `WriteFlow` **blank**, so "editing" silently wipes what you wrote. And there's no edit affordance from a reflection at all. We need: (a) prefill, (b) a reset control, (c) an Edit button on **today's** entry only.
- **Files likely touched:** `src/screens/WriteFlow.js` (accept an `initial` entry; seed state; add "Start fresh"), `src/RitualsApp.js` (pass today's entry into `WriteFlow`; add an `onEdit` path from `ReadingSheet`), `src/screens/ReadingSheet.js` (show "Edit" only for today's entry), a tiny pure helper `src/home/todaysEntry.js` (find today's entry / is-editable), `__tests__/home/todaysEntry.test.js` (new).
- **Approach (decided by Opus — do not re-litigate):**
  1. **Pure helper `src/home/todaysEntry.js`:** `findTodaysEntry(entries, today)` → the entry whose `dayKey === today` (or `null`); `isEditableToday(entry, today)` → `!!entry && entry.dayKey === today`. Immutable/no side effects.
  2. **`WriteFlow` prefill + reset:** add an optional `initial` prop (`{ did, wished, mood }`). Seed `useState` from it (`useState(initial?.did ?? '')`, etc.). Add a **"Start fresh"** text button in the top bar, visible only when `initial` is set, that clears `did`/`wished`/`mood` back to empty and returns to step 0. (Keep the existing 3-step flow; prefilling just pre-populates the fields so step 1/2 show prior text and the mood is pre-selected.) The epitaph header can stay today's date (it's an edit of *today*).
  3. **`RitualsApp` wiring:** compute `const today = todayKey();` and `const todaysEntry = findTodaysEntry(entries, today);`. Pass `initial={todaysEntry}` into the `<WriteFlow … />` (so the FAB, when `done`, reopens prefilled; when not done, `todaysEntry` is null → blank as today). `complete()` already routes through `applyCompletion`, which replaces today's entry when `prev.done` — so saving an edit won't double-count streak/XP (that's IMP-007's guarantee; keep it).
  4. **`ReadingSheet` edit affordance (today only):** pass `canEdit` (= `isEditableToday(entry, today)`) and an `onEdit` callback from `RitualsApp`. When `canEdit`, show an "Edit" button in the sheet header; pressing it closes the sheet and opens `WriteFlow` prefilled with that entry. For past entries, **no** Edit button (read-only) — this is what enforces "today only".
- **Edit-only-today enforcement:** the *only* ways into `WriteFlow` are the FAB (always today's context) and the new `ReadingSheet` Edit button (gated by `isEditableToday`). Past entries open read-only. `applyCompletion` is keyed on `dayKey`, so even a save only ever touches today's entry.
- **TDD (write tests FIRST — RED → GREEN):** `__tests__/home/todaysEntry.test.js` — `findTodaysEntry` returns today's entry / `null` when none; picks the right one among many; `isEditableToday` true only for `dayKey === today`, false for a past entry, false for `null`. (The reward-dedup on save is already covered by `completeEntry.test.js` — don't duplicate; optionally add one assertion that re-saving via the edit path keeps streak/xp unchanged if not already covered.)
- **Steps:**
  - [x] 1. RED: `__tests__/home/todaysEntry.test.js`.
  - [x] 2. Implement `src/home/todaysEntry.js` → GREEN.
  - [x] 3. `WriteFlow`: `initial` prop seeding + "Start fresh" reset.
  - [x] 4. `RitualsApp`: pass `initial={todaysEntry}`; wire `onEdit`/`canEdit` to `ReadingSheet`.
  - [x] 5. `ReadingSheet`: Edit button shown only when `canEdit`.
  - [x] 6. `npm test` green (149 passed, 19 suites — 9 new cases).
- **Commit:** `feat(reflections): edit today's entry only — prefilled write flow with a "Start fresh" reset`
- **Acceptance (runtime walk — owner):** After completing today's reflection, tapping the write FAB (or "Edit" on today's entry in Reflections) reopens the flow **with your text already there** and the mood pre-selected; "Start fresh" clears it. Saving updates today's entry **without** bumping streak/XP again. Opening a *previous* day's reflection shows it read-only (no Edit). 
- **Ship after merge:** OTA — all JS in `src/`. Tag `Release-Lane: ota`.

### IMP-019 — Premium dark-mode redesign: "Embers in the Dark" (true-black AMOLED, behind a revert flag)   ·   Lane: OTA   ·   Status: ⬜
- **Goal:** Replace the current flat, basic dark mode with a premium **true-black (AMOLED)** dark theme that looks great on OLED flagships (Galaxy Ultra / iPhone): an inky `#000000` canvas, **near-black elevated cards** for depth, amber-only accents, and a new **ember-glow hero** (a warm amber bloom + a few drifting sparks behind the streak number). **No brown anywhere. No moon.** **Hard requirement: fully revertible** to the exact existing dark design via a single flag, in case the redesign flops.
- **Why / context:** Owner feedback (2026-06-13): the current dark mode is a genuine downgrade — the cheese-hole `NightSky` moon ([`src/art.js:43`](src/art.js#L43)) "feels like a kid's drawing", drop shadows don't render on black so cards look flat, and `accentSoft: '#2a2113'` is muddy. **Owner decisions this session (do not re-litigate):** (a) keep it **true black / AMOLED-friendly** — pure `#000` (pixels off on OLED = battery + inky premium look); the warm off-black/brown direction sketched earlier is **reversed** (no brown); (b) **drop the moon hero entirely**; (c) the night hero = **ember glow + rising sparks** (on-brand: the Embers currency, candles, "laying the day to rest"), which blooms beautifully on pure black. Full redesign (Direction A), built directly, behind a revert flag. (Planning-only discussion; specs below, no code written this session.)
- **Hard constraints (do not violate):**
  - **Revertibility:** keep the **existing** `night` palette **and** `NightSky` art fully intact and selectable. The new theme ships behind a flag; a flop = flip one constant + OTA. **Never delete or mutate** the current night tokens/art.
  - **True-black / AMOLED:** the canvas stays pure `#000000`. **Do NOT add a global gradient/backdrop that lightens the canvas** — that defeats AMOLED. Depth comes from elevated cards + the hero glow, never from lifting the background.
  - **No brown:** palette = neutral/near-black grays (a hint of warmth at most) + amber accent only. No espresso/brown fills.
  - **"In line with light mode":** identical layout, spacing, radii, fonts, component structure, and copy. **Only** the palette + the night hero change.
  - Lane **OTA** (palette + SVG/JS only; the revert is also OTA).
- **Files likely touched:** `src/theme.js` (add `DARK_THEME` flag + `PALETTES.nightV2` + flag resolution in `makeTheme`; keep `night`), `src/art.js` (new `EmberGlow` hero; keep `NightSky`), `src/screens/HomeScreen.js` (+ `Celebration.js` / anywhere the night hero renders — select hero by flag), `__tests__/theme/darkTheme.test.js` (new — palette resolution / revert guard).
- **Approach (decided by Opus — do not re-litigate the structure; exact hexes/intensities are dial-in values to tune on-device):**
  1. **The revert flag (safety net):** add `export const DARK_THEME = 'v2'; // 'v2' (new premium) | 'classic' (original) — set to 'classic' to revert` in `theme.js`. In `makeTheme('night', …)` resolve `const base = (DARK_THEME === 'v2') ? PALETTES.nightV2 : PALETTES.night;`. `PALETTES.night` stays **byte-for-byte the classic**. Reverting = change that one constant, ship OTA. Nothing removed.
  2. **`PALETTES.nightV2` — true-black AMOLED** (starting points; tune on-device):
     - `cream` (canvas): **`#000000`** (keep pure black — AMOLED).
     - `surface` (cards): a **near-black elevated** gray that lifts off pure black → ~ **`#0e0e10`** (add a deeper-elevation token ~ **`#161618`** if a screen needs two levels). A hint of warmth is OK; **not brown**.
     - `border`: a faint **hairline** ~ **`#26241f`** — surface-vs-canvas contrast + this border is what reads as depth on OLED.
     - `ink` `#f4eee4` (keep); `muted` ~ **`#8b857c`** for legibility on black.
     - `accent`/`accentDeep` keep amber `#f59e0b`/`#fbbf24` (the only real color — glows pop on black).
     - `accentSoft` `#2a2113` → a **near-black with an amber tint** ~ **`#1c160c`** so chips read crisp "amber-on-black" (not muddy, not brown).
     - retune `dot`, heat levels, `navBg` (`rgba(0,0,0,…)`), `placeholder` to pure black (keep `heat3 = accent`).
  3. **Depth without shadows (they're invisible on black):** elevation = **(pure-black canvas vs near-black card surface) contrast + 1px hairline borders** (+ optional subtle top-edge inner highlight on cards). Leave `t.shadow()` as-is. Selective amber glow only on the hero + key accents.
  4. **New hero `EmberGlow`** (replaces the moon at night-v2; **keep `NightSky` for classic**): on pure black, render (a) a soft **radial amber→transparent bloom** behind the streak number (glowing coals/candlelight; gentle "breathe" of opacity/scale), and (b) **a few slow ember sparks** (~4–7) drifting upward and fading — reuse the `Confetti`/`Animated` particle approach but subtle + low-count (tasteful, not festive). Warm tones (`#fde68a`/`#f59e0b`/`#fbbf24`). A couple of faint static motes are fine; **no moon, no star-field hero**. **Keep the glow center / focal point at y ≈ 80px from card top** so the streak number stays centered (consistent with IMP-003).
  5. **Promote only on owner approval:** build behind the flag, screenshot **Today / Reflections / You / Write / Celebration** in dark (ideally on an OLED device), iterate; keep `DARK_THEME='v2'` default once approved. If it flops → flip to `'classic'`.
- **TDD:** mostly visual (owner screenshot review). Write one pure test `__tests__/theme/darkTheme.test.js`: `makeTheme('night')` returns the **nightV2** tokens when `DARK_THEME==='v2'` and the **classic** tokens when `'classic'` (locks both the resolution and the revert path). The rest (palette values, art) is visual — note N/A.
- **Steps:**
  - [x] 1. Add `DARK_THEME` flag + `PALETTES.nightV2` (true black); resolve in `makeTheme`; keep `night` classic intact. Add the resolution/revert test (RED → GREEN).
  - [x] 2. Build the `EmberGlow` hero (amber bloom + drifting sparks), focal point y≈80; keep `NightSky`. Select the hero by flag in `HomeScreen` (+ `Celebration` if it uses the night hero).
  - [x] 3. Retune elevation — near-black surface vs `#000` + hairline borders so cards read on OLED.
  - [x] 4. `npm test` green (154 passed, 20 suites — 5 new tests). Owner screenshot review across all dark screens (ideally on OLED) before promoting.
- **Commit:** `feat(theme): true-black AMOLED dark mode with ember-glow hero, behind DARK_THEME flag (revertible)`
- **Acceptance (owner runtime walk + screenshots, ideally on an OLED device):** In dark mode — the canvas is **pure black** (AMOLED — inky/seamless on Galaxy Ultra/iPhone); cards visibly lift off the black via subtle elevation + hairline borders; the streak hero shows a **warm ember glow with a few drifting sparks** (no moon), centered on the number; chips/accents read crisp amber-on-black; **no brown anywhere**. Setting `DARK_THEME='classic'` instantly restores the **exact** original dark mode.
- **Ship after merge:** OTA — tag `Release-Lane: ota`. (Revert, if ever needed, is also a one-line OTA: `DARK_THEME → 'classic'`.)

#### IMP-019 · Round 2 — "Rich & alive" ember hero + premium polish (owner review 2026-06-13: v1 too plain)   ·   Status: ⬜ → ✅ (code done; owner screenshot review required before OTA)
- **Why:** Owner reviewed v1 and it reads **plain / not premium**. Diagnosed in code: `EmberGlow` ([`src/art.js:168`](src/art.js#L168)) is just **one flat amber radial blob** (breathe 0.38→0.56) + **5 tiny 1–2px specks** that rise ~30px with a `duration:1` hard reset. No hot core, no structure, no layering — the visual equivalent of a box-shadow. Owner picked the **"rich & alive"** direction. Everything below stays behind `DARK_THEME='v2'`, OTA, classic byte-for-byte intact.
- **Approach (decided by Opus — do not re-litigate the structure; intensities tune on-device):**
  1. **Layered hot-core bloom with flicker:** replace the single `emberBloom` radial with a **stack of radials** on the focal center — a small intense **hot core** (`#fff7ea`→`#fde68a`, ~r 35–45, peak opacity ~0.85) → amber mid (`#f59e0b`) → transparent outer (~r 135). Drive **two bloom layers** with breathe loops at **different durations** (e.g. ~2600ms & ~3300ms) + phase offset so it **flickers organically** instead of pulsing uniformly.
  2. **Coal-bed pooled glow:** add a wide, low, soft amber radial pooled toward the **bottom** of the hero box (center ~y 165 of 300, flattened/elliptical), gently flickering — the "bed of coals" the embers rise from. This gives the composition a base instead of a floating blob.
  3. **Real embers (replace the 5 specks):** **~14–18** embers, each a **soft glowing point** — render as small **Svg circles with their own radial-gradient halo** (bright center → transparent) so they glow on both iOS+Android (not solid `View` dots). Behaviors: rise over **60–120px** with a **horizontal sine sway**, **varied sizes** (1–3.5px cores), **staggered start delays** (no synchronized loop; offset each spark's initial value or add a random pre-delay so there's no mass teleport/`duration:1` snap), smooth fade-in → fade-out. Include **2–3 brighter "hero" embers** (near-white `#fff7ea` cores). Cluster them rising from the coal-bed, fanning slightly outward.
  4. **Light the streak number (night-v2 only):** in `HomeScreen`, give the big streak number a warm amber **text glow** when `dark && DARK_THEME==='v2'` (e.g. `textShadowColor:'rgba(245,158,11,0.55)'`, `textShadowRadius:16`, offset 0) so it reads as **lit by the embers**. Light + classic-night unchanged.
  5. **Card craft / premium lift (night-v2 only):** give cards a **barely-there top-lit sheen** — a faint vertical `LinearGradient` surface (top a hair lighter than `#0e0e10` → pure-ish at bottom) **or** a 1px top-edge highlight — so cards feel crafted, not flat fills (the trick premium dark UIs use). Keep it subtle (AMOLED restraint); apply via the `Card` component with a night-v2 branch.
- **Keep:** focal point y≈80; flag/revert; `PALETTES.night` + `NightSky` byte-for-byte; `~16` particles max with `useNativeDriver` (perf). Don't touch light or classic-night.
- **TDD:** visual — keep `__tests__/theme/darkTheme.test.js` green. If a pure helper is extracted (e.g. an ember-config generator), unit-test it; otherwise N/A.
- **Steps:**
  - [x] 1. Rebuild `EmberGlow`: layered hot-core bloom (flicker) + coal-bed glow + ~16 glowing Svg embers (sway, stagger, hero embers).
  - [x] 2. Add the night-v2 streak-number text glow in `HomeScreen`.
  - [x] 3. Add the night-v2 card sheen (Card component branch).
  - [x] 4. `npm test` green (154 passed, 20 suites — unchanged count; no new unit tests, changes are visual).
- **Commit:** `feat(theme): richer ember hero (hot-core flicker + coal bed + drifting embers) + night-v2 number glow & card sheen`
- **Acceptance (owner screenshots, OLED):** the dark hero feels **alive and premium** — a flickering warm core over a bed of coals with embers rising & swaying, the streak number softly lit, cards subtly lifted — clearly in the same premium league as light mode. `DARK_THEME='classic'` still restores classic exactly.
- **Do NOT ship until owner screenshot-approves.** Then OTA (`Release-Lane: ota`).

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

_2026-06-13 — IMP-019 Round 2 COMPLETE (code) — Rebuilt `EmberGlow` in `src/art.js` with full "rich & alive" treatment: (1) **layered hot-core bloom** — two out-of-phase breathe loops (`breatheA` 2600ms outer amber blob; `breatheB` 3300ms white→amber hot core starting at value 0.5 so they flicker independently); (2) **coal-bed elliptical glow** (`Ellipse cx=150 cy=185 rx=110 ry=40`, gentle 4500ms flicker via `coalV`) gives the composition a warm base to rise from; (3) **16 glowing `EmberParticle`s** replacing the 5 solid dots — each is an `AView` wrapper + `Svg` `Circle` with its own `RadialGradient` halo (coreColor → outerColor → transparent), rises 62–105px over 2800–4600ms, sways ±6–19px with sine-like `swayV` loop, staggered via a one-time `Animated.delay(delay)` before the perpetual rise loop so no mass-teleport sync; 3 hero embers use near-white `#fff7ea` cores. (4) **Streak number amber text glow** in `HomeScreen.js` (`numberGlow`: `textShadowColor rgba(245,158,11,0.55)`, `textShadowRadius 16`, offset 0) applied only when `isNightV2`. (5) **Card sheen** in `src/ui.js`: nightV2 cards get `overflow:'hidden'` + a `LinearGradient` overlay (`rgba(255,255,255,0.06)` → transparent, top 50%) for a barely-there top-lit lift. `DARK_THEME='classic'` still reverts to exact classic; `PALETTES.night`+`NightSky` byte-for-byte intact. `npm test` → **154 passed, 20 suites** (unchanged). **⚠️ NOT yet shipped — owner screenshot review on OLED required** before tagging `Release-Lane: ota`. Revert any time: `DARK_THEME='classic'` + OTA._

_2026-06-13 (Opus, planning) — IMP-019 dark mode reviewed by owner → **v1 too plain / not premium**; scoped **Round 2 "rich & alive"** (no code written by Opus). Diagnosis from code: `EmberGlow` is one flat amber radial blob + 5 tiny 1–2px specks (with a `duration:1` hard reset) — no hot core, no structure, no layering, so it reads dim. Owner picked the **rich & alive** direction. Round-2 spec (inline under the IMP-019 task block): layered hot-core bloom + coal-bed + 16 glowing Svg embers + lit number + card sheen. All behind `DARK_THEME='v2'`, OTA, classic intact._

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
