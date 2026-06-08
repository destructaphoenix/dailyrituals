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

