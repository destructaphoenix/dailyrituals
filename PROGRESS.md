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

> **The Improvements backlog has NO open IMP task.** Everything through IMP-032 is code-complete, and **v1.0.5 / vc11 is live to testers** (see App status below). IMP-022 (Save as PDF + About) stays **⏸ deferred by owner decision**; its spec sits in [`docs/build-log.md`](docs/build-log.md) → "⏸ Deferred specs" (still valid, not history) — do not start it without the owner reviving it. **Next Sonnet chat:** no spec to pick up. Either take a new task from the owner/Opus, or spend the chat on the **real-device walk** of the closed-testing build — IMP-021 (never walked at all), IMP-029, IMP-030 anchor 1, IMP-031 (backgrounded), IMP-032's own harness walk. All detailed under "Open items / blockers".

**App status (2026-08-02): two tracks are live at once — mind which one you mean.**
- **Production (the public): 🟢 v1.0.3 / versionCode 9**, approved and live since 2026-07-30. Carries IMP-027 (SDK 54 / API 36). **Google Play API-36 compliance (deadline 2026-08-31) is ✅ SHIPPED** — proven in production, a month early. The **BillDesk deadlock is ✅ UNBLOCKED**: the public Play Store URL PA-CB verification was asking for now exists.
- **Closed testing (`alpha`): 🟢 v1.0.5 / versionCode 11**, built and submitted 2026-08-02. Five features the public does not have yet (IMP-021/028/029/030/031).

**Consequence for OTA:** `runtimeVersion` is `appVersion` = **1.0.5**, so an `eas update` lands on **testers only** — the public on 1.0.3 is OTA-unreachable until vc11 is promoted to production. Treat tester-visible regressions as real but contained. The app ships **free**: `PLUS_ENABLED = false`, so there is no payment surface in it at all.

**Current stack:** Expo SDK **54** · React Native **0.81.5** · React **19.1.0** · **Legacy Architecture** (`expo.newArchEnabled: false`, held deliberately — SDK 55 drops Legacy and that migration is its own future task) · `compileSdkVersion`/`targetSdkVersion` **36**, `minSdkVersion` **24** · `npm test` → **367 passed, 43 suites**. Details in [`docs/playbook.md`](docs/playbook.md).

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
| IMP-021 | Lifetime Progress — evolve Insights into "Your record" (days remembered + totals + adaptive heatmap) above "Your patterns"; Home hero untouched | OTA→rode vc11 | 🟡 shipped vc11, **walked 2026-08-02 — owner: "not properly completed"**. Renders, but under review; see Open items |
| IMP-022 | Wire the two dead You-tab buttons: **Save as PDF** (real keepsake export, Plus-gated) + **About Daily Rituals** (real about sheet). Both are currently `onPress={() => {}}` no-ops | Build | ⏸ **deferred 2026-07-31** (owner) — spec parked in build-log → "⏸ Deferred specs", still valid; not the active track |
| IMP-023 | Dynamic daily text — rotating multilingual greeting (header, date-seeded) + daily reflection prompt (write card, no-repeat deck); fully offline; header → Layout A | OTA | ✅ code-complete — full detail in build-log |
| IMP-024 | 🔴 Streak counts real consecutive days — derive from entries (breaks to 0 on a missed day; re-logging after a gap = 1, not prev+1) | OTA | ✅ code-complete — full detail in build-log |
| IMP-025 | Edit your name in the app — make `settings.name` changeable from the You tab (currently only set once in onboarding) | OTA | ✅ code-complete — full detail in build-log |
| IMP-026 | Remove the Gamification toggle entirely — gamification is always on; delete the setting + switch + all `gamify` gating, no residue | OTA | ✅ code-complete — full detail in build-log |
| IMP-027 | 🔴 Upgrade Expo SDK 51→54 to hit `targetSdkVersion 36` (Android 16) — Google Play compliance deadline Aug 31, 2026 | Build | ✅ **shipped** in v1.0.3 / vc 9 (production review) — full detail in build-log |
| IMP-028 | 🔴 Billing correctness pass before any real transaction — live store prices on the paywall (kill hardcoded USD), build-time guard against shipping the purchase simulation, real renew date in the cancel sheet | OTA→rode vc11 | ✅ **shipped to testers** vc11 — full detail in build-log |
| IMP-029 | Tell the user when their data came from a Google backup — a one-time "restored, and it's from {date}" note with a one-tap route to the manual restore | Build | ✅ **DONE** — shipped vc11 + **real-device verified 2026-08-02**: real uninstall→reinstall auto-restore fired the notice. Two follow-on findings below |
| IMP-030 | 🔴 Layout can't blow out, whatever the text — settings rows auto-stack instead of collapsing to a 1-char-per-line column; app-wide font-scale cap | OTA (A) + Build (B) → rode vc11 | ✅ **DONE** — shipped vc11 + **real-device verified 2026-08-02** — build-log |
| IMP-031 | 🔴 **Daily reminder is real** — the You-tab row advertises "8:30 PM" to every live user and schedules nothing. Local, offline, opt-in reminder notifications | Build | ✅ **DONE** — shipped vc11 + **real-device verified 2026-08-02** — build-log |
| IMP-032 | **Dev harness v2 — total control + inspection.** Every persisted/settings key reachable from a knob; the notification subsystem drivable *and observable*; hard-to-reach overlays openable; read-only inspector. Dev-only, never ships | Dev-only (no ship) | ✅ **DONE** — code-complete + **real-device walked 2026-08-02** — build-log |

---

## Open items / blockers

### ⏳ In flight

- **✅ v1.0.3 / versionCode 9 — LIVE on the PRODUCTION track** (approved 2026-07-30). Carries IMP-027 (SDK 54 / API 36) + everything merged to `main` before it. **This is still what the public runs.**
- **✅ v1.0.5 / versionCode 11 — BUILT, SUBMITTED and LIVE to TESTERS on the `alpha` (closed testing) track, 2026-08-02.** Carries everything since vc9: **IMP-028** (live store prices + sim guard), **IMP-029** (restore notice), **IMP-030 A + B** (row auto-stack + font-scale cap), **IMP-031** (daily reminder) and **IMP-021** (Lifetime Progress). IMP-032's harness is in the tree but **not** in the bundle (`__DEV__`-stripped). **v1.0.4 / vc10 was superseded and never promoted** — vc11 is a strict superset of it. **Promoting alpha → production is a separate, deliberate decision the owner has not yet taken.**
- **✅ Phase 10a COMPLETE.** 12×14 closed-testing gate cleared 2026-07-29; production access unlocked; free release live. **✅ API-36 compliance (deadline 2026-08-31) is met** — live in production, a month ahead of the deadline.
- **⚠️ The OTA lane now reaches TESTERS ONLY.** `runtimeVersion` policy is `appVersion` = **1.0.5**, which matches the closed-testing build but **not** the **1.0.3** the public is running. An `eas update` today lands on testers and **nobody else**; production stays OTA-unreachable until vc11 is promoted. (General rule worth internalising: **once a `bump:native` lands, the OTA lane is closed for that release until the build ships.** Land OTA-able fixes *before* the bump, or accept they ride the build.)
- **ℹ️ Play Console compliance banners lag fresh uploads — verify before believing them.** The "must target API 36" banner shown against vc10 on 2026-07-31 was **stale, not real**: the app bundle explorer (authoritative — it reads the manifest) confirmed `targetSdkVersion 36`, matching source since IMP-027. If it reappears on vc11, re-check the bundle explorer before assuming a regression.
- **Device-walk debts — ✅ MOSTLY CLOSED on real hardware 2026-08-02. Two remain.**
  - ✅ **IMP-030 — PASSED on a real device.** The ~4% anchor-1 margin (235 vs 245dp) held on real font metrics; no need to lower the `0.48` glyph ratio.
  - ✅ **IMP-031 — PASSED on a real device**, including the backgrounded case (the one the emulator could not settle, since without `setNotificationHandler` a foregrounded reminder shows nothing on Android).
  - ✅ **IMP-032 — harness walked on a real device.** Sections, knobs, Apply/confirm and the Inspector all exercised.
  - 🟡 **IMP-021 — walked, but the owner reports it is "not properly completed."** It renders and shows real progress; the exact shortfall is being pinned down (see the dedicated block below). Do **not** treat this row as done.
  - ✅ **IMP-029 — PASSED on a real device.** The owner ran a true uninstall → reinstall cycle; Auto Backup restored silently at install time and the app fired the "Welcome back." notice naming the backup's date. The restored data was **stale (2 entries vs the 5 that were live)** — which is the feature working, not failing: that staleness is exactly the hazard the notice exists to announce. Two follow-on findings came out of the walk (see below). Procedure kept in [`docs/build-log.md`](docs/build-log.md) → IMP-029 → "Device-walk procedure" for future regressions.

### 🔴 Finding 2026-08-02 (from the IMP-029 walk) — the OS restores without asking, and the notice gives no way to refuse

The owner's words: *"the app is restored automatically (with no option given to me, it was done without permission — definitely need to change this)."* The complaint is legitimate, but only half of it is fixable:

- **Not fixable — the restore itself.** Android Auto Backup restore happens **at install time, inside the OS**, before the app's first line of JS runs. There is no API to prompt before it, intercept it, or defer it. `BackupAgent.onRestoreFinished()` fires *after* the data has already landed. The only OS-level lever is `allowBackup: false` in [`app.config.js:49`](app.config.js#L49), which deletes the whole "new phone, my journal came back" feature IMP-006 was built for. **Do not propose an "ask before restoring" flow — it cannot be built.**
- **Fixable — what happens next.** [`RestoreNotice.js`](../src/screens/RestoreNotice.js) offers exactly two actions: **Got it** (accept) and **Restore from a file** (replace from JSON). There is **no way to reject the restored data**. A user handed a stale restore who wants to start clean has to find You tab → Reset all data on their own, and the notice never mentions it. That is the real gap, and it is what makes the restore *feel* non-consensual: the OS decided, and the app only offers acceptance. **Candidate IMP-033: a third "Start fresh" action** on the notice, with `Alert.alert` confirm + a `backupIO.writeRecovery` copy written *before* the wipe (mirroring `runConfirmedImport`'s existing guarantee), so consent is given after the fact but genuinely given.

### 🟡 Finding 2026-08-02 — "Back up my journal" says nothing about the Google backup at the moment of use

Owner: *"When I press 'Backup my journal' it gives me the option to send or share it… but no mention of a 'google backup'."* The surface **does** exist — [`YouScreen.js:130`](../src/screens/YouScreen.js#L130) renders an **"Automatic backup / How it works"** row directly *above* "Back up my journal" in the same "Your journal is safe" card, wired to `explainAutoBackup` ([`RitualsApp.js:385`](../src/RitualsApp.js#L385)). So this is discoverability, not absence: the two backups are separate systems and the export flow never says so at the moment the user is thinking about backups. Small copy fix, bundle with IMP-033.

**⚠️ The trap this walk exposed, worth stating plainly:** the in-app **"Back up my journal" (JSON export) has ZERO effect on the Google backup.** They are unrelated systems. Exporting a JSON does not refresh what Auto Backup holds, and the Google copy only refreshes on the OS's own schedule (≤once/24h, idle + charging + unmetered Wi-Fi) or via **Settings → Google → Backup → Back up now**. Any future staleness report must first establish *which* backup was taken.
- **▶️ NEXT DECISION FOR THE OWNER: promote vc11 alpha → production, or hold.** Testers have five unreleased features; the public has none of them. Nothing blocks the promotion technically — it is a judgement call about how much tester feedback to collect first. Until it happens, treat every vc11 feature as unshipped from the public's point of view.

### ✅ Owner device verification — WALKED 2026-07-30 (on v1.0.3)

- **IMP-027 (SDK 54) — ✅ PASSED.** Edge-to-edge is clean across the app; no status/nav-bar overlap on any custom header or the tab bar. This was the highest-risk item in the SDK 54 upgrade (Android 16 forces edge-to-edge and SDK 54 can no longer opt out) and it is now closed.
- **IMP-020 (Backup / Restore) — ✅ PASSED.** JSON export → share out (owner uploads to Drive manually) → restore from the file all work.
- **IMP-006 (Android Auto Backup) — ✅ PASSED, with a UX finding.** Uninstall → reinstall **did** auto-restore with no login, which is exactly the feature. The restored data was **stale ("older data before today")** — that is the documented Android Auto Backup contract, **not a defect**: it runs at most **once per 24h**, and only while the device is **idle + charging + on unmetered Wi-Fi**, so anything written since the last successful backup is not in it. Config is correct (`android:allowBackup="true"`, no custom rules, per the IMP-006 spec). **The real problem is that the restore is silent** — see the open finding below.
### 🟡 IMP-021 (Lifetime Progress) — walked 2026-08-02, owner says it is NOT properly done

The section **renders** and the owner "sees some progress," so this is a completeness question, not a crash. Two concrete deviations from the approved design ([`docs/superpowers/specs/2026-06-14-lifetime-progress-design.md`](superpowers/specs/2026-06-14-lifetime-progress-design.md)) were found by re-reading the code against the spec — either may be what looks unfinished:

1. **`xpEarned` is computed and never rendered.** Design §4 says "`xpEarned` is surfaced quietly (e.g. in the level context line or a tile subtitle)". `deriveLifetime` returns it; [`InsightsScreen.js:80`](../src/screens/InsightsScreen.js#L80) prints only `Lv N · levelName · activeSpan`. Nothing in the app shows lifetime XP on this screen.
2. **The heatmap draws `missed` and `empty` identically** — [`LifetimeHeat`](../src/screens/InsightsScreen.js#L176) computes `has = !(missed || empty || future)` and paints every non-`has` cell as the same transparent bordered box. So a genuinely-missed day is indistinguishable from a day before the user started, and there are **no month/date labels and no legend**. On a short history this reads as a wall of blank squares — plausibly the "doesn't look finished" impression. It also contradicts IMP-014, which established 💀 for genuinely-missed days on the *other* two grids (week strip + Reflections heatmap).

Not defects, by explicit design decision — do not "fix" these: the **milestone timeline is deferred to roadmap piece C** (Annual Recap), the **Home hero is untouched on owner constraint**, and the **"Days kept" / "This month" tiles were deliberately removed** (spec §2). Row count is uncapped (one week-row per week since the first entry) — intended "grows over time", but worth a look on a long history.

**Next step:** owner confirms which of the above (or something else) is the shortfall, then Opus scopes it as IMP-033.

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

_2026-08-02 (vc11 released) — **v1.0.5 / versionCode 11 is BUILT, SUBMITTED and LIVE to testers on the `alpha` track.** Owner approved the CI run; vc10's redundant run was dropped, so **vc10 never shipped and vc11 is the only build after vc9**. Five previously-unreleased features are now in testers' hands: **IMP-021** (Lifetime Progress), **IMP-028** (live store prices), **IMP-029** (restore notice), **IMP-030 A+B** (row auto-stack + font-scale cap), **IMP-031** (daily reminder). IMP-032's harness shipped in the *tree* but not the *bundle*. **The public is still on v1.0.3** — promoting alpha → production is an untaken owner decision, and until it is taken every one of those five is unshipped as far as real users are concerned. **The OTA lane reopened, but only onto testers** (`runtimeVersion` = `appVersion` = 1.0.5 matches vc11, not the 1.0.3 the public runs). Docs reconciled: backlog rows for IMP-021/028/029/030/031 moved from "code-complete" to "shipped to testers", each carrying its outstanding walk; the App status block now names both live tracks explicitly so "live" is never ambiguous again. NEXT: (a) owner decides on the alpha → production promotion, and (b) a chat spends itself on the **real-device walk** of the closed-testing build — IMP-021 has never been walked at all, IMP-029 needs a genuine Auto Backup cycle, IMP-030 anchor 1 needs the 4%-margin check, IMP-031 must be verified **backgrounded**, and the IMP-032 harness itself is unwalked._

_2026-08-02 (real-device walk — 3 of 5 debts closed) — **no code changed; docs only.** Owner walked the vc11 closed-testing build on real hardware and passed **IMP-030** (the ~4% anchor-1 margin held on real font metrics — no need to lower the `0.48` glyph ratio), **IMP-031** (including the backgrounded case, the one the emulator could not settle) and **IMP-032** (harness sections, knobs, Apply/confirm, Inspector). All three are now **DONE** in the backlog table. **IMP-021 walked but rejected by the owner** — "not actually completed properly," though progress is visible on device; re-read of `InsightsScreen.js` against the approved design surfaced two concrete deviations, now written up under Open items: (1) `deriveLifetime` computes **`xpEarned` and nothing renders it**, while design §4 asks for it "surfaced quietly" in the level context line; (2) `LifetimeHeat` collapses **`missed` and `empty` into the same transparent bordered cell** with no month labels and no legend, so a missed day is indistinguishable from a pre-start day — which also contradicts IMP-014's 💀 convention on the other two grids, and on a short history just reads as blank squares. Three things confirmed **not** defects, so nobody "fixes" them later: the milestone timeline is deferred to roadmap piece C, the Home hero is untouched on owner constraint, and the "Days kept"/"This month" tiles were deliberately removed (spec §2). **IMP-029 is now the only real walk debt**, and it is genuinely un-fakeable: the notice needs `installedAt > lastSavedAt`, `installedAt` is Android's read-only `firstInstallTime`, and `serialize` force-stamps `lastSavedAt = now` on every save — so no harness knob or hand-edit can produce it, only a true backup→uninstall→reinstall cycle. Wrote a **full device-walk procedure** into build-log → IMP-029: the key unlock is **`adb shell bmgr backupnow`**, which triggers Auto Backup on demand and removes the 24h/idle/charging/Wi-Fi wait, plus the two prerequisites that silently break the test (same signing cert on both installs; never `adb uninstall -k`), the positive case, and five negatives (normal launch / update-over-the-top / OTA / genuinely-fresh-install via `bmgr wipe` / manual JSON restore). NEXT: (a) owner runs the IMP-029 procedure, (b) owner confirms which IMP-021 shortfall is the real one so Opus can scope it as IMP-033, (c) the alpha → production promotion decision is still untaken._
