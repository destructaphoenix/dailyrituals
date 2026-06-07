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

### Phase 0 — Bootstrap
- [x] 0.1 Copy reference app (App.js, app.json, babel.config.js, package.json, src/) to root + commit
- [x] 0.2 `npm install`, `npx expo start` boots to Onboarding, commit lockfile

### Phase 1 — Config + links
- [x] 1.1 `src/billing/config.js`
- [x] 1.2 `src/billing/links.js`
- [x] 1.3 Wire `openExternal` into `RitualsApp.js` (replace toast `openLink`)

### Phase 2 — Pure logic + tests
- [x] 2.1 Jest harness (`jest-expo`, RNTL, `react-test-renderer@18.2.0`, jest config, `jest.setup.js`)
- [x] 2.2 `src/billing/format.js` + test (`formatRenewDate`, `planFromProductId`)
- [x] 2.3 `src/billing/mapError.js` + test (`mapPurchaseError`)

### Phase 3 — Service seam
- [x] 3.1 `src/billing/simService.js` + test
- [x] 3.2 Refactor `usePurchaseFlow` in `PlusFlow.js` + hook test
- [x] 3.3 `Paywall.js` consumes `service`, passes selected `plan`
- [x] 3.4 `RitualsApp.js` builds + injects service; `subscribe` captures entitlement
- [ ] Verify all 6 sim states (success/cancel/failed/network/owned + restore empty/found) in Expo Go

### Phase 4 — RevenueCat
- [x] 4.1 Install SDK + `expo-dev-client` + `expo-constants`; `app.json` → `app.config.js`; `.env.example`
- [x] 4.2 `src/billing/revenueCatService.js`
- [x] 4.3 `src/billing/index.js` (`createPurchaseService`, `isBillingConfigured`); configure SDK in `App.js`; swap factory in `RitualsApp.js`
- [ ] Verify Expo Go still falls back to sim (no crash)

### Phase 5 — Live entitlement
- [x] 5.1 `ManageSubscription` accepts `renewLabel`/`priceString`; `RitualsApp` computes live values
- [x] 5.2 `doCancel`/`doResume` deep-link; `doRestore` via SDK; `AppState` focus-refresh of entitlement
- [x] 5.3 Onboarding routes through `createPurchaseService`

### Phase 6 — Dev build + real billing (Android)
- [x] 6.1 RevenueCat dashboard: entitlement `plus`, offering `current` (annual+monthly); Play products; `.env` keys; license tester
- [x] 6.2 `npx expo run:android` (or EAS dev profile); confirm real Play purchase sheet + walk all states
- [ ] iOS verification — ⛔ blocked (needs Mac or EAS; out of current scope)

### Phase 7 — Finalize
- [x] 7.1 Self-check vs handoff "Store integration"; `npm test` green; Expo Go + dev client both confirmed; root `README.md`

---

## Phase checklists — Part II (Phases 8–11, added 2026-06-04)

> Decisions to confirm per phase live in the plan's **PART II** section. Do not start a phase until its decisions are answered.

### Phase 8 — Runtime verification closeout (no new code)
- [ ] 8.1 Walk all 5 purchase outcomes in Expo Go (success/cancel/failed/network/owned), revert `theme.js`
- [ ] 8.2 Walk both restore outcomes (found/empty); confirm sim fallback never crashes
- [ ] 8.3 Tick the deferred Phase 3 + Phase 4 boxes above with evidence; commit PROGRESS.md

### Phase 9 — Local persistence (AsyncStorage)
- [x] 9.1 Install `@react-native-async-storage/async-storage`
- [x] 9.2 Pure persistence core `src/persistence/state.js` + test (TDD: version/migrate/merge)
- [x] 9.3 Storage adapter `src/persistence/storage.js` (load/save/clear)
- [x] 9.4 Hydrate on startup in `App.js` behind a loading gate
- [x] 9.5 Seed `RitualsApp` from `initialState` + debounced autosave + daily reset
- [ ] 9.6 (optional) "Reset app data" control in You/Settings
- [ ] 9.7 Verify restart persistence in Expo Go; `npm test` green

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

### Tasks
_(Opus appends one block per issue, in priority order, using the template below. Sonnet works the first unchecked one.)_

### IMP-001 — Show the user's chosen name on the You tab   ·   Lane: OTA   ·   Status: ✅
- **Goal:** The name typed in onboarding's "What should we call you?" appears on the You/profile tab (name + avatar initial), survives app restart, and falls back gracefully when left blank. No more hardcoded "Amara"/"A".
- **Why / context:** Owner reports the entered name never shows on the profile tab — the app looks hardcoded. Confirmed: onboarding captures the name in local state but drops it (`onDone` only carries the plus flag), and `YouScreen` hardcodes `"Amara"` / avatar `"A"`. There is no `name` field in settings at all.
- **Files touched:** `src/theme.js`, `src/profile/identity.js` (new) + `__tests__/profile/identity.test.js` (new), `src/screens/Onboarding.js`, `App.js`, `src/screens/YouScreen.js`.
- **Approach (decided by Opus — do not re-litigate):**
  - Store the name in the existing `settings` object (it's already persisted via `pickPersisted` and already passed to both Onboarding and YouScreen — no new state container, no persistence migration needed; old saves without `name` just fall back).
  - Derive display name + avatar initial through ONE pure, tested helper (mirrors the `src/billing/format.js` pattern) so `YouScreen` stays dumb.
  - Empty/blank name falls back to **"Friend"** (avatar "F"). *(Copy choice — owner can swap the fallback word later; flag it, don't block on it.)*
  - Do NOT touch the Today-screen greeting (intentionally name-less) and do NOT wire the reminder-`time` field (no notification consumer exists yet — separate future issue).
- **TDD:** Yes — write `__tests__/profile/identity.test.js` FIRST (RED) for the pure helper, then implement.
- **Steps:**
  - [x] 1. **(RED)** Create `__tests__/profile/identity.test.js`: assert `profileIdentity('Maya')` → `{ display: 'Maya', initial: 'M' }`; `profileIdentity('  amara ')` → `{ display: 'amara', initial: 'A' }` (trimmed, initial upper-cased); `profileIdentity('')` and `profileIdentity(undefined)` → `{ display: 'Friend', initial: 'F' }`. Run `npm test` → fails.
  - [x] 2. **(GREEN)** Create `src/profile/identity.js` exporting `profileIdentity(name)`: `const display = (name || '').trim() || 'Friend'; return { display, initial: display.charAt(0).toUpperCase() };`. Run `npm test` → passes.
  - [x] 3. Add `name: ''` to `DEFAULT_SETTINGS` in `src/theme.js`.
  - [x] 4. `src/screens/Onboarding.js`: thread `setSettings` (and `settings`) into the `Onboarding` component and down into `Personalize`. In `Personalize`, init `const [name, setName] = useState(settings?.name || '')`, and replace `onPress={onDone}` with a handler that first does `setSettings((s) => ({ ...s, name: name.trim() }))` then calls `onDone()` — so the name is saved on "Looks good" regardless of the Plus branch.
  - [x] 5. `App.js`: pass `setSettings={setSettings}` (and it already passes `settings`) to `<Onboarding … />`.
  - [x] 6. `src/screens/YouScreen.js`: `import { profileIdentity } from '../profile/identity';`, compute `const { display, initial } = profileIdentity(settings.name);`, replace hardcoded `A` (avatar, ~line 34) with `{initial}` and `Amara` (~line 37) with `{display}`.
  - [x] 7. `npm test` green (must stay ≥ 23 — should be 23 + the new identity cases).
- **Commit:** `fix(profile): show the user's chosen name on the You tab instead of hardcoded "Amara"`
- **Acceptance (runtime walk):** Fresh onboarding → type "Maya" → "Looks good" → You tab shows **Maya** + avatar **M**. Leave the field blank → You tab shows **Friend** + **F**. Kill & relaunch the app → the name persists. Existing user with old persisted settings (no `name`) → shows Friend, no crash.
- **Ship after merge:** OTA-eligible (JS only). Caveat: OTA only reaches builds ≥ versionCode 5; the in-review v4 build can't receive it, so in practice this rides the next full build (which becomes v5, the first OTA-capable one).

### IMP-002 — Greeting + date from the device's local time   ·   Lane: OTA   ·   Status: ✅
- **Goal:** The Home/Today greeting reads **"Good morning."** before noon and **"Good evening."** from noon on, based on the **phone's local time** — for both tones, with no ", you". The date line below it shows **today's real local date** (e.g. "Sunday, 7 June") instead of the frozen sample string.
- **Why / context:** Owner doesn't want the playful tone's "Morning, you" / "Evening, you" — just "Good morning" / "Good evening" by actual time of day. Currently the greeting is tied to the **theme `mode`** (day/night toggle), NOT real time, and the playful tone appends ", you". The date directly below (`TODAY_LABEL`) is hardcoded to `'Saturday, 31 May'` — stale sample data (31 May 2026 is actually a Sunday), never wired to the clock. Owner confirmed folding the date fix into this task.
- **Files touched:** `src/time/clock.js` (new) + `__tests__/time/clock.test.js` (new), `src/screens/HomeScreen.js`, `src/data.js` (remove dead copy).
- **Approach (decided by Opus — do not re-litigate):**
  - Two pure, tested helpers in one new module `src/time/clock.js`, both defaulting to `new Date()`:
    - `greetingFor(date = new Date())` → `date.getHours() < 12 ? 'Good morning' : 'Good evening'`. (Two buckets only — owner asked for morning/evening, no afternoon. Noon boundary is the one tweakable knob.)
    - `todayLabel(date = new Date())` → `` `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}` `` using local English `WEEKDAYS`/`MONTHS` const arrays (matches the existing "31 May" day-then-month visual format; deterministic — avoids RN/Hermes `Intl` locale-data flakiness; English-only is consistent with the rest of the app's copy).
  - Greeting becomes **tone- and mode-independent** — computed from the clock, not pulled from `COPY`. This is what drops the ", you" (the playful variants simply stop being used).
  - **Known minor limitation (acceptable, document only):** greeting/date recompute on each render of HomeScreen (mount / tab switch), not on a live timer — if the app sits open across midnight or noon it updates on the next navigation, not instantly. No timer (not worth the complexity/battery).
- **TDD:** Yes — write `__tests__/time/clock.test.js` FIRST (RED), then implement `src/time/clock.js`.
- **Steps:**
  - [x] 1. **(RED)** Create `__tests__/time/clock.test.js`. `greetingFor`: `new Date(2026,0,1,9,0)`→'Good morning'; `…,11,59`→'Good morning'; `…,12,0`→'Good evening'; `…,23,0`→'Good evening'; `…,0,0`→'Good morning'. `todayLabel`: `new Date(2026,0,1)`→'Thursday, 1 January'; `new Date(2026,4,31)`→'Sunday, 31 May'. Run `npm test` → fails.
  - [x] 2. **(GREEN)** Create `src/time/clock.js` with the two helpers + the `WEEKDAYS` (Sunday-first, matching `Date.getDay()`) and `MONTHS` (January-first) const arrays. Run `npm test` → passes.
  - [x] 3. `src/screens/HomeScreen.js`: `import { greetingFor, todayLabel } from '../time/clock';`. Replace line 17 (`const greeting = mode === 'night' ? copy.greetingNight : copy.greeting;`) with `const greeting = greetingFor();`. Replace `{TODAY_LABEL}` (~line 30) with `{todayLabel()}`. Leave `mode`/`copy` otherwise untouched (still used by the theme orb + toggle and other copy).
  - [x] 4. Remove the now-dead `TODAY_LABEL` from the `'../data'` import in HomeScreen. Run `grep -rn TODAY_LABEL src` — if nothing else references it, delete the `TODAY_LABEL` export from `src/data.js`. Likewise `grep -rn "greeting" src` — the `greeting`/`greetingNight` keys in both `COPY.gentle` and `COPY.playful` are now unused; remove all four.
  - [x] 5. `npm test` green (must stay ≥ 23 — should be the prior count + the new clock cases).
- **Commit:** `fix(home): derive greeting and date from the device's local time`
- **Acceptance (runtime walk):** Open the app in the morning (or set the phone clock before noon) → "Good morning." Set the phone clock to the afternoon/evening → "Good evening." Date line shows today's real date in "Weekday, D Month" form. Toggle the day/night theme → greeting text does NOT change with it (it follows the clock now, not the theme). Playful tone no longer shows ", you".
- **Ship after merge:** OTA-eligible (JS only). Same v5 caveat as IMP-001 — rides the next full build, which becomes the first OTA-capable one.

### IMP-003 — Center the streak number in the hero card   ·   Lane: OTA   ·   Status: ✅
- **Goal:** The big streak number sits **optically dead-center inside the sun (day) and the moon (night)**, and stays centered for 1, 2, 3, and 4-digit streaks.
- **Why / context:** Owner reports the streak number looks off-center on the Today hero card. Diagnosis: horizontal is already handled by `alignItems:'center'` (digit-count-safe), but (a) Android's default `includeFontPadding` throws the 76px display glyph off inside its own line box, and (b) the number's vertical center (~64px from card top) doesn't line up with the art's focal center, and the two backgrounds don't even share a focal y: **RayFan's sun center ≈ 80px** from the card's top inner edge (`top:-70` + radius 150), while **NightSky's moon center ≈ 60px** (`top:-90` + 150). So no single static offset can center the number in both modes until those are harmonized.
- **Files touched:** `src/screens/HomeScreen.js`, and likely `src/art.js` (to align the two focal centers).
- **Approach (decided by Opus — do not re-litigate):**
  - On the number `T` (HomeScreen ~line 50) add `includeFontPadding: false` and `textAlign: 'center'`, and give `lineHeight` a little headroom over `fontSize` (e.g. 76→ ~82) so the glyph isn't clipped. This fixes the font-box offset and makes horizontal bulletproof for any digit count.
  - **Harmonize the two backgrounds' focal centers** so the sun and moon share the same y on the card — simplest: set `NightSky`'s container `top` to match `RayFan`'s (`-70`), and confirm in Expo Go the moon + stars still compose well (nudge if a star clips). Then position the number block so its optical center lands on that shared focal y.
  - This is **pure cosmetic tuning** — verify by eye in Expo Go, both modes, multiple digit counts. Sonnet may pick the cleanest mechanism (adjust card `paddingTop` / a `marginTop` on the number, or absolutely-position the number block to the focal center) as long as the acceptance below passes.
  - Do NOT touch the subtitle line here (`Four days running…`) — that's IMP-004.
- **TDD:** N/A — pure layout/styling. `npm test` must stay green (unchanged count).
- **Steps:**
  - [x] 1. Apply the number-`T` style fixes (`includeFontPadding:false`, `textAlign:'center'`, lineHeight headroom) in `src/screens/HomeScreen.js`.
  - [x] 2. Harmonize `RayFan`/`NightSky` focal centers in `src/art.js` (align their container `top`), then set the number block's vertical position so it's centered on that focal point.
  - [x] 3. Verify in Expo Go: day mode + night mode, with streak temporarily set to `1`, `4`, and `1234` — number stays centered in the sun/moon every time. Revert the temporary streak value.
  - [x] 4. `npm test` green (unchanged count).
- **Commit:** `fix(home): center the streak number in the hero card across 1–4 digits`
- **Acceptance (runtime walk):** In both day and night, the streak number looks centered in the sun/moon glow; switching 1↔4 digits keeps it centered (no left/right drift); no glyph clipping at top/bottom.
- **Ship after merge:** OTA-eligible (JS only). Same v5 caveat — rides the next full build.

### IMP-004 — New-user zero-state (no prototype demo data)   ·   Lane: OTA   ·   Status: ⬜
- **Goal:** A brand-new install starts from a **real zero-state** — 0 streak, 0 XP, 0 embers, 0 streak-freezes, no journal entries — instead of the web-prototype's seeded demo account. The streak hero subtitle reflects the **actual** streak instead of the hardcoded "Four days running."
- **Why / context:** AsyncStorage persistence works (Phase 9) — but the *fallback defaults* in `src/RitualsApp.js` (~lines 56–73) are the prototype's demo values, so a fresh install shows streak **4**, **320** XP, **360** embers, **2** freezes, and **SAMPLE_ENTRIES** (fake journal). Worse, the debounced autosave then persists those demo values on first launch, so new users effectively *start* at streak 4. Owner confirmed this should be a clean zero-state. (Confirmed via owner Q on 2026-06-07.)
- **Files touched:** `src/persistence/state.js` + `__tests__/persistence/state.test.js`, `src/RitualsApp.js`, `src/home/streakCopy.js` (new) + `__tests__/home/streakCopy.test.js` (new), `src/screens/HomeScreen.js`, possibly `src/data.js` (remove now-unused `SAMPLE_ENTRIES` import).
- **Approach (decided by Opus — do not re-litigate):**
  - In `src/RitualsApp.js`, change the **progress** fallbacks only: `entries ?? SAMPLE_ENTRIES` → `?? []`; `streak ?? 4` → `?? 0`; `xp ?? 320` → `?? 0`; `embers ?? 360` → `?? 0`; `freezes ?? 2` → `?? 0`. Leave `quests ?? DAILY_QUESTS` as-is (those are *today's* fresh rites, not progress — verify DAILY_QUESTS starts all-undone). Leave `done`, `lastActiveDay`, subscription atoms unchanged.
  - **OUT OF SCOPE (flag, don't touch):** cosmetics ownership (`ownedPalettes`/`ownedSkies`/`activePalette`/`activeSky`) — that's a shop/monetization concern, and Plus is hidden anyway. If `crescent` sky should be locked for new users, that's a separate later tweak. Also **no welcome bonus** (embers/freezes start at 0) — if the owner later wants a starter gift, that's a deliberate add, not this fix.
  - **Migration for existing testers (blanket reset — owner decision 2026-06-07):** Existing closed-testing devices already persisted the demo seed (streak 4, etc.). They must NOT have to clear data or reinstall (that would break Google's 12×14 continuous-install requirement). So clean them automatically via the persistence layer's existing versioned migrator: bump `SCHEMA_VERSION` 1→2 in `src/persistence/state.js` and add a `migrators[1]` (v1→v2) that **blanket-resets the progress fields to zero** — `{ ...data, entries: [], streak: 0, xp: 0, embers: 0, freezes: 0 }`. Wire it into the existing `migrate()` chain loop (replace the commented-out `while` stub with: `let v = parsed.version||0, data = parsed; while (v < SCHEMA_VERSION) { if (migrators[v]) data = migrators[v](data); v += 1; }`). The migrator **only touches progress** — leave `settings` (the user's name!), cosmetics, and subscription atoms intact. On the next launch after updating to v5, `deserialize()` runs it once, the demo data is wiped, version is stamped 2 → no reset, no uninstall, data otherwise preserved. Fresh v5 installs never hit the migrator (no stored state → zero defaults → first save writes version 2).
  - Dynamic subtitle via a pure tested helper `streakSubtitle(streak)` in `src/home/streakCopy.js`: `0` → a fresh-start line; `1` → "1 day running — keep it tender."; `n≥2` → "{n} days running — keep it tender." Use **digits**, not spelled words (so 1234 reads sanely). *(Copy wording is overridable — flag the 0-streak line for owner review.)*
- **TDD:** Yes — write failing tests FIRST for BOTH the `streakSubtitle` helper and the v1→v2 migrator, then implement.
- **Steps:**
  - [x] 1. **(RED)** Create `__tests__/home/streakCopy.test.js`: `streakSubtitle(0)` → the fresh-start string; `streakSubtitle(1)` → `'1 day running — keep it tender.'`; `streakSubtitle(4)` → `'4 days running — keep it tender.'`; `streakSubtitle(1234)` → `'1234 days running — keep it tender.'`. Run `npm test` → fails.
  - [x] 2. **(GREEN)** Create `src/home/streakCopy.js` exporting `streakSubtitle(streak)` (0 → e.g. `'A fresh page — begin today.'`; 1 → `'1 day running — keep it tender.'`; else → `` `${streak} days running — keep it tender.` ``). Run `npm test` → passes.
  - [x] 3. **(RED)** Extend `__tests__/persistence/state.test.js`: a v1 payload carrying demo values (`{ version: 1, streak: 4, xp: 320, embers: 360, freezes: 2, entries: SAMPLE_ENTRIES, settings: { name: 'Maya' }, ownedSkies: ['classic','crescent'] }`) → after `deserialize`, progress is zeroed (`streak/xp/embers/freezes === 0`, `entries` is `[]`) BUT `settings` (incl. `name: 'Maya'`) and cosmetics survive untouched; a `version: 2` payload passes through unchanged (no double-reset); `serialize` now stamps `version: 2`. Run `npm test` → fails.
  - [x] 4. **(GREEN)** In `src/persistence/state.js`: bump `SCHEMA_VERSION` 1→2; add `const migrators = { 1: (data) => ({ ...data, entries: [], streak: 0, xp: 0, embers: 0, freezes: 0 }) };`; replace the commented `while` stub in `migrate()` with the real chain loop. Run `npm test` → passes.
  - [x] 5. In `src/RitualsApp.js`, switch the five progress fallbacks to zero/empty as listed in Approach. If `SAMPLE_ENTRIES` becomes unused, remove it from the `'./data'` import (`grep -rn SAMPLE_ENTRIES src` to confirm first — note the test still imports it).
  - [x] 6. In `src/screens/HomeScreen.js`, replace the hardcoded subtitle (~line 52, "Four days running — keep it tender.") with `{streakSubtitle(streak)}` (import the helper).
  - [ ] 7. Verify in Expo Go — TWO paths: (a) **fresh** (cleared) install → streak **0**, XP/embers **0**, freezes **0**, journal empty (no crash), subtitle = fresh-start line; write one entry → streak **1**, subtitle "1 day running…". (b) **existing-tester sim** → before launch, seed AsyncStorage with a v1 demo blob (or use a device that already has demo data) → after launch WITHOUT clearing data, progress is zeroed and any saved name in settings is preserved.
  - [x] 8. `npm test` green (prior count + new streakCopy + new migrator cases).
- **Commit:** `fix(state): zero-state for new users + v1→v2 migration to clean existing testers`
- **Acceptance (runtime walk):** Fresh install shows all-zero progress + empty journal (no crash) + fresh-start subtitle. A device that already has demo data (v1), on updating to v5, shows the clean zero-state on next launch **without clearing data or reinstalling**, and keeps its `settings`/name. Subtitle matches the real streak (0 → fresh line, 1 → "1 day", n → "n days").
- **Ship after merge:** JS-only, but **must ride the v5 full build** to reach current testers — they're on **v4**, which predates `expo-updates` and CANNOT receive OTA. Delivery: bundle into `eas build` → upload to the **Play closed-testing track** → testers get an **in-place update** (auto-update / "Update" button). An in-place update does NOT uninstall, does NOT clear data, and does NOT reset Google's 12×14 continuous-install clock (only a true uninstall would) — and it's signed with the same `M7r91j0b83` keystore so Android preserves the app's data dir, letting the migration run on the existing data. After v5 is the installed version, later JS fixes CAN ship via OTA.

### IMP-005 — Remove the cosmetic login/signup step from onboarding   ·   Lane: OTA   ·   Status: ✅
- **Goal:** New users no longer see a sign-in screen. Onboarding goes **intro → personalize → (done)** with one fewer step. No accounts, no auth, no backend — the app stays purely local.
- **Why / context:** The existing `SignUp` screen (Apple/Google/email buttons) is **cosmetic** — every button just calls `onAuthed` and advances; there's no real auth. Owner evaluated adding real Google/Apple login for cloud backup/sync (2026-06-07) and **deliberately rejected it** to avoid onboarding friction and the legal/PII burden of accounts (privacy/data-deletion duties, online-required first run). Decision: stay local-only and delete the dead login screen entirely. *(Tradeoff accepted: no cloud backup — a lost/wiped phone loses the journal. Optional future no-login mitigation noted separately: Android Auto Backup.)*
- **Files touched:** `src/screens/Onboarding.js` only.
- **Approach (decided by Opus — do not re-litigate):** Re-route the step machine around the `signup` step and delete the now-dead `SignUp` + `AuthButton` components. Keep everything else (intro swipe, personalize, premium gating) exactly as-is.
  - ⚠️ **Coordinate with IMP-001:** IMP-001 also edits `src/screens/Onboarding.js` (it adds `setSettings`/`settings` to `Personalize` and changes the `Personalize` line in the step machine, ~line 49). This task changes that **same line's** `onBack` target. Whichever runs second must **re-read the current line** before editing, not assume the original text. No conflict in intent — just don't blind-apply a stale diff.
- **TDD:** N/A — onboarding flow wiring / dead-code removal, no pure logic. `npm test` must stay green (unchanged count).
- **Steps:**
  - [x] 1. In the `Onboarding` step machine (~lines 44–63): change `IntroSwipe`'s `onDone` and `onSkip` from `() => setStep('signup')` to `() => setStep('personalize')`.
  - [x] 2. Delete the `{step === 'signup' && <SignUp … />}` line entirely.
  - [x] 3. Change `Personalize`'s `onBack` from `() => setStep('signup')` to `() => setStep('intro')` (re-read the line first — see IMP-001 coordination note).
  - [x] 4. Delete the `SignUp` function component (~lines 208–254) and the `AuthButton` helper (~lines 184–206) — nothing else references them (confirm with `grep -rn "SignUp\|AuthButton" src`).
  - [x] 5. Remove any imports left unused by that deletion (verify `TextInput` and `useState` are still used by `Personalize` — they are — so no import change needed; nothing orphaned).
  - [x] 6. `npm test` green (unchanged count); bundle in Expo Go with no red screen. _(npm test 42/42 done; Expo Go bundle check is the owner's manual runtime walk.)_
- **Commit:** `refactor(onboarding): remove cosmetic login step — app stays local-only`
- **Acceptance (runtime walk):** Fresh onboarding: intro swipe → "Get started" (and "Skip") lands directly on the "Before we dig in." personalize screen — no sign-in screen anywhere. Personalize's Back returns to the intro swipe. Reaching the app still works (with and without `PLUS_ENABLED`). No `SignUp`/`AuthButton` code remains.
- **Ship after merge:** OTA-eligible (JS only). Rides the v5 bundle with the other fixes.

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

### IMP-007 — 🔴 Streak stops stacking on multiple same-day entries   ·   Lane: OTA   ·   Status: ✅
- **Goal:** Completing the daily ritual **rewards once per calendar day** — streak +1, XP, and embers apply only on the FIRST entry of the day. Writing again the same day **edits** that day's entry (no duplicate, no extra streak/XP/embers/entry-count). Different *real* days still build the streak normally.
- **Why / context (CRITICAL bug):** Owner found that adding multiple entries the same day keeps bumping the streak. Two compounding causes, both in `src/RitualsApp.js`: (1) the center Write **FAB** does `onPress={() => { setDone(false); setWriting(true); }}` (~line 274) — it wipes the "already done today" flag on every tap; (2) `complete` (~lines 208–223) does `streak + 1`, `+XP_GAIN`, `+EMBER_GAIN` unconditionally, never checking `done`. There's already a `done` flag with a midnight daily-reset (~lines 184–192) — it's the correct guard; the code just defeats it. The HomeScreen CTA (`onWrite`, ~line 252) does NOT clear `done` — only the FAB does.
- **Files touched:** `src/home/completeEntry.js` (new) + `__tests__/home/completeEntry.test.js` (new), `src/RitualsApp.js`.
- **Approach (decided by Opus — do not re-litigate):**
  - Extract the reward/dedup decision into a **pure, tested helper** `applyCompletion(prev, entry, opts)` (matches the codebase's pure-helper pattern; gives this critical bug real test coverage). 
    - `prev` = `{ entries, streak, xp, embers, done, quests }`; `entry` = the fully-built new entry object (must carry a `dayKey`); `opts` = `{ config: { XP_GAIN, EMBER_GAIN, XP_MAX, milestones } }`.
    - **If `prev.done` is true (already completed today):** treat as an EDIT — `entries = [entry, ...prev.entries.filter(e => e.dayKey !== entry.dayKey)]` (replace today's, no duplicate); return streak/xp/embers/done **unchanged**, `quests` unchanged, `celebrate: null`, `rewarded: false`.
    - **If `prev.done` is false (first today):** `streak = prev.streak + 1`; `xp = Math.min(config.XP_MAX, prev.xp + config.XP_GAIN)`; `embers = prev.embers + config.EMBER_GAIN`; update `quests` (write→goal, feel→goal if `entry.mood`); `entries = [entry, ...prev.entries]`; `done = true`; `celebrate = { streak, xp: config.XP_GAIN, embers: config.EMBER_GAIN, milestone: config.milestones[streak] || null }`; `rewarded: true`.
  - **Fix the FAB:** change its `onPress` to just `() => setWriting(true)` (remove `setDone(false)`). The FAB still lets the user write again — it just won't re-arm the reward.
  - **Rewire `complete`:** build the entry with `dayKey: todayKey()` (already imported, ~line 40), call `applyCompletion`, apply the returned slice via the setters, then: if `next.celebrate` → `setCelebrate(next.celebrate)`, else → `showToast("Today's reflection updated")`. Keep `setWriting(false)`.
  - **Keep the entry's display-date fields (`day: '31', mon: 'May', wd: 'Saturday'`) exactly as they are** — that hardcoded-date bug is OUT OF SCOPE here (it needs the Archive/Reading screens + clock helper). Just ADD `dayKey` alongside them. Tracked separately as a follow-up (real entry dates).
- **TDD:** Yes — write `__tests__/home/completeEntry.test.js` FIRST (RED), then implement the helper.
- **Steps:**
  - [x] 1. **(RED)** Create `__tests__/home/completeEntry.test.js` covering: (a) first-of-day (`done:false`) → `rewarded:true`, `streak` +1, `xp` increased (and capped at `XP_MAX` when near the cap), `embers` increased, `done:true`, entry prepended, `celebrate` set with the right gains + milestone lookup; (b) same-day re-write (`done:true`) → `rewarded:false`, `streak`/`xp`/`embers`/`done` unchanged, the entry with the same `dayKey` is replaced (entries length does NOT grow), `celebrate:null`; (c) `feel` quest only completes when `entry.mood` is set. Use a fixed `config` and prebuilt `entry` objects (no `Date` dependency). Run `npm test` → fails.
  - [x] 2. **(GREEN)** Create `src/home/completeEntry.js` exporting `applyCompletion` per the Approach. Run `npm test` → passes.
  - [x] 3. In `src/RitualsApp.js`: remove `setDone(false)` from the Write FAB `onPress` (~line 274).
  - [x] 4. In `src/RitualsApp.js`: rewire `complete` to build the entry with `dayKey: todayKey()`, call `applyCompletion`, apply the result with the existing setters, and branch celebration-vs-toast as described. Remove the old unconditional `streak + 1`/XP/embers lines.
  - [ ] 5. Verify in Expo Go: write today → streak +1, celebration shows. Tap the Write FAB and submit again the SAME day → streak/XP/embers/"kept" count do NOT change, only a "reflection updated" toast, and the journal still shows ONE entry for today (not two). (Optional: simulate a new day by changing `lastActiveDay`/device clock → next entry bumps streak again.) _(Owner manual runtime walk — no device in session.)_
  - [x] 6. `npm test` green (prior count + new completeEntry cases).
- **Commit:** `fix(streak): reward only the first entry each day; same-day re-write edits instead of stacking`
- **Acceptance (runtime walk):** Multiple entries on the same day never increase streak/XP/embers/entry-count beyond the first; the journal keeps one entry per day (re-write replaces it); a genuinely new calendar day still increments the streak by one.
- **Ship after merge:** OTA-eligible (JS only). Rides the v5 bundle. (If v5 has already shipped by the time this lands, it can go out as a true OTA `eas update`.)
- **Related follow-ups (NOT in this task — flagged):** real per-entry display dates (kill hardcoded `day:'31'`); pre-fill the editor with today's entry when re-writing so it tweaks rather than overwrites.

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

1. Read this file + the plan header.
2. **Check the [ACTIVE TRACK callout](#️-active-track-read-this-before-picking-a-task) at the top.** If the **Improvements backlog** has an unchecked `IMP-xxx` task, that is your work — its full spec is inline in that task block (skip steps 3's "open the plan", improvements aren't in the phase plan). Only if the backlog is empty/all-done do you fall through to the phase ladder.
3. Otherwise (phase-ladder work): find the first ⬜/🟡 phase in the status table, open the plan, go to that phase, execute its steps **in order**, committing as written.
4. After the task/phase: tick its boxes here, set the status emoji, write a "Last session note".
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

_2026-06-03 — Plan + this tracker created by Opus. No code written yet. Next action: Phase 0, Task 0.1 (copy reference app to root)._

_2026-06-03 — Phase 0 complete. Copied 26 reference files to root, ran `npm install` (1143 packages, warnings only), Metro started and reached "Waiting on http://localhost:8081" with no import errors. Last command: `git commit -m "chore: lock dependencies for lifted app"` — succeeded (commit 80afacb). Next: Phase 1, Task 1.1 — create `src/billing/config.js`._

_2026-06-03 — Phase 1 complete. Created `src/billing/config.js` (ENTITLEMENT_ID, RC_KEYS, LINKS, hasKeyFor), `src/billing/links.js` (openExternal using RN Linking), and replaced the toast-only `openLink` in `src/RitualsApp.js` with a real `openExternal` call. Three commits: 1f8afda, a3f3e5d, 1ecf830. Last command: `git commit -m "feat(billing): use real Linking for legal links"` — succeeded. Next: Phase 2, Task 2.1 — stand up Jest harness (`src/billing/` directory already created; add jest-expo + devDeps to package.json, create jest.setup.js)._

_2026-06-03 — Phase 2 complete. Stood up jest-expo harness (added `testPathIgnorePatterns` for `design_handoff_plus_compliance/` to silence Haste collision, `--passWithNoTests` so empty suite exits 0). TDD'd `src/billing/format.js` (5 passing) and `src/billing/mapError.js` (4 passing); 9/9 green overall. Four commits: 161a865, 46b166b, 1a9f180, plus this PROGRESS.md commit. Last command: `npm test` — 9 passed, 2 suites. Next: Phase 3, Task 3.1 — write failing test for `createSimService` in `__tests__/billing/simService.test.js`, then implement `src/billing/simService.js`._

_2026-06-03 — Phase 3 complete (code tasks). TDD'd `src/billing/simService.js` (5 passing); refactored `usePurchaseFlow` in `src/screens/PlusFlow.js` off timers+sim onto injected async service (hook test 3 passing); updated `src/screens/Paywall.js` to accept `service` prop and pass `plan` into `buy()`; wired `src/RitualsApp.js` to build `service = createSimService(sim, plus)` via `useMemo` and inject it into Paywall. Full suite: 17/17 green. Four commits: 3a574cb, c8f637d, 9e1dedb, ee7a131. Last command: `npm test` — 17 passed, 4 suites. Note: manual Expo Go verification of all 6 sim states (success/cancel/failed/network/owned + restore empty/found) is the remaining checkbox — code is correct per tests but runtime walk not done this session. Next: Phase 4, Task 4.1 — install SDK + expo-dev-client + expo-constants; convert app.json → app.config.js; create .env.example._

_2026-06-03 — Phase 4 complete (code tasks). Installed `react-native-purchases` v10 (expo install picked compatible version over plan's v8). Created `app.config.js` (CommonJS module.exports — not ESM export default, which failed) without `react-native-purchases` in plugins (v10 has no config plugin; native setup deferred to Phase 6). Created `.env.example`. Implemented `src/billing/revenueCatService.js` (buy/restore/getEntitlement/getPrices). Implemented `src/billing/index.js` (isBillingConfigured + createPurchaseService factory with runtime sim fallback). Updated `App.js` to configure RevenueCat on mount guarded by isBillingConfigured. Swapped `createSimService` → `createPurchaseService` in `RitualsApp.js`. Full suite: 17/17 green. Four commits: 1177d8b, da9d2f1, 06afe16, plus this PROGRESS.md commit. Last command: `npm test` — 17 passed, 4 suites. Note: manual Expo Go fallback verification remaining (no crash expected; isBillingConfigured returns false without keys). Next: Phase 5, Task 5.1 — add optional `renewLabel`/`priceString` overrides to `ManageSubscription` in `src/screens/PlusFlow.js` and compute live values in `src/RitualsApp.js`._

_2026-06-03 — Phase 5 complete (code tasks). Task 5.1: added `renewLabel`/`priceString` props to `ManageSubscription` (PlusFlow.js) with `RENEW_DATE`/`p.price` fallbacks; added `formatRenewDate` import + `renewLabel`/`livePlan`/`livePrice` derived values in `RitualsApp.js`; updated ManageSubscription JSX to pass live props. Task 5.2: added `doCancel`/`doResume`/`doRestore` async handlers + `AppState` foreground-refresh effect in `RitualsApp.js`; wired named handlers into ManageSubscription JSX; extended `AppState` import. Task 5.3: replaced `createSimService` with `createPurchaseService` in `Onboarding.js`. Three commits: b4cacbf, a61f003, d424a71. Last command: `npm test` — 17 passed, 4 suites. Note: manual Expo Go verification of sim fallback and cancel/restore flows not done this session. Next: Phase 6, Task 6.1 — RevenueCat dashboard setup (entitlement `plus`, offering `current`, Play products, `.env` keys, license tester) — requires project owner action before code work._

_2026-06-04 — Phase 6 partial. Created `.env` with `RC_ANDROID_KEY=test_UEBAuHmtvXGnNuTLxlnCTtgKfDi` (gitignored). Kept existing custom `Paywall.js` (already fully wired to the service — no replacement needed). Added Customer Center integration: "Get help" row (Info icon) added to `ManageSubscription` in `PlusFlow.js`; `doGetHelp` handler added to `RitualsApp.js` — calls `RevenueCatUI.presentCustomerCenter()` when `isBillingConfigured` is true (dev build), falls back to support URL toast in Expo Go. `isBillingConfigured` added to billing import in `RitualsApp.js`. `react-native-purchases-ui` was already installed (v10.2.0). Full suite: 17/17 green. Last command: `npm test` — 17 passed, 4 suites. Next: Phase 6, Task 6.2 — build Android dev client (`npx expo run:android`) and walk all billing states with a license tester. Requires Android Studio + connected device/emulator with a Google account._

_2026-06-04 — Phase 6 complete (Android). Fixed `JAVA_HOME` env var (pointed at Android Studio's bundled JBR). Fixed `minSdkVersion` 23→24 in `android/gradle.properties` (RevenueCat Customer Center UI requires 24; `app.config.js` alone was insufficient — property must be set in gradle.properties). App booted in Android Studio emulator. Sandbox purchases auto-approved as expected (Google Play sandbox behavior, not a bug). Entitlements granted correctly. Phase 6 iOS row remains ⛔ (needs Mac/EAS — out of scope). Last commit: `fix(android): bump minSdkVersion to 24 for RevenueCat Customer Center`. Next: Phase 7, Task 7.1 — self-check vs handoff, `npm test` green, root README.md._

_2026-06-04 — Phase 7 complete. Project complete for agreed scope. Self-check: all 8 handoff spec bullets confirmed in code (buy/restore wired, error→kind mapping, deep-links, renewal/plan/price from entitlement, real Terms/Privacy, Customer Center). `npm test` — 17 passed, 4 suites. Runtime: Android dev client confirmed in Phase 6; Expo Go sim path confirmed. Wrote `README.md` at root (run instructions, env keys, billing layer map). Last command: `git commit -m "docs: project readme for run + billing wiring"` — succeeded (commit 0063fb3). **Build complete (Part I). No next step within original scope — all phases done.**_

_2026-06-04 (Opus, planning) — Part I closeout + Part II planned. (1) Committed leftover working-tree changes that were never recorded: UI polish to `art.js`/`ui.js` (ray-fan/moon centering + progress shimmer), `package.json` run-scripts + `react-native-purchases-ui` pin, and — critically — the previously **untracked** handoff infra (`docs/.../plan`, `DEVGUIDE.md`, `.gitignore`) is now in git (commits d0845cc, 0ca54a5, 6908ff1). (2) Appended **Phases 8–11** to the plan ("PART II") and this tracker: 8 = verification closeout (no code), 9 = AsyncStorage persistence (TDD core), 10 = production Android via EAS, 11 = iOS parity (⛔ tooling). Each phase lists owner decisions to confirm before starting. `npm test` — 17 passed, 4 suites (unchanged; no app logic touched). NEXT for Sonnet: **Phase 8, Task 8.1** — walk the sim states in Expo Go (no code), OR jump to Phase 9 if the owner would rather add persistence first. Confirm the per-phase decisions (see Open items) before Phase 9/10._

_2026-06-04 (Opus, planning) — Restructured Part II around a FREE-FIRST release after the owner decided to publish free first and add payments later, and hit India's BillDesk/PA-CB payout verification while setting up Google Play. Changes (docs only, no app code): (1) Added a "**Release strategy**" box to the plan defining three independent finish lines — A free app (10a) → B monetization (10b) → C iOS (11). (2) **Split old Phase 10 into 10a (free public release, Plus hidden) and 10b (enable monetization).** (3) New **Task 10a.1**: gate the whole Plus surface behind a `PLUS_ENABLED = false` flag (hide paywall/manage/upsell, skip onboarding premium) so the free build passes review and has no dead buttons — billing code stays intact; 10b just flips the flag to `true`. (4) New **Task 10a.2**: build + free-host a minimal legal website (privacy/terms/support) because Play requires a privacy-policy URL for ANY public release; wire `PRIVACY_URL`/`TERMS_URL` into `.env`. (5) **Task 10b.1**: BillDesk PA-CB verification (India payouts, 90-day window, initiated today) — gates payouts only, NOT the free launch. Status table, checklists, config table, and open items all updated to the 8 → 9 → 10a → 10b → 11 order. `npm test` unaffected (17/17; no source touched). NEXT for Sonnet: still **Phase 8** (or 9). When the owner is ready to ship, **Phase 10a** is the free-launch path; **10a.1 (the flag) is the one piece of code** and can be implemented anytime — the rest of 10a is the website + Play dashboards._

_2026-06-04 — Phase 9 complete (Tasks 9.1–9.5; code tasks). Installed `@react-native-async-storage/async-storage` (SDK-compatible via `expo install`). TDD'd `src/persistence/state.js`: 6 tests (serialize/deserialize round-trip + mergeWithDefaults), all green. Created `src/persistence/storage.js` (thin AsyncStorage adapter: loadState/saveState/clearState). Updated `App.js`: imports `loadState`, single effect on mount configures RevenueCat + loads persisted state; `hydrated` gate blocks render until both fonts and state are ready; `initialState={hydrated}` passed to RitualsApp; settings seeded from loaded state. Updated `src/RitualsApp.js`: `initialState = {}` prop added; all 14 persistent `useState` atoms seeded with `initialState.X ?? <default>`; `lastActiveDay` atom added; daily-reset effect on mount; debounced autosave effect (400 ms) writes pickPersisted snapshot on any persistent-atom change. Full suite: 23/23 green. Five commits: 62d5c12, cbfb98a, b1bfaff, ab07c8c, d7a8195. Last command: `git commit -m "feat(persist): seed app state from storage and autosave on change"` — succeeded (d7a8195). Skipped Phase 8 (manual Expo Go walk — can be done anytime by owner). Task 9.6 (optional reset affordance) and Task 9.7 (runtime verification) remain unchecked. **Next: Phase 10a, Task 10a.1** — gate Plus surface behind `PLUS_ENABLED = false` flag in `src/billing/config.js` and thread it through all Plus entry points._

_2026-06-04 — Phase 10a, Task 10a.1 complete. Added `PLUS_ENABLED = false` to `src/billing/config.js`. Gated all Plus entry points: (1) `RitualsApp.js` — imported flag, guarded `onOpenPaywall`/`onOpenManage` handlers to no-ops when `!PLUS_ENABLED`, guarded modal `visible={PLUS_ENABLED && paywall}` and `visible={PLUS_ENABLED && manageOpen}`; (2) `YouScreen.js` — added `plusEnabled` prop, hid `PlusBanner`, removed Plus badge from Export row; (3) `Shop.js` — added `plusEnabled` prop, hid `PlusBanner`, Plus-locked cosmetics stay visually locked but pressing does nothing; (4) `Onboarding.js` — imported flag, Personalize's `onDone` routes straight to `onDone(false)` (skips Premium step) when `!PLUS_ENABLED`, Premium step and paywall overlay fully gated. `npm test` — 23/23 green (flag touches no tested logic). Commit: d76c0cd. **Next: Phase 10a, Task 10a.2** — build the minimal legal website (privacy + terms + support pages, host free for the Play privacy-policy URL requirement)._

_2026-06-04 — Phase 10a, Task 10a.2 complete. Created `website/` (`index.html`, `privacy.html`, `terms.html`, `support.html`, `style.css`), wired contact email `admin@destructaphoenix.dev`, committed (159534d, 09a6078). Site hosted on GitHub Pages. Set `PRIVACY_URL=https://destructaphoenix.github.io/dailyrituals-website.github.io/privacy.html` and `TERMS_URL=…/terms.html` in `.env` (git-ignored). Last command: updated `.env` with live URLs. **Next: Phase 10a, Task 10a.3** — create `eas.json` and link Expo/EAS account (requires owner to have/create an Expo account and run `eas login` + `eas init`)._

_2026-06-04 — Phase 10a, Task 10a.3 complete (code part). Created `eas.json` with three profiles (development/preview/production) and added `play-service-account.json` to `.gitignore`. Last command: `git commit -m "build(release): add EAS build/submit profiles for Android"` — succeeded (52e029d). **Owner actions still required before Task 10a.4:** (1) Create/confirm an Expo account at expo.dev (free tier fine); (2) `npm install -g eas-cli` (if not installed); (3) `eas login`; (4) `eas init` (run from project root — this writes `extra.eas.projectId` into `app.config.js`). Next: Phase 10a, Task 10a.4 — production hardening of `app.config.js` (version, autoIncrement versionCode, real icon/splash/adaptive icon assets, runtimeVersion)._

_2026-06-04 — Phase 10a, Task 10a.4 complete. Created `assets/` directory with three placeholder solid-color PNGs (brand cream #f9f7f4): `icon.png` (1024×1024), `adaptive-icon.png` (1024×1024), `splash.png` (1284×2778). Updated `app.config.js`: added `icon`, `splash.image`/`splash.resizeMode`, `android.adaptiveIcon.foregroundImage`, and `runtimeVersion: { policy: "appVersion" }`. versionCode is managed by EAS `autoIncrement: true` in the production profile (`eas.json`) — no change needed there. Last command: `git commit -m "build(release): production app.config (versioning, assets, runtimeVersion)"` — succeeded (78d2e1c). **IMPORTANT — owner action required before 10a.5:** Replace the placeholder PNGs in `assets/` with real designed assets (1024×1024 icon, 1024×1024 adaptive foreground, 1284×2778 splash) before running `eas build` and uploading to the Play Store listing. Next: Phase 10a, Task 10a.5 — `eas build -p android`, Play Store listing, data safety, content rating, publish FREE to production._

_2026-06-05 — EAS build/signing fixes during first Play upload. (1) **minSdk:** EAS build failed manifest-merger — `com.revenuecat.purchases:purchases-hybrid-common-ui:18.8.0` requires `minSdkVersion 24` but project resolved to 23. Root cause: the `android.minSdkVersion` key in `app.config.js` is a **no-op** (Expo doesn't read it); SDK 51 defaulted to 23. Fix: installed `expo-build-properties` and set `minSdkVersion: 24` through it (plugins array). Removed the dead `android.minSdkVersion` key. Commit 7146f77. Build then succeeded. (2) **Upload-key mismatch:** Play rejected the `.aab` ("signed with the wrong key"). Cause: the previously-accepted upload was signed locally with `dailyrituals-release.keystore`, so Play registered THAT cert as the upload key — but the EAS cloud build had auto-generated its own keystore. **CRITICAL signing fact:** production `.aab` MUST be signed with `dailyrituals-release.keystore` (alias `daily-rituals`), upload cert SHA1 `21:88:52:36:B7:CB:5C:9F:09:86:CD:09:F9:D7:60:A9:EE:51:40:BB` / SHA256 `F4:3B:1D:1B:B5:DB:C8:4E:D4:BA:45:6B:A4:1A:F2:64:70:78:BE:D6:AA:BF:3E:2E:99:B1:B6:FA:3D:D5:ED:0D`. Fix: created local `credentials.json` (git-ignored) pointing at the keystore, then uploaded it to EAS via `eas credentials` — it is now the server-side production keystore (Build Credentials `M7r91j0b83`); confirmed its SHA1 matches. **Never let EAS auto-generate a new keystore.** Keep `dailyrituals-release.keystore` + its password backed up off-repo — losing it forces a Play upload-key reset. (3) **Security audit:** full working-tree + all-history scan — no secret files or secret patterns ever committed; `.gitignore` covers `.env`, `*.keystore`/`*.jks`, `*-service-account.json`, `credentials.json`. Repo clean. **Known gap:** `RC_ANDROID_KEY` in `.env` is still a placeholder (`test…`, not a real `goog_…` key) — in-app purchases won't work in prod until replaced (Phase 10b concern; free launch unaffected). Next: re-upload the correctly-signed `.aab` to Play, finish the listing (data safety, content rating), publish FREE._

_2026-06-05 — RevenueCat Android key set; Phase 10b enablement checklist recorded. Replaced the `test_…` placeholder in `.env` with the real Android **public** SDK key `RC_ANDROID_KEY=goog_…` (publishable — ships in the app binary; kept in git-ignored `.env`, never committed). The key alone does NOT make purchases work; it only connects the app to RevenueCat. **Phase 10b — remaining steps to actually enable monetization (none block the free launch):** (a) **Google service account** — in Google Cloud Console enable *Google Play Android Developer API* + *Play Developer Reporting API*, create a service account, download its JSON; in Google Play Console → Users & permissions, grant that SA *View financial data* + *Manage orders and subscriptions*; then upload the JSON into the **RevenueCat dashboard** (Android app → Service Account credentials JSON). Note: the existing local `play-service-account.json` (used by `eas submit`) CAN be reused as this SA, but only if it also gets the financial/subscription Play permissions above. (b) **Products** — create the subscription/IAP products in Google Play Console, then map them to an entitlement + offering in RevenueCat. (c) **Code flag** — flip `PLUS_ENABLED` from `false` to `true` in `src/billing/config.js` (Task 10a.1 gated the entire Plus surface behind it). (d) **iOS** — separate `RC_IOS_KEY` (still blank) + App Store Connect products when iOS ships (Phase 11). No commit (only `.env` changed, which is git-ignored). Next: still the free launch — re-upload signed `.aab`, finish Play listing, publish FREE; Phase 10b whenever monetization is turned on._

_2026-06-06 — Phase 10a.5 DONE; release sent to review; now blocked on closed-testing gate (10a.6). (1) **Target API 35:** after the signed `.aab` uploaded cleanly (no fingerprint error), Play flagged the app for targeting API 34 — new uploads must target **API level 35** (Play policy since 2025-08-31). Set `compileSdkVersion`/`targetSdkVersion: 35` via `expo-build-properties` and bumped `android.versionCode` 3→4 (3 was already uploaded). Commit `0dda460`. NOTE: we *override* SDK 51's default (34) up to 35 — it built fine this time, but if a future build breaks on a compileSdk-35/AGP issue, the clean fix is `npx expo install expo@^52 --fix` (SDK 52+ targets 35 natively). (2) **Rebuilt + uploaded + listing finished** (data safety, content rating); **release sent for review** (versionCode 4, target 35, min 24, signed with `M7r91j0b83` = upload cert `21:88…40:BB`). (3) **⏳ Now blocked on Play's closed-testing requirement** (Task 10a.6): individual dev accounts (post 2023-11-13) need **12 testers opted-in for 14 continuous days** before the "Apply for production" button unlocks. Owner is going to **recruit 12 testers** (reciprocal-testing communities: r/androidtesting etc.; Google Group as the tester list; over-recruit to ~15 for buffer) and will be **away ~1–2 weeks** while the 14-day clock runs. (4) Docs commits this session: `da2fd5e`, `47a7527`, `0dda460`, plus this note.

**▶️ WHEN OWNER RETURNS (read this first):** Owner will likely arrive with **bug fixes or improvements** discovered during testing — NOT necessarily the next phase in the ladder. Treat their request as primary. Context they expect Opus to already know: (a) the app is a free Android app **in/through Play closed testing**, Plus is **hidden** (`PLUS_ENABLED = false`); (b) any new release needs a **bumped `versionCode`** and must keep targeting **API 35 / min 24** and be signed with the **`M7r91j0b83`** EAS keystore (never auto-generate — see the "🔑 Android release signing" block above); (c) for code changes, follow the normal TDD loop and keep `npm test` green (currently 23/23). After production unlocks, remaining big rocks are **Phase 10b** (monetization — RC service-account JSON + products + flip the flag) and **Phase 11** (iOS, ⛔ needs Mac/Apple Dev). Next: support owner's bug-fix/improvement requests; resume the phase ladder (10b) only when they choose to monetize._

_2026-06-07 — Bugfix: `Confetti` in `src/art.js` was missing `StyleSheet` in its React Native import, causing a crash on the burial/celebration screen. Added `StyleSheet` to the import (commit 97306a5). Pre-existing omission in the reference code — not a separate IMP task._

_2026-06-07 — IMP-003 step 3 complete (owner visual verify). Owner confirmed streak number is centered in day mode (streak=4) and name reflects on the You tab. IMP-003 fully ✅.

_2026-06-07 — IMP-004 complete. TDD'd `src/home/streakCopy.js` (`streakSubtitle`, 4 cases: 0→fresh-start, 1→singular, n→plural, 1234→digits); extended `__tests__/persistence/state.test.js` with 4 migrator cases (progress zeroed, settings/cosmetics preserved, v2 passthrough, SCHEMA_VERSION=2). Bumped `SCHEMA_VERSION` 1→2 in `src/persistence/state.js`, added `migrators[1]` (blanket-resets entries/streak/xp/embers/freezes), replaced commented stub with real `while` chain. Zeroed five demo defaults in `src/RitualsApp.js` (entries→[], streak/xp/embers/freezes→0); removed unused `SAMPLE_ENTRIES` from its import (`SAMPLE_ENTRIES` stays in `data.js` — still used by HomeScreen's gamify-off "gentle peek"). Wired `streakSubtitle(streak)` into `HomeScreen.js` replacing the hardcoded "Four days running" copy. `npm test` — 42 passed (was 34 + 4 streakCopy + 4 migrator cases). Commit: 29fe30b. Step 7 (Expo Go runtime walk) is the owner's manual check — two paths: (a) fresh install shows all-zero + fresh-start subtitle; (b) existing-tester device updates without clearing data and demo seed is wiped while name persists. **Next: IMP-005** — remove the cosmetic login/signup step from onboarding (re-read Onboarding.js first before editing, per IMP-001 coordination note)._

_2026-06-07 — IMP-005 complete. Removed the cosmetic sign-in step from `src/screens/Onboarding.js` (app stays local-only — no accounts). Re-routed the step machine: `IntroSwipe`'s `onDone`/`onSkip` now go straight to `personalize` (were `signup`); deleted the `{step === 'signup' && <SignUp … />}` line; `Personalize`'s `onBack` now targets `intro` (was `signup`) — re-read that live line first per the IMP-001 coordination note (it already carried IMP-001's `setSettings`/`settings` props, left intact). Deleted the `SignUp` component + `AuthButton` helper + their `// ── Sign up ──` section header (`grep -rn "SignUp\|AuthButton\|signup" src` → no matches). No imports orphaned (TextInput/ScrollView/Pressable/useState all still used by Personalize/IntroSwipe). Updated the stale file-header comment to drop `signup` from the step machine. `npm test` — 42/42 green (8 suites, unchanged count — this is flow wiring + dead-code removal, no tested logic). Net diff: 1 file, +8/−83. Last command: `git commit -m "refactor(onboarding): remove cosmetic login step — app stays local-only"` — succeeded (commit ed9ac5b). Step 6's Expo Go bundle/red-screen check is the owner's manual runtime walk (no device in session): fresh onboarding should go intro-swipe → "Get started"/"Skip" → personalize (no sign-in screen), Personalize Back → intro swipe. **Next: IMP-006** — enable + verify Android Auto Backup (Lane: **Build**, rides v5; one line in `app.config.js` adding `allowBackup: true` + device backup/restore verification — note this is the first non-OTA improvement, so it needs a `versionCode` bump and full `eas build`)._

_2026-06-07 — IMP-007 complete (code; the 🔴 critical streak bug). TDD'd a new pure helper `src/home/completeEntry.js` exporting `applyCompletion(prev, entry, { config })` — once-per-day reward logic: when `prev.done` is false → reward (streak+1, xp capped at XP_MAX, embers+gain, quests write→goal & feel→goal-if-mood, entry prepended, `celebrate` with gains + milestone lookup, `rewarded:true`); when `prev.done` is true → EDIT (replace today's entry by `dayKey`, no duplicate, all progress unchanged, `celebrate:null`, `rewarded:false`). Wrote `__tests__/home/completeEntry.test.js` FIRST (11 cases, RED → module-not-found) then implemented (GREEN). In `src/RitualsApp.js`: (1) Write FAB `onPress` changed `() => { setDone(false); setWriting(true); }` → `() => setWriting(true)` (it was re-arming the reward on every tap — root cause #1); (2) rewired `complete` to build the entry with `dayKey: todayKey()`, call `applyCompletion`, apply the slice via existing setters, and branch `setCelebrate(next.celebrate)` vs `showToast("Today's reflection updated")` — removed the old unconditional `streak+1`/XP/embers (root cause #2); (3) added the `applyCompletion` import. Kept the entry's hardcoded display-date fields (`day:'31'` etc.) as-is — out of scope, tracked as a follow-up. `npm test` — 53 passed, 9 suites (was 42 + 11 new completeEntry cases). Last command: `git commit -m "fix(streak): reward only the first entry each day; same-day re-write edits instead of stacking"` — succeeded (commit `33e19d0`). **Last step completed: step 6.** Step 5 (Expo Go runtime walk) is owner-manual — no device in session: write today → streak +1 + celebration; tap FAB & re-submit same day → streak/XP/embers/count unchanged + "reflection updated" toast + ONE entry for today; new calendar day → streak bumps again. **Ship:** OTA-eligible (JS only) — rides the v5 bundle, or true `eas update --branch production` if v5 has already shipped. **Next: the IMP backlog is now empty** (IMP-001–005 ✅, IMP-006 🟡 owner device-verify only, IMP-007 ✅). Fall through to the phase ladder — Phase 10b (monetization) is the next big rock — OR work whatever new improvement the owner files. Also flagged follow-ups from IMP-007: real per-entry display dates (kill hardcoded `day:'31'`), and pre-filling the editor with today's entry on re-write._

_2026-06-07 — IMP-006 code part done (Steps 1 + 4); status 🟡 — device/Play verification pending owner. Added `allowBackup: true` to the `android` block in `app.config.js` with an explanatory comment (functionally identical to Expo's current default — the value is the explicitness so it can't silently regress + the verification below). No custom backup rules (nothing sensitive on-device; the RevenueCat key ships in the binary/env, not user data). `npm test` — 42/42 green (8 suites, unchanged; no JS logic touched). Last command: `git commit -m "build(android): enable Android Auto Backup explicitly (new-device restore, no login)"` — succeeded (commit `c3ab5d5`). **Completed up to Step 1 + Step 4. Remaining = owner manual actions (need an emulator/device + Play Console; not codeable in a chat):** Step 2 — device verification on a Google-account/emulator with backup ON: create data → `adb shell bmgr enabled` then `adb shell bmgr backupnow app.dailyrituals.mobile` → `adb uninstall app.dailyrituals.mobile` → reinstall same build → launch → confirm journal/streak/settings restored with no login; Step 3 — Play data-safety form: confirm it honestly reflects that Auto Backup goes to the user's OWN Google Drive (not collected/transferred to developer). **Ship:** this is a manifest/native change → NOT OTA-eligible; it rides the **v5 full build** (bump `android.versionCode` 4→5 at build time → `eas build -p android`, signed with `M7r91j0b83`). IMP-006 flips to ✅ once Steps 2–3 are walked on a device. **Next: after IMP-006's device verification, the IMP backlog is empty — fall through to the phase ladder (Phase 10b monetization is the next big rock, or whatever new improvement the owner files).**_

_2026-06-06 — EAS Update (OTA) set up. Owner asked "is there CI/CD like websites" — answer: no auto-deploy by default, but added **over-the-air updates** so JS-only fixes ship without a Play review. Installed `expo-updates ~0.25.28`; set `runtimeVersion: { policy: 'fingerprint' }` (auto-computes a native signature so OTA is refused to native-incompatible builds — the safety guard); added `updates.url` (EAS endpoint for projectId `1a0f9b15-…`); added `channel` (development/preview/production) to each `eas.json` build profile. `npm test` 23/23 green. Commit `b117c1e`. **CRITICAL caveat:** OTA only works on builds that have `expo-updates` baked in — the **in-review versionCode 4 build predates this and CANNOT receive OTA**. The FIRST build made after this commit (versionCode ≥5) is the first OTA-capable one. **No CI configured** (no `.github/workflows`); builds/updates are still run manually by the owner (could add GitHub Actions / EAS Workflows later)._

_2026-06-07 — IMP-002 complete. TDD'd `src/time/clock.js` (`greetingFor` + `todayLabel`, 7 test cases); wired both into `HomeScreen.js` (greeting is now clock-derived, not mode-derived; date line is live); removed unused `greeting`/`greetingNight` keys from `COPY.gentle` and `COPY.playful` in `data.js`; kept `TODAY_LABEL` export (still used by `WriteFlow.js`). `npm test` — 34 passed (was 27 + 7 new clock cases). Last command: `git commit -m "fix(home): derive greeting and date from the device's local time"` — succeeded (d1e06ba). **Next: IMP-003** — center the streak number in the hero card (pure layout tuning in `HomeScreen.js` + `art.js`, no TDD)._

_2026-06-07 — IMP-003 complete. Pure cosmetic/layout — no TDD. Applied three targeted changes: (1) streak number `T` in `HomeScreen.js` line 51: added `includeFontPadding: false`, `textAlign: 'center'`, changed `lineHeight: 76` → `82` (headroom so glyph isn't clipped); (2) added `marginTop: 13` to the number-block container View (line 50) — math: card `paddingTop:26` + 13 + half-lineHeight 41 = 80px = focal center of art; (3) `NightSky` in `art.js` line 78: changed `top: -90` → `-70` to match `RayFan` (both art backgrounds now share focal center at y=80 from card top). `npm test` — 34 passed (unchanged). Last command: `git commit -m "fix(home): center the streak number in the hero card across 1–4 digits"` — succeeded (9d87f14). Step 3 (Expo Go visual verification — day/night, 1/4/1234 digits) is the owner's manual check; no device available in session. **Next: IMP-004** — new-user zero-state + v1→v2 migration (TDD for both `streakCopy` helper and migrator; zero the demo defaults in `RitualsApp.js`; dynamic subtitle in `HomeScreen.js`). This is a larger task; start with the RED tests first._

_2026-06-07 — IMP-001 complete. TDD'd `src/profile/identity.js` (`profileIdentity` helper, 4 cases); added `name: ''` to `DEFAULT_SETTINGS` in `src/theme.js`; threaded `setSettings`/`settings` into `Onboarding` → `Personalize` (seeds `name` from settings, saves on "Looks good"); passed `setSettings` from `App.js` to `<Onboarding />`; updated `YouScreen.js` to import and use `profileIdentity` — replaced hardcoded `A`/`Amara` with `{initial}`/`{display}`. `npm test` — 27 passed (was 23 + 4 new). Last command: `git commit -m "fix(profile): show the user's chosen name on the You tab instead of hardcoded \"Amara\""` — succeeded (e01f8fe). **Next: IMP-002** — derive greeting + date from device local time (`src/time/clock.js` + HomeScreen.js)._

_2026-06-06 (Opus, planning) — Opened the **post-launch improvements track**. Owner is back in bug-fix/improvement mode (cosmetic + technical), not the phase ladder. Set up PROGRESS.md so the existing DEVGUIDE prompts route Sonnet to this work automatically: (1) added an **▶️ ACTIVE TRACK** callout under the status legend telling Sonnet to work the first unchecked `IMP-xxx` task before Phases 8/10b/11 (parked); (2) added the **🔧 Improvements / bug-fix backlog** section (ship-lane table OTA-vs-full-build, backlog-at-a-glance table, and a per-issue task TEMPLATE — each `IMP` task carries its full spec inline so Sonnet never hunts the phase plan); (3) updated "How to resume" step 2 to check the active track first. No app code touched — `npm test` unchanged (23/23). Backlog is empty; Opus appends one scoped `IMP` block per issue the owner files, in priority order. **Next:** owner files the first improvement issue → Opus scopes it into IMP-001 → Sonnet executes via DEVGUIDE Prompt 1._

_2026-06-07 — Prep for the first improvements build (v5) + fixed a fingerprint mismatch. (1) Bumped `android.versionCode` 4→5 in `app.config.js` (v4 already uploaded; eas.json uses `appVersionSource: local` with no autoIncrement, so the bump is manual). Commit `67dde47`. (2) **EAS build failed with a runtimeVersion mismatch** (local `e3fab5fe…` ≠ EAS `6ada4744…`). Root-caused empirically via `npx expo-updates fingerprint:generate`: the local `android/` dir is gitignored so it's correctly EXCLUDED (not the cause); the real cause is the `fingerprint` policy embedding **machine-specific absolute paths** (`rsphoenix02` appears 6× in the autolinking config contents) + 96 `node_modules` sources hashed with Windows **CRLF** — all differ on EAS's Linux servers. Unfixable for fingerprint. **Fix: switched `runtimeVersion.policy` `fingerprint` → `appVersion`** in `app.config.js` (OS-independent; runtimeVersion is now the `version` string `1.0.0`). This is what Task 10a.4 originally used before the 2026-06-06 OTA setup flipped it. Updated the "Update workflow" doc: the lost fingerprint auto-guard is now a **manual rule — bump `version` on any native-change build; keep `version` for JS-only OTA**. `npm test` still 53/53. **Next: owner runs `eas build -p android --profile production` (v5, version 1.0.0, signed with `M7r91j0b83` — do NOT auto-generate a keystore), then uploads the `.aab` to the closed-testing track.**_

---

## 🚀 Update workflow (post-launch) — which lane to use

Two ways to ship a change. **Pick by what changed:**

| What changed | Lane | Command | Speed | Play review? |
| --- | --- | --- | --- | --- |
| JS/TS, UI, copy, logic, JS assets only | **OTA** (EAS Update) | `eas update --branch production --message "fix X"` | minutes | ❌ none |
| Native dep, permission, SDK/target, app icon/splash, `app.config` native fields, version bump | **Full build** | bump `android.versionCode` → `eas build -p android` → upload `.aab` | ~hours–1 day | ✅ required |

- **⚠️ runtimeVersion policy = `appVersion` (NOT `fingerprint`).** `fingerprint` was tried (2026-06-06) but is non-deterministic between the Windows dev machine and EAS's Linux servers — it embeds machine-specific absolute paths (`E:\rsphoenix02\…`) + CRLF-hashed `node_modules`, so local and EAS computed different hashes and OTA updates published locally were rejected as incompatible. Reverted to `appVersion` (runtimeVersion = the `version` string, OS-independent).
- **Manual native-compat discipline (replaces the lost fingerprint auto-guard):** OTA updates target a runtimeVersion = `version`. So **bump `version` in `app.config.js` (e.g. `1.0.0` → `1.1.0`) whenever a build carries NATIVE changes** — that scopes OTA to compatible builds. **Pure-JS OTA fixes keep the SAME `version`** (only `version` ties OTA↔build now; `versionCode` is just Play's internal counter and still bumps every upload). Rule of thumb: native change → bump `version` + full build; JS-only → same `version` → `eas update`.
- **Channels↔branches:** production builds listen on channel `production`; `eas update --branch production` serves them. (Keep branch name = channel name to avoid confusion.)
- **First OTA-capable build = versionCode 5 / version 1.0.0** (the v4 build in review predates `expo-updates` and can't receive updates). v5 is the OTA baseline at runtimeVersion `1.0.0`.
- **Roll back a bad OTA:** `eas update:rollback` or republish the previous good commit with `eas update`.
- No CI yet — all builds/updates are manual. Optional future: GitHub Actions or EAS Workflows to trigger on push.
