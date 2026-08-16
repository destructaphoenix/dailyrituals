# Build log — archived detail

Completed detail moved out of [PROGRESS.md](../PROGRESS.md) to keep that file small (it is read in full at the start of every Sonnet chat). This is history — git is the full record. The one-line status of each item lives in the PROGRESS.md tables.

---

## Completed phase checklists

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


### Phase 9 — Local persistence (AsyncStorage)
- [x] 9.1 Install `@react-native-async-storage/async-storage`
- [x] 9.2 Pure persistence core `src/persistence/state.js` + test (TDD: version/migrate/merge)
- [x] 9.3 Storage adapter `src/persistence/storage.js` (load/save/clear)
- [x] 9.4 Hydrate on startup in `App.js` behind a loading gate
- [x] 9.5 Seed `RitualsApp` from `initialState` + debounced autosave + daily reset
- [x] 9.6 (optional) "Reset app data" control in You/Settings
- [ ] 9.7 Verify restart persistence in Expo Go; `npm test` green


---

## Completed improvement tasks (full detail)

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

### IMP-008 — Real zero-state finish (level + calendar + week strip + entry dates)   ·   Lane: OTA   ·   Status: ✅ (code done; owner runtime walk + ship pending)
- **Goal:** A new/low-activity user sees an honest profile: level reflects real XP (not a fake "Lv 3 · Contemplative"), the Archive calendar shows the user's *real* entries (empty for a fresh user, not the seeded demo grid), and journal entries are stamped with the real date (not "31 May / Saturday").
- **Why / context (owner report 2026-06-07):** Even after IMP-004's zero-state, the app still shows level 3, a pre-filled calendar, and 31-May dates. Investigated — three independent HARDCODED leftovers, all confirmed in code:
  1. **Level:** [`src/RitualsApp.js:38-39`](src/RitualsApp.js#L38-L39) `const LEVEL = 3; const LEVEL_NAME = 'Contemplative';` — passed to HomeScreen/YouScreen as `level`/`levelName`. NEVER derived from XP; there is **no level model anywhere** in the codebase. So it shows Lv 3 at any XP.
  2. **Calendar:** [`src/data.js:127-136`](src/data.js#L127-L136) `HEAT` is a hardcoded 35-cell fake mood/skull array; ArchiveScreen's `<Heat />` ([`src/screens/ArchiveScreen.js:32,65`](src/screens/ArchiveScreen.js#L65)) renders that constant, NOT `entries`. Same fake calendar for everyone.
  3. **Entry dates:** [`src/RitualsApp.js:210`](src/RitualsApp.js#L210) new entries built with `day:'31', mon:'May', wd:'Saturday'`; only `dayKey` is real. (This is the IMP-007 deferred follow-up.)
- **DESIGN RESOLVED (2026-06-07):** brainstormed → spec [`docs/superpowers/specs/2026-06-07-imp-008-real-zero-state-finish-design.md`](docs/superpowers/specs/2026-06-07-imp-008-real-zero-state-finish-design.md), planned → [`docs/superpowers/plans/2026-06-07-imp-008-real-zero-state-finish.md`](docs/superpowers/plans/2026-06-07-imp-008-real-zero-state-finish.md), implemented (8 TDD tasks). Owner decisions: (1) **XP-threshold levels** — uncapped XP, `levelFromXp(xp)` → `{level,name,into,toNext}`, names Waking→Keeper of Days (Lv1–7); bar is within-level (`into/toNext`, "Max" at top). (2) Calendar = **35-cell grid from real entries, neutral empties (no skulls)**. (3) **Week strip folded in** (owner chose to include it — same neutral treatment, last-7-days from entries). (4) Entry dates derived via `entryDateParts()` in `src/time/clock.js`. No migration needed (IMP-004 already empties entries).
- **Sequencing:** This is the **inaugural ship through the new release pipeline** (owner decision 2026-06-07) — see [`docs/superpowers/specs/2026-06-07-streamlined-release-pipeline-design.md`](docs/superpowers/specs/2026-06-07-streamlined-release-pipeline-design.md). Build the pipeline first; then brainstorm IMP-008's design; then implement + ship it as the first `Release-Lane: ota`.
- **Ship after merge:** OTA-eligible (all JS in `src/`). Reaches testers on v5+ only.


---

## Improvements backlog — archived task specs (IMP-009 – IMP-012)

_Full inline specs moved here once code-complete (one-line status stays in the PROGRESS.md backlog table). Runtime-walk / ship may still be pending — see the table + git for live status._

### IMP-010 — Onboarding shows only on the first ever launch   ·   Lane: OTA   ·   Status: ✅ (code; runtime walk + ship pending)
- **Goal:** First-run onboarding appears once (truly first open), never again on cold start.
- **Root cause:** `App.js` hardcoded `const [onboarded, setOnboarded] = useState(false)` and never restored it; `loadState()` hydrated settings but no onboarding flag, so every cold start re-onboarded.
- **Fix:** Persist an `onboarded` flag (added to `PERSISTED_KEYS`; `RitualsApp` autosave writes `onboarded: true` — it only mounts post-onboarding). On load, `App.js` skips onboarding when there is any persisted state **or** the explicit flag — so existing testers are NOT forced through onboarding again on update (no migration needed). Reset-all-data correctly returns to onboarding.
- **TDD:** RED→GREEN in `__tests__/persistence/state.test.js` (pickPersisted carries `onboarded`; round-trips serialize/deserialize).
- **Commit:** `fix(onboarding): show first-run only once (persist onboarded flag)`
- **Ship after merge:** OTA — touches `App.js` (JS entry, bundled) + `src/`. Confirm CI backstop treats `App.js` as JS (it is not a native file) before tagging `Release-Lane: ota`.

### IMP-011 — Kill the last hardcoded "31 May"   ·   Lane: OTA   ·   Status: ✅ (code; runtime walk + ship pending)
- **Goal:** The reflection (write) flow shows the device's real date, not "Saturday, 31 May".
- **Root cause:** IMP-008 killed the hardcoded date on Home/heatmap but `WriteFlow.js` still rendered `{copy.epitaph} {TODAY_LABEL}` (the `TODAY_LABEL = 'Saturday, 31 May'` constant in `data.js`).
- **Fix:** `WriteFlow.js` now uses `todayLabel()` from `src/time/clock.js` (same helper HomeScreen uses); deleted the dead `TODAY_LABEL` export from `data.js`.
- **TDD:** N/A — UI string swap onto the already-tested `todayLabel()` helper.
- **Commit:** `fix(write): use the device's real date in the reflection flow (kill 31 May)`
- **Ship after merge:** OTA (all `src/`).

### IMP-009 — Insights tab from real entries (kill hardcoded data)   ·   Lane: OTA   ·   Status: ✅ (code; runtime walk + ship pending)
- **Goal:** The Insights tab shows the user's **real** numbers — stats, mood mix, and weekly rhythm derived from their actual entries + streak — instead of the baked-in sample numbers. A user with no entries sees a clean empty state, not fake charts.
- **Why / context:** `src/screens/InsightsScreen.js` is fully hardcoded — top comment even says "Numbers are illustrative sample data." `STATS` (current streak 4, longest 21, days kept 47, this month 12), `MOOD_MIX`, and `RHYTHM` are module constants ([lines 11–31](src/screens/InsightsScreen.js#L11-L31)), and the component only receives `copy` — no real data is passed in. The subtitle "Saturdays win" is hardcoded too. Owner also just added a **delete/reset-data control on the You page**, which makes the empty state reachable in normal use — so it must look right at zero.
- **Data available (post IMP-007/008):** each entry carries `dayKey` ('YYYY-MM-DD'), `mood` (a label from `MOODS` in `src/data.js`, or absent if the user skipped mood), plus real date parts. `streak` (current) is a RitualsApp atom. `moodEmoji(label)` maps mood→emoji.
- **Files touched:** `src/insights/derive.js` (new) + `__tests__/insights/derive.test.js` (new), `src/screens/InsightsScreen.js`, `src/RitualsApp.js`.
- **Approach (decided by Opus — do not re-litigate):**
  - Put all the math in a **pure, tested helper** `deriveInsights(entries, currentStreak, now = new Date())` in `src/insights/derive.js` (mirrors the `completeEntry`/`clock` pure-helper pattern). It returns:
    - `empty` — `true` when there are no entries.
    - `stats` — `{ currentStreak, longestStreak, daysKept, thisMonth }`. `daysKept` = count of unique `dayKey`s. `thisMonth` = entries whose `dayKey.slice(0,7)` matches `now`'s local `YYYY-MM`. `longestStreak` = longest run of consecutive calendar days across the unique `dayKey`s, **guarded to be ≥ `currentStreak`**.
    - `moodMix` — `[{ m, n }]` counting entries per mood (skip entries with no mood), sorted by `n` desc, only `n > 0`.
    - `rhythm` — 7 buckets Mon→Sun, labels `['M','T','W','T','F','S','S']`, counting entries by weekday.
    - `peakWeekday` — full name (e.g. `'Saturday'`) of the busiest weekday, or `null` if there's no data/peak.
  - **Date parsing (avoid the UTC off-by-one trap):** parse a `dayKey` by splitting parts and building a *local* date — `const [y,m,d] = key.split('-').map(Number); new Date(y, m-1, d)` — for weekday (`getDay()`, Mon-first index `(getDay()+6)%7`). For the consecutive-day check use `Date.UTC(y,m-1,d)` diffs (`=== 86400000`) so DST can't break it.
  - `InsightsScreen` becomes a dumb renderer: take new props `entries` + `streak`, call `deriveInsights`, and render from its result. Delete the hardcoded `STATS`/`MOOD_MIX`/`RHYTHM` constants. Guard the bar scaling against divide-by-zero (`Math.max(1, max)`). Make the rhythm subtitle dynamic: `peakWeekday ? `${peakWeekday}s win` : ''` (hidden when null). If `moodMix` is empty (entries but no moods logged), show a small "No moods logged yet." note instead of bars.
  - **Empty state:** when `data.empty`, render the header + a single calm card ("No insights yet — write your first reflection and the shape of your days will appear here.") and skip the stat/mood/rhythm cards.
  - In `src/RitualsApp.js`, pass the data in: `case 'insights': return <InsightsScreen copy={copy} entries={entries} streak={streak} />;`.
  - **Known nuance (document, don't fix):** `longestStreak` is derived from consecutive entry-days, so it ignores streaks that were bridged by a streak-freeze/candle; the `≥ currentStreak` guard keeps it from ever showing *less* than the live streak. Good enough.
- **TDD:** Yes — write `__tests__/insights/derive.test.js` FIRST (RED), then implement.
- **Steps:**
  - [x] 1. **(RED)** Create `__tests__/insights/derive.test.js` with a fixed `now` and explicit `dayKey`s: (a) `[]` → `empty:true`, all stats 0; (b) a multi-day set spanning two months → `daysKept` = unique days, `thisMonth` counts only `now`'s month, `longestStreak` = the longest consecutive run; (c) `longestStreak` never less than a larger `currentStreak` arg; (d) `moodMix` counts/sorts desc and excludes mood-less entries; (e) `rhythm` buckets land on the right Mon-first weekday and `peakWeekday` names the busiest day. Run `npm test` → fails.
  - [x] 2. **(GREEN)** Implement `src/insights/derive.js` per the Approach. Run `npm test` → passes.
  - [x] 3. Rewrite `src/screens/InsightsScreen.js` to consume `deriveInsights(entries, streak)`; delete the hardcoded constants; add the empty state, the dynamic peak subtitle, the mood-less note, and divide-by-zero guards.
  - [x] 4. In `src/RitualsApp.js`, pass `entries={entries} streak={streak}` to `<InsightsScreen … />`.
  - [ ] 5. Verify in Expo Go: with a fresh/reset account the Insights tab shows the empty state (no fake 4/21/47/12); write entries across a few days → stats, mood bars, and weekday rhythm reflect them; the rhythm subtitle names the real busiest day.
  - [x] 6. `npm test` green (prior count + new derive cases).
- **Commit:** `fix(insights): derive stats, mood mix and rhythm from real entries`
- **Acceptance (runtime walk):** Insights shows real current/longest streak, days kept, this-month count, a mood mix that matches what was logged, and a weekday rhythm from actual entry days; an empty/reset account shows the empty state with no fabricated numbers.
- **Ship after merge:** OTA-eligible (all JS in `src/`) — ships via the OTA release lane like IMP-008. Reaches testers on v5+ only.

### IMP-012 — Achievements + Home "Keepsakes" start fresh (kill hardcoded progress)   ·   Lane: OTA   ·   Status: ✅ (code; runtime walk + ship pending)
- **Goal:** The Achievements screen and the Home "Keepsakes" medal strip show the user's **real** progress derived from their entries + streak. A brand-new / reset user sees every achievement at 0/​goal and every medal unlit — no fabricated "47/100 days", "Streak Society 4/30", or pre-earned First Light/Seven Suns/Honest Heart.
- **Why / context:** Both surfaces read baked-in sample numbers from `src/data.js`:
  - `ACHIEVEMENTS` ([data.js:75-84](src/data.js#L75-L84)) has hardcoded `cur` values (firstlight 1, seven 7, honest 12, moonlit 3, society 4, keeper 47). `Achievements.js` renders `a.cur / a.goal`, the "X of N earned" count, and the "Earned" badge straight from these — so a fresh user sees 3 earned and partial progress on the rest.
  - `BADGES` ([data.js:56-64](src/data.js#L56-L64)) has hardcoded `earned: true/false`. `HomeScreen.js` ([HomeScreen.js:139-149](src/screens/HomeScreen.js#L139-L149)) lights medals from `b.earned`, so First Light / Seven Suns / Honest Heart show lit on day one.
  - `RitualsApp.js` ([RitualsApp.js:241](src/RitualsApp.js#L241)) computes the You-tab `badgesEarned` keepsakes count from `ACHIEVEMENTS.filter(b => b.cur >= b.goal).length` — also fake. This is the same family of zero-state bugs as IMP-008/009; the new "Reset all data" control (Task 9.6) makes the empty state reachable in normal use, so it must read right at zero.
- **Data available:** `deriveInsights(entries, currentStreak, now)` (from IMP-009, [src/insights/derive.js](src/insights/derive.js)) already yields `stats.longestStreak`, `stats.daysKept`, and `moodMix` (sum of `n` = entries with a mood logged = "feelings named"). Reuse it — do not re-derive streak/day math.
- **Files touched:** `src/profile/achievements.js` (new) + `__tests__/profile/achievements.test.js` (new), `src/screens/Achievements.js`, `src/screens/HomeScreen.js`, `src/RitualsApp.js`, `src/data.js`.
- **Approach (decided by Opus — do not re-litigate):**
  - Create a pure helper `src/profile/achievements.js` exporting `ACHIEVEMENT_DEFS` (static metadata: `{ id, label, desc, icon, goal, stat }` where `stat ∈ 'daysKept' | 'longestStreak' | 'moodsLogged'`) and `deriveAchievements(entries, currentStreak, now = new Date())`. It calls `deriveInsights(...)` once, computes `moodsLogged = sum(moodMix.n)`, then maps `ACHIEVEMENT_DEFS` → `{ ...def, cur: Math.min(statValue, goal), done: statValue >= goal }`. Keep the SAME six achievements + their current ids/labels/descs/icons/goals — only the source of `cur` changes (lift the metadata out of `data.js`'s `ACHIEVEMENTS` into `ACHIEVEMENT_DEFS`). **Stat mapping:** firstlight→daysKept, seven→longestStreak, honest→moodsLogged, moonlit→daysKept, society→longestStreak, keeper→daysKept.
  - `Achievements.js` becomes a dumb renderer: new props `entries` + `streak`; call `deriveAchievements`; render the list, the "X of N earned" count, and per-row `cur/goal` + Earned badge from the result. Drop the `import { ACHIEVEMENTS }`.
  - `RitualsApp.js`: compute `const achievements = deriveAchievements(entries, streak)` (memoize), pass `badgesEarned={achievements.filter(a => a.done).length}` and thread `entries`/`streak` into `<Achievements … />`. Drop the `ACHIEVEMENTS`/`BADGES` imports once unused.
  - **Home "Keepsakes" strip:** keep the existing 5-medal strip (same icons/labels) but make each medal's lit/unlit state real. Drive it off `deriveAchievements` — map the five Home medals to achievements by id where they line up (firstlight, seven, honest) and to a stat threshold for the two Home-only ones (`steadfast`/"30 Days" → `longestStreak >= 30`; `fullcircle`/"Full Circle" → `daysKept >= 100`). Simplest clean form: extend `ACHIEVEMENT_DEFS` (or add a small `KEEPSAKE_DEFS`) so the strip is derived the same way, then delete the hardcoded `BADGES` constant. `HomeScreen` already receives `entries` + `streak`; compute the strip from those. **Do not change which five medals appear or their order** — only their earned state.
  - **No empty-state card needed** — the achievements list and medal strip are self-explanatory at 0 (all unlit, progress bars at 0/goal). Just make sure the "X of N earned" reads "0 of 6 earned" for a fresh user.
  - **Guard:** `ThinBar pct={(cur / goal) * 100}` is safe (goal ≥ 1 for all defs), but keep `cur` clamped via `Math.min` so a bar never exceeds 100%.
  - **Known nuance (document, don't fix):** like IMP-009, `longestStreak` ignores freeze-bridged streaks; `moodsLogged` counts entries-with-a-mood (one per day kept, since same-day re-writes replace), so "Name 25 feelings" tracks distinct mood-logged days — good enough.
- **TDD:** Yes — write `__tests__/profile/achievements.test.js` FIRST (RED), then implement.
- **Steps:**
  - [x] 1. **(RED)** `__tests__/profile/achievements.test.js`: (a) `[]` + streak 0 → every `cur` 0, every `done` false, earned-count 0; (b) a fixed entry set → each achievement's `cur` equals the right clamped stat (daysKept / longestStreak / moodsLogged) and `done` flips exactly at goal; (c) `cur` never exceeds `goal`; (d) `moodsLogged` ignores mood-less entries. Run `npm test` → fails (module not found).
  - [x] 2. **(GREEN)** Implement `src/profile/achievements.js` per the Approach (reusing `deriveInsights`). Run `npm test` → passes.
  - [x] 3. Rewrite `src/screens/Achievements.js` to consume `deriveAchievements(entries, streak)`; remove the `ACHIEVEMENTS` import.
  - [x] 4. Update `src/screens/HomeScreen.js` to derive the Keepsakes strip's earned states (same 5 medals); remove the `BADGES` import.
  - [x] 5. `src/RitualsApp.js`: derive `badgesEarned` from `deriveAchievements`, thread `entries`/`streak` into `<Achievements />`; drop now-unused `ACHIEVEMENTS`/`BADGES` imports. Delete the dead `ACHIEVEMENTS`/`BADGES` constants from `src/data.js` (grep first — `BADGES` is also used by HomeScreen until step 4; `STREAK_MILESTONES`/`MOOD_EMOJI` etc. stay).
  - [ ] 6. Verify in Expo Go: fresh/reset account → "0 of 6 earned", all medals unlit, all bars at 0/goal; write entries / build a streak → the right achievements progress and light up; the You-tab keepsakes count matches.
  - [x] 7. `npm test` green (prior count + new achievements cases; currently 103).
- **Commit:** `fix(achievements): derive progress + keepsakes from real entries (kill hardcoded values)`
- **Acceptance (runtime walk):** A new/reset user sees zero earned achievements, unlit keepsake medals, and 0/goal progress everywhere; progress and earned states grow only from real entries + streak; the You-tab keepsakes count matches the earned count.
- **Ship after merge:** OTA-eligible (all JS in `src/`) — ships via the OTA release lane like IMP-008/009.

---

## Improvements backlog — archived task specs (IMP-006, IMP-013 – IMP-019)

_Full inline specs moved here once code-complete (one-line status stays in the PROGRESS.md backlog table). Runtime-walk / ship may still be pending — see the table + git for live status._

### IMP-006 — Enable + verify Android Auto Backup (new-device restore, no login)   ·   Lane: Build (rides v5)   ·   Status: ✅ VERIFIED on device 2026-07-30 (uninstall → reinstall auto-restored with no login; restored data was ≤24h stale, which is the documented Auto Backup contract, not a defect — see PROGRESS.md "auto-restore is silent" finding). Play data-safety still to confirm.
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

### IMP-017 — Greeting: Good morning / afternoon / evening by the user's local time   ·   Lane: OTA   ·   Status: ✅ (shipped OTA 2026-06-13; runtime walk pending)
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

### IMP-018 — Today's reflection is editable (today only), pre-filled, with a reset toggle   ·   Lane: OTA   ·   Status: ✅ (shipped OTA 2026-06-13; runtime walk pending)
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

### IMP-019 — Premium dark-mode redesign: "Embers in the Dark" (true-black AMOLED, behind a revert flag)   ·   Lane: OTA   ·   Status: ✅ (shipped OTA 2026-06-13; Round 4 NightRays hero owner-approved + promoted)
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

#### IMP-019 · Round 2 — "Rich & alive" ember hero — ❌ ABANDONED (owner review 2026-06-13)
- Built (commit `44bff07`) but owner reviewed it and it **derailed — too busy and still not premium**. Direction dropped; `DARK_THEME` reverted to `'classic'` (commit `f3ca0e7`). The Round-2 code (layered bloom, ~16 embers, number glow, card sheen) still lives in `src/art.js` / `HomeScreen` / `Card` behind the now-inactive `'v2'` flag. **Reuse the good parts** (the **streak-number text glow** + the **night-v2 card sheen** + the hot-core glow technique) for Round 3 below; the ember-only hero itself is superseded by the crescent.

#### IMP-019 · Round 3 — Crescent accent — ❌ ABANDONED (owner review 2026-06-13)
- Built `NightCrescent`, but the "crescent" rendered as a **fat gibbous ball clipped off the card's right edge**: the occluder disc (`cx=284,r=36`) only bit the right edge of the lit disc (`cx=228,r=38`), leaving a ~58px chunk (not a sliver), and the geometry sat half off the 300px canvas → reads as a planet, not premium. Direction dropped. **Lesson:** a side-placed literal moon reads as clip-art; the proven-premium element is the **rays**. (Owner confirmed the rest of the dark theme — palette, card depth, number glow, sheen — looks good; only the hero was failing.)

#### IMP-019 · Round 4 — Rays on black (reuse the light-mode hero) — ✅ owner-approved + promoted 2026-06-13
- **Concept (owner-chosen):** the dark hero = the **light-mode `RayFan`** (the slow rotating golden sunburst the owner loves) rendered on the **true-black** card, **behind the glowing streak number**, with a **soft central amber bloom** at the convergence so the middle reads warm. Symmetric, cohesive ("same brand at night"), and **low-risk because it reuses proven code**. The three prior hero attempts (plain glow → busy embers → ball-moon) all failed on craft; this stops reinventing and reuses the element that already reads premium.
- **Files likely touched:** `src/art.js` (new thin `NightRays` wrapper composing the existing `RayFan` + a central bloom + optional faint embers; keep `NightSky` classic; you may delete the abandoned `NightCrescent` / `EmberGlow`), `src/screens/HomeScreen.js` (point the night+v2 hero at `NightRays`; keep the number glow), `src/ui.js` (keep the card sheen), `__tests__/theme/darkTheme.test.js` (default-guard stays `'classic'` until promotion).
- **Approach (decided by Opus — reuse first, tune on-device):**
  1. **Reuse `RayFan`.** It already renders 24 amber rays converging at the canvas centre (card y≈80, matching the number) and rotates over 60s. Compose it inside a new `NightRays` wrapper. On true black the amber rays read as a sunburst.
  2. **Central amber bloom.** Add a soft radial-gradient bloom at the convergence (canvas ~150,150; r≈70–90; `#f59e0b`→transparent; low opacity ~0.3 with a gentle breathe) so the centre behind the number glows warm instead of empty — this is the premium depth.
  3. **Tune rays for black only if a screenshot shows it's needed:** light `RayFan` uses opacity 0.5; on black consider ~0.55–0.65 and/or a radial fade (brighter near centre, fading out) for depth. Start by reusing `RayFan` as-is, then tune.
  4. **Keep** the night-v2 number glow + card sheen.
  5. **Optional faint embers:** ~4–6 very subtle `EmberParticle`s near the centre — include **only if they don't clutter**; rays + number must read first. Default to omitting if unsure.
- **Hierarchy:** glowing number (centre, brightest, y≈80) sits *inside* the radiating sunburst + warm bloom. Fully symmetric — nothing off to the side.
- **Keep:** number focal point y≈80; flag/revert; `PALETTES.night` + `NightSky` byte-for-byte; `useNativeDriver` (RayFan already uses it); don't touch light or classic-night.
- **Promotion / flag discipline:** default `DARK_THEME` stays `'classic'` while building (main always shippable); preview by flipping to `'v2'` locally; only on owner approval set `'v2'` + update the default-guard test (`'classic'`→`'v2'`), commit, OTA.
- **TDD:** visual — keep `__tests__/theme/darkTheme.test.js` green.
- **Steps:**
  - [x] 1. Add `NightRays` (compose `RayFan` + central amber bloom; optional faint embers); point night+v2 hero at it in `HomeScreen`; drop the abandoned `NightCrescent` from selection.
  - [x] 2. Keep number glow + card sheen (already present from Round 2).
  - [x] 3. `npm test` green (154 passed, 20 suites). Owner screenshot review on OLED (flip flag to `'v2'` to preview).
  - [x] 4. **On owner approval only:** set `DARK_THEME='v2'`, update the default-guard test, commit, OTA (`Release-Lane: ota`).
- **Commit (build):** `feat(theme): night hero = rays on black (reuse RayFan) + central bloom, behind DARK_THEME flag`
- **Acceptance (owner screenshots, OLED):** the dark hero shows the **rotating golden sunburst on black behind the glowing number** with a warm central bloom — visibly the **same premium language as light mode**, symmetric, no clip-art object. `DARK_THEME='classic'` still restores classic exactly.
- **Outcome:** owner-approved + promoted. `DARK_THEME` set to `'v2'`; default-guard test updated (`'classic'`→`'v2'`). Shipped OTA. Revert anytime: flip `DARK_THEME='classic'` + OTA.

---

### IMP-020 — Backup / Restore ("Your journal is safe")   ·   Lane: BUILD (rides IMP-006)   ·   Status: ✅ shipped + **device-verified 2026-07-30** (export → share out → restore all work; owner uploads the JSON to Drive manually)

First piece of the four-part "legacy" roadmap (D → A+B → C). Lets users keep their journal safe & portable **with no account** — a user-held JSON export (off-device via the OS share sheet) + restore-by-replace with an automatic on-device recovery copy, plus an honest in-app surface for Android Auto Backup.

- **Full spec (the real source of truth):**
  - Design (why): [`docs/superpowers/specs/2026-06-14-backup-restore-design.md`](superpowers/specs/2026-06-14-backup-restore-design.md)
  - Plan (how — 8 tasks, exact code + commits): [`docs/superpowers/plans/2026-06-14-backup-restore.md`](superpowers/plans/2026-06-14-backup-restore.md)
- **Architecture:** reuse `serialize`/`deserialize` (validation + forward-migration carry over). New **pure** core under `src/backup/` (`backup.js` envelope build+validating-parse — the single validation boundary; `lastBackupLabel.js` subtitle; `importFlow.js` recovery-before-replace guarantee) — all unit-tested. One **thin native wrapper** `src/backup/io.js` over `expo-file-system`/`expo-sharing`/`expo-document-picker` (no logic, not unit-tested). Wiring: `doExport`/`doImport`/`explainAutoBackup` in `RitualsApp.js`; `handleReplaceAllData` + remount `key` in `App.js`; new "Your journal is safe" section in `YouScreen.js`.
- **Tasks shipped (commit per task):** 1 persist `lastBackupAt` (675e520) · 2 backup core (parse/build) · 3 `lastBackupLabel` · 4 `importFlow` (651eaf2) · 5 `io.js` + jest mocks + deps (579563f) · 6 wire handlers + replace-all remount (4dbf887) · 7 You-tab section + relabel PDF stub → "Save as PDF" (ac8d342) · 8 bump:build → versionCode 6 (08e3d2e).
- **Key constraints honored:** import REPLACES (writes recovery envelope first — never replaces if the recovery write throws); the word "Export" appears nowhere on the You tab (backup = "Back up"/"Restore", PDF stub relabeled "Save as PDF", behavior unchanged); Auto Backup native `allowBackup` was already in `app.config.js` (IMP-006) — Task 6/7 only *surface* it via an honest explainer + deep-link (no faked live ON/OFF status). Backup file is plaintext journal content (encryption deferred — see design §6).
- **Verification:** `npm test` → **171 passed, 23 suites** (3 new `__tests__/backup/*` suites: backup 9, lastBackupLabel 5, importFlow 2; + 1 new `state.test.js` case). `npx expo export --platform android` bundles clean. **Device/emulator smoke test (export → save → restore → recovery copy; non-backup-file error; settings deep-link) is owner-pending** — same gate as IMP-006's Auto Backup cycle; the two ride one BUILD shipment.
- **Ship:** BUILD lane, no trailer applied (owner has not asked to release). When the owner ships, the final commit's last line is `Release-Lane: build` + `git push origin main`; never run `eas` by hand.
- **Deferred (do not build now):** scheduled auto-export (v2), file encryption/passphrase (future), live OS-backup-status detection (needs a custom native module), merge-on-import (rejected — replace + recovery copy is the model).

---

### IMP-021 — Lifetime Progress ("Your record" on the Insights tab)   ·   Lane: OTA   ·   Status: ✅ code-complete

Second piece of the "legacy" roadmap (A+B). Evolved the **Insights tab** into "Your record" (big **days remembered** number + totals + adaptive consistency heatmap) above the existing "Your patterns" (mood + rhythm). Home hero untouched.

- **Full spec (the real source of truth):**
  - Design (why): [`docs/superpowers/specs/2026-06-14-lifetime-progress-design.md`](superpowers/specs/2026-06-14-lifetime-progress-design.md)
  - Plan (how — 5 tasks, exact code + commits): [`docs/superpowers/plans/2026-06-14-lifetime-progress.md`](superpowers/plans/2026-06-14-lifetime-progress.md)
- **Architecture:** Two new pure modules — `src/insights/dateKeys.js` (shared `longestConsecutiveRun`/`dayKeyToUtcMs`/`DAY_MS`, extracted from `derive.js`); `src/insights/lifetime.js` (`deriveLifetime` — days remembered, total entries, total words, current/longest streak, level/levelName/xp, adaptive `activeSpan` label). `buildLifetimeHeatmap` appended to `src/home/calendar.js` (reuses its private helpers; Monday-first week rows, adaptive span from first entry to today). `InsightsScreen.js` restructured: new "Your record" section + `LifetimeHeat` component; "Your patterns" heading above untouched mood mix + rhythm; old 2×2 stat tiles (Days kept / This month) removed. `xp` piped from `RitualsApp.js`.
- **Key constraints honored:** Home hero NOT changed; hero label is exactly "days remembered"; heatmap is adaptive (new user sees one near-empty week; fills in over time); "Days kept" and "This month" tiles removed.
- **Tasks + commits:** T1 extract dateKeys (b347dd3) · T2 deriveLifetime (ae664c7) · T3 buildLifetimeHeatmap (dfe2ff0) · T4 InsightsScreen + RitualsApp wire (a0d5446) · T5 PROGRESS.md + build-log archive.
- **Verification:** `npm test` → **190 passed, 25 suites** (3 new suites: dateKeys 4, lifetime 11, calendar +4 = 20 total). Manual smoke test: owner-pending (OTA lane; no ship trailer applied; owner decides when to push).
- **Ship:** OTA lane — no `bump:*` (pure JS/UI). No trailer = not shipped yet. When owner asks: final commit last line `Release-Lane: ota` + `git push origin main`.
- **Next roadmap piece:** C — Annual Recap / Time Capsule (folds in the deferred milestone timeline).

---

### IMP-023 — Dynamic daily text (rotating multilingual greeting + daily reflection prompt)   ·   Lane: OTA   ·   Status: ✅ code-complete

Owner-filed: keep the app fully **offline** but make the greeting + some text vary each day. Scoped (via brainstorm) to **two rotating slots**, both offline (bundled string pools, no network):
- **Greeting headline** — rotating time-neutral multilingual hello (Hello / Hej / Konnichiwa / Ni Hao / …); **stateless date-seeded** pick (the local day is the seed, hashed so consecutive days look unrelated; repeats are harmless). The English time-of-day greeting ("Good morning") is demoted to the subtitle beside the date. Header restructured to **Layout A** (utility row with `EmberPill` + mode toggle on top, full-width greeting below) — fixes the long-hello-vs-cluster crowding the owner flagged.
- **Daily reflection prompt** — shown in the "today's ritual" write card (only when `!done`; auto-hides at "Today is at rest."). Persisted **no-repeat deck** (shuffle-bag): every prompt shown once before any repeat; advances exactly one per app-open day (gaps don't skip); reshuffles on exhaustion; reinitializes on pool-size change / corruption.

- **Full spec/plan:** [`docs/superpowers/specs/2026-06-14-dynamic-daily-text-design.md`](superpowers/specs/2026-06-14-dynamic-daily-text-design.md) · [`docs/superpowers/plans/2026-06-14-dynamic-daily-text.md`](superpowers/plans/2026-06-14-dynamic-daily-text.md)
- **Architecture:** new pure modules — `src/time/dailyPick.js` (`dayNumber`, `mulberry32` PRNG, `pickForDay`); `src/content/greetings.js` (`HELLOS` ×16); `src/content/prompts.js` (`PROMPTS` ×60 ≈ 2-month recycle); `src/content/deck.js` (`shuffle` + pure `selectPrompt`, which returns the **same deck reference** when unchanged so React effects don't churn). `promptDeck` added to `PERSISTED_KEYS` — **no schema migration** (filled by `mergeWithDefaults`; deck self-initializes). `RitualsApp.js` holds `promptDeck`, computes today's prompt via `selectPrompt` (`useMemo` + a persist effect), passes `dailyPrompt` to Home. `HomeScreen.js` header → Layout A + write-card prompt (kicker "Today's reflection").
- **Theme:** every new view reads `useTheme()` tokens — works across day / classic night / nightV2 AMOLED and respects accent customization; no hardcoded colors.
- **Tasks + commits:** T1 dailyPick (f7ae548) · T2 greetings (e654a92) · T3 prompts (4aeb600) · T4 deck (6e41139) · T5 persist promptDeck (1b3b095) · T6 header Layout A (b9ea1b8) · T7 write-card prompt + RitualsApp wire (5f686f8). Spec committed earlier on main (6af3215).
- **Verification:** `npm test` → **218 passed, 29 suites** (4 new suites: dailyPick 8, greetings 3, prompts 3, deck 11; +3 state cases). `npx expo export --platform android` → bundles clean (1 Android bundle, exit 0, no errors). Manual smoke test owner-pending: header in both modes + a custom accent; greeting & prompt stable within a day; prompt rotates daily with no early repeats; prompt auto-hides once today is done.
- **Ship:** OTA lane — no `bump:*` (pure JS/UI). **No `Release-Lane` trailer** = not shipped yet. When owner asks: final commit last line `Release-Lane: ota` + `git push origin main`.

---

### IMP-024 — Streak derives from real entries (breaks on a missed day)   ·   Lane: OTA   ·   Status: ✅ code-complete

Owner-found bug: the day-streak was a **persisted mutable counter** (`completeEntry.js` did a blind `prev.streak + 1` every completion; the daily-reset effect never re-evaluated it), so a missed day left the old number and re-logging after a gap incremented instead of resetting to 1.

- **Fix (derive, don't store):** new pure `currentStreak(keys, todayKey)` in `src/insights/dateKeys.js` — dedupe to UTC-ms day set; anchor = today if logged else yesterday (streak still alive, today just not logged yet) else **0**; count consecutive days back from the anchor. Empty → 0.
- `RitualsApp.js`: `streak` is now `useMemo(() => currentStreak(entries.map(e => e.dayKey), todayKey()), [entries])` — every screen prop + `deriveAchievements` becomes correct automatically. Deleted `setStreak` + the `setStreak(next.streak)` call.
- `completeEntry.js`: `applyCompletion` derives `celebrate.streak` from `[entry, ...prev.entries]` (continuity-aware milestone lookup); removed the dead top-level `streak` from both return branches. Same-day re-write (`prev.done`) still returns `celebrate: null`.
- **Persistence residue removed:** `'streak'` dropped from `PERSISTED_KEYS`, the autosave object + dep array, `currentSlice()`, and the v1 migrator. Stored streak from old installs is simply ignored (derived value is authoritative). No schema bump.
- **Dev harness (this branch):** `buildState.js` no longer emits a `streak` field — the Streak knob drives `entryCount` (a consecutive run ending today/yesterday) so the app derives that exact streak from the generated entries.
- **TDD:** RED first. `currentStreak` cases (today+run; yesterday-alive; gap≥2 → 0; old-run+only-today → 1; empty; single; unordered/dupes). `applyCompletion` continuity cases (lone → 1; 6 prior days + today → 7/milestone; after a gap → 1; same-day edit → no celebrate). Updated 3 pre-existing tests that asserted the now-removed persisted streak (backup round-trip → xp; v1 migration → drop streak assertion; dev buildState → assert derived `currentStreak(entries)`).
- **Verification:** `npm test` → **250 passed, 32 suites**. Commit `ac3f3c6`.
- **Ship:** OTA lane (pure JS) — `eas update --branch production` after merge. **No `Release-Lane` trailer** = not shipped yet. Owner acceptance: log 3 days running → header 3; skip a day → header **0**; log again → **1**; same-day re-write doesn't bump.

### IMP-025 — Editable display name   ·   Lane: OTA   ·   Status: ✅ code-complete

- **Goal:** User can change their display name from the You tab after onboarding. Persists via `settings.name`; Home greeting updates automatically.
- **Approach:** `sanitizeName(input)` pure helper added to `src/profile/identity.js` — trims, caps at 40 chars, returns `null` for blank. `NameEditModal.js` (new presentational component): bottom-sheet slide modal, `TextInput` prefilled with current name, Save disabled when `sanitizeName` returns null, Cancel/backdrop dismiss. "Your name" `Row` added to Preferences card in `YouScreen.js` (after Voice, before Gamification) using `UserIcon`; modal state (`editingName`) and `saveName` handler local to `YouScreen`; `setSettings` updater already threaded in. Home greeting wires automatically (reads `settings.name`).
- **TDD:** RED→GREEN on `sanitizeName`: trims, caps 60→40, blank/whitespace→null, emoji + accented chars, normal name. 7 new cases. `npm test` → **257 passed, 32 suites**. Commit `74965c8`.
- **Ship:** OTA lane (pure JS) — `eas update --branch production` after merge. **No `Release-Lane` trailer** = not shipped yet. Owner acceptance: You tab → tap **Your name** → modal prefilled → change → Save → profile header + Home greeting update; blank rejected (old name kept); relaunch shows new name.

### IMP-027 — Expo SDK 51→54 for `targetSdkVersion 36` (Android 16 / Play API-36 compliance)   ·   Lane: BUILD   ·   Status: ✅ **SHIPPED** — v1.0.3 / versionCode 9 built, uploaded and submitted to **production** review 2026-07-30

- **Goal:** Play Console flagged the app as non-compliant (highest target was API 35 / Android 15); apps not within one year of the latest Android release **lose the ability to publish updates from 2026-08-31**. Target `targetSdkVersion 36`, which requires Expo SDK 54 (RN 0.81) — the last SDK that still supports Legacy Architecture.
- **Outcome:** Expo `~51.0.0` → `^54` (installed **54.0.36**), `react-native` `0.74.5` → **0.81.5**, `react` `18.2.0` → **19.1.0**, `jest-expo` 51 → **54**, plus every expo/RN-family package resolved by `expo install --fix` (async-storage 2.2.0, svg 15.12.1, safe-area-context ~5.6.0, metro-runtime ~6.1.2, file-system ~19.0.23, and the rest). `expo-font` added to `plugins`. `babel-preset-expo` added as a devDependency.
- **`app.config.js`:** `compileSdkVersion`/`targetSdkVersion` 35 → **36**, `buildToolsVersion: '36.0.0'` added, `minSdkVersion: 24` untouched (RevenueCat).
- **Legacy Architecture held deliberately.** SDK 54 defaults New Arch **ON**, so `newArchEnabled: false` is set explicitly. ⚠️ **Deviation from the written spec (step 3b):** the spec said to put it in the `expo-build-properties` android block; it is instead at the **top level of `expo`**, which is the canonical SDK-54 field. The `expo-build-properties` option of the same name is deprecated and intentionally left unset — one switch, one place. Net effect is identical; the config is less ambiguous.
- **`postinstall` patch — resolved, not deleted.** Spec step 4 posed an either/or (upstream fixed → delete the hook; bug persists → update the replace-target). **Verified against the pristine `expo-modules-core@3.0.30` npm tarball: the bug persists** — upstream is still `return requestedPermissions!!.contains(permission)`. (The *installed* copy cannot answer this, because the patch rewrites it in place.) So the patch was kept and its target string updated `…Permissions.contains` → `…Permissions!!.contains`. It was also moved out of the escaped `node -e` one-liner in `package.json` into **`scripts/patch-permissions.js`**, which is three-state and **fails loudly** (non-zero exit) when neither the buggy nor the patched line is found — the old `try/catch{}` would have silently shipped an unpatched crash. Unit-tested (`__tests__/scripts/patchPermissions.test.js`).
- **`expo-file-system/legacy`.** SDK 54's default export replaced the string-based API with a File/Directory API, so `src/backup/io.js` imports `expo-file-system/legacy` (the old surface, re-exported unchanged — no rewrite of the backup code). Consequence caught in review: `jest.setup.js` mocked only `'expo-file-system'`, and Jest keys mocks on the literal module path, so the stub had become **dead** for `io.js`. Both paths now share one stub via `test-mocks/expoFileSystemStub.js` (the two `jest.mock` factories must be inline literals, so they each `require` it).
- **🎨 Visual regression fixed — card sheen banding (owner-reported: "weird colour blocks on every screen").** `Card`'s night-v2 top sheen painted `rgba(255,255,255,0.06)` → `rgba(255,255,255,0)` across `StyleSheet.absoluteFill` with `end={{x:0.5,y:0.5}}`. That is only ~15 of 255 alpha steps stretched over half the card's height (~10dp per step), which Android's hardware draw path renders as visible horizontal bands — with the final hard edge always landing at exactly 50% of each card's height, and a different band pitch per card because every card is a different height. It was never smooth by construction; **SDK 51's draw path dithered it away** (`Paint.DITHER_FLAG` is ignored under hardware acceleration on current Android). Fix: the sheen is now a **fixed 48dp top strip** ramping 0→1 across itself (~3dp per alpha step) with `dither` set explicitly, exported as `CARD_SHEEN` from `src/ui.js` and guarded by `__tests__/theme/cardSheen.test.js`. ❗**Not** an `expo-linear-gradient` bug — its changelog records no user-facing change from 13 → 15 and its Android paint code is stock `android.graphics.LinearGradient`; an earlier attempt that added `borderRadius` to the gradient was based on that wrong premise and was reverted.
- **Verification:** `npm test` → **262 passed, 34 suites** (from 257/32; +5 new guard cases, **zero product-logic test changes**). `npx expo export --platform android` → clean bundle on SDK 54. `npm run bump:native` → **v1.0.3 / versionCode 9** (native change, so `version` bumps too — the `appVersion` runtimeVersion policy must scope the old SDK-51 OTA bundle away from this native build).
- **✅ Native build cleared (2026-07-30).** The owner built v1.0.3 / versionCode 9 on `compileSdkVersion 36` and uploaded it — so the `~/.gradle/init.d` kapt tmpdir fix held on SDK 54's newer Kotlin/kapt without needing a rewrite. **Still worth walking on the review build:** the device smoke test — launch, onboarding, entry write, RevenueCat paywall (Preview Mode fine), backup/restore — **and the edge-to-edge audit of every screen's custom header + tab bar** (Android 16 forces edge-to-edge and SDK 54 can no longer opt out; confirm `react-native-safe-area-context` insets top and bottom). Confirm whether these were walked pre-upload; if not, do them against the production build.
- **Ship:** BUILD lane. ✅ Shipped 2026-07-30 — submitted to the **production** track (not just closed testing), awaiting Google review. This upload is also what unblocks BillDesk (see IMP-028 / the launch-order deadlock). **Deferred follow-on (separate future task):** SDK 55 removes Legacy Architecture entirely, so a New-Architecture migration is inevitable within ~12 months — every native module (RevenueCat, svg, safe-area-context, linear-gradient) re-verified. Explicitly out of scope here.

### IMP-028 — Billing correctness pass (before any real transaction)   ·   Lane: OTA   ·   Status: ✅ code-complete

- **Goal:** the owner asked to enable + real-transaction-test payments before the public push. Audit the whole billing seam and fix anything that would mis-sell, mis-charge, or silently fake a purchase. Scoped as its own task because none of it belongs to 10b's external checklist — it is code that must be right *before* products exist.
- **Audit result — the seam is sound.** `Purchases.configure()` **is** called and correctly gated on `isBillingConfigured()` in `App.js`; the `buy/restore/getEntitlement/getPrices` contract is clean; the metro `react-native-purchases` stub is **web-only** (`platform === 'web'`) and cannot affect Android. Three real defects were found.
- **🔴 (1) The paywall showed hardcoded USD.** `Paywall.js` rendered the `PLUS_PRICES` design constants (`$4.99` / `$29.99`) while Google charges the Play-configured local price, and `revenueCatService.getPrices()` — fully implemented — was **called from nowhere**. Dead code. This is price misrepresentation (a Play policy problem), and the same hardcoded figure was interpolated into the binding auto-renew disclosure in `LegalFooter`. **Fix:** new pure `src/billing/prices.js` (`mergePrices` / `savePercent`) + `src/billing/useLivePrices.js` hook; `getPrices()` now returns RevenueCat's **numeric** `product.price` alongside `priceString`. The constants survive only as the Expo-Go/offline fallback, and `LegalFooter` takes a `prices` prop (defaulting to the constants so non-purchase callers are unaffected).
  - **Two deliberate rules.** The annual per-month sub-line ("$2.50 / mo") is **dropped, not recomputed**, once a live price lands — formatting a divided figure correctly needs the currency's symbol, placement and grouping, which `priceString` has already solved and a manual divide would get wrong. And the `Save 50%` badge is **removed unless the real saving computes** from both numeric prices — asserting a stale 50% when the actual products differ is the same class of defect as the wrong price.
- **🔴 (2) EAS cloud builds would silently ship the purchase simulation.** `.env` is git-ignored, there is no `.easignore`, `eas.json` has no `env` block, and `release.yml` builds on EAS — so a cloud build resolves `RC_ANDROID_KEY` to `''` → `isBillingConfigured()` false → `createPurchaseService` returns `simService` → **the paywall fakes a successful purchase and grants Plus for free**, with no crash and no error. Locally the key resolves fine (`goog_…` verified present in `extra` via `npx expo config`), which is precisely what makes it dangerous. **Fix:** `scripts/check-billing-config.js` — mirrors the `patch-permissions.js` shape (pure exported decision fn, hard non-zero exit), wired as a **Billing preflight** step before `eas build` in `release.yml`. No-op while `PLUS_ENABLED` is false; fails the build the moment Plus is on without a `goog_`-prefixed key. Both directions verified.
- **(3)** `CancelSheet` showed the hardcoded `RENEW_DATE` constant instead of the real `renewLabel` its parent (`ManageSubscription`) had already computed. Threaded through.
- **⚠️ Deliberately NOT fixed — the "7-day free trial" claim** is hardcoded in the paywall CTA and `LegalFooter`. It is only truthful if the Play base plan actually carries a 7-day free-trial offer. The correct fix reads the intro/trial period off the live offering and **cannot be built or tested until real Play products exist**. Decide the offer when creating the products, then either configure the trial in Play or change the copy — do not ship the claim unverified. Tracked in PROGRESS.md Open items.
- **Verification:** `npm test` → **286 passed, 36 suites** (from 262/34; +24 new cases across `__tests__/billing/prices.test.js` and `__tests__/scripts/checkBillingConfig.test.js`, **zero product-logic test changes**). `npx expo export --platform android` clean.
- **Ship:** OTA lane (only `src/`, `scripts/` and CI changed — no native surface). No version bump. **Owner action before 10b:** create the EAS env var (`eas env:create --name RC_ANDROID_KEY --scope project --environment production`) **and** the GitHub repo secret `RC_ANDROID_KEY` — the workflow references the secret, and the Actions linter flags it as undefined until it exists.

### IMP-029 — Tell the user their data was restored from a Google backup   ·   Lane: BUILD   ·   Status: ✅ code-complete

- **Goal:** the 2026-07-30 device walk found Android Auto Backup (IMP-006) working — uninstall → reinstall auto-restored with no login — but the restored data was **stale** ("older data before today"). That staleness is the documented Auto Backup contract (≤once/24h, only idle+charging+Wi-Fi), **not a defect**; the defect is that the restore is silent, so a user could write today's entry over the stale restore and only later remember their manual JSON backup, whose restore-by-replace would discard what they just wrote.
- **Detection — no native restore signal, so it's inferred.** `serialize(slice, now = Date.now())` in `src/persistence/state.js` now stamps `lastSavedAt: now` into the envelope on **every** save, always overriding any stale value already in `slice` — so a manual JSON import (which calls `saveState` via `handleReplaceAllData`) refreshes it too and can't false-positive. `deserialize` needed no change: it only strips `version`, so `lastSavedAt` already survives in the returned slice. New pure `src/persistence/restoreDetect.js`: `isRestoredInstall({ lastSavedAt, installedAt })` — true only when both are finite numbers and `installedAt > lastSavedAt` (equal ⇒ false; missing/non-numeric either side ⇒ false, no coercion tricks like `Number(null) === 0`) — and `formatBackupDate(ms)` → `"14 Jun 2026"`, empty string on invalid input.
- **Wiring.** `App.js` reads `expo-application`'s `getInstallationTimeAsync()` (confirmed `Promise<Date>` against the installed `~7.0.8`) only when `s.lastSavedAt` is present (skips the native call entirely on a fresh install, where it's always absent); on a restore it sets `restoredFromMs` and passes it + a `onDismissRestoreNotice` handler down to `RitualsApp`. Dismissing (`Got it` or `Restore from a file`) calls `saveState(hydrated)` to re-stamp `lastSavedAt` to now (belt-and-suspenders — `RitualsApp`'s own 400ms debounced autosave would also refresh it) and clears the flag, so the notice is self-clearing with no new persisted key. New presentational `src/screens/RestoreNotice.js` mirrors `PurchaseOverlay`/`CancelSheet`'s scrim-and-card shape (`Restore` icon, "Welcome back.", the backup date, `Got it` primary / `Restore from a file` ghost secondary); rendered from `RitualsApp.js` wired to the existing `doImport`.
- **TDD:** RED→GREEN on `isRestoredInstall` (newer/older/equal/missing-either-side/null/non-numeric — 7 cases) + `formatBackupDate` (valid + invalid — 2 cases), plus 5 new `state.test.js` cases for the stamp (injected clock, default clock, round-trip, always-refreshes-over-stale, old-payloads-without-it-still-deserialize).
- **Verification:** `npm test` → **300 passed, 37 suites** (from 286/36; +14, zero product-logic changes). `npx expo export --platform android` clean.
- **Ship:** BUILD lane (`expo-application` is a new native module). `npm run bump:native` → **v1.0.4 / versionCode 10** (v1.0.3 / vc 9 is live) — IMP-029 landed first of the IMP-022+IMP-029 pair, so it owns this bump; IMP-022 checks for it and skips.
- **Smoke test after build:** write an entry → wait for a real Auto Backup (idle+charging+Wi-Fi) → uninstall → reinstall → notice names the backup's date → "Restore from a file" opens the picker → "Got it" dismisses and does not reappear on relaunch. Confirm the negatives too: a normal launch, a Play/OTA update, and a fresh install all show nothing.

#### Device-walk procedure (written 2026-08-02 — the walk this task still owes)

**Why it can't be shortcut.** The notice fires only when `installedAt > lastSavedAt`. `installedAt` is Android's `PackageInfo.firstInstallTime` (read-only, resets on uninstall+reinstall, **preserved** on update), and `serialize` force-stamps `lastSavedAt = now` on **every** save — so no harness knob, no hand-edited JSON and no clock trick can produce the condition. Only data that is genuinely older than the install can, i.e. a real restore. The harness launcher (long-press *About* → **Launch → Restore notice**) renders the sheet via `devRestoreMs` and is fine for checking **copy, date format, theme and the two buttons** — it proves nothing about the detection.

**Don't wait 24h.** `adb shell bmgr backupnow` triggers Auto Backup on demand, bypassing the idle + charging + unmetered-Wi-Fi + ≤once/24h contract. Device must be signed into a Google account with **Settings → Google → Backup** on. GUI equivalent if `bmgr` misbehaves on an OEM ROM: **Settings → Google → Backup → Back up now**.

**Two hard prerequisites.** (1) Auto Backup restore only applies when the reinstalled APK carries the **same signing certificate** — so install the **same** artifact both times. Cleanest is the Play closed-testing build via the tester link; a locally-built debug APK works only if you use that same APK for both installs. (2) Uninstall must be a real uninstall — **never `adb uninstall -k`** (it keeps data and defeats the whole test).

Package id: `app.dailyrituals.mobile`.

```bash
adb shell bmgr enabled                  # expect: Backup Manager currently enabled
adb shell bmgr list transports          # note the '*' transport (Google's, via GMS)
```

**P — the positive case (the one that matters).**
1. Open the app, write today's entry, background it (forces the 400ms autosave to land).
2. `adb shell bmgr backupnow app.dailyrituals.mobile` → expect `...with result: Success`.
3. **Stop using the app from here.** Anything you write now moves the live `lastSavedAt` forward but not the backed-up copy — which is exactly what makes the restored data "old".
4. `adb uninstall app.dailyrituals.mobile` (no `-k`).
5. Reinstall the **same** artifact. Let the install-time restore complete before launching.
6. Launch → **the notice appears**, headed "Welcome back.", naming the date of the save in step 1.
   - Want a date that isn't today (proves it reads the stamp, not the clock)? Do steps 1–2 one day, steps 4–6 the next; the notice must name the **earlier** day.
7. Tap **Restore from a file** → the system file picker opens → the notice dismisses.
8. Repeat P to re-arm, then tap **Got it** instead → force-stop → relaunch → **nothing reappears** (the dismiss re-stamped `lastSavedAt`).

**N — the negatives (each must show nothing).**
- **N1 normal launch** — force-stop, reopen, several times.
- **N2 update over the top** — `adb install -r` the same APK. `firstInstallTime` is preserved, so `installedAt < lastSavedAt` and the notice must stay silent. (Local builds are stamped 1.0.3/vc9 by the stale `android/` prebuild — irrelevant here, only the install time and the signing cert matter.)
- **N3 OTA update** — an `eas update` reload changes no native install time. Silent.
- **N4 genuinely fresh install** — wipe the package's backup data first, or the restore will fire:
  `adb shell bmgr wipe <transport-from-step-0> app.dailyrituals.mobile`, then uninstall + install. No persisted data ⇒ no `lastSavedAt` ⇒ `App.js` skips the `expo-application` call entirely ⇒ silent.
- **N5 manual JSON restore** — You tab → restore from a file. `handleReplaceAllData` saves through `serialize`, which re-stamps `lastSavedAt` to now, so this must **not** trip the notice on the next launch.

**No-adb variant (owner's real device, app already installed from the Play closed-testing track).** Same test, GUI only — and installing from Play both times satisfies the signing-cert prerequisite automatically.
- **First, protect the real journal.** Uninstalling deletes local data; if the restore doesn't come back you have lost it. You tab → **Back up my journal** → share the JSON off-device (Drive/email) *before* anything else.
- Settings → search **"Backup"** → **Backup by Google One** must be **On** (OEM menus differ; the search shortcut is reliable. On Samsung this is the *Google* backup, not Samsung Cloud — Samsung Cloud is irrelevant here).
- Plug in + join Wi-Fi, then **Back up now**. Wait for the **"Last backup"** timestamp to actually change — that, not the button tap, is the completion signal.
- Confirm the app's data is in it: **Google One app → Storage → Backups → this device → App data** → *Daily Rituals* present.
- Uninstall via long-press the icon → **Uninstall** (a plain uninstall — *not* "Clear data", which leaves `firstInstallTime` untouched and proves nothing).
- Reinstall from **Play → Library** (or the tester opt-in link; it can take a few minutes to reappear). Let the install-time restore finish before launching.
- Launch → the notice must appear and name the backup's date.
- **Negatives reachable without adb:** normal launch (force-stop + reopen ×3); manual JSON restore from the You tab must not trip it on the next launch; **update-over-the-top** is checkable for free the next time a build ships to `alpha` — update from Play and confirm silence; **genuinely-fresh-install** is cleanest via a **second Android user profile / guest** on the same device (no backup data for that account), since per-app backup data cannot be wiped from the GUI — `bmgr wipe` is the only route, and this negative is the lowest-value of the five (no persisted data ⇒ no `lastSavedAt` ⇒ `App.js` never even calls `expo-application`).

**If P fails but the sheet renders from the harness**, the bug is in detection, not UI: check `s.lastSavedAt` is actually present in the restored slice (old pre-IMP-029 payloads have none — that's the deliberate silent case) and that `getInstallationTimeAsync()` resolved rather than throwing into the silent `catch` at [`App.js:68`](../App.js#L68).

### IMP-030 — Layout can't blow out, whatever the text   ·   Lane: OTA (A) + Build (B)   ·   Status: ✅ code-complete

- **Goal:** the "Back up my journal" row blew out to ~18 lines tall with a long stale-backup string — `Row`'s `flex:1` label had no `numberOfLines`, so once the unshrinkable value container ate the free space the label wrapped one character per line. Same shape of bug reachable today via a long device name.
- **Part A — auto-stack, don't truncate.** New pure `src/ui/rowFit.js` → `shouldStackRow({ label, value, availableDp, fontScale })`: `estWidth = fontScale * 0.48 * (15.5·labelLen + 14·valueLen)`, stacks when it exceeds `availableDp`. Calibrated and pinned against the two device screenshots plus 5 more cases (Appearance/Night, 40-char name, Daily reminder at scale 1.0 and 2.0, no-value-never-stacks). New `src/ui/Row.js` extracted from `YouScreen.js` (byte-identical duplicate in `PlusFlow.js`'s `ManageSubscription` deleted, now imports the shared one): value container `flexShrink: 1`, value `numberOfLines={1}`, label `numberOfLines={2}` always, `availableDp` computed from `useWindowDimensions()` width minus a measured chrome constant (`148dp` — screen padding 40 + card padding 32 + icon 36 + gaps 22 + chevron 18); when `shouldStackRow` is true the row switches to label-over-value with the chevron pinned right. Rows that pass a custom `right` node (Shop, Save-as-PDF) skip the stacking check entirely — they were never the blown-out shape.
- **Name caps reconciled to 40** (matching `sanitizeName`, already 40): `Onboarding.js` had no `maxLength` at all (added); `NameEditModal.js` was `60` (lowered).
- **Other unshrinkable `space-between` text pairs** given `flexShrink: 1` + `numberOfLines`: quest label vs `+N XP` (`src/gamify.js`), achievement label vs the earned check (`Achievements.js`), `Lv N · levelName` vs XP (`HomeScreen.js` hero, `YouScreen.js` profile card), plus `numberOfLines={2}` on the profile name and `{3}` on the Home greeting headline. `InsightsScreen.js` mood-mix: fixed `width: 84` label slot → `minWidth: 84` + `flexShrink: 1` (was clipping long mood names), fixed `width: 18` count slot → `minWidth: 18` (was clipping at 3 digits).
- **Part B — font-scale cap (native, Build-only).** New `src/ui/textScale.js`: `MAX_FONT_SCALE = 1.5` (body/content), `CHROME_FONT_SCALE = 1.2` (fixed-size chrome). `T` (`src/ui.js`) now takes `maxFontSizeMultiplier`, defaulting to `MAX_FONT_SCALE`, overridable per call — the single line that does most of Part B's work, since every `<T>` in the app already routes through it. `CHROME_FONT_SCALE` applied explicitly to the tab bar labels and Write FAB label (`RitualsApp.js`), the embers pill and `PalTag` (`shopui.js`), and the "Lv N · levelName" pill on the You-tab profile header. `styles.nav` (`RitualsApp.js`) got `minHeight: 78` and `Tab` labels `numberOfLines={1}` so the 64dp FAB (`marginTop: -26`) can't collide with scaled labels.
- **TDD:** RED→GREEN on `shouldStackRow` (the 7-case table above, `__tests__/ui/rowFit.test.js`); a `Row` render-invariant test (`__tests__/ui/Row.test.js`) asserting every rendered `<Text>` with a flattened `flex: 1` style also carries a numeric `numberOfLines`, checked in both inline and stacked shapes; a `T` test (`__tests__/ui/T.test.js`) for the `maxFontSizeMultiplier` default/override.
- **Verification:** `npm test` → **312 passed, 40 suites** (from 300/37; +12, zero product-logic changes). `npx expo export --platform android` clean after both parts.
- **Ship:** Part A committed OTA-only (`45e0f0c`) — no native surface, reaches current users directly. Part B committed BUILD-only (`c810915`) — `maxFontSizeMultiplier` is native text measurement. **No version bump for Part B**: already at v1.0.4 / versionCode 10 from IMP-029 in the same shipment, per the "one bump per shipment" rule.
- **Smoke test after build:** set a 40-char name → You tab "Your name" stacks, nothing clipped, no giant row. Device Settings → Display size + Font size both at max → walk Today/Insights/Reflections/You: no clipped label, no row taller than ~2 lines, tab bar intact and the FAB not overlapping its label. Set the backup date back 42 days (dev menu) → confirm the row stacks and reads in full.

### IMP-031 — Make the daily reminder real   ·   Lane: BUILD   ·   Status: ✅ code-complete

- **Goal:** `YouScreen.js` rendered a "Daily reminder" row with a hardcoded `value="8:30 PM"` and a no-op `onPress` — every live user was told they had a reminder that didn't exist, and the app (a daily-ritual/streak product) had no retention hook at all. Build a real local, offline, opt-in reminder: on/off + user-chosen time, persisted, re-armed reliably, honest in the UI when the OS blocks it.
- **Design — rolling window, not `repeats: true`.** A repeating daily trigger can't be conditional, so it would fire even when the user already journaled that day — exactly what gets an app muted. `src/reminders/schedule.js` → `nextOccurrences(now, {hour,minute}, {wroteToday,count})` returns the next `count` (default 7) single-shot `Date`s, skipping today's slot if it has already passed or the user already wrote today. `formatReminderTime` and `reminderRowValue` (→ `'Off' | '8:30 PM' | 'Blocked in settings'`) are the other two pure exports — this file is the single tested boundary (`__tests__/reminders/schedule.test.js`, 16 cases: today/tomorrow boundary, exact-now edge, wroteToday skip, month/year rollover, wall-clock preservation, all three row-value states).
- **Native wrapper.** `src/reminders/io.js` is the only file that touches `expo-notifications`, lazy-`require()`d inside each function (not a static `import`) so Expo Go on Android — which dropped notification support in SDK 53 — degrades to `NATIVE_UNAVAILABLE` instead of crashing. Verified this pattern bundles clean via `expo export` even *before* the package was installed (Metro treats a try/catch-wrapped `require()` as an optional native dependency, the same trick RN libraries use generally). Surface: `getPermissionStatus`, `ensurePermission` (only called from the enable tap — never at launch), `cancelAll`, `scheduleAt`.
- **Persistence + the migration trap.** `DEFAULT_SETTINGS.reminder = { enabled: false, hour: 20, minute: 30 }` (`src/theme.js`). Default is **off** — existing users previously *saw* "8:30 PM"; this ships them "Off", the honest correction, not a silently-armed notification. `mergeWithDefaults` (`src/persistence/state.js`) is a shallow top-level spread, so a pre-IMP-031 persisted `settings` object would come back without the new `reminder` key and crash every read of `settings.reminder.enabled`. Fixed at both hydration points in `App.js` (initial load + `handleReplaceAllData` restore path) — `setSettings(s.settings)` → `setSettings(mergeWithDefaults(s.settings, DEFAULT_SETTINGS))`. Regression test added to `__tests__/persistence/state.test.js` asserting a pre-existing settings object without `reminder` gains the default on merge.
- **Copy.** `src/content/reminders.js` — small gentle/playful pools, picked date-seeded via `time/dailyPick.js`'s `pickForDay` (same mechanism as IMP-023's prompt/greeting rotation, distinct salt) so the rolling window's messages don't repeat nightly. No streak-shaming.
- **UI.** `src/screens/ReminderSheet.js` — presentational bottom sheet (shape of `NameEditModal`/`RestoreNotice`): on/off toggle, a plain +/− hour/minute stepper (5-min increments) with AM/PM toggle, and — only when `permission === 'denied'` — an inline banner routing to `Linking.openSettings()` (same pattern as `explainAutoBackup`). Props in, callbacks out; no persistence or native imports of its own. `YouScreen.js`'s row now reads `reminderRowValue(settings.reminder, reminderPermission)` and opens the sheet instead of a no-op.
- **Wiring (`RitualsApp.js`).** `rearmReminders()` — cancels + re-derives the whole 7-day window — runs on three triggers via one `useCallback` + two effects: mount, `[settings.reminder, settings.tone, entries]` change (covers both "settings changed" and "entry saved", since `complete()` mutates `entries`), and `AppState` foreground. Cheap and idempotent by design (the spec's explicit trade-off). `onReminderToggle` requests permission only when turning on; if the native module is unavailable it shows a toast and leaves `enabled` false rather than pretending to arm. `onReminderTimeChange` and `onOpenReminderSettings` (→ `Linking.openSettings()`) round out the wiring.
- **First runtime permission.** `expo-notifications` adds `POST_NOTIFICATIONS` to the manifest — the app's first runtime permission, exactly the condition `scripts/patch-permissions.js` exists to guard (`expo-modules-core` force-unwraps `requestedPermissions!!`, crashing when the manifest declares none). Patch re-verified: `npx expo install expo-notifications` → `postinstall` → `patch(permissions): already null-safe — nothing to do` (exit 0).
- **Verification:** `npm test` → **329 passed, 41 suites** (from 312/40; +17, zero product-logic changes to existing files). `npx expo export --platform android` clean both before and after installing `expo-notifications` (confirms the lazy-require degrades correctly either way).
- **Ship:** BUILD lane (new native module, first runtime permission). `npm run bump:native` → **v1.0.5 / versionCode 11** (v1.0.4 / vc 10 is the currently-shipping build). No `Release-Lane` trailer — owner has not said ship; batch with IMP-022 if it's revived.
- **Smoke test after build (not yet walked):** enable → set a time ~2 min out → background the app → notification fires → tapping opens the app; write today's entry → today's reminder does not fire, tomorrow's still does; deny the permission → row reads "Blocked in settings" and routes to system settings; Expo Go → toast, no crash; upgrade path — a device with existing pre-IMP-031 data keeps its name/tone and shows reminder **Off** (not a crash, not "8:30 PM"). OEM battery managers (Xiaomi/Realme/Oppo/OnePlus/Vivo) can still silently kill scheduled locals — not fixable in code, not a blocker, just don't promise reliability in copy.

### IMP-032 — Dev harness v2: total control + inspection   ·   Lane: Dev-only (no ship)   ·   Status: ✅ code-complete

- **Goal:** the dev harness (`src/dev/`, long-press "About Daily Rituals" on the You tab) reached roughly a third of the app's state and none of its runtime. `buildState` supported knobs (`gaps`/`palette`/`sky`/`tone`) the panel UI couldn't reach except via presets; 3 persisted keys (`mode`, `subCanceled`, `lastBackupAt`) were never emitted at all; `settings` was hardcoded to `{...DEFAULT_SETTINGS, tone}` so `name`/fonts/roundness/store-sim/the entire IMP-031 `reminder` object were unreachable; and nothing runtime (notification permission, what the OS actually scheduled, celebration/paywall/toast/restore-notice) was reachable at all. Two defects found while scoping: the `palette` knob skipped `retint()`'s `settings.accent` write (false-positive palette bugs); `Apply` replaced the real journal with no confirm and no recovery copy.
- **Part A — every persisted + settings key reachable from `buildState`.** `src/dev/buildState.js` gained `mode`, `name`, `endOffset` (shifts the entry run back N days — the sanctioned lapsed-user lever per the "no global fake clock" non-goal), `lastBackupAt` (days-ago → ISO, `-1` → `null`), `subCanceled`, `plan`, the full `reminder` triple, `storePurchase`/`storeRestore`, `headlineFont`/`roundness`, `textLength`, and a `gaps` preset layer (`'none'|'one'|'scattered'` strings, backward-compatible with raw offset arrays). Fixed the accent bug in the same pass: `palette` now looks up `SHOP_PALETTES` and writes the swatch into `settings.accent`, mirroring `RitualsApp.retint()`. `src/dev/generateEntries.js`'s `buildEntries` gained `textLength` (a long multi-paragraph fixture pool). `src/dev/scenarios.js` grew 8 new presets (`lapsed`, `reminderOn`, `staleBackup`, `neverBackedUp`, `longName`, `canceledSub`, `nightAmoled`, `storeFailure`).
- **Part B — notification control room.** `src/dev/inspectNotify.js` (pure): `describePending(scheduled, now)` normalises all of expo's trigger shapes (`{type:'date',value}`, `{date}` as `Date` or ISO string, seconds-based time-interval, and an unreadable trigger) into sorted `{when, inLabel, title}` rows, never crashing; `diffIntendedVsPending(intended, pending, toleranceMs)` greedily matches intended `Date`s against pending rows, answering "did the OS actually take what we asked for?" `src/dev/notifyProbe.js` mirrors `src/reminders/io.js`'s lazy-`require('expo-notifications')` in try/catch exactly (never a static import — Expo Go on Android has had no notification support since SDK 53), adding `available/getPermission/requestPermission/listScheduled/fireTestIn/cancelAll` with zero business logic. `src/dev/panel/NotifySection.js`: permission row + Request/Open-OS-settings, live `Enabled`/`Hour`/`Minute` controls calling the app's **real** `setSettings` (exercising `rearmReminders`'s actual dependency array, not the knob/Apply path), `Re-arm now`/`Cancel all`/`Fire test in 10s` actions, and the Intended-vs-Pending diff — re-read after every action, never cached, since `rearmReminders` cancels everything on the next foreground.
- **Parts C–E — inspector, overlay launcher, apply safety, and the panel split.** New `src/dev/inspect.js` (pure): `inspectState(slice, todayKey)` → grouped rows (Journal/Progress/Economy/Cosmetics/Settings/Storage), computed through the app's own real helpers (`currentStreak`, `longestConsecutiveRun`, `levelFromXp`, `deriveAchievements`, `serialize`) rather than a parallel calculation. The panel was split into `src/dev/panel/`: `controls.js` (`Stepper`/`Toggle` plus new `Segmented`/`TextField`); `StateSection.js` (scenario picker + a real control for **every** knob in the Part A table — the wiring Part A's own session note flagged as deferred); `InspectSection.js` (renders `inspectState` plus impure device facts — `Platform`, `PixelRatio.getFontScale()` next to `MAX_FONT_SCALE`/`CHROME_FONT_SCALE`, window dims, safe-area insets, app/native versions, and `expo-updates`' `runtimeVersion`/`channel`/`updateId`/`isEmbeddedLaunch` — plus an `Export current state` button via `backupIO.exportFile`); `LaunchSection.js` (direct-open buttons for Celebration with a streak+milestone picker, Achievements, Shop, Get Embers, Reminder sheet, Toast, Reading sheet, Restore notice, and — the one Part D item needing a dev-local workaround — **Paywall/Manage subscription rendered in a fully local Modal**, bypassing `RitualsApp`'s `PLUS_ENABLED`-gated one entirely rather than flipping the flag itself, so Part A's store-simulation knobs are actually exercisable on a free-shipping build). **Safety net:** `StateSection`'s Apply/Reset both run through `Alert.alert` confirm and write a recovery copy (`backupIO.writeRecovery(createBackup(...))`) *before* the destructive action — mirroring `runConfirmedImport`'s guarantee exactly, so a failed recovery write blocks the replace. A module-level `let lastKnobs` (never persisted) survives closing the modal. New `src/dev/sentinel.js` holds `SENTINEL`; every dev module now exports `DEV_ID = \`${SENTINEL}/<name>\``, and `DevPanel.js`'s footer *renders* the joined list — rendering (not just exporting) is what stops the minifier dropping an unreferenced const, so the grep covers every dev module, not just `DevPanel`. `DevPanel.js` itself shrank to a thin shell (collapsible sections + the footer).
- **The one prod-visible cost.** `RitualsApp.js` gained exactly one inert `useState`: `const [devRestoreMs, setDevRestoreMs] = useState(null)`, feeding `restoredAtMs={devRestoreMs ?? restoredFromMs}` — lets the launcher show IMP-029's restore notice without a real uninstall/reinstall cycle. Everything else the launcher needs (celebration/achievements/shop/toast/reading callbacks, a `plusFlow` prop bundle, `getSlice`/`appVersion`) is plain props/closures passed from inside the pre-existing `__DEV__ && DevPanel &&` block — no new hooks outside it.
- **TDD:** RED→GREEN on `buildState`/`generateEntries`/`scenarios` extensions (Part A), `inspectNotify` (14 cases, Part B), `inspect` (8 cases: every group present, each group's derivation matches the real helper, empty-slice case — Parts C–E). No render tests for panel chrome (non-goal, same as harness v1).
- **Verification:** `npm test` → **367 passed, 43 suites** (from 329/41 pre-Part-A; +38 across all three parts, zero product-logic changes to shipping files besides the one `devRestoreMs` line). `npx expo export --platform android` → 996 modules, clean. Sentinel grep against the exported `dist/**/*.hbc` → `OK: harness stripped from release bundle`; `dist/` deleted after each check.
- **Ship:** **NONE** — dev-only, stripped from release bundles, no bump, no `Release-Lane` trailer on any of the 3 commits (`e1dc59c` Part A, `4e677d0` Part B, `11488ea` Parts C–E). Rides whenever the owner next ships a build.
- **Not yet done:** the emulator/device walk from the spec's Verification section (long-press About → walk each section → Apply a preset → confirm prompt → Inspector agrees with the screen) and the full smoke test (reminder round-trip, `staleBackup`/`longName` scenarios, Restore notice) — logged as an open device-walk debt alongside IMP-029/030/031.
- **Deliberately out of scope (own finding, not fixed here):** no `setNotificationHandler` anywhere in the tree, so a reminder firing while the app is foregrounded shows nothing on Android — a real product decision nobody's made yet, tracked under "Open items / blockers" in PROGRESS.md.

---

### IMP-034 — hide "Gather Embers" while the app ships free   ·   Lane: OTA   ·   Status: ✅ code-complete

- **Problem.** `Shop.js` rendered the "Gather Embers" section — `EMBER_PACKS` at `$1.99 / $4.99 / $9.99` — with no `plusEnabled &&` wrapper, unlike the Plus banner ten lines above it. The buy handler (`getEmbers` in `RitualsApp.js`) was a bare `setEmbers((e) => e + pack.amount)` — no `purchaseService`, no RevenueCat, no IAP — so the shipping free build displayed cash prices for something free and handed out 1,500 embers for a tap on "$9.99". Same misrepresentation class IMP-028 fixed on the paywall.
- **Fix.** Wrapped the "Gather Embers" section in `Shop.js` behind `plusEnabled &&`, matching the existing Plus banner pattern. Added `openGetEmbers()` in `RitualsApp.js` — routes to `setGetEmbersOpen(true)` when `PLUS_ENABLED`, otherwise shows a toast with the existing copy *"Embers also gather on their own — one for every day you keep"*. `buyPalette`/`buySky`/`buyCandles`'s insufficient-embers branch and the header `EmberPill`'s `onGetEmbers()` (no-pack) call now both route through it. The `getEmbersOpen` `Modal` itself is gated `visible={PLUS_ENABLED && getEmbersOpen}`, matching the paywall/manage-subscription pattern already in the file, so no route can reach it even if a future caller forgets the check.
- **Out of scope, deliberately:** wiring real consumable IAP — may never happen, pending the ember-currency strategic decision under Open items in PROGRESS.md.
- **Tests:** new `src/screens/Shop.test.js` (first render test in this codebase — `@testing-library/react-native` was already a devDependency, unused until now). Two cases: `plusEnabled={false}` → no `EMBER_PACKS` price string and no "Gather Embers" heading; `plusEnabled={true}` → both present. `useTheme()`'s context default (`ThemeContext` is created with a real default theme object) means `Shop` renders standalone with no `ThemeContext.Provider` wrapper needed.
- **Verification:** `npm test` → **369 passed, 44 suites** (367 baseline + 2 new).
- **Ship:** OTA, no bump. Committed without a `Release-Lane` trailer — not shipped this session. **Commit:** `fix(shop): hide the cash ember packs while the app ships free (IMP-034)`.

---

### IMP-044 — the dev client ships to the public (enable R8)   ·   Lane: BUILD   ·   Status: 🟢 code-complete, **UNSHIPPED — device walk outstanding**

- **Trigger.** Play Console, 2026-08-08: *"Your app uses deprecated APIs or parameters for edge-to-edge."* Five APIs, three origins. **Two are React Native 0.81.5 core and cannot be fixed here** — `StatusBarModule` (`setColor`, `getTypedExportedConstants`) and `WindowUtilKt` (`enableEdgeToEdge`, `statusBarHide/Show`, both `LAYOUT_IN_DISPLAY_CUTOUT_MODE_*`). They are live code, and `expo/android/proguard-rules.pro` explicitly pins `-keep class com.facebook.react.views.view.WindowUtilKt { *; }`, so R8 will never touch them. **They clear when Meta migrates upstream, not before — do not re-investigate.** The app's own code is clean: `expo-status-bar` is used with `style` only ([`App.js:119/127`](../App.js#L119)), and no `androidStatusBarColor` / `androidNavigationBar` is set anywhere.
- **The actual finding — the third origin was ours.** `expo.modules.devlauncher.…DevLauncherExpoActivityConfigurator.setColor`: the **dev client was inside the production AAB**. `expo-dev-client` is a plain `dependencies` entry and an unconditional `plugins` entry, so `expo-dev-launcher` autolinks into every variant. Play's scan is **static DEX analysis** — it flags the class whether or not it ever executes.
- **It never executed.** `DevLauncherExpoActivityConfigurator` lives in the library's `src/main` sourceset, but its only consumer (`DevLauncherExpoAppLoader`) lives in `src/debug`, which release never compiles; the `src/release` `DevLauncherController`/`DevLauncherPackageDelegate` are inert stubs returning empty lists. So it was **dead bytecode + a whole Compose UI + its resources** riding to every user. An upstream sourceset filing mistake, not a live code path — which is why nothing ever misbehaved.
- **Why R8 and not an autolinking exclude (decided — do not re-litigate).** There is **no per-variant exclusion**. `expo-modules-autolinking` reads `exclude` **only** from `package.json` → `expo.autolinking` (`build/commands/autolinkingOptions.js`), and gradle forwards it verbatim (`scripts/android/autolinking_implementation.gradle:205`). `package.json` is static JSON and cannot branch on build type, so a blanket exclude would also kill local `expo run:android`. Shrinking is the supported lever and removes the rest of the dead weight too. *(The rejected alternative — a config plugin injecting `exclude:` into `settings.gradle` gated on `EAS_BUILD_PROFILE` — is viable but strictly more machinery for the same outcome.)*
- **What changed** — [`app.config.js`](../app.config.js), `expo-build-properties.android` only. **No app code, no JS, no native source.** `enableMinifyInReleaseBuilds: true` · `enableShrinkResourcesInReleaseBuilds: true` · `extraProguardRules` (two rules, below). Note `enableProguardInReleaseBuilds` is **deprecated** in expo-build-properties 1.0.10 — most online guides still use the old name.
- **Wiring verified end-to-end, not assumed:** `extraProguardRules` → appended to `android/app/proguard-rules.pro` (`withAndroidProguardRules`, `expo-build-properties/build/android.js:115`) → consumed by `android/app/build.gradle:119` `proguardFiles …, "proguard-rules.pro"`, **inside `buildTypes.release`**. The toggles land in `gradle.properties` and are read at `build.gradle:69` (`findProperty(…) ?: false`) and `:116–118`. **Debug builds are entirely untouched — local `expo run:android` is unaffected.**
- **Keep rule 1 — `-keep class expo.modules.notifications.** { *; }` patches a real upstream gap.** Every native dep was audited for proguard coverage. Covered already: `react-native` and the RevenueCat AARs ship their own `proguard.txt` (`-keep class com.revenuecat.** { *; }` + the kotlinx.serialization keeps); `expo`, `expo-modules-core`, `expo-updates` and `react-native-svg` declare `consumerProguardFiles`. Third-party RN modules with no rules at all (`async-storage`, `safe-area-context`) are covered by RN's blanket `-keep class * implements com.facebook.react.bridge.NativeModule { *; }` and its `@ReactProp` keeps. **`expo-notifications` is the one hole: it ships `android/proguard-rules.pro` but never declares `consumerProguardFiles`, and the expo module gradle plugin does not auto-wire it**, so its keeps are silently dropped. Unpatched, R8 could have stripped IMP-031's daily reminders — silently, in production. Its own rule is applied verbatim.
- **Keep rule 2 — `-dontobfuscate` is a deliberate safety valve, not an oversight.** R8 does two separable jobs: **shrinking** (removing unreachable code — this is what drops the dev launcher, i.e. the entire point of the task) and **renaming**. Renaming is what actually breaks live apps, by mangling names something looks up at runtime via reflection, serialization or a manifest string. On the **first minified build of a shipping app**, keeping the win and dropping the risk is the right trade; it costs a few % of DEX size. Bonus: production stack traces stay human-readable, so a Play crash report needs no mapping-file retrace. **Revisit only once a minified build has been device-walked clean.**
- **TDD:** N/A — build configuration, no testable unit. `npm test` → **367 passed, 43 suites**, which is the *unchanged baseline* and proves only that nothing regressed. Config additionally validated against the plugin's own `validateConfig()`.
- **⚠️ Verification status — NOT proven.** Jest never exercises R8; static file-reading cannot prove a minified build behaves. **This is the first-ever minified build of this app, and the failure mode is silent stripping at runtime, not a compile error.**
- **Ship:** **not bumped, deliberately.** A native change wants `npm run bump:native`, which closes the OTA lane for 1.0.5 — and eleven OTA tasks are queued ahead of this. Per the standing rule, land the OTA work first and let this ride the same build. **Commit:** `chore(android): enable R8 so release builds drop the dev client (IMP-044)` · `Release-Lane: build`
- **Not yet done — the device walk. Every item is a strip candidate:** daily reminder fires (IMP-031) + tap routes correctly (IMP-054) · paywall loads live prices + Restore purchases (IMP-028) · JSON export **and** restore (IMP-020) · `eas update` still applies (`expo-updates`) · all SVG icons render · custom fonts load · Auto Backup restore notice still fires (IMP-029). **Confirm the win too:** app bundle explorer → no `expo.modules.devlauncher` classes, and note the AAB size delta. **If something is stripped:** add the specific keep rule — do **not** disable minify wholesale. Full revert is both flags to `false`.

---

### IMP-042 — the Keepsakes/Achievements screen does not scroll   ·   Lane: OTA   ·   Status: ✅ code-complete

- **Problem.** `Achievements.js` (opened from Home's "Keepsakes" row and the You-tab keepsakes tile) didn't scroll, while every other modal screen in the app did.
- **Static reading ruled out the obvious theories first (kept from the spec, still true):** structure is materially identical to `Shop.js` (which the owner reported scrolls fine) — same outer `<View flex:1>` → header → `<ScrollView contentContainerStyle={...}>` with no `style` prop, same `Modal animationType="slide" presentationStyle="overFullScreen"` wrapper. Content isn't "already fitting" either — 11 achievement cards at ~92dp each ≈ 1,010dp of content against a ~650–900dp viewport, so there's real overflow to scroll. Nothing follows the ScrollView in the tree.
- **Root cause: the missing `style={{ flex: 1 }}` on the ScrollView is exactly the bug, once RN's actual sizing behaviour is accounted for.** Without an explicit `flex` (or height) style, a `ScrollView` inside a column-flex parent sizes to its **content's intrinsic height** rather than the parent's available viewport — it never establishes a viewport smaller than its content, so internally there's nothing for it to consider "overflow" and scroll. The outer `flex:1` View then clips the excess visually, which reads as "the screen doesn't scroll" even though content extends past it. `Shop.js` has the identical omission and was likely never truly exercised against enough overflow to expose it (or was borderline on the device it was checked on) — it needed the same fix and got it in the same pass, matching the spec's instruction to audit every modal for this while in there.
- **Fix, applied to every modal-mounted screen sharing this exact pattern** (bare `<View flex:1>` → header → single content `ScrollView`, no footer bar): `Achievements.js`, `Shop.js`, `ReadingSheet.js`, `GetEmbers.js`, and `ManageSubscription` (`PlusFlow.js`). Each ScrollView now carries `style={{ flex: 1 }}`, and each `contentContainerStyle.paddingBottom` now adds `insets.bottom` (previously a bare number) — required regardless of the scroll bug, since SDK 54 forces edge-to-edge (IMP-027) and the last card would otherwise sit behind the system nav bar. `Paywall.js` was left alone: its ScrollView sits above a separate fixed footer bar that already carries `paddingBottom: 14 + insets.bottom`, a structurally different (and already-correct) layout.
- **Not done, and explicitly deferred to the device walk:** the spec's fallback step 2 (`onLayout`/`onContentSizeChange` instrumentation) was not needed — the fix above is a well-understood, standard RN gotcha, not a guess — but it has **not been verified on a real device or emulator this session** (none was available). If a screen still doesn't scroll after this ships, that instrumentation is the next move, not another theory.
- **Tests:** none added — this is a layout-only change with no pure-logic surface (same non-goal as every other sheet's render behaviour). `npm test` → **369 passed, 44 suites**, unchanged baseline, proving no regression.
- **Ship:** OTA, no bump. **Commit:** `fix(ui): make modal ScrollViews actually fill the viewport so they scroll (IMP-042)`.

---

### IMP-040 — "keepsake" means three different things   ·   Lane: OTA   ·   Status: ✅ code-complete

Why it didn't make sense: the word was used for three unrelated concepts. (1) The daily-rites footer — *"finish to earn today's keepsake"* — where nothing called a keepsake is actually granted; completing quests pays XP/embers. (2) The **Achievements** screen, whose kicker was literally "Keepsakes" and which is reached from a Home row and a You tile of the same name. (3) The unbuilt **keepsake PDF** perk.

**✅ DECIDED 2026-08-04** (owner asked for the recommendation; the app keeps BOTH an achievements system and a daily-missions system, so all three concepts need distinct names). Earlier draft said to reserve "keepsake" for the PDF — reversed after weighing it properly. A keepsake is *a small thing kept in memory*, which describes an earned honour far better than a document, and "Keepsakes" was already the label users know on the Home row and the You tile. Renaming it would churn the surface users already navigate, to free a word for a feature that doesn't exist yet.

| Concept | Name | Change made |
| --- | --- | --- |
| The three **daily missions/goals** | **Daily rites** (kept — already on-voice) | Footer now names the real reward: [`gamify.js:113`](../src/gamify.js#L113) — "finish to earn today's embers" (both the in-progress and all-done copy). |
| The **achievements** system | **Keepsakes** — *"small honours for showing up — earned, never bought"* | Dropped the redundant second title on [`Achievements.js:29`](../src/screens/Achievements.js#L29) — the screen showed kicker "Keepsakes" **and** headline "Achievements"; now a single "Keepsakes" headline. |
| The **PDF export** | **Your Book** — *"your days, as a book"* | [`data.js:148`](../src/data.js#L148) `PLUS_PERKS` line reworded to "Your Book — export your days as a PDF"; the deferred IMP-022 spec below (Part A heading, `buildKeepsakeHtml` → `buildBookHtml`) and the perk-list references in PROGRESS.md's subscription-track section updated to match. |

Net: one word, one meaning, and the only user-visible rename landed on a feature that hasn't shipped yet. **Tests:** none added — copy-only, no new logic. `npm test` → **369 passed, 44 suites**, unchanged baseline. **Ship:** OTA, no bump. **Commit:** `fix(copy): give "keepsake" one meaning across rites, achievements and Plus (IMP-040)`.

---

### IMP-043 — recoverability pass   ·   Lane: OTA   ·   Status: ✅ code-complete

**Why:** the owner, 2026-08-04 — *"A paying customer who somehow loses their data or phone and wants the reload on the new device will not get it."* Part bug, part silence. Landed before anyone can pay.

**1 + 1b — the store is now authoritative, not the local `plus` cache.** New `src/billing/entitlementSync.js`:
- `checkEntitlement(service)` — never throws; returns `{ verified: true, entitlement }` on a successful call (`entitlement` is `null` when the store definitively has none), or `{ verified: false, entitlement: null }` when the call itself failed (network/unavailable). This distinction is the whole fix, and it required a real change to `src/billing/revenueCatService.js`: `getEntitlement()` used to `.catch(() => null)`, which made "the network is down" and "you have no subscription" **indistinguishable** — a forged `plus:true` in a restored backup could never be corrected because a failed check and a successful-empty check looked identical. It now lets the error propagate; `checkEntitlement` is the only caller that matters and it interprets the throw correctly.
- `nextPlusState(plus, result)` — pure: unverified → `plus` unchanged (offline-first — losing network must never cost a paying subscriber their access, full stop); verified with no entitlement → `false` (**the missing branch** that closes the backup-tampering revenue hole — a forged `"plus": true` in an exported/restored JSON now gets corrected the next time the app is foregrounded with connectivity); verified with an entitlement → `true`.
- `useLaunchEntitlementCheck({ plus, service, onEntitlementFound })` — the lost-phone bug fix. Runs `checkEntitlement` **once, on mount, only when `plus` starts `false`** (`useEffect` with an empty dep array + a ref guard, so it never re-fires on a later `plus` flip). A returning subscriber whose local cache reads `false` — fresh install, an IMP-033 quarantine, a corrected forged flag — is silently re-verified instead of staying locked out until they find Restore Purchases behind the paywall.
- Wired into `RitualsApp.js`: the existing `AppState` "active" effect (unchanged trigger — still only checks while `plus` is already `true`) now routes through `checkEntitlement`/`nextPlusState` instead of the old `if (!ent) return`, so a periodic check that comes back **verified-empty** now actually downgrades; a periodic check that **fails** changes nothing, same as before. `useLaunchEntitlementCheck` is a second, independent hook call for the `plus === false` case. **The sim service can never trigger the downgrade branch by construction** — `createSimService`'s `alreadyPlus` is a snapshot of `plus` at the time the memoized `service` was built, so while `plus` is `true` the sim's `getEntitlement()` always resolves truthy; it can only go `null` after `plus` has already gone `false` some other way, at which point downgrading is a no-op.
- **New "Restore purchases" row in the You tab**, outside the paywall (`plusEnabled && !plus`) — `YouScreen.js`'s Plus/Shop section, wired to the existing `doRestore()`. Once `plus` is `true` the equivalent action lives in Manage Subscription, so the row disappears rather than duplicating it.

**2 — backup health is loud, not silent.** New `src/backup/backupHealth.js`: `backupHealth(lastBackupAt, now)` → `'never' | 'stale' | 'ok'`, 30-day boundary **inclusive** (day 30 is still `'ok'`; day 31 is `'stale'`) — same `DAY_MS` math as the existing `lastBackupLabel.js`, kept as a separate file since one is a status gate and the other is display copy. `YouScreen.js`'s "Your journal is safe" card now shows a warning line when health isn't `'ok'` (different copy for never-backed-up vs. stale), and — when health **is** `'ok'` — a gentler one-line nudge at real milestones: `entriesCount === 100 || entriesCount === 365`. The `=== ` (not `>=`) is deliberate: it needs no dismissal/persisted flag to stop firing, the same derived-not-stored spirit as every other signal in this app (IMP-021, IMP-024) — it just naturally stops being true the next day.

**3 — said plainly at the point of purchase.** One line added to `Paywall.js`, between the perk list and the plan selector: *"Your journal lives on your device. Plus adds memory, not storage."*

**4 — goodwill channel: no new code needed.** Re-read the tree before building anything: `doGetHelp()` (`RitualsApp.js`) already routes to `RevenueCatUI.presentCustomerCenter()` when billing is configured, falling back to a `dailyrituals.app/support` toast otherwise, and is already reachable from Manage Subscription's "Get help" row — that already **is** the support channel item 4 asked for. Building a full About-sheet support surface would mean reviving **IMP-022**, which the owner deliberately deferred (2026-07-31) and which PROGRESS.md explicitly says not to start without the owner reviving it — so left alone. **Play promo codes** need zero code (issued from Play Console against a user's receipt); noted here as the remaining "make someone whole" lever, unblocked whenever the owner wants it.

**Tests (all pure/hook, no AppState mocking needed):** `__tests__/billing/entitlementSync.test.js` — `checkEntitlement` (entitlement / definitive-null / throws), `nextPlusState` (all four verified×plus combinations plus both unverified cases), `useLaunchEntitlementCheck` via `renderHook` (fires exactly once and reports when `plus` starts `false`; never fires when `plus` starts `true`; silent on both a definitive-empty and a failed result). `__tests__/backup/backupHealth.test.js` — never/ok/the 30-day boundary pinned both sides/long-stale. `npm test` → **385 passed, 46 suites** (369 + 16 new). `npx expo export --platform android` clean (caught and fixed one collision: `YouScreen.js` already imports RN's own `Alert` for `Alert.alert`; the new `Alert` icon from `src/icons.js` is aliased `AlertIcon`).

**Ship:** OTA, no bump. **Commit:** `feat(recovery): restore Plus on a new device, warn on stale backups (IMP-043)`.

---

### IMP-039 — streak-freeze candles do nothing → made real (streak insurance)   ·   Lane: OTA   ·   Status: ✅ code-complete

**Why:** audited 2026-08-04 after the owner said "I don't even know how the candles work… not sure it even works." `freezes` was bought, displayed and persisted, but nothing anywhere decremented or consumed it — `currentStreak` derived purely from journaled days, so a user could own 5 candles, miss a day, and still break to 0. **Owner decided option (a): make them real.**

**The mechanic — streak insurance, not a manual action.** `currentStreak(keys, todayKey, { frozenDays })` (`src/insights/dateKeys.js`) now treats a frozen day exactly like a real journaled day for both the anchor check (today not logged, but yesterday frozen → still alive) and the backward walk — without ever writing a fake row into `entries` (no back-filling). New `applyAutoFreeze(entries, frozenDays, freezes, todayKey)` (`src/home/streakFreeze.js`) is the pure spend: it looks only at the gap strictly after the most recent entry (older gaps are already broken and irrelevant), and covers each missed day chronologically, one candle each, until freezes run out. If a gap is longer than the candles owned, only the affordable prefix gets frozen — the rest of the gap still breaks the streak, so a candle can be burned without actually saving a long absence (matches how real streak-freeze products behave).

**Where it fires.** A new mount-only effect in `RitualsApp.js` (same pattern as the existing daily-reset effect) runs `applyAutoFreeze` against the initial `entries`/`frozenDays`/`freezes` on every launch and persists the result if anything was spent — so a user who never opens the write flow still sees their streak protected the next time they check the app, which is the point of "insurance" over a manual light-a-candle action. `frozenDays` is a new persisted key (`src/persistence/state.js`), threaded through the derived `streak` `useMemo`, `applyCompletion`'s `celebrate.streak` (so the celebration number matches what's displayed), the autosave effect and `currentSlice()` (backups/export carry it).

**Copy fix (the two false Shop claims this task was audited for).** [`Shop.js`](../src/screens/Shop.js): "Light one on a missed day and your streak holds" (nothing did) and "Plus gives you 3 free each month" (granted once, in `subscribe()`, never recurs) → replaced with one line describing the real mechanic: "A candle spends itself the moment you miss a day, keeping your streak alive." `PLUS_PERKS` #2 (`src/data.js`) reworded from "Three streak-freeze candles, every month" to "Streak insurance — a candle spends itself when you miss a day" — matching the PROPOSED FINAL PERK LIST row already written in PROGRESS.md's subscription-track section, and honest without needing to build actual monthly-recurring grants (the one-time welcome grant on `subscribe()` is untouched and no longer misdescribed).

**Tests:** `currentStreak` — a frozen gap day bridges an older run to today, multiple consecutive frozen days bridge a bigger gap, a frozen yesterday keeps the run alive before today is logged, a non-adjacent frozen day does nothing, backward-compatible with no `frozenDays` option. `applyAutoFreeze` — no entries/no freezes/no gap → no-op; a single missed day; a multi-day gap spends one candle per day in order; freezes running out mid-gap covers only the affordable prefix; idempotent (already-frozen days never re-spent, a second call is a true no-op); only the gap after the most recent entry is ever considered (older gaps untouched); today itself is never frozen. `applyCompletion` — `celebrate.streak` counts a frozen gap day; ignores `frozenDays` that don't connect to today. `frozenDays` persists (`PERSISTED_KEYS`, `pickPersisted`). `npm test` → **406 passed, 47 suites** (385 + 21 new). `npx expo export --platform android` clean.

**Ship:** OTA, no bump. **Commit:** `feat(streaks): make freeze candles real — auto-spend as streak insurance (IMP-039)` — committed without a `Release-Lane` trailer (owner said "go" on implementation, not ship; first attempt included the trailer by mistake, corrected via `git commit --amend`, unpushed, safe).

### IMP-041 — teach the app   ·   Lane: OTA   ·   Status: ✅ code-complete

**Why:** owner, verbatim — "need to make the app easy to use for everyone. Need tutorials and stuff, same for the perks that are not listed anywhere in the app right now." Beyond first-run `Onboarding.js` there was no explanatory surface anywhere: streak, embers, candles, rites, XP/levels and keepsakes were all unexplained numbers, and `PLUS_PERKS` rendered only inside the paywall.

**Decided design (Opus, executed as specced).** Dismissible tip cards, not anchored coach marks — a coach mark needs `onLayout` measurement and survives neither font-scale nor rotation. New pure `src/content/tips.js` exports `TIPS` (3 entries, one per `today`/`archive`/`you` — `insights` deliberately excluded, IMP-045 owns what's unclear there) and `EXPLAINERS` (6 entries, one per mechanic), plus `pendingTip(screen, seenTips)` and `markTipSeen(seenTips, id)` (never mutates). `src/screens/TipCard.js` is purely presentational — `Card`-shaped, `Info` icon, `Close` button, props in/callback out.

**Wiring.** `seenTips` threaded through `RitualsApp.js` exactly like `frozenDays` (IMP-039): `useState` from `initialState`, into the autosave effect's dep array, `currentSlice()`, and `PERSISTED_KEYS` (`src/persistence/state.js`). `RitualsApp.js`'s `screen()` switch computes `pendingTip('today'|'archive'|'you', seenTips)` per case and passes `tip`/`onDismissTip` down; `HomeScreen`, `ArchiveScreen` and `YouScreen` each render `<TipCard>` as the first child of their `ScrollView` when a tip is pending, dismissing via `markTipSeen`.

**"How it works"** — a new card in `YouScreen.js`, placed directly above "Your journal is safe": six `Row`s, one per `EXPLAINERS` entry, `onPress` firing `Alert.alert(title, body, …)` — same pattern as `explainAutoBackup`. **"What's in Plus"** — new `src/screens/PlusPerks.js`, a full-screen sheet rendering `PLUS_PERKS`, opened from a `YouScreen` row mounted only when `plusEnabled` (per Decided design C — `PLUS_PERKS` still carries untrue lines while the app ships free, so the sheet must not exist outside a build where every line is honest).

**Teaching empty states.** `ArchiveScreen.js` at `entries.length === 0` now shows "Nothing here yet." copy in place of the (previously blank) list, heatmap unchanged. `InsightsScreen.js`'s empty-state copy gained a second line naming what will appear.

**Bundled truth fix.** `gamify.js`'s rites card claimed embers are earned by finishing the rites ("finish to earn today's embers"). False — embers come from `applyCompletion` for writing the day; rites award XP only (+10 each). Replaced with `'All rites kept — a full day.'` / `` `${kept} of ${quests.length} kept today.` ``.

**Tests:** `src/content/tips.js` only (screens get no render tests, same non-goal as every other screen). `pendingTip` returns the tip for an unseen screen · null once seen · null for `insights` · tolerates `undefined`/`null` seenTips. `markTipSeen` returns a new array without mutating the input · idempotent. Every `TIPS`/`EXPLAINERS` id unique; every `TIPS.screen` one of `today`/`archive`/`you`; every `EXPLAINERS` entry has non-empty `label`/`title`/`body`. `npm test` → **417 passed, 48 suites** (406 + 11 new). `npx expo export --platform android` clean.

**Ship:** OTA, no bump. **Commit:** `feat(learn): explain every mechanic in-app — tips, How it works, What's in Plus (IMP-041)` — no `Release-Lane` trailer (owner said "go" on implementation only).

---

### IMP-035 — search your journal   ·   Lane: OTA   ·   Status: ✅ code-complete

**Why:** there was no search anywhere in the tree — the archive was write-only, a category-level failure for a journal, and the thing blocking every "revisit your past" sale built on top of it. Never gated — this is custody of the user's own words, free even after `PLUS_ENABLED` flips.

**Pure core.** New `src/insights/search.js` — `foldDiacritics(s)` tries `s.normalize('NFD').replace(/[̀-ͯ]/g, '')` and falls back to `s` unchanged if `normalize` throws (Hermes doesn't guarantee it across this app's range); `normalize(s)` folds + lowercases + trims; `searchEntries(entries, { text, moods, from, to } = {})` filters nullish entries first, then applies a case/diacritic-insensitive substring match over `did` + `wished` combined, an any-of match against `moods`, and inclusive `dayKey` bounds on `from`/`to` — sorted newest-first. Reads `e.mood` (singular) deliberately; IMP-037 owns the switch to `e.moods` and updates this file when it lands. No regex built from user input, no fuzzy matching in v1.

**UI.** New `src/screens/ArchiveFilters.js` — presentational, props in/callbacks out (`{ text, moods, from, to, onChange, resultCount }`): a `TextInput` search field, a horizontally scrolling mood-chip row built from `MOODS` (same chip shape as `WriteFlow.js`'s mood picker, multi-select instead of single), and two date buttons that open a `Modal` + scrollable month list (last 24 months, "Any time" to clear) — no date-picker library, built from primitives already used elsewhere in the app (`Modal`, `ScrollView`, `Pressable`). Selecting a month sets `from` to its first day or `to` to its last day.

**Wired into `ArchiveScreen.js`.** One `useState` query object (`{ text: '', moods: [], from: null, to: null }`), `ArchiveFilters` rendered under the header only when `entries.length > 0`, and `searchEntries(entries, query)` feeds the entry-row `.map` in place of the raw `entries`. The heatmap keeps using the full `entries` — it's a record of the year, not of the query. A distinct empty-result state — *"Nothing matches that yet. Try fewer words, or a wider stretch of days."* — renders only when a filter is active and yields zero results, separate from the existing zero-entries "Nothing here yet." state.

**Tests:** `__tests__/insights/search.test.js` — empty/omitted query returns everything · text matches across both `did` and `wished` · case folding · diacritic folding · `foldDiacritics` returns the input unchanged when `normalize` throws (stubbed) · mood filter single and multi · date bounds inclusive at both ends · combined text + mood + date · no matches → `[]` · results newest-first · malformed entries (missing fields, `null` in the array) never throw. `npm test` → **431 passed, 49 suites** (417 + 14 new). `npx expo export --platform android` clean.

**Ship:** OTA, no bump. **Commit:** `feat(search): full-text + mood + date search over the journal (IMP-035)`.

---

### IMP-036 — custody of your words: edit, delete, 30-day trash   ·   Lane: OTA   ·   Status: ✅ code-complete

**Why:** answers the owner's "how do you edit/delete a day that's already gone?" Entries were write-once — only today could be edited, nothing could be deleted — which made the archive a one-way ledger. **Editing is free** (nothing derived reads entry text); **deleting is free**; **restoring from trash is the Plus half** — keeping a safety copy is our work, charging someone to un-write their own grief is not.

**Pure core.** New `src/entries/mutate.js`, every function returning a new object, never mutating: `applyEdit(entries, dayKey, { did, wished, mood })` replaces the day in place (same array position/id/dayKey), a no-op (same reference) when the day is absent — structurally makes back-filling unreachable. `applyDelete({ entries, trash }, dayKey, nowMs)` moves the entry into trash stamped with `deletedAt`; it deliberately takes no `xp`/`embers` parameters at all, so it is structurally incapable of clawing them back (they're persisted counters, not derived, and the day was genuinely lived). `applyRestore({ entries, trash }, dayKey)` re-inserts the entry in `dayKey` order, matching the newest-first convention every other producer in the tree already uses (`applyCompletion` prepends, `dev/generateEntries` walks back from today). `pruneTrash(trash, nowMs, days = 30)` drops anything past the window, keeping the exact 30-day boundary. `streakAfterDelete(entries, dayKey, todayKey, frozenDays)` returns the `currentStreak` a delete would produce — confirm-copy only, computed before the user commits.

**The `applyCompletion` trap this spec called out — routed around, not into.** `applyCompletion` only takes its no-reward edit branch when `prev.done` is true, so editing a **past** day while today is unwritten would otherwise fall into the reward branch and award a duplicate 50 XP + 15 embers + a prepended duplicate row. `RitualsApp.js` now tracks `editingDayKey` (null = the normal today flow) alongside `writing`; when set, `WriteFlow`'s `initial` is sourced from that past entry instead of `findTodaysEntry`, and `onComplete` routes to a new `editPastEntry` (→ `applyEdit`) instead of `complete` (→ `applyCompletion`). `closeWriting()` clears both `writing` and `editingDayKey` together so the two states can never drift apart.

**Wiring.** `trash` is a new persisted key (`src/persistence/state.js` — no schema bump, `mergeWithDefaults` already supplies `[]`), threaded through `RitualsApp.js` exactly like `frozenDays`/`seenTips`: `useState`, the autosave effect's dep array, `currentSlice()`. A mount-only effect (same shape as IMP-039's `applyAutoFreeze` catch-up) runs `pruneTrash` against the initial trash on every launch. `ReadingSheet.js`'s edit gate loosened from `isEditableToday` to "any existing entry" (`canEdit={!!reading}`); a new destructive "Delete this day" row calls a new `onDelete` prop. `RitualsApp.js`'s `confirmDeleteEntry` computes `streakAfterDelete` and whether the delete would un-earn an achievement (`deriveAchievements` before/after) *before* showing `Alert.alert` with the real post-delete streak number and, only when true, "One of your keepsakes may go with it." New `src/screens/TrashSheet.js` — a full-screen sheet listing trash items with **Restore** (Plus-gated: real when `plus`, opens the paywall when `plusEnabled && !plus`, shows a "coming soon" toast when `!plusEnabled` since there's no Plus to sell yet) and **Delete forever** (free, confirmed) — opened from a new "Recently deleted" row in `YouScreen.js`'s "Your journal is safe" card, showing the live count.

**Tests:** `__tests__/entries/mutate.test.js` (22 cases) — `applyEdit` preserves id/dayKey/array position, doesn't mutate its input, leaves streak/xp unaffected, is a same-reference no-op on an absent `dayKey`. `applyDelete` moves the entry into trash with `deletedAt`, returns only `{ entries, trash }` (structurally proving xp/embers are untouched), doesn't mutate its input, is a same-reference no-op on an absent `dayKey`, and a mid-run delete provably breaks `currentStreak` (3 → 1). `streakAfterDelete` matches `currentStreak` on the post-delete entries directly, including with `frozenDays`. `applyRestore` re-inserts in `dayKey` order (middle/oldest/newest cases), drops the `deletedAt` stamp, is a same-reference no-op on an absent `dayKey`, doesn't mutate its input. `pruneTrash` drops >30d, keeps the exact 30-day boundary, drops one millisecond past it, keeps items well within the window, doesn't mutate its input. `npm test` → **453 passed, 50 suites** (431 + 22 new). `npx expo export --platform android` clean.

**Ship:** OTA, no bump. **Commit:** `feat(entries): edit any past entry, delete with a 30-day trash (IMP-036)`.

---

### IMP-037 — moods: custom feelings + multiple per entry   ·   Lane: OTA   ·   Status: ✅ code-complete

**Why FREE (settled, do not reverse):** a mood is stored content — part of what the user wrote. Gating custom/multi moods would mean a lapsed subscriber's own entry (`['restless','proud']`) rendering as one mood, none, or breaking outright — every answer either lies about their entry or hides it. Gate compute, never content: the paid layer is IMP-047's analysis over these moods, not the moods themselves.

**Migration is the whole risk, so it went first.** `SCHEMA_VERSION` 2 → 3 in `src/persistence/state.js`, new migrator `2:` calling `migrateMoods(entry)` on every entry: idempotent (`'moods' in entry` → returned as-is), `{ mood: 'Tender' }` → `{ moods: ['Tender'] }` with the old key dropped via destructuring, no-mood entries → `moods: []`. `mergeWithDefaults` is a shallow top-level spread and never reaches inside `entries`, which is exactly why a real versioned migrator was required instead of a default-fill. Tests written RED-first in `__tests__/persistence/state.test.js`: full serialize→deserialize round-trip, single-mood migration, no-mood migration, idempotency on an already-migrated entry, a v3 payload passing through untouched, a v1 payload migrating all the way to v3 (through v2's entries-reset, so it legitimately lands on `[]`), and every other persisted key surviving untouched.

**Pure readers, one pass each:** `src/insights/derive.js` — mood mix now iterates `e.moods` per entry (an entry with two moods contributes to two buckets) and returns a new `moodEntryCount` (entries with ≥1 mood) as the honest denominator, since percentages no longer sum to 100. `src/insights/search.js` — mood filter is now `(e.moods || []).some((m) => moodSet.has(m))`, any-of over the array. `src/home/calendar.js` — heatmap/week-strip cells use `entry.moods[0]` (first mood only; cells stay single-mood by design). `src/home/completeEntry.js` — the `feel` quest checks `entry.moods.length > 0` instead of truthy `entry.mood`. `src/entries/mutate.js` — `applyEdit`'s patch takes `moods` instead of `mood`. Existing test files for all five updated in the same commit to fixture `moods: [...]`, plus new cases for the two-moods-per-entry and denominator behavior. A reader missed by the original exhaustive list — `src/profile/achievements.js`'s test fixtures (`moodsLogged` stat, sourced from `derive.js`'s `moodMix`, so the source needed no change, only its test fixtures) — surfaced as a real test failure on the first full suite run and was fixed the same way.

**Write flow.** `WriteFlow.js`'s mood step is multi-select (`moods` array state, `toggleMood` adds/removes) rendering `[...MOODS, ...customMoods]` as chips, plus a "Name your own…" `TextInput` + Add button that appends to the selection and calls a new `onAddCustomMood` prop. `RitualsApp.js` adds `addCustomMood(m)` — dedups into `settings.customMoods` — and passes it plus `settings.customMoods || []` into `WriteFlow`; `DEFAULT_SETTINGS` in `theme.js` gains `customMoods: []`, so `mergeWithDefaults` fills it in for existing users with no migration needed (settings aren't schema-versioned). `complete()` and `editPastEntry()` in `RitualsApp.js` now build/patch entries with `moods` instead of `mood`.

**Display surfaces:** `ArchiveScreen.js` and `ReadingSheet.js` render one chip per mood (`e.moods.map(...)`) instead of a single chip. `InsightsScreen.js` adds the honest `across {moodEntryCount} reflections` line under the "Mood mix" title, shown only when there's data. `data.js`'s `SAMPLE_ENTRIES` and `dev/generateEntries.js` both produce `moods: [...]` arrays.

**Final sweep:** `grep -rn "\.mood\b|mood:" src/` → only the migration's own explanatory comment remains; zero singular-`mood` readers.

**Tests:** `npm test` → **465 passed, 50 suites** (453 + 12 new: 7 migration + 2 derive + 1 search + 1 calendar + 1 achievements-fixture fix implicit). `npx expo export --platform android` clean.

**Ship:** OTA, no bump. **Commit:** `feat(moods): multiple + custom feelings per entry, with migration (IMP-037)`.

---

### IMP-047 — deeper insights: the analysis layer (perk #5)   ·   Lane: OTA   ·   Status: ✅ code-complete

**Why:** `PLUS_PERKS` #5 ("Deeper insights — moods & seasonal themes") was sold with zero backing —
`InsightsScreen.js` had no `plus` checks at all, so free and Plus users saw identical insights. This is
the third of five perks made real, over IMP-037's mood arrays.

**Pure core.** New `src/insights/deeper.js`, three functions plus an honesty gate, all reusing the
`localDate`/Mon-first-index pattern already established in `derive.js` (each insights module owns its own
small date helpers rather than sharing them): `moodByWeekday(entries)` → 7 Mon-first buckets
`{ l, top, n, total }` (`top` the modal mood for that weekday, `null` on a tie or an empty bucket — a tie
never guesses); `moodByMonth(entries)` → 12 calendar-month buckets `{ month, moods: [{m,n}], total }`
aggregated across years (the "seasonal" read), sorted by count descending; `moodPairings(entries)` → mood
pairs that co-occur within one entry, `[{a,b,n}]`, pair order normalised alphabetically so `[a,b]`/`[b,a]`
count once — `[]` for entries that are all single-mood, which is the function that makes IMP-037's
multi-mood model worth having built. `hasEnoughFor(kind, entries)` gates each: `weekday` needs **≥14**
entries, `month` needs **≥3** distinct months, `pairings` needs **≥5** multi-mood entries — below the
threshold the UI shows "Not enough days yet" instead of a chart drawn from three data points.

**UI.** New `src/screens/DeeperInsights.js` — presentational, `{ entries, onOpenPaywall, locked }`. Reuses
`InsightsScreen.js`'s existing bar-chart and mood-mix-row shapes rather than inventing a new chart idiom.
`locked` renders a single teaser card (title, one line, a `Sun`-icon "Unlock with Plus" pill routing to the
paywall) instead of computing anything. Mounted from `InsightsScreen.js` beneath "Your patterns": `plus` →
full section, `plusEnabled && !plus` → locked teaser, `!plusEnabled` → nothing (same discipline as
IMP-034/IMP-041). `InsightsScreen` gained `plus`/`plusEnabled`/`onOpenPaywall` props, threaded from
`RitualsApp.js` where both already exist in scope — `onOpenPaywall` follows the same
`PLUS_ENABLED ? () => setPaywall(true) : () => {}` pattern used at every other paywall entry point.

**Perk copy:** `PLUS_PERKS[4]` ("Deeper insights — moods & seasonal themes") already matched what shipped
(weekday, season/month, pairings) — no string change needed.

**Tests:** `__tests__/insights/deeper.test.js` (17 cases) — 7 Mon-first buckets · modal mood per weekday ·
`top: null` on a tie · `top: null` for an empty weekday · 12 month buckets sorted by count · empty months
→ `total: 0` · a 3-mood entry counts as its 3 pairs · `[b,a]`/`[a,b]` normalise to one row · pairs sorted
by `n` descending · all-single-mood entries → `[]` · `hasEnoughFor` at each threshold, exactly at the
boundary and one below (14/13, 3/2, 5/4) · every function tolerates `moods: []`, missing `moods`, or `null`
inside the array without throwing. `npm test` → **482 passed, 51 suites** (465 + 17 new). `npx expo export
--platform android` clean.

**Ship:** OTA, no bump. **Commit:** `feat(insights): the deeper analysis layer — mood by weekday, season, pairing (IMP-047)`.

---

### IMP-033 — the restore is offered, not imposed   ·   Lane: OTA   ·   Status: ✅ code-complete

**Why:** the IMP-029 walk (2026-08-02) proved the failure mode was real, not rare — Android Auto Backup
restored **stale** data with zero consent on the reinstall path, and the notice it triggered offered only
*Got it* or *Restore from a file*, no way to decline. Android's restore can't be intercepted (it lands at
install time, inside the OS, before JS runs) — so the fix quarantines what it forces on us instead.

**Pure core.** New `src/persistence/restoreQuarantine.js`: `shouldQuarantine` (delegates to IMP-029's
`isRestoredInstall`, just names the decision for this flow) · `shouldOfferRestore({ hasStash, onboarded })`
· `preferredSource({ lastSavedAt, lastBackupAt })` → `'google' | 'file'`, ties and unparseable input favour
`'google'` (no coercion — a non-finite `lastSavedAt` or an unparseable ISO `lastBackupAt` is treated as
absent, never as 0) · `runQuarantine({ readRawState, writePendingRestore, readPendingRestore, clearState })`
orchestrates the verified stash-before-clear sequence with fully injected IO, mirroring
`backup/importFlow.js`'s shape — the live key is **never** cleared unless the stash write is confirmed
readable back · `pendingRestoreInventory(stash)` formats the paid-inventory line (embers/palettes/skies/
candles) shared by the offer sheet and the discard confirm.

**Stash IO** in `src/persistence/storage.js`: `readRawState()` (the undeserialized string — a
forward-migration must never mutate what a decline later restores), `writePendingRestore` /
`readPendingRestore` / `clearPendingRestore`, each `try/catch` → falsy on failure, no throwing. Added the
package's own in-memory `AsyncStorage` mock to `jest.setup.js` (the file had never been unit-tested before —
IMP-033 is its first real round-trip test).

**Sequencing** in `App.js`'s existing load effect: `shouldQuarantine` runs on the same `lastSavedAt` check
IMP-029 already made; on quarantine success the app hydrates as `{}`/`onboarded: false` (a genuine first
install — `Onboarding` shows with no change there) and stashes the parsed payload in a new `pendingRestore`
state; on an aborted quarantine (unverified write) it falls straight through to IMP-029's existing
`RestoreNotice` path, live data untouched. `pendingRestore` and a new `onConsumePendingRestore` (clears the
stash both in storage and in state) are passed down to `RitualsApp` alongside the existing IMP-029 props.

**UI.** New `src/screens/RestoreOffer.js` — presentational scrim-and-card sheet, same shape as
`RestoreNotice.js` (its local `GhostButton` is now extracted to `src/ui.js` and shared by both). States
every warning from the spec: replaces the fresh start · dated staleness · paid-inventory-at-risk · and, when
`preferredSource` says the JSON export is newer, inverts emphasis to lead with **Restore from a file**.
Three actions always present: **Load my journal** / **Restore from a file** (whichever leads) / **Keep this
fresh start**. Mounted from `RitualsApp.js` when `pendingRestore && !restoreOfferDismissed` — the local
`restoreOfferDismissed` flag is what lets "Keep this fresh start" hide the sheet **without discarding the
stash**, per the owner's explicit rejection of a one-tap destructive dismissal.

**Actions (`RitualsApp.js`).** `handleLoadPendingRestore` confirms, then writes a recovery copy of the
*current* (fresh) state before replacing — via the existing `runConfirmedImport` orchestration, the same
safety guarantee `doImport` already had — then calls `onConsumePendingRestore`. `handleDiscardPendingRestore`
confirms with the inventory line repeated, then consumes. Declining ("Keep this fresh start") surfaces a new
row in the You tab's "Your journal is safe" card — `Google backup — {date}` reopens the sheet, a separate
"Discard" pressable (not a hidden long-press — spec called for a real, discoverable action) deletes it.

**Copy fix (bundled from the same walk).** Both the `explainAutoBackup` alert and the export success toast
now say plainly that the JSON export and the Google Auto Backup are separate systems and neither refreshes
the other — the owner hit exactly this and misread a correct restore as a stale-data bug.

**Tests:** `__tests__/persistence/restoreQuarantine.test.js` (21 cases) — `shouldQuarantine` delegation ·
`shouldOfferRestore`'s four stash/onboarded combinations · `preferredSource`'s newer-file/newer-google/
missing/tie/non-numeric cases · `runQuarantine`'s happy path plus every abort path (no raw state, failed
write, null read-back, unparseable read-back) each asserting `clearState` was never called ·
`pendingRestoreInventory`'s joining, singular/plural and empty cases. `__tests__/persistence/storage.test.js`
(5 cases, new file) — stash round trip, stash/live-key independence in both directions, `readRawState`
returning the exact raw string. `npm test` → **508 passed, 53 suites** (482 + 26 new). `npx expo export
--platform android` clean.

**Ship:** OTA, no bump. Reaches **testers only** (`runtimeVersion` = `appVersion` = 1.0.5). **Commit:**
`feat(restore): offer an OS-restored backup instead of imposing it (IMP-033)`.

---

### IMP-038 — "On this day"   ·   Lane: OTA   ·   Status: ✅ code-complete

**Why:** `PLUS_PERKS[2]` sold a meaningless line — *"Your whole graveyard, kept forever"* — relief from a
history limit that never existed. "On this day" is the first genuinely **new** Plus feature in the queue
rather than debt repayment: worthless on day 1, priceless on day 400, and already in the app's voice
(IMP-013's "Tend an old grave" rite gestures straight at it).

**Pure core.** New `src/memory/onThisDay.js` → `onThisDay(entries, todayKey)` → `[{ entry, label,
monthsBack }]`. Year matches (same month-day, any past year) take strict priority over month fallbacks —
month fallbacks at 6/3/1 months back are only computed when zero year matches exist. Both orders are
newest-first (`n` ascending for years; offset ascending 1→3→6 for months). All comparisons are done on the
`YYYY-MM-DD` string components (`parts(dayKey)` + a `daysInMonth(y, m)` helper), never by adding
milliseconds to a `Date` — that's what makes 29 Feb never false-match 28 Feb in either direction, and a
31-day month falling back into a shorter one skip the offset entirely rather than rolling over into the
next month. Malformed entries (`null`, missing `dayKey`) are filtered out up front and never throw.

**UI.** New `src/screens/OnThisDayCard.js` — presentational, `{ matches, locked, onOpen, onDismiss,
onOpenPaywall }`. Returns `null` on an empty `matches` (the caller is expected to only mount it on days
with a match — "never an empty state" from the spec). `locked` renders a one-card teaser ("The app found
something you wrote on a day like this" + a `Sun`-icon "Unlock with Plus" pill, same shape as
`DeeperInsights.js`'s locked branch) instead of revealing anything. The unlocked branch reuses
`ArchiveScreen.js`'s day/mon-numeral entry-row shape, one row per match, each labelled with its own
`onThisDay()` string. A dismiss (✕) sits in the shared header for **both** branches, per the spec's single
prop set — dismissing is not gated behind having Plus.

**Wiring.** `HomeScreen.js` computes `onThisDay(entries, todayK)` itself (own `todayK =
new Date().toISOString().slice(0,10)`, matching the UTC-day convention `home/calendar.js`'s pure helpers
already default to) and gates it on a new `onThisDayDismissed` prop — matches are suppressed entirely once
`onThisDayDismissed === todayK`. Mounted above the "Today's reflection" card. New `HomeScreen` props:
`plusEnabled`, `onThisDayDismissed`, `onDismissOnThisDay`, `onOpenOnThisDay`, `onOpenPaywall`. `locked` is
derived as `!plus`, matching every other perk gate in the tree. `RitualsApp.js` threads all five: `plus`/
`plusEnabled` already existed in scope; `onDismissOnThisDay` writes `settings.onThisDayDismissed =
todayKey()` (a single string, not a set — self-pruning the moment the day changes, same discipline as
IMP-021/024); `onOpenOnThisDay` reuses the **exact** `onOpen` handler `ArchiveScreen.js` already gets
(`setReading(e)` + `setQuests((qs) => markRevisited(qs, e, todayKey()))`) rather than duplicating the
revisit-rite logic; `onOpenPaywall` follows the standing `PLUS_ENABLED ? () => setPaywall(true) : () =>
{}` pattern. `DEFAULT_SETTINGS` (`src/theme.js`) gained `onThisDayDismissed: ''`; no migration needed
(settings aren't schema-versioned, `mergeWithDefaults` fills it in for existing installs).

**Perk copy:** `PLUS_PERKS[2]` (`src/data.js`) — the cut line `'Your whole graveyard, kept forever'` →
`'On this day — your own words, brought back to you'`. Array stays 5 long; no other slot moved.

**Tests:** `__tests__/memory/onThisDay.test.js` (11 cases) — exact year-ago match · non-matching
month/day excluded · multiple years at once, newest first · month fallbacks at 6/3/1, newest first ·
month fallbacks suppressed when any year match exists · leap day non-match in both directions (2024-02-29
vs 2027-02-28, and the reverse) · 31→28/29-day rollover produces no false match · empty history → `[]` ·
same-day multiple entries each returned · malformed entries (`null`, missing `dayKey`) never throw. `npm
test` → **519 passed, 54 suites** (508 + 11 new). `npx expo export --platform android` clean.

**Ship:** OTA, no bump. Reaches **testers only** (`runtimeVersion` = `appVersion` = 1.0.5). **Commit:**
`feat(memory): "On this day" resurfacing (IMP-038)`.

---

### IMP-046 — Annual Recap: "your year, remembered" (perk #4)   ·   Lane: OTA   ·   Status: ✅ code-complete

**Why:** roadmap piece C, and the paywall line *"Your year, remembered"* that had no code behind it. A
recap is the emotional payoff of a whole year — the single most quotable thing this app can produce — and
it absorbs the milestone timeline IMP-021 deliberately deferred to "roadmap piece C". This is that piece.

**Extraction first.** `countWords` moved out of `src/insights/lifetime.js` into new `src/insights/words.js`
and re-imported there, so the recap and Lifetime Progress can never drift apart. `lifetime.test.js` stayed
green untouched.

**Pure core.** New `src/recap/annualRecap.js`:
- `recapYears(entries, now)` → offerable years, newest first. A year is offerable from **1 December of
  that year onward** (checked via `now.getMonth() === 11`, any day in December) and **every earlier year
  forever after** (`y < nowYear`, unconditionally). Both are filtered to years with **≥ 10 entries** — the
  same floor `buildRecap` enforces, so a filtered-in year is always buildable.
- `buildRecap(entries, year, { xp, now })` → `{ year, daysRemembered, totalWords, longestStreak,
  firstEntry, lastEntry, topMoods, peakMonth, quietestMonth, milestones }`, or `null` below the 10-entry
  floor — a recap of four days is worse than no recap. Entries are filtered strictly to the target year
  (`dayKey.slice(0,4)`) before every year-scoped stat, so a 31 Dec / 1 Jan entry on either boundary is
  correctly excluded, and `longestStreak` (via `longestConsecutiveRun`, reused from `dateKeys.js`) is
  computed **within the year only** — a run spanning the year boundary is NOT credited to either year in
  full.
- `topMoods` reuses IMP-047's `moodByMonth` counting rather than writing a second mood counter — the
  year's entries go through `moodByMonth`, and its 12 per-month buckets are merged into one set of mood
  totals, sorted by count then alphabetically on a tie, top 3 kept.
- `peakMonth`/`quietestMonth` scan the same `moodByMonth` buckets' `.total` field for the strict max/min,
  so a tie always keeps the **earlier** month (only a strict improvement moves the pointer).
- **Milestones — where IMP-021's deferred timeline lives, and nowhere else.** A local day-by-day walk over
  the **full account history** (not just the target year — a streak can start in December and cross a
  threshold in January) tracks the running consecutive-day count using `dayKeyToUtcMs`/`DAY_MS` from
  `dateKeys.js`; whenever that running count lands on a `STREAK_MILESTONES` key (7/30/100) **and** the
  crossing day falls inside the target year, it's recorded. A `'First entry of the year'` entry for the
  year's own `firstEntry` is always prepended, then the list is sorted chronologically. A crossing that
  happens in the prior year (even mid-run, continuing into the target year) is correctly excluded.

**Screen.** New `src/screens/AnnualRecap.js` — presentational, `{ recap, onClose, insets }`. Sectioned like
`InsightsScreen`'s "Your record" card: hero number (days remembered) + a 2×2 totals grid (words, longest
streak, busiest/quietest month), a top-moods bar card (reusing the `InsightsScreen`/`DeeperInsights` bar
shape), and a milestone timeline card ("The year, marked") — one dot-and-label row per entry in
`recap.milestones`, date formatted via a local `localDate`/`shortDate` pair (same UTC-off-by-one-avoiding
convention as `insights/deeper.js`).

**Home card.** New `src/screens/AnnualRecapCard.js`, mirroring `OnThisDayCard.js`'s shape exactly:
`{ year, locked, onOpen, onDismiss, onOpenPaywall }`, returns `null` on no year, `locked` renders the same
`Sun`-icon "Unlock with Plus" teaser pattern. `HomeScreen.js` mounts it only in the **1 Dec – 31 Jan**
window (`RECAP_WINDOW_MONTHS = [11, 0]`) when `recapYears(entries, now)[0]` exists and hasn't already been
dismissed for that year (`recapSeen !== topRecapYear`); new `HomeScreen` props: `recapSeen`,
`onDismissAnnualRecap`, `onOpenAnnualRecap`.

**You-tab row.** New "Your years" section in `YouScreen.js` — **permanent**, not window-gated, "what stops
the feature disappearing for eleven months of the year." `!plusEnabled` → section doesn't render at all.
`plusEnabled && !plus` → one locked row with a Plus chip routing to the paywall (same visual pattern as the
"Save as PDF" row already there). `plus` with zero offerable years → one informational row ("Unlocks after
your first full year"). `plus` with years available → one tappable row per year, opening that year's
recap. New `YouScreen` props: `entries`, `onOpenAnnualRecap`.

**RitualsApp wiring.** New `openRecapYear` state (`null` = closed) opened by either surface via
`onOpenAnnualRecap(year)`; a single `Modal` (matching every other full-screen sheet's
`animationType="slide" presentationStyle="overFullScreen"` shape) lazily computes
`buildRecap(entries, openRecapYear, { xp })` only while open. `onDismissAnnualRecap(year)` writes
`settings.recapSeen = year` — a single number, not a set, so an old dismissal can never hide a later year
(same discipline as IMP-038's `onThisDayDismissed`). `DEFAULT_SETTINGS` (`src/theme.js`) gained
`recapSeen: null`.

**Perk copy:** `PLUS_PERKS` (`src/data.js`) — **appended** `'Your year, remembered — the Annual Recap'` as
a new 6th entry, per the spec's explicit instruction not to renumber the existing five (the dead PDF perk
stays at its own slot, untouched — that's IMP-022's territory, still deferred).

**Tests:** `__tests__/recap/annualRecap.test.js` (13 cases, RED-first) — the Dec-1/Nov-30 offer boundary on
both sides · every prior year offered forever · a sub-10-entry year omitted · empty history → `[]` ·
newest-first ordering · `buildRecap` returns `null` below the floor · year-boundary entries excluded from
both neighbours · `longestStreak` computed within the year (a 6-day cross-boundary run reads as 3) ·
`topMoods` capped at 3, alphabetical on a tie · `peakMonth`/`quietestMonth` tie-break to the earlier month
· a milestone crossing in the prior year excluded from the target year, a same-year crossing included with
the correct day · malformed entries never throw. `npm test` → **532 passed, 55 suites** (519 + 13 new).
`npx expo export --platform android` clean.

**Ship:** OTA, no bump. Reaches **testers only** (`runtimeVersion` = `appVersion` = 1.0.5). **Commit:**
`feat(recap): the Annual Recap — your year, remembered (IMP-046)`.

---

### IMP-048 — three free restores, then Plus (the undisclosed trash gate)   ·   Lane: OTA   ·   Status: ✅ code-complete + **emulator-walked 2026-08-09**

**Why:** found by the owner on the 2026-08-09 emulator walk of IMP-036. Restoring from Recently deleted was
Plus-only with **zero disclosure** — the button looked live, and pressing it did nothing visible. The
"Undelete is part of Plus" toast fired through `showToast`, which renders in `RitualsApp`'s tree **behind**
the trash `Modal`, so it only flashed once the sheet closed and the user was back on the You tab. Two
defects in one tap: an undisclosed paywall, and a dead button. Owner's decision: **make restore free three
times, then Plus, and say so plainly on the page.**

**Owner decision (2026-08-09) — the cap is enforced even while Plus is unbuyable.** With
`PLUS_ENABLED = false` there is nothing to sell, so a fourth restore could have been quietly allowed. It is
not: what a tester sees today is exactly what ships after the flag flips, so "free 3 times" is never
worth more than it says and the behaviour never silently changes on launch day. The alternative (unlimited
until Plus is sellable) was rejected as the same promise-shift class this app has spent IMP-031/034/039/040
removing. Cost, accepted knowingly: a tester who spends all three before Plus exists waits for the launch —
the day still sits in trash for the rest of its 30 days either way.

**Pure core.** New `src/entries/restoreAllowance.js` — `FREE_RESTORES = 3`; `freeRestoresLeft(used)`;
`restoreAccess({ used, plus, plusEnabled })` → one of four kinds: `'plus'` (unlimited, spends nothing) ·
`'free'` (one of the three) · `'locked'` (spent, Plus purchasable → paywall) · `'unavailable'` (spent, Plus
not on sale yet); `consumeFreeRestore(used, plus)` (never charges a subscriber, clamps at `FREE_RESTORES`).
A `used` that is missing, non-finite, negative or a string reads as **none used** — a corrupt or
hand-edited backup must never cost someone their allowance, so the failure direction is deliberately
generous.

**Disclosure — the actual point of the task.** `TrashSheet.js` renders the allowance in a card at the top
of the screen, above the list, before anything is pressed: full (*"free your first 3 times. All 3 are still
yours."*), partial (*"free 3 times — 1 is left."*), `locked` (*"used all 3… Plus brings back any day, any
time"* plus a "See what's in Plus" pill), `unavailable` (*"…becomes part of Plus, which isn't on sale
yet."*). The per-row button reads its own state — outlined/muted and relabelled **"Restore with Plus"**
once the three are gone, so it can never look live when it isn't. Restoring confirms first, and the **last
free one names itself**: *"it's your last one. After this, bringing days back is part of Plus."*

**Every message on this screen is `Alert.alert`, deliberately, and this is the bug fix.** The sheet lives
inside a `Modal`; the app's `Toast` renders in `RitualsApp`'s tree and is therefore **behind** it.
`onRestoreBlocked`/`showToast` is gone entirely, and the `'Restored'` success toast was dropped for the
same reason — the row leaving the list and the allowance line ticking down are visible feedback, a toast
that appears 30 seconds later on a different screen is not.

**Wiring.** `freeRestoresUsed` is a new persisted key (`PERSISTED_KEYS`, `src/persistence/state.js`) —
no schema bump, absent keys hydrate through `initialState.freeRestoresUsed ?? 0`. Threaded through
`RitualsApp.js` exactly like `frozenDays`/`seenTips`/`trash`: `useState`, the autosave dep array,
`currentSlice()` (so it rides both the JSON export and Auto Backup). `restoreFromTrash` **re-checks
`restoreAccess` itself** rather than trusting the sheet, and bails on an absent `dayKey` before spending,
so no future caller can burn a fourth. Dev harness: `buildState` emits `freeRestoresUsed` and
`StateSection` gained a "Free restores used (of 3)" stepper — note `buildState` still does not emit
`trash`, so Apply clears it; set the knob, Apply, *then* delete a day.

**Tests:** `__tests__/entries/restoreAllowance.test.js` (14 cases, RED-first) — the allowance counting down
and never going negative · a missing/`NaN`/negative/string count reading as none used · all four
`restoreAccess` kinds including both `plusEnabled` values at exhaustion · the cap being spent identically
while the paid surface is off · `restoreAccess()` with no argument · `consumeFreeRestore` spending,
never charging a subscriber, clamping at 3, and normalising corrupt input. `npm test` → **559 passed, 57
suites** (545 + 14 new). `npx expo export --platform android` clean.

**Walked:** owner confirmed on the emulator 2026-08-09 — three free restores tick down, the fourth is
visibly locked and explains itself, and the state survives a relaunch.

**Ship:** OTA, no bump. Reaches **testers only** (`runtimeVersion` = `appVersion` = 1.0.5). **Commit:**
`feat(entries): three free restores, then Plus — and say so before it's spent (IMP-048)`.

---

### IMP-045 — finish Lifetime Progress (the IMP-021 shortfall)   ·   Lane: OTA   ·   Status: ✅ code-complete

**Why:** closed the two deviations from the approved 2026-06-14 Lifetime Progress design that made the
owner call IMP-021 "not properly completed" on the 2026-08-02 device walk. Not a crash — a completeness
gap. Both shortfalls were in scope by owner decision (2026-08-08); no design choice left to make.

**Pure core first (RED-first).** New `src/insights/heatCells.js`, no theme imports:
- `cellState(cell)` → `'done' | 'missed' | 'empty' | 'future'`, precedence `future` > `missed` > `empty` >
  `done` (a `done` cell that is also `today` still reads `done`; a `future` cell that also carries `empty`
  stays `future`).
- `monthLabelsForRows(rows)` → one string per row, the short month name (`'Jan'`) on the row whose first
  cell begins a new month, `''` otherwise, always attempting a label on row 0. Rows/cells missing a
  parseable `dayKey` return `''` rather than throwing.

**Screen.** `InsightsScreen.js`'s `LifetimeHeat` now consumes `cellState` for four-way styling instead of
the old binary `has` check: `done` = filled `c.accent` (2px `c.accentDeep` border if `today`), `missed` =
`c.accentSoft` fill with a 1px `c.border` border (visibly a day, visibly empty — matches IMP-014's meaning
without using the skull glyph, which is unreadable at this cell size), `empty` = transparent with a dashed
1px `c.border` border, `future` = fully transparent, no border. A month-label gutter runs down the left of
the grid (one `monthLabelsForRows` entry per row) and a three-item legend ("kept · missed · not yet
started") sits beneath, reusing the same `heatCellStyle` swatches so the legend can never drift from the
grid. `buildLifetimeHeatmap` (`src/home/calendar.js`) was untouched — its cell shape already carried
everything needed.

**xpEarned.** The level context line at `InsightsScreen.js` (inside the "Your record" hero) went from
`` `Lv {level} · {levelName}{activeSpan}` `` to `` `Lv {level} · {levelName}{activeSpan} · {fmt(xpEarned)}
XP` ``, reusing the screen's existing `fmt` thousands-formatter and `numberOfLines`/font-scale behaviour
(IMP-030) unchanged. `deriveLifetime` already returned `xpEarned` — nothing in its logic changed.

**Not touched, by design:** the milestone timeline (deferred to IMP-046, now built), the Home hero, and the
removed "Days kept"/"This month" tiles. Row count stays uncapped.

**Tests:** `__tests__/insights/heatCells.test.js` (13 new cases) — all four states · both precedence rules
· row 0 always labelled · labels only on month-change rows · an all-same-month run yields blanks after row
0 · a single-row grid · an empty `rows` array → `[]` · malformed rows/cells without `dayKey` never throw.
`npm test` → **545 passed, 56 suites** (532 + 13 new). `npx expo export --platform android` clean.

**Ship:** OTA, no bump. **Commit:** `fix(insights): finish Lifetime Progress — missed vs never-started, and
lifetime XP (IMP-045)`.

---

### IMP-049 — settings survive a corrupt restore   ·   Lane: OTA   ·   Status: ✅ code-complete

**Why:** hit for real on the 2026-08-09 emulator walk. `readBackup` validates only the envelope (`format`,
`payload` is a string) and the schema version — nothing checks the *shape* of what's inside, and
`mergeWithDefaults`'s shallow spread (`{ ...defaults, ...loaded }`) lets a wrong-typed key replace its
default outright. Demonstrated with `settings.accent` as a string (`'#C9884A'`) instead of the
`[accent, deep, soft]` array: `makeTheme` indexed it by character, `processColor` returned `null` for every
resulting non-color string, and every `LinearGradient` threw `null cannot be cast to non-null type
kotlin.Double` — unrecoverable except via Reset all data, since the poisoned settings persist to
AsyncStorage. **Scope — settings only**, by owner decision: `entries` already have defensive readers
throughout, and wrong-typed counters (`xp`, `embers`) are cosmetic, not fatal; `settings` is the one slice
whose wrong type is silently fatal because it feeds `makeTheme`, which feeds native views.

**RED-first.** New `__tests__/persistence/sanitizeSettings.test.js` (18 cases) against a module that didn't
exist yet — every case the spec required (accent: string / bad 2nd element / valid / wrong length; reminder:
null / string / bad `hour` with a valid sibling kept; `name` as a number; `customMoods` as a string;
`recapSeen: null` accepted, not looped back; an unknown key preserved for forward-compat; a missing key
stays missing; never mutates input; non-object input → `{}`) plus the required regression proving the actual
IMP-049 failure is closed end-to-end through `mergeWithDefaults` → `makeTheme` for both `'day'` and `'night'`
— and, first, that the same assertion **fails** without `sanitizeSettings` in the chain (a check that can't
fail proves nothing).

**GREEN.** New pure `src/persistence/sanitizeSettings.js` exporting
`sanitizeSettings(loaded, defaults = DEFAULT_SETTINGS)`. Shape comparison: `Array.isArray` → `'array'`,
`null` → `'null'`, else `typeof`; a key whose shape matches its default is kept, a key whose shape differs is
replaced by the default. `accent` gets its own check (array of exactly 3 strings each matching
`/^#?([\da-f]{2}){3}$/i`, or the default array wholesale — a partial repair would produce a mismatched
palette). `reminder` recurses one level. Unknown keys pass through untouched; keys missing from `loaded`
stay missing (`mergeWithDefaults` fills them afterward, unchanged).

**One case the spec didn't anticipate, found while writing the tests: `recapSeen`.** Its default is `null`,
but a real dismissal (IMP-046) stores a *year* (a number) — pure shape-vs-default comparison would reset
every dismissal back to `null` on the very next hydration, silently breaking a shipped feature every time
this fix ran. Gave `recapSeen` the same kind of per-key exception the spec already grants `accent` and
`reminder`: kept if `null` or a `number`, defaulted otherwise. Narrow, mechanical, stays inside "settings
only" — not a scope expansion.

**Wired at both hydration points, both required** — [`App.js`](../App.js) line 87 (cold-start load) and line
122 (the restore/replace path) — `setSettings(mergeWithDefaults(sanitizeSettings(s.settings),
DEFAULT_SETTINGS))`. Both matter: fixing only the restore path would leave an already-poisoned install
unrecoverable, since the poisoned settings are what cold-start loads on every subsequent launch.

**Tests:** `npm test` → **577 passed, 58 suites** (559 + 18 new). `npx expo export --platform android`
clean.

**Do NOT** (per spec, honored): no user-facing "this backup was repaired" notice, no change to
`readBackup`'s return shape, no touching the `'unreadable'`/`'too-new'` rejection reasons. Silent correction
to a known-good default is the whole behavior.

**Ship:** OTA, no bump — not shipped this chat (no `Release-Lane` trailer). **Commit:**
`fix(persistence): repair wrong-typed settings from a restore instead of rendering null colours (IMP-049)`.

---

### IMP-056 — a day is the day you lived, not the day in Greenwich   ·   Lane: OTA   ·   Status: ✅ code-complete + **emulator-walked 2026-08-10**

**Why:** found reading `src/time/clock.js` for IMP-054, not user-reported. `dayKey` — the field every
derivation keys on — was derived in **UTC** (`RitualsApp.js:83`: `new Date().toISOString().slice(0, 10)`)
while every date the user *reads* (`entryDateParts`/`todayLabel` in `clock.js`) was already **local**, and
both were stamped onto the same entry. In IST a 1am write was filed under yesterday and **silently
overwrote last night's entry**; at negative offsets (e.g. `America/New_York`) an evening write was filed
under tomorrow and didn't appear on the grid until the next calendar day arrived.

**Step 0 — reproduced before fixing.** Emulator forced to `Asia/Kolkata`, clock to 01:00 (`adb shell service
call alarm 2/3` — no root needed, and root isn't available on this AVD image). Home header already read
"Monday, 10 August" with "Today is at rest" **checked** — the app had matched Monday to Sunday's
already-stored entry (`walked at dawn`). Opening Write confirmed the destructive path: WriteFlow headed
"HERE LIES MONDAY, 10 AUGUST" but prefilled Sunday's words — saving would have overwritten them and left
Monday empty.

**RED → GREEN.** New pure `src/time/dayKey.js` — `dayKeyOf(date = new Date())` — local
`getFullYear()`/`getMonth()`/`getDate()`, zero-padded. `__tests__/time/dayKey.test.js` (6 cases) includes a
deterministic same-instant-different-key proof: pins `process.env.TZ = 'Pacific/Kiritimati'` (UTC+14) for
one assertion so a 23:30 UTC instant reads a different local calendar day than `toISOString().slice(0,10)`
— reliable in CI and on the owner's machine regardless of the real host timezone.

**The four derivation sites, and only these four, replaced:** `RitualsApp.js` (`todayKey` deleted, all 13
call sites renamed to `dayKeyOf()`, direct import) · `src/home/calendar.js` (`const keyOf = (date) =>
date.toISOString().slice(0,10)` → `import { dayKeyOf as keyOf }`, keeping the file's existing internal name
since it has 5 call sites) · `src/screens/HomeScreen.js` (`todayK`) · `src/insights/lifetime.js`
(`activeSpanLabel`'s `dayKeyToUtcMs(now.toISOString().slice(0,10))` → `dayKeyToUtcMs(dayKeyOf(now))`).
**Left alone, per spec:** `dayKeyToUtcMs`/`utcMsToDayKey` (`dateKeys.js` — operate on an existing key, UTC
is correct there for timezone-independent day arithmetic) and `shiftKey` (`calendar.js` — same reason);
`entryDateParts` (`clock.js` — already local, was the *other*, already-correct half); the backup filename;
everything under `src/dev/` (two more local `todayKey` copies exist there, both dev-only,
`__DEV__`-stripped, deliberately untouched).

**Existing tests fixed, not just made to pass again:** `__tests__/home/calendar.test.js` and
`__tests__/insights/lifetime.test.js` built their `today`/`now` fixtures via `new Date('...T12:00:00Z')`
(UTC-instant construction, safe under the old code but no longer the intent). Rewritten to construct local
noon directly (`new Date(2026, 5, 7, 12, 0)`) — same values, but now correct regardless of host timezone
instead of merely lucky within it.

**Regression test for the destructive path** — `__tests__/home/todaysEntry.test.js`, new describe block: at
a 01:00 `Asia/Kolkata` instant, asserts the **old** UTC key wrongly matches yesterday's entry
(`findTodaysEntry`/`isEditableToday` both positive) and the **new** local key correctly does not — proving
both that the bug existed and that it's closed, in one test.

**Step 5 — data-health reporter (dev-only, report-only, writes nothing).** New `dayKeyDrift(entries, trash,
todayKey)` in `src/dev/inspect.js`: for every entry/trash row whose `id` matches `/^new(\d{10,})$/` (the
creation-epoch stamp `RitualsApp.js` writes), recomputes what `dayKeyOf()` would have stamped at that
instant and counts disagreements with the stored `dayKey`; separately reports whether replacing those keys
in `entries` (not `trash` — it doesn't factor into streaks) would move `currentStreak`. Surfaced as two new
rows under a "Data health" group in the Inspector (`InspectSection.js` — no new UI code needed, its
group-rendering loop is already generic). **Read against the emulator's "Migration Test" fixture profile:
0 drift** — that data was seeded by `scripts/gen-v2-fixture.js` with ids that don't match the `new<ms>`
shape, so the reporter has nothing to compare against; **this is not evidence the bug never fired on real
devices**, just that no organically-written data has been read through the reporter yet. Real tester data
still needed before IMP-057 can be scoped — see PROGRESS.md → Open items.

**Walked both offset directions on the emulator, end to end (not just the reproduction):**
`Asia/Kolkata` 01:00 — WriteFlow now opens blank for Monday instead of prefilling Sunday, and Sunday's
entry is untouched in Reflections afterward. `America/New_York` 20:30 — wrote a real entry through to save;
streak went **12 → 13** (contiguous), Home read "Monday, 10 August" throughout, confirming the entry landed
on *today's* local date rather than skipping to tomorrow. (Two operational notes for future emulator work:
`adb shell` hangs indefinitely if the emulator's adb daemon has gone stale — kill/restart the AVD, don't
just `adb kill-server`; and an already-running RN process does **not** pick up a live OS timezone change —
force-stop + relaunch, a plain new `Intent` isn't enough, or the JS `Date` local getters keep using the
zone that was active when Hermes started.)

**Deliberately not done, per spec — the historical migration.** Existing entries keep whatever key they
were stamped with; only the derivation is fixed, so only *future* writes are correct going forward. The
residual and the IMP-057 decision are recorded in PROGRESS.md → Open items, not here — they outlive this
spec.

**Tests:** `npm test` → **588 passed, 59 suites** (577 + 11 new: 6 dayKey + 1 todaysEntry regression + 4
inspect/dayKeyDrift). `npx expo export --platform android` clean.

**Do NOT** (per spec, honored): migrate/remap/rewrite any stored `dayKey` · touch `dayKeyToUtcMs`,
`utcMsToDayKey` or `shiftKey` · change `entryDateParts` · rewrite `frozenDays`/`lastActiveDay`/
`onThisDayDismissed` · change the backup filename · introduce a timezone library.

**Ship:** OTA, no bump — not shipped this chat (no `Release-Lane` trailer). **Commit:**
`fix(time): derive the day from the user's calendar, not UTC — and stop a 1am entry overwriting last night's (IMP-056)`.

---

### IMP-050 — every mood gets a face   ·   Lane: OTA   ·   Status: ✅ code-complete

**Why:** `moodEmoji = (m) => MOOD_EMOJI[m] || ''` in `src/data.js` resolved anything outside the 8 built-in
moods to an empty string — silently blank in all 7 mood-drawing surfaces. Two distinct causes: every custom
mood from IMP-037 (no emoji was ever offered for one) and a `moods: []` entry (only ever produced by the
v2→v3 migration or a restored backup, never by the app's own UI, since mood is already mandatory).

**Two named fallbacks, no migration.** `NO_MOOD_EMOJI = '🌫️'` for `moods: []`; `CUSTOM_MOOD_FALLBACK = '✨'`
for a custom mood with no emoji on record. `moodEmoji(m, custom = {})` now
`MOOD_EMOJI[m] || custom[m] || (m ? CUSTOM_MOOD_FALLBACK : NO_MOOD_EMOJI)` — a built-in name always wins over
a custom map, and the function never returns `''` for any input, with or without the second argument.
`__tests__/data/moodEmoji.test.js` (7 cases) pins all of this, RED-first. No data migration was written or
needed — IMP-037 has never reached a device, so zero users have ever created a custom mood.

**The picker.** `MOOD_PALETTE` — 40 glyphs in `src/data.js`, chosen for Android 7 font coverage
(`minSdkVersion` 24, no Emoji 12+ glyphs). New `src/entries/emojiInput.js` → `isEmojiish(s)`, code-point
based (no `\p{...}` regex — Hermes's Unicode property-escape support wasn't worth betting the validator on),
validates the typed-emoji escape hatch: 1–8 code points, every one ≥ U+00A0. `WriteFlow.js`'s mood step
gained a horizontal palette `ScrollView` (default selection `MOOD_PALETTE[0]`, so **Add** is never blocked
on the emoji) directly above the existing "Name your own…" row, plus a small typed-emoji field — a valid
typed emoji becomes the selection and clears the palette ring; an invalid one leaves the palette pick
standing, no alert or toast. `addCustomMood` now calls `onAddCustomMood(name, emoji)` and resets both
fields. `__tests__/screens/WriteFlowMood.test.js` (7 cases, `@testing-library/react-native`) covers the
picker plus a **regression test that the mandatory-mood gate still holds** (Finish/`onComplete` fires only
once a mood is selected) — the rule the owner originally asked about.

**Persistence.** `settings.customMoodEmoji: {}` added to `DEFAULT_SETTINGS`. `sanitizeSettings.js` gained a
per-key exception matching `accent`/`reminder`/`recapSeen`'s pattern: not a plain object → `{}`; otherwise
the map is kept and only the individual values failing `isEmojiish` are dropped, so one bad glyph never
costs the user their other custom moods. 5 new cases in `sanitizeSettings.test.js`.

**The multi-mood shimmer (owner decision, 2026-08-09).** New pure `src/entries/moodFace.js` —
`hashKey(k)`/`moodFace(moods, tick, dayKey)` picks which mood a cell shows on a given tick, deterministic per
day (a `dayKey`-seeded phase offset) so every multi-mood cell doesn't animate in lockstep. New
`src/ui/useMoodTick.js` — a shared ~2500ms tick, ticking only while `AppState` is `'active'` **and**
reduce-motion is off (`AccessibilityInfo`, live-subscribed), returning `seed` (not `0`) whenever it isn't
ticking so a backgrounded or reduce-motion cell still shows a day-varying face instead of freezing on
whichever mood was tapped first. `calendar.js`'s `buildHeatmap`/`buildLifetimeHeatmap` now carry
`moods: entry.moods || []` on each cell instead of a single resolved `mood`/`emoji` pair — `calendar.js` is a
pure date-grid helper and has no business resolving glyphs. `ArchiveScreen.js`'s `Heat` computes both
`enabled` (`cells.some(c => (c.moods||[]).length > 1)`, so a grid with nothing to animate starts no timer)
and `seed` (`hashKey` of the last cell's `dayKey` — always today, so the phase changes daily with no clock
plumbing) itself, and renders `moodEmoji(moodFace(cell.moods, tick, cell.dayKey), customMoodEmoji)`.
`__tests__/entries/moodFace.test.js` (8 cases) and `__tests__/ui/useMoodTick.test.js` (4 cases,
`jest.useFakeTimers()`) cover the two pure/hook pieces independently. `__tests__/home/calendar.test.js`
updated for the field shape change — the test previously named "uses only the first mood when an entry
carries several" was renamed to "carries every mood on the cell, in order", since its old intent (drop all
but the first mood) was itself the bug this spec closes.

**Threaded `customMoodEmoji` through every consumer:** 5 mount points in `RitualsApp.js`
(`InsightsScreen`→`DeeperInsights` ×2, `ArchiveScreen`, `ReadingSheet`, `AnnualRecap`, `WriteFlow`) plus
`DeeperInsights.js`, `ReadingSheet.js`, `AnnualRecap.js` and `ArchiveFilters.js` themselves (each accepting
the prop and passing it into their own `moodEmoji()` calls). `addCustomMood(name, emoji)` in `RitualsApp.js`
now writes both `customMoods` and `customMoodEmoji` in one immutable update — re-adding an existing name
updates its emoji instead of duplicating the mood. `ArchiveFilters.js` now maps over
`[...MOODS, ...customMoods]` instead of the 8 built-ins alone, so a user-invented feeling can finally be
searched for — the same second-class treatment IMP-037 left on the retrieval surface.

**Tests:** `npm test` → **632 passed, 64 suites** (588 + 44 new: 7 moodEmoji + 13 emojiInput + 8 moodFace +
4 useMoodTick + 5 sanitizeSettings + 7 WriteFlowMood, calendar.test.js's existing count unchanged but 5
assertions rewritten for the field shape). `npx expo export --platform android` clean.

**Do NOT** (per spec, honored): write a data migration · back-fill a mood onto a `moods: []` entry · make
the heatmap cell pressable (logged to PROGRESS.md → Open items as a future IMP, not built here) · let custom
moods override the 8 built-in emoji · add a delete/rename flow for custom moods (that's IMP-055, which
depends on this) · touch `MISS_EMOJI` or any `💀` rendering.

**Ship:** OTA, no bump — not shipped this chat (no `Release-Lane` trailer). **Commit:**
`feat(entries): every mood gets a face — custom emoji, a glyph for moodless days, and multi-mood cells that breathe (IMP-050)`.

---

### IMP-051 — the keyboard stops eating the Next button   ·   Lane: OTA   ·   Status: ✅ code-complete + **emulator-walked 2026-08-10**

**Why:** three compounding causes on Android — [`WriteFlow.js`](../src/screens/WriteFlow.js)'s
`KeyboardAvoidingView` had `behavior={Platform.OS === 'ios' ? 'padding' : undefined}` (inert on Android),
WriteFlow renders inside an RN `Modal` (a separate dialog window that never gets `adjustResize`), and
`targetSdkVersion 36`'s forced edge-to-edge (IMP-027) stops the OS resizing the window for the IME at all.
Together: the keyboard fully covered the **Next**/finish button on every step, forcing a dismiss-to-tap cycle.

**Measured before theorising (IMP-042 precedent).** A temporary `keyboardDidShow` listener on the Pixel 9
Pro emulator (API 36, edge-to-edge, gesture nav) read `height=312dp`, `insets.bottom=24dp`. The reported
height extends flush to the screen's physical bottom edge (visually confirmed — the keyboard fully occluded
the footer), so it **replaces** `insets.bottom` rather than adding to it, exactly the spec's default design.
The measured numbers are logged as a comment at the `useKeyboardHeight()` call site in `WriteFlow.js`.

**New hook `src/ui/useKeyboardHeight.js`.** `useKeyboardHeight()` → a number, `0` when closed. Subscribes to
`keyboardWillShow`/`keyboardWillHide` on iOS, `keyboardDidShow`/`keyboardDidHide` on Android (the only pair
Android ever emits), storing `e.endCoordinates.height`; both subscriptions removed on unmount.
`__tests__/ui/useKeyboardHeight.test.js` (6 cases, RED-first) mocks `Keyboard.addListener` to capture and
fire handlers, covering: starts at 0 · reports the shown height · resets to 0 on hide · Android subscribes to
`did*` not `will*` · iOS subscribes to `will*` · both subscriptions removed on unmount.

**`WriteFlow.js`** — `KeyboardAvoidingView` deleted (with its now-dead `Platform` import) for a plain `View`
carrying the same style plus `paddingBottom: kb`, `const kb = useKeyboardHeight()`. `Foot` takes `kb` and
uses `paddingBottom: 12 + (kb > 0 ? 0 : insets.bottom)`. The outer `View`'s own `paddingBottom: kb` is what
actually lifts `Foot` (a non-flexed child) above the keyboard, since it shrinks the flex column's available
height from the bottom; `Foot`'s own conditional padding only governs the safe-area vs. keyboard-open case.
Covers all three steps, including the mood step's "Name your own…" field and IMP-050's emoji palette.

**`ArchiveFilters.js` and `NameEditModal.js` — confirmed already fine, left untouched, per the spec's own
instruction.** `ArchiveFilters`'s search `TextInput` sits near the top of a plain (non-Modal) `ScrollView`
tab with no footer button to occlude — walked on the emulator, field stays visible above the keyboard.
`NameEditModal` already uses `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` — Android's `'height'`
behavior is JS-driven (resizes the container directly from keyboard events) rather than relying on OS window
resize, so it was never affected by causes (2) or (3). Walked on the emulator: Save/Cancel fully visible
above the keyboard, no changes needed.

**Walked on the emulator, all branches passed — no fallback needed.** Step 0 (did) → **Next** fully visible
and tappable with the keyboard up · step 1 (wished) → same · mood step's "Name your own…" field → **Lay the
day to rest** fully visible · dismissing the keyboard restores `insets.bottom` with no stale padding. The
owner's "move Next to the top bar" fallback (step 5's documented escape hatch) was **not** needed.

**Tests:** `npm test` → **638 passed, 65 suites** (632 + 6 new `useKeyboardHeight` cases). `npx expo export
--platform android` clean.

**Do NOT** (per spec, honored): add `react-native-keyboard-controller` or any other native dependency · set
`softwareKeyboardLayoutMode`/`windowSoftInputMode` in `app.config.js` · change any `Modal`'s
`presentationStyle` · restructure the three-step flow · touch `Onboarding.js`.

**Ship:** OTA, no bump — not shipped this chat (no `Release-Lane` trailer). **Commit:**
`fix(writeflow): lift the footer above the keyboard instead of hiding Next under it (IMP-051)`.

---

### IMP-052 — tap a day, read it   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-13)

**Why:** the Reflections heatmap (`ArchiveScreen.js`) and the lifetime heatmap (`InsightsScreen.js`) were
both inert `View`s — the densest surface in the app, unclickable. The only route to an old entry was
scrolling the list below or already remembering a word to search for. IMP-035 gave the archive search; this
gives it the gesture every user tries first, unprompted, on a grid of days.

**New pure `src/entries/find.js`** — `entryForDayKey(entries, dayKey)`, resolving a dayKey collision the
same way `calendar.js`'s private `indexByDay` does: first match in array order wins ("newest wins", entries
are newest-first). Returns `null` on no match, `null`/`[]`/malformed rows (a `null` entry, a row with no
`dayKey`), never throws. `__tests__/entries/find.test.js` (8 cases, RED-first) pins all of this, including
the exact collision case `buildHeatmap` paints.

**Shared `openEntry` handler, lifted once.** `RitualsApp.js`'s inline arrow (previously duplicated only for
`ArchiveScreen`'s `onOpen`) is now a single named `openEntry` const —
`(e) => { setReading(e); setQuests((qs) => markRevisited(qs, e, dayKeyOf())); }` — passed to both
`ArchiveScreen` (`onOpen`, unchanged behaviour) and the new `InsightsScreen` `onOpen` prop. One definition,
two callers.

**`ArchiveScreen.js`'s `Heat`** (now also a named export, for direct component testing) takes `entries` and
`onOpen`. A cell that is neither `missed` nor `empty` renders as a `Pressable` instead of a `View` — everything
else stays a bare `View` with no role and no label. On press: `entryForDayKey(entries, cell.dayKey)`, guarded
— a cell can outlive its entry by one render after a delete (IMP-036), so a miss calls nothing rather than
throwing. `hitSlop={3}` (the grid gap is 6, so 3 is the largest slop that can't overlap a neighbour),
`transform: [{ scale: pressed ? 0.92 : 1 }]` (a 40dp square needs a visible amount, vs. the list cards'
`0.99`), `accessibilityRole="button"` + `accessibilityLabel` = `` `${dayKey}, ${moods.join(', ') || 'no mood recorded'}` ``.
The grid is deliberately not filtered by the search query — it shows all 35 days regardless of what the list
below is filtered to.

**`InsightsScreen.js`'s `LifetimeHeat`** gets the identical treatment: `cellState(cell) === 'done'` is the
pressable condition, same `Pressable` props, same `entryForDayKey` guard. The today-ring child (already
`pointerEvents="none"`) needed no change — it doesn't swallow the press.

**Tests:** new component test `__tests__/screens/ArchiveHeat.test.js` (5 cases, imports the now-exported
`Heat` directly so a "cell says done but its entry isn't in `entries`" state — the stale-render case — can
be constructed without going through `buildHeatmap`): pressing a written day calls `onOpen` with that day's
entry · pressing a missed/empty day calls nothing (and exposes no `accessibilityRole`/label at all) · a
written day whose entry has been removed calls nothing and does not throw · pressable cells expose
`accessibilityRole="button"`. `npm test` → **651 passed, 67 suites** (638 + 8 `find` + 5 `ArchiveHeat`).
`npx expo export --platform android` clean.

**Do NOT** (per spec, honored): open WriteFlow from any cell · filter the heatmap to match the search query ·
touch the week strip on Home · add a long-press menu · change `ReadingSheet` · touch the quest logic beyond
reusing `openEntry`.

**Ship:** OTA, no bump — not shipped this chat (no `Release-Lane` trailer). **Commit:**
`feat(archive): tap a day on either heatmap to read it (IMP-052)`.

---

### IMP-053 — search shows you the match   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-13)

**Free/Plus:** free (retrieval — a user's own words are never gated). **Origin:** found while reviewing
IMP-050, 2026-08-09; owner picked it as the next spec.

**The problem.** `ArchiveScreen.js` rendered every result card the same way whether browsing or searching —
`<T … numberOfLines={2}>{e.did}</T>`, always the first two lines of `did`, unconditionally. But
`searchEntries` matches against `normalize(`${e.did} ${e.wished}`)`. So a hit in `wished`, or a hit in the
fourth paragraph of `did`, produced a card whose visible text **did not contain the search term anywhere**,
leaving the user to open each result to find out why it was there. IMP-035 built the retrieval engine and
hid its output; this was the missing half.

**The correctness trap, and why the module is shaped the way it is.** You cannot find the match in the
normalized string and slice the original at that index. `foldDiacritics` is `normalize('NFD')` + strip
combining marks, which **changes the string's length** — and by a different amount at every accent. Emoji
make it worse: surrogate pairs mean UTF-16 and code-point indices disagree the moment anyone writes 🎂. A
naive `indexOf` on the folded string highlights the wrong characters, **and only for users who write accents
or emoji — it looks perfect in testing and is wrong in the owner's own market.** The fix is a
length-preserving, per-code-point fold, so folded index *n* always maps to original code point *n*.

**Built:** new pure `src/insights/snippet.js` importing `foldDiacritics` from `search.js` (not
re-implemented). Four exports — `foldChar` (folds, lowercases, takes the **first code point**; returns the
input unchanged if folding empties it), `foldChars` (**exactly one output element per input code point** —
the invariant the whole module rests on, asserted directly), `indexOfSeq` (naive double loop returning a
code-point index) and `entrySnippet(entry, text, { lead = 30, tail = 200 })` → `null` or
`{ field, before, match, after, truncatedStart }`. Both of `foldChar`'s guards are load-bearing and pinned:
a lone combining mark folds to `''` (map would shrink), `'İ'` lowercases to **two** code points on some
engines (map would grow). `did` is searched before `wished` and wins when both match. **A needle matching
only across the did/wished join returns `null` by design** — no single field to quote — and the card falls
back to its old rendering; tested and deliberate, not a bug to chase.

**Rendering:** new exported `ResultLine` component in `ArchiveScreen.js` replaces the hard-coded line. Outer
`T` keeps `numberOfLines={2}` (clips the tail for free); the match sits in a nested
`<T w={800} color={c.accentDeep}>` — nesting is safe because `T` always sets its own `fontFamily` and
`color`, so the highlight cannot inherit a half-style. `…` prefixes a clipped lead; a `wished ·` label in
`c.muted` appears when the snippet came from that field. Exported for the same reason IMP-052 exported
`Heat`: so the component test can construct cases directly.

**Tests:** `__tests__/insights/snippet.test.js` (28 cases) — mid-string, index 0, case-insensitive,
`'cafe'` → highlights `'café'`, the reverse, emoji-before-match (the surrogate-pair case),
`foldChars(s).length === [...s].length` over mixed accents/emoji/ASCII, wished-only, both-fields,
join-only → `null`, empty/whitespace needle, `null`/`undefined`/fieldless entries.
`__tests__/screens/ArchiveResults.test.js` (6 cases) — wished-only match renders the word **and** the label ·
a word deep in `did` renders with no label · no text query → `did` verbatim · mood-only filter → no
highlight · unmatched query falls back. `npm test` → **689 passed, 69 suites** (655 + 34).
`npx expo export --platform android` clean.

**Do NOT** (per spec, honored): change `searchEntries`, `normalize` or `foldDiacritics` · tokenize the query
into words · highlight more than the first match · add match counts, relevance scoring or sorting changes ·
touch `ReadingSheet`.

**Ship:** OTA, no bump — not shipped this chat (no `Release-Lane` trailer). **Commit:**
`feat(archive): show the matched words in search results, not the first two lines (IMP-053)`.

---

### IMP-054 — the reminder you can actually answer   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-13)

**Free/Plus:** free. **Origin:** the *"no `setNotificationHandler` anywhere in the tree"* finding logged
2026-07-31 and never scoped; a second gap (no tap routing) found alongside it 2026-08-09.

**Two gaps, one subsystem.** (a) A reminder that fires while the app is open showed nothing — Android drops
the OS banner entirely once `shouldPlaySound: false`, which is unavoidable, so the decided design (owner,
2026-08-09) suppresses the banner and shows the app's own Toast instead. (b) Tapping a reminder from outside
the app did not open WriteFlow — there was no `addNotificationResponseReceivedListener` and no
`getLastNotificationResponseAsync` call anywhere, so a tap just opened the app on whatever tab it was last
left on.

**Built:** new pure `src/reminders/route.js` — `isOurReminder(notification)` (true only when
`request.content.data.kind === 'daily-reminder'`, false for null/`{}`/foreign notifications, never throws)
and `reminderAction({ wroteToday, foreground })` → `'nudge' | 'write' | 'none'` (foreground+unwritten →
nudge; anything already-written → none, so a finished day is never nagged or forced back into the editor —
IMP-018 already makes today re-editable from Home; background tap+unwritten → write).

Scheduled reminders are now stamped `data: { kind: 'daily-reminder' }` (`RitualsApp.js`'s `rearmReminders`),
composed with the third positional `identifier` argument the 2026-08-13 duplicate-fire fix (`b773352`) added
to `scheduleAt` — **`scheduleAt(date, { title, body, data }, identifier)`**; dropping `identifier` would have
silently reintroduced two notifications a day. `io.js` gained three functions, all behind the file's
existing lazy `load()` guard (no-ops when the native module is absent): `setForegroundBehavior()` (the
handler returning all four required booleans false — `shouldShowAlert` is deprecated in the installed
`expo-notifications` 0.32.17), `onNotificationReceived(cb)`, and `onNotificationTapped(cb)`, which combines
the live listener with one `getLastNotificationResponseAsync()` check so a tap that cold-starts the app is
still caught (the listener registers too late to see it otherwise). `RitualsApp.js` wires two new effects
beside the existing reminder effects: one calls `setForegroundBehavior()` once (`[]` deps), the other
subscribes both listeners with `[entries]` deps so `wroteToday` is never stale, cleaning up on unmount/re-run.

**Tests:** `__tests__/reminders/route.test.js` (9 cases) — both functions' full decision tables plus
`isOurReminder`'s null/empty/missing-content guards. `npm test` → **698 passed, 70 suites** (689 + 9).
`npx expo export --platform android` clean.

**Also fixed in this commit:** `docs/build-log.md`'s IMP-044 walk checklist misattributed tap routing to
IMP-031, which never included it — corrected to credit IMP-054.

**Do NOT** (per spec, honored): add notification categories, action buttons or a badge count · change
`nextOccurrences`, the rolling-window design or `reminderCopy` · request permission anywhere new · make the
Toast tappable · touch `content/reminders.js`.

**Ship:** OTA, no bump — not shipped this chat (no `Release-Lane` trailer). Runtime proof is
**WALK-13** (`docs/walk-open.md`), a separate device-only task; this spec is code-complete without it.
**Commit:** `feat(reminders): answer the reminder — a foreground nudge instead of silence, and a tap that
opens the write flow (IMP-054)`.

### IMP-055 — manage your feelings   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-13)

**Free/Plus:** free (stored content — the same line IMP-037 and IMP-050 draw). **Origin:** walled out of
IMP-050 deliberately; owner asked for it 2026-08-09.

**The gap.** IMP-050 gave a custom mood a name and a face, but no way to change either — `addCustomMood`
only ever appends. A mood typed as `Anxios` at 11pm stayed in the picker, Insights and Annual Recap for the
life of the install, with no rename, delete, or re-emoji.

**Built:** new pure `src/entries/renameMood.js` — `renameMood({ entries, trash, settings }, from, to)`
rewrites `from`→`to` in every `moods` array in both `entries` and `trash`, in `settings.customMoods`
(keeping list position) and re-keys `settings.customMoodEmoji`; entries that never used the mood keep their
exact object reference, and a rename that touches nothing returns all three slices by reference.
`deleteMood({ entries, trash, settings }, name)` strips the name from `settings.customMoods` only —
`entries`, `trash` and `customMoodEmoji` come back unchanged by reference, so a day that used a deleted
mood keeps both the label and its face. `moodNameError(name, { customMoods, existing })` is the shared
validator: empty → `Give it a name.`, >24 chars → `A bit shorter.`, case-insensitive collision with a
built-in mood or another custom mood → the matching error, unchanged-name → `null`. `did`/`wished` are
never read by any of the three.

New `src/screens/MoodManager.js` — a full-screen Modal sheet in `TrashSheet.js`'s idiom, listing
`settings.customMoods` (built-ins never appear). Each row shows the emoji + name with Edit/Remove actions;
Edit expands the same `MOOD_PALETTE`/`moodEmoji` picker WriteFlow uses (already shared via `src/data.js` —
no extraction needed, it was never inline). Remove confirms with the exact behaviour stated up front:
"Remove {name} from your list? Days you already marked with it keep it." Empty state: "The feelings you
name yourself will live here."

`YouScreen.js` gained a "Your feelings" row in the "Your journal is safe" card, next to "Recently deleted"
(both are journal-content management actions) — value is the custom-mood count or "None yet". `RitualsApp.js`
wires `onRenameMood(from, to, emoji)` (calls `renameMood`, then folds the emoji into the returned settings
under the new name, since the pure function only knows the old emoji) and `onDeleteMood(name)`, each setting
`entries`, `trash` and `settings` every time — a rename that updates settings but not trash is exactly the
bug the pure function's test suite exists to prevent.

**Tests:** `__tests__/entries/renameMood.test.js` (20 cases — dual-name-in-one-entry dedup, no-match
reference passthrough, frozen-input immutability, null/malformed rows, `did`/`wished` untouched) +
`__tests__/screens/MoodManager.test.js` (5 — collision error blocks the call, valid rename fires with old
+ new name + emoji, Remove confirms before deleting, empty state, built-ins never listed). `npm test` →
**723 passed, 72 suites** (698 + 25). `npx expo export --platform android` clean.

**Do NOT** (per spec, honored): touch `did` or `wished` · allow editing the 8 built-in moods · delete a
mood from historical entries · remove its `customMoodEmoji` key on delete · merge on a name collision ·
add reordering or favourites · touch `ArchiveFilters` beyond what IMP-050 already changed.

**Ship:** OTA, no bump — not shipped this chat (no `Release-Lane` trailer).
**Commit:** `feat(entries): rename, re-emoji and remove the feelings you named yourself (IMP-055)` (`6cc63ad`).

### IMP-060 — a candle burns without telling you   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-13)

**Free/Plus:** free (candles are bought with embers by anyone; Plus perk #2 only makes them automatic).
**Origin:** audit during the 2026-08-09 spec session, verified in code.

**The problem.** `applyAutoFreeze` (IMP-039 streak insurance) ran on mount and silently spent a candle to
cover a missed day — `RitualsApp.js` used `result.spent` only to decide whether to call the setters, so a
candle bought for 120–450 embers vanished with no visible trace beyond a lower Shop count. Same class of
complaint the owner raised about the OS restoring a backup without asking, except this time it's inventory
the user paid for, spent by the app's own code.

**Built:** new pure `src/home/freezeNotice.js` — `addFreezeNotice(pending, coveredDays)` appends and dedupes
covered days into the pending list, returning the same reference when nothing new is added (mount-only
effect, so a later spend must not erase an earlier unread notice); `freezeNoticeCopy(days, freezesLeft)` →
`{ title, body }` (`null` for an empty array), title always `A candle burned for you.`, body branches
one-day vs multi-day counts and a `{n} left.` / `That was your last one.` tail, dates rendered `{d} {Mon}`
via `dayKeyToUtcMs` (never `new Date(string)`, which is locale-dependent).

`applyAutoFreeze` now also returns `covered` (the array of days it spent a candle on, not just the count) —
`spent` is unchanged, existing callers untouched. `theme.js`'s `DEFAULT_SETTINGS` gained
`pendingFreezeNotice: []`; `sanitizeSettings` needed no new case since the generic shape check already
handles an array default. The mount effect in `RitualsApp.js` (`applyAutoFreeze`'s call site) now also folds
`covered` into `settings.pendingFreezeNotice` via `addFreezeNotice` whenever a spend occurs.

New `src/screens/FreezeNoticeCard.js` — `TipCard`'s shape (icon + title/body + close), using the existing
`Candle` icon unlit. Renders on Home whenever `pendingFreezeNotice` is non-empty, in the slot immediately
above `OnThisDayCard` — spec decided the freeze notice outranks it when both would show, since it's about
something taken rather than a memory. Dismiss clears `pendingFreezeNotice` to `[]`.

**Tests:** `__tests__/home/freezeNotice.test.js` (9 cases — both functions' branch tables) +
`__tests__/home/streakFreeze.test.js` extended to pin the new `covered` field on every existing case +
`__tests__/screens/FreezeNoticeCard.test.js` (5 — one-day copy, multi-day copy, zero-left copy, dismiss
fires the handler, empty array renders nothing). `npm test` → **737 passed, 74 suites** (723 + 14).
`npx expo export --platform android` clean.

**Do NOT** (per spec, honored): change when or how candles are spent (`applyAutoFreeze`'s logic, ordering,
idempotence are IMP-039's and correct) · offer an undo · make the card a route into the Shop · show anything
when `spent` is 0 · touch `currentStreak` or `frozenDays` semantics.

**Ship:** OTA, no bump — not shipped this chat (no `Release-Lane` trailer).
**Commit:** `feat(gamify): say so when a candle spends itself for you (IMP-060)` (`83cd59d`).

---

### IMP-059 — the app has one accessibility label   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-13)

**Free/Plus:** N/A (quality). **Origin:** audit during the 2026-08-09 spec session — `grep` for
`accessibilityLabel`/`accessibilityRole` under `src/` (excluding `src/dev/`) returned exactly one match
before this spec, leaving the write FAB — the app's primary action — unlabelled for TalkBack.

**Built:** `WriteFlow.js` and `ReadingSheet.js` carried a byte-identical `IconBtn` with no accessible name;
extracted once to `src/ui/IconBtn.js` (required `label` prop → `accessibilityRole="button"` +
`accessibilityLabel`), both screens now import it and pass a label at each call site (`Close this entry` /
`Back a step` / `Close`). The write FAB in `RitualsApp.js` got `accessibilityRole="button"` +
`accessibilityLabel="Write today's entry"`; its sibling `Write` text (not a label — a separate `T` node) got
`accessibilityElementsHidden` so TalkBack doesn't read it twice. The four bottom `Tab`s gained
`accessibilityRole="tab"` + `accessibilityState={{ selected: active }}` — they already carried visible text,
so only selection announcement was missing. Every icon-only modal-close control got a role + a label naming
what closes (`Close the shop`, `Close Keepsakes`, `Close gather embers`, `Close Daily Rituals Plus`,
`Close what's in Plus`, `Close your year in review`, `Close recently deleted`, `Close subscription`, `Close
your feelings` for `MoodManager` — added even though it postdates the spec's audit list, since it's the same
pattern IMP-055 introduced) across `Achievements`, `Shop`, `GetEmbers`, `Paywall`, `ManageSubscription`
(`PlusFlow.js`), `PlusPerks`, `AnnualRecap`, `TrashSheet`, `MoodManager`. `Celebration`, `RestoreNotice`,
`RestoreOffer`, `ReminderSheet` and `NameEditModal` needed no change — every dismiss on those screens already
carries visible button text. The Lifetime heatmap's today-ring (`InsightsScreen.js`) and `Card`'s top sheen
gradient (`ui.js`) — both `pointerEvents="none"` decorations that doesn't hide them from a screen reader —
got `accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"`. Both heatmaps' day
cells were already labelled by IMP-052 — checked, not touched, per the spec's explicit note.

**Tests:** `__tests__/ui/IconBtn.test.js` (role + label render) + `__tests__/screens/FabLabel.test.js`
(mounts the full `RitualsApp` inside `SafeAreaProvider` with `expo-notifications` mocked — its reminder
effect reaches the real native module on mount otherwise — and asserts the FAB exposes its label). `npm
test` → **739 passed, 76 suites** (737 + 2). `npx expo export --platform android` clean.

**Do NOT** (per spec, honored): add `accessibilityHint` anywhere · change layout, colour or contrast · touch
font scaling (IMP-030's) · add a settings toggle · rename visible copy to suit a label.

**Ship:** OTA, no bump — not shipped this chat (no `Release-Lane` trailer). Runtime proof is
**[WALK-14](walk-open.md#walk-14--talkback-can-write-an-entry)** (TalkBack), a separate chat — not attempted here.
**Commit:** `feat(a11y): label every icon-only control, starting with the write button (IMP-059)` (`fa523f3`).

---

### IMP-058 — prompt packs   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-14)

**Free/Plus:** free (decided — perk list stays fixed at six; a prompt is the app speaking to you at the
moment of writing, the free half of the free/Plus split). **Origin:** owner asked what prompt packs were,
2026-08-09.

**Built:** `selectPrompt(pool, deck, day)` already took the pool as a parameter — a "pack" is just a named
array, so the whole feature was making that parameter a setting. **The trap fixed first (step 1):**
`valid(deck, len)` in [`src/content/deck.js`](../src/content/deck.js) validated by length only, so switching
between two same-length packs silently carried the old pack's shuffle order into the new pool. `valid()` now
also takes `packId` and requires `deck.pack === packId`; `selectPrompt(pool, deck, day, packId = 'everyday')`
stores `pack` on the deck state and rejects (reinitializes) a deck from another pack, a corrupt deck, or a
pre-058 deck with no `pack` field at all (the free one-reshuffle migration). New
[`src/content/packs.js`](../src/content/packs.js) exports `PROMPT_PACKS` (`{ id, name, blurb, prompts }`) and
`packById(id)`, falling back to `everyday` for an unknown id so a restored setting naming a pack this build
doesn't have can never blank the write card. `everyday` reuses the existing 60 `PROMPTS` from `prompts.js`
untouched; `grief`, `gratitude` and `change` are 20 new prompts each, used verbatim from the spec.
`settings.promptPack` defaults to `'everyday'` in [`theme.js`](../src/theme.js) — no `sanitizeSettings`
exception needed, generic shape-comparison already handles a string default.
[`RitualsApp.js`](../src/RitualsApp.js)'s prompt-deck `useMemo` now reads
`selectPrompt(packById(settings.promptPack).prompts, promptDeck, dayNumber(), settings.promptPack)`, keyed on
`[promptDeck, settings.promptPack]`; the `PROMPTS` import there was replaced by `packById`. New
[`src/screens/PromptPacks.js`](../src/screens/PromptPacks.js) — a small bottom sheet in `ReminderSheet`'s
shape (not a full-screen `MoodManager`-style sheet, since it's a short pick-one-of-four list) — renders each
pack's name, blurb and first prompt as a sample, rings the active one, states plainly "Changing packs
reshuffles — you will not lose anything.", and calls `onSelect(id)` on tap (no self-close — the caller's
`onSelect` both writes the setting and closes the modal). Wired via a new `Writing prompts` row in
`YouScreen.js`'s **Preferences** card (next to Voice — both shape the writing experience), and a
`promptPacksOpen` modal in `RitualsApp.js` alongside the sibling sheets.

**Tests:** `__tests__/content/deck.test.js` extended — 7 new cases (pack tagging/default, same-pack
advance, cross-pack same-length rejection, no-`pack`-field migration, same-day same-reference with a
`packId`, empty pool with a `packId`). `__tests__/screens/PromptPacks.test.js` — all four packs render,
selecting a pack calls the setter with its id, the active pack is marked (2px vs 1.5px border). `npm test` →
**748 passed, 77 suites** (739 + 9). `npx expo export --platform android` clean.

**Do NOT** (per spec, honored): gate any pack behind Plus · rewrite or reorder the existing 60 `PROMPTS` ·
give each pack its own persisted deck (one deck, reshuffled on switch) · add pack-specific mood lists, themes
or colours · let a pack be empty.

**Ship:** OTA, no bump — not shipped this chat (no `Release-Lane` trailer). No runtime walk named by the
spec (pure JS + a picker, same class as other OTA-only specs).
**Commit:** `feat(content): three more prompt packs, and a deck that knows which pack it belongs to (IMP-058)`
(`8c5755a`).

---

### IMP-061 — store screenshots build themselves   ·   Lane: Dev-only   ·   Status: ✅ code-complete (2026-08-14)

**Lane: Dev-only.** Nothing here reaches the shipped bundle except two `accessibilityLabel` strings and one
row in `src/dev/scenarios.js` — a `__DEV__`-only file already stripped from release (WALK-12 greps
`SENTINEL` against the built bundle to prove it). **No `bump:build`, no OTA, no release note.**

**The problem.** The Play listing needs 4–8 phone screenshots, and the app's design is still moving — prompt
packs (IMP-058), mood management (IMP-055), the heatmap (IMP-045/052) all changed what the screens look
like since the last time anyone captured one. Hand-capturing eight screens and hand-framing them in a web
tool is an afternoon each time, so in practice it happens once and then the listing goes stale. This makes
regenerating the whole set **one command**, so the listing tracks the app instead of lagging it.

#### The output contract — one size, and the compositor refuses to emit anything else

**Every phone screenshot is exactly 1080 × 1920, 24-bit RGB, no alpha channel. There is no second size, no
"whatever the emulator gave us", and no per-shot variation.** The emulator's resolution changes what the
*inner* phone picture looks like and nothing else; the canvas is frozen.

| Property | Value | Why |
| --- | --- | --- |
| Dimensions | **1080 × 1920**, always | 9:16 exactly |
| Aspect | 1.778:1 | Play rejects anything past **2:1** — a raw 1440 × 3120 Pixel capture is **2.167:1 and gets rejected at upload** |
| Colour | 24-bit RGB, **alpha stripped** | Play's documented screenshot format is 24-bit PNG *without* alpha; resvg emits 32-bit RGBA, so this must be an explicit step |
| Min side | 1080 px | clears the ≥1080px floor for Play's promotional placements |
| Count | 7 (bounds 4–8) | Play allows 2–8; **4+** is the floor for promo eligibility |

This is the whole answer to "weird resolutions": **the output never depends on the input.** A 1440 × 3120
capture, a 1080 × 2400 capture and a 1080 × 1920 capture all produce the identical 1080 × 1920 asset — only
the phone drawn inside it is taller or shorter. `fitRect` caps width and derives height from the source
aspect, so nothing is ever stretched, and if a source is so tall the bezel would breach the bottom margin it
is scaled down rather than cropped.

**The compositor enforces this on itself.** After rasterizing, `scripts/shots.js` re-reads each PNG it just
wrote and **throws** unless the header says 1080 × 1920 and colour type 2 (truecolour, no alpha), naming the
offending file. A wrong-sized asset must fail the build, not reach Play Console and get rejected there.

#### Large screens — deliberately out of scope, and this is the right call

Play Console has separate screenshot slots for 7-inch and 10-inch tablets, and leaving them empty is
**allowed** — the listing publishes fine. The cost of leaving them empty is that Play won't surface the app
in large-screen recommendations and shows a large-screen quality note in Console.

**Do not fill those slots from phone captures.** The app is `orientation: 'portrait'` with a phone layout;
a phone screenshot pasted onto a tablet-shaped canvas advertises a tablet experience that does not exist,
and Play's large-screen assessment inspects the *app*, not the screenshots, so it would not even buy the
visibility it was faking. Real tablet assets are downstream of real tablet layout work — a future IMP
against the app, not a screenshot task. **When that day comes this pipeline extends by adding a second
canvas to `shots.config.js`; nothing here needs redesigning for it.**

Also unfilled and fine: Chromebook, Wear, TV, Android Auto slots. The two graphics that *are* required
alongside the screenshots — the **512 × 512** icon and the **1024 × 500** feature graphic — already exist as
listing assets and are **not** in this task's scope.

#### The four decisions, already made — do not re-litigate

1. **Maestro drives the app; the app is not modified to support it.** Maestro is a standalone binary that
   taps by accessibility label and visible text. IMP-059 just labelled every icon-only control, and the dev
   harness is reachable by a long-press on a row whose value text is `v1.0`
   ([`YouScreen.js:296`](../src/screens/YouScreen.js#L296)) — so every screen this needs is already
   reachable without a deep-link scheme, a new native module, or a rebuild. **Do not add a URL scheme.**
2. **The canvas above is frozen.** Changing it is a spec change, not an implementation choice.
3. **The phone bezel is drawn in SVG, not sourced.** No third-party device-art PNG — it dodges the usage
   terms on Google's and Apple's device-art kits, and a bezel drawn from `theme.js` tokens matches the app
   instead of approximating a stranger's phone. **Flat and front-on: a rounded rect, a hairline stroke and a
   punch-hole camera circle. No tilt, no perspective, no drop shadow, no gloss.** The owner was shown this
   and chose it over a photoreal or 3D-angled frame — if it needs more later, that is a spec change.
4. **Captures come from a `__DEV__` build, and Plus surfaces are out of scope.** The harness does not exist
   in a release build (technique T6), and the pixels are identical either way. `PLUS_ENABLED = false` makes
   `OnThisDayCard`, `DeeperInsights` and `AnnualRecap` **unmountable** — and a listing advertising features
   the public cannot buy would be false anyway. **Do not flip `PLUS_ENABLED` for this.** When Plus ships,
   the manifest grows three rows; that is a later task, not this one.

#### Prerequisite the owner supplies, not this chat

Maestro must be installed on the machine that *runs* the capture: `curl -Ls "https://get.maestro.mobile.dev" | bash`.
**This chat does not install it and does not run it** — there is no emulator in a build chat. Everything
below is verifiable offline against a synthetic capture; the real run is **WALK-15**.

#### Files

| File | New? | What |
| --- | --- | --- |
| `.maestro/store-shots.yaml` | new | the capture flow |
| `scripts/shots.config.js` | new | the manifest — one row per screenshot, with its caption |
| `scripts/shots.js` | new | the compositor: raw capture → 1080×1920 framed PNG |
| `scripts/shots.sh` | new | orchestrator — demo-mode status bar, maestro, compositor |
| `__tests__/shots.test.js` | new | geometry + manifest tests |
| `src/dev/scenarios.js` | edit | one new scenario row |
| `src/dev/panel/StateSection.js` | edit | one `accessibilityLabel` |
| `src/dev/DevPanel.js` | edit | one `accessibilityLabel` |
| `package.json` | edit | `@resvg/resvg-js` + `pngjs` devDependencies, `shots` script |
| `.gitignore` | edit | ignore `store/raw/`, **commit** `store/play/` |

#### Step 1 — the scenario

Add to `SCENARIOS_LIST` in [`src/dev/scenarios.js`](../src/dev/scenarios.js), **last row**:

```js
{ key: 'storeShots',   label: 'Store screenshots',       knobs: { streak: 128, entryCount: 210, done: true, ownAll: true, embers: 2400, freezes: 3, name: 'Sam', textLength: 'long', lastBackupAt: 1 } },
```

Why these numbers: a 128-day streak and 210 entries fill the lifetime heatmap and every insight past its
"not enough days yet" threshold; `ownAll` makes the Shop read as a collection rather than a wall of locks;
`textLength: 'long'` fills the Reflections rows with real-looking text instead of one-word stubs. `name:
'Sam'` is short and neutral — **do not use the owner's name.**

#### Step 2 — two labels so Maestro can't tap the wrong thing

Both are dev-only files.

- [`StateSection.js:153`](../src/dev/panel/StateSection.js#L153) — the Apply `Pressable` gets
  `accessibilityLabel="Apply dev state"`. Without it the flow's `tapOn: "Apply"` is ambiguous: the button
  and the confirm alert's own **Apply** are both in the hierarchy at once.
- [`DevPanel.js:63`](../src/dev/DevPanel.js#L63) — the Close `Pressable` gets
  `accessibilityLabel="Close the dev panel"`. `Close` alone collides with IMP-059's modal-close labels.

Nothing else in the app changes. If a screen turns out to need a label to be tappable, **STOP and log it** —
that is an IMP-059 gap and belongs in its own row, not smuggled in here.

#### Step 3 — the manifest

`scripts/shots.config.js`, plain CommonJS (node runs it directly, it is never bundled):

```js
// scripts/shots.config.js — what gets captured, and what each shot says.
// Order IS the Play listing order: Play shows the first 3–4 most prominently.
module.exports = {
  canvas: { w: 1080, h: 1920 },
  // Straight from theme.js day palette + the splash background.
  colors: { bg: '#f9f7f4', ink: '#292524', accent: '#f59e0b', accentDeep: '#d97706' },
  fonts: {
    headline: 'node_modules/@expo-google-fonts/fredoka/Fredoka_600SemiBold.ttf',
    body:     'node_modules/@expo-google-fonts/baloo-2/Baloo2_500Medium.ttf',
  },
  shots: [
    { id: '01-today',       headline: 'One question a day.',          sub: "That's the whole ritual." },
    { id: '02-write',       headline: 'What you did.',                sub: 'What you wished for.' },
    { id: '03-moods',       headline: 'Name how it felt —',           sub: 'in your own words.' },
    { id: '04-reflections', headline: 'Every day you kept,',          sub: 'searchable.' },
    { id: '05-insights',    headline: 'Your year,',                   sub: 'one square at a time.' },
    { id: '06-achievements',headline: 'Proof you kept going.',        sub: 'Even the days you almost didn\'t.' },
    { id: '07-shop',        headline: 'A garden that grows',          sub: 'as your record does.' },
  ],
};
```

**These copy strings are decided.** They follow the playbook's thesis — continuity first, retrieval second,
cosmetics last — and they deliberately never say "AI", "free", "best" or anything Play's metadata policy
treats as a claim. Do not rewrite them.

#### Step 4 — the compositor

`scripts/shots.js`. Two devDependencies, both small:

- **`@resvg/resvg-js`** — chosen over `sharp` because it takes font **files** as an explicit option, so the
  captions render in the app's own Fredoka / Baloo with no system font install and no `fontconfig` fiddling.
- **`pngjs`** — pure JS, no native binary. Used for exactly two things: **stripping the alpha channel** on
  the way out, and reading back the header on the way in for the self-check below.

The whole composition is one SVG string: background, drawn bezel, the capture embedded as a
`data:image/png;base64` `<image>`, caption text on top; resvg rasterizes it once.

**The write path is fixed, in this order:**

```js
const png = new Resvg(svg, { fitTo: { mode: 'width', value: canvas.w }, font: { fontFiles, loadSystemFonts: false } })
  .render().asPng();                       // 32-bit RGBA
const rgb = stripAlpha(png);               // pngjs decode → colorType 2 re-encode over colors.bg
fs.writeFileSync(out, rgb);
assertPlayLegal(out);                      // re-reads the file it just wrote
```

`loadSystemFonts: false` is deliberate — it makes rendering identical on every machine instead of silently
substituting whatever the host has installed.

Export these three, they are the whole of the file's real logic:

- `fitRect(...)` — geometry, below.
- `stripAlpha(buffer)` — decode with `pngjs`, composite over `colors.bg` (so any antialiased edge resolves
  against the real background rather than black), re-encode with `colorType: 2, inputHasAlpha: true`.
- `assertPlayLegal(filePath)` — read the PNG header and **throw a message naming the file** unless it is
  exactly `canvas.w × canvas.h` with `colorType === 2`. Called on every output. This is the guard that means
  a wrong-sized asset can never silently reach Play Console.

Export and unit-test this function — it is the only real logic in the file:

```js
// Fit a raw capture (any phone aspect) into the canvas as a bezelled phone.
// Returns the SCREEN rect; the bezel is drawn `bezel` px outside it.
// Guarantees: horizontally centred, never wider than maxW, and the bezel's
// bottom edge never passes `bottomLimit`.
function fitRect({ srcW, srcH, canvasW, top, maxW, bezel, bottomLimit }) { … }
```

**The finished asset, to scale.** This is the layout contract — build to it, do not reinterpret it:

```
┌──────────────────────────────────┐  1080 × 1920, frozen
│                                  │  bg: vertical wash colors.bg → 6% colors.accent
│                                  │
│        One question a day.       │  headline · Fredoka_600 62px · colors.ink · y=180
│      That's the whole ritual.    │  sub · Baloo2_500 40px · colors.ink @62% · y=258
│                                  │  both centred on x=540
│      ┌────────────────────┐      │  ← bezel outer: x=196 y=386, r=46, 1px stroke
│      │ ┌────────────────┐ │      │  ← screen rect: x=210 y=400, r=34
│      │ │                │ │      │
│      │ │  the raw       │ │      │  660 wide; height from source aspect
│      │ │  capture       │ │      │  (1430 for a 1440×3120 source)
│      │ │                │ │      │
│      │ └────────────────┘ │      │  ← screen bottom y=1830
│      └────────────────────┘      │  ← bezel bottom y=1844, under the 1880 limit
│                                  │
└──────────────────────────────────┘
```

Geometry — use these constants, they are already checked against a 1440×3120 source:
`top: 400`, `maxW: 660`, `bezel: 14`, `bottomLimit: 1880`, outer corner radius `46`, inner `34`.
A 1440×3120 source lands 660 × 1430 at y 400–1830, bezel bottom 1844, clear. A squarer source (16:9
emulator) simply comes out shorter — **width is capped, height is never stretched**, so aspect is preserved
in every case. If a taller source would breach `bottomLimit`, scale down to fit rather than crop.

Caption block: headline at `y = 180`, 62px, `colors.ink`; sub at `y = 258`, 40px, `colors.ink` at 62%
opacity. Both centred on `canvasW / 2`. Background is a soft vertical wash from `colors.bg` to a 6%
`colors.accent` tint — a flat fill reads as an unfinished asset at listing size.

CLI: `node scripts/shots.js` reads every `store/raw/<id>.png` named in the manifest and writes
`store/play/<id>.png`. **A missing raw file is a hard error naming the id** — a silently-skipped shot is how
a listing ends up with five screenshots when it should have seven. Print each output's dimensions.

#### Step 5 — the flow

`.maestro/store-shots.yaml`. `appId: app.dailyrituals.mobile`. Structure:

```yaml
appId: app.dailyrituals.mobile
---
- launchApp: { clearState: false }
- tapOn: "You"
- longPressOn: "v1.0"
- tapOn: "Store screenshots"
- tapOn: { id: "Apply dev state" }
- tapOn: "Apply"            # the confirm alert
- tapOn: { id: "Close the dev panel" }
# …then per shot: navigate, then takeScreenshot
- tapOn: "Today"
- takeScreenshot: store/raw/01-today
```

Cover all seven manifest ids. `02-write` and `03-moods` are two steps of the same WriteFlow (reached by the
`Write today's entry` FAB — the label IMP-059 added); `04-reflections` is the **Reflections** tab with a
search term typed in, so the IMP-053 snippet highlight is visible; `05-insights` is the Insights tab scrolled
to the lifetime heatmap; `06-achievements` and `07-shop` open from the harness Launch section
(`tapOn: "Achievements"` / `"Shop"`), which is faster and less brittle than tapping through the You tab.

**Selector rule: prefer the accessibility label, fall back to visible text, never use coordinates.** A
coordinate tap is a screenshot flow that breaks silently on the next layout change and produces a *wrong*
picture rather than an error.

#### Step 6 — the orchestrator

`scripts/shots.sh`, `chmod +x`, in this order:

1. Assert `adb` sees exactly one device, and that `maestro` is on `PATH` — exit with a readable message
   naming the install command if not.
2. Clean `store/raw/`.
3. Status bar into demo mode — this is why store screenshots show a clean clock and a full battery:
   ```sh
   adb shell settings put global sysui_demo_allowed 1
   adb shell am broadcast -a com.android.systemui.demo -e command enter
   adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 1200
   adb shell am broadcast -a com.android.systemui.demo -e command battery -e level 100 -e plugged false
   adb shell am broadcast -a com.android.systemui.demo -e command network -e wifi show -e level 4
   adb shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false
   ```
4. `maestro test .maestro/store-shots.yaml`
5. Exit demo mode (`-e command exit`) **in a trap, so it runs even when maestro fails** — leaving an
   emulator stuck in demo mode poisons every later walk's screenshots.
6. `node scripts/shots.js`

`package.json` → `"shots": "bash scripts/shots.sh"`.

#### Step 7 — tests

`__tests__/shots.test.js`, node-only, no emulator:

1. `fitRect` with a 1440×3120 source returns a width ≤ 660, a horizontally centred x, and a bezel bottom
   ≤ 1880.
2. `fitRect` **preserves source aspect** within 0.5px for three sources: 1440×3120, 1080×1920, 1080×2340.
3. `fitRect` scales down rather than breaching `bottomLimit` when handed an absurdly tall source (1000×4000).
4. Every `shots[]` row has a non-empty `id`, `headline` and `sub`, ids are unique, and `shots.length` is
   **between 4 and 8** — the Play bounds, asserted so a future edit cannot quietly drop the set below the
   promo-eligibility floor.
5. **`canvas` is 1080 × 1920 and its aspect is under 2:1** — asserted against the config directly, so a
   future edit to the canvas trips a test instead of shipping a rejectable asset.
6. **The resolution-independence test — the one that answers "will I get weird sizes".** Render the same
   one-row manifest three times against three synthetic sources — **1440×3120, 1080×2400, 1080×1920** — and
   assert all three outputs are **byte-identical in dimensions: exactly 1080×1920, colour type 2**. Different
   input shapes, one output shape.
7. `stripAlpha` output decodes with `colorType === 2` and no alpha channel, and an absurdly tall source
   (1000×4000) still yields 1080×1920 rather than throwing or cropping.
8. `assertPlayLegal` **throws** on a deliberately mis-sized PNG (write a 500×500 one), and the thrown message
   contains the file name.

`npm test` must stay **≥ 748 passed**. `npx expo export --platform android` must stay clean — it will, since
nothing here is imported by the app.

#### Step 8 — .gitignore

Add `store/raw/`. **`store/play/` is committed** — the finished assets are the deliverable and the owner
uploads them straight to Play Console; they must survive a fresh clone.

#### Acceptance

- `npm test` green, ≥ 748 passed.
- `npx expo export --platform android` clean.
- `node scripts/shots.js` run against a synthetic capture produces a **1080×1920, 24-bit, alpha-free** PNG,
  and produces the same dimensions from all three synthetic source shapes. **A build chat proves the
  compositor, not the capture** — there is no emulator here.
- `grep -rn "PLUS_ENABLED" src/` unchanged; `git diff src/` touches **only** the three dev-only files named
  in Step 1 and Step 2.

#### Commit message (exact)

```
feat(tools): store screenshots build themselves (IMP-061)
```

**Stop point.** The end-to-end run — emulator, real captures, eyes on the seven PNGs — is **WALK-15** in
[`walk-open.md`](walk-open.md), and it is a different chat. Do not attempt it here. Tick the backlog row,
write the session note, move this spec to `docs/build-log.md`.

**Result:** all 8 steps done. `npm test` → **764 passed, 78 suites** (was 748/77); `npx expo export
--platform android` clean. `node scripts/shots.js` proven against 7 synthetic captures in three different
source shapes (1440x3120, 1080x2400, 1080x1920) — every output 1080x1920, colour type 2, alpha-free;
`fitRect` returns exactly `{x:210, y:400, w:660, h:1430}` for a 1440x3120 source, matching the spec's
layout contract to the pixel. Fonts render from the bundled Fredoka/Baloo TTFs with `loadSystemFonts:
false`. The synthetic outputs were deleted rather than committed — `store/play/` fills up on the real run.
`git diff src/` touched **only** the three dev-only files named in Steps 1–2.
**Ship:** Dev-only lane — no bump, no OTA, no release note, no `Release-Lane` trailer.
**Commit:** `feat(tools): store screenshots build themselves (IMP-061)` (`ca850d7`).
**Runtime proof:** **WALK-15** (emulator + maestro + eyes on the seven PNGs) — a separate chat.

### IMP-062 — the restore offer outlives the launch that made it   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-14)

**Why.** Found by the owner mid-walk on **WALK-02** 2026-08-14: the "We found your journal" sheet's
**Restore from a file** action imports the chosen file but never clears the OS-restore stash. Scoping it
found the same handler family broken in three ways, the worst of which is the opposite of the filed symptom
— defect **A** below means the offer and its You-tab row vanish for good after one session, orphaning the
stash in `AsyncStorage` where no user action can reach it, in the one flow whose whole purpose is not losing
a user's journal. (**A** fires once — quarantine — then `serialize()` re-stamps `lastSavedAt`, so nothing
ever calls `readPendingRestore()` again.) **B**: the answer lived in a plain `useState`, so nothing survived
a relaunch — masked by A until A was fixed. **C**: the flip happened before `doImport()` ran, so the sheet
could hide on a cancelled picker.

**Design, as landed:**
1. The stash is re-read on every launch, unconditionally — the storage key decides whether an offer is
   outstanding, not the quarantine event.
2. A successful "Restore from a file" answers the offer but does **not** destroy the stash — Discard still
   owns deletion, with its inventory-warning confirm intact (IMP-033's "no one-tap destructive dismissal").
3. The answer lives in its own AsyncStorage key (`restoreOfferAnswered`), never in `PERSISTED_KEYS` — a
   journal restore replaces that whole slice, which would erase the very answer that triggered it.
4. The offer is marked answered at the moment of confirmation (tapping **Replace**), not at write success —
   a cancelled picker or rejected file leaves the sheet where it was, and a failed write still counts as
   answered (the toast says the journal is unchanged; the You-tab row keeps the stash one tap away).
5. `shouldOfferRestore` stays unused/unwired — out of scope, `RitualsApp` only mounts post-onboarding.

**Landed as:**
- `src/persistence/storage.js` — `RESTORE_OFFER_ANSWERED_KEY` + `writeRestoreOfferAnswered` /
  `readRestoreOfferAnswered` (returns boolean, never `null`) / `clearRestoreOfferAnswered`, same
  try/catch/console.warn/falsy-on-failure style as the existing stash trio.
- `src/backup/importFlow.js` — `runConfirmedImport` gains an optional fifth `onImported` effect, run only
  after `replaceAll` resolves; a throw inside it is caught and logged, never rejects the outer call (so a
  post-success stash-clear failure can't surface as a "Load failed" lie).
- `src/RitualsApp.js` — `restoreOfferDismissed` local state deleted; `restoreOfferAnswered`,
  `onAnswerRestoreOffer`, `onReopenRestoreOffer` now come in as props from `App`. `doImport` takes an
  optional `{ onConfirmed }` called as the first statement inside the Replace button's `onPress`.
  `handleLoadPendingRestore` passes `onImported: onConsumePendingRestore` into `runConfirmedImport` instead
  of awaiting the consume afterward. The offer's mount condition is `pendingRestore && !restoreOfferAnswered`.
- `App.js` — owns both halves of the stash decision (`RitualsApp` remounts on `dataKey`, so local state
  there would reinitialize mid-restore). Quarantine branch clears any stale answer before offering a fresh
  stash. A new unconditional read before `setHydrated` on every launch — this is the actual fix for defect A.
  `handleConsumePendingRestore` clears both the stash and the answer together (the answered key exists only
  while a stash exists). Two new handlers, `handleAnswerRestoreOffer` / `handleReopenRestoreOffer`, wired
  onto `<RitualsApp>` alongside the existing restore props.

**Tests (+8, no new suite files):** `importFlow.test.js` — `onImported` runs after `replaceAll` (order, not
just count) · never runs when `writeRecovery` or `replaceAll` throws · a throwing `onImported` does not
reject `runConfirmedImport`. `storage.test.js` — write→read→clear round trip · unset reads `false` not
`null` · independent of the live-state key and the stash in both directions · clearing an unset key is a
no-op that still resolves `true`.

**Proof:** `npm test` → **772 passed, 78 suites** (was 764/78). `npx expo export --platform android` clean.
**Ship:** OTA lane, no bump — rides the next batch with the rest of the ~25 unpublished tasks; no
`Release-Lane` trailer on this commit.
**Commit:** `fix(restore): the offer outlives its launch — rehydrate the stash, persist the answer (IMP-062)` (`ba8e684`).
**Runtime proof:** **WALK-02**, resuming at step 3 — a separate chat.

---

### IMP-063 — a saved day looks saved   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-15)

**Why.** WALK-06 finding (d), 2026-08-15. Streak-freeze candles work perfectly and are **invisible**. A day
a candle saved rendered as the same 💀 the app uses for a genuinely missed day, everywhere it appears —
`frozenDays` was real, persisted state consumed only by the streak arithmetic, never by the cell builders
that decide what a day *looks* like. The owner's reference point was Duolingo's distinct frozen-day glyph.

**Design, as landed:**
1. `frozen` is a new cell flag produced by the same builders that produce `missed` — never computed in a
   screen. A day is `frozen` only where it would otherwise be `missed`; a `frozenDays` key in the future,
   before the first entry, or on a day with an entry is ignored, not an error.
2. The glyph is the app's own candle, not a snowflake — `FREEZE_EMOJI = '🕯️'` (U+1F56F, inside the
   Android-7 coverage bar `MOOD_PALETTE` already holds to).
3. A frozen cell keeps the kept-day fill (`c.accentSoft`) with a dashed `c.accentDeep` border — nearer a
   written day than the transparent dashed "nothing here" cells.
4. A frozen day is not pressable — no entry to open, same as `missed`.
5. The lifetime heatmap gained a legend row (`{ state: 'frozen', label: 'a candle kept it' }`) since it's
   the only one of the three that renders bare colour blocks with no glyph.

**Landed as:**
- `src/data.js` — `FREEZE_EMOJI = '🕯️'` alongside `MISS_EMOJI`.
- `src/home/calendar.js` — `buildHeatmap`/`buildLifetimeHeatmap`/`buildWeekStrip` all take a third
  `{ frozenDays = [] }` options arg, defaulted so every existing caller/test is unchanged; each swaps only
  its past-day branch to check `frozenDays` before falling to `missed`.
- `src/insights/heatCells.js` — `cellState` gains `frozen` between `future` and `missed`; precedence is now
  `future > frozen > missed > empty > done`.
- `src/screens/InsightsScreen.js` — `heatCellStyle` gets a `frozen` branch before `missed` (same geometry,
  `accentDeep` border); `LEGEND` gains the frozen row; `pressable = state === 'done'` unchanged;
  `frozenDays` prop threaded into `buildLifetimeHeatmap`.
- `src/screens/ArchiveScreen.js` — `Heat`'s cell map gains `isFrozen`, sitting above the mood branch (a
  frozen cell carries neither `missed` nor `empty`, so it would otherwise fall through to the mood branch
  and render 🌫️); also replaced the hardcoded `'💀'` literal with the existing-but-unused `MISS_EMOJI`.
  `frozenDays` prop threaded into `buildHeatmap`.
- `src/screens/HomeScreen.js` — `Dot` gains a `frozen` branch before `future`, and the skull literal became
  `MISS_EMOJI` alongside the new `FREEZE_EMOJI` glyph. `frozenDays` prop threaded into `buildWeekStrip`.
- `src/RitualsApp.js` — `frozenDays` (already local state) passed as a prop to `HomeScreen`, `ArchiveScreen`
  and `InsightsScreen`.

**Tests (+10, no new suite files):** `calendar.test.js` (+6) — frozen vs missed vs done vs empty precedence
across all three builders, plus a no-third-argument regression check. `heatCells.test.js` (+2) — `frozen`
state and its precedence against `missed`/`future`. `ArchiveHeat.test.js` (+2) — frozen renders
`FREEZE_EMOJI` not `MISS_EMOJI`, and is not pressable.

**Proof:** `npm test` → **782 passed, 78 suites** (was 772/78). `npx expo export --platform android` clean.
**Ship:** OTA lane, no bump — rides the next batch with the rest of the ~25 unpublished tasks; no
`Release-Lane` trailer on this commit.
**Commit:** `feat(streak): a day a candle saved looks saved, not missed (IMP-063)` (`b7eb4c3`).
**Runtime proof:** **WALK-06**, re-run whole — a separate chat.

---

### IMP-064 — count your candles, and say plainly what one did   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-15)

**Why.** WALK-06 findings (a), (c) and (b), 2026-08-15. `StreakFreeze` ([`src/gamify.js`](../src/gamify.js))
mapped over a literal `[0, 1, 2]`, not `count` — owning 10 candles rendered exactly 3 icons, every count from
3 upward drew the identical row, and the true number lived only in the caption. Separately, the
candle-spent notice (`freezeNoticeCopy` in [`src/home/freezeNotice.js`](../src/home/freezeNotice.js)) was 14
words to say three things. The owner's objection generalised into a standing copy rule: the user must never
be unsure what happened, what changed, or how a feature works.

**Design, as landed:**
1. New pure module `src/home/candleRow.js` — `candleRow(count, max = 5)` returns `{ slots, lit, overflow }`:
   up to 5 real icons, then a `×N` badge past the cap; `count = 0` still draws one unlit slot so the
   affordance stays visible. `candleRowCopy(count)` returns the caption string (zero/singular/plural forms).
   No suite existed for `src/gamify.js` and none was added — it stays a straight render of the two tested
   pure functions.
2. `StreakFreeze` in `src/gamify.js` renders `candleRow`/`candleRowCopy` instead of the old `[0,1,2].map`,
   plus the `×N` overflow badge when present.
3. `freezeNoticeCopy` rewritten to the three-fact shape: *"Your streak is safe."* / `A candle burned for
   {day}. {N} left.` (or `3 candles burned for 3 days you missed. 1 left.` for multi-day, or `That was your
   last one.` at zero remaining). `addFreezeNotice` and `formatDay` untouched; `FreezeNoticeCard.js` needed
   no edit since it just renders `copy.title`/`copy.body`.

**Tests (+10, +1 suite file):** new `__tests__/home/candleRow.test.js` covers `candleRow` at 0/1/3/5/6/12,
the invalid-input group (negative, `NaN`, `undefined`, numeric string), a custom `max`, and `candleRowCopy`
at 0/1/7. `__tests__/home/freezeNotice.test.js`'s 4 `freezeNoticeCopy` cases and
`__tests__/screens/FreezeNoticeCard.test.js`'s 3 copy assertions got the new expected strings, no new cases.

**Proof:** `npm test` → **792 passed, 79 suites** (was 782/78). `npx expo export --platform android` clean.
**Ship:** OTA lane, no bump — rides the next batch with the rest of the ~25 unpublished tasks; no
`Release-Lane` trailer on this commit.
**Commit:** `feat(streak): count your candles at a glance, and say plainly what one did (IMP-064)` (`185e326`).
**Runtime proof:** **WALK-06**, re-run whole — a separate chat.

---

### IMP-065 — clear the search; the moods you picked come to the front   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-15)

**Why.** WALK-04 findings (b), (c) and (a), 2026-08-15. The search itself passed — case-insensitive,
accent-folding, correct zero-results copy, heatmap correctly not reacting to filters. Getting *out* of a
search is what failed: no clear affordance on the `TextInput`, and a selected mood chip never moved to the
front of the horizontal scroll, so turning it back off meant hunting for it. Separately, `ArchiveScreen.js`
labeled a `wished` snippet match but not a `did` one — the owner flagged the asymmetry as a design call worth
revisiting; this spec makes the call: label both.

**Design, as landed:**
1. New pure module `src/entries/moodChipOrder.js` — `orderMoodChips(all, selected)` sorts selected chips to
   the front, preserving relative order within both groups; returns the input array by reference when nothing
   is selected.
2. `ArchiveFilters.js`: the `TextInput` gained a clear button (`Close` icon, absolutely positioned in a
   constant `paddingRight: 44` gutter so typing the first character never reflows the text) that appears only
   when `text` is non-empty and clears just the text field. The mood-chip `ScrollView` now maps over
   `orderMoodChips([...MOODS, ...customMoods], moods)` and scrolls back to `x: 0` on select (not deselect) so
   a chip picked from deep in the row doesn't appear to vanish. Each chip `Pressable` gained
   `accessibilityRole="button"`, `accessibilityLabel={m}`, `accessibilityState={{ selected: sel }}`.
3. `ArchiveScreen.js`'s `ResultLine`: the field label is now unconditional — `` `${snip.field} · ` `` — so a
   `did` match gets `did · ` the same way a `wished` match always got `wished · `. Only renders when `snip`
   exists at all; the no-query browsing path is untouched.

**Tests (+13, +2 suite files, 3 existing assertions updated):** new `__tests__/entries/moodChipOrder.test.js`
(+6) covers the same-reference no-op, single/double selection ordering, unselected-tail order, an unknown
selected name being ignored, and non-array inputs. New `__tests__/screens/ArchiveFilters.test.js` (+5) covers
the clear button's presence/absence, its `onChange` payload, and which chip renders first for an empty vs.
populated `moods`. `__tests__/screens/ArchiveResults.test.js`: the two no-query cases now assert both `did · `
and `wished · ` are absent; the `did`-match case now asserts `getByText('did · ')` instead of asserting
`wished · ` is null; two new cases confirm `did · ` renders exactly once for a `did` match and never for a
`wished` match.

**Proof:** `npm test` → **805 passed, 81 suites** (was 792/79). `npx expo export --platform android` clean.
**Ship:** OTA lane, no bump — rides the next batch with the rest of the ~25 unpublished tasks; no
`Release-Lane` trailer on this commit.
**Commit:** `feat(archive): clear the search, and the moods you picked come to the front (IMP-065)` (`f632688`).
**Runtime proof:** **WALK-04**, re-run whole — a separate chat.

---

### IMP-066 — the mood step stops fighting you   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-15)

**Why.** WALK-04 findings (d) and (e), 2026-08-15. (d) A selected mood chip appeared not to deselect — not a
`toggleMood` bug, but a swallowed tap: the mood step's `ScrollView` had no `keyboardShouldPersistTaps`, so
with the keyboard open (true whenever the two text-carrying fields above it had been used) the first tap on
the step dismissed the keyboard instead of reaching the chip. (e) The custom-mood block was three unlabelled
rows — palette, a lone 90dp "or type one…" field, a name field — with nothing to say they belonged together,
and the name field accepted emoji with no length limit.

**Design, as landed:**
1. New `stripEmoji` in `src/entries/emojiInput.js` — code-point range filter (pictographic blocks, arrows,
   dingbats, variation selectors, ZWJ and other joiners) distinct from `isEmojiish`'s `>= 0x00a0` rule, which
   would have deleted accented Latin and Devanagari characters. Used only to sanitize the *name* field as the
   user types, never to reject input.
2. `keyboardShouldPersistTaps="handled"` added to both ScrollViews on the mood step (the outer step scroll and
   the horizontal emoji-palette scroll). `toggleMood` untouched — it was always correct.
3. The mood chip `Pressable` gained `accessibilityRole="button"`, `accessibilityLabel={m}`,
   `accessibilityState={{ selected: sel }}`.
4. The custom-mood block became one bordered, headed group ("Name your own" / "Give it a face, then a name.")
   with two numbered steps — "1 · Its face" (palette + typed-emoji field, both carried over verbatim) and
   "2 · Its name" (name field now `onChangeText={(v) => setCustomInput(stripEmoji(v))}`, `maxLength={24}`
   matching `moodNameError`'s existing limit). `addCustomMood`'s duplicate guard is unchanged; collision
   checking against existing custom moods stays with `MoodManager` (IMP-055).

**Tests (+11):** new in `__tests__/entries/emojiInput.test.js` (+7) — every `MOOD_PALETTE` glyph strips to
`''` (including `❤️`/`☀️` variation-selector pairs) · `'Café'` and Devanagari `'थका'` survive byte-for-byte ·
`'Sleepy😴'` → `'Sleepy'` · a ZWJ sequence strips to `''` with no joiner left · `null`/`undefined` → `''` ·
digits/spaces/hyphens/apostrophes survive. New in `__tests__/screens/WriteFlowMood.test.js` (+4) — tapping a
selected chip deselects it (the (d) regression) · every `ScrollView` on the mood step has
`keyboardShouldPersistTaps === 'handled'` (`UNSAFE_getAllByType(ScrollView)`) · typing `'😴Sleepy'` into
`Name your own…` and pressing `Add` fires with `'Sleepy'` · the name field's `maxLength` is `24`. All 7
pre-existing cases in that file stayed green untouched.

**Proof:** `npm test` → **816 passed, 81 suites** (was 805/81). `npx expo export --platform android` clean.
**Ship:** OTA lane, no bump — rides the next batch; no `Release-Lane` trailer on this commit.
**Commit:** `fix(entries): the mood step answers every tap, and naming a feeling is one clear block (IMP-066)`
(`bf32690`).
**Runtime proof:** **WALK-04**, re-run whole — a separate chat.

---

### IMP-067 — a stacked row wraps; Mood Mix bars start in one place   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-15)

**Why.** WALK-07 findings (b) and (c), 2026-08-15, found while proving the font-scale cap (which itself
passed — `PixelRatio.getFontScale()` read 2.0 against the 1.5/1.2 caps in `src/ui/textScale.js` with nothing
broken on the four passed screens). (b) `Row.js` hardcoded `numberOfLines={1}` on the stacked value even
though `shouldStackRow` had already given it the full row width to itself — the You tab's Annual Recap
teaser (`value="Unlocks after your first full year"`) ellipsized instead of wrapping. (c) `InsightsScreen.js`
gave the Mood Mix label column `minWidth: 84` with `flexShrink: 1`, so the column's actual width tracked its
content — a long mood name pushed that row's bar right, a short one pulled it left, and the bars stopped
sharing an origin, which defeats the point of a comparison chart.

**Design, as landed:**
1. `Row.js`'s stacked value ([`:36`](../src/ui/Row.js#L36)) is now `numberOfLines={3}`; the inline value
   ([`:45`](../src/ui/Row.js#L45)) keeps `numberOfLines={1}` — it shares the row with the label and has no
   room to wrap into, so stacking stays the only escape hatch.
2. `YouScreen.js`'s Annual Recap teaser string shortened to **"After your first year"** (21 chars, same
   meaning) — 3 lines still wasn't enough for the original 33-char string at 2.0x, and a detail sheet for a
   row that just says "not yet" would be worse than the truncation it replaces.
3. New pure `src/insights/moodMixLayout.js` → `moodLabelWidth(fontScale)`: fixed at `MOOD_LABEL_BASE_DP =
   96`, scaling with the OS font scale, capped at 1.5x (144dp) — uncapped would leave the bar nothing at
   2.0x. `InsightsScreen.js` reads `fontScale` from `useWindowDimensions()` and calls it **above the
   `data.empty` early return** (immediately after `const c = t.colors`), since placing it with the other
   derived values below would put a hook after a conditional return. The label column
   ([`:134`](../src/screens/InsightsScreen.js#L134)) is now `width: labelW` with `minWidth`/`flexShrink: 1`
   removed; the name `T` inside keeps `numberOfLines={1}` + `flexShrink: 1` so a long name ellipsizes inside
   the fixed column instead of widening it.

**Out of scope, per spec:** `shouldStackRow`'s calibration constants (IMP-030, pinned against real
measurements), the Weekly-rhythm chart below Mood Mix, every other `Row` caller.

**Tests (+7):** new `__tests__/insights/moodMixLayout.test.js` (+5) — `1` → `96` · `1.5` → `144` · `2.0` →
`144` (capped) · `0.85` → `96` (never shrinks below base) · `undefined`/`NaN`/`'abc'` → `96`.
`__tests__/ui/Row.test.js` (+2) — a stacked row's value renders with `numberOfLines === 3` · an inline row's
value renders with `numberOfLines === 1`, both found by text not index. All 3 pre-existing
`assertNoUnboundedFlexText` cases stayed green.

**Proof:** `npm test` → **823 passed, 82 suites** (was 816/81). `npx expo export --platform android` clean.
**Ship:** OTA lane, no bump — rides the next batch; no `Release-Lane` trailer on this commit.
**Commit:** `fix(ui): a stacked row's value wraps, and Mood Mix bars start in one place (IMP-067)`
(`e0c318c`).
**Runtime proof:** **WALK-07**, re-run whole — a separate chat, once IMP-068 also lands.

---

### IMP-068 — the Paywall footer stops covering the price   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-15)

**Why.** WALK-07 finding (a), 2026-08-15. The Paywall's fixed footer overlapped its own content at normal
font size — the plan amount and the last one or two perk bullets were drawn under it. **Taken last of the
six** because `PLUS_ENABLED = false` ([`src/billing/config.js:39`](../src/billing/config.js#L39)) makes the
Paywall unmountable in the shipped build; the owner reached it during the walk only by flipping T1 and
reverting after.

**The mechanism.** [`Paywall.js:94-99`](../src/screens/Paywall.js#L94) renders the CTA button and
`LegalFooter` as a plain sibling `View` after the `ScrollView` ([`:43`](../src/screens/Paywall.js#L43)),
inside a `flex: 1` column. The `ScrollView` had only `contentContainerStyle`, no `style`, so nothing
constrained its height — it laid out at full content height and the footer drew over its tail. Every other
full-screen modal pairing a `ScrollView` with a fixed footer sibling (`Achievements`, `GetEmbers`,
`PlusPerks`, `PlusFlow`, `MoodManager`, `ReadingSheet`, `TrashSheet`, `AnnualRecap`, and `WriteFlow` via
`flexGrow: 1`) already constrained it; `Paywall` was the only one with neither.

**Design, as landed:** `style={{ flex: 1 }}` added to the `ScrollView` at
[`Paywall.js:43`](../src/screens/Paywall.js#L43) — the only code change. `contentContainerStyle` and
`WriteFlow` left untouched, per the spec's explicit scope.

**Tests (+3, new suite):** new `__tests__/screens/Paywall.test.js` — the outer `ScrollView`
(`UNSAFE_getAllByType`) flattens to `flex === 1` (the regression guard) · the last `PLUS_PERKS` entry renders
· the annual price (`PLUS_PRICES.annual.price`, asserted with `getAllByText` since it also appears in
`LegalFooter`) and the `Start 7-day free trial` label both render.

**Proof:** `npm test` → **826 passed, 83 suites** (was 823/82). `npx expo export --platform android` clean.
**Ship:** OTA lane, no bump — rides the next batch; no `Release-Lane` trailer on this commit.
**Commit:** `fix(plus): the Paywall footer stops covering the price and the last perks (IMP-068)` (`ce504fc`).
**Runtime proof:** **WALK-07**, re-run whole — a separate chat. This was the last of the six IMP-063…068
specs; WALK-07 can now be re-run whole.

### IMP-069 — a feeling you picked can be put back down   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-16)

**Why.** WALK-04 finding (h), 2026-08-16 — the third pass on the same defect. Tapping an already-selected
mood chip in WriteFlow's mood step did nothing; two prior theories (finding d's read of `toggleMood`, and
IMP-066's keyboard-focus fix) both failed to make the deselect reachable live.

**The provable failure, fixed:** two chips could share a React key. WriteFlow's create path
(`addCustomMood`) and `RitualsApp.js`'s `addCustomMood` only deduped a new custom mood against *today's
picks* / *other customs*, not against the built-in `MOODS` list, so a custom mood could be stored under a
name a built-in already owned. `[...MOODS, ...customMoods].map((m) => <Pressable key={m}…>)` then rendered
two elements under one key — React keeps one live and the other goes stale, which stops answering taps and
also explains the reported "1 · Its face" mislabel (sibling reconciliation after a duplicate key).
**`toggleMood` itself was not touched** — read three times now and correct each time.

**Design, as landed:** new `allMoodChips(builtIn, customMoods)` in
[`src/entries/moodChipOrder.js`](../src/entries/moodChipOrder.js) — case-insensitive, trimmed dedupe,
built-ins win. Wired into both chip rows (`WriteFlow.js`'s mood step, `ArchiveFilters.js`'s filter row,
composed with the existing `orderMoodChips`). WriteFlow's create path (`addCustomMood`) now calls
`moodNameError` (the same rule the rename path already enforced) before adding, with the **Add** button
disabled and the error string shown when it fires — so new collisions can no longer be created, and existing
ones self-heal because the render-side dedupe wins regardless. `RitualsApp.js`'s parent-level
`addCustomMood` was deliberately left permissive, so restore/backup payloads are never rejected.

**Also landed:** a permanent "N chosen · …" / "Pick at least one — tap a chosen one again to take it back."
line under the mood question, reading the state `toggleMood` writes — the only copy in the app that says the
chips toggle off, and the diagnostic the next walk needs: if the line doesn't change on a tap, the tap never
reached `toggleMood`; if it changes but the chip stays highlighted, the tap landed and the row didn't repaint.

**The duplicate-key fix is a candidate root cause, not a confirmed one** — WALK-04's next pass is what
confirms or eliminates it, using the new "chosen" line as evidence instead of a fourth theory.

**Tests (+12, no new suite files):** `__tests__/entries/moodChipOrder.test.js` (+6) — `allMoodChips` no
customs / exact-name collision / case-insensitive collision / whitespace collision / duplicate customs
collapse / non-strings and non-arrays. `__tests__/screens/WriteFlowMood.test.js` (+5) — empty-copy line ·
"1 chosen · Grateful" after one pick · back to empty copy on second tap (the (h) regression guard,
independent of chip styling) · `moodNameError` blocks the create path and shows its string · a colliding
`customMoods` prop yields exactly one chip. `__tests__/screens/ArchiveFilters.test.js` (+1) — same one-chip
dedupe check.

**Proof:** `npm test` → **838 passed, 83 suites** (was 826/83). `npx expo export --platform android` clean.
**Ship:** OTA lane, no bump — rides the next batch; no `Release-Lane` trailer on this commit.
**Commit:** `fix(entries): a feeling you picked can be put back down (IMP-069)` (`b2ff8c4`).
**Runtime proof:** **WALK-04**, re-run whole — a separate chat. Say plainly in the walk that this fix removes
one provable failure mode and is not confirmed as the (h) root cause until the walk reports what the
"chosen" line does on a stuck tap.

### IMP-070 — one emoji, and the block says what it makes   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-16)

**Why.** WALK-04 finding (f), 2026-08-15. The custom-mood face field (`WriteFlow.js` and its twin in
`MoodManager.js`) accepted any number of emoji — `isEmojiish` allows up to 8 code points — so a mood's face
could be a multi-glyph string that has to fit a 34dp circle, a chip and a heatmap cell. The block's only copy
("Name your own" / "Give it a face, then a name.") never said it makes a **feeling of your own, represented
by a single emoji**, and the placeholder `"or type one…"` described text, not emoji.

**Landed as specified:** new `firstEmoji(s)` in [`src/entries/emojiInput.js`](../src/entries/emojiInput.js)
— hand-rolled grapheme clustering (no `Intl.Segmenter` on Hermes): one base code point plus its modifiers
(variation selectors, skin tones, the combining keycap), a regional-indicator pair treated as one flag
cluster, and ZWJ sequences chained through their own base+modifiers. Tag-sequence subdivision flags are
deliberately not handled — they truncate to their base flag. `isEmojiish` was left exactly as-is; it stays
the *storage* validator `sanitizeCustomMoodEmoji` uses on restore, separate from this *input* rule. Both
`WriteFlow.js`'s and `MoodManager.js`'s `onEmojiTyped` now sanitize on change with `firstEmoji` instead of
gating with `isEmojiish` (that import is now unused in both screens and was dropped). Copy: the subtitle in
`WriteFlow.js` is now "Make a feeling of your own: one emoji for its face, then what you call it."; both
face-field placeholders read "or any emoji…", with `WriteFlow.js`'s field widened from 90 to 110 to match
`MoodManager.js` and avoid clipping. `MoodManager.js`'s name field also picked up `stripEmoji` on change
(`onChangeText={(v) => setNameInput(stripEmoji(v))}`) — IMP-066 sanitized the create path's name field and
left the edit path behind; this closes that gap.

**Tests (+10, no new suite files):** `__tests__/entries/emojiInput.test.js` (+7, new `describe('firstEmoji')`)
— every `MOOD_PALETTE` glyph round-trips · `'🌵🌵🌵'` → `'🌵'` · `'❤️🔥'` → `'❤️'` · `'👍🏽'` → `'👍🏽'` · a ZWJ
family sequence returns whole · `'abc'`/`''`/`null`/`undefined` → `''` · `'🙂abc'` → `'🙂'`.
`__tests__/screens/WriteFlowMood.test.js` (+2, 2 existing assertions repointed from the old `'or type
one…'` placeholder to `'or any emoji…'`) — typing `'🌵🌵🌵'` leaves `'🌵'` in the field and Add fires with
it · the new subtitle renders. `__tests__/screens/MoodManager.test.js` (+1) — the edit sheet's face field
holds `'😬'` after typing `'😬😬'`.

**Proof:** `npm test` → **848 passed, 83 suites** (was 838/83). `npx expo export --platform android` clean.
**Ship:** OTA lane, no bump — rides the next batch; no `Release-Lane` trailer on this commit.
**Commit:** `fix(entries): a custom feeling gets one face, and the block says what it makes (IMP-070)`
(`8b7a976`).
**Runtime proof:** **WALK-04**, re-run whole — a separate chat.

### IMP-071 — the filter row stops jumping under your thumb   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-16)

**Why.** WALK-04 finding (g), 2026-08-15. **This reverses one line IMP-065 deliberately added** — not a
defect, a design decision made after living with it. IMP-065 gave the Archive's mood filter row two
behaviours at once: the selected chip sorts to the front, and the row scrolls back to `x: 0` so the user can
see where it went. Walked live, the scroll is the problem: picking a filter throws the whole row back to the
start, so choosing a second and third mood means scrolling right again each time to get back to where you
were reading.

**Landed as specified:** the owner's call — the chip still moves to the front, the view does not move.
`orderMoodChips` and its use are untouched (front-sorting still answers WALK-04's earlier finding (c)).
`toggleMood` in [`src/screens/ArchiveFilters.js`](../src/screens/ArchiveFilters.js) no longer calls
`scrollTo`; the `chipScroll` ref and its `useRef` import are gone entirely (a dead ref was judged an
invitation to re-add the scroll — this was the second design pass on these eight lines), and the `ref` prop
was removed from the chip row's `ScrollView`. Out of scope, per spec: `WriteFlow`'s chip row (wraps, never
scrolled, belongs to IMP-069), the date pickers, the clear button.

**Tests (+2, no new suite files):** `__tests__/screens/ArchiveFilters.test.js`, new `describe('ArchiveFilters
— IMP-071')` — pressing an unselected chip calls `onChange` with that mood appended and `text`/`from`/`to`
untouched · a source assertion that `src/screens/ArchiveFilters.js` contains no `scrollTo(`. The file's
existing IMP-065 cases, including both chip-order assertions, stayed green untouched.

**Proof:** `npm test` → **850 passed, 83 suites** (was 848/83). `npx expo export --platform android` clean.
**Ship:** OTA lane, no bump — rides the next batch; no `Release-Lane` trailer on this commit.
**Commit:** `fix(archive): the mood filter row stops jumping under your thumb (IMP-071)` (`4072e8d`).
**Runtime proof:** **WALK-04**, re-run whole — a separate chat.

### IMP-073 — the lifetime heatmap reads as one grid   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-16)

**Why.** WALK-09, 2026-08-16. Everything the "Your record" heatmap computes was right (kept / frozen / missed
/ not-yet-started / future all resolved correctly), but three layout defects made it read as broken: the
4-entry legend wrapped awkwardly, month labels wrapped mid-word ("Aug" → "Au"/"g"), and grid cells rendered
at visibly inconsistent sizes because `done` was the only state at `borderWidth: 0`.

**Landed as specified, three decided design moves, not a layout patch:**
- **Legend drops to three entries** (`LEGEND` in [`InsightsScreen.js`](../src/screens/InsightsScreen.js), now
  exported) — the owner's call from the walk: "not yet started" doesn't earn a legend row. `empty` moved from
  a dashed-outline decorated state to a flat, faint fill (`c.ghostBtn`), which also deletes the codebase's
  only `borderStyle: 'dashed'` (Android renders it unreliably with `borderRadius`).
- **Every cell state now returns `borderWidth: 1`** in `heatCellStyle` (now exported) — states with no visible
  ring get a transparent border instead of no border, so geometry stops varying while the paint stays
  identical. This is the fix the function's own pre-existing comment already called for.
- **The gutter scales with font size and the legend indents from it**, closing the drift that caused the
  wrap: new `heatGutterWidth(fontScale)` + `HEAT_GUTTER_BASE_DP` (28) + `HEAT_CELL_GAP` (4) in
  [`src/insights/heatCells.js`](../src/insights/heatCells.js), mirroring IMP-067's `moodLabelWidth` (same
  1.5x cap at `MAX_FONT_SCALE`). `LifetimeHeat` reads `fontScale` itself via `useWindowDimensions` (already
  imported in the file) since it's its own component. The month-label `View` gained `numberOfLines={1}` +
  `ellipsizeMode="clip"` (clip, not the RN default "tail", so a genuine overflow reads as "Au" not "A…" on a
  three-letter month). The legend's `paddingLeft` is now `gutter + HEAT_CELL_GAP` — derived, not a second
  hardcoded constant — and the legend row gained `rowGap: 8` for graceful degradation if a large font scale
  still forces a second row.

Out of scope, per spec, and untouched: the Archive tab's own month heatmap (`Heat` in `ArchiveScreen.js`),
`cellState`'s precedence, `buildLifetimeHeatmap`, the today ring, the `done`-only `Pressable` and its
`accessibilityLabel` (IMP-052), the XP/level line, `DeeperInsights`.

**Tests (+8, one new suite file → 84):** `__tests__/insights/heatCells.test.js` gained a `describe('heatGutterWidth')`
block (+5) — base width at 1x, growth to 42 at 1.5x, cap at 42 for 2.0x, no shrink below 1x, and
undefined/NaN/non-numeric fall back to the base; existing `cellState`/`monthLabelsForRows` cases stayed
green untouched. New `__tests__/insights/heatCellStyle.test.js` (+3) — every state has identical
`borderWidth: 1`, no state uses `borderStyle: 'dashed'`, and `LEGEND` is exactly `['done', 'frozen', 'missed']`.

**Proof:** `npm test` → **860 passed, 84 suites** (was 852/83). `npx expo export --platform android` clean.
**Ship:** OTA lane, no bump — rides the next batch; no `Release-Lane` trailer on this commit.
**Commit:** `fix(insights): the lifetime heatmap reads as one grid (IMP-073)` (`67d0736`).
**Runtime proof:** **WALK-09**, re-run whole — a separate chat.

### IMP-074 — the Paywall footer survives the first measure pass   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-16)

**Why.** WALK-07 re-run, 2026-08-16. IMP-068's fix was real but only half the mechanism: `style={{ flex: 1 }}`
on Paywall's `ScrollView` (`Paywall.js:46`) fixes the *static* case, but on Android the modal `Dialog`'s window
size is unknown on the first measure pass, so `flex: 1` on the outer `View` resolves against nothing and the
`ScrollView` goes unbounded — same trap `Shop.js:23-29` already documents and works around. Observed live: open
Paywall → footer missing entirely (pushed off-screen); select a plan (any re-render) → a correcting layout pass
fires and the footer reappears, overlapping the price/perks exactly as before IMP-068.

**Landed exactly as specified — both guards, not one:** `Paywall.js` now reads `useWindowDimensions()` and caps
the outer `View` with `maxHeight: winH` alongside the existing `flex: 1`, with a `testID="paywallRoot"` added
so the test reaches the root by name rather than tree position. IMP-068's `flex: 1` on the `ScrollView` and its
comment are untouched — decision 1 in the spec is explicit that they're not alternatives. A comment mirroring
`Shop.js:23-29`'s shape explains the trap and flags that the two lines are the two halves of one fix.
Out of scope, per spec, and untouched: `contentContainerStyle`, the footer `View`, `LegalFooter`/
`usePurchaseFlow` in `PlusFlow.js`, `useLivePrices`, the plan selector, every other modal screen.

**Tests (+2, no new suite file):** `__tests__/screens/Paywall.test.js` gained a `describe('Paywall — IMP-074')`
block — the root view's `maxHeight` equals `Dimensions.get('window').height` and `flex` stays `1`; a source
assertion that the file uses `useWindowDimensions()` and never a one-shot `Dimensions.get(`. The existing
`describe('Paywall — IMP-068')` block stayed green untouched.

**Proof:** `npm test` → **862 passed, 84 suites** (was 860/84). `npx expo export --platform android` clean.
**Ship:** OTA lane, no bump — rides the next batch; no `Release-Lane` trailer on this commit.
**Commit:** `fix(plus): the Paywall footer survives the first measure pass (IMP-074)` (`87ab21c`).
**Runtime proof:** **WALK-07**, re-run whole — a separate chat.

---

### IMP-075 — the tip cards go away   ·   Lane: OTA   ·   Status: ✅ code-complete (2026-08-16)

**Why.** WALK-10 (2026-08-16) passed clean — the IMP-041 tip cards worked exactly as specified. Having seen
them live, the owner decided against the feature anyway, confirmed via `AskUserQuestion`: not a placement or
style gripe — *they exist at all, drop them, rely on "How it works"*. That card already covers all six
mechanics on demand. A design reversal, not a bug fix; none of the deleted code was broken.

**Landed exactly as specified.** Deleted `src/screens/TipCard.js` and every wire that fed it: `TIPS`,
`pendingTip`, `markTipSeen` from `src/content/tips.js` (its header comment rewritten to describe `EXPLAINERS`
only and to record why the tip half is gone); the `tip`/`onDismissTip` props, imports and render blocks from
`HomeScreen.js`, `ArchiveScreen.js` and `YouScreen.js` (`EXPLAINERS`'s import in `YouScreen` untouched); the
`seenTips` state, `dismissTip`, its two imports and its three call sites (autosave, `currentSlice()`, the
three screen props) from `RitualsApp.js`; and `'seenTips'` from `PERSISTED_KEYS` in `src/persistence/state.js`
— no `SCHEMA_VERSION` bump, no migrator, per decision 3 (the key self-purges on the next autosave). Two stale
comments naming `TipCard`/`seenTips` fixed in `FreezeNoticeCard.js` and `scripts/gen-v2-fixture.js`; no
fixture data changed. `EXPLAINERS` stayed byte-identical throughout.

**Tests:** RED-first per the spec's TDD note — the 12-test `describe('IMP-075 — the tip cards are gone')`
block in `__tests__/content/tips.test.js` was written and run against the pre-deletion code first; exactly
2 of 12 passed (the `EXPLAINERS` identity guard and the legacy-payload `deserialize` guard), the other 10
failed as predicted. Ten of the twelve assert an absence (dead exports, no `TipCard`/`onDismissTip` in the
three screens' and `RitualsApp.js`'s source, `seenTips` out of `PERSISTED_KEYS`), the other two are survival
guards (`EXPLAINERS` ids unchanged; a legacy payload carrying `seenTips` still deserializes and
`pickPersisted` drops it). The three old describes (`pendingTip`, `markTipSeen`, `TIPS`) and the `SCREENS`
const were deleted; the file's import narrowed to `EXPLAINERS` only.

**Proof:** `npm test` → **866 passed, 84 suites** (862 − 8 removed + 12 added; suite count unchanged, same
file). `npx expo export --platform android` clean.
**Ship:** OTA lane, no bump — rides the pending release batch; no `Release-Lane` trailer on this commit.
**Commit:** `feat(tips): the tip cards go away (IMP-075)` (`11fa421`).
**Runtime proof:** none needed, deliberately — the owner already walked this exact behaviour live during
WALK-10 (all three tips dismissed, relaunched; the block was conditional so "all dismissed" and "deleted"
render identically). Test 12 covers the only data-shaped risk. WALK-10's ✅ row stays as history; its step 1
now describes removed behaviour.

---

## ⏸ Deferred specs (NOT history — still valid, waiting on the owner)

> Moved out of PROGRESS.md on 2026-07-31 to keep the live cursor lean once a second spec (IMP-032) opened. These are **not** finished work. If the owner revives one, lift the block back into PROGRESS.md as the ACTIVE TRACK.

### IMP-022 — wire the two dead You-tab buttons (Save as PDF + About)   ·   Lane: BUILD   ·   Status: ⏸ deferred 2026-07-31 (owner)

**Why it can't be dropped:** PDF export is *already sold* on the paywall ([`src/data.js:148`](../src/data.js#L148), `PLUS_PERKS`), so this must be built (or the perk line deleted) **before `PLUS_ENABLED` flips**. Part B (the About sheet, which also kills the hardcoded `v1.0`) can be lifted out and shipped separately if a build is going out anyway.

**Problem (owner-found).** Two rows in the **General** card of [`src/screens/YouScreen.js`](../src/screens/YouScreen.js) render full UI but do nothing — their `onPress` is an empty `() => {}`:
1. **"Save as PDF"** (line ~145–157) — for a **Plus** user it runs a no-op; non-Plus correctly routes to the paywall. There is **no PDF code anywhere** (no `expo-print` in `package.json`; the only "PDF" string in `data.js` is marketing copy). The UI (icon, "Plus" badge, paywall gate, chevron) was built but the export was never implemented.
2. **"About Daily Rituals"** (line ~159–160, shows `v1.0`) — `onPress={() => {}}`; opens nothing.

**Goal.** Make both buttons actually work, keeping every existing gate/style intact. **Two parts, one task** — Part A needs a new native module so the whole task is **BUILD lane**; Part B is JS-only but ships in the same shipment.

> **⚠️ Baseline changed — this spec was written pre-IMP-027.** The app is now on **Expo SDK 54 / RN 0.81 / React 19**, not SDK 51. Install `expo-print` with **`npx expo install expo-print`** (never a bare `npm install`) so it resolves to the SDK-54-compatible version. Two knock-on facts for Part A: (1) SDK 54's `expo-file-system` default export is a new **File/Directory** API — the old string-based surface (`writeAsStringAsync`, `documentDirectory`, `EncodingType`) now lives at **`expo-file-system/legacy`**, which is what `src/backup/io.js` imports, so copy *that* import line, not the SDK-51 one; (2) `jest.setup.js` stubs **both** `expo-file-system` and `expo-file-system/legacy` from `test-mocks/expoFileSystemStub.js` — if `src/export/io.js` reaches for a different native path, add it there too, because Jest keys mocks on the literal module path and a missing stub is silent.

#### Part A — Save as PDF ("Your Book", Plus-gated export)
- Add **`expo-print`** dependency (new native module → forces a dev build; `expo-sharing` + `expo-file-system` already vendored by IMP-020, reuse them — see the `/legacy` note above).
- **Pure core first (TDD):** new `src/export/pdf.js` → `buildBookHtml(entries, meta)` returning a self-contained HTML string (inline styles, no network assets) — title page + chronological entries (real device dates, same date helpers as `src/insights/dateKeys.js`), empty-state when no entries. Unit-test the builder (entry rendering, ordering, escaping of user text, empty state). **This is the single tested boundary** — mirror the `src/backup/` shape.
- **Thin native wrapper:** `src/export/io.js` → `exportPdf()` = `Print.printToFileAsync({ html })` → `Sharing.shareAsync(uri)`. Lazy-require natives + reuse IMP-020's typed `nativeUnavailable` pattern so **Expo Go shows the toast** instead of crashing (see `src/backup/io.js` for the exact pattern after the 5e7132c revert).
- **Wire-up:** in `YouScreen.js` replace the `plus ? () => {}` branch with `plus ? onExportPdf : …` (keep `plusEnabled ? onOpenPaywall : undefined` untouched). Thread `onExportPdf` from `RitualsApp.js` (build HTML from real entries + call `io.exportPdf`), with the same try/catch + toast wiring `doExport`/`doImport` use.
- **Do not** change the paywall path, the "Plus" badge, or non-Plus behavior.

#### Part B — About Daily Rituals
- Replace its `onPress={() => {}}` with a real **About** sheet/modal (a small new component, OTA-able on its own): app name + tagline, **version pulled from `expo-application` / `Constants.expoConfig.version`** (kill the hardcoded `v1.0`), a one-line "Your journal lives only on this device" local-first note (consistent with the local-only decision), and a credits/"made by" line. No external links unless trivial.
- Keep it a presentational component fed by props; no new persistence.
- ⚠️ **Coordinate with IMP-032:** the dev harness is opened by a **long-press on this same row** (`onLongPress={onOpenDev}`). Keep that prop wired when you replace the `onPress` — losing it silently kills the harness entry point.

#### Steps
1. RED: `__tests__/export/pdf.test.js` for `buildBookHtml` (entries, order, escaping, empty). 2. GREEN: `src/export/pdf.js`. 3. `src/export/io.js` thin native wrapper (lazy-require + `nativeUnavailable` toast). 4. `RitualsApp.js` → `onExportPdf` handler + try/catch/toast; pass into `YouScreen`. 5. `YouScreen.js` → wire Part A onPress; build + wire **About** component for Part B (version from `Constants`). 6. `npm test` green; `npx expo export --platform android` clean. 7. `npx expo install expo-print` (**not** bare `npm install` — see the baseline note above); version bump per the rule below. 8. Commit.

**Commit message:** `feat(you): implement Save as PDF export + About sheet — wire the two no-op You-tab buttons (IMP-022)`

**Ship lane:** **BUILD** (new `expo-print` native module). No `Release-Lane` trailer until owner says ship. Batch with the **Annual Recap** (also BUILD: `react-native-view-shot`) to avoid a one-feature build.

**Version bump:** the repo is already at **v1.0.5 / versionCode 11** (IMP-031's `bump:native`), which has not shipped. **One bump per shipment** — if IMP-022 lands before vc11 builds, it rides that bump and must NOT bump again. Only run `npm run bump:native` if vc11 has already been built and submitted.

**Smoke test after build:** Plus user PDF export → share sheet opens → file opens; non-Plus still hits paywall; Expo Go shows the unavailable toast; About sheet opens with the real version string (from `Constants`, not a hardcoded `v1.0`).

---

## Session notes (archived from PROGRESS.md)

_Append-only handoff log moved out of PROGRESS.md to keep it light. Newest 1–2 notes stay live in PROGRESS.md; everything else is here. Git history is the full record._

_2026-08-16 (IMP-073, the lifetime heatmap reads as one grid) — **code-complete, committed `67d0736`, not
shipped; OTA lane, rides the next batch.** Landed exactly as specified: `heatGutterWidth` +
`HEAT_GUTTER_BASE_DP`/`HEAT_CELL_GAP` added to `src/insights/heatCells.js` (mirrors IMP-067's
`moodLabelWidth`); `InsightsScreen.js`'s `LEGEND` trimmed to three entries and exported, `heatCellStyle`
exported with every state at `borderWidth: 1` (`empty` now `c.ghostBtn`, no dashed border), `LifetimeHeat`
wires the derived gutter through its five call sites. Out-of-scope items (`ArchiveScreen.js`'s `Heat`,
`cellState`, `buildLifetimeHeatmap`, the today ring, `DeeperInsights`) untouched. +8 tests exactly as
specified. **Proof:** `npm test` → **860 passed, 84 suites** (was 852/83). `npx expo export --platform
android` clean. LAST command: `git commit` → `67d0736`. Archived the spec + WALK-09 resolved-finding note
into `docs/build-log.md`, ticked the backlog row, updated the ACTIVE TRACK banner and stack line, moved the
WALK-04 note down to `docs/build-log.md` → "Session notes". NEXT: a build chat takes **IMP-074** (the only
row left). A walk chat can now take **WALK-09** (unblocked) too, alongside **WALK-07** (still blocked on
IMP-074), **WALK-06**, or **WALK-15**._

_2026-08-16 (IMP-071, the filter row stops jumping under your thumb) — **code-complete, committed
`4072e8d`, not shipped; OTA lane, rides the next batch. Last spec in the queue — `docs/specs-open.md` is now
empty.** `src/screens/ArchiveFilters.js`: `toggleMood` no longer calls `scrollTo`; the `chipScroll` ref, its
`ref` prop, and the `useRef` import are gone. `orderMoodChips`/front-sorting untouched, as directed. +2 tests
in `ArchiveFilters.test.js` (`describe('ArchiveFilters — IMP-071')`): an unselected-chip press appends via
`onChange` with `text`/`from`/`to` untouched, plus a source assertion the file contains no `scrollTo(`.
Existing IMP-065 cases stayed green. **Proof:** `npm test` → **850 passed, 83 suites** (was 848/83). `npx
expo export --platform android` clean. LAST command: `git commit` → `4072e8d`. Archived the spec,
emptied `specs-open.md`'s index, ticked the row, closed the WALK-04 finding note (all three of (g)/(h)/(f)
landed — next run checks all three), updated the ACTIVE TRACK banner, corrected the stack line, moved the
IMP-069 note down. **Not to lose: WALK-04 hasn't actually been re-run since landing** — the 🚦 walks
(WALK-13 → 03 → 12) still gate the native build regardless. NEXT: backlog is empty — Opus must scope a new
`IMP-xxx` before there's a spec to take. A walk chat can still take **WALK-07**, **WALK-06**, or **WALK-15**._

_2026-08-15 (Opus scoping chat — WALK-04's three re-run defects) — **no code, docs only, uncommitted at the
time of writing.** Wrote `IMP-069` / `IMP-070` / `IMP-071` in full into `docs/specs-open.md` (findings h, f,
g — take them in that order), added their three ⬜ backlog rows, rewrote the WALK-04 finding section from
"needs scoping" to what a build chat and the next walk each have to carry, pointed WALK-04's row and result
block at the three specs, corrected the stale stack line (823/82 → **826/83**), and moved the IMP-067 note
down to `docs/build-log.md`. The one thing not to lose: **IMP-069 does not claim to have found (h)'s root
cause** — it removes the only provable failure mode (duplicate React keys in the chip row) and adds the
"N chosen" line so WALK-04's next pass can report evidence instead of a fourth theory. NEXT: a build chat
takes **IMP-069** (first ⬜). A walk chat can still take **WALK-07**, **WALK-06** or **WALK-15** — none of
them waits on this._

_2026-08-15 (IMP-068, the Paywall footer stops covering the price) — **code-complete, committed `ce504fc`,
not shipped; OTA lane, rides the next batch.** The single spec'd change — `src/screens/Paywall.js`'s
`ScrollView` ([`:43`](../src/screens/Paywall.js#L43)) gained `style={{ flex: 1 }}` (a load-bearing-comment
explains why), `contentContainerStyle` and `WriteFlow` left untouched per the spec's explicit scope. 3 new
tests exactly as specified in new `__tests__/screens/Paywall.test.js` — the outer `ScrollView`'s flattened
style has `flex === 1` (the regression guard) · the last `PLUS_PERKS` entry renders · the annual price
(`getAllByText`, since it also appears in `LegalFooter`) and the trial CTA both render. **Proof:** `npm test`
→ **826 passed, 83 suites** (was 823/82). `npx expo export --platform android` clean. LAST command: `git
commit` → `ce504fc`. Archived IMP-068's spec into `docs/build-log.md`; `docs/specs-open.md`'s index was then
empty (all six of IMP-063…068 landed). Ticked its `PROGRESS.md` row, closed out the WALK-07 finding note (all
three of (a)(b)(c) now landed), updated the ACTIVE TRACK banner to say the build queue is empty, and moved
the IMP-066 session note down to `docs/build-log.md` (2-note budget). Did not touch WALK-07 — separate chat,
per the spec's own closing line._

_2026-08-15 (IMP-067, a stacked row wraps; Mood Mix bars start in one place) — **code-complete, committed
`e0c318c`, not shipped; OTA lane, rides the next batch.** All 4 spec steps done in order — `Row.js`'s stacked
value ([`:36`](../src/ui/Row.js#L36)) is now `numberOfLines={3}` (inline value unchanged at `1`); `YouScreen.js`
teaser string shortened to `"After your first year"`; new pure `src/insights/moodMixLayout.js` →
`moodLabelWidth(fontScale)` (fixed 96dp base, scales with OS font, capped at 1.5x/144dp); wired into
`InsightsScreen.js` via `useWindowDimensions()` read **above** the `data.empty` early return (hooks-order
requirement), replacing the Mood Mix label column's `minWidth: 84` + `flexShrink: 1` with a fixed `width:
labelW`. 7 new tests exactly as specified — new `__tests__/insights/moodMixLayout.test.js` (+5: `1`→96,
`1.5`→144, `2.0`→144 capped, `0.85`→96, `undefined`/`NaN`/`'abc'`→96) and `__tests__/ui/Row.test.js` (+2:
stacked value `numberOfLines===3`, inline value `numberOfLines===1`, both found by text). All 3 pre-existing
`assertNoUnboundedFlexText` cases stayed green. **Proof:** `npm test` → **823 passed, 82 suites** (was
816/81). `npx expo export --platform android` clean. LAST command: `git commit` → `e0c318c`. Archived
IMP-067's spec into `docs/build-log.md`, dropped its row from `docs/specs-open.md`'s index (queue is now just
IMP-068), ticked its `PROGRESS.md` row, updated the WALK-07 finding note ((b)(c) now landed, (a)/IMP-068
remains), and moved the IMP-065 session note down to `docs/build-log.md` (2-note budget). Did not touch
WALK-07 — separate chat, per the spec's own closing line._

_2026-08-15 (IMP-065, clear the search; the moods you picked come to the front) — **code-complete, committed
`f632688`, not shipped; OTA lane, rides the next batch.** All 4 spec steps done in order — new pure module
`src/entries/moodChipOrder.js` (`orderMoodChips(all, selected)`, selected chips to the front, relative order
preserved in both groups, same-reference return when nothing selected); `ArchiveFilters.js`'s `TextInput`
gained a clear button (constant `paddingRight: 44` gutter, `Close` icon, shown only when `text` is non-empty)
and the mood-chip `ScrollView` now maps `orderMoodChips([...MOODS, ...customMoods], moods)` with a
`chipScroll` ref that scrolls to `x: 0` on select (not deselect); each chip `Pressable` gained
`accessibilityRole="button"`, `accessibilityLabel={m}`, `accessibilityState={{ selected: sel }}`;
`ArchiveScreen.js`'s `ResultLine` label went unconditional — `` `${snip.field} · ` `` — so a `did` match now
gets `did · ` the same way `wished` always did. 13 new tests exactly as specified — new
`__tests__/entries/moodChipOrder.test.js` (+6), new `__tests__/screens/ArchiveFilters.test.js` (+5),
`__tests__/screens/ArchiveResults.test.js` (+2, 3 updated: the two no-query cases now assert both labels
absent, the `did`-match case now asserts `getByText('did · ')` instead of `wished · ` being null). **Proof:**
`npm test` → **805 passed, 81 suites** (was 792/79). `npx expo export --platform android` clean. LAST
command: `git commit` → `f632688`. Archived IMP-065's spec into `docs/build-log.md`, dropped its row from
`docs/specs-open.md`'s index (queue is now IMP-066…068, three specs), ticked its `PROGRESS.md` row, and
moved the IMP-063 session note down to `docs/build-log.md` (2-note budget). Did not touch WALK-04 — full
re-run is a separate chat, per the spec's own closing line. NEXT: a build chat takes **IMP-066** (first ⬜,
[spec](docs/specs-open.md#imp-066--the-mood-step-stops-fighting-you)). A walk chat can still take **WALK-02**
or **WALK-15**, unaffected by this chat's work._

_2026-08-15 (IMP-066, the mood step stops fighting you) — **code-complete, committed `bf32690`, not shipped;
OTA lane, rides the next batch.** All 4 spec steps done — new `stripEmoji` in `src/entries/emojiInput.js`
(range-filters pictographic blocks/joiners, distinct from `isEmojiish`'s `>= 0x00a0` rule so `'Café'` and
Devanagari survive); `keyboardShouldPersistTaps="handled"` on both mood-step `ScrollView`s (`toggleMood` was
never the bug — a swallowed tap was); mood chip `Pressable` gained `accessibilityRole`/`Label`/`State`; the
custom-mood block became one headed group ("1 · Its face" / "2 · Its name"), name field now strips emoji on
type with `maxLength={24}`. 11 new tests exactly as specified (7 in `emojiInput.test.js`, 4 in
`WriteFlowMood.test.js`, full detail in `docs/build-log.md`); all 7 pre-existing cases stayed green.
**Proof:** `npm test` → **816 passed, 81 suites** (was 805/81). `npx expo export --platform android` clean.
LAST command: `git commit` → `bf32690`. Archived IMP-066's spec into `docs/build-log.md`, dropped its row
from `docs/specs-open.md`'s index (queue is now IMP-067…068, two specs), ticked its `PROGRESS.md` row,
closed out the WALK-04 finding note (both (d) and (e) now landed), and moved the IMP-064 session note down
to `docs/build-log.md` (2-note budget). Did not touch WALK-04 — separate chat. NEXT: a build chat takes
**IMP-067** (first ⬜, [spec](docs/specs-open.md#imp-067--a-stacked-row-wraps-mood-mix-bars-start-in-one-place)).
A walk chat can still take **WALK-02** or **WALK-15**, unaffected by this chat's work._

_2026-08-15 (IMP-064, count your candles, and say plainly what one did) — **code-complete, committed
`185e326`, not shipped; OTA lane, rides the next batch.** New pure module `src/home/candleRow.js` —
`candleRow(count, max = 5)` → `{ slots, lit, overflow }` (up to 5 real icons then a `×N` badge; `count = 0`
still draws one unlit slot) and `candleRowCopy(count)` for the caption. `StreakFreeze` in `src/gamify.js`
now renders both instead of the old literal `[0, 1, 2].map`. `freezeNoticeCopy` in `src/home/freezeNotice.js`
rewritten to the three-fact shape — `Your streak is safe.` / `A candle burned for {day}. {N} left.` (plural:
`3 candles burned for 3 days you missed. 1 left.`; zero-left: `That was your last one.`) — `addFreezeNotice`/
`formatDay` untouched, `FreezeNoticeCard.js` needed no edit. 10 new tests in new
`__tests__/home/candleRow.test.js`; `freezeNotice.test.js`'s 4 cases and `FreezeNoticeCard.test.js`'s 3 got
the new expected strings, no new cases there. **Proof:** `npm test` → **792 passed, 79 suites** (was
782/78). `npx expo export --platform android` clean. LAST command: `git commit` → `185e326`. Archived
IMP-064's spec into `docs/build-log.md`, dropped its row from `docs/specs-open.md`'s index (queue is now
IMP-065…068, four specs), ticked its `PROGRESS.md` row, and moved the IMP-062 session note down to
`docs/build-log.md` (2-note budget). Did not touch WALK-06 — full re-run is a separate chat, per the spec's
own closing line. NEXT: a build chat takes **IMP-065** (first ⬜, [spec](docs/specs-open.md#imp-065--clear-the-search-the-moods-you-picked-come-to-the-front)).
A walk chat can still take **WALK-02** or **WALK-15**, unaffected by this chat's work._

_2026-08-15 (IMP-063, a saved day looks saved) — **code-complete, committed `b7eb4c3`, not shipped; OTA
lane, rides the next batch.** All 7 spec steps done in order — `FREEZE_EMOJI` added to `src/data.js`; all
three cell builders in `src/home/calendar.js` (`buildHeatmap`/`buildLifetimeHeatmap`/`buildWeekStrip`) took
a third `{ frozenDays = [] }` options arg and now emit `frozen: true` on the branch that used to always emit
`missed`; `cellState` in `src/insights/heatCells.js` gained `frozen` with precedence
`future > frozen > missed > empty > done`; `InsightsScreen.js` got the `frozen` style branch + legend row;
`ArchiveScreen.js`'s `Heat` got the frozen branch **above** the mood branch (it would otherwise fall through
and render 🌫️, since a frozen cell carries neither `missed` nor `empty`) and picked up the two
already-existing-but-unused `MISS_EMOJI`/`FREEZE_EMOJI` exports in place of a hardcoded `'💀'`; `HomeScreen.js`
got the same treatment for the week strip; `RitualsApp.js` threads its existing `frozenDays` state into all
three screens. 10 new tests exactly as specified across `calendar.test.js` (+6), `heatCells.test.js` (+2)
and `ArchiveHeat.test.js` (+2) — no new suite files. **Proof:** `npm test` → **782 passed, 78 suites** (was
772/78). `npx expo export --platform android` clean. LAST command: `git commit` → `b7eb4c3`. Archived
IMP-063's spec into `docs/build-log.md`, dropped its row from `docs/specs-open.md`'s index (queue is now
IMP-064…068, five specs), ticked its `PROGRESS.md` row, and moved the IMP-061 session note down to
`docs/build-log.md` (2-note budget). Did not touch WALK-06 — full re-run is a separate chat, per the spec's
own closing line. NEXT: a build chat takes **IMP-064** (first ⬜, [spec](docs/specs-open.md#imp-064--count-your-candles-and-say-plainly-what-one-did)).
A walk chat can still take **WALK-02** or **WALK-15**, unaffected by this chat's work._

_2026-08-14 (IMP-062, the restore offer outlives the launch that made it) — **code-complete, committed
`ba8e684`, not shipped; OTA lane, rides the next batch.** All 4 spec steps done in order — `storage.js`'s
new `restoreOfferAnswered` trio, `importFlow.js`'s `onImported` post-success hook, ownership of the offer's
answer moved from `RitualsApp`'s local state up into `App.js` alongside the stash (the missing piece: an
unconditional `readPendingRestore()` before every `setHydrated`, not just inside the once-only quarantine
branch — full defect writeup in `docs/build-log.md` → IMP-062). 8 new tests exactly as specified across
`importFlow.test.js` and `storage.test.js`. **Proof:** `npm test` → **772 passed, 78 suites** (was 764/78).
`npx expo export --platform android` clean. LAST command: `git commit` → `ba8e684`. Archived IMP-062's spec
into `docs/build-log.md`, emptied `docs/specs-open.md`'s index, condensed the WALK-02 finding in this file's
Open items to a RESOLVED pointer, moved the WALK-01 session note down to `docs/build-log.md` (2-note
budget), and **unblocked WALK-02** in `docs/walk-open.md` — re-run the whole walk from step 1 (new steps
7–9 prove the fix; the earlier partial pass doesn't count). Did not run the walk itself — separate chat, per
the spec's own closing line. NEXT: **no open IMP spec — the build queue is empty**; a build chat should say
so rather than invent one. A walk chat takes **WALK-02** (🚦, first row, 👤 owner)._

_2026-08-14 (IMP-059, the app has one accessibility label) — **code-complete, committed `fa523f3`, not
shipped.** New `src/ui/IconBtn.js` replaces the byte-identical copies in `WriteFlow.js`/`ReadingSheet.js`
(required `label` prop → `accessibilityRole="button"` + `accessibilityLabel`); call sites labelled (`Close
this entry` / `Back a step` / `Close`). Write FAB in `RitualsApp.js` got `accessibilityLabel="Write today's
entry"`, its sibling `Write` text got `accessibilityElementsHidden` so TalkBack doesn't double-read it. The
four `Tab`s got `accessibilityRole="tab"` + `accessibilityState={{ selected: active }}`. Every icon-only
modal-close across `Achievements`, `Shop`, `GetEmbers`, `Paywall`, `ManageSubscription` (`PlusFlow.js`),
`PlusPerks`, `AnnualRecap`, `TrashSheet`, `MoodManager` got a role + a naming label (e.g. `Close the shop`);
`Celebration`/`RestoreNotice`/`RestoreOffer`/`ReminderSheet`/`NameEditModal` needed nothing — their dismiss
controls already carry visible text. `InsightsScreen.js`'s heatmap today-ring and `ui.js`'s `Card` sheen
gradient (both `pointerEvents="none"`, neither hidden from a screen reader by that alone) got
`accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"`. IMP-052's heatmap cell
labels checked, not touched. 2 new tests — `IconBtn.test.js` (role+label) and `FabLabel.test.js` (mounts the
full `RitualsApp` in `SafeAreaProvider` with `expo-notifications` mocked, asserts the FAB's label). `npm
test` → **739 passed, 76 suites**; `npx expo export --platform android` clean. Archived IMP-059's spec to
`docs/build-log.md`, moved the IMP-055 session note there too (this file's 2-note budget), removed
IMP-059's `specs-open.md` index row. Stop point per spec: TalkBack walk is **WALK-14**, not attempted this
chat. NEXT: **IMP-058** (`docs/specs-open.md#imp-058--prompt-packs`) — the only spec left in the backlog._

_2026-08-14 (IMP-058, prompt packs) — **code-complete, committed `8c5755a`, not shipped.** Fixed the
same-length pack-switch trap first: `valid(deck, len, packId)` in `src/content/deck.js` now also requires
`deck.pack === packId`; `selectPrompt(pool, deck, day, packId = 'everyday')` stores `pack` on the deck state
and reinitializes on a pack mismatch, a corrupt deck, **or** a pre-058 deck with no `pack` field (the free
one-reshuffle migration). New `src/content/packs.js` exports `PROMPT_PACKS` (`everyday` reusing the existing
60 `PROMPTS` untouched, plus 20 new prompts each for `grief`/`gratitude`/`change`, used verbatim from spec)
and `packById(id)` falling back to `everyday` for an unknown id. `settings.promptPack` defaults to
`'everyday'` in `theme.js` — no `sanitizeSettings` exception needed. `RitualsApp.js`'s prompt-deck `useMemo`
now reads `selectPrompt(packById(settings.promptPack).prompts, promptDeck, dayNumber(), settings.promptPack)`.
New `src/screens/PromptPacks.js` — a small `ReminderSheet`-shaped bottom sheet listing all four packs (name +
blurb + sample prompt, active one ringed, "Changing packs reshuffles — you will not lose anything." stated
plainly) — wired via a new "Writing prompts" row in `YouScreen.js`'s Preferences card (next to Voice) and a
`promptPacksOpen` modal in `RitualsApp.js`. 9 new tests (7 deck pack-tracking cases + `PromptPacks.test.js`:
all four packs render, selecting calls the setter with its id, active pack marked). `npm test` → **748
passed, 77 suites**; `npx expo export --platform android` clean. Archived IMP-058's spec to
`docs/build-log.md` and trimmed `docs/specs-open.md` back to an empty index (its "done" list note updated),
moved the IMP-060 session note into `docs/build-log.md` too (this file's 2-note budget). NEXT: **the
Improvements backlog has no open spec** — the next chat here waits on Opus to scope a new `IMP-xxx` into
`docs/specs-open.md`, or take the first unchecked phase-ladder task if the owner redirects there._

_2026-08-14 (IMP-061, store screenshots build themselves) — **code-complete, committed `ca850d7`, not
shipped; Dev-only lane so there is nothing to ship.** All 8 spec steps done in order — new
`scripts/shots.config.js`, `scripts/shots.js`, `scripts/shots.sh`, `.maestro/store-shots.yaml`,
`__tests__/shots.test.js`; `@resvg/resvg-js` + `pngjs` devDeps and a `shots` script; `.gitignore` gained
`store/raw/`. Full file-by-file detail is in `docs/build-log.md`. App-side changes are the three dev-only
files the spec named and nothing else. **Selectors were read out of the real code, not guessed** — and one
correction worth carrying into WALK-15: **Achievements' close label is `Close Keepsakes`, not "Close
achievements"**, which the spec's example did not name. Also: `done: true` prefills WriteFlow so `Next` is
live for the 02→03 step pair, and `Launch overlays` is `defaultOpen={false}` so the flow taps it open before
`Achievements`/`Shop`. **Proof:** `npm
test` → **764 passed, 78 suites** (was 748/77; the 16 new tests add ~70s, dominated by 4 real resvg
renders). `npx expo export --platform android` clean. `node scripts/shots.js` run against 7 synthetic raws
in **three different source shapes** (1440×3120, 1080×2400, 1080×1920) produced 7 × `1080x1920 colourType 2`;
`fitRect` returns exactly `{x:210, y:400, w:660, h:1430}` for 1440×3120, matching the spec's ASCII layout
contract to the pixel; both fonts render from the bundled TTFs with `loadSystemFonts: false`; the
missing-raw path exits 1 naming the id. **The synthetic outputs were deleted, not committed** — `store/play/`
is for real captures, which only WALK-15 can make. LAST command: `git commit` → `ca850d7`. Archived
IMP-061's spec to `docs/build-log.md`, emptied `docs/specs-open.md`'s index (queue is now empty), moved the
IMP-059 note down to the build log (2-note budget), and **unblocked WALK-15** in `docs/walk-open.md`.
**Then, at the owner's direction, a second piece of work in the same chat: the walk queue's metadata.**
Audited what has actually shipped by grepping real `Release-Lane` trailers (not the backlog's ✅ column) —
finding recorded as the first Open item above. Rewrote `docs/walk-open.md`'s index: **unblocked WALK-13 and
WALK-14** (stale — IMP-054/`18d8c2e` and IMP-059/`fa523f3` both landed 2026-08-13), **re-sorted the index by
what a failure would cost** with a new Gate column — 🚦 blocks the build (02, 05, 13, 03, 12) · 🎨 follows
the release (04, 06, 07, 08, 09, 10, 14) · 📦 independent (15) · ⏭ skip (11, `PLUS_ENABLED` makes it
unmountable). **WALK-05's status was the trap** — it read ✅ while its risky `applyCompletion` half was
never walked, so "first ⬜" skipped it; now ⬜ **partial**. WALK-12 deliberately sits **last inside 🚦**,
because R8 must be walked on the final build candidate or an earlier fix invalidates the pass. Each 🚦/⏭
body now states its gate inline, so a chat reading one section knows. Also fixed WALK-01's broken
`docs/build-log.md` link (wrong relative path from inside `docs/`). NEXT: **no open IMP spec — the build
queue is empty**; a build chat should stop and say so rather than invent one. A walk chat takes **WALK-02**
(first ⬜, 🚦, emulator, 👤), or **WALK-15** if the owner wants the Play listing refreshed in parallel
(🤖 mostly — needs maestro installed and a second AVD for its step 4)._

_2026-08-14 (WALK-01, v2→v3 mood migration) — **full pass, all 9 steps, agent-run on the emulator.** Backlog
was empty (IMP-058 was the last spec, already code-complete), so this chat took the first ⬜ row in
`docs/walk-open.md` instead — steps 1–2 had already passed 2026-08-09, steps 3–9 (the actual point: mood-chip
correctness on migrated data) were outstanding. Regenerated the v2 fixture, reset the app (non-negotiable —
clears the 2026-08-09 attempt's poisoned settings), completed fresh onboarding, restored the fixture. Every
check passed: archive/Home matched spec exactly (12-day streak, "Migration Test", 375 embers, 2 candles,
Lv 4 · Reflective); the two-mood entry rendered both chips and both no-mood entries rendered none, no blank
chip anywhere; Insights "across 10 reflections" denominator correct; mood-chip filtering matched the two-mood
entry on **either** mood; text search worked; writing today's entry confirmed multi-select and ticked "Name
how it felt"; force-stop + relaunch re-read cleanly with no crash or re-migration; harness Inspector showed
schema version 3, `dayKey drift: 0`, and every fixture-omitted field as an empty collection, not `undefined`.
**No app defects found — WALK-01 is closed.** Full step-by-step detail moved to `docs/build-log.md` → "Walk
log"; `docs/walk-open.md`'s index row updated to ✅ and its body section removed (only the index row
remains, per that file's own size discipline). Moved the IMP-058 session note into `docs/build-log.md` too
(this file's 2-note budget). NEXT: **still no open IMP spec** — the next build chat waits on Opus to scope a
new `IMP-xxx`. The next *walk* chat should take **WALK-02** (restore quarantine) — first ⬜ row in
`docs/walk-open.md` now — but note its runner is 👤 owner (clock changes + judgement on sheet copy), not
agent-drivable like WALK-01 was._

_2026-08-13 (IMP-060, a candle burns without telling you) — **code-complete, committed `83cd59d`, not
shipped.** New pure `src/home/freezeNotice.js` (`addFreezeNotice`, `freezeNoticeCopy`) — `addFreezeNotice`
appends+dedupes covered days into `settings.pendingFreezeNotice`, same-reference passthrough when nothing
new; `freezeNoticeCopy` builds `{ title, body }` from the pending days + freezes left, dates via
`dayKeyToUtcMs` (never `new Date(string)`). `applyAutoFreeze` (IMP-039) now also returns `covered` (the
days it spent on, not just the count) — `spent` unchanged, `__tests__/home/streakFreeze.test.js` extended to
pin it on every case. `RitualsApp.js`'s mount-only auto-freeze effect now folds `covered` into
`pendingFreezeNotice` via `addFreezeNotice` whenever a spend occurs. New `src/screens/FreezeNoticeCard.js`
(`TipCard`'s shape, unlit `Candle` icon) renders on Home directly above `OnThisDayCard` whenever
`pendingFreezeNotice` is non-empty — freeze notice outranks the memory card when both would show, per spec.
Dismiss clears `pendingFreezeNotice` to `[]`. 14 new tests (9 pure + 5 component). `npm test` → **737
passed, 74 suites**; `npx expo export --platform android` clean. Archived IMP-060's spec to
`docs/build-log.md`, removed its `specs-open.md` index row and updated the "done" list there. NEXT: the
backlog is down to **IMP-058** and **IMP-059** — no ordering constraint, take either
(`docs/specs-open.md`)._

_2026-08-13 (IMP-054, the reminder you can actually answer) — **code-complete, committed `18d8c2e`, not
shipped.** New pure `src/reminders/route.js` (`isOurReminder`, `reminderAction`) decides what a reminder
notification means; `io.js` gained `setForegroundBehavior`/`onNotificationReceived`/`onNotificationTapped`
(same lazy `load()` no-op guard as the rest of the file) and `RitualsApp.js` wires two new effects beside
the existing reminder ones. Two gaps closed: a reminder firing while the app is open now shows an in-app
Toast instead of nothing (Android drops the OS banner entirely once `shouldPlaySound: false`, which is
unavoidable — that's *why* the Toast exists, not a bug); tapping a reminder from outside the app now opens
WriteFlow, covering both the live-listener and cold-start (`getLastNotificationResponseAsync`) cases.
**Composed correctly with the out-of-band duplicate-fire fix** (`b773352`) — `scheduleAt(date, { title,
body, data }, identifier)`, all three args, confirmed against the real signature before editing. 9 new
tests. `npm test` → **698 passed, 70 suites**; `npx expo export` clean. Also archived IMP-054's spec to
`docs/build-log.md`, corrected a stale IMP-031→IMP-054 tap-routing misattribution there, and folded the
now-resolved duplicate-reminder Open-items note into build-log's "Resolved findings". Runtime proof is
**WALK-13**, not run this chat. NEXT: **IMP-055** (`docs/specs-open.md#imp-055--manage-your-feelings`)._

_2026-08-13 (IMP-055, manage your feelings) — **code-complete, committed `6cc63ad`, not shipped.** New pure
`src/entries/renameMood.js` (`renameMood`, `deleteMood`, `moodNameError`) follows `mutate.js`'s bag idiom:
`renameMood` rewrites a mood name across `entries` + `trash` moods arrays, `settings.customMoods` (position
kept) and re-keys `customMoodEmoji`, giving back untouched entries and empty-match slices by exact
reference. `deleteMood` strips the picker entry only — entries/trash/`customMoodEmoji` pass through
unchanged, so a day that used a deleted mood keeps both its label and its face. New
`src/screens/MoodManager.js` (Modal sheet, `TrashSheet.js`'s idiom) lists custom moods with Edit/Remove;
Edit reuses `MOOD_PALETTE`/`moodEmoji` from `src/data.js` **unmodified** — IMP-050 already left them shared,
so no extraction was needed despite the spec's conditional. `YouScreen.js` gained a "Your feelings" row
beside "Recently deleted" in the "Your journal is safe" card. `RitualsApp.js`'s `onRenameMood` calls the
pure function then folds the (possibly new) emoji into the result under the new name — the pure function
only knows the *old* emoji, since it re-keys rather than replaces; `onDeleteMood` is a direct pass-through.
Both setters always fire all three of `entries`/`trash`/`settings`. 25 new tests (20 pure + 5 component).
`npm test` → **723 passed, 72 suites**; `npx expo export --platform android` clean. NEXT: **IMP-060**
(`docs/specs-open.md#imp-060--a-candle-burns-without-telling-you`)._

_2026-08-13 (IMP-053 + workflow restructure, Opus session) — **IMP-053 code-complete, committed `f7dbca3`,
not shipped.** New pure `src/insights/snippet.js` (`foldChar`/`foldChars`/`indexOfSeq`/`entrySnippet`) +
exported `ResultLine` in `ArchiveScreen.js`: search results now quote the matched words with the hit
highlighted, and label the line `wished ·` when the match came from that field. **The whole design exists
because `foldDiacritics` is not length-preserving and emoji are surrogate pairs** — folding per code point
keeps folded index n ↔ original code point n; a naive `indexOf` would mis-highlight only for users writing
accents or emoji. 28 + 6 new tests. `npm test` → **689 passed, 69 suites**; `npx expo export` clean.
Also this session: `b773352` fixed duplicate reminders (see Open items); `d6f5d75` recorded API-36
compliance closing account-wide; `ef41206` split the walk queue out of the build queue — IMP-054 and
IMP-059 no longer end in a walk, those became WALK-13/WALK-14, and every walk row now states its target
(emulator/device) and runner (owner/agent). PROGRESS.md trimmed 476 → ~230 lines by moving monetization
strategy + Phase 10b to the playbook and resolved findings to the build-log. NEXT: **IMP-054** — read the
⚠️ in its step 2 first._

_2026-08-13 (IMP-052, tap a day, read it) — **code-complete, committed, not shipped.** Both heatmaps
(`ArchiveScreen`'s `Heat`, `InsightsScreen`'s `LifetimeHeat`) rendered every cell as an inert `View`. New
pure `src/entries/find.js` → `entryForDayKey`, resolving dayKey collisions the same way `calendar.js` does
(first match wins, entries newest-first) — if the two disagreed the grid would paint one entry's mood and
open a different one. Written/`done` cells are now `Pressable` with `accessibilityRole="button"` and a
day+moods label; everything else stays a bare `View`. The press is guarded — a cell can outlive its entry
by one render after a delete, so a miss calls nothing rather than throwing. Grid deliberately not filtered
by the search query. `npm test` → 651 passed, 67 suites; export clean._

_2026-08-10 (IMP-056, a day is the day you lived, not the day in Greenwich) — **code-complete, committed,
not shipped.** `dayKey` was derived in UTC while every date the user reads is local, and both were stamped
on the same entry — a 1am write in a positive-offset zone silently overwrote the previous evening's entry;
a negative-offset evening write never appeared on the grid until the following day. Step 0: reproduced on
the emulator (`Asia/Kolkata`, clock forced to 01:00 via `adb shell service call alarm 2/3` — no root
available on this AVD image) — Home already read "Today is at rest" for Monday against Sunday's stored
entry, and WriteFlow opened prefilled with Sunday's words. RED-first: new pure `src/time/dayKey.js`
(`dayKeyOf`) + `__tests__/time/dayKey.test.js` (6 cases, including a `process.env.TZ`-pinned
same-instant-different-key proof so it's deterministic in CI regardless of host zone). Replaced exactly the
four derivation sites named in the spec (`RitualsApp.js`, `calendar.js`, `HomeScreen.js`, `lifetime.js`),
leaving `dayKeyToUtcMs`/`utcMsToDayKey`/`shiftKey`/`entryDateParts` untouched (they're the *other*,
already-correct half, or operate on an existing key rather than deriving one from "now"). Fixed
`calendar.test.js`/`lifetime.test.js` to construct fixture dates via local components instead of
UTC-instant strings — they passed before only because the host machine's offset happened not to cross a
day boundary, not because they were actually timezone-safe. Added a regression test in `todaysEntry.test.js`
that asserts the old UTC key wrongly matches yesterday's entry and the new local key correctly doesn't, in
one test. Step 5: new `dayKeyDrift()` reporter in the dev-panel Inspector's "Data health" group — report-only,
counts `entries`/`trash` rows whose `id`-embedded creation epoch disagrees with `dayKeyOf()`, and whether
remapping would move `currentStreak`. **Read against the emulator's fixture data: 0 drift** — that data's
ids don't carry the `new<epoch-ms>` shape the reporter keys on, so this is not evidence the bug never fired;
real tester/production data has never been read through it. Walked both offset directions end-to-end:
`Asia/Kolkata` 01:00 (WriteFlow now opens blank instead of prefilling, Sunday's entry stays untouched) and
`America/New_York` 20:30 (wrote a real entry through to save — streak went 12→13 contiguously, proving it
landed on today's local date, not tomorrow's). `npm test` → **588 passed, 59 suites** (577 + 11 new);
`npx expo export --platform android` clean. Full spec archived to `docs/build-log.md`; backlog row set to
code-complete; `docs/specs-open.md`'s index updated (IMP-056 removed, 9 tasks left, IMP-050 now next).
**Deliberately not done — the historical migration.** Existing entries keep their old key; only new writes
are correct going forward. Two things recorded in Open items, both outlive this spec: the residual (old
UTC-keyed entries can still misfire for about a day post-ship) and the IMP-057 decision, which needs a real
device's drift numbers before it can be scoped — not producible from this emulator's synthetic fixture.
**Operational notes for future emulator sessions:** `adb shell` hangs indefinitely if the AVD's adb daemon
goes stale — restart the emulator process, `adb kill-server` alone doesn't fix it; and a running RN process
does not pick up a live OS timezone change — force-stop + relaunch, not just a new launch `Intent`. NEXT:
**IMP-050** (every mood gets a face) is the live task — open only its spec in `docs/specs-open.md`._

_2026-08-10 (IMP-050, every mood gets a face) — **code-complete, committed, not shipped.**
`moodEmoji = (m) => MOOD_EMOJI[m] || ''` in `data.js` drew a blank cell for every custom mood (IMP-037) and
for a `moods: []` entry — two distinct causes, neither a migration (IMP-037 has never reached a device, so
zero users have ever created a custom mood). Two named fallbacks now cover both: `NO_MOOD_EMOJI = '🌫️'` for
`moods: []`, `CUSTOM_MOOD_FALLBACK = '✨'` for a named-but-unpictured custom mood; `moodEmoji(m, custom = {})`
never returns `''` for any input. RED-first throughout: `__tests__/data/moodEmoji.test.js` (7 cases) against
`src/data.js`'s new `NO_MOOD_EMOJI`/`CUSTOM_MOOD_FALLBACK`/`MOOD_PALETTE` (40 glyphs, Android-7-safe) and the
two-argument `moodEmoji`; new pure `src/entries/emojiInput.js` (`isEmojiish`, code-point based — no `\p{...}`
regex, Hermes's support isn't trustworthy) + 13-case test for the typed-emoji escape hatch. `WriteFlow.js`'s
mood step gained a horizontal palette picker (default `MOOD_PALETTE[0]`, so **Add** is never blocked) plus
the typed field, both above the existing "Name your own…" row; `addCustomMood(name, emoji)` now resets both.
`__tests__/screens/WriteFlowMood.test.js` (7 cases, `@testing-library/react-native`) covers the picker and
doubles as the spec's required mandatory-mood-gate regression test. `settings.customMoodEmoji: {}` added to
`DEFAULT_SETTINGS`; `sanitizeSettings.js` gained a per-key exception matching `accent`/`reminder`'s pattern —
keeps the map, drops only the individual bad glyphs, so one typo never costs the other custom moods (5 new
cases). **The multi-mood shimmer** (owner decision, 2026-08-09): new pure `src/entries/moodFace.js`
(`hashKey`/`moodFace`, 8 cases) and `src/ui/useMoodTick.js` (a shared ~2500ms tick, live only while
`AppState` is `'active'` and reduce-motion is off, returning `seed` — not `0` — whenever it isn't ticking; 4
cases with `jest.useFakeTimers()`). `calendar.js`'s `buildHeatmap`/`buildLifetimeHeatmap` now carry
`moods: entry.moods || []` per cell instead of resolving a single `mood`/`emoji` — a pure date-grid helper
has no business resolving glyphs; `ArchiveScreen.js`'s `Heat` computes its own `enabled`
(`cells.some(c => (c.moods||[]).length > 1)`, so a still grid starts no timer) and `seed`
(`hashKey` of today's cell), rendering `moodEmoji(moodFace(cell.moods, tick, cell.dayKey), customMoodEmoji)`.
`__tests__/home/calendar.test.js` updated for the field-shape change — the test previously named "uses only
the first mood when an entry carries several" was renamed to "carries every mood on the cell, in order",
since dropping all but the first mood was itself the bug. `customMoodEmoji` threaded through all 5 mount
points named in the spec (`InsightsScreen`→`DeeperInsights` ×2, `ArchiveScreen`, `ReadingSheet`,
`AnnualRecap`, `WriteFlow`) plus `ArchiveFilters.js`, which now maps over `[...MOODS, ...customMoods]`
instead of the 8 built-ins alone — a user-invented feeling can finally be searched for. `npm test` →
**632 passed, 64 suites** (588 + 44 new); `npx expo export --platform android` clean. Full spec archived to
`docs/build-log.md`; backlog row set to code-complete; `docs/specs-open.md`'s index updated (IMP-050
removed, 8 tasks left, IMP-051 now next; the two constraints gating IMP-052/055 on IMP-050 are cleared).
**Deliberately not done, per spec:** no data migration, no back-fill onto a `moods: []` entry, the heatmap
cell itself still isn't pressable (that's IMP-052, next-but-one), no rename/delete flow for custom moods
(that's IMP-055). NEXT: **IMP-051** (the keyboard stops eating the Next button) is the live task — open only
its spec in `docs/specs-open.md`._

_2026-08-09 (IMP-049, settings survive a corrupt restore) — **code-complete, committed, not shipped.** Closed the fragility WALK-01's first attempt surfaced: `readBackup` validated only the backup envelope, never the *shape* of `settings` inside it, and `mergeWithDefaults`'s shallow spread let a wrong-typed key (proven: `settings.accent` as a string) replace its default outright — `makeTheme` then indexed the string by character, `processColor` returned `null`, and every `LinearGradient` threw a native NPE, recoverable only via Reset all data. RED-first: `__tests__/persistence/sanitizeSettings.test.js` (18 cases, all of the spec's required cases plus one it didn't anticipate) against new pure `src/persistence/sanitizeSettings.js` — shape comparison (`Array.isArray`→`'array'`, `null`→`'null'`, else `typeof`) replaces a key whose shape differs from its default; `accent` gets its own 3-hex-string check (a partial repair would produce a mismatched palette, so a bad value is replaced wholesale); `reminder` recurses one level. **Found and fixed one case the spec missed while writing the tests:** `recapSeen`'s default is `null` but a real dismissal (IMP-046) stores a *year* (a number) — pure shape-vs-default comparison would have silently reset every dismissal back to `null` on the next hydration, a real regression. Gave it the same kind of per-key exception the spec already grants `accent`/`reminder` (kept if `null` or a number). Wired at **both** hydration points in `App.js` (line 87 cold-start, line 122 restore/replace) — both required, since fixing only the restore path leaves an already-poisoned install unrecoverable. Regression test proves the actual failure closes: feeds the poisoned `{accent: '#C9884A'}` through `mergeWithDefaults`→`makeTheme` for both `'day'`/`'night'` and asserts every colour token is valid — first proving the assertion **fails** without `sanitizeSettings` in the chain (unsanitized run produced problems), then that it passes with it. `npm test` → **577 passed, 58 suites** (559 + 18 new); `npx expo export --platform android` clean. `docs/specs-open.md` reset to empty (IMP-049 was the only open spec). **NEXT:** no IMP task is queued. Resume **WALK-01 step 3** in `docs/walk-open.md` — Reset all data first, since the emulator may still hold settings poisoned by WALK-01's aborted first attempt; this fix prevents *future* poisoning, it does not retroactively repair state already written to AsyncStorage. Alternatively pick up the subscription-track build window (IMP-022 Part A, the PDF perk) or the `internal`→production promotion decision._

_2026-08-09 (emulator walk of the post-vc11 batch + IMP-048) — **first hands-on walk of everything built since vc11.** Produced the emulator test plan for IMP-033–047 and surfaced the three structural blockers that hide half of it: (1) `PLUS_ENABLED = false` makes IMP-038/046/047, the "What's in Plus" sheet and trash-restore literally unmountable, so walking them needs a **temporary, uncommitted** flip of [`src/billing/config.js:39`](src/billing/config.js#L39); (2) the Annual Recap **Home** card is 1 Dec – 31 Jan only (the You-tab "Your years" section is the year-round route); (3) the dev harness's Entries stepper is `step: 1`, so a year of history for "On this day"/the recap needs a throwaway `scenarios.js` row at `entryCount: 460`, not tapping. Two emulator techniques worth keeping: **IMP-033's quarantine is triggerable without any Google backup** — set the emulator clock back ~5 days, let one autosave stamp a past `lastSavedAt`, relaunch, and `installedAt > lastSavedAt` fires the real quarantine path; and **IMP-044's R8 is walkable locally** — `android/app/build.gradle` signs `release` with the debug keystore, so `npx expo run:android --variant release` builds the first-ever minified build with no keystore setup (`android/` is now re-prebuilt at vc11 and carries both R8 flags + the `expo-notifications` keep rule). **IMP-048 came out of the walk and is code-complete + walked** (see backlog row / build-log): trash restore was Plus-only with no disclosure and its blocked-toast rendered behind the modal; it is now free 3×, stated on the page before it is spent, locked honestly afterwards even while Plus is unbuyable (owner decision — full rationale in the spec). `npm test` → **559 passed, 57 suites** (545 + 14 new); `npx expo export --platform android` clean. **The walk queue now has a home: [`docs/walk-open.md`](docs/walk-open.md)** — WALK-01…12, each with preconditions, steps, expected results and where to record the outcome, plus six reusable techniques (T1–T6: the PLUS_ENABLED flip, the harness, deep history, the clock trick, bmgr local transport, the release variant). It is to testing what `specs-open.md` is to building, and it is why this chat's context need not be carried forward. **WALK-01 (the v2→v3 mood migration) is IN PROGRESS and is the resume point** — the restore fires and every derived value renders correctly; steps 3–9 (the mood chips themselves, the relaunch-persists-as-v3 proof) are undone. Its fixture generator was promoted out of the session scratchpad to [`scripts/gen-v2-fixture.js`](scripts/gen-v2-fixture.js) (output git-ignored — regenerate it, its dayKeys are relative to the run date). **WALK-01's first attempt aborted on a tester error, not an app defect:** the fixture wrote `settings.accent` as a string where the app expects the `[accent, deep, soft]` array; `mergeWithDefaults` is a shallow spread so it replaced the default outright, `makeTheme` indexed the string by character (`accent: '#'`, `accentDeep: 'C'`, `accentSoft: '9'`), `processColor` returned null, and every `LinearGradient` threw `null cannot be cast to non-null type kotlin.Double`. The fixture is fixed and now type-checked against `DEFAULT_SETTINGS`; **the app fragility it exposed is scoped as IMP-049**, now the one open spec. **⚠️ The emulator may still hold those poisoned settings — they persist to AsyncStorage and survive relaunches, so Reset all data before resuming WALK-01.** NEXT: either build **IMP-049** (spec complete, no design questions left) or resume **WALK-01 step 3**._

_2026-08-09 (IMP-045, finish Lifetime Progress — the IMP-021 shortfall) — **code-complete, committed, not shipped.** Closed the last open item in the backlog. RED-first: `__tests__/insights/heatCells.test.js` (13 new cases) against new pure `src/insights/heatCells.js` — `cellState(cell)` → `'done'|'missed'|'empty'|'future'` (precedence `future` > `missed` > `empty` > `done`; a `done+today` cell still reads `done`); `monthLabelsForRows(rows)` → one short month name per row on the row where the month changes, `''` otherwise, row 0 always attempted, malformed/missing `dayKey` rows return `''` rather than throwing. `InsightsScreen.js`'s `LifetimeHeat` now consumes `cellState` for four-way cell styling instead of the old binary `has` check — `done` filled `c.accent` (2px `c.accentDeep` border if `today`), `missed` = `c.accentSoft` fill + 1px `c.border` border ("visibly a day, visibly empty" — matches IMP-014's meaning without the unreadable-at-this-size skull glyph), `empty` = transparent + dashed 1px `c.border`, `future` = fully transparent — plus a month-label gutter down the left and a three-item legend ("kept · missed · not yet started") beneath, both sharing the same `heatCellStyle` swatch function so they can't drift from the grid. `buildLifetimeHeatmap` (`src/home/calendar.js`) untouched, per spec — its cell shape already carried everything needed. The level context line gained the previously-computed-but-never-rendered `xpEarned`: `` `Lv {level} · {levelName}{activeSpan} · {fmt(xpEarned)} XP` ``, reusing the screen's existing `fmt` formatter and leaving `numberOfLines`/font-scale behaviour (IMP-030) untouched. `npm test` → **559 passed, 57 suites** (532 + 13 new); `npx expo export --platform android` clean. Full spec archived to `docs/build-log.md`; IMP-021's backlog row flipped to ✅ (shortfall closed); IMP-045's row set to code-complete; `docs/specs-open.md` reset to empty (IMP-045 was the last open spec — no `IMP-xxx` task remains queued); removed the stale IMP-021 "not properly completed" block and its "Next step" pointer from Open items, folded into the closed device-walk-debts line instead. NEXT: **the backlog is fully code-complete for the first time this project.** No IMP task is queued. Two things remain outstanding, neither blocking: (1) **re-walk IMP-021/045 and IMP-046 on a real device** — both are OTA, un-walked since this fix and since the recap shipped; (2) pick up the **subscription-track build window** (playbook 10b step B9: revive IMP-022 Part A, the PDF perk #6, the last unreal `PLUS_PERKS` line) or make the **`internal` → production promotion** decision — both are the owner's call on sequencing, not a technical blocker._

_2026-08-08 (IMP-046, Annual Recap — "your year, remembered", perk #4) — **code-complete, committed, not shipped.** Full TDD (13 new cases). First extracted `countWords` out of `src/insights/lifetime.js` into new `src/insights/words.js` (re-imported there; `lifetime.test.js` stayed green untouched) so the recap and Lifetime Progress can't drift apart. New pure `src/recap/annualRecap.js` — `recapYears(entries, now)` → offerable years newest-first (a year qualifies from 1 December onward — `now.getMonth() === 11` — and every earlier year forever after; both filtered to ≥10 entries), `buildRecap(entries, year, {xp, now})` → `{year, daysRemembered, totalWords, longestStreak, firstEntry, lastEntry, topMoods, peakMonth, quietestMonth, milestones}` or `null` below the 10-entry floor. Every year-scoped stat filters entries strictly to `dayKey.slice(0,4) === year` first, so a 31 Dec/1 Jan boundary entry never leaks into the wrong year, and `longestStreak` (via `dateKeys.js`'s `longestConsecutiveRun`) is computed within-year only — a 6-day run spanning the boundary reads as 3, not 6. `topMoods` reuses IMP-047's `moodByMonth` (merges its 12 buckets rather than writing a second mood counter), tie-broken alphabetically; `peakMonth`/`quietestMonth` scan the same buckets' totals, keeping the earlier month on a tie. **Milestones — where IMP-021's deferred timeline finally lands:** a day-by-day walk over the *full* account history (not just the target year, since a streak can start in December and cross a threshold in January) finds every `STREAK_MILESTONES` crossing (7/30/100) whose day falls inside the target year, plus a `'First entry of the year'` entry, sorted chronologically; a crossing that happened in the prior year is correctly excluded even when the same run continues into the target year. New presentational `src/screens/AnnualRecap.js` (`{recap, onClose, insets}`, sectioned like `InsightsScreen`'s "Your record" card — hero + 2×2 totals grid, top-moods bars, a "The year, marked" milestone timeline) and `src/screens/AnnualRecapCard.js` (mirrors `OnThisDayCard.js`'s shape exactly, same locked-teaser pattern). `HomeScreen.js` mounts the card only in the **1 Dec – 31 Jan** window when `recapYears()[0]` exists and isn't already dismissed (`settings.recapSeen`, a single number like IMP-038's `onThisDayDismissed`); `YouScreen.js` gained a **permanent** "Your years" section (unlike the Home card, not window-gated — "what stops the feature disappearing for eleven months of the year") listing every offerable year, locked-teaser when `plusEnabled && !plus`. `RitualsApp.js` threads both via a new `openRecapYear` state and a `Modal` matching every other full-screen sheet's shape, lazily computing `buildRecap` only while open. `PLUS_PERKS` (`data.js`) gained a new 6th entry — 'Your year, remembered — the Annual Recap' — **appended, not renumbering** the existing five (the dead PDF perk stays put, still IMP-022's territory). `DEFAULT_SETTINGS` gained `recapSeen: null`. `npm test` → **532 passed, 55 suites** (519 + 13 new); `npx expo export --platform android` clean. Full spec archived to `docs/build-log.md`; backlog row set to code-complete; `docs/specs-open.md`'s index updated (IMP-046 removed, only the no-slot IMP-045 remains); Phase 10b's proposed perk table updated to perk #4 ✅ built. NEXT: **the numbered queue is now empty** — only **IMP-045** (no queue slot, Lifetime Progress shortfall) remains open. After it, the next real work is the subscription-track build window (playbook 10b step B9: revive IMP-022 Part A, the PDF perk #6) or the still-untaken `internal` → production promotion decision._

_2026-08-08 (IMP-038, "On this day") — **code-complete, committed, not shipped.** Full TDD (11 new cases, RED-first). New pure `src/memory/onThisDay.js` → `onThisDay(entries, todayKey)` — year matches (same month-day, any past year, newest-first) strictly take priority over 6/3/1-month fallbacks, which only compute when zero year matches exist; every comparison is on the `YYYY-MM-DD` string components via a `parts()`/`daysInMonth()` helper, never `Date` millisecond math, so 29 Feb never false-matches 28 Feb in either direction and a 31-day month falling back into a shorter one skips the offset rather than rolling into the next month. New presentational `src/screens/OnThisDayCard.js` — `{ matches, locked, onOpen, onDismiss, onOpenPaywall }`, returns `null` on empty `matches`, reuses `ArchiveScreen.js`'s day/mon-numeral row shape; `locked` renders a `DeeperInsights.js`-style teaser ("The app found something…" + Sun-icon "Unlock with Plus" pill) with the same dismiss control in the shared header for both branches. Mounted in `HomeScreen.js` above "Today's reflection"; `HomeScreen` computes `onThisDay()` itself off its own `entries` prop and a locally-computed `todayK` (same UTC-day convention `home/calendar.js` already defaults to), gated on 4 new props (`plusEnabled`, `onThisDayDismissed`, `onDismissOnThisDay`, `onOpenOnThisDay`) plus `onOpenPaywall`; `locked = !plus`. `RitualsApp.js` threads all five — `onOpenOnThisDay` reuses `ArchiveScreen`'s exact `onOpen` handler (`setReading` + `markRevisited`) rather than duplicating the revisit-rite credit, `onDismissOnThisDay` writes `settings.onThisDayDismissed = todayKey()` (single string, self-pruning, no migration needed). `PLUS_PERKS[2]`'s cut line *"Your whole graveyard, kept forever"* → *"On this day — your own words, brought back to you"*; array stays 5 long. `npm test` → **519 passed, 54 suites** (508 + 11 new); `npx expo export --platform android` clean. Full spec archived to `docs/build-log.md`; backlog row set to code-complete; `docs/specs-open.md`'s index updated (IMP-038 removed, 1 task left); both Phase 10b perk-reality tables updated to 4 of 5 real (#1, #2, #3, #5). NEXT: **IMP-046 Annual Recap** (perk #4) is the last item in the open queue, per the ACTIVE TRACK order. IMP-045/-046 remain open; `internal` → production promotion still untaken._

_2026-08-08 (IMP-033, the restore is offered, not imposed) — **code-complete, committed, not shipped.** Full TDD (26 new cases). New pure `src/persistence/restoreQuarantine.js` — `shouldQuarantine` (delegates to IMP-029's `isRestoredInstall`), `shouldOfferRestore({hasStash, onboarded})`, `preferredSource({lastSavedAt, lastBackupAt})` → `'google'|'file'` (ties/unparseable → `'google'`, no coercion), `runQuarantine({readRawState, writePendingRestore, readPendingRestore, clearState})` (injected-IO orchestration mirroring `backup/importFlow.js` — the live key is never cleared unless the stash write is verified readable back), `pendingRestoreInventory(stash)` (paid-inventory line shared by the offer sheet and the discard confirm). Stash IO added to `src/persistence/storage.js` (`readRawState`/`writePendingRestore`/`readPendingRestore`/`clearPendingRestore`, try/catch → falsy, no throwing) — its first-ever unit test, so `jest.setup.js` gained the package's own in-memory `AsyncStorage` mock. `App.js`'s load effect now runs `shouldQuarantine` on the same `lastSavedAt` check IMP-029 already made; on success it hydrates as a genuine first install (`{}`/`onboarded: false`) and stashes the parsed payload in a new `pendingRestore` state; on an aborted quarantine it falls straight through to IMP-029's existing notice, live data untouched. New `src/screens/RestoreOffer.js` (presentational, same scrim-and-card shape as `RestoreNotice.js` — its `GhostButton` is now extracted to `src/ui.js` and shared) states every warning (replaces the fresh start, dated staleness, paid-inventory-at-risk) and inverts emphasis to lead with "Restore from a file" when `preferredSource` says the export is newer. `RitualsApp.js`'s `handleLoadPendingRestore` reuses the existing `runConfirmedImport` safety guarantee (recovery copy of the *current* fresh state before replacing); "Keep this fresh start" only hides the sheet (`restoreOfferDismissed`), never discards the stash — it resurfaces as a `Google backup — {date}` row in the You tab's "Your journal is safe" card, with a separate (not hidden-behind-long-press) "Discard" action. Bundled copy fix: `explainAutoBackup` and the export success toast now both say plainly that the JSON export and the Google Auto Backup are separate systems, neither refreshing the other. `npm test` → **508 passed, 53 suites** (482 + 26 new); `npx expo export --platform android` clean. Full spec archived to `docs/build-log.md`; backlog row set to code-complete; `docs/specs-open.md`'s index updated (IMP-033 removed, 3 tasks renumbered to 2). NEXT: **IMP-038 "On this day"** (perk #3) is next per the ACTIVE TRACK order. IMP-038/-045/-046 remain open; `internal` → production promotion still untaken._

_2026-08-08 (IMP-047, deeper insights — the analysis layer, perk #5) — **code-complete, committed, not shipped.** Full TDD (17 new cases). New pure `src/insights/deeper.js` — `moodByWeekday(entries)` → 7 Mon-first buckets `{l, top, n, total}` (top mood per weekday, `null` on a tie or empty bucket — reuses `derive.js`'s private `localDate`/Mon-first-index pattern rather than sharing it, matching how each insights module already owns its own date helpers), `moodByMonth(entries)` → 12 calendar-month buckets aggregated across years for the "seasonal" read, `moods` sorted by count descending, `moodPairings(entries)` → co-occurring mood pairs `{a,b,n}` (alphabetically normalised so `[a,b]`/`[b,a]` count once, `[]` for all-single-mood entries — the function that justifies IMP-037's multi-mood model), `hasEnoughFor(kind, entries)` gates each at 14 entries / 3 distinct months / 5 multi-mood entries so nothing renders a chart from three data points. New presentational `src/screens/DeeperInsights.js` reuses `InsightsScreen.js`'s existing bar/mood-row shapes; `locked` prop renders a one-card teaser with a `Sun`-icon "Unlock with Plus" pill instead of computing anything. `InsightsScreen` gained `plus`/`plusEnabled`/`onOpenPaywall` props threaded from `RitualsApp.js` (`onOpenPaywall` follows the existing `PLUS_ENABLED ? () => setPaywall(true) : () => {}` pattern); mounts full section when `plus`, locked teaser when `plusEnabled && !plus`, nothing when `!plusEnabled` — same discipline as IMP-034/IMP-041. `PLUS_PERKS[4]` copy checked against the build and left unchanged — it already matched. `npm test` → **482 passed, 51 suites** (465 + 17 new); `npx expo export --platform android` clean. Full spec archived to `docs/build-log.md`; backlog row set to code-complete; `docs/specs-open.md`'s index and IMP-046's "Depends on" updated to reflect it's done; PROGRESS.md's Phase 10b perk-reality table updated to 3 of 5 real (#1, #2, #5). NEXT: per the ACTIVE TRACK order, **IMP-033** (the restore is offered, not imposed) is next — a bigger build than the retrieval-track tasks, already settled by the owner. IMP-033/-038/-045/-046 remain open; `internal` → production promotion still untaken._

_2026-08-08 (IMP-037, moods: custom + multiple per entry) — **code-complete, committed, not shipped.** Full TDD, migration tests written RED-first. `SCHEMA_VERSION` 2 → 3 in `src/persistence/state.js` with a real migrator `2:` (`mergeWithDefaults` is a shallow top-level spread and never reaches inside `entries`, so a versioned migrator was the only safe path): `{ mood: 'Tender' }` → `{ moods: ['Tender'] }`, no-mood → `moods: []`, idempotent on entries that already carry `moods`. Every reader from the spec's exhaustive list updated in one pass: `derive.js` (mood mix counts each mood in an entry's array separately, new `moodEntryCount` — entries with ≥1 mood — is the honest denominator since percentages no longer sum to 100), `search.js` (mood filter is any-of over `e.moods`), `calendar.js` (heatmap/week-strip cells use `moods[0]`), `completeEntry.js` (`feel` rite checks `moods.length > 0`), `mutate.js` (`applyEdit`'s patch takes `moods`). `WriteFlow.js`'s mood step is now multi-select (tap to toggle) plus a "Name your own…" field wired to a new `onAddCustomMood` prop; `RitualsApp.js` adds `addCustomMood()` which dedups into `settings.customMoods`, and `DEFAULT_SETTINGS` gains `customMoods: []` (no migration needed — settings aren't schema-versioned, `mergeWithDefaults` fills it in). `ArchiveScreen.js`/`ReadingSheet.js` now render one chip per mood instead of one chip total; `InsightsScreen.js` adds the honest `across {n} reflections` line. **A reader the spec's list missed, caught by the first full suite run, not by planning:** `__tests__/profile/achievements.test.js`'s own fixtures used singular `mood:` for the `moodsLogged` stat — `achievements.js` itself needed no change (it already reads `derive.js`'s `moodMix`), only its test fixtures did. Final `grep -rn "\.mood\b|mood:" src/` → zero singular-`mood` readers left, only the migrator's own comment. `npm test` → **465 passed, 50 suites** (453 + 12 new); `npx expo export --platform android` clean. Full spec archived to `docs/build-log.md`; backlog row set to code-complete; `docs/specs-open.md`'s index and every "Depends on: IMP-037" mention across IMP-038/046/047 updated to reflect it's done. NEXT: **IMP-047** (deeper insights — the analysis layer, perk #5) is next per the ACTIVE TRACK order — it was blocked on this task and now isn't. IMP-033/-038/-045/-046/-047 remain open; `internal` → production promotion still untaken._

_2026-08-08 (IMP-036, custody of your words — edit/delete/trash) — **code-complete, committed, not shipped.** Full TDD (22 new cases). New pure `src/entries/mutate.js` — `applyEdit(entries, dayKey, {did, wished, mood})` (in-place replace, same-reference no-op on an absent `dayKey` — structurally makes back-filling unreachable), `applyDelete({entries, trash}, dayKey, nowMs)` (moves the entry to trash stamped `deletedAt`; deliberately takes no `xp`/`embers` params at all, so it's structurally incapable of clawing them back), `applyRestore({entries, trash}, dayKey)` (re-inserts in `dayKey` order, matching the newest-first convention every other producer already uses), `pruneTrash(trash, nowMs, days=30)` (exact 30-day boundary kept), `streakAfterDelete(...)` (confirm-copy only, mirrors `currentStreak`). **Routed around the `applyCompletion` trap the spec called out:** editing a past day while today is unwritten would otherwise fall into `applyCompletion`'s reward branch and double-award XP/embers plus a duplicate row — `RitualsApp.js` now tracks `editingDayKey` alongside `writing`, and past-day `WriteFlow` completions call a new `editPastEntry` (→ `applyEdit`) instead of `complete` (→ `applyCompletion`); `closeWriting()` clears both together so they can't drift. `trash` threaded through `RitualsApp.js` exactly like `frozenDays`/`seenTips` (`useState`, autosave deps, `currentSlice()`, `PERSISTED_KEYS` — no schema bump), with a mount-only prune effect shaped like IMP-039's freeze catch-up. `ReadingSheet.js`'s edit gate loosened to any existing entry, plus a new destructive "Delete this day" row → `RitualsApp.js`'s `confirmDeleteEntry` computes the real post-delete streak and whether an achievement would be un-earned *before* showing the `Alert.alert`, appending "One of your keepsakes may go with it." only when true. New `src/screens/TrashSheet.js` — "Recently deleted" list with **Restore** (real when `plus`; opens the paywall when `plusEnabled && !plus`; shows a "coming soon" toast when `!plusEnabled`, since there's no Plus to sell yet) and **Delete forever** (free, confirmed) — opened from a new row in `YouScreen.js`'s "Your journal is safe" card. `npm test` → **453 passed, 50 suites** (431 + 22 new); `npx expo export --platform android` clean. Full spec archived to `docs/build-log.md`; backlog row set to code-complete; `docs/specs-open.md`'s index and IMP-037's "Depends on" updated to reflect it's done. NEXT: **IMP-037** (moods: custom + multiple per entry) continues the retrieval track, per the ACTIVE TRACK order. IMP-033/-037/-038/-045/-046/-047 remain open; `internal` → production promotion still untaken._

_2026-08-08 (IMP-041, teach the app) — **code-complete, committed, not shipped.** Full TDD. New pure `src/content/tips.js` — `TIPS` (3, one per `today`/`archive`/`you`), `EXPLAINERS` (6, one per mechanic), `pendingTip(screen, seenTips)` and `markTipSeen(seenTips, id)` (never mutates) — all copy verbatim from the spec, verified against code (XP 50, rites +10, embers 15, candles 120/300/450). `src/screens/TipCard.js` is presentational only (`Card` + `Info` icon + `Close` button). `seenTips` wired through `RitualsApp.js` exactly like `frozenDays` (IMP-039): `useState`, autosave dep array, `currentSlice()`, `PERSISTED_KEYS`. `screen()`'s three cases each compute `pendingTip(tab, seenTips)` and pass `tip`/`onDismissTip` down; `HomeScreen`, `ArchiveScreen`, `YouScreen` render `<TipCard>` as the first child of their `ScrollView` when one is pending. New "How it works" card in `YouScreen.js` (six `Row`s over `EXPLAINERS`, `Alert.alert` per tap — same pattern as `explainAutoBackup`), placed directly above "Your journal is safe". New `src/screens/PlusPerks.js` — a full-screen sheet over `PLUS_PERKS`, opened from a `YouScreen` row mounted **only when `plusEnabled`** (per the decided design — `PLUS_PERKS` still carries untrue lines while the app ships free, so the sheet must not exist outside a build where every line is honest). Teaching empty states: `ArchiveScreen.js` at zero entries now shows "Nothing here yet." copy instead of a bare list; `InsightsScreen.js`'s empty state gained a second line. Bundled truth fix: `gamify.js`'s rites card claimed embers are earned by finishing the rites (false — embers come from writing the day; rites award XP only) → replaced with `'All rites kept — a full day.'` / `` `${kept} of ${quests.length} kept today.` ``. **One tool snag, no content impact:** the Edit tool couldn't match the original curly-quote/`'`-escape mix in `gamify.js`'s ternary line no matter how it was copied; fell back to a Node one-liner to rewrite the line directly, which briefly emptied the ternary's second branch before a follow-up `Edit` restored it correctly — caught immediately by re-reading the file, not by a test. `npm test` → **417 passed, 48 suites** (406 + 11 new); `npx expo export --platform android` clean. Full spec archived to `docs/build-log.md`; backlog row set to code-complete. NEXT: **IMP-035** (search your journal) opens the retrieval track, per the ACTIVE TRACK order. IMP-033/-035/-036/-037/-038/-045/-046/-047 remain open; `internal` → production promotion still untaken._

_2026-08-08 (IMP-039, streak-freeze candles made real) — **code-complete, committed, not shipped.** Full TDD. Owner-decided option (a): candles now function as automatic streak insurance instead of doing nothing. `currentStreak(keys, todayKey, { frozenDays })` (`src/insights/dateKeys.js`) treats a frozen (candle-covered) day exactly like a real journaled day for both the anchor check and the backward run-count, without ever writing a fake `entries` row — no back-filling. New pure `src/home/streakFreeze.js` → `applyAutoFreeze(entries, frozenDays, freezes, todayKey)` spends one candle per missed day, chronologically, looking only at the gap after the most recent entry (older gaps are already broken and irrelevant); if a gap outruns the candles owned, only the affordable prefix gets frozen and the rest still breaks the streak — a candle can be burned without saving a long absence, same as real streak-freeze products. Wired into `RitualsApp.js` via a new mount-only effect (same shape as the existing daily-reset effect) so the freeze is spent — and the streak protected — the moment the app is next opened, not only when the user writes; `frozenDays` is now a persisted key, threaded through the derived `streak`, `applyCompletion`'s `celebrate.streak`, the autosave effect and `currentSlice()` (backups carry it). Fixed the two false Shop claims this task was audited for: "Light one on a missed day and your streak holds" and "Plus gives you 3 free each month" (a one-time grant, never recurred) → one line describing the real mechanic. `PLUS_PERKS` #2 reworded to match, which also resolves 2 of 5 (not 1 of 5) perks now being real in the still-open subscription-track blocker. **First commit accidentally carried a `Release-Lane: ota` trailer** — caught before anything else happened, corrected via `git commit --amend` (unpushed, safe); owner said "go" on implementation only, not ship. `npm test` → **406 passed, 47 suites** (385 + 21 new); `npx expo export --platform android` clean. Full spec archived to `docs/build-log.md`; backlog row set to code-complete; updated both perk-tracking tables under Open items. NEXT: **IMP-041** (teach the app) is next in the "before anyone can pay" group, per the ACTIVE TRACK order. IMP-033/-035/-036/-037/-038 remain open; alpha → production promotion still untaken._

_2026-08-08 (Opus — spec-tightening pass + release-track change) — **no app code touched; docs + config only.** Two commits: `cc44f9d` (specs) and `a299af7` (track). `npm test` baseline **unchanged at 406 passed, 47 suites** — nothing under `src/` was modified, so it was not re-run. **1 — Open specs moved out of PROGRESS.md into the new [`docs/specs-open.md`](docs/specs-open.md).** This file dropped 233 lines and now carries only the backlog table, Open items and the 2 newest notes; every open backlog row links to its spec heading. **Sonnet must open exactly ONE heading in that file** — the one its row links to — because reading the other eight is the context burn this split exists to stop. `DEVGUIDE.md` + `docs/playbook.md` updated to match (golden loop, archive rule, and an honest size target: PROGRESS.md ≤ ~250 lines, replacing a ≤120 that had not been met in months). **2 — IMP-041 rescoped** from four scope bullets to a full spec. The "three screens users land on" are now the literal `tab` values **`today` / `archive` / `you`** (`insights` excluded deliberately — it is self-describing and IMP-045 fixes what is unclear on it). **Anchored coach marks are ruled OUT**; it is dismissible tip cards in the `BackupNudge` shape, because overlay measurement survives neither font-scale nor rotation. Every explainer string is written verbatim in the spec with the numbers verified against code (XP 50, rites +10, embers 15, candles 120/300/450). Bundled truth fix folded in: `gamify.js` claims embers are earned by finishing the rites — they are earned by **writing the day**; the rites award XP only. **3 — Three new specs.** **IMP-045** closes **both** Lifetime Progress shortfalls (owner chose "fix both", so the old "which shortfall?" blocker is gone; the stale *"then Opus scopes it as IMP-033"* pointer is deleted — it was always wrong, IMP-033 is the restore-quarantine task). **IMP-046** = Annual Recap (perk #4; absorbs IMP-021's deferred milestone timeline). **IMP-047** = the deeper-insights analysis layer (perk #5). IMP-035/036/037/038 normalised to the same shape (numbered Steps + Tests + exact commit message + ship lane). **Three traps found while verifying the specs against the tree — all now encoded in them:** (a) `applyCompletion` only takes its no-reward branch when `prev.done` is true, so editing a **past** day while today is unwritten would have awarded 50 XP + 15 embers **and prepended a duplicate row** — IMP-036 routes past-day edits through `applyEdit` instead; (b) `PLUS_PERKS` ([`data.js:144`](src/data.js#L144)) has **5** entries and does **not** match the 6-line proposed perk table, so "perk #3" and "perk #4" meant different rows in each — IMP-038 and IMP-046 now name the exact array slot to change; (c) `String.normalize` is not guaranteed across this app's Hermes range, so IMP-035 specs diacritic folding defensively (try/catch → identity) with a test. **4 — Play track changed: builds now auto-submit to `internal`, not `alpha`** (`eas.json` → `submit.production.android.track`). Internal serves the owner only, publishes in minutes and normally skips the full review. `alpha` freezes at vc11 — **safe**, because vc11 is API 36 and cannot re-trigger the compliance banner the way `beta`/vc8 and the old `internal`/vc5 do. **Bonus: the next build overwrites `internal`'s ancient vc5/API-35, fixing half the banner automatically**; only `beta` still needs vc9 promoted onto it. Public release unchanged and still manual (promote `internal` → `production` by hand). **OTA is unaffected — `eas update` has no Play track at all**, being gated only by channel + `runtimeVersion`. Last command: `git commit` → `a299af7`; working tree clean. **NEXT: IMP-041.** Open [`docs/specs-open.md`](docs/specs-open.md) → "IMP-041 — teach the app" and run its Steps 1–9 in order, starting with the RED test `__tests__/content/tips.test.js`. **Do not read the other specs in that file.** IMP-033/-035/-036/-037/-038/-045/-046/-047 remain open; `internal` → production promotion still untaken._

_2026-08-08 (IMP-043, recoverability pass) — **code-complete, committed, not shipped.** Full TDD, pure/hook tests only (no AppState mocking). **1+1b, the real fix:** `src/billing/revenueCatService.js`'s `getEntitlement()` used to `.catch(() => null)`, which made "network failed" and "you have no subscription" indistinguishable — meaning a forged `"plus": true` in an exported/restored JSON could never be corrected, since a failed check and a successful-empty check looked identical to the old `if (!ent) return`. Removed the catch so failure propagates; new `src/billing/entitlementSync.js` is the only caller, wrapping it as `checkEntitlement()` → `{verified, entitlement}` and `nextPlusState(plus, result)` (pure: unverified never changes plus; verified-empty downgrades — the missing branch; verified-found upgrades). `useLaunchEntitlementCheck` fixes the lost-phone bug itself — mount-only, ref-guarded, fires exactly once and only when `plus` starts `false`, so a returning subscriber on a fresh/quarantined install gets silently re-verified instead of waiting to find Restore Purchases behind the paywall. Confirmed by construction (not a special case) that the sim service can never hit the downgrade branch: `createSimService`'s `alreadyPlus` snapshots `plus` when the memoized `service` is built, so while `plus` is true its `getEntitlement()` always resolves truthy. **New "Restore purchases" row** in `YouScreen.js`'s Plus/Shop section, shown only `plusEnabled && !plus`, wired to the existing `doRestore()`. **2:** new `src/backup/backupHealth.js` (`'never'|'stale'|'ok'`, 30-day boundary inclusive) drives a warning line in the "Your journal is safe" card, plus a stateless milestone nudge at `entriesCount === 100 || 365` (exact-match, not `>=`, so it needs no dismiss flag — same derived-not-stored pattern as IMP-021/024). **3:** one line added to `Paywall.js` — "Your journal lives on your device. Plus adds memory, not storage." **4:** no code — re-read the tree first and found `doGetHelp()`'s existing "Get help" row (falls back to a support-URL toast when billing isn't configured) already satisfies the "goodwill channel" ask; building a full About-sheet support surface would mean reviving the still-deliberately-deferred **IMP-022**, so left alone; Play promo codes need zero code and are just a note for whenever the owner wants that lever. **One collision caught by `expo export`, not npm test:** `YouScreen.js` already imports RN's own `Alert` (for `Alert.alert`); the new `Alert` icon from `src/icons.js` had to be aliased `AlertIcon` — a real SyntaxError that Jest's per-file module graph didn't catch but Metro's did, worth remembering for the next icon import into a screen that also uses RN's `Alert`. `npm test` → **385 passed, 46 suites** (369 + 16 new); `npx expo export --platform android` clean. Full spec archived to `docs/build-log.md`; backlog row set to code-complete; also resolved the matching entry under Open items → "HARD BLOCKER before PLUS_ENABLED — a returning subscriber…". NEXT: **IMP-039** (streak-freeze candles do nothing) is next in the "before anyone can pay" group — owner already decided option (a), make them real. IMP-033/-035/-036/-037/-038/-041 remain open; alpha → production promotion still untaken._

_2026-08-08 (IMP-040, "keepsake" means three different things) — **code-complete, committed, not shipped.** Owner had already settled the naming split 2026-08-04 (Keepsakes = achievements, Daily rites = quests, Your Book = the unbuilt PDF export); this session just executed it. Three copy-only diffs: `gamify.js:113` — the daily-rites footer's two branches ("All rites kept" / "N of M kept") now name the real reward, embers, instead of a "keepsake" nothing actually grants. `Achievements.js:29` — dropped the redundant second title (screen showed kicker "Keepsakes" *and* headline "Achievements"); now a single "Keepsakes" headline, matching the Home row and You tile users already navigate by that name. `data.js:148` — the `PLUS_PERKS` PDF line reworded from "Export your days as a keepsake PDF" to "Your Book — export your days as a PDF"; carried the rename into the deferred IMP-022 spec (Part A heading, `buildKeepsakeHtml` → `buildBookHtml`) and the two perk-list references in PROGRESS.md's still-open subscription-track section, so nothing left in the tree calls the PDF a keepsake. **Editing three separate string literals hit an Edit-tool quirk worth knowing:** the full-line `old_string` (spanning the ternary) repeatedly failed to match despite `Read`/`Grep` showing identical text — isolating each edit to a short substring inside the line (`'a keepsake is yours'`, `'earn today's keepsake.'`) worked immediately; likely an invisible-character or escape-normalization mismatch on the longer span, not a real content difference. `npm test` → **369 passed, 44 suites**, unchanged baseline (no logic touched). Full spec archived to `docs/build-log.md`; backlog row set to code-complete. **This closes out the "quick + already broken in production" group (IMP-034 → IMP-042 → IMP-040), all three code-complete and none yet shipped.** NEXT: **IMP-043** (recoverability — the lost-phone bug) is first in the "before anyone can pay" group, per the ACTIVE TRACK order. IMP-033/-035/-036/-037/-038/-039/-041 remain open; alpha → production promotion still untaken._

_2026-08-08 (IMP-035, search your journal) — **code-complete, committed, not shipped.** Full TDD. New pure `src/insights/search.js` — `foldDiacritics(s)` (try `s.normalize('NFD').replace(/[̀-ͯ]/g, '')`, catch → return `s` unchanged — Hermes doesn't guarantee `normalize` across this app's range), `normalize(s)` (fold + lowercase + trim), `searchEntries(entries, { text, moods, from, to } = {})` — filters nullish entries, case/diacritic-insensitive substring over `did` + `wished` combined, any-of `moods` match, inclusive `dayKey` bounds, newest-first sort. Deliberately reads `e.mood` singular (IMP-037 owns the array switch). New `src/screens/ArchiveFilters.js` — presentational, props in/callbacks out (`{ text, moods, from, to, onChange, resultCount }`): `TextInput` search field, horizontally scrolling mood-chip row (same chip shape as `WriteFlow.js`'s mood picker, multi-select), two date buttons opening a `Modal` + scrollable month list (last 24 months + "Any time", no date-picker library — built from primitives already used elsewhere). Wired into `ArchiveScreen.js`: one `useState` query object, `ArchiveFilters` rendered under the header only when `entries.length > 0`, `searchEntries(entries, query)` feeds the entry-row `.map` while the heatmap keeps using the full `entries`. New "Nothing matches that yet. Try fewer words, or a wider stretch of days." empty state, distinct from the zero-entries state. `npm test` → **431 passed, 49 suites** (417 + 14 new); `npx expo export --platform android` clean. Full spec archived to `docs/build-log.md`; backlog row set to code-complete; `docs/specs-open.md`'s index and remaining "Depends on: IMP-035" mentions updated to reflect it's done. NEXT: **IMP-036** (custody of your words — edit/delete/trash) continues the retrieval track, per the ACTIVE TRACK order. IMP-033/-036/-037/-038/-045/-046/-047 remain open; `internal` → production promotion still untaken._

_2026-08-08 (IMP-042, Keepsakes screen doesn't scroll) — **code-complete, committed, not shipped.** Static reading ruled out the obvious theories (spec's own checks confirmed: `Achievements.js` is structurally near-identical to `Shop.js`, which the owner said scrolls fine; content genuinely overflows the viewport; nothing trails the ScrollView). Root cause: neither screen's `ScrollView` carries `style={{flex:1}}`, so — per a well-known RN gotcha — the ScrollView sizes to its **content's** intrinsic height instead of the parent's available viewport, never perceives an internal overflow, and the outer `flex:1` View just visually clips the excess with nothing left to scroll. `Shop.js` has the same omission and was likely never actually pushed past enough content to expose it. Fixed **every modal screen sharing this exact shape** (bare `View flex:1` → header → single content `ScrollView`, no separate footer bar), not just Achievements: `Achievements.js`, `Shop.js`, `ReadingSheet.js`, `GetEmbers.js`, `ManageSubscription` (`PlusFlow.js`) — each ScrollView gained `style={{flex:1}}` and each `contentContainerStyle.paddingBottom` now adds `insets.bottom` (previously a bare number, so the last row sat behind the SDK-54-forced edge-to-edge nav bar on every one of these screens). Left `Paywall.js` alone — it has a separate fixed footer bar already carrying `insets.bottom` correctly. Five one-line diffs, no logic changed. **No real device/emulator was available this session** to visually confirm the scroll now works — the fix targets a standard, well-documented RN sizing behaviour rather than a guess, but per the spec's own instruction this still wants a walk; if a screen still doesn't scroll after shipping, the spec's fallback (`onLayout`/`onContentSizeChange` instrumentation) is the next move, not another theory. `npm test` → **369 passed, 44 suites**, unchanged baseline (layout-only change, no pure-logic surface). Full spec archived to `docs/build-log.md`; backlog row set to code-complete. NEXT: **IMP-040** (keepsake naming, copy-only) is next in the "quick + already broken in production" order. IMP-033/-043/-039/-041/-035/-036/-037/-038 and the rest of the OTA queue remain open; alpha → production promotion still untaken._

_2026-08-08 (IMP-034, gate the fake ember prices) — **code-complete, committed, not shipped.** `Shop.js`'s "Gather Embers" section (`EMBER_PACKS` at real cash prices $1.99–$9.99, wired to a bare counter increment with no IAP) had no `plusEnabled` gate, unlike the Plus banner beside it — so the free-shipping build displayed real prices for something free. Wrapped the section in `plusEnabled &&`. In `RitualsApp.js`, added `openGetEmbers()`: opens the Get-Embers modal when `PLUS_ENABLED`, otherwise shows a toast ("Embers also gather on their own…"); routed `buyPalette`/`buySky`/`buyCandles`'s insufficient-embers branch and the header `EmberPill`'s no-pack tap through it, and gated the `getEmbersOpen` `Modal` itself (`PLUS_ENABLED && getEmbersOpen`) so no path reaches a purchase surface. Added `src/screens/Shop.test.js` — the **first render test in this codebase** (`@testing-library/react-native` was an unused devDependency until now); `useTheme()`'s `ThemeContext` default meant no `Provider` wrapper was needed. `npm test` → **369 passed, 44 suites** (367 + 2 new). Committed **without** a `Release-Lane` trailer — owner said "go" on implementation, not ship; first attempt included the trailer by mistake, corrected via `git commit --amend` (unpushed, safe). Full spec archived to `docs/build-log.md`; backlog row set to code-complete. NEXT: **IMP-042** (Keepsakes screen doesn't scroll) is next in the "quick + already broken in production" order, then IMP-040 (keepsake naming). IMP-033 (recoverability offer) and the rest of the OTA queue remain open; alpha → production promotion still untaken._

_2026-08-08 (Play deprecated-API warning → IMP-044, R8 on) — **config-only; no app code, no JS, no native source touched.** Play Console flagged five deprecated edge-to-edge APIs. Triaged to three origins: **two are React Native 0.81.5 core and are NOT fixable here** — `StatusBarModule` and `WindowUtilKt` are live code, and `expo/android/proguard-rules.pro` even pins `-keep class com.facebook.react.views.view.WindowUtilKt { *; }`, so they clear only when Meta migrates upstream (**do not re-investigate; the banner will not fully disappear**). Our own code was clean — `expo-status-bar` is used with `style` only and no `androidStatusBarColor`/`androidNavigationBar` is set. **The third origin was the real finding: the dev client was inside the production AAB.** `expo-dev-launcher`'s `DevLauncherExpoActivityConfigurator` sits in the library's `src/main` sourceset while its only consumer lives in `src/debug` — so it is dead, never-executed bytecode (plus a whole Compose UI and its resources) shipping to every user, which is exactly why nothing ever misbehaved. Play's scan is **static DEX analysis**, so it flags presence, not execution. **No per-variant autolinking exclusion exists** (`expo-modules-autolinking` reads `exclude` only from static `package.json`, gradle forwards it verbatim), so a blanket exclude would kill local `expo run:android`; **R8 shrinking is the supported lever** and was the owner's pick. Enabled `enableMinifyInReleaseBuilds` + `enableShrinkResourcesInReleaseBuilds` (note: `enableProguardInReleaseBuilds` is **deprecated** in expo-build-properties 1.0.10). Audited **every** native dep for proguard coverage and found one real hole: **`expo-notifications` ships `android/proguard-rules.pro` but never declares `consumerProguardFiles`**, and the expo module gradle plugin does not auto-wire it — unpatched, R8 could have silently stripped IMP-031's daily reminders in production, so its own rule is now applied verbatim via `extraProguardRules`. Also added **`-dontobfuscate`**: it keeps the shrinking (which is the whole point) while switching off renaming (which is what actually breaks live apps via reflection/serialization/manifest lookups) — the right trade on a first minified build, and it keeps production stack traces readable. Wiring verified end-to-end through `withAndroidProguardRules` → `android/app/proguard-rules.pro` → `build.gradle:119`, **inside `buildTypes.release`**, so debug/local builds are untouched. `npm test` → **367 passed, 43 suites** — the *unchanged baseline*, which proves only that nothing regressed. **⚠️ NOT bumped and NOT walked, both deliberate.** A `bump:native` would close the 1.0.5 OTA lane with eleven OTA tasks queued, so IMP-044 rides whichever build is cut next. Jest cannot prove R8 and **the failure mode is silent stripping at runtime, not a compile error** — the walk checklist is under Open items and in build-log → IMP-044. NEXT: unchanged — the OTA queue (IMP-034 → IMP-042 → IMP-040 → …) still owns the active track; IMP-044 needs no chat of its own._

_2026-08-02 (real-device walk — 3 of 5 debts closed) — **no code changed; docs only.** Owner walked the vc11 closed-testing build on real hardware and passed **IMP-030** (the ~4% anchor-1 margin held on real font metrics — no need to lower the `0.48` glyph ratio), **IMP-031** (including the backgrounded case, the one the emulator could not settle) and **IMP-032** (harness sections, knobs, Apply/confirm, Inspector). All three are now **DONE** in the backlog table. **IMP-021 walked but rejected by the owner** — "not actually completed properly," though progress is visible on device; re-read of `InsightsScreen.js` against the approved design surfaced two concrete deviations, now written up under Open items: (1) `deriveLifetime` computes **`xpEarned` and nothing renders it**, while design §4 asks for it "surfaced quietly" in the level context line; (2) `LifetimeHeat` collapses **`missed` and `empty` into the same transparent bordered cell** with no month labels and no legend, so a missed day is indistinguishable from a pre-start day — which also contradicts IMP-014's 💀 convention on the other two grids, and on a short history just reads as blank squares. Three things confirmed **not** defects, so nobody "fixes" them later: the milestone timeline is deferred to roadmap piece C, the Home hero is untouched on owner constraint, and the "Days kept"/"This month" tiles were deliberately removed (spec §2). **IMP-029 is now the only real walk debt**, and it is genuinely un-fakeable: the notice needs `installedAt > lastSavedAt`, `installedAt` is Android's read-only `firstInstallTime`, and `serialize` force-stamps `lastSavedAt = now` on every save — so no harness knob or hand-edit can produce it, only a true backup→uninstall→reinstall cycle. Wrote a **full device-walk procedure** into build-log → IMP-029: the key unlock is **`adb shell bmgr backupnow`**, which triggers Auto Backup on demand and removes the 24h/idle/charging/Wi-Fi wait, plus the two prerequisites that silently break the test (same signing cert on both installs; never `adb uninstall -k`), the positive case, and five negatives (normal launch / update-over-the-top / OTA / genuinely-fresh-install via `bmgr wipe` / manual JSON restore). NEXT: (a) owner runs the IMP-029 procedure, (b) owner confirms which IMP-021 shortfall is the real one so Opus can scope it as IMP-033, (c) the alpha → production promotion decision is still untaken._

_2026-08-02 (vc11 released) — **v1.0.5 / versionCode 11 is BUILT, SUBMITTED and LIVE to testers on the `alpha` track.** Owner approved the CI run; vc10's redundant run was dropped, so **vc10 never shipped and vc11 is the only build after vc9**. Five previously-unreleased features are now in testers' hands: **IMP-021** (Lifetime Progress), **IMP-028** (live store prices), **IMP-029** (restore notice), **IMP-030 A+B** (row auto-stack + font-scale cap), **IMP-031** (daily reminder). IMP-032's harness shipped in the *tree* but not the *bundle*. **The public is still on v1.0.3** — promoting alpha → production is an untaken owner decision, and until it is taken every one of those five is unshipped as far as real users are concerned. **The OTA lane reopened, but only onto testers** (`runtimeVersion` = `appVersion` = 1.0.5 matches vc11, not the 1.0.3 the public runs). Docs reconciled: backlog rows for IMP-021/028/029/030/031 moved from "code-complete" to "shipped to testers", each carrying its outstanding walk; the App status block now names both live tracks explicitly so "live" is never ambiguous again. NEXT: (a) owner decides on the alpha → production promotion, and (b) a chat spends itself on the **real-device walk** of the closed-testing build — IMP-021 has never been walked at all, IMP-029 needs a genuine Auto Backup cycle, IMP-030 anchor 1 needs the 4%-margin check, IMP-031 must be verified **backgrounded**, and the IMP-032 harness itself is unwalked._

_2026-08-02 (emulator walk + vc11 ship) — **no product code changed; local dev unblocked and v1.0.5/vc11 tagged for release.** Local Android testing was broken in a way that looked like a stale build but wasn't: `expo run:android` produced a **correct** APK (`expo/modules/application` + `expo/modules/notifications` both present in its dex) and then **silently failed to install it** — the emulator's `lastUpdateTime` stayed at `2026-07-30 16:12:35` across two build runs, so today's JS was running against July 30's native shell, surfacing as `Cannot find native module 'ExpoApplication'`. Fixed with a plain `adb install -r`. **Root cause of the misdiagnosis, worth knowing: `android/` is a stale prebuild artifact** — `android/app/build.gradle` pins `versionCode 9` / `versionName "1.0.3"` while `app.config.js` is at `1.0.5`/vc11, and `MainActivity.kt` is still the **pre-SDK-52 template** (`setTheme(R.style.AppTheme)`, no `SplashScreenManager.registerOnActivity`). So **every local build is stamped 1.0.3/vc9 regardless of config — use `adb shell dumpsys package … lastUpdateTime`, not `versionCode`, to tell local builds apart.** EAS cloud builds are unaffected (they prebuild fresh from `app.config.js`), so shipped versionCodes remain correct; regenerating `android/` with `expo prebuild --clean` is optional cleanup, untracked-and-unrecoverable if hand-edited. Two red herrings ruled out: the `ClassNotFoundException: expo.modules.splashscreen.SplashScreenManager` in logcat is **benign** (`expo-dev-launcher` reflectively probes for `expo-splash-screen`, which isn't a dependency; it logs "Failed to hide splash screen" and continues), and the first `ECONNREFUSED` was a `127.0.0.1`-from-inside-the-emulator mistake — `adb reverse tcp:8081 tcp:8081` or the LAN URL fixes it. Owner then **emulator-walked IMP-029/030/031/032** and deferred the real-device pass. **Shipped:** `npm test` → **367 passed, 43 suites**; `PLUS_ENABLED` confirmed `false` (billing preflight no-ops); harness confirmed reachable only via the `__DEV__` require at `RitualsApp.js:58` with no static imports. Tagged `Release-Lane: build` and pushed → vc11 to track `alpha`._

_2026-07-31 (harness parts C-E) — **IMP-032 Parts C–E built, committed — the harness spec is now fully code-complete.** RED first: `__tests__/dev/inspect.test.js` (8 cases: every group present, Journal/Progress/Economy/Cosmetics/Settings/Storage each match the real helpers, empty-slice case), watched it fail on the missing module, then GREEN with `src/dev/inspect.js` — `inspectState(slice, todayKey)` computes every row through the app's own real helpers (`currentStreak`, `longestConsecutiveRun`, `levelFromXp`, `deriveAchievements`, `serialize`), never a parallel calculation. **Panel split** (Part E), all under `src/dev/panel/`: `controls.js` (`Stepper`/`Toggle` moved as-is, plus new `Segmented`/`TextField` for the knobs Part A left UI-less); `StateSection.js` — every single knob from the Part A table now has a real control (mode/name/endOffset/gaps/textLength/xp/embers/freezes/plus/plan/subCanceled/palette/sky/tone/headlineFont/roundness/reminder-triple/store-sim/lastBackupAt), closing the "wiring deferred to Part E" note from the Part A session; `InspectSection.js` — renders `inspectState` rows plus impure device facts (`Platform`, `PixelRatio.getFontScale()` next to `MAX_FONT_SCALE`/`CHROME_FONT_SCALE`, `useWindowDimensions`, safe-area insets, `Constants.expoConfig.version`, `expo-application`'s native version fields, `expo-updates`' `runtimeVersion`/`channel`/`updateId`/`isEmbeddedLaunch`) and an `Export current state` button via `backupIO.exportFile`; `LaunchSection.js` — direct-open buttons for Celebration (streak+milestone picker), Achievements, Shop, Get Embers, Reminder sheet, Toast, Reading sheet, and Restore notice, plus **Paywall/Manage subscription rendered in a fully local Modal** (bypasses `RitualsApp`'s `PLUS_ENABLED`-gated one entirely — a dev-local override, never a flip of `PLUS_ENABLED` itself, so the store-simulation knobs from Part A are actually exercisable even though the app ships free). **Safety net:** `StateSection`'s Apply/Reset both go through `Alert.alert` confirm and write a recovery copy via `backupIO.writeRecovery(createBackup(...))` *before* the destructive action, mirroring `runConfirmedImport`'s guarantee exactly — if the recovery write throws, the destructive action never runs. **Knob memo:** a module-level `let lastKnobs` in `StateSection.js` (never persisted) survives closing the modal. **Sentinel hardening:** new `src/dev/sentinel.js` holds the `SENTINEL` string; every dev module (old and new) now exports `DEV_ID = \`${SENTINEL}/<name>\``, and `DevPanel.js`'s footer *renders* the joined list — rendering, not just exporting, is what stops the minifier dropping an unreferenced const, so the grep now covers every dev module. `DevPanel.js` itself is now a thin shell (collapsible sections + the footer), down from the monolith it was after Part B. **The one prod-visible line:** `RitualsApp.js` gained `const [devRestoreMs, setDevRestoreMs] = useState(null)` and `restoredAtMs={devRestoreMs ?? restoredFromMs}` — everything else needed by the launcher (celebration/achievements/shop/toast/reading callbacks, the `plusFlow` prop bundle, `getSlice`/`appVersion`) is passed as plain props/closures from inside the existing `__DEV__ && DevPanel &&` block, zero new hooks outside it. `npm test` → **367 passed, 43 suites** (from 359/42; +8). `npx expo export --platform android` → 996 modules, clean; PowerShell sentinel grep against `dist/**/*.hbc` → `OK: harness stripped from release bundle`; `dist/` deleted after. Committed `11488ea` — no bump, no `Release-Lane` trailer (dev-only, per spec). **Not yet done:** the emulator/device walk from the spec's Verification section (long-press About → walk each section → Apply a preset → confirm prompt → Inspector agrees with the screen) and the full smoke test (reminder round-trip, `staleBackup`/`longName` scenarios, Restore notice) — no device available this session. IMP-032 archived to `docs/build-log.md`; backlog table row set to code-complete; the Improvements backlog has no open IMP task. NEXT: no unchecked IMP spec remains — check with the owner/Opus for the next task, or spend a session on the device-walk debts (IMP-029, IMP-030 anchor 1, IMP-031, and now IMP-032's own walk) listed under "Open items / blockers"._

_2026-07-31 (harness part B) — **IMP-032 Part B built, committed.** TDD per spec: RED in `__tests__/dev/inspectNotify.test.js` (14 cases covering all four expo trigger shapes — `{type:'date',value}`, `{date}` as both `Date` and ISO string, seconds-based time-interval, and an unreadable trigger — plus `diffIntendedVsPending` matched/missing/extra/within-tolerance/custom-tolerance), watched it fail on a missing module, then GREEN. `src/dev/inspectNotify.js` is pure: `describePending(scheduled, now)` normalises any of those shapes into sorted `{when, inLabel, title}` rows (unreadable trigger → `when:null`, sorts last, never crashes); `diffIntendedVsPending(intended, pending, toleranceMs=60000)` greedily matches intended `Date`s against pending rows within tolerance, ignoring `when:null` rows entirely so an unreadable trigger is never miscounted as "extra". `src/dev/notifyProbe.js` mirrors `src/reminders/io.js` exactly — lazy `require('expo-notifications')` in try/catch, re-exports its `NATIVE_UNAVAILABLE` constant rather than duplicating the string — and adds `available/getPermission/requestPermission/listScheduled/fireTestIn/cancelAll`; zero business logic, no test file, same as `io.js`. New `src/dev/panel/NotifySection.js` is the actual panel UI: permission row + Request/Open-OS-settings, live `Enabled`/`Hour`/`Minute` controls that call the app's **real** `setSettings` (not the knob/Apply path — this exercises `rearmReminders`'s real dependency array), `Re-arm now`/`Cancel all`/`Fire test in 10s` actions (with the foreground-visibility caveat from Trap 4 as inline hint text), an Intended-vs-Pending list with the live diff counts, and the three `reminderRowValue` states rendered side by side. Every action re-reads permission + pending afterward — nothing is cached, per the spec ("re-read after every action"). Wired `onRearmReminders={rearmReminders}`, `settings`, `setSettings`, and a `wroteToday={!!findTodaysEntry(entries, todayKey())}` prop into `DevPanel` from inside the existing `__DEV__ && DevPanel &&` block in `RitualsApp.js` — Metro still strips the whole subtree, so this costs zero production bytes. `npm test` → **359 passed, 42 suites** (from 345/41; +14). Committed `4e677d0` — no bump, no `Release-Lane` trailer (dev-only). **Not yet touched:** the inspector (Part C), overlay launcher (Part D), or the Apply/Reset confirm+recovery-copy safety net, panel split into `src/dev/panel/{controls,StateSection,InspectSection,LaunchSection}.js`, and `sentinel.js` (Part E) — those are Parts C–E, still one spec, one remaining commit. NEXT: Sonnet takes **IMP-032 Parts C–E** (Step 12: RED in `__tests__/dev/inspect.test.js`)._

_2026-07-31 (harness part A) — **IMP-032 Part A built, committed.** TDD per spec: RED in `__tests__/dev/buildState.test.js` (14 new cases) + `__tests__/dev/generateEntries.test.js` (1 case), watched both fail for the right reason, then GREEN. `src/dev/buildState.js` gains every knob from the Part A table — `mode`, `name`, `endOffset` (shifts `endDayKey` back N days, the non-goal-compliant lapsed-user lever), `lastBackupAt` (days-ago → ISO, `-1` → `null`), `subCanceled`, `plan` (overrides the plus-derived default), the full `reminder` triple, `storePurchase`/`storeRestore`, `headlineFont`/`roundness`, `textLength`, and a `gaps` preset layer (`'none'|'one'|'scattered'` strings map to offset arrays, kept backward-compatible with the raw arrays existing scenarios already pass). **Fixed the accent bug in the same pass:** `palette` now looks up the swatch in `SHOP_PALETTES` and writes it into `settings.accent`, mirroring `RitualsApp.retint()` — a loaded palette no longer shows active in the Shop while the theme stays amber. `src/dev/generateEntries.js`'s `buildEntries` gains `textLength` (a `LONG_DIDS`/`LONG_WISHES` multi-paragraph pool alongside the existing short one). `src/dev/scenarios.js` grew all 8 new presets from the spec (`lapsed`, `reminderOn`, `staleBackup`, `neverBackedUp`, `longName`, `canceledSub`, `nightAmoled`, `storeFailure`) — the existing generic round-trip test covers them automatically since it iterates `SCENARIOS_LIST`; added 3 targeted assertions (canceledSub, stale/never backup, longName) for the interesting cases. `npm test` → **345 passed, 41 suites** (from 329/41; +16). Committed `e1dc59c` — no bump, no `Release-Lane` trailer per the spec (dev-only). **Not yet touched: `DevPanel.js` UI.** Part A's steps only scope the pure `buildState`/`generateEntries`/`scenarios` layer; wiring these new knobs into panel controls happens in Part E's panel split, not here. NEXT: Sonnet takes **IMP-032 Part B** (Step 6: RED in `__tests__/dev/inspectNotify.test.js`) — the notification control room._

_2026-07-31 (harness scope) — **scoped IMP-032 (dev harness v2).** No product code written. Owner asked whether the dev harness can manipulate everything — it can't, and the gap was measured against the code rather than the docs: the panel exposes **8 knobs**; `buildState` supports **4 more** (`gaps`/`palette`/`sky`/`tone`) that only presets can reach; **3 persisted keys are never emitted** (`mode`, `subCanceled`, `lastBackupAt`); `settings` is hardcoded to `{...DEFAULT_SETTINGS, tone}` so `name`, fonts, roundness, the store-sim keys and **the entire IMP-031 `reminder` object** are unreachable; and **nothing runtime** is reachable (permission, scheduled notifications, restore notice, celebration, paywall, toast). Two defects found while reading: the `palette` knob sets `activePalette` but not `settings.accent`, so a loaded palette shows active in the Shop while the theme stays amber (real users get `retint()`; the harness skips it) — meaning **any palette bug found via the harness today is a false positive**; and **Apply replaces the real journal with no confirm and no recovery copy**, unlike `runConfirmedImport` which does both. Third finding, unrelated to the harness: **no `setNotificationHandler` anywhere** ⇒ foreground notifications are invisible on Android (logged under Open items, deliberately out of scope). Spec is 5 parts (A state coverage · B notification control room incl. an intent-vs-OS `diffIntendedVsPending` · C read-only inspector · D overlay launcher · E safety + no-leak), 3 commits so a credit-limited chat can stop between them, with 9 repo-specific traps written out (literal `__DEV__`, lazy `require` for `expo-notifications`, `rearmReminders` cancelling probe-scheduled notifications on every foreground, gap-offset semantics, the shallow `mergeWithDefaults`, derived-streak). Explicit non-goals: no global fake clock (use the new `endOffset` knob), no faked OS permission, no JSON paste-in. **Dev-only: no bump, no `Release-Lane` trailer** — only prod cost is one inert `useState` for the restore-notice override. Housekeeping: the deferred IMP-022 spec and the older 2026-07-31 note moved to `docs/build-log.md` (IMP-022 under a new "⏸ Deferred specs" heading — parked, not history). NEXT: Sonnet takes **IMP-032 Part A** (Step 1: RED in `__tests__/dev/buildState.test.js`)._

_2026-07-31 (reminders) — **IMP-031 built, code-complete.** Full TDD per spec. `src/reminders/schedule.js` (RED→GREEN, 16 cases) is the pure boundary: `nextOccurrences` rolling 7-day window, `formatReminderTime`, `reminderRowValue`. `src/reminders/io.js` lazy-`require()`s `expo-notifications` (never a static import) so Expo Go degrades to a toast instead of crashing — verified `expo export --platform android` bundles clean both **before and after** the package was installed, confirming Metro treats the try/catch-wrapped `require()` as an optional dep. Hit the exact migration trap the spec called out: `App.js` had `if (s.settings) setSettings(s.settings)` at both the initial-load and restore paths — replaced both with `mergeWithDefaults(s.settings, DEFAULT_SETTINGS)` (the existing-but-previously-unused helper from `persistence/state.js`), with a regression test in `state.test.js` proving a pre-IMP-031 settings object gains `reminder: {enabled:false,...}` on merge instead of crashing. New `src/screens/ReminderSheet.js` (on/off + hour/minute stepper, shape of `NameEditModal`) and `src/content/reminders.js` (date-seeded gentle/playful copy, `dailyPick`'s pattern). Wired into `RitualsApp.js`: one `rearmReminders()` cancel+reschedule cycle triggered by mount, `[settings.reminder, settings.tone, entries]` changes, and `AppState` foreground. `npm test` → **329 passed, 41 suites** (from 312/40; +17). `npm run bump:native` → **v1.0.5 / versionCode 11** (native module + first runtime permission); `patch-permissions.js` postinstall re-verified exit 0. Committed (`33b3db0`, no `Release-Lane` trailer — owner hasn't said ship; **left unpushed**, see Open items). NEXT: not yet device-walked (needs a real permission-prompt + notification-fires smoke test); owner decides whether vc11 ships standalone or waits._

_2026-07-31 (ship + scope) — **shipped the backlog, scoped IMP-031.** No product code written. **(1) Tagged the v1.0.4 / vc10 shipment** — verified the lane rather than trusting the tracker: `git diff 4c44637 HEAD` (the last shipped build) touches `app.config.js`, `package.json`, `package-lock.json`, so **BUILD** is forced, and more importantly **the OTA lane is closed** — `version` is already 1.0.4 while live devices run 1.0.3 under the `appVersion` runtimeVersion policy, so IMP-030 Part A could NOT have gone OTA on its own as PROGRESS previously claimed (corrected in Open items). Pre-flighted locally: `npm test` → **312 passed, 40 suites**; billing preflight no-ops correctly (`PLUS_ENABLED = false`). Trailer `Release-Lane: build` on the closeout commit; CI test gate → owner one-tap approval → build + auto-submit to **`alpha`**, then owner promotes alpha → production in Play Console. **(2) Scoped IMP-031 (daily reminder)** as the new active track after the owner deferred IMP-022 (PDF). Found while reading `YouScreen.js`: the "Daily reminder" row at line 111 is a **third** dead button and the only dishonest one — hardcoded `value="8:30 PM"`, `onPress={() => {}}`, no `expo-notifications` in the tree, so every live user is told they have a reminder that does not exist. Spec calls for a rolling 7-day window of single-shot locals (not `repeats: true`, so it can skip a day the user already wrote), one pure core + one lazy-required native wrapper, and flags two repo-specific traps: `mergeWithDefaults` is a **shallow** top-level spread so existing users' `settings` will not gain the new `reminder` key without a hydration defaults-merge in `App.js`, and `POST_NOTIFICATIONS` makes this the app's **first runtime permission**, which changes the exact condition `scripts/patch-permissions.js` works around. NEXT: owner approves the CI build, walks IMP-029 + the IMP-030 anchor on device, promotes to production; Sonnet takes **IMP-031**._

_2026-07-30 (layout) — **IMP-030: layout can't blow out, whatever the text** (Part A OTA / Part B BUILD; no ship trailer on Part B). Owner screenshots showed "Back up my journal" ballooning to ~18 lines with a long stale-backup string — `Row`'s `flex:1` label had no `numberOfLines`, so once the unshrinkable value container ate the free space Yoga wrapped the label one char per line; the same shape was reachable today via a long name. **Part A:** new pure `src/ui/rowFit.js` (`shouldStackRow`, calibrated glyph-width estimate, pinned by both screenshots + 5 more cases) drives a new shared `src/ui/Row.js` (extracted from `YouScreen.js`; the byte-identical duplicate in `PlusFlow.js` deleted) that auto-stacks label-over-value instead of truncating, with `numberOfLines` now on every flex-shrinking text in the row. Reconciled the 3 different name `maxLength`s to 40; added `flexShrink`+`numberOfLines` to 4 other unshrinkable `space-between` pairs (gamify quests, achievements, both Lv-N headers) and fixed 2 clipping fixed-width slots in `InsightsScreen`. **Part B:** new `src/ui/textScale.js` (`MAX_FONT_SCALE=1.5`, `CHROME_FONT_SCALE=1.2`); `T` (`src/ui.js`) now defaults every `<Text>` in the app to the cap via one new prop, with chrome (tab bar, FAB label, embers pill, PalTag, the You-tab Lv-N pill) opted into the tighter cap; nav bar got a `minHeight` so the FAB can't collide with scaled tab labels. `npm test` → **312 passed, 40 suites** (from 300/37; +12, zero product-logic changes); `expo export` clean after both parts. Commits `45e0f0c` (part A) and `c810915` (part B) — **no version bump**, already at v1.0.4/vc10 from IMP-029 in this shipment. **⚠️ Anchor 1 clears by only ~4%** (235 vs 245dp) — verify "Backed up today" stays inline on a real device before trusting the `0.48` glyph-ratio constant; if it stacks in reality, lower `0.48` rather than raising the chrome subtraction. Full detail in this file → IMP-030. NEXT: IMP-022 (Save as PDF + About sheet) — batches the IMP-030 part B build._

_2026-07-30 (backup) — **IMP-029: tell the user their data was restored from a Google backup** (BUILD lane; no ship trailer — batch with IMP-022). The 2026-07-30 device walk found Auto Backup restoring correctly but silently and with data up to 24h stale; this makes that visible. **Detection is inferred, not native:** `serialize()` (`src/persistence/state.js`) now stamps `lastSavedAt: now` (injectable clock) on every save, always overriding any stale value in the slice, so a manual JSON import re-stamps too and can't false-positive; pure `src/persistence/restoreDetect.js` (`isRestoredInstall`, `formatBackupDate`) compares that stamp against `expo-application`'s `getInstallationTimeAsync()` — install newer than the data ⇒ restored. `App.js` computes the flag during hydration (skipping the native call entirely when `lastSavedAt` is absent — the common fresh-install path) and passes it to `RitualsApp`; new presentational `src/screens/RestoreNotice.js` (mirrors `PurchaseOverlay`/`CancelSheet`) offers **Got it** / **Restore from a file**, wired to the existing `doImport`. Self-clearing — dismissing re-stamps via `saveState`, no new persisted flag. `npm test` → **300 passed, 37 suites** (from 286/36; +14, zero product-logic changes); `expo export` clean. `npm run bump:native` → **v1.0.4 / versionCode 10** (IMP-029 lands first of the IMP-022+IMP-029 pair, so it owns this bump). Full detail in this file → IMP-029. NEXT: IMP-022 (Save as PDF + About sheet), then batch-build both for IMP-030 part B too._

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

**▶️ WHEN OWNER RETURNS (read this first):** _⚠️ **SUPERSEDED 2026-07-30 — the version/API numbers in this 2026-06-06 note are stale. Do not act on them.** For the live target SDK, versionCode, architecture and test count, read [`playbook.md`](playbook.md) ("Android release signing" block) and [`PROGRESS.md`](../PROGRESS.md). Kept verbatim below as a dated record only._ Owner will likely arrive with **bug fixes or improvements** discovered during testing — NOT necessarily the next phase in the ladder. Treat their request as primary. Context they expect Opus to already know: (a) the app is a free Android app **in/through Play closed testing**, Plus is **hidden** (`PLUS_ENABLED = false`); (b) any new release needs a **bumped `versionCode`** and must keep targeting ~~**API 35 / min 24**~~ (**now API 36 / min 24** — see IMP-027) and be signed with the **`M7r91j0b83`** EAS keystore (never auto-generate — see the "🔑 Android release signing" block above); (c) for code changes, follow the normal TDD loop and keep `npm test` green (~~currently 23/23~~ — the suite has grown; see PROGRESS.md for the live count). After production unlocks, remaining big rocks are **Phase 10b** (monetization — RC service-account JSON + products + flip the flag) and **Phase 11** (iOS, ⛔ needs Mac/Apple Dev). Next: support owner's bug-fix/improvement requests; resume the phase ladder (10b) only when they choose to monetize._

_2026-06-07 — Bugfix: `Confetti` in `src/art.js` was missing `StyleSheet` in its React Native import, causing a crash on the burial/celebration screen. Added `StyleSheet` to the import (commit 97306a5). Pre-existing omission in the reference code — not a separate IMP task._

_2026-06-07 — IMP-003 step 3 complete (owner visual verify). Owner confirmed streak number is centered in day mode (streak=4) and name reflects on the You tab. IMP-003 fully ✅.

_2026-06-07 — IMP-004 complete. TDD'd `src/home/streakCopy.js` (`streakSubtitle`, 4 cases: 0→fresh-start, 1→singular, n→plural, 1234→digits); extended `__tests__/persistence/state.test.js` with 4 migrator cases (progress zeroed, settings/cosmetics preserved, v2 passthrough, SCHEMA_VERSION=2). Bumped `SCHEMA_VERSION` 1→2 in `src/persistence/state.js`, added `migrators[1]` (blanket-resets entries/streak/xp/embers/freezes), replaced commented stub with real `while` chain. Zeroed five demo defaults in `src/RitualsApp.js` (entries→[], streak/xp/embers/freezes→0); removed unused `SAMPLE_ENTRIES` from its import (`SAMPLE_ENTRIES` stays in `data.js` — still used by HomeScreen's gamify-off "gentle peek"). Wired `streakSubtitle(streak)` into `HomeScreen.js` replacing the hardcoded "Four days running" copy. `npm test` — 42 passed (was 34 + 4 streakCopy + 4 migrator cases). Commit: 29fe30b. Step 7 (Expo Go runtime walk) is the owner's manual check — two paths: (a) fresh install shows all-zero + fresh-start subtitle; (b) existing-tester device updates without clearing data and demo seed is wiped while name persists. **Next: IMP-005** — remove the cosmetic login/signup step from onboarding (re-read Onboarding.js first before editing, per IMP-001 coordination note)._

_2026-06-07 — IMP-005 complete. Removed the cosmetic sign-in step from `src/screens/Onboarding.js` (app stays local-only — no accounts). Re-routed the step machine: `IntroSwipe`'s `onDone`/`onSkip` now go straight to `personalize` (were `signup`); deleted the `{step === 'signup' && <SignUp … />}` line; `Personalize`'s `onBack` now targets `intro` (was `signup`) — re-read that live line first per the IMP-001 coordination note (it already carried IMP-001's `setSettings`/`settings` props, left intact). Deleted the `SignUp` component + `AuthButton` helper + their `// ── Sign up ──` section header (`grep -rn "SignUp\|AuthButton\|signup" src` → no matches). No imports orphaned (TextInput/ScrollView/Pressable/useState all still used by Personalize/IntroSwipe). Updated the stale file-header comment to drop `signup` from the step machine. `npm test` — 42/42 green (8 suites, unchanged count — this is flow wiring + dead-code removal, no tested logic). Net diff: 1 file, +8/−83. Last command: `git commit -m "refactor(onboarding): remove cosmetic login step — app stays local-only"` — succeeded (commit ed9ac5b). Step 6's Expo Go bundle/red-screen check is the owner's manual runtime walk (no device in session): fresh onboarding should go intro-swipe → "Get started"/"Skip" → personalize (no sign-in screen), Personalize Back → intro swipe. **Next: IMP-006** — enable + verify Android Auto Backup (Lane: **Build**, rides v5; one line in `app.config.js` adding `allowBackup: true` + device backup/restore verification — note this is the first non-OTA improvement, so it needs a `versionCode` bump and full `eas build`)._

_2026-06-07 — IMP-007 complete (code; the 🔴 critical streak bug). TDD'd a new pure helper `src/home/completeEntry.js` exporting `applyCompletion(prev, entry, { config })` — once-per-day reward logic: when `prev.done` is false → reward (streak+1, xp capped at XP_MAX, embers+gain, quests write→goal & feel→goal-if-mood, entry prepended, `celebrate` with gains + milestone lookup, `rewarded:true`); when `prev.done` is true → EDIT (replace today's entry by `dayKey`, no duplicate, all progress unchanged, `celebrate:null`, `rewarded:false`). Wrote `__tests__/home/completeEntry.test.js` FIRST (11 cases, RED → module-not-found) then implemented (GREEN). In `src/RitualsApp.js`: (1) Write FAB `onPress` changed `() => { setDone(false); setWriting(true); }` → `() => setWriting(true)` (it was re-arming the reward on every tap — root cause #1); (2) rewired `complete` to build the entry with `dayKey: todayKey()`, call `applyCompletion`, apply the slice via existing setters, and branch `setCelebrate(next.celebrate)` vs `showToast("Today's reflection updated")` — removed the old unconditional `streak+1`/XP/embers (root cause #2); (3) added the `applyCompletion` import. Kept the entry's hardcoded display-date fields (`day:'31'` etc.) as-is — out of scope, tracked as a follow-up. `npm test` — 53 passed, 9 suites (was 42 + 11 new completeEntry cases). Last command: `git commit -m "fix(streak): reward only the first entry each day; same-day re-write edits instead of stacking"` — succeeded (commit `33e19d0`). **Last step completed: step 6.** Step 5 (Expo Go runtime walk) is owner-manual — no device in session: write today → streak +1 + celebration; tap FAB & re-submit same day → streak/XP/embers/count unchanged + "reflection updated" toast + ONE entry for today; new calendar day → streak bumps again. **Ship:** OTA-eligible (JS only) — rides the v5 bundle, or true `eas update --branch production` if v5 has already shipped. **Next: the IMP backlog is now empty** (IMP-001–005 ✅, IMP-006 🟡 owner device-verify only, IMP-007 ✅). Fall through to the phase ladder — Phase 10b (monetization) is the next big rock — OR work whatever new improvement the owner files. Also flagged follow-ups from IMP-007: real per-entry display dates (kill hardcoded `day:'31'`), and pre-filling the editor with today's entry on re-write._

_2026-06-07 — IMP-006 code part done (Steps 1 + 4); status 🟡 — device/Play verification pending owner. Added `allowBackup: true` to the `android` block in `app.config.js` with an explanatory comment (functionally identical to Expo's current default — the value is the explicitness so it can't silently regress + the verification below). No custom backup rules (nothing sensitive on-device; the RevenueCat key ships in the binary/env, not user data). `npm test` — 42/42 green (8 suites, unchanged; no JS logic touched). Last command: `git commit -m "build(android): enable Android Auto Backup explicitly (new-device restore, no login)"` — succeeded (commit `c3ab5d5`). **Completed up to Step 1 + Step 4. Remaining = owner manual actions (need an emulator/device + Play Console; not codeable in a chat):** Step 2 — device verification on a Google-account/emulator with backup ON: create data → `adb shell bmgr enabled` then `adb shell bmgr backupnow app.dailyrituals.mobile` → `adb uninstall app.dailyrituals.mobile` → reinstall same build → launch → confirm journal/streak/settings restored with no login; Step 3 — Play data-safety form: confirm it honestly reflects that Auto Backup goes to the user's OWN Google Drive (not collected/transferred to developer). **Ship:** this is a manifest/native change → NOT OTA-eligible; it rides the **v5 full build** (bump `android.versionCode` 4→5 at build time → `eas build -p android`, signed with `M7r91j0b83`). IMP-006 flips to ✅ once Steps 2–3 are walked on a device. **Next: after IMP-006's device verification, the IMP backlog is empty — fall through to the phase ladder (Phase 10b monetization is the next big rock, or whatever new improvement the owner files).**_

_2026-06-07 — Release pipeline BUILT + merged to main (the "remove my dependency" automation). Designed via brainstorming → spec [`docs/superpowers/specs/2026-06-07-streamlined-release-pipeline-design.md`](docs/superpowers/specs/2026-06-07-streamlined-release-pipeline-design.md), planned → [`docs/superpowers/plans/2026-06-07-streamlined-release-pipeline.md`](docs/superpowers/plans/2026-06-07-streamlined-release-pipeline.md), executed subagent-driven (per-task spec+quality review + final holistic review). **What shipped (Tasks 1–7, all on main, fast-forward merge, 10 commits e520b4d…a534638):** `scripts/bumpVersionCore.js` (pure, TDD, 6 tests) + `scripts/bump-version.js` CLI wired to `npm run bump:build` / `bump:native`; `app.config.js` legal-URL fallbacks made non-empty (OTA-safety — CI has no .env, would've blanked Terms/Privacy); `eas.json` submit `track: alpha`; `.github/workflows/release.yml` (trailer-triggered `Release-Lane: ota|build` → classify + OTA native-backstop + `npm test` gate → `production` environment approval → `eas update` or `eas build --auto-submit`); `.github/workflows/rollback-ota.yml`; the **🤖 Release rules** section in this file + DEVGUIDE pointer. `npm test` 59/59 green. **NOT pushed** (owner pushes manually). The whole approach + the appVersion-vs-fingerprint rationale is in memory [[daily-rituals-release-pipeline]] / [[daily-rituals-runtime-version-policy]]. **OWNER TO-DO before anything ships (plan Task 8):** (1) create an Expo access token at expo.dev; (2) add GitHub repo secrets `EXPO_TOKEN` + `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`; (3) create a GitHub Environment named `production` with the owner as Required Reviewer. Then push `main` so the workflows go live. **NEXT after setup:** plan Task 9 shakedown (trivial `Release-Lane: ota` commit to watch the chain), then **IMP-008** (the real zero-state fix: derive level from XP, calendar from real entries, real entry dates — DESIGN PENDING, brainstorm first) ships as the inaugural feature OTA._

_2026-06-07 — PIPELINE IS LIVE ✅. Owner completed Task 8 (Expo token + GitHub secrets `EXPO_TOKEN`/`GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` + `production` environment with owner as required reviewer). `main` pushed to GitHub for the first time (repo was empty; now tracking `origin/main`). Task 9 shakedown PASSED: pushed a trivial `Release-Lane: ota` commit (`f81140d`, an invisible comment in `RitualsApp.js`) → `classify` ✅ (lane detected, backstop ok, tests green) → owner approved the `production` gate → `ota` job ✅ ran `eas update`, update confirmed in the Expo dashboard. The `build` job was correctly SKIPPED (its `if: lane=='build'` was false for an ota push) — confirms lane gating works. Pipeline proven end-to-end for the OTA lane; the build lane will get its first real run on the next `Release-Lane: build` push. The shakedown comment in `RitualsApp.js` is harmless and will be removed when IMP-008 edits that file. Rollback OTA workflow exists but is untested (optional). **NEXT: IMP-008 — brainstorm the level model first (no XP→level mapping exists), then build (TDD) + ship as the first real feature OTA via `Release-Lane: ota`.**_

_2026-06-07 — IMP-008 COMPLETE (code) — the real zero-state finish. Brainstormed → spec (`33a9db0`) + plan (`ff94aeb`), then executed inline (executing-plans) as 8 TDD/wiring tasks. Owner design decisions: XP-threshold levels (uncapped XP); calendar = real-entry grid with **neutral empties (no skulls)**; **week strip folded into this task** (owner chose to include it); entry dates derived from the real date. **What shipped (10 commits):** (1) `src/profile/level.js` + test — `levelFromXp(xp)` → `{level,name,into,toNext}`, table Waking→Keeper of Days (Lv1: 0 / Lv2: 100 / Lv3: 250 / Lv4: 500 / Lv5: 850 / Lv6: 1300 / Lv7: 1900), `toNext:null` at top; (2) uncapped the XP reward in `src/home/completeEntry.js` (removed `Math.min(XP_MAX,…)`, dropped `XP_MAX` from config + test); (3) `src/home/calendar.js` + test — pure `buildHeatmap`/`buildWeekStrip` from entries+today (UTC-keyed, deterministic); (4) `entryDateParts()` added to `src/time/clock.js` + test; (5) wired `levelFromXp` into `RitualsApp` (deleted `LEVEL`/`LEVEL_NAME`/`XP_MAX` hardcodes; **note:** placed the derive AFTER the `xp` useState to avoid a TDZ error — plan had it too early), passed `level/levelName/xpInto/xpToNext` to Home+You, built entries via `...entryDateParts()`; (6) ArchiveScreen heatmap from `buildHeatmap(entries)`, empties render `null` (dashed box, no 💀); (7) HomeScreen week strip from `buildWeekStrip(entries)`, removed the dead `miss`/skull branch; (8) deleted dead `HEAT`+`WEEK` consts from `data.js`. Also removed the release-pipeline shakedown comment from `RitualsApp.js`. **Last command:** `npm test` → **78 passed, 12 suites** (was 59 + 9 level + 8 calendar + 2 entryDateParts; completeEntry net unchanged). **Last step completed: plan Task 8, step 4 (commit).** All committed to `main`, **NOT pushed / NOT shipped** (owner did not ask to release this session). **Owner runtime walk pending** (plan Task 8 step 5, no device in session): fresh user → Lv 1 · Waking, empty-but-friendly calendar + week strip (no skulls), entries stamped with the real date; write one → streak 1 / XP 50; level advances per the table; ≥1900 XP shows "Max". **EXACT NEXT STEP for next chat:** to ship IMP-008, make the final commit's last line `Release-Lane: ota` and `git push origin main` (the inaugural real-feature OTA) — ONLY when the owner says ship. Otherwise the IMP backlog is now empty of codeable work (IMP-006 🟡 = owner device-verify only); fall through to new owner-filed improvements or the phase ladder (10b monetization)._

_2026-06-08 — IMP-008 SHIPPED via OTA ✅ (first real feature through the pipeline). Added `Release-Lane: ota` trailer to the closeout commit (push `f81140d..f05f41f`, HEAD `f05f41f`). Release workflow ran green: `classify` ✅ (lane=ota, native backstop passed — only `src/`/`__tests__/`/docs changed, version bump correctly NOT required for OTA), `npm test` gate ✅; owner approved the `production` gate; `ota` job ✅ ran `eas update --branch production`. The `build` job was correctly skipped (lane gating works on a real feature, not just the shakedown). Owner confirmed **testers are on v5** (runtimeVersion `1.0.0`, OTA-capable), so the update reaches them automatically: `expo-updates` fetches on cold start, applies on the next cold start (≈second app open) — no Play review. Build-lane is now the only untested pipeline path (first `Release-Lane: build` push will exercise it). **NEXT: IMP backlog empty of codeable work** (IMP-006 🟡 = owner device backup-verify only). Await new owner-filed improvements, or resume the phase ladder (Phase 10b monetization). Note: owner has a WIP working-tree change adding an optional "Reset all data" control (Task 9.6) in `YouScreen.js`/`RitualsApp.js` — uncommitted, owner-driven._

_2026-06-08 — Task 9.6 committed (owner WIP); IMP-009 COMPLETE (code). (1) Task 9.6 "Reset all data" control: owner-written WIP in `App.js`, `src/RitualsApp.js`, `src/screens/YouScreen.js` — imported `clearState`, added `handleResetData` (clears AsyncStorage + resets all state atoms to defaults), threaded `onResetData` prop down to `YouScreen`, added a `confirmReset` `Alert.alert` dialog + red "Reset all data" row (using `Restore` icon) guarded by `onResetData && …`. Committed as `feat(you): add optional Reset all data control (Task 9.6)` (`90aaa5b`). (2) IMP-009: TDD'd `src/insights/derive.js` exporting `deriveInsights(entries, currentStreak, now)` — returns `{ empty, stats:{currentStreak,longestStreak,daysKept,thisMonth}, moodMix:[{m,n}], rhythm:[{l,n}]×7, peakWeekday }`. Wrote `__tests__/insights/derive.test.js` FIRST (17 cases, RED → module-not-found) then implemented (GREEN). Rewrote `src/screens/InsightsScreen.js` to consume `deriveInsights`: deleted hardcoded `STATS`/`MOOD_MIX`/`RHYTHM` constants; added empty state card; dynamic `peakWeekday` subtitle; "No moods logged yet." note when `moodMix` is empty; divide-by-zero guard on `rhythmMax`. Wired `entries={entries} streak={streak}` into `<InsightsScreen />` in `src/RitualsApp.js`. `npm test` → **95 passed, 13 suites** (was 78 + 17 new derive cases). Last command: `git commit -m "fix(insights): derive stats, mood mix and rhythm from real entries"` — succeeded (`9212c5a`). **Step 5 (Expo Go runtime walk) is the owner's manual check** (no device in session): fresh/reset account → empty state card (no fake 4/21/47/12); write entries across different days → stats, mood bars, rhythm bars update; busiest weekday shown in subtitle. **Ship:** OTA-eligible (all JS in `src/`) — tag final commit `Release-Lane: ota` and `git push origin main` when owner is ready. **NEXT: IMP backlog now empty of codeable work** (IMP-006 🟡 = owner device-verify only; IMP-009 ✅ code done). Await new owner-filed improvements or resume the phase ladder (Phase 10b monetization)._

_2026-06-06 — EAS Update (OTA) set up. Owner asked "is there CI/CD like websites" — answer: no auto-deploy by default, but added **over-the-air updates** so JS-only fixes ship without a Play review. Installed `expo-updates ~0.25.28`; set `runtimeVersion: { policy: 'fingerprint' }` (auto-computes a native signature so OTA is refused to native-incompatible builds — the safety guard); added `updates.url` (EAS endpoint for projectId `1a0f9b15-…`); added `channel` (development/preview/production) to each `eas.json` build profile. `npm test` 23/23 green. Commit `b117c1e`. **CRITICAL caveat:** OTA only works on builds that have `expo-updates` baked in — the **in-review versionCode 4 build predates this and CANNOT receive OTA**. The FIRST build made after this commit (versionCode ≥5) is the first OTA-capable one. **No CI configured** (no `.github/workflows`); builds/updates are still run manually by the owner (could add GitHub Actions / EAS Workflows later)._

_2026-06-07 — IMP-002 complete. TDD'd `src/time/clock.js` (`greetingFor` + `todayLabel`, 7 test cases); wired both into `HomeScreen.js` (greeting is now clock-derived, not mode-derived; date line is live); removed unused `greeting`/`greetingNight` keys from `COPY.gentle` and `COPY.playful` in `data.js`; kept `TODAY_LABEL` export (still used by `WriteFlow.js`). `npm test` — 34 passed (was 27 + 7 new clock cases). Last command: `git commit -m "fix(home): derive greeting and date from the device's local time"` — succeeded (d1e06ba). **Next: IMP-003** — center the streak number in the hero card (pure layout tuning in `HomeScreen.js` + `art.js`, no TDD)._

_2026-06-07 — IMP-003 complete. Pure cosmetic/layout — no TDD. Applied three targeted changes: (1) streak number `T` in `HomeScreen.js` line 51: added `includeFontPadding: false`, `textAlign: 'center'`, changed `lineHeight: 76` → `82` (headroom so glyph isn't clipped); (2) added `marginTop: 13` to the number-block container View (line 50) — math: card `paddingTop:26` + 13 + half-lineHeight 41 = 80px = focal center of art; (3) `NightSky` in `art.js` line 78: changed `top: -90` → `-70` to match `RayFan` (both art backgrounds now share focal center at y=80 from card top). `npm test` — 34 passed (unchanged). Last command: `git commit -m "fix(home): center the streak number in the hero card across 1–4 digits"` — succeeded (9d87f14). Step 3 (Expo Go visual verification — day/night, 1/4/1234 digits) is the owner's manual check; no device available in session. **Next: IMP-004** — new-user zero-state + v1→v2 migration (TDD for both `streakCopy` helper and migrator; zero the demo defaults in `RitualsApp.js`; dynamic subtitle in `HomeScreen.js`). This is a larger task; start with the RED tests first._

_2026-06-07 — IMP-001 complete. TDD'd `src/profile/identity.js` (`profileIdentity` helper, 4 cases); added `name: ''` to `DEFAULT_SETTINGS` in `src/theme.js`; threaded `setSettings`/`settings` into `Onboarding` → `Personalize` (seeds `name` from settings, saves on "Looks good"); passed `setSettings` from `App.js` to `<Onboarding />`; updated `YouScreen.js` to import and use `profileIdentity` — replaced hardcoded `A`/`Amara` with `{initial}`/`{display}`. `npm test` — 27 passed (was 23 + 4 new). Last command: `git commit -m "fix(profile): show the user's chosen name on the You tab instead of hardcoded \"Amara\""` — succeeded (e01f8fe). **Next: IMP-002** — derive greeting + date from device local time (`src/time/clock.js` + HomeScreen.js)._

_2026-06-06 (Opus, planning) — Opened the **post-launch improvements track**. Owner is back in bug-fix/improvement mode (cosmetic + technical), not the phase ladder. Set up PROGRESS.md so the existing DEVGUIDE prompts route Sonnet to this work automatically: (1) added an **▶️ ACTIVE TRACK** callout under the status legend telling Sonnet to work the first unchecked `IMP-xxx` task before Phases 8/10b/11 (parked); (2) added the **🔧 Improvements / bug-fix backlog** section (ship-lane table OTA-vs-full-build, backlog-at-a-glance table, and a per-issue task TEMPLATE — each `IMP` task carries its full spec inline so Sonnet never hunts the phase plan); (3) updated "How to resume" step 2 to check the active track first. No app code touched — `npm test` unchanged (23/23). Backlog is empty; Opus appends one scoped `IMP` block per issue the owner files, in priority order. **Next:** owner files the first improvement issue → Opus scopes it into IMP-001 → Sonnet executes via DEVGUIDE Prompt 1._

_2026-06-07 — Prep for the first improvements build (v5) + fixed a fingerprint mismatch. (1) Bumped `android.versionCode` 4→5 in `app.config.js` (v4 already uploaded; eas.json uses `appVersionSource: local` with no autoIncrement, so the bump is manual). Commit `67dde47`. (2) **EAS build failed with a runtimeVersion mismatch** (local `e3fab5fe…` ≠ EAS `6ada4744…`). Root-caused empirically via `npx expo-updates fingerprint:generate`: the local `android/` dir is gitignored so it's correctly EXCLUDED (not the cause); the real cause is the `fingerprint` policy embedding **machine-specific absolute paths** (`rsphoenix02` appears 6× in the autolinking config contents) + 96 `node_modules` sources hashed with Windows **CRLF** — all differ on EAS's Linux servers. Unfixable for fingerprint. **Fix: switched `runtimeVersion.policy` `fingerprint` → `appVersion`** in `app.config.js` (OS-independent; runtimeVersion is now the `version` string `1.0.0`). This is what Task 10a.4 originally used before the 2026-06-06 OTA setup flipped it. Updated the "Update workflow" doc: the lost fingerprint auto-guard is now a **manual rule — bump `version` on any native-change build; keep `version` for JS-only OTA**. `npm test` still 53/53. **Next: owner runs `eas build -p android --profile production` (v5, version 1.0.0, signed with `M7r91j0b83` — do NOT auto-generate a keystore), then uploads the `.aab` to the closed-testing track.**_

---

_2026-06-08 — IMP-010 + IMP-011 complete (code), both owner-filed bugs. (1) **IMP-010 — onboarding every cold start:** root cause was `App.js`'s `onboarded` useState defaulting to `false` with nothing restoring it. Added `'onboarded'` to `PERSISTED_KEYS` (`src/persistence/state.js`); `RitualsApp` autosave now writes `onboarded: true` (it only mounts after first-run); `App.js` load now sets `onboarded` when `loaded` is truthy OR `s.onboarded` — the `loaded`-truthy clause means existing testers (who have persisted state but no `onboarded` key yet) are NOT re-onboarded on this update, so no migration and no disruption to the 12×14 gate. Reset-all-data still returns to onboarding (clears state). TDD: 2 RED→GREEN cases in `__tests__/persistence/state.test.js` (pickPersisted carries the flag; serialize/deserialize round-trip). (2) **IMP-011 — "31 May" in the reflection flow:** IMP-008 missed `WriteFlow.js`, which still rendered the hardcoded `TODAY_LABEL`. Swapped both occurrences to `todayLabel()` (the device-date helper HomeScreen already uses) and deleted the dead `TODAY_LABEL` export from `data.js` (grep-confirmed no other src usage — only docs). New entries were already date-correct via `entryDateParts()`, so the Reflections list itself was fine; this was the write-screen epitaph header. **Self-confirmed both fixes by test (owner couldn't do a device walk):** extracted the onboarding decision out of `App.js` into a pure, tested helper `src/persistence/onboarding.js` (`hasCompletedOnboarding(loaded)`) and added `__tests__/persistence/onboarding.test.js` (4 cases — new user → onboarding; flag set → skip; legacy tester w/ data but no flag → skip; real save→load round-trip → skip) + `__tests__/time/writeFlowDate.test.js` (2 cases — `TODAY_LABEL` is now undefined; the date source tracks the real day, never "31 May"). Noted the old constant even had the wrong weekday (31 May 2026 is a Sunday). `npm test` → **103 passed, 15 suites** (95 → +2 persistence flag cases +4 onboarding-gate +2 writeFlowDate). **NOT committed / NOT pushed** (owner didn't ask to ship this session; on `main`, so branch before committing per workflow). **Owner runtime walk pending** (no device in session): cold-start an already-set-up install → lands on Today, no onboarding; open the write FAB → epitaph shows today's real date; fresh install / reset → onboarding shows once, then never again. **Ship:** both OTA-eligible. Note for tagging: IMP-010 touches `App.js` (root JS entry, bundled — not native), so confirm the CI native-backstop's path rule accepts `App.js` under the `ota` lane before tagging `Release-Lane: ota`; if the backstop is a strict `src/`-only check it may need `build` (or a backstop tweak). NEXT: owner to verify on device + decide ship lane; IMP backlog otherwise empty of codeable work (IMP-006 🟡 = owner device-verify only)._

---

_2026-06-08 — IMP-012 COMPLETE (code) — Achievements + Home Keepsakes start fresh from real data. TDD'd a new pure helper `src/profile/achievements.js` exporting `ACHIEVEMENT_DEFS` (six achievements as metadata only: `{id,label,desc,icon,goal,stat}`, `stat ∈ daysKept|longestStreak|moodsLogged`), `KEEPSAKE_DEFS` (the five Home medals: firstlight/seven/honest/steadfast/fullcircle, fixed order+icons), `deriveAchievements(entries, streak, now)` → `[{...def, cur:min(value,goal), done:value>=goal}]`, and `deriveKeepsakes(...)` → `[{...def, earned:value>=threshold}]`. Both reuse `deriveInsights` once (moodsLogged = sum of moodMix.n) so streak/day math stays in one place. Wrote `__tests__/profile/achievements.test.js` FIRST (13 cases, RED → module-not-found) then implemented (GREEN): empty user → all cur 0/done false/earned 0; fixed Jun 1–3 set → firstlight done & clamped to 1, seven cur 3, honest tracks 2 moods (excludes mood-less entry), moonlit cur 3; done flips exactly at goal (7-day run); cur never exceeds goal (100-day clamp); keepsakes order/ids + first-entry lights First Light only. Made `Achievements.js` a dumb renderer (new `entries`/`streak` props → `deriveAchievements`; render earned-count, per-row cur/goal + Earned badge from result; dropped `ACHIEVEMENTS` import). Drove HomeScreen's Keepsakes strip off `deriveKeepsakes(entries, streak)` (dropped `BADGES` import; same 5 medals/icons/order — only earned state is now real). `RitualsApp.js`: memoized `achievements = deriveAchievements(entries, streak)`, `badgesEarned = achievements.filter(a=>a.done).length` (replaces the fake `ACHIEVEMENTS.filter(...)`), threaded `entries`/`streak` into `<Achievements />`, dropped now-unused `ACHIEVEMENTS`/`BADGES` from the data import. Deleted the dead `ACHIEVEMENTS` + `BADGES` constants from `src/data.js` (grep-confirmed no remaining src refs — only comments in achievements.js). `npm test` → **116 passed, 16 suites** (was 103 + 13 new). Last command: `git commit -m "fix(achievements): derive progress + keepsakes from real entries (kill hardcoded values)"` — succeeded (commit `1a2b6b4`). **Last step completed: step 7.** Step 6 (Expo Go runtime walk) is owner-manual — no device in session: fresh/reset account → "0 of 6 earned", all medals unlit, all bars at 0/goal; write entries / build a streak → the right achievements progress + light up; You-tab keepsakes count matches. **NOT pushed / NOT shipped** (owner didn't ask to release this session; committed on `main`, no `Release-Lane` trailer). **Ship:** OTA-eligible (all JS in `src/`) — tag the final commit `Release-Lane: ota` and `git push origin main` when owner is ready (reaches testers on v5+). **EXACT NEXT STEP for next chat:** IMP backlog is now empty of codeable work (IMP-006 🟡 = owner device backup-verify only; IMP-008/009/010/011/012 all ✅ code, several with runtime-walk/ship pending). Await new owner-filed improvements, or — if owner wants to monetize — resume the phase ladder at **Phase 10b** (BillDesk + live products + flip `PLUS_ENABLED`)._

_2026-06-13 (Opus, planning) — Owner filed 5 new improvements → scoped as **IMP-014 → IMP-018** in the Improvements backlog (full inline specs: goal, why, root cause w/ file:line, decided approach, TDD, steps, commit msg, acceptance). No app code written this session — Opus only authored the task specs. All five are OTA. Baseline: `npm test` 123 passed, 17 suites._

_2026-06-13 (Opus, planning) — Owner filed a new bug → scoped as **IMP-013** in the Improvements backlog. **No app code written this session — Opus only authored the task spec** (PROGRESS.md edits + this note). **Bug:** for a new user, and after "Reset app data", the **"Tend an old grave"** rite in Today's rites (Home tab) shows already-completed; owner's rule is everything must read 0 on new/reset. **Root cause:** `src/data.js:61` seeds the `revisit` quest with `cur: 1` (comment even says "revisit starts done"); `quests` defaults to `DAILY_QUESTS` for new users and reset-all-data falls back to the same seed. **Trap caught:** `revisit` has **no completion trigger anywhere** (`src/home/completeEntry.js` only advances write/feel), so a bare `cur: 0` would make the rite permanently uncompletable and **regress the daily keepsake to unearnable** (all three rites gate it). **Approach decided (do not re-litigate):** zero the seed **and** give `revisit` a real trigger — kept by opening a *past* entry from Reflections, via a new pure helper `src/home/markRevisited.js` wired at the `setReading(e)` call site. Full spec + TDD + steps were inline in the IMP-013 task block (now ✅, see the completion note)._

_2026-06-13 — IMP-013 COMPLETE (code) — "Tend an old grave" zeroed for new/reset users; kept by revisiting a past entry. TDD'd new pure helper `src/home/markRevisited.js` exporting `markRevisited(quests, entry, today)` — immutable: returns a new quests array with `revisit.cur` set to `goal` only when `entry.dayKey !== today` and revisit is not already kept; today's entry, missing `dayKey`, or already-kept → returns the same reference unchanged; `write`/`feel` untouched. Also wrote a `DAILY_QUESTS` zero-state guard in the same test suite. Wrote `__tests__/home/markRevisited.test.js` FIRST (7 cases: past-entry sets goal, today's-entry no-op, no-dayKey no-op, idempotent, write/feel unchanged, new-array/no-mutation, plus zero-guard — all RED → module-not-found) then implemented (GREEN). Fixed `src/data.js`: `revisit.cur 1 → 0`; corrected the comment (was "revisit starts done" → "all rites start at 0; revisit kept by opening a past entry"). Wired in `src/RitualsApp.js`: added `import { markRevisited }` and expanded the `ArchiveScreen onOpen` handler to `(e) => { setReading(e); setQuests((qs) => markRevisited(qs, e, todayKey())); }`. `npm test` → **123 passed, 17 suites** (was 116 + 7 new cases). Commit `70b1dd7`. **Acceptance (owner runtime walk — no device in session):** Fresh install (or You → Reset app data) → Today tab → all three rites read 0/1, none pre-kept, "0 of 3 kept"; write today + mood → write/feel kept, revisit still 0; open a *previous day's* entry from Reflections → revisit flips to kept; all three kept → daily keepsake offered; next calendar day → all rites reset to 0. **Ship:** OTA-eligible (all changes in `src/`)._

_2026-06-13 — IMP-014 COMPLETE (code) — Missed days now show a 💀 skull in both the Today week strip and the Reflections heatmap; days before the user's first-ever entry and future days remain neutral blanks. Added `minDayKey(entries)` helper to `src/home/calendar.js` (earliest `dayKey` across all entries, or `null`). Updated `buildHeatmap`: no-entry past day where `dayKey >= firstKey && !isToday` → `{ dayKey, missed: true, today: false }`; today with no entry stays `{ empty: true, today: true }`. Updated `buildWeekStrip`: past no-entry days → `'missed'` if `dayKey >= firstKey`, else `'empty'`. Updated `HomeScreen.js` `Dot`: `state === 'missed'` renders `<Text style={{ fontSize: 16 }}>💀</Text>` on the neutral dot background. Updated `ArchiveScreen.js` `Heat`: `cell.missed` renders 💀 in the dashed-border neutral cell. `npm test` → **131 passed, 17 suites** (was 123; 8 new cases). Commit `d1eea60`. **Ship:** OTA-eligible._

_2026-06-13 — IMP-015 COMPLETE (code) — "What should we call you?" is now mandatory in onboarding. Extracted `isValidName(raw)` → `src/profile/name.js` (pure: `raw.trim().length > 0`). In `Personalize` (`src/screens/Onboarding.js`): added `nameTouched` state; `onChangeText`/`onBlur` set it; added an inline "A name is required to continue." hint shown only after the field is touched and still empty; gated the "Looks good" `PrimaryButton` with `disabled={!nameOk}` (renders at 0.4 opacity, unresponsive when empty). 6 new tests in `__tests__/profile/name.test.js`. `npm test` → **137 passed, 18 suites** (was 131 + 6 new). Commit `b3c4d99`. **Ship:** OTA-eligible (all JS in `src/`)._

_2026-06-13 — IMP-016 COMPLETE (code) — Ember flame icon now fills and centers its rendered box. Changed `src/icons.js` `Ember` component's `viewBox` from `"0 0 24 24"` → `"4.75 1.6 14.5 14.5"` (a 14.5×14.5 square centered on the glyph's bounding box: x ∈ [7.3,16.7], y ∈ [2.3,15.4], center ≈ (12, 8.85)). The flame now fills ~90% of the rendered box at all sizes (was ~40%, floating top-biased). No size adjustments needed in `EmberPill` or `PalTag` — both callers look correct with the new viewBox. No logic changed; `npm test` → **137 passed, 18 suites** (unchanged). Commit `9e41706`. **Acceptance (owner runtime walk — no device in session):** the amber flame in the embers pill (top-right, Today) should be clearly visible, proportional to the number beside it, and vertically centered. **Ship:** OTA-eligible (all JS in `src/`)._

_2026-06-13 — IMP-017 COMPLETE (code) — "Good afternoon" greeting band added. `src/time/clock.js` `greetingFor` now returns three bands: `h < 12` → "Good morning"; `12 ≤ h < 17` → "Good afternoon"; `h ≥ 17` → "Good evening" (was binary morning/evening). Extended `__tests__/time/clock.test.js`: updated the noon assertion (was "Good evening" → "Good afternoon") and added 3 new cases (16:59 → afternoon, 17:00 → evening, 21:00 → evening). `npm test` → **140 passed, 18 suites** (was 137 + 3 new). Commit `f66b20c`. **Acceptance (owner runtime walk):** opening the app in the afternoon shows "Good afternoon."; morning "Good morning."; evening "Good evening." — all matching the device clock. **Ship:** OTA-eligible (all JS in `src/`)._

_2026-06-13 — IMP-018 COMPLETE (code) — Today's reflection is editable (prefilled WriteFlow + "Start fresh" reset). Added pure helper `src/home/todaysEntry.js` exporting `findTodaysEntry(entries, today)` (returns entry with `dayKey === today` or `null`) and `isEditableToday(entry, today)` (true only when entry exists + dayKey matches today). TDD'd in `__tests__/home/todaysEntry.test.js` FIRST (9 cases: RED → module-not-found → implement → GREEN). Updated `WriteFlow`: added optional `initial` prop (`{did, wished, mood}`); seeds `useState` from it; added "Start fresh" Pressable in the top-bar right slot (visible only when `initial` is set), which clears did/wished/mood and resets to step 0. Updated `RitualsApp`: added `import { findTodaysEntry, isEditableToday }`; WriteFlow now conditionally renders (`{writing && ...}`) so useState always seeds fresh from `initial`; `initial` is computed from `findTodaysEntry(entries, todayKey())` each time the modal opens. ReadingSheet receives `canEdit={isEditableToday(reading, todayKey())}` and `onEdit={() => { setReading(null); setWriting(true); }}`. Updated `ReadingSheet`: accepts `canEdit` + `onEdit` props; renders an "Edit" Pressable in the header only when `canEdit` is true — past entries show no Edit button and remain read-only. `npm test` → **149 passed, 19 suites** (was 140 + 9 new). Commit `267279d`. **Acceptance (owner runtime walk — no device in session):** After writing today's reflection, tapping the write FAB (or "Edit" on today's entry in Reflections) opens the flow with the prior text already filled and the mood pre-selected; "Start fresh" clears everything back to step 0. Saving updates today's entry without bumping streak/XP again. Past entries open read-only (no Edit). **Ship:** OTA-eligible (all JS in `src/`)._

_2026-06-13 — 🚀 OTA SHIPPED — published the accumulated improvements (IMP-008 → IMP-018) to the `production` channel over the air. Closeout commit `b9d0df5` tagged `Release-Lane: ota` and pushed to `main`; CI Release workflow ran (native backstop clean — only `src/`/`__tests__/`/docs touched; `npm test` gate 149/19 green), owner gave the one-tap `production` approval, **OTA confirmed green by owner**. Since `eas update` publishes the whole current JS bundle, this single update carries everything not previously OTA'd (real zero-state, insights, onboarding-once, real dates, achievements/keepsakes, revisit-quest fix, missed-day skull, mandatory name, proportional Ember icon, afternoon greeting, same-day prefilled edit). Reaches testers on **v5+** builds only (v4 can't receive OTA). Backlog statuses flipped to "✅ shipped OTA 2026-06-13; runtime walk pending". Rollback if needed: Actions → Rollback OTA workflow._

_2026-06-13 (Opus, planning) — IMP-019 dark mode reviewed by owner → **v1 too plain / not premium**; scoped **Round 2 "rich & alive"** (no code written by Opus). Diagnosis from code: `EmberGlow` is one flat amber radial blob + 5 tiny 1–2px specks (with a `duration:1` hard reset) — no hot core, no structure, no layering, so it reads dim. Owner picked the **rich & alive** direction. Round-2 spec (inline under the IMP-019 task block): layered hot-core bloom + coal-bed + 16 glowing Svg embers + lit number + card sheen. All behind `DARK_THEME='v2'`, OTA, classic intact. (Round 2 was later built then **abandoned** — see the Round-3 crescent pivot.)_

_2026-06-13 (Opus, planning) — Owner reviewed IMP-019 Round 2 (rich ember hero, commit `44bff07`) → **derailed / too busy, still not premium**. **Reverted `DARK_THEME` to `'classic'`** (commit `f3ca0e7`; updated the default-guard test; nothing had ever been OTA'd, so production was already on classic). New direction (owner pick): **crescent accent + a few embers** — a refined glowing gradient crescent (NOT the rejected flat cheese-disc moon) as a small upper-area accent, ~5–8 quiet embers, the lit streak number as hero; restrained, not a particle show. Scoped as **IMP-019 · Round 3** inline under the task block. **Reuse Round 2's good parts:** the streak-number text glow + the night-v2 `Card` sheen (both kept). **Flag discipline:** default stays `'classic'` while building; flip to `'v2'` + update the default-guard test only on owner approval, then OTA._

_2026-06-13 — IMP-019 Round 3 COMPLETE (code, commit `73601fa`) — Built `NightCrescent` in `src/art.js`: (1) **thin luminous crescent** via the "carve" technique — a gradient-filled lit disc (cx=228,cy=112,r=38; pale-gold #fff7ea → amber #d97706) plus a pure-AMOLED-black occluding disc (cx=284,cy=108,r=36) that carves the right side away, leaving a thin ~18px crescent arc in the upper-right of the hero; (2) **soft ambient halo** (radial amber bloom r=68, breathes 0.18→0.32 opacity, 4.2s); (3) **crescent breathes** 0.80→0.97 opacity, same cycle; (4) **6 sparse `EmberParticle`s** (reduced from Round 2's 16 — quiet, supporting, not the show); also fixed the `duration:0` reset snap → `duration:1`. `HomeScreen.js` imported `NightCrescent` and pointed the night+v2 hero at it. Number glow + card sheen unchanged. `npm test` → **154 passed, 20 suites** (unchanged). Owner screenshotted → crescent rendered as a **fat gibbous ball clipped off the card's right edge** — direction **abandoned**; code removed in Round 4._

_2026-06-13 — IMP-019 Round 2 COMPLETE (code) — Rebuilt `EmberGlow` in `src/art.js` with full "rich & alive" treatment: (1) **layered hot-core bloom** — two out-of-phase breathe loops (`breatheA` 2600ms outer amber blob; `breatheB` 3300ms white→amber hot core starting at value 0.5 so they flicker independently); (2) **coal-bed elliptical glow** (`Ellipse cx=150 cy=185 rx=110 ry=40`, gentle 4500ms flicker via `coalV`); (3) **16 glowing `EmberParticle`s** replacing the 5 solid dots — each an `AView` + `Svg` `Circle` with its own `RadialGradient` halo, rises 62–105px over 2800–4600ms, sways ±6–19px, staggered via one-time `Animated.delay`; 3 hero embers near-white `#fff7ea`. (4) **Streak number amber text glow** in `HomeScreen.js` (`numberGlow`: `textShadowColor rgba(245,158,11,0.55)`, `radius 16`) when `isNightV2`. (5) **Card sheen** in `src/ui.js`: nightV2 cards get `overflow:'hidden'` + a `LinearGradient` overlay (`rgba(255,255,255,0.06)`→transparent, top 50%). `npm test` → **154 passed, 20 suites**. Owner reviewed → **abandoned** (too busy, still not premium); the number-glow + card-sheen survive into later rounds. (Commit `44bff07`.)_

_2026-06-14 — IMP-020 COMPLETE (code-complete; device smoke test owner-pending). Backup / Restore — first piece of the "legacy" roadmap (D). Built the full 8-task plan TDD-first: pure core under `src/backup/` (`backup.js` envelope build + validating parse = the single validation boundary, reusing `serialize`/`deserialize`; `lastBackupLabel.js` subtitle; `importFlow.js` recovery-before-replace guarantee) all unit-tested, plus a thin native `io.js` over `expo-file-system`/`expo-sharing`/`expo-document-picker`. Wired `doExport`/`doImport`/`explainAutoBackup` into `RitualsApp.js`, `handleReplaceAllData` + remount `key` into `App.js`, and a new "Your journal is safe" section into `YouScreen.js` (PDF stub relabeled "Save as PDF" — the word "Export" now appears nowhere on the You tab). Import REPLACES but writes a recovery envelope FIRST (never replaces if that write throws). `npm test` → **171 passed, 23 suites** (3 new backup suites: 9+5+2, + 1 state case). `npx expo export --platform android` bundles clean. `npm run bump:build` → versionCode **6**. 8 commits 675e520…08e3d2e; **no `Release-Lane` trailer** (owner hasn't asked to ship). Full spec archived to build-log. NEXT: owner device/emulator smoke test (export→save→restore→recovery; non-backup error toast; settings deep-link) — same gate as IMP-006, the two ride one BUILD shipment. Then legacy roadmap A+B (days-captured hero + Lifetime Progress)._

_2026-06-14 — IMP-021 COMPLETE (code-complete; OTA lane; no ship trailer). Lifetime Progress — second piece of the "legacy" roadmap (A+B). 4 commits, TDD-first. New pure modules: `src/insights/dateKeys.js` (shared `longestConsecutiveRun`/`dayKeyToUtcMs`/`DAY_MS`, extracted from `derive.js`); `src/insights/lifetime.js` (`deriveLifetime` — days remembered, total words, streaks, level/XP, adaptive `activeSpan` label). `buildLifetimeHeatmap` appended to `src/home/calendar.js` (Monday-first week rows from first entry → today). `InsightsScreen.js` restructured: "Your record" section (hero number + 2×2 totals grid + adaptive consistency heatmap) above "Your patterns" heading (unchanged mood mix + rhythm); old "Days kept"/"This month" tiles removed; subtitle updated. `xp` piped from `RitualsApp.js`. `npm test` → **190 passed, 25 suites** (3 new suites: dateKeys 4 tests, lifetime 11, calendar +4 = 20 total). Commits b347dd3…a0d5446. NEXT: owner smoke test (empty state; 1-entry heatmap; multi-week heatmap; "Your patterns" visible) — no ship until owner says go. Then **C — Annual Recap / Time Capsule** (folds in the deferred milestone timeline)._

_2026-08-16 (IMP-069, a feeling you picked can be put back down) — **code-complete, committed `b2ff8c4`, not
shipped; OTA lane, rides the next batch.** All 5 steps done in order — new `allMoodChips(builtIn,
customMoods)` in `src/entries/moodChipOrder.js` (case-insensitive, trimmed dedupe, built-ins win), wired into
`WriteFlow.js`'s mood row and `ArchiveFilters.js`'s filter row; the permanent "N chosen · …" line added under
the mood question; `addCustomMood`'s create path now calls `moodNameError` before adding, Add disabled + the
error shown when it fires. `toggleMood` **not touched** — read a third time, still correct. +12 tests exactly
as specified across `moodChipOrder.test.js`, `WriteFlowMood.test.js`, `ArchiveFilters.test.js`. **Proof:**
`npm test` → **838 passed, 83 suites** (was 826/83). `npx expo export --platform android` clean. LAST
command: `git commit` → `b2ff8c4`. Archived the spec into `docs/build-log.md`, dropped its row from
`docs/specs-open.md`'s index (queue is now IMP-070…071), ticked its `PROGRESS.md` row, updated the WALK-04
finding note, corrected the stack line, and moved the IMP-068 note down to `docs/build-log.md`. **Not to
lose: the duplicate-key fix is a candidate root cause for (h), not confirmed** — the "chosen" line is what
turns that into evidence for the next WALK-04 run. NEXT: a build chat takes **IMP-070** (first ⬜,
[spec](docs/specs-open.md#imp-070--one-emoji-and-the-block-says-what-it-makes)). A walk chat can still take
**WALK-07**, **WALK-06** or **WALK-15**._

_2026-08-16 (IMP-070, one emoji, and the block says what it makes) — **code-complete, committed `8b7a976`,
not shipped; OTA lane, rides the next batch.** New `firstEmoji(s)` in `src/entries/emojiInput.js`
(hand-rolled grapheme clustering; `isEmojiish` untouched, still the storage validator), wired into
`WriteFlow.js`'s and `MoodManager.js`'s face-field `onEmojiTyped` (their now-unused `isEmojiish` imports
dropped); `WriteFlow.js`'s subtitle explains the block, both placeholders read "or any emoji…", field
widened 90→110; `MoodManager.js`'s name field now strips emoji on change too (IMP-066 left the edit path
behind). +10 tests exactly as specified (`emojiInput.test.js` +7, `WriteFlowMood.test.js` +2 with 2 existing
assertions repointed, `MoodManager.test.js` +1). **Proof:** `npm test` → **848 passed, 83 suites** (was
838/83). `npx expo export --platform android` clean. LAST command: `git commit` → `8b7a976`. Archived the
spec, ticked its row, updated the WALK-04 finding + ACTIVE TRACK callout, corrected the stack line in both
`PROGRESS.md` and `docs/specs-open.md`, moved the 2026-08-15 Opus scoping note down to `docs/build-log.md`.
NEXT: a build chat takes **IMP-071** (first ⬜,
[spec](docs/specs-open.md#imp-071--the-filter-row-stops-jumping-under-your-thumb)) — last spec in the queue;
**it reverses landed behavior (finding g), not a defect fix — don't re-litigate the scroll-back-to-x0
decision.** A walk chat can still take **WALK-07**, **WALK-06** or **WALK-15**._

_2026-08-16 (WALK-04, search + moods) — **✅ full pass, emulator, third re-run.** Steps 1–5 and both
IMP-069 (deselect + "N chosen" line) and IMP-071 (front-sort without autoscroll) confirmed live. Two more
defects surfaced in the custom-mood face field and were **fixed live in this chat at the owner's explicit
direction**, skipping the usual Opus-scoping step: the mood-question copy shifted the page on first select
(two lines empty, one line chosen — shortened); the face-field placeholder clipped to "or any" (field
resized to a 34×34 circle matching the palette swatches, "+" placeholder in `c.accent`). That work surfaced
a **real pre-existing bug** — typing a second emoji into the face field never replaced the first, since
`onEmojiTyped` read `firstEmoji()` off the raw accumulated buffer instead of stripping the already-shown
prefix — fixed with a regression test that fails without the fix. A follow-up visual "shake" on swap
(Android auto-scrolling the field to fit a momentary two-emoji string) was fixed by giving the `TextInput`
more width than the visible circle (clipped via `overflow: hidden`) rather than by force-clearing the
native buffer — that was tried first and reverted, since it desyncs the Android IME's emoji-composing state
and silently drops the second keystroke; left as a code comment so it isn't retried. All logged as
**IMP-072** (backlog row only, no spec — see WALK-04's entry in `build-log.md` → "Walk log" for the full
account). **Proof:** `npm test` → **852 passed, 83 suites** (was 850/83). `npx expo export --platform
android` clean. LAST command: `git commit` → `44197e9`. Moved WALK-04's full section from `walk-open.md` to
`build-log.md` → "Walk log" (passed), updated its index row, closed the now-resolved WALK-04 finding note in
this file, updated the ACTIVE TRACK banner. NEXT: backlog is still empty — Opus scopes the next `IMP-xxx`.
A walk chat can take **WALK-07**, **WALK-06**, or **WALK-15** (all emulator); **WALK-13** is next in
strict index order but is device-only._

_2026-08-16 (IMP-074, the Paywall footer survives the first measure pass) — **code-complete, committed
`87ab21c`, not shipped; OTA lane, rides the next batch. Backlog is now empty — `docs/specs-open.md`'s index
is empty again.** `src/screens/Paywall.js`: added `useWindowDimensions` to the `react-native` import, read
`{ height: winH }` right after `const c = t.colors;`, capped the outer `View` at `maxHeight: winH` and gave
it `testID="paywallRoot"`, with the explanatory comment from the spec. IMP-068's `flex: 1` on the `ScrollView`
and its own comment are untouched — both guards, not one, per the spec's decision 1. +2 tests in
`Paywall.test.js` (`describe('Paywall — IMP-074')`): root `maxHeight` equals `Dimensions.get('window').height`
and `flex` stays `1`; a source assertion the file uses `useWindowDimensions()` and never `Dimensions.get(`.
Existing IMP-068 block stayed green untouched. **Proof:** `npm test` → **862 passed, 84 suites** (was
860/84). `npx expo export --platform android` clean. LAST command: `git commit` → `87ab21c`. Archived the
spec into `docs/build-log.md`, emptied `specs-open.md`'s index, ticked the row, resolved the WALK-07 finding
note (in both `PROGRESS.md` Open items — removed — and `build-log.md`, marked ✅ RESOLVED), updated the
ACTIVE TRACK banner and stack line, moved the IMP-071 note down to `docs/build-log.md` → "Session notes".
**Not to lose: this spec does not end in a walk** — WALK-07 needs a full re-run (the Paywall half plus the
five other screens' nav-mode/font-scale re-checks and the IMP-067 spot-check, all paused mid-run when this
surfaced). NEXT: backlog is empty — Opus must scope a new `IMP-xxx` before there's a spec to take. A walk
chat can take **WALK-07** (unblocked), **WALK-09** (unblocked), or **WALK-15**._

---

## Update workflow — superseded manual reference

_Shipping is automated now (see the "🤖 Release rules" section in PROGRESS.md). This older manual lane guidance is kept for reference; the durable invariants (runtimeVersion = appVersion, OTA baseline = v5/1.0.0) are folded into Release rules._

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
- **CI is now automated** — see the **🤖 Release rules** section above. Agents tag a commit `Release-Lane: ota|build` and push; GitHub Actions runs the test gate, waits for the owner's one-tap approval, then ships (OTA) or builds + auto-submits to the `alpha` track. Rollback via the **Rollback OTA** workflow.

_2026-06-13 (Opus, planning) — Two owner items this session. (1) **Streak-number centering check (no task filed):** verified against the code/math — horizontally the number IS centered (art SVG is `left:0,right:0,alignItems:center` so rays/moon converge on the card midline; the number block is `alignItems:center` + `textAlign:center` with symmetric 22px padding). Vertically it's tuned so the text **line-box** center lands exactly on the art focal point (card `paddingTop:26` + block `marginTop:13` + half `lineHeight:82`(41) = 80px; art container `top:-70` + SVG center 150 = 80px — matches IMP-003). Honest caveat told to owner: digit glyphs (no descenders) optically sit slightly above the line-box center, so it can *read* a few px high even though the box is centered; confirming needs a device screenshot, and the fix (if wanted) is a ~+2–4px `marginTop` nudge or baseline-anchored alignment. **No code changed; awaiting owner's go-ahead to verify on device.** (2) **Dark-mode redesign scoped as IMP-019** (planning only — no code). Owner chose **Direction A: full premium dark redesign, done directly, in line with light mode**, with a **hard revertability requirement** if it flops. Approach locked: build `PALETTES.nightV2` (true-black AMOLED) + `EmberGlow` hero behind `DARK_THEME = 'v2' | 'classic'` flag in `theme.js`. Revert = flip one constant + OTA._

_2026-06-13 — IMP-019 COMPLETE (shipped OTA) — Round 4 `NightRays` hero owner-approved + promoted. `DARK_THEME` set to `'v2'`; default-guard test updated (`'classic'`→`'v2'`). `npm test` → **154 passed, 20 suites**. Committed with `Release-Lane: ota` trailer — CI will ship to `production` on owner approval. Dark mode is now: true-black AMOLED canvas, near-black elevated cards + hairline borders, amber-only accents, rotating golden sunburst + warm central bloom behind the glowing streak number. Revert anytime: flip `DARK_THEME='classic'` + OTA._

_2026-06-13 (workflow optimization, Opus) — Restructured the cross-chat docs to stop PROGRESS.md bloat: split into 3 tiers by read-frequency. PROGRESS.md = lean live cursor (backlog table + open specs + blockers + 2 notes). New `docs/playbook.md` = stable reference (locked decisions, release/signing rules, parked phases 8/10b/11, config, architecture, IMP template). `docs/build-log.md` = archive — moved IMP-006 + IMP-013–019 full specs there (they were code-complete but never archived → the bloat). DEVGUIDE updated for the new file map + a hard size budget. No progress lost (git is the full record). NEXT: owner is bringing a list of new things to add → Opus scopes them as new IMP blocks in the "Open task specs" section above._

_2026-06-14 — IMP-020 COMPLETE (code-complete; device smoke test owner-pending). Backup / Restore — first piece of the "legacy" roadmap (D). Built the full 8-task plan TDD-first: pure core under `src/backup/` (`backup.js` envelope build + validating parse = the single validation boundary, reusing `serialize`/`deserialize`; `lastBackupLabel.js` subtitle; `importFlow.js` recovery-before-replace guarantee) all unit-tested, plus a thin native `io.js` over `expo-file-system`/`expo-sharing`/`expo-document-picker`. Wired `doExport`/`doImport`/`explainAutoBackup` into `RitualsApp.js`, `handleReplaceAllData` + remount `key` into `App.js`, and a new "Your journal is safe" section into `YouScreen.js` (PDF stub relabeled "Save as PDF" — the word "Export" now appears nowhere on the You tab). Import REPLACES but writes a recovery envelope FIRST (never replaces if that write throws). `npm test` → **171 passed, 23 suites** (3 new backup suites: 9+5+2, + 1 state case). `npx expo export --platform android` bundles clean. `npm run bump:build` → versionCode **6**. 8 commits 675e520…08e3d2e; **no `Release-Lane` trailer** (owner hasn't asked to ship). Full spec archived to build-log. NEXT: owner device/emulator smoke test (export→save→restore→recovery; non-backup error toast; settings deep-link) — same gate as IMP-006, the two ride one BUILD shipment. Then legacy roadmap A+B (days-captured hero + Lifetime Progress)._

_2026-06-14 — IMP-023 COMPLETE (code-complete; OTA lane; no ship trailer). Dynamic daily text — owner wanted the app to stay fully offline but have the greeting + some text vary daily. Two offline rotating slots: (1) multilingual hello headline — stateless date-seeded pick from HELLOS ×16; English time-of-day demoted to subtitle; header rebuilt as Layout A; (2) daily reflection prompt in the write card via a persisted no-repeat deck over PROMPTS ×60 (≈2-month recycle). New pure modules src/time/dailyPick.js, src/content/{greetings,prompts,deck}.js (all TDD'd); promptDeck added to PERSISTED_KEYS. npm test → 218 passed, 29 suites. npx expo export --platform android bundles clean. 7 commits f7ae548…5f686f8, merged to main._

_2026-06-18 — IMP-024 COMPLETE (code-complete; OTA lane; no ship trailer). Streak now derives from real entries — new pure currentStreak(keys, todayKey) in src/insights/dateKeys.js; RitualsApp.js streak is useMemo; setStreak + streak persistence all removed. npm test → 250 passed, 32 suites. Commit ac3f3c6._

_2026-06-18 — IMP-025 COMPLETE (code-complete; OTA lane; no ship trailer). Editable display name — sanitizeName pure helper (trim, cap 40, null if blank) + NameEditModal (bottom-sheet, TextInput prefilled, Save/Cancel) + "Your name" row in YouScreen Preferences. npm test → 257 passed, 32 suites. Commit 74965c8._

_2026-06-18 — IMP-026 COMPLETE (code-complete; OTA lane; no ship trailer). Gamification is now always on — deleted the `Gamification` Switch row + `setGamify` handler + `Diamond`/`Switch` imports from `YouScreen.js`; `gamify: true` from `DEFAULT_SETTINGS` in `theme.js`; `const gamify = settings.gamify !== false;` from `RitualsApp.js`; and `gamify` prop from `HomeScreen` + `ArchiveScreen`. Unwrapped all 4 `{gamify && …}` blocks in `HomeScreen` (streak hero, quests, week strip, badges) to always render; deleted the `{!gamify && …}` "gentle peek" fallback + now-unused `SAMPLE_ENTRIES` import. `ArchiveScreen`: heatmap and mood chips always show. Dev harness: `gamify` knob removed from `DevPanel.js` + `buildState.js`. Old installs with a stale `settings.gamify` in AsyncStorage are harmless — nothing reads it (no migration needed). `npm test` → **257 passed, 32 suites** (unchanged). Commit `fd887c0`._

_2026-07-30 — IMP-027 COMPLETE (code-complete; BUILD lane; no ship trailer) + consistency pass. Expo SDK 51→54 for `targetSdkVersion 36` (Play API-36 deadline 2026-08-31). Full detail in the IMP-027 archive block above. Headlines: expo `^54` (54.0.36) / RN 0.81.5 / React 19.1.0 / jest-expo 54; compile+target SDK 36 + `buildToolsVersion 36.0.0`; **Legacy Architecture held** via top-level `expo.newArchEnabled: false` (canonical SDK-54 field — deviates from spec step 3b, which said the build-properties block; deprecated option intentionally unset). `src/backup/io.js` → `expo-file-system/legacy`. `postinstall` patch **kept** — verified against the pristine `expo-modules-core@3.0.30` tarball that the `requestedPermissions!!` bug persists upstream — and moved to `scripts/patch-permissions.js`, now three-state + **loud non-zero exit** instead of `try/catch{}` (was silently no-opping by design flaw). Owner-reported visual regression fixed: the night-v2 `Card` sheen was banding into "colour blocks" on every screen because a 6%→0% alpha ramp (~15 of 255 steps) was stretched over half of each card's height; SDK 51 had dithered it, SDK 54's hardware path does not. Now a fixed 48dp top strip (`CARD_SHEEN`). **Not** an expo-linear-gradient bug — changelog shows no user-facing change 13→15; an earlier `borderRadius` fix based on that premise was reverted. Docs reconciled: `playbook.md` SDK block (35→36, versionCode 4→9, stack + architecture + postinstall notes added), stale "API 35 / 23-23" guidance in the 2026-06-06 build-log note marked superseded, IMP-022 spec annotated with the `/legacy` import. `npm test` → **262 passed, 34 suites** (from 257/32; zero product-logic changes). `npx expo export --platform android` clean. `npm run bump:native` → **v1.0.3 / versionCode 9**. ⏳ Owner-pending: local Android build on compileSdk 36 (refresh the `~/.gradle/init.d` kapt fix) + device smoke test incl. **edge-to-edge audit** (Android 16 forces it). NEXT: IMP-022 (Save as PDF + About sheet), now rebased on the SDK-54 baseline._

_2026-07-29 — RevenueCat SDK bump (BUILD lane; SHIPPED — build 8). Google Play flagged the transitive native `com.revenuecat.purchases:purchases:10.6.1` critical note ("makes unnecessary API calls; update"), 90-day grace. Root cause: `react-native-purchases@10.2.0` → `purchases-hybrid-common:18.8.0` → native `purchases:10.6.1`. Fix: bumped `react-native-purchases` + `-ui` `^10.2.0`→`^10.5.0` (verified via Maven POM: 10.5.0 → hybrid-common 18.26.0 → native `purchases:10.15.1`, clean). No app-code changes — the API surface used (`getOfferings`/`purchasePackage`/`getCustomerInfo`/`restorePurchases`/`presentCustomerCenter`) is unchanged across the 10.x minor line; peer-req RN ≥0.73 (on 0.74.5). `npm run bump:native` → v1.0.2 / versionCode 8. `npm test` → **257 passed, 32 suites**. Fast-forwarded `main` to `feat/dev-test-harness` (13 unpushed commits) + pushed → CI test gate → owner one-tap approval pending. Commit `7ae757a`, trailer `Release-Lane: build`._

_2026-07-30 (launch) — **🚀 v1.0.3 / versionCode 9 submitted to PRODUCTION review** (owner) + a docs reconciliation pass. This is the free public launch: `PLUS_ENABLED = false`, so the build carries no payment surface at all. Three facts changed by it and now reflected everywhere: **(1) IMP-027 is SHIPPED, not code-complete** — the native build on `compileSdkVersion 36` demonstrably worked, so the `~/.gradle/init.d` kapt tmpdir fix held on SDK 54's newer Kotlin/kapt without a rewrite, and **API-36 compliance is met a month ahead of the 2026-08-31 deadline**; build 8 is superseded and no longer waiting on anything. **(2) The BillDesk deadlock is unblocking** — this upload is what mints the public Play Store URL BillDesk PA-CB verification wants; hand it `https://play.google.com/store/apps/details?id=app.dailyrituals.mobile` (worth trying before review completes). **(3) IMP-022's conditional version-bump rule is now RESOLVED to "must bump"** — it was written as "ride versionCode 9 if it hasn't shipped"; 9 has shipped, so IMP-022 runs `npm run bump:native`. Open items were restructured from a flat list into **In flight / Owner device verification / Phase 10b / Parked**, because the accumulated per-IMP device-verification items (IMP-006, 020, 021, 027) are one runtime walk on the live build, not four separate blockers — the edge-to-edge audit is the one that matters most. IMP-028's full detail archived to build-log per the size budget. No code changed this session; `npm test` still **286 passed, 36 suites**. Also this session: **the BillDesk application was submitted** (2026-07-30) now that the production push supplied the Play Store URL it wanted — recorded as submitted-not-yet-verified, since products cannot be activated until the payments profile is actually approved. The owner then walked the production build: **edge-to-edge ✅, manual backup/restore ✅, and Android Auto Backup ✅** — uninstall→reinstall auto-restored with no login, closing IMP-006, IMP-020 and IMP-027. The restored data was stale ("older data before today"), which is the **documented Auto Backup contract** (≤once/24h, idle+charging+Wi-Fi), **not a defect** — but it surfaced that the restore is **silent**, now scoped as **IMP-029**. NEXT: IMP-022 then IMP-029, shipped in one BUILD._

_2026-07-30 (billing) — **IMP-028: billing correctness pass** (OTA lane; no ship trailer). Owner asked to enable + real-transaction-test payments before the public push, so the whole billing seam was audited. The seam itself is sound (`Purchases.configure()` correctly called + gated in `App.js`; metro purchases stub is web-only). **Three real defects found and fixed:** the paywall rendered **hardcoded USD** while Google charges the local Play price and `getPrices()` was dead code (now live-driven via new `src/billing/prices.js` + `useLivePrices.js`); an **EAS cloud build would have silently shipped the purchase simulation**, faking successful purchases and granting Plus free (now a hard `scripts/check-billing-config.js` preflight in `release.yml`); and `CancelSheet` showed a hardcoded renew date. The **"7-day free trial" claim was deliberately left hardcoded** — the correct fix reads the trial period off a live offering, which cannot exist until Play products do. `npm test` → **286 passed, 36 suites** (+24, zero product-logic changes); `expo export` clean. **Headline finding was not code:** BillDesk wants the live Play Store URL, which deadlocked "hold the launch until payments work". Full detail in [`docs/build-log.md`](docs/build-log.md) → IMP-028._


---

## Resolved findings + closed walk debts (moved out of PROGRESS.md 2026-08-13)

> All of these are **settled**. Kept verbatim because the reasoning is worth having when a
> similar report arrives — especially the Auto-Backup-vs-JSON-export confusion, which the
> owner themselves hit once. Live blockers stay in `PROGRESS.md`.

### 🔴 WALK-04 finding — search + moods → **both scoped specs landed** (IMP-065 + IMP-066, 2026-08-15) — ✅ RESOLVED

(d) was not a `toggleMood` bug — the mood-step `ScrollView` was missing `keyboardShouldPersistTaps="handled"`,
swallowing the first tap while the keyboard was open. (e) the custom-mood block is now one headed, numbered
group; the name field strips emoji instead of rejecting them. Full writeups archived with each spec above.
**WALK-04 stays ❌ in `docs/walk-open.md`** — re-run it whole; both specs have landed.

### 🔴 WALK-06 finding — streak insurance → **both scoped specs landed** (IMP-063 + IMP-064, 2026-08-15) — ✅ RESOLVED

**Standing rule that outlives this finding:** the owner's objection to the candle-spent copy generalises —
**the user must never be unsure what happened, what changed, or how a feature works.** Read that into any
future copy review, not just the freeze card. Full writeup archived with each spec above.
**WALK-06 stays ❌ in `docs/walk-open.md`** — re-run it whole; both specs have landed.

### 🔴 WALK-07 finding — modal scroll → (b)(c) landed via IMP-067; (a) landed via IMP-074 — ✅ RESOLVED 2026-08-16

(b)(c) `Row` truncation + Mood Mix bar misalignment → IMP-067, landed clean. (a) Paywall footer overlap →
IMP-068 fixed the *static* case with `style={{ flex: 1 }}` on the `ScrollView` (`Paywall.js:46`), but that
alone was the same trap `Shop.js:23-29` documents: Android's Modal is a `Dialog` whose window size is unknown
on the first measure pass, so `flex: 1` bounds nothing there on that first pass. **Scoped spec landed**
(IMP-074, 2026-08-16, `87ab21c`) — the outer `View` now also caps at `maxHeight: winH` via
`useWindowDimensions()`, mirroring `Shop.js:23-29`/`52`. Full writeup archived with the spec above.
**WALK-07 stays ❌ in `docs/walk-open.md`** — re-run it whole; the spec has landed.

### 🔴 WALK-09 finding — lifetime heatmap: legend wrap, month-label wrap, uneven cell size → **scoped spec landed** (IMP-073, 2026-08-16) — ✅ RESOLVED

All three defects — the 4-entry legend wrapping, month labels wrapping mid-word, and grid cells rendering at
inconsistent sizes — were one spec. The owner's call from the walk (drop "not yet started" from the legend
rather than patch its wrap) is the design that landed. Full writeup archived with the spec above.
**WALK-09 stays ❌ in `docs/walk-open.md`** — re-run it whole; the spec has landed.

### 🔴 Finding 2026-08-02 (from the IMP-029 walk) — the OS restores without asking, and the notice gives no way to refuse

The owner's words: *"the app is restored automatically (with no option given to me, it was done without permission — definitely need to change this)."* The complaint is legitimate, but only half of it is fixable:

- **Not fixable — the restore itself.** Android Auto Backup restore happens **at install time, inside the OS**, before the app's first line of JS runs. There is no API to prompt before it, intercept it, or defer it. `BackupAgent.onRestoreFinished()` fires *after* the data has already landed. The only OS-level lever is `allowBackup: false` in [`app.config.js:49`](app.config.js#L49), which deletes the whole "new phone, my journal came back" feature IMP-006 was built for. **Do not propose an "ask before restoring" flow — it cannot be built.**
- **Fixable — what happens next.** [`RestoreNotice.js`](../src/screens/RestoreNotice.js) offers exactly two actions: **Got it** (accept) and **Restore from a file** (replace from JSON). There is **no way to reject the restored data**. A user handed a stale restore who wants to start clean has to find You tab → Reset all data on their own, and the notice never mentions it.

**✅ RESOLVED — scoped as [IMP-033](docs/specs-open.md#imp-033--the-restore-is-offered-not-imposed), an open task.** The owner rejected a mere "Start fresh" button in favour of a stronger design: **quarantine** the OS-restored payload, run the app as a genuine first install (onboarding and all), then **offer** the backup with fair warnings once onboarding is done. Full spec in [`docs/specs-open.md`](docs/specs-open.md).

### 🟠 Duplicate-reminder fix landed outside the backlog (2026-08-13, `b773352`) — ✅ RESOLVED, IMP-054 landed on it correctly

A live defect in IMP-031's subsystem, found outside a spec and fixed as a plain `fix(reminders)` commit.
`rearmReminders` cancels all pending notifications then re-schedules the window; overlapping triggers (a
save mid-flight, `active` firing twice) meant two runs each cancelled then each scheduled, leaving **two
notifications per day at the same minute**. Fixed on two levels: `reminderId(date)` →
`rituals-reminder-{dayKey}` makes scheduling idempotent, and a `rearmLock` ref chains the runs.

**It moved a signature IMP-054 depended on.** That spec said to thread `data` through
`scheduleAt(date, { title, body, data })`. The real signature was already
**`scheduleAt(date, { title, body }, identifier)`** — a third *positional* argument that is load-bearing.
`data` still goes in the second argument, so both compose: `scheduleAt(date, { title, body, data }, identifier)`.
**Dropping `identifier` would have silently restored the duplicate fire.** IMP-054 (see its own build-log
entry) composed both correctly. **WALK-13** still proves it on a running app.

### 🟡 Finding 2026-08-02 — "Back up my journal" says nothing about the Google backup at the moment of use

Owner: *"When I press 'Backup my journal' it gives me the option to send or share it… but no mention of a 'google backup'."* The surface **does** exist — [`YouScreen.js:130`](../src/screens/YouScreen.js#L130) renders an **"Automatic backup / How it works"** row directly *above* "Back up my journal" in the same "Your journal is safe" card, wired to `explainAutoBackup` ([`RitualsApp.js:385`](../src/RitualsApp.js#L385)). So this is discoverability, not absence: the two backups are separate systems and the export flow never says so at the moment the user is thinking about backups. Small copy fix, bundle with IMP-033.

**⚠️ The trap this walk exposed — and the confirmed cause of the "2 entries vs 5" staleness.** The owner tapped the in-app **"Back up my journal"** before uninstalling, which is the **JSON export and has ZERO effect on the Google backup.** They are unrelated systems. Exporting a JSON does not refresh what Auto Backup holds; the Google copy refreshes only on the OS's own schedule (≤once/24h, idle + charging + unmetered Wi-Fi) or via **Settings → Google → Backup → Back up now**. So the restore returned whatever the OS last took on its own — **correct behaviour, correctly announced by the notice.** If a naming-literate owner misread this, users certainly will: the copy fix is step 6 of IMP-033. Any future staleness report must first establish *which* backup was taken.
- **▶️ NEXT DECISION FOR THE OWNER: promote vc11 alpha → production, or hold.** Testers have five unreleased features; the public has none of them. Nothing blocks the promotion technically — it is a judgement call about how much tester feedback to collect first. Until it happens, treat every vc11 feature as unshipped from the public's point of view.

### ✅ Owner device verification — WALKED 2026-07-30 (on v1.0.3)

- **IMP-027 (SDK 54) — ✅ PASSED.** Edge-to-edge is clean across the app; no status/nav-bar overlap on any custom header or the tab bar. This was the highest-risk item in the SDK 54 upgrade (Android 16 forces edge-to-edge and SDK 54 can no longer opt out) and it is now closed.
- **IMP-020 (Backup / Restore) — ✅ PASSED.** JSON export → share out (owner uploads to Drive manually) → restore from the file all work.
- **IMP-006 (Android Auto Backup) — ✅ PASSED, with a UX finding.** Uninstall → reinstall **did** auto-restore with no login, which is exactly the feature. The restored data was **stale ("older data before today")** — that is the documented Android Auto Backup contract, **not a defect**: it runs at most **once per 24h**, and only while the device is **idle + charging + on unmetered Wi-Fi**, so anything written since the last successful backup is not in it. Config is correct (`android:allowBackup="true"`, no custom rules, per the IMP-006 spec). **The real problem is that the restore is silent** — see the open finding below.
### 🔎 The auto-restore is silent — ✅ scoped and code-complete as **IMP-029** (full detail in build-log; unwalked on-device)

### 🔔 New finding 2026-07-31 — no `setNotificationHandler` anywhere in the tree

`grep -rn "setNotificationHandler"` returns **zero matches**. Under `expo-notifications`' default behaviour that means a reminder firing while the app is **foregrounded displays nothing on Android**. For a daily reminder that is mostly harmless (the app is normally backgrounded when it fires), but it is a real product decision that was never made, and it changes how IMP-031 must be tested: a test notification only proves anything if the app is backgrounded before it fires. **Deliberately out of scope for IMP-032** (that task must not change shipping behaviour) — scope it as its own small task if the owner wants foreground reminders to surface.

- **Device-walk debts — ✅ MOSTLY CLOSED on real hardware 2026-08-02. One remains (IMP-044, unwalked).**

  - ✅ **IMP-030 — PASSED on a real device.** The ~4% anchor-1 margin (235 vs 245dp) held on real font metrics; no need to lower the `0.48` glyph ratio.
  - ✅ **IMP-031 — PASSED on a real device**, including the backgrounded case (the one the emulator could not settle, since without `setNotificationHandler` a foregrounded reminder shows nothing on Android).
  - ✅ **IMP-032 — harness walked on a real device.** Sections, knobs, Apply/confirm and the Inspector all exercised.
  - ✅ **IMP-021 — walked 2026-08-02, owner called it "not properly completed"; both shortfalls closed by [IMP-045](docs/build-log.md), code-complete 2026-08-09.** Full detail archived in `docs/build-log.md`. **Not yet re-walked on device** — the fix is OTA and testers will see it on the next `eas update`.

  - ✅ **IMP-029 — PASSED on a real device.** The owner ran a true uninstall → reinstall cycle; Auto Backup restored silently at install time and the app fired the "Welcome back." notice naming the backup's date. The restored data was **stale (2 entries vs the 5 that were live)** — which is the feature working, not failing: that staleness is exactly the hazard the notice exists to announce. Two follow-on findings came out of the walk (see below). Procedure kept in [`docs/build-log.md`](docs/build-log.md) → IMP-029 → "Device-walk procedure" for future regressions.

---

## Walk log (passed walks, moved out of docs/walk-open.md)

### ✅ WALK-01 — v2→v3 mood migration — PASSED 2026-08-14 (emulator, agent-run)

**Covers:** IMP-037's `SCHEMA_VERSION` 2→3 (`mood: string` → `moods: string[]`). Steps 1–2 had already passed 2026-08-09; this run completed steps 3–9, which were the actual point of the walk (mood-chip correctness on migrated data).

**Setup:** `node scripts/gen-v2-fixture.js` regenerated, pushed to `/sdcard/Download/`. App reset via You → Reset all data (non-negotiable per the walk doc — clears the 2026-08-09 attempt's poisoned settings), fresh onboarding completed, then You → Restore from a backup → picked the fixture → REPLACE.

**Result — full pass, all 9 steps:**
1. Restore dialog read "This backup has 12 entries" → REPLACE.
2. Archive/Home matched the spec's expected values exactly: **12-day streak, "Migration Test", 375 embers, 2 candles, Lv 4 · Reflective.**
3. **Mood chips correct on every shape the fixture covers:** the two-mood entry (8 Aug, "finished the book") rendered **both** `Hopeful` and `Tender` chips; both no-mood entries (10 Aug "sat in the sun", 6 Aug "planted basil") rendered **zero** chips — no blank/empty chip anywhere across all 12 entries.
4. Insights → Mood mix read **"across 10 reflections"** (12 entries − 2 no-mood = 10) with a 7-mood breakdown summing to 11 tags (10 single + 1 double) — denominator and counts both correct.
5. The Reflections "Last 5 weeks" grid renders each day's `moods[0]` as a coloured emoji cell (not just kept/missed) — confirmed visually.
6. Mood-chip filtering is any-of on the two-mood entry: filtering by `Tender` returned 2 matches including 8 Aug; filtering by `Hopeful` returned 1 match, the same 8 Aug entry. Free-text search also verified (`basil` → 1 match, highlighted).
7. Wrote today's entry through the full flow: multi-select confirmed (Grateful + Restless both stayed selected simultaneously), saved cleanly ("Today is at rest."), and the **"Name how it felt" rite ticked** (2 of 3 kept today).
8. **Force-stop + relaunch: clean cold read.** 13-day streak, 390 embers, today still marked at rest, rites intact — no crash, no re-migration prompt. This is the real proof that the v2 payload was migrated and written back as v3 correctly.
9. Harness → Inspector: **Schema version: 3**, `dayKey drift: 0`, and every field the fixture deliberately omitted (`customMoods`, `customMoodEmoji`, `pendingFreezeNotice`, `onThisDayDismissed`) rendered as an empty collection, not `undefined` — the `?? []` fallbacks hold on genuinely old data. Also reconfirmed the 2026-08-09 fixture fix: `accent` deserializes as the `["#f59e0b","#d97706","#fef3c7"]` **array** the app expects, not the string that broke every gradient last time.

**Note on step 9's literal field names:** the original walk spec named `frozenDays` / `seenTips` / `trash` explicitly; the current Inspector (grown since IMP-055/058) no longer exposes those three as flat top-level keys. Checked the equivalent fields that do exist instead — all pass the same "empty, not undefined" bar the step was testing for.

**No app defects found.** WALK-01 is fully closed.

### ✅ WALK-02 — restore quarantine — PASSED 2026-08-15 (emulator, owner-run)

**Covers:** IMP-033 (quarantine + offer), IMP-029 (the restore notice) and **IMP-062**. The riskiest new code in the batch — it clears the live storage key. **🚦 Was the last remaining gate on this list before WALK-05.**

**Context:** failed 2026-08-14 at step 3's "Restore from a file" — the import worked but the offer didn't settle. That failure scoped IMP-062, which fixed the real defect (`pendingRestore` only read inside quarantine's one-shot branch, so the sheet and the You-tab `Google backup — {date}` row vanished after a single session while the stash stayed in storage, unloadable and undiscardable). IMP-062 landed `ba8e684`.

**Result — full pass, all 9 steps, run fresh from step 1 per the doc's instruction (the 2026-08-14 partial pass didn't count):**
1. After T4 (backdated clock + autosave + force-stop + relaunch), the app came up as a genuine first install — full onboarding, zero entries, no name.
2. RestoreOffer sheet appeared on finishing onboarding, stating the fresh-start replacement, the dated staleness, and the paid-inventory line.
3. All three actions passed on separate T4 cycles: **Load my journal** returned old data intact and consumed the stash; **Restore from a file** held the sheet through two back-outs (picker and Replace-confirm) — the IMP-062 fix specifically — then completed without destroying the Google stash; **Keep this fresh start** hid the sheet without destroying the stash.
4. The You-tab `Google backup — {date}` row reopened the sheet on tap, with a separate Discard confirm repeating the inventory line.
5. Force-stop + relaunch after declining left the stash and row untouched.
6. Setting `lastBackupAt` newer than the stash via the harness inverted the sheet's emphasis to lead with "Restore from a file," as `preferredSource` intends.
7. **The IMP-062 proof:** relaunching after each of the four answers behaved correctly — sheet stayed suppressed with the row intact after "Keep fresh start" and after a completed file-restore; both sheet and row were gone for good after "Load" and after "Discard."
8. Reopening the sheet from the You-tab row, backing out without choosing, then force-stopping and relaunching left the sheet suppressed and the row intact — the persisted answer held.
9. A second T4 cycle on the already-answered install (a fresh stash written on top) brought the sheet back, confirming a suppressed second offer doesn't happen — the exact data-loss case this flow exists to prevent.

**No app defects found.** WALK-02 is fully closed.

### ✅ WALK-05 — custody of your words — PASSED 2026-08-15 (emulator, owner-run)

**Covers:** IMP-036, IMP-048. **🚦 Gated the release build** — the outstanding half risked silently corrupting a user's XP/ember totals, which no OTA can undo after the fact. The trash-allowance half passed 2026-08-09 (three free restores tick down, the fourth locks and explains itself, state survives a relaunch — IMP-048 was written from that walk).

**Result — the outstanding `applyCompletion` half, run 2026-08-15:** owner confirmed all four remaining steps pass as specced — editing a past entry (with today written, and with today unwritten) leaves XP and ember counts unchanged with no duplicate row; deleting a mid-streak day shows the real post-delete streak and only warns about a keepsake when one is genuinely at risk; and `pruneTrash` drops a 31-day-old item on the next launch after the clock is moved forward. Reported tersely ("works as intended") rather than step-by-step, so this entry records a full pass without the per-step blow-by-blow the earlier walks have.

**No app defects found.** WALK-05 is fully closed.

### ✅ WALK-04 — search + moods — PASSED 2026-08-16 (emulator, owner-run, third re-run)

**Covers:** IMP-035, IMP-037, IMP-053. Needs ~15 entries (harness) with varied moods.

1. Archive → search filters live across **both** `did` and `wished`.
2. Case-insensitive; accented input matches unaccented text and back (`cafe` vs `café`) — the `normalize`
   fallback is Hermes-dependent, so this must be checked on-device, not assumed.
3. Mood chips are **multi-select** (any-of); the date range opens a month list; "Any time" clears.
4. Zero results shows *"Nothing matches that yet…"* — **different copy** from the zero-entries
   *"Nothing here yet."*
5. **The heatmap does not react to the filters** — it is the record of the year, not of the query.
6. Write flow: pick **multiple** moods; add a **custom** one via "Name your own…"; it persists and
   reappears as a chip next session; adding it twice dedups.

**Result — ❌ 2026-08-15 (first pass).** Steps 1-5's base behavior passed (both-field search, accent-folding,
multi-select OR filtering, zero-results copy, heatmap non-reactivity, dedup on repeat custom-mood add). Five
defects surfaced: (a) the `wished ·` snippet prefix's asymmetry with `did` is a design question, not confirmed
as a bug; (b) the Archive search bar has no way to clear typed text; (c) selected mood filter chips don't move
to the front, so deselecting one picked late in the list means scrolling back to find it; (d) the owner could
not deselect an already-picked mood in WriteFlow's "How did the day feel?" step; (e) the custom-mood creation
row reads as unclear/oddly-placed, and the name field takes emoji with no character filtering.

**Result — ❌ 2026-08-15 (re-run, after IMP-065 + IMP-066 landed).** Steps 1-5 confirmed passing again, and
old finding (e)'s emoji-filtering-in-the-name-field bug is fixed. Three defects surfaced on this pass:

- **(f) The custom-mood "face" field still takes unlimited emoji, and nothing tells the user what the block
  is for.** IMP-066 restructured the block and sanitized the *name* field, but the typed-emoji *face* field
  itself was left untouched.
- **(g) Regression in the mood-chip fix itself (IMP-065).** The row auto-scrolling back to `x: 0` on every
  select meant picking a second or third filter required scrolling right again each time.
- **(h) WriteFlow mood deselect is still broken post-IMP-066**, despite a passing regression test — live
  behavior didn't toggle off a selected chip.

**Scoped 2026-08-15: (h) → IMP-069, (f) → IMP-070, (g) → IMP-071.**

**Result — ✅ 2026-08-16 (full pass, after IMP-069 + IMP-070 + IMP-071 all landed).** All base behavior
(steps 1–5) and both the WriteFlow mood-deselect fix (h/IMP-069, including the "N chosen" line updating
correctly on deselect) and the mood-chip front-sort-without-autoscroll fix (g/IMP-071) confirmed passing
live. Two more defects surfaced on this pass, in the custom-mood face field specifically, and were fixed
**live in the same chat at the owner's explicit direction** rather than scoped as a separate spec: the
mood-question copy ("Pick at least one — tap a chosen one again to take it back.") wrapped to two lines
when empty but one line once a mood was picked, shifting the whole page; and the face field's typed-emoji
placeholder ("or any emoji…") clipped to "or any" at the field's width. Fixing the placeholder truncation
led to a UI iteration (circular field sized to match the palette swatches, a "+" placeholder in
`c.accent`) and, along the way, to finding a **real pre-existing bug**: typing a second emoji into the
face field never replaced the first, because `onEmojiTyped` took `firstEmoji()` of the raw accumulated
buffer instead of stripping the already-shown prefix first. Fixed, with a regression test that fails
without the fix. A follow-up visual "shake" during the swap (Android auto-scrolling the field to fit a
momentary two-emoji string, then snapping back) was fixed by decoupling the `TextInput`'s own width from
the visible circle (wider input, clipped by an `overflow: hidden` wrapper) rather than by force-clearing
the native buffer — that approach was tried first and reverted, since it desynced the Android IME's
emoji-composing state and silently dropped the second keystroke. All of this is **IMP-072** in
`PROGRESS.md`'s backlog table, code-complete and walked in the same session (commit `44197e9`) — it has no
entry in `specs-open.md`/`build-log.md`'s spec archive since it skipped the normal Opus-scoping step.

**WALK-04 is fully closed.**

### ✅ WALK-06 — streak insurance — PASSED 2026-08-16 (emulator, owner-run, re-run after IMP-063 + IMP-064)

**Covers:** IMP-039, IMP-063, IMP-064. Failed 2026-08-15 on four UX defects — the candle count always rendering as 3 icons regardless of the real total, verbose auto-freeze spend copy, and a frozen day sharing the same 💀 glyph as a truly missed one. IMP-063 and IMP-064 both landed 2026-08-15 to fix them.

**Result — full pass, all original steps plus the two new checks:** `applyAutoFreeze` survives the `lapsed` scenario on relaunch; freezes decrement exactly one per missed day; a gap longer than candles owned freezes only the affordable prefix and still breaks the streak, spending the candles anyway; a second relaunch is idempotent; the celebration streak matches the Home hero after a post-freeze write; shop copy reads the corrected "a candle spends itself the moment you miss a day" line. The two IMP-063/064 fixes both confirmed live: a frozen day now renders a visually distinct state from a missed day on Home/Archive/Insights, and the candle icon row now reflects the real freeze count instead of a fixed three.

**No app defects found.** WALK-06 is fully closed.

### ✅ WALK-10 — teach the app — PASSED 2026-08-16 (emulator, owner-run)

**Covers:** IMP-041.

**Result — full pass, all four steps.** Tip cards appear one at a time on Today, Archive and You (not
Insights); dismissing one clears it and it stays gone after a relaunch. "How it works" (You tab) has six
rows, each opening a real, non-empty alert. Rites footer reads the corrected copy — *"All rites kept — a
full day."* / *"{n} of 3 kept today."* — with no embers claim. Archive at zero entries shows "Nothing here
yet."; the Insights empty state carries its second line.

**No app defects found. WALK-10 is fully closed as specified.**

**Owner feedback surfaced during the walk, not a defect:** the owner does not want the dismissible tip
cards at all, regardless of correctness — decided while walking, not a bug in what shipped. Direction taken
(via `AskUserQuestion`): drop `TipCard` from Today/Archive/You entirely and rely solely on "How it works"
for the same content, rather than relocating the cards or keeping them on-demand. Logged as a live open item
in `PROGRESS.md` → Open items, reserving **IMP-075** for Opus to scope — not written up as a full spec here
since this is a design reversal, not a runtime finding.
