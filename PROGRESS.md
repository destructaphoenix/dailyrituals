# Daily Rituals — Build Progress (live cursor)

> **The memory between chats. Read top-to-bottom every chat — and keep it SMALL.** This file is only:
> the backlog table, any **open** IMP spec(s), live blockers, and the **2 newest** session notes.
>
> - Stable reference (locked decisions, release + signing rules, parked phases 8/10b/11, config, architecture) → [`docs/playbook.md`](docs/playbook.md) — open only when you need it.
> - Finished IMP specs + older session notes → [`docs/build-log.md`](docs/build-log.md). Git is the full record.
> - How to drive a Sonnet chat → [`DEVGUIDE.md`](DEVGUIDE.md).
>
> **Size budget (hard rule):** the moment an IMP task is **code-complete** (don't wait for ship / runtime-walk), MOVE its full block to [`docs/build-log.md`](docs/build-log.md) and leave only its one-line row in the backlog table. If you ever see a ✅ task's full spec still inline here, archive it **before** committing. This is what keeps the file from bloating.

---

## ▶️ ACTIVE TRACK

The live work is the **first unchecked `IMP-xxx` task in the Improvements backlog** below — its full spec is inline (Opus scopes it there; no separate plan file). Work that, **not** the phase ladder (8 / 10b / 11), which is **parked in [`docs/playbook.md`](docs/playbook.md)** until the owner resumes it.

> **▶️ ACTIVE: IMP-032 — dev harness v2** (spec inline below). **Part A ✅ committed** (`e1dc59c`), **Part B ✅ committed** (`4e677d0`) — Parts C–E (inspector, overlay launcher, apply safety) are next. IMP-031 (daily reminder) is ✅ code-complete but **still needs a device walk** — Part B gives the app something to drive/observe notifications with, but nobody has run it on a real device yet. IMP-022 (Save as PDF + About) stays **⏸ deferred by owner decision**; its spec moved to [`docs/build-log.md`](docs/build-log.md) → "⏸ Deferred specs" (still valid, not history) — do not start it without the owner reviving it.

**App status (2026-07-30): 🟢 v1.0.3 / versionCode 9 is REVIEWED, APPROVED and LIVE on the Play Store.** The closed-testing 12×14 gate was cleared 2026-07-29, production access unlocked, the free public release was pushed, and Google has now passed it. This supersedes build 8 (RevenueCat SDK bump), which never needed to publish on its own. Three consequences: **(1) Google Play API-36 compliance (deadline 2026-08-31) is ✅ SHIPPED** — IMP-027's Expo SDK 54 / `targetSdkVersion 36` upgrade is live, so the native build on `compileSdkVersion 36` is proven in production; **(2) the BillDesk deadlock is ✅ UNBLOCKED** — the public Play Store URL that BillDesk PA-CB verification was asking for now exists, which was the gate on all of Phase 10b (payments); **(3) OTA now reaches real users** — `runtimeVersion` is `appVersion` = **1.0.3**, the live version, so an OTA lands on installed devices. Ship OTA fixes promptly and treat regressions as user-visible. The app ships **free**: `PLUS_ENABLED = false`, so there is no payment surface in it at all.

**Current stack:** Expo SDK **54** · React Native **0.81.5** · React **19.1.0** · **Legacy Architecture** (`expo.newArchEnabled: false`, held deliberately — SDK 55 drops Legacy and that migration is its own future task) · `compileSdkVersion`/`targetSdkVersion` **36**, `minSdkVersion` **24** · `npm test` → **345 passed, 41 suites**. Details in [`docs/playbook.md`](docs/playbook.md).

---

## 🔧 Improvements backlog (post-launch — ACTIVE TRACK)

Opus scopes each owner-filed issue into a numbered `IMP-xxx` task (steps + commit message + ship lane all inline). Sonnet picks the **first unchecked** one, executes its steps in order, commits with the given message, ticks the boxes, archives the finished spec, and writes the Last session note.

| ID | Title | Lane | Status |
| --- | --- | --- | --- |
| IMP-001 – IMP-005 | Early post-launch fixes (name on You tab, local greeting/date, centered streak, zero-state + migration, drop login step) | OTA | ✅ shipped — full detail in build-log |
| IMP-006 | Enable + verify Android Auto Backup (new-device restore, no login) | Build (rides v5) | ✅ shipped + **device-verified 2026-07-30** — full detail in build-log |
| IMP-007 | 🔴 Streak no longer stacks on multiple same-day entries (reward once/day; same-day re-write edits) | OTA | ✅ |
| IMP-008 | Real zero-state finish: level from XP, calendar + week strip from real entries, real entry dates | OTA | ✅ |
| IMP-009 | Insights tab from real entries (kill hardcoded STATS/MOOD_MIX/RHYTHM); empty state | OTA | ✅ |
| IMP-010 | Onboarding shows only on first ever launch (persist `onboarded`; returning testers skip it) | OTA | ✅ |
| IMP-011 | Kill the last hardcoded "31 May" — WriteFlow epitaph uses the device's real date | OTA | ✅ |
| IMP-012 | Achievements + Home "Keepsakes" start fresh — derive every `cur`/`earned` from real entries+streak | OTA | ✅ |
| IMP-013 | 🔴 "Tend an old grave" rite starts at 0 for new/reset users + gets a real completion trigger | OTA | ✅ |
| IMP-014 | Missed days show 💀 (skull) instead of a blank cell — week strip + heatmap; only genuinely-missed days | OTA | ✅ |
| IMP-015 | "What should we call you?" is mandatory in onboarding — can't proceed past Personalize blank | OTA | ✅ |
| IMP-016 | Ember/amber flame icon in the header is proportional + centered | OTA | ✅ |
| IMP-017 | Greeting is Good morning / afternoon / evening by the user's local time | OTA | ✅ |
| IMP-018 | Today's reflection is editable — today only — prefilled, with a "Start fresh" reset | OTA | ✅ |
| IMP-019 | Premium true-black AMOLED dark mode + rotating-rays hero, behind a one-line `DARK_THEME` revert flag | OTA | ✅ promoted |
| IMP-020 | Backup / Restore — user-held JSON export (off-device) + restore-by-replace with auto safety copy; surface Android Auto Backup | Build | ✅ shipped + **device-verified 2026-07-30** — full detail in build-log |
| IMP-021 | Lifetime Progress — evolve Insights into "Your record" (days remembered + totals + adaptive heatmap) above "Your patterns"; Home hero untouched | OTA | ✅ code-complete — full detail in build-log |
| IMP-022 | Wire the two dead You-tab buttons: **Save as PDF** (real keepsake export, Plus-gated) + **About Daily Rituals** (real about sheet). Both are currently `onPress={() => {}}` no-ops | Build | ⏸ **deferred 2026-07-31** (owner) — spec parked in build-log → "⏸ Deferred specs", still valid; not the active track |
| IMP-023 | Dynamic daily text — rotating multilingual greeting (header, date-seeded) + daily reflection prompt (write card, no-repeat deck); fully offline; header → Layout A | OTA | ✅ code-complete — full detail in build-log |
| IMP-024 | 🔴 Streak counts real consecutive days — derive from entries (breaks to 0 on a missed day; re-logging after a gap = 1, not prev+1) | OTA | ✅ code-complete — full detail in build-log |
| IMP-025 | Edit your name in the app — make `settings.name` changeable from the You tab (currently only set once in onboarding) | OTA | ✅ code-complete — full detail in build-log |
| IMP-026 | Remove the Gamification toggle entirely — gamification is always on; delete the setting + switch + all `gamify` gating, no residue | OTA | ✅ code-complete — full detail in build-log |
| IMP-027 | 🔴 Upgrade Expo SDK 51→54 to hit `targetSdkVersion 36` (Android 16) — Google Play compliance deadline Aug 31, 2026 | Build | ✅ **shipped** in v1.0.3 / vc 9 (production review) — full detail in build-log |
| IMP-028 | 🔴 Billing correctness pass before any real transaction — live store prices on the paywall (kill hardcoded USD), build-time guard against shipping the purchase simulation, real renew date in the cancel sheet | OTA | ✅ code-complete — full detail in build-log |
| IMP-029 | Tell the user when their data came from a Google backup — a one-time "restored, and it's from {date}" note with a one-tap route to the manual restore | Build | ✅ code-complete — full detail in build-log |
| IMP-030 | 🔴 Layout can't blow out, whatever the text — settings rows auto-stack instead of collapsing to a 1-char-per-line column; app-wide font-scale cap | OTA (A) + Build (B) | ✅ code-complete — full detail in build-log |
| IMP-031 | 🔴 **Daily reminder is real** — the You-tab row advertises "8:30 PM" to every live user and schedules nothing. Local, offline, opt-in reminder notifications | Build | ✅ code-complete — full detail in build-log |
| IMP-032 | **Dev harness v2 — total control + inspection.** Every persisted/settings key reachable from a knob; the notification subsystem drivable *and observable*; hard-to-reach overlays openable; read-only inspector. Dev-only, never ships | Dev-only (no ship) | ⬜ **OPEN — ACTIVE TRACK** (spec below) |

---

## 📋 IMP-032 (OPEN SPEC — ACTIVE TRACK) — Dev harness v2: total control + inspection

**Problem (owner-found).** The dev harness (`src/dev/`, reached by **long-pressing "About Daily Rituals"** on the You tab) reaches roughly a third of the app's state and none of its runtime. Verified against the code, not the docs:

- **The panel exposes 8 controls:** streak, entries, embers, xp, freezes, done, plus, ownAll.
- **`buildState` supports 4 more knobs the panel can't reach:** `gaps`, `palette`, `sky`, `tone` — settable only by picking a preset.
- **3 persisted keys `buildState` never emits:** `mode` (can't load straight into night/AMOLED), `subCanceled` (the ending-soon / resume path), `lastBackupAt` (the "Backed up today / 42 days ago / never" string — the exact row that caused IMP-030 and still owes a device check).
- **`settings` is hardcoded** to `{ ...DEFAULT_SETTINGS, tone }`, so `name` (avatar initial, greeting, the 40-char overflow case), `headlineFont`, `roundness`, `storePurchase` / `storeRestore` (every paywall + restore outcome) and **`reminder`** — i.e. all of IMP-031 — are unreachable.
- **Nothing runtime is reachable at all:** notification permission, what the OS *actually* has scheduled, the IMP-029 restore notice (today it can only be seen by performing a real Google restore + reinstall), celebration/milestone, paywall, manage-subscription, toast.
- **Latent harness bug:** the `palette` knob sets `activePalette` + `ownedPalettes` but leaves `settings.accent` at the amber default. Real users get `retint()` on apply (`RitualsApp.applyPalette`); the harness skips it — so a loaded "marigold" state shows marigold active in the Shop while the whole theme stays amber. **Any palette bug found this way is a false positive.**
- **Apply silently replaces the real journal** — no confirm, no recovery copy — on the same device the owner uses for real journaling.

**Goal.** Every persisted key and every `settings` key reachable from a knob; the notification subsystem drivable **and observable**; the hard-to-reach overlays openable on demand; a read-only inspector showing what the app actually computed. Still **provably absent from release bundles**.

**Non-goals (hold the line — these are deliberate).**
- **No global fake clock.** "Pretend it's tomorrow" would mean injecting `now` into `todayKey()`, `dayNumber()`, `currentStreak`, `nextOccurrences` and every `new Date()` in `RitualsApp` — a wide refactor of shipping code to serve a dev tool. Use the new `endOffset` knob (entries end N days ago) instead; it reaches lapsed-user, broken-streak and stale-backup states without touching prod time handling.
- **No faking OS permission.** `denied` / `Blocked in settings` is reached by revoking notifications in Android settings, full stop. The panel *shows* the real status and links to settings; it never lies about it.
- **No freeform JSON paste-in** (original YAGNI stands). Read-only **export** of the current slice is in scope — it's a bug-report tool, not an input.
- **No unit tests for panel chrome.** Pure cores only, same as harness v1.
- **No persisting dev knobs to storage.** Module-level memo (survives closing the modal, dies on reload) is enough — dev state must never touch the real storage key.
- **Do not add `setNotificationHandler`** as part of this task. See Trap 4 — it's a real product finding, but it's a behaviour change to shipping code and belongs in its own task.

---

### Part A — every persisted + settings key reachable from a knob

**`src/dev/buildState.js`** — add knobs. All output keys must stay inside `PERSISTED_KEYS` (there's a test asserting it; `mode`, `subCanceled`, `lastBackupAt` are all legal members, the rest ride inside `settings`).

| New knob | Writes | Why it matters |
|---|---|---|
| `mode` `'day'\|'night'` | `slice.mode` | load straight into AMOLED dark (IMP-019) |
| `name` | `settings.name` | avatar initial, greeting, and the 40-char overflow case (IMP-030) |
| `endOffset` (days) | shifts `endDayKey` back N days | lapsed user; streak already broken; "wrote 5 days ago" |
| `lastBackupAt` (days ago, `-1` = never) | `slice.lastBackupAt` (ISO or `null`) | **the IMP-030 anchor-1 device debt** — drive `lastBackupLabel` to its longest string |
| `subCanceled` | `slice.subCanceled` | the ending-soon / resume path in `ManageSubscription` |
| `plan` `'monthly'\|'yearly'\|null` | `slice.activePlan` | today it's forced to `'yearly'` whenever `plus` |
| `reminderEnabled` / `reminderHour` / `reminderMinute` | `settings.reminder` | all of IMP-031 |
| `storePurchase` / `storeRestore` | `settings.*` | every paywall + restore outcome (`success\|cancel\|failed\|network\|owned`, `empty\|found`) |
| `headlineFont` / `roundness` | `settings.*` | appearance tokens |
| `textLength` `'short'\|'long'` | entry text pool | stress ReadingSheet / Archive / (future) PDF |
| `gaps` preset `'none'\|'one'\|'scattered'` | `[]` / `[2]` / `[2,5,9]` | skull days, without a freeform array control |

**Fix the accent bug in the same pass:** when `palette` is set, also write that palette's `swatch` into `settings.accent` (look it up in `SHOP_PALETTES`), mirroring what `retint()` does for real users. Add a test asserting `settings.accent` matches the chosen palette's swatch.

**`src/dev/generateEntries.js`** — `buildEntries` gains `textLength`; `'long'` uses a multi-paragraph fixture pool. Keep `entryDateParts` + the real `dateKeys` helpers; keep newest-first ordering.

**`src/dev/scenarios.js`** — extend the preset library to cover the new dimensions. At minimum add: `lapsed` (endOffset 5, reminder on), `reminderOn`, `staleBackup` (lastBackupAt 42 days), `neverBackedUp`, `longName` (40-char name + long text + night mode — the IMP-030 stress case), `canceledSub` (plus + subCanceled), `nightAmoled`, `storeFailure` (`storePurchase: 'failed'`). Existing presets keep their keys and labels — don't rename what already works.

---

### Part B — notification control room (the headline)

**`src/dev/notifyProbe.js`** — dev-only native probe. Lazy-`require('expo-notifications')` inside a try/catch, **exactly** the shape of `src/reminders/io.js` (never a static import — Expo Go on Android has no notification support since SDK 53). Surface: `available()`, `getPermission()`, `requestPermission()`, `listScheduled()` → `getAllScheduledNotificationsAsync()`, `fireTestIn(seconds, { title, body })`, `cancelAll()`. Zero business logic. **Do not modify `src/reminders/io.js`** — the prod surface stays exactly as IMP-031 shipped it; everything new lives in the strippable `src/dev/` subtree.

**`src/dev/inspectNotify.js`** — pure, TDD'd, and the real value of this part: it diffs *intent* against *reality*.
- `describePending(scheduled, now)` → `[{ when, inLabel, title }]` — normalises expo's trigger shapes (`{ type:'date', value }` / `{ date }` / seconds-based) into sorted, human rows. **Normalising defensively is the point** — expo's returned trigger shape differs by platform and SDK; a `?? null` fallback row ("unreadable trigger") beats a crash.
- `diffIntendedVsPending(intended, pending, toleranceMs = 60000)` → `{ matched, missing, extra }`, where `intended` is `nextOccurrences(now, reminder, { wroteToday })` — the same pure function the app schedules from. This answers the only question that matters: *did the OS actually take what we asked for?*

**Panel section — "Notifications".** Rows, top to bottom:
1. **Permission**: live status from the probe + `Request` (only meaningful when `undetermined`) + `Open OS settings` (`Linking.openSettings()`).
2. **Live reminder settings**: enabled toggle + hour/minute steppers that call the app's real `setSettings` — *not* the Apply-a-state-slice path. This exercises `rearmReminders`'s real `[settings.reminder, …]` dependency, which is the thing under test.
3. **Actions**: `Re-arm now` (calls the app's `rearmReminders`), `Cancel all`, `Fire test in 10s` (probe, using the real `reminderCopy(settings.tone)` so you see production copy).
4. **Intended** (from `nextOccurrences`) vs **Pending** (from the OS), side by side, with the diff result. Re-read after every action — never cache.
5. **Row preview**: `reminderRowValue` rendered for all three states (`Off` / a time / `Blocked in settings`) so the copy can be eyeballed without revoking permission.

Wire `onRearmReminders={rearmReminders}` and the live settings setters into `DevPanel` from inside the **existing** `__DEV__ && DevPanel && (…)` JSX block in `RitualsApp.js` — Metro strips that whole subtree, so this costs zero production bytes.

---

### Part C — inspector (read-only truth)

**`src/dev/inspect.js`** — pure, TDD'd. `inspectState(slice, todayKey)` → `[{ group, label, value }]`, grouped: **Journal** (entry count, first/last dayKey, derived `currentStreak`, `longestConsecutiveRun`, wrote-today?), **Progress** (xp, level + name via `levelFromXp`, badges earned via `deriveAchievements`), **Economy** (embers, freezes, plus, plan, canceled), **Cosmetics** (active + owned counts), **Settings** (every key including the full `reminder` object), **Storage** (`lastSavedAt`, schema version, serialized byte length). Deriving these through the *real* helpers is deliberate — the inspector must show what the app computes, not a parallel calculation.

**Device facts** (impure, read in the panel): `Platform.OS` + `Version`; `PixelRatio.getFontScale()` alongside `MAX_FONT_SCALE` / `CHROME_FONT_SCALE` from `src/ui/textScale.js` (so IMP-030 Part B is finally *measurable* — the cap is native and can't be simulated, but you can at least see the scale the app is being handed); `useWindowDimensions()` + safe-area insets; `Constants.expoConfig.version`; `Application.nativeApplicationVersion` / `nativeBuildVersion`; and from **`expo-updates`** (already a dependency) `runtimeVersion`, `channel`, `updateId`, `isEmbeddedLaunch` — which is how you confirm on-device whether an OTA actually landed.

**Export current state**: one button → `backupIO.exportFile('devstate.json', JSON.stringify(slice))`, reusing IMP-020's wrapper. Read-only; no paste-in.

---

### Part D — overlay launcher

Direct-open buttons for what's otherwise hard to reach, all driven by setters that already exist in `RitualsApp` and all wired inside the guarded block: **Celebration** (with a streak + milestone picker — the milestone overlay is otherwise reachable only by hitting a real `STREAK_MILESTONES` day), **Paywall**, **Manage subscription**, **Get Embers**, **Achievements**, **Shop**, **Reminder sheet**, **Toast** (sample message), **Reading sheet** (opens a generated entry), **Restore notice**.

The restore notice is the one that needs a line of production code: `RitualsApp` holds `const [devRestoreMs, setDevRestoreMs] = useState(null)` and renders `restoredAtMs={devRestoreMs ?? restoredFromMs}`. That is **the only prod-visible cost of this whole task** — one inert `useState` — and it buys the ability to walk IMP-029's notice without a real uninstall/restore cycle. Comment it as such.

Note `PLUS_ENABLED` is `false`, so the Paywall and Manage modals are gated `PLUS_ENABLED && …`. The launcher must flip a dev-local override for those two, or say plainly in the UI that they're unavailable while the app ships free — **do not** flip `PLUS_ENABLED` itself.

---

### Part E — safety, ergonomics, no-leak

- **Confirm + recovery before destroying data.** `Apply` and `Reset to fresh` both go through an `Alert.alert` confirm, and `Apply` first writes a recovery copy via `backupIO.writeRecovery(JSON.stringify(createBackup(currentSlice(), …)))` — the same call `runConfirmedImport` already makes. The harness must not be the one tool in the app that can silently eat a real journal.
- **Knob memo.** Hoist the knob object to a module-level `let lastKnobs` in `src/dev/` and seed `useState` from it, so closing the modal doesn't reset ~25 controls. Never persisted.
- **Split the panel** — it will be far too long for one file. `src/dev/DevPanel.js` = shell + collapsible sections only; `src/dev/panel/controls.js` (Stepper / Toggle / Segmented / TextField); `src/dev/panel/StateSection.js`, `NotifySection.js`, `InspectSection.js`, `LaunchSection.js`. **Target ≤ 250 lines per file**, hard cap 400.
- **Sentinel, hardened.** Move `SENTINEL` to `src/dev/sentinel.js`; every new dev module exports `DEV_ID = \`${SENTINEL}/<name>\``, and the panel **renders** the joined id list in a small footer. Rendering them is what stops the minifier dropping unreferenced constants — an unused exported const proves nothing. The grep then covers every dev module, not just `DevPanel`.
- **Document the entry point.** Add a ~6-line "Dev harness" section to [`DEVGUIDE.md`](DEVGUIDE.md): long-press "About Daily Rituals" on the You tab, what each section does, and that it exists only in dev builds. Right now that gesture is written down nowhere.

---

### Traps (repo-specific — read before writing code)

1. **`__DEV__` must stay a literal.** Babel constant-folds only the literal identifier; aliasing it (`const DEV = __DEV__`) defeats the dead-code elimination that strips the whole subtree. Equally fatal: **any static `import` of a `src/dev/*` module from a production file.** Every new dev module must be reachable only through the existing `if (__DEV__) { require('./dev/DevPanel') }`.
2. **`expo-notifications` must be lazy-`require()`d inside try/catch** in the probe, exactly as `src/reminders/io.js` does it. A static import re-introduces the Expo Go crash IMP-031 specifically engineered around.
3. **`rearmReminders` cancels everything it doesn't own.** It runs `cancelAll()` on mount, on `[settings.reminder, settings.tone, entries]` change, *and* on every `AppState` foreground — so a probe-scheduled test notification is wiped by the next foreground. The panel must say this next to the button. It also means the Pending list must be re-read after every action rather than cached.
4. **The app registers no `setNotificationHandler` anywhere** (verified — zero matches in the tree). On Android that means a notification firing while the app is **foregrounded shows nothing**. So `Fire test in 10s` only proves anything if you background the app within those 10 seconds — put that in the button's hint text. **Log this as a finding under Open items; do not fix it here.**
5. **`buildEntries` gap offsets are relative to `endDayKey`, and the loop keeps walking until `count` entries exist** — `gaps: [2,5]` with `count: 6` spans 8 calendar days. A gap extends the span; it does not reduce the entry count.
6. **`buildState` must keep emitting a full `settings` object** (`{ ...DEFAULT_SETTINGS, …overrides }`). `mergeWithDefaults` on the `handleReplaceAllData` path is a shallow top-level spread — a partial `settings` would survive the merge with a half-populated nested `reminder` and crash on read. Same trap IMP-031 hit.
7. **The existing test `every output key is a persisted key` must stay green.** Adding `mode` / `subCanceled` / `lastBackupAt` is fine; anything else needs a `PERSISTED_KEYS` change, which is a persistence decision — **stop and log it** rather than widening the array to suit a dev tool.
8. **Streak is derived, never stored** (IMP-024). There is no `streak` key in the slice; the `streak` knob works by generating a run of entries. Don't "fix" this by adding one back.
9. **The harness entry point is `onLongPress={onOpenDev}` on the "About Daily Rituals" row.** IMP-022 rewrites that row's `onPress`. Whichever lands second must preserve the other's wiring.

---

### Steps (TDD; commit after each part — a credit-limited chat can stop cleanly between them)

**Part A** — 1. RED: extend `__tests__/dev/buildState.test.js` with the new knobs (each table row above), plus the palette→`settings.accent` case; extend `__tests__/dev/generateEntries.test.js` for `textLength` + `endOffset`. 2. GREEN: `buildState.js`, `generateEntries.js`. 3. Extend `scenarios.js` + its test (round-trip assertion must still pass for every new preset). 4. `npm test` green. 5. Commit.

**Part B** — 6. RED: `__tests__/dev/inspectNotify.test.js` — `describePending` across expo's trigger shapes incl. an unreadable one, `diffIntendedVsPending` for matched / missing / extra / within-tolerance. 7. GREEN: `src/dev/inspectNotify.js`. 8. `src/dev/notifyProbe.js` (lazy require, no logic). 9. `NotifySection.js` + wire `rearmReminders` and the live settings setters from the guarded block in `RitualsApp.js`. 10. `npm test` green. 11. Commit. ✅ **DONE — `4e677d0`**

**Parts C–E** — 12. RED: `__tests__/dev/inspect.test.js` for `inspectState` (groups present, derived values match the real helpers, empty-slice case). 13. GREEN: `src/dev/inspect.js`. 14. `InspectSection.js` (+ device facts, + export state). 15. `LaunchSection.js` + the `devRestoreMs` line in `RitualsApp.js`. 16. Safety confirm + recovery copy on Apply/Reset; knob memo; `sentinel.js` + footer ids; panel split into `src/dev/panel/`. 17. DEVGUIDE.md section. 18. `npm test` green. 19. Commit.

**Verification (all three parts done):**
- `npm test` → green (**329 passed, 41 suites** is the current baseline; expect roughly +25).
- `npx expo export --platform android` → exit 0.
- Sentinel grep — **this is the gate, not a formality**:
  ```powershell
  $hits = Select-String -Path dist\**\*.js,dist\**\*.hbc -Pattern 'DEV_HARNESS_SENTINEL_DO_NOT_SHIP' -SimpleMatch -ErrorAction SilentlyContinue
  if ($hits) { Write-Host "LEAK: sentinel found in release bundle"; $hits } else { Write-Host "OK: harness stripped from release bundle" }
  ```
  Expect `OK`. A LEAK means a static import of a `src/dev/*` module crept into a prod file, or `__DEV__` got aliased. Then `Remove-Item -Recurse -Force dist`.
- Emulator walk: long-press About → each section renders → Apply a new preset → confirm prompt appears → state loads → Inspector agrees with what's on screen.

**Commit messages** (one per part):
1. `feat(dev): harness v2 part A — every persisted + settings key reachable from a knob (IMP-032)`
2. `feat(dev): harness v2 part B — notification control room (permission, pending, intent-vs-OS diff) (IMP-032)`
3. `feat(dev): harness v2 parts C-E — inspector, overlay launcher, apply safety (IMP-032)`

**Ship lane: NONE. Do not bump, do not add a `Release-Lane` trailer.** This is dev-only code that is stripped from release bundles; the only production bytes it adds are the one `devRestoreMs` `useState`. The repo already sits at **v1.0.5 / versionCode 11** (unshipped, from IMP-031), and the OTA lane is closed until that builds — so this simply rides the next build whenever the owner ships one.

**Smoke test (dev build, on device):** enable the reminder from the panel → Pending shows 7 entries matching Intended → write today's entry → re-arm → Intended drops today's slot and Pending follows → revoke notifications in Android settings → Permission reads `denied` and the row preview reads "Blocked in settings" → `Fire test in 10s` + background the app → notification appears with the real tone copy. Then: load `staleBackup` → the "Back up my journal" row shows the long string (**this closes the IMP-030 anchor-1 debt**) → load `longName` in night mode → no row blows out → launch **Restore notice** → the IMP-029 notice renders and dismisses (**closes that walk debt without a real uninstall cycle**).

---

## Open items / blockers

### ⏳ In flight

- **✅ v1.0.3 / versionCode 9 — REVIEWED, APPROVED, LIVE on Play** (2026-07-30). Carries IMP-027 (SDK 54 / API 36) + everything merged to `main` before it. The next build is **v1.0.4 / versionCode 10** — bumped by IMP-029 (`expo-application`); IMP-022 (`expo-print`) rides the same shipment without bumping again.
- **✅ Phase 10a COMPLETE.** 12×14 closed-testing gate cleared 2026-07-29; production access unlocked; free release live. **✅ API-36 compliance (deadline 2026-08-31) is met** — live in production, a month ahead of the deadline.
- **🚢 v1.0.4 / versionCode 10 — SHIPMENT TAGGED 2026-07-31 (`Release-Lane: build`).** Carries **IMP-028** (live store prices + sim guard), **IMP-029** (restore notice), and **IMP-030 A + B** (row auto-stack + font-scale cap). CI runs the test gate, then waits for the owner's one-tap approval, then builds and auto-submits. **`eas.json` submits to track `alpha`** (closed testing) — so after CI is green the owner must still **promote alpha → production in Play Console**; it does not reach live users on its own.
- **~~IMP-030 Part A can go OTA on its own~~ — ❌ CORRECTED 2026-07-31: it cannot.** The repo's `version` was already moved to **1.0.4** by IMP-029's `bump:native` (commit `b9ef182`) *before* IMP-030 was written, and `runtimeVersion` policy is **`appVersion`**. An `eas update` today would publish under runtimeVersion **1.0.4** while every installed device is running **1.0.3** — it would reach **zero users**. Everything since the vc9 build therefore ships as **one BUILD**, including the pure-JS parts. (General rule worth internalising: **once a `bump:native` lands, the OTA lane is closed for that release until the build ships.** Land OTA-able fixes *before* the bump, or accept they ride the build.)
- **Two device-walk debts ride this build.** (1) **IMP-029** needs a real Auto Backup + uninstall/reinstall walk (smoke test in build-log) before it can be trusted. (2) **IMP-030 anchor 1 in `rowFit.js` clears by only ~4%** (235 vs 245dp) — verify the "Backed up today" row stays inline on a real device; if it stacks in reality, lower the `0.48` glyph-ratio constant rather than raising the chrome subtraction.
- **v1.0.5 / versionCode 11 exists locally (commit `33b3db0`), not yet pushed.** IMP-031 (daily reminder) needed a native bump (`expo-notifications`) and landed on top of the already-tagged, already-pushed v1.0.4/vc10 shipment (commit `70cae1c`, `Release-Lane: build`, awaiting the owner's CI approval). No `Release-Lane` trailer on `33b3db0`, so pushing it would be a CI no-op per `release.yml` ("pushes without it are no-ops") — it would not disturb vc10's pending approval, which is tied to that specific workflow run, not to the tip of `main`. Left unpushed anyway per the "don't push unless asked to ship" rule; owner decides whether vc11 ships as its own build or gets folded into a later shipment.

### ✅ Owner device verification — WALKED 2026-07-30 (on v1.0.3)

- **IMP-027 (SDK 54) — ✅ PASSED.** Edge-to-edge is clean across the app; no status/nav-bar overlap on any custom header or the tab bar. This was the highest-risk item in the SDK 54 upgrade (Android 16 forces edge-to-edge and SDK 54 can no longer opt out) and it is now closed.
- **IMP-020 (Backup / Restore) — ✅ PASSED.** JSON export → share out (owner uploads to Drive manually) → restore from the file all work.
- **IMP-006 (Android Auto Backup) — ✅ PASSED, with a UX finding.** Uninstall → reinstall **did** auto-restore with no login, which is exactly the feature. The restored data was **stale ("older data before today")** — that is the documented Android Auto Backup contract, **not a defect**: it runs at most **once per 24h**, and only while the device is **idle + charging + on unmetered Wi-Fi**, so anything written since the last successful backup is not in it. Config is correct (`android:allowBackup="true"`, no custom rules, per the IMP-006 spec). **The real problem is that the restore is silent** — see the open finding below.
- **IMP-021 (Lifetime Progress):** still unwalked; OTA lane, no ship trailer applied yet — owner decides when to push.

### 🔎 The auto-restore is silent — ✅ scoped and code-complete as **IMP-029** (full detail in build-log; unwalked on-device)

### 🔔 New finding 2026-07-31 — no `setNotificationHandler` anywhere in the tree

`grep -rn "setNotificationHandler"` returns **zero matches**. Under `expo-notifications`' default behaviour that means a reminder firing while the app is **foregrounded displays nothing on Android**. For a daily reminder that is mostly harmless (the app is normally backgrounded when it fires), but it is a real product decision that was never made, and it changes how IMP-031 must be tested: a test notification only proves anything if the app is backgrounded before it fires. **Deliberately out of scope for IMP-032** (that task must not change shipping behaviour) — scope it as its own small task if the owner wants foreground reminders to surface.

### 💳 Phase 10b — payments (the next real track, gated externally)

- **🔓 BillDesk deadlock broken — application SUBMITTED 2026-07-30, ⏳ awaiting verification.** The trap was circular: BillDesk PA-CB seller verification wants the **live app's Play Store URL**, payments need BillDesk, BillDesk needed a published listing. Shipping v1.0.3 broke the cycle, and the owner has now submitted the application with their details. **v1.0.3 is now live and approved**, so the listing URL resolves publicly — if BillDesk queries it during verification it will no longer 404, and the URL can be re-supplied with confidence if they ask again. **Submitted ≠ verified** — BillDesk/Google still have to approve the payments profile, and until they do, subscription products cannot be activated. Watch for mail from `onboarding@billdesk.com` and Play Console → **Payments profile**. Window opened 2026-06-04 (≤90 days ⇒ ~**2026-09-02**).
- **Owner to confirm once the profile verifies:** whether any Play subscription products exist yet — Play Console → **Monetize → Subscriptions** (any products, and are they *active*?) and RevenueCat → **Offerings** (does `current` list packages?). Playbook 10b.2–10b.5 are still unchecked and "Play product ids" is still `TBD`.
- **⚠️ Before flipping `PLUS_ENABLED`: create the `RC_ANDROID_KEY` EAS env var AND GitHub repo secret.** `.env` is git-ignored and never reaches EAS Build (no `.easignore`, no `env` block in `eas.json`), so a cloud build would resolve the key to `''` → `isBillingConfigured()` false → `createPurchaseService` returns the **simulation** → the paywall fakes a purchase and grants Plus free, with no crash. IMP-028 added `scripts/check-billing-config.js` as a hard preflight in the build job, but it only arms once `PLUS_ENABLED` is true. Run `eas env:create --name RC_ANDROID_KEY --scope project --environment production` and add the repo secret of the same name (`release.yml` references it; the Actions linter flags it as undefined until it exists).
- **⚠️ The "7-day free trial" claim is hardcoded** in the paywall CTA + legal footer ([`Paywall.js`](src/screens/Paywall.js), [`PlusFlow.js`](src/screens/PlusFlow.js) `LegalFooter`). Only truthful if the Play base plan actually carries a 7-day free-trial offer. **Decide the offer when creating the products**, then either configure the trial in Play or change the copy — do not ship the claim unverified. Left hardcoded deliberately: the correct fix reads the intro/trial period off the live offering, which cannot be built or tested until real products exist. Prices themselves are already live-driven (IMP-028).

### ⛔ Parked

- **iOS (Phase 11):** blocked on a Mac / EAS macOS + Apple Developer Program enrollment. The Phase 6 iOS real-billing row is blocked on the same.

---

## Last session note

_History archived in [`docs/build-log.md`](docs/build-log.md) → "Session notes". Only the two newest notes stay here; every chat moves the older one out when it appends a new one (see DEVGUIDE Step 4)._

_2026-07-31 (harness part B) — **IMP-032 Part B built, committed.** TDD per spec: RED in `__tests__/dev/inspectNotify.test.js` (14 cases covering all four expo trigger shapes — `{type:'date',value}`, `{date}` as both `Date` and ISO string, seconds-based time-interval, and an unreadable trigger — plus `diffIntendedVsPending` matched/missing/extra/within-tolerance/custom-tolerance), watched it fail on a missing module, then GREEN. `src/dev/inspectNotify.js` is pure: `describePending(scheduled, now)` normalises any of those shapes into sorted `{when, inLabel, title}` rows (unreadable trigger → `when:null`, sorts last, never crashes); `diffIntendedVsPending(intended, pending, toleranceMs=60000)` greedily matches intended `Date`s against pending rows within tolerance, ignoring `when:null` rows entirely so an unreadable trigger is never miscounted as "extra". `src/dev/notifyProbe.js` mirrors `src/reminders/io.js` exactly — lazy `require('expo-notifications')` in try/catch, re-exports its `NATIVE_UNAVAILABLE` constant rather than duplicating the string — and adds `available/getPermission/requestPermission/listScheduled/fireTestIn/cancelAll`; zero business logic, no test file, same as `io.js`. New `src/dev/panel/NotifySection.js` is the actual panel UI: permission row + Request/Open-OS-settings, live `Enabled`/`Hour`/`Minute` controls that call the app's **real** `setSettings` (not the knob/Apply path — this exercises `rearmReminders`'s real dependency array), `Re-arm now`/`Cancel all`/`Fire test in 10s` actions (with the foreground-visibility caveat from Trap 4 as inline hint text), an Intended-vs-Pending list with the live diff counts, and the three `reminderRowValue` states rendered side by side. Every action re-reads permission + pending afterward — nothing is cached, per the spec ("re-read after every action"). Wired `onRearmReminders={rearmReminders}`, `settings`, `setSettings`, and a `wroteToday={!!findTodaysEntry(entries, todayKey())}` prop into `DevPanel` from inside the existing `__DEV__ && DevPanel &&` block in `RitualsApp.js` — Metro still strips the whole subtree, so this costs zero production bytes. `npm test` → **359 passed, 42 suites** (from 345/41; +14). Committed `4e677d0` — no bump, no `Release-Lane` trailer (dev-only). **Not yet touched:** the inspector (Part C), overlay launcher (Part D), or the Apply/Reset confirm+recovery-copy safety net, panel split into `src/dev/panel/{controls,StateSection,InspectSection,LaunchSection}.js`, and `sentinel.js` (Part E) — those are Parts C–E, still one spec, one remaining commit. NEXT: Sonnet takes **IMP-032 Parts C–E** (Step 12: RED in `__tests__/dev/inspect.test.js`)._

_2026-07-31 (harness part A) — **IMP-032 Part A built, committed.** TDD per spec: RED in `__tests__/dev/buildState.test.js` (14 new cases) + `__tests__/dev/generateEntries.test.js` (1 case), watched both fail for the right reason, then GREEN. `src/dev/buildState.js` gains every knob from the Part A table — `mode`, `name`, `endOffset` (shifts `endDayKey` back N days, the non-goal-compliant lapsed-user lever), `lastBackupAt` (days-ago → ISO, `-1` → `null`), `subCanceled`, `plan` (overrides the plus-derived default), the full `reminder` triple, `storePurchase`/`storeRestore`, `headlineFont`/`roundness`, `textLength`, and a `gaps` preset layer (`'none'|'one'|'scattered'` strings map to offset arrays, kept backward-compatible with the raw arrays existing scenarios already pass). **Fixed the accent bug in the same pass:** `palette` now looks up the swatch in `SHOP_PALETTES` and writes it into `settings.accent`, mirroring `RitualsApp.retint()` — a loaded palette no longer shows active in the Shop while the theme stays amber. `src/dev/generateEntries.js`'s `buildEntries` gains `textLength` (a `LONG_DIDS`/`LONG_WISHES` multi-paragraph pool alongside the existing short one). `src/dev/scenarios.js` grew all 8 new presets from the spec (`lapsed`, `reminderOn`, `staleBackup`, `neverBackedUp`, `longName`, `canceledSub`, `nightAmoled`, `storeFailure`) — the existing generic round-trip test covers them automatically since it iterates `SCENARIOS_LIST`; added 3 targeted assertions (canceledSub, stale/never backup, longName) for the interesting cases. `npm test` → **345 passed, 41 suites** (from 329/41; +16). Committed `e1dc59c` — no bump, no `Release-Lane` trailer per the spec (dev-only). **Not yet touched: `DevPanel.js` UI.** Part A's steps only scope the pure `buildState`/`generateEntries`/`scenarios` layer; wiring these new knobs into panel controls happens in Part E's panel split, not here. NEXT: Sonnet takes **IMP-032 Part B** (Step 6: RED in `__tests__/dev/inspectNotify.test.js`) — the notification control room._
