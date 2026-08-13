# Daily Rituals — Build Progress (live cursor)

> **The memory between chats. Read top-to-bottom every chat — and keep it SMALL.** This file is only:
> the backlog table, live blockers, and the **2 newest** session notes.
>
> - **Open IMP specs → [`docs/specs-open.md`](docs/specs-open.md).** The backlog table below links to each
>   one. **Open the ONE spec you are building and no others** — every other spec in that file is for a
>   different chat and reading it is wasted context.
> - **Open runtime walks → [`docs/walk-open.md`](docs/walk-open.md).** The testing counterpart of
>   `specs-open.md`: everything that needs a running app on an emulator/device, which `npm test` cannot
>   prove. **Open the ONE walk you are running and no others.** A failed walk is not fixed in place — it
>   becomes a new `IMP-xxx` row here.
> - Stable reference (locked decisions, release + signing rules, parked phases 8/10b/11, config, architecture) → [`docs/playbook.md`](docs/playbook.md) — open only when you need it.
> - Finished IMP specs + older session notes → [`docs/build-log.md`](docs/build-log.md). Git is the full record.
> - How to drive a Sonnet chat → [`DEVGUIDE.md`](DEVGUIDE.md).
>
> **Size budget (hard rule):** the moment an IMP task is **code-complete** (don't wait for ship / runtime-walk), MOVE its spec from [`docs/specs-open.md`](docs/specs-open.md) to [`docs/build-log.md`](docs/build-log.md) and leave only its one-line row in the backlog table below. Specs never live inline in this file. This is what keeps it from bloating.

---

## ▶️ ACTIVE TRACK

The live work is the **first unchecked `IMP-xxx` task in the Improvements backlog** below — its full spec is in [`docs/specs-open.md`](docs/specs-open.md), linked from its backlog row. Work that, **not** the phase ladder (8 / 10b / 11), which is **parked in [`docs/playbook.md`](docs/playbook.md)** until the owner resumes it.

> **Six specs left — IMP-053 → IMP-060, minus 057 (still reserved). Updated 2026-08-13:**
>
> **▶️ [IMP-053](docs/specs-open.md#imp-053--search-shows-you-the-match) is the live task;
> take the rest in table order.** All are **OTA — none needs a `bump:native`.** Each is self-contained:
> **open one spec, not the file.**
>
> **`IMP-057` is still reserved, not missing.** It is the historical `dayKey` migration IMP-056 deferred.
> Its step-5 reporter is now live (dev panel → Inspector → "Data health") but has only ever been read
> against synthetic fixture data (0 drift, not meaningful) — it needs a real device's numbers before it can
> be scoped. **Do not reuse the number for anything else.**
>
> - **✅ 056 done (2026-08-10).** `dayKey` is now derived locally, not UTC — closes the 1am-overwrite /
>   missing-evening-entry defect. Walked both offset directions on the emulator. Full detail + the residual
>   + the IMP-057 decision are in Open items below.
> - **✅ 050 done (2026-08-10).** Custom moods (IMP-037) no longer draw blank — a 40-glyph picker + typed
>   escape hatch, two named fallback glyphs, and a shimmer for multi-mood cells. Unblocked 052 and 055.
> - **✅ 051 done (2026-08-10).** The keyboard no longer eats **Next** — a new `useKeyboardHeight()` hook
>   replaces the inert `KeyboardAvoidingView` on Android; `ArchiveFilters.js`/`NameEditModal.js` confirmed
>   already fine and left untouched. Walked all three WriteFlow steps on the emulator, no fallback needed.
> - **✅ 052 done (2026-08-13).** Both heatmaps are tappable now — a written day opens `ReadingSheet` through
>   a shared `openEntry` handler; missed/empty/future cells stay inert.
> - **053** makes a search result actually contain the word you searched for.
> - **054** fixes IMP-031's two missing halves: a foreground reminder shows nothing, and tapping one does
>   not open the write flow.
> - **055** lets you rename / re-emoji / remove the feelings you named yourself.
> - **060** says so when a candle spends itself — today it is taken silently, and it is paid inventory.
> - **059** labels every icon-only control; the app currently has **one** `accessibilityLabel` in total,
>   and the write FAB is not it.
> - **058** adds grief / gratitude / change prompt packs. **Free, not Plus** — the perk list is fixed at six
>   by an earlier decision, and a prompt is the app helping you write *today*.
>
> Take the remaining six in any order — no ordering constraints left. **Two need a running app, not just
> `npm test`** — 054 (notification behaviour) and 059 (whose acceptance test is writing an entry with
> TalkBack on and your eyes shut). Budget for that before starting either.
>
> Everything else in the backlog table below is ✅. The other live work is the walk queue, the
> **subscription-track build window** (playbook 10b step B9: revive IMP-022 Part A, the PDF perk #6), or
> the still-untaken **`internal` → production promotion** decision (see Open items below).
>
> **▶️ Also still open (2026-08-09): the emulator walk of everything built since
> vc11 — IMP-033 through IMP-048, none of which has ever been run on hardware.** The walk queue, its
> techniques and its results live in **[`docs/walk-open.md`](docs/walk-open.md)** — start there, take the
> first ⬜ row, and open only that walk. Defects found on a walk become fresh `IMP-xxx` rows here and are
> fixed one at a time by a separate build chat: **IMP-048** (undisclosed trash paywall + a toast rendering
> behind its own modal) and **IMP-049** (a wrong-typed key in a restored backup poisons the theme, now
> fixed) both came out of it. **Resume point: WALK-01 steps 3–9** — the emulator may still hold the
> poisoned settings from the aborted first attempt; Reset all data before resuming (the fix in this chat
> prevents *future* poisoning, it does not retroactively repair AsyncStorage state already written).
>
> **IMP-044 does NOT claim a slot in this queue.** It is config-only, already code-complete, and unbumped on purpose — it simply **rides whichever build is cut next**. Do not "start" it; the only thing it still needs is the device walk logged under Open items. Its existence changes exactly one thing for the tasks below: **the OTA lane is still open, so keep landing OTA work — the moment a `bump:native` happens, IMP-044 goes with it.**
>
> **`PLUS_ENABLED` must not flip until every line of the perk table is true** — the remaining gate is perk
> #6, the PDF (IMP-022, deferred) — see Phase 10b below.
>
> **One owner decision is still open:** the **alpha → production promotion**. A second — whether to sell a
> consumable currency at all — is settled in principle (ember purchasing dropped, 2026-08-03) and must be
> finalised before `PLUS_ENABLED` flips. Product thesis governing all of this: [`docs/playbook.md`](docs/playbook.md)
> → "Why anyone would pay". It came out of the 2026-08-02 real-device walk: the OS restores a Google backup
> silently and without consent, and the app's notice only offers acceptance. IMP-022 (Save as PDF + About)
> stays **⏸ deferred by owner decision**; its spec sits in [`docs/build-log.md`](docs/build-log.md) → "⏸
> Deferred specs" (still valid, not history) — do not start it without the owner reviving it. The
> **real-device walk is now DONE** for IMP-021/029/030/031/032.

**App status (2026-08-02): two tracks are live at once — mind which one you mean.**
- **Production (the public): 🟢 v1.0.3 / versionCode 9**, approved and live since 2026-07-30. Carries IMP-027 (SDK 54 / API 36). **Google Play API-36 compliance (deadline 2026-08-31) is ✅ SHIPPED** — proven in production, a month early. The **BillDesk deadlock is ✅ UNBLOCKED**: the public Play Store URL PA-CB verification was asking for now exists.
- **Closed testing (`alpha`): 🟢 v1.0.5 / versionCode 11**, built and submitted 2026-08-02. Five features the public does not have yet (IMP-021/028/029/030/031). **This track is now frozen** — see the track change below.

**🔀 Build submissions now go to `internal`, not `alpha` (changed 2026-08-08).** `eas.json` →
`submit.production.android.track` is `"internal"`. Internal testing serves the owner only, publishes in
**minutes**, and normally skips the full app review that closed testing goes through. Consequences:
- **The next build lands on `internal`, not `alpha`.** `alpha` stays at vc11 and goes stale by design. That is safe — vc11 is `targetSdkVersion 36`, so a frozen `alpha` cannot re-trigger the compliance banner (unlike `beta`/vc8 and the old `internal`/vc5, which can and do).
- **Bonus: this fixes half the compliance banner automatically.** The next build overwrites `internal`'s ancient **vc5 / API 35**. Only `beta` (vc8 / API 35) will still need vc9 promoted onto it.
- **Reaching the public is unchanged and still manual:** promote `internal` → `production` in Play Console. That promotion *does* get the full review.
- **Nothing changed for OTA** — `eas update` never touches a Play track. See below.

**Consequence for OTA:** `runtimeVersion` is `appVersion` = **1.0.5**, so an `eas update` lands on **testers only** — the public on 1.0.3 is OTA-unreachable until vc11 is promoted to production. Treat tester-visible regressions as real but contained. The app ships **free**: `PLUS_ENABLED = false`, so there is no payment surface in it at all.

**⚠️ OTA has no Play track, and never did.** `eas update` publishes a JS bundle to Expo's CDN — Google is not involved, there is no review, and `internal`/`alpha`/`beta` are meaningless to it. Delivery is gated by exactly two things: the **channel** (`production`, set in `eas.json` → `build.production.channel`) and a **matching `runtimeVersion`**. An installed build receives an OTA regardless of which Play track it was installed from. So "send OTA to internal instead of closed testing" is not a setting that exists — and OTA is already faster than any track, which is the whole reason the lane exists.

**Current stack:** Expo SDK **54** · React Native **0.81.5** · React **19.1.0** · **Legacy Architecture** (`expo.newArchEnabled: false`, held deliberately — SDK 55 drops Legacy and that migration is its own future task) · `compileSdkVersion`/`targetSdkVersion` **36**, `minSdkVersion` **24** · `npm test` → **651 passed, 67 suites**. Details in [`docs/playbook.md`](docs/playbook.md).

---

## 🔧 Improvements backlog (post-launch — ACTIVE TRACK)

Opus scopes each owner-filed issue into a numbered `IMP-xxx` task — steps, tests, commit message and ship lane all written out in [`docs/specs-open.md`](docs/specs-open.md). Sonnet picks the **first unchecked** row, opens **only that one spec**, executes its steps in order, commits with the exact message given, ticks the row, moves the spec to `docs/build-log.md`, and writes the Last session note.

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
| IMP-021 | Lifetime Progress — evolve Insights into "Your record" (days remembered + totals + adaptive heatmap) above "Your patterns"; Home hero untouched | OTA→rode vc11 | ✅ shipped vc11; shortfall closed by **IMP-045** — full detail in build-log |
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
| IMP-033 | 🔴 **The restore is offered, not imposed** — quarantine an OS-restored backup, run the app as a genuine first install (onboarding and all), then offer the backup with fair warnings once onboarding is done | OTA | ✅ code-complete — full detail in build-log |
| IMP-034 | 🔴 **Hide "Gather Embers" while the app ships free** — the Shop sells ember packs at real cash prices ($1.99–$9.99) wired to no IAP at all, and the section is not gated by `PLUS_ENABLED`. Wrap it, exactly like the Plus banner beside it | OTA | ✅ code-complete — full detail in build-log |
| IMP-035 | 🔴 **Search your journal** — there is no search anywhere; the archive is write-only. Full-text over `did`/`wished`, filter by mood and date. **Free forever** | OTA | ✅ code-complete — full detail in build-log |
| IMP-036 | **Custody of your words** — edit any past entry (not just today), delete an entry, and a 30-day trash. Core is **free**; *restoring* from trash is the Plus half | OTA | ✅ code-complete — full detail in build-log |
| IMP-037 | **Moods: custom + multiple per entry** — `mood: string` → `moods: string[]` plus user-defined feelings. **Free** (it is stored content). Unblocks IMP-047 | OTA | ✅ code-complete — full detail in build-log |
| IMP-038 | ✨ **"On this day"** — resurface what you wrote a year / months ago. **Plus perk #3.** Unblocked (IMP-035's retrieval layer + IMP-037's mood model both done) | OTA | ✅ code-complete — full detail in build-log |
| IMP-039 | 🔴 **Streak-freeze candles do NOTHING** — nothing in the tree ever spends a freeze, and `currentStreak` has no freeze awareness at all. Buy 5 for 450 embers, miss a day, streak still breaks to 0. Two false claims in one Shop line | OTA | ✅ code-complete — full detail in build-log |
| IMP-040 | 🟡 "Keepsake" means three different things — the daily-rites footer, the Achievements screen title, and the unbuilt PDF perk. Pick one meaning, rename the others | OTA | ✅ code-complete — full detail in build-log |
| IMP-041 | 🟡 **Teach the app** — no tutorial beyond first-run onboarding; embers, candles, quests, levels and every Plus perk are unexplained and unlisted anywhere in-app | OTA | ✅ code-complete — full detail in build-log |
| IMP-042 | 🐛 **The Keepsakes screen (from Home) does not scroll** — every other screen does; static reading does not explain it, so measure before theorising | OTA | ✅ code-complete — full detail in build-log |
| IMP-043 | 🔴 **Recoverability pass** — a returning subscriber is shown as non-Plus and never re-checked; backup health is silent; the purchase makes an implied promise about data that is not kept | OTA | ✅ code-complete — full detail in build-log |
| IMP-044 | 🟡 **The dev client ships to the public** — `expo-dev-launcher` bytecode (incl. its Compose UI) is inside the production AAB; Play's deprecated-API scan flagged it. Enable R8 so release builds drop unreachable code | Build | 🟢 **code-complete, NOT bumped, NOT walked** — config-only, rides the next build. **Not the active track** — full detail + walk checklist in build-log |
| IMP-045 | 🟡 **Finish Lifetime Progress** — the IMP-021 shortfall the owner rejected on the device walk: the heatmap paints missed days and never-started days identically (contradicting IMP-014), and `xpEarned` is computed but never rendered. **Both** are in scope | OTA | ✅ code-complete — full detail in build-log |
| IMP-046 | ✨ **Annual Recap — "your year, remembered"** — roadmap piece C. One page per completed year: days, words, longest streak, top moods, milestones. **Plus perk #4.** Absorbs IMP-021's deferred milestone timeline | OTA | ✅ code-complete — full detail in build-log |
| IMP-049 | 🟡 **Settings survive a corrupt restore** — `readBackup` validates the envelope but never the payload's *shape*; `mergeWithDefaults` is a shallow spread, so one wrong-typed key (proven: `settings.accent` as a string) replaces its default and every gradient in the app renders a native null | OTA | ✅ code-complete — full detail in build-log |
| IMP-048 | 🔴 **Three free restores, then Plus** — trash restore was Plus-only with no disclosure: the button looked live and did nothing, and its "part of Plus" toast rendered *behind* the modal. Free 3×, stated on the page before it's spent | OTA | ✅ code-complete + **emulator-walked 2026-08-09** — full detail in build-log |
| IMP-047 | ✨ **Deeper insights — the analysis layer** — `InsightsScreen` has **zero** `plus` checks; free and Plus see identical insights. Mood-by-weekday, seasonal patterns, mood pairings. **Plus perk #5** | OTA | ✅ code-complete — full detail in build-log |
| IMP-056 | 🔴 **A day is the day you lived, not the day in Greenwich** — `dayKey` is derived in **UTC** ([`RitualsApp.js:83`](src/RitualsApp.js#L83)) while every date the user reads is **local** ([`clock.js:16`](src/time/clock.js#L16)), and both are stamped onto the same entry. In IST a 1am entry is filed under yesterday and can **silently overwrite last night's words**; at negative offsets an 8pm entry is filed under tomorrow and never appears on the grid at all. Fixes derivation only — the historical migration is deferred to IMP-057 | OTA | ✅ code-complete + **emulator-walked 2026-08-10** (both offset directions) — full detail in build-log |
| IMP-050 | 🟡 Every mood gets a face — custom emoji picker + typed escape hatch, two fallback glyphs, multi-mood shimmer | OTA | ✅ code-complete (2026-08-10) — full detail in build-log |
| IMP-051 | 🔴 **The keyboard stops eating the Next button** — `KeyboardAvoidingView` is inert on Android (`behavior: undefined`), WriteFlow is inside a `Modal` whose dialog window never gets `adjustResize`, and edge-to-edge (API 36) stops the system resizing for the IME at all. The user must dismiss the keyboard for every single step | OTA | ✅ code-complete + **emulator-walked 2026-08-10** — full detail in build-log |
| IMP-052 | ✨ Tap a day, read it — both heatmaps (Reflections + the lifetime grid on Insights) are now pressable; taps open the existing `ReadingSheet` | OTA | ✅ code-complete (2026-08-13) — full detail in build-log |
| IMP-053 | 🟡 **Search shows you the match** — the result card hard-renders the first 2 lines of `did`, but `searchEntries` matches over `did + wished`. A hit in `wished` (or deep in `did`) yields a card containing the search term **nowhere**. IMP-035 built the engine and hid its output. Watch the index-mapping trap: diacritic folding is not length-preserving | OTA | ⬜ [spec](docs/specs-open.md#imp-053--search-shows-you-the-match) |
| IMP-054 | 🟡 **The reminder you can actually answer** — two gaps in IMP-031's subsystem: no `setNotificationHandler` (flagged 2026-07-31, never scoped) so a foreground reminder shows **nothing**, and no response listener at all, so **tapping it does not open the write flow** — it lands on whatever tab you left. Owner chose: suppress the OS banner, show the app's own Toast. **Needs an emulator walk; `npm test` cannot prove it** | OTA | ⬜ [spec](docs/specs-open.md#imp-054--the-reminder-you-can-actually-answer) |
| IMP-055 | 🟡 **Manage your feelings** — `addCustomMood` only ever appends, so a mood typo'd at 11pm is in your picker, Insights and Annual Recap for the life of the install. Rename (rewrites across `entries` **and** `trash`), re-emoji, remove. **Build AFTER IMP-050** | OTA | ⬜ [spec](docs/specs-open.md#imp-055--manage-your-feelings) |
| IMP-060 | 🟡 **A candle burns without telling you** — `applyAutoFreeze` returns `spent`, and [`RitualsApp.js:363`](src/RitualsApp.js#L363) uses it **only** to decide whether to call the setters. A candle bought for 120–450 embers is consumed and a missed day silently covered, with no notice at all — the same "done without permission" class as the OS restore, except it is paid inventory spent by our own code | OTA | ⬜ [spec](docs/specs-open.md#imp-060--a-candle-burns-without-telling-you) |
| IMP-059 | 🟡 **The app has one accessibility label** — `grep accessibilityLabel\|accessibilityRole` over `src/` (minus `dev/`) returns **exactly one** match. The write FAB, the app's primary action, is a `Pressable` containing only an icon — its "Write" text is a *sibling*, so TalkBack cannot name it. Interactive-controls-only scope; acceptance is writing an entry blind | OTA | ⬜ [spec](docs/specs-open.md#imp-059--the-app-has-one-accessibility-label) |
| IMP-058 | ✨ **Prompt packs** — grief / gratitude / change, as `settings.promptPack`. Nearly free because `selectPrompt` already takes the pool as a parameter; the catch is that `valid()` checks the deck by **length only**, so switching between same-length packs silently breaks the no-repeat guarantee. **Free, not Plus** — reasoning in the spec | OTA | ⬜ [spec](docs/specs-open.md#imp-058--prompt-packs) |

---

## Open items / blockers

### ⏳ In flight

- **✅ v1.0.3 / versionCode 9 — LIVE on the PRODUCTION track** (approved 2026-07-30). Carries IMP-027 (SDK 54 / API 36) + everything merged to `main` before it. **This is still what the public runs.**
- **✅ v1.0.5 / versionCode 11 — BUILT, SUBMITTED and LIVE to TESTERS on the `alpha` (closed testing) track, 2026-08-02.** Carries everything since vc9: **IMP-028** (live store prices + sim guard), **IMP-029** (restore notice), **IMP-030 A + B** (row auto-stack + font-scale cap), **IMP-031** (daily reminder) and **IMP-021** (Lifetime Progress). IMP-032's harness is in the tree but **not** in the bundle (`__DEV__`-stripped). **v1.0.4 / vc10 was superseded and never promoted** — vc11 is a strict superset of it. **Promoting alpha → production is a separate, deliberate decision the owner has not yet taken.**
- **✅ Phase 10a COMPLETE.** 12×14 closed-testing gate cleared 2026-07-29; production access unlocked; free release live. **⚠️ API-36 compliance (deadline 2026-08-31) is met IN PRODUCTION but NOT ACCOUNT-WIDE** — Play evaluates **every active release on every track**, and two abandoned tracks left over from the 12×14 gate still serve **pre-IMP-027, `targetSdkVersion 35`** bundles: **`beta` (open testing) = 1.0.2 / vc8** and **`internal` = 1.0.0 / vc5**. That — not production — is what the Console banner means by "highest non-compliant target API level is Android 15 (API 35)". Fix: promote **vc9** onto both tracks (same artifact the public runs ⇒ zero new feature exposure). Verified via the Play Developer API 2026-08-08.
- **⚠️ The OTA lane now reaches TESTERS ONLY.** `runtimeVersion` policy is `appVersion` = **1.0.5**, which matches the closed-testing build but **not** the **1.0.3** the public is running. An `eas update` today lands on testers and **nobody else**; production stays OTA-unreachable until vc11 is promoted. (General rule worth internalising: **once a `bump:native` lands, the OTA lane is closed for that release until the build ships.** Land OTA-able fixes *before* the bump, or accept they ride the build.)
- **ℹ️ Play Console compliance banners lag fresh uploads — but "stale" is the *second* thing to check, not the first.** The banner shown against vc10 on 2026-07-31 **was** stale: the app bundle explorer (authoritative — it reads the manifest) confirmed `targetSdkVersion 36`. **But on 2026-08-08 the same banner was REAL** and this note nearly buried it — it was firing on the forgotten `beta`/`internal` tracks (vc8/vc5, API 35), not on production. **Order of checks, in this order:** (1) list the **active release on every track**, not just the one you last shipped — `beta` and `internal` are easy to forget for months; (2) app bundle explorer for the flagged versionCode; (3) only then suspect lag. The banner's own wording is the tell — it names the *highest non-compliant* API level, so **API 35 could never have meant vc9/vc11**, both of which are 36.
- **Device-walk debts — ✅ MOSTLY CLOSED on real hardware 2026-08-02. One remains (IMP-044, unwalked).**
  - ✅ **IMP-030 — PASSED on a real device.** The ~4% anchor-1 margin (235 vs 245dp) held on real font metrics; no need to lower the `0.48` glyph ratio.
  - ✅ **IMP-031 — PASSED on a real device**, including the backgrounded case (the one the emulator could not settle, since without `setNotificationHandler` a foregrounded reminder shows nothing on Android).
  - ✅ **IMP-032 — harness walked on a real device.** Sections, knobs, Apply/confirm and the Inspector all exercised.
  - ✅ **IMP-021 — walked 2026-08-02, owner called it "not properly completed"; both shortfalls closed by [IMP-045](docs/build-log.md), code-complete 2026-08-09.** Full detail archived in `docs/build-log.md`. **Not yet re-walked on device** — the fix is OTA and testers will see it on the next `eas update`.
  - 🆕 **IMP-044 — a NEW walk debt, and a different kind: the first minified build.** R8 is now on for release builds only (config-only change, 2026-08-08). `npm test` cannot prove it — Jest never exercises R8, and **the failure mode is silent stripping at runtime, not a compile error.** Whenever the next build is cut, the walk must cover every reflection-facing surface: reminder fires + tap routes (IMP-031) · paywall live prices + Restore purchases (IMP-028) · JSON export **and** restore (IMP-020) · `eas update` applies · SVG icons · fonts · restore notice (IMP-029). Also confirm the win: bundle explorer shows **no `expo.modules.devlauncher` classes**. Checklist + full rationale in [`docs/build-log.md`](docs/build-log.md) → IMP-044.
  - ✅ **IMP-029 — PASSED on a real device.** The owner ran a true uninstall → reinstall cycle; Auto Backup restored silently at install time and the app fired the "Welcome back." notice naming the backup's date. The restored data was **stale (2 entries vs the 5 that were live)** — which is the feature working, not failing: that staleness is exactly the hazard the notice exists to announce. Two follow-on findings came out of the walk (see below). Procedure kept in [`docs/build-log.md`](docs/build-log.md) → IMP-029 → "Device-walk procedure" for future regressions.

### 🟡 IMP-056 residual + the IMP-057 decision (2026-08-10) — dayKey derivation fixed; historical entries not migrated

**IMP-056 is code-complete: `dayKey` is now derived locally (`src/time/dayKey.js`), closing the 1am-overwrite /
missing-evening-entry defect.** Walked on the emulator both directions — `Asia/Kolkata` 01:00 (positive offset:
confirmed the overwrite is closed, WriteFlow opens blank instead of prefilling last night's words) and
`America/New_York` 20:30 (negative offset: a new entry correctly lands on *today's* local date — streak went
12→13, not a broken/skipped day). This spec **deliberately does not migrate existing entries** — two things
outlive it:

- **The residual, genuinely unfixed:** old entries keep whatever UTC key they were stamped with. For roughly
  one day after this ships, a negative-offset user can still have last evening's *already-stored* entry answer
  to today's key (the bug closes for all *new* writes immediately; it self-heals for old data as those UTC-keyed
  entries age out of relevance). Nothing to act on — just don't be surprised if it's reported once more.
- **The IMP-057 decision is the owner's, not a build chat's.** The dev-panel Inspector (`Data health` group,
  step 5 of the spec) now reports how many `entries`/`trash` rows have a `dayKey` that disagrees with what
  `dayKeyOf()` would stamp today, and whether remapping them would move `currentStreak`. **On the emulator's
  "Migration Test" fixture profile the count reads 0** — that data was seeded by `scripts/gen-v2-fixture.js`
  with ids that don't match the `new<epoch-ms>` shape the reporter keys on, so it has nothing to compare
  against; it is not evidence the bug never fired in practice. **Real tester/production data has never been
  read through this reporter** — that's the actual step-5 number IMP-057 needs, and it can only come from a
  real device via the dev harness (You tab → long-press "About Daily Rituals" → Inspector). Once it exists,
  IMP-057 can be scoped: remapping a historical `dayKey` can move an entry off a day and **break a streak
  that is currently alive** — correct, but it will read as a regression to whoever it happens to.

### 🔴 Finding 2026-08-02 (from the IMP-029 walk) — the OS restores without asking, and the notice gives no way to refuse

The owner's words: *"the app is restored automatically (with no option given to me, it was done without permission — definitely need to change this)."* The complaint is legitimate, but only half of it is fixable:

- **Not fixable — the restore itself.** Android Auto Backup restore happens **at install time, inside the OS**, before the app's first line of JS runs. There is no API to prompt before it, intercept it, or defer it. `BackupAgent.onRestoreFinished()` fires *after* the data has already landed. The only OS-level lever is `allowBackup: false` in [`app.config.js:49`](app.config.js#L49), which deletes the whole "new phone, my journal came back" feature IMP-006 was built for. **Do not propose an "ask before restoring" flow — it cannot be built.**
- **Fixable — what happens next.** [`RestoreNotice.js`](../src/screens/RestoreNotice.js) offers exactly two actions: **Got it** (accept) and **Restore from a file** (replace from JSON). There is **no way to reject the restored data**. A user handed a stale restore who wants to start clean has to find You tab → Reset all data on their own, and the notice never mentions it.

**✅ RESOLVED — scoped as [IMP-033](docs/specs-open.md#imp-033--the-restore-is-offered-not-imposed), an open task.** The owner rejected a mere "Start fresh" button in favour of a stronger design: **quarantine** the OS-restored payload, run the app as a genuine first install (onboarding and all), then **offer** the backup with fair warnings once onboarding is done. Full spec in [`docs/specs-open.md`](docs/specs-open.md).

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

### 🧭 OPEN STRATEGIC DECISION (owner, 2026-08-02) — "was local-only the right call?"

The owner asked this after the purchase-recovery audit: *"I am questioning if I made the right choice by going completely offline… any user grievances (especially related to money) will have huge repercussions."*

**The local-only decision is not the problem, and should not be reversed.** It was taken 2026-06-07 for the **journal** — PII, GDPR/India-DPDP deletion-and-export duties, and onboarding friction (see the `daily-rituals-local-only-decision` memory). Every one of those reasons still holds exactly as written. Nothing found in this audit touches them.

**The actual flaw is narrower: selling a CONSUMABLE currency from an app with no server.** These two are fundamentally incompatible, by Google's design, not by ours — once a consumable is consumed, Play's `queryPurchasesAsync` no longer returns it, so there is **nothing left to restore**. Restoring a spent currency requires *your* server holding the balance. That is what makes ember purchases a genuine one-way lane: if a user pays for embers and loses local state, you cannot make them whole. You cannot grant remotely. The only lever is a Play refund — manual, and rating-damaging.

**Subscriptions and NON-consumables do not have this problem, and need no accounts.** Play holds a durable record tied to the user's Google account, and RevenueCat restores it against **anonymous app user IDs** — no login, no email, no PII, no backend of yours. So "local-only" and "purchases that survive a wipe" are **not** in conflict. Only *consumables* are.

**⚖️ Revised 2026-08-02 after the owner pushed back — *"this is supposed to be the Duolingo of daily journaling"*.** That objection is fair and the first framing of this block overweighted the restore risk. Two corrections:

**1. The gamification is not what's in question.** Duolingo's revenue is overwhelmingly **subscription**; gems are a small line and mostly *earned*, and the shop's real job is to make the streak feel precious — which sells the subscription. Duolingo *can* sell gems because it has **accounts and a server**, i.e. exactly the thing this app deliberately rejected. So "the Duolingo of journaling" is fully achievable here **with every mechanic intact** — streaks, XP, levels, embers, candles, shop, achievements. The only question is whether cash buys the *currency* or buys *Plus*.

**2. The real argument against cash embers is the economics, not the risk.** Actual numbers: `EMBER_GAIN = 15`/day ([`data.js:102`](../src/data.js#L102)); the entire ember-purchasable catalogue is 240 + 240 + 420 + 420 (palettes) + 300 (sky) = **1,620 embers ≈ 108 days of journaling ≈ one $9.99 pack**. So the cash-ember line has a **~$10 lifetime ceiling per user** — after which only candles (120–450) repeat — while **Plus is $29.99/yr recurring and `PLUS_PERKS` already promises "Every palette & sky — unlocked forever"**. Cash embers therefore **cannibalise the subscription that sells the same goods**, cap out at a third of one year of Plus, and carry **100% of the unrestorable-purchase liability**. That is a weak SKU on its own merits.

| | Option | Consequence |
| --- | --- | --- |
| **A** ⭐ | **Embers earned-only; sell Plus.** Every mechanic stays; only the cash top-up SKU goes. | Keeps the whole Duolingo-shaped economy, removes the cannibalisation *and* the entire liability class. Shop copy already leans here — *"Embers also gather on their own — one for every day you keep"* ([`Shop.js:167`](../src/screens/Shop.js#L167)). Every money grievance becomes a RevenueCat restore, which already works. |
| **B** | **Cosmetics as one-time NON-consumable IAP** ("this palette, $1.99"). | Keeps à-la-carte revenue, durable and restorable with **no accounts**. More Play products to maintain. Combines fine with A. |
| **D** | **Sell cash embers anyway, with real mitigations.** | Legitimate and industry-normal — plenty of offline games store coin balances locally. Mitigations, in order of value: (1) **Google Play promo codes** — Play Console issues codes for in-app products, so a user with a lost balance sends their Play receipt and you send a code granting the same pack free. That is a genuine **server-less manual recourse path**, quantity-limited but ample at indie volume, and it is the concrete answer to "I'd have no way to make them whole". (2) Prompt the JSON export immediately after any cash purchase. (3) Honest copy — *"Embers live on this device"*. (4) Keep a purchase ledger in `PERSISTED_KEYS` so it rides both Auto Backup and the JSON export. Exposure is bounded by the ~$10 ceiling above. |
| **C** | **Add a server** to hold balances. | Reverses the local-only decision and reimports the PII/legal/friction burden it was taken to avoid. **Not recommended** — the currency is not worth a backend. |

**Timing is the good news.** `PLUS_ENABLED = false` ⇒ **zero paying users, zero refunds owed, zero support tickets, nothing shipped.** This is the cheapest possible moment to find it; after 10b it would be genuinely expensive. **No code decision is blocked on this today** — but it must be settled before `PLUS_ENABLED` flips, because it determines which Play products get created (playbook 10b.2–10b.5, still `TBD`).

### 🚀 SUBSCRIPTION TRACK — ordered next steps (owner asked 2026-08-04)

**The governing fact: BillDesk is the hard external gate, and it is ~4 weeks from expiry (window opened 2026-06-04, ≤90 days ⇒ ~2026-09-02). Play subscription products cannot be created or priced without a verified payments profile — so nothing commercial ships before it. But NONE of the product work is blocked by it.** Treat the wait as the build window; do not idle.

**⚠️ Sequencing trap — flipping `PLUS_ENABLED` is a BUILD, not an OTA.** The RevenueCat key reaches the app through `app.config.js` → `expo-constants` `extra`, which is resolved from `process.env` **at build time in the EAS environment**. `scripts/check-billing-config.js` is already wired as a preflight in the build job for exactly this reason. Do not plan the flip as a JS-only OTA.

**⚠️ Promote vc11 EARLY, not late.** `runtimeVersion` = `appVersion` = 1.0.5, so every OTA lands on **testers only** while the public sits on 1.0.3. All the perk work below is OTA-lane — meaning **none of it reaches real users until vc11 is promoted.** Promotion is not a "later" decision; it is a prerequisite for this whole track mattering.

**🔴 PROPOSED FINAL PERK LIST (owner to approve — this is step A2).** Every line below is either already real or has a specced task. Nothing is aspirational.

| # | The line the paywall carries | Backed by | State |
| --- | --- | --- | --- |
| 1 | **Every palette & sky — unlocked forever** | `tier: 'plus'` items | ✅ already real |
| 2 | **Streak insurance — a candle spends itself when you miss a day** | IMP-039 (a) | ✅ built — replaces the false "3 candles every month" |
| 3 | **On this day — your own words, brought back to you** | IMP-038 | ✅ code-complete |
| 4 | **Your year, remembered — the Annual Recap** | **IMP-046** (was "roadmap C, unspecced") | ✅ code-complete |
| 5 | **Deeper insights — moods, seasons and your rhythms** | **IMP-047**, over IMP-037's data | ✅ code-complete — makes dead perk #5 real |
| 6 | **Your Book — your days, as a PDF** | IMP-022 Part A (BUILD lane) | ⬜ deferred, revive |

**Cut outright: "Your whole graveyard, kept forever"** — no history limit exists, so it sells relief from a restriction that was never built, and building one would violate the never-gate-their-words line. **Cut, do not implement.**

**Note the shape:** one cosmetic perk, one retention perk, four memory perks. That is the thesis — *free helps you write today, Plus gives you your years back* — expressed as a purchasable list. Keep it at six; a longer list converts worse.

**PRICING TIERS (decided 2026-08-04) — three products, not four. No family plan** (a journal shares nothing, and a family tier would force accounts and reverse the local-only decision; full reasoning in [`docs/playbook.md`](docs/playbook.md)).

| Product | Play type | Why |
| --- | --- | --- |
| **Monthly** | subscription | low-commitment entry |
| **Annual** | subscription | the default; price it so the monthly looks expensive |
| **Lifetime / "forever"** ⭐ | **non-consumable** (one-time) | ~2.5–3× the annual. Fits the *legacy* theme exactly, **restores with no accounts** (durable Play record), anchors the annual so it reads cheap, and captures the high-intent buyer a family tier was reaching for. **Non-consumable, never consumable** — that is what makes it restorable. |

Also worth doing and nearly free: **"gift a year" via Play promo codes** — no accounts, no infrastructure, and it is the real family use case (giving a journal to someone you love).

**Remaining, unblocked:**
- **Revive IMP-022 Part A** — Your Book (the PDF export), perk #6. Already sold; still no PDF code in the tree. **BUILD lane** (new native module). The only unbuilt perk left — everything else in the A/B build window (IMP-034/035/036/037/038/046/047, the perk-list decision, `RC_ANDROID_KEY`, vc11 promotion) is done.
- **Chase BillDesk.** Watch `onboarding@billdesk.com` and Play Console → Payments profile. Critical path; everything else is slack.
- **Decide pricing, including the India tier.** $29.99/yr is not defensible for today's Plus. ≈₹2,500 needs its own thought — Play local tiers, not just the USD figure.
- **Decide the trial.** The "7-day free trial" claim is hardcoded in `Paywall.js` + `PlusFlow.js` `LegalFooter`. Either configure a real 7-day offer on the Play base plan or change the copy. **Never ship it unverified.**

**D — the gate before `PLUS_ENABLED` flips. All must be true:**
- [ ] Every line in `PLUS_PERKS` is real (or deleted)
- [ ] Play subscription products created **and active**; RevenueCat → Offerings shows `current` with packages
- [ ] `RC_ANDROID_KEY` present in the EAS **production** environment (else the build silently ships `simService` and fakes purchases)
- [ ] Trial copy matches the configured Play offer
- [ ] A **real transaction** tested end-to-end on a real device via a licence tester account
- [ ] vc11 (or later) is on the production track, so the paying public can actually reach it

### 💳 Phase 10b — payments (the next real track, gated externally)

- **✅✅ BillDesk APPROVED (owner reported 2026-08-04).** PA-CB seller verification is **done**; BillDesk is now working on the payment setup itself. **The 90-day window (~2026-09-02) is no longer a threat and the external gate on Phase 10b is lifted.** What this unblocks: a payments profile means Play subscription **products can be created, priced and activated** (playbook 10b.2–10b.5, still `TBD`) and RevenueCat Offerings can be wired. What it does *not* change: `PLUS_ENABLED` still must not flip until gate **D** below is fully true — approval removes the *external* blocker, not the four unbuilt perks. Remaining wait is BillDesk finishing payment setup; confirm in Play Console → **Payments profile** before creating products.
- **Historical (resolved) — the deadlock that was:** application SUBMITTED 2026-07-30, verified 2026-08-04. The trap was circular: BillDesk PA-CB seller verification wants the **live app's Play Store URL**, payments need BillDesk, BillDesk needed a published listing. Shipping v1.0.3 broke the cycle, and the owner has now submitted the application with their details. **v1.0.3 is now live and approved**, so the listing URL resolves publicly — if BillDesk queries it during verification it will no longer 404, and the URL can be re-supplied with confidence if they ask again. **Submitted ≠ verified** — BillDesk/Google still have to approve the payments profile, and until they do, subscription products cannot be activated. Watch for mail from `onboarding@billdesk.com` and Play Console → **Payments profile**. Window opened 2026-06-04 (≤90 days ⇒ ~**2026-09-02**).
- **Owner to confirm once the profile verifies:** whether any Play subscription products exist yet — Play Console → **Monetize → Subscriptions** (any products, and are they *active*?) and RevenueCat → **Offerings** (does `current` list packages?). Playbook 10b.2–10b.5 are still unchecked and "Play product ids" is still `TBD`.
- **🔴 HARD BLOCKER before `PLUS_ENABLED` — ONE of SIX advertised Plus perks is not real** (perk #6, the PDF — IMP-022, deferred; the other five are built, see the perk table above). Audited 2026-08-03 against `PLUS_PERKS` ([`data.js:144`](../src/data.js#L144)), the list the paywall sells:

  | # | Perk as sold | Reality |
  | --- | --- | --- |
  | 1 | "Every palette & sky — unlocked forever" | ✅ **REAL** — `tier: 'plus'` items unlock ([`Shop.js:25/28`](../src/screens/Shop.js#L25)). 3 palettes + 2 skies. |
  | 2 | "Streak insurance — a candle spends itself when you miss a day" | ✅ **REAL (IMP-039)** — `applyAutoFreeze` spends a candle per missed day automatically; `currentStreak` honors `frozenDays`. The old "3 free every month" wording (a one-time grant sold as recurring) is gone from `PLUS_PERKS`. |
  | 3 | ~~"Your whole graveyard, kept forever"~~ → "On this day — your own words, brought back to you" | ✅ **REAL (IMP-038)** — the meaningless "no history limit" line is cut; `onThisDay()` resurfaces year-ago (and, before a year of history, 6/3/1-month-back) entries on Home, gated `plus`. |
  | 4 | "Export your days as a keepsake PDF" | ❌ **DEAD** — no PDF code in the tree at all. Known: IMP-022, ⏸ deferred. |
  | 5 | "Deeper insights — moods & seasonal themes" | ✅ **REAL (IMP-047)** — `DeeperInsights.js` adds mood-by-weekday, mood-by-season and mood-pairings cards behind `plus`, over IMP-037's mood arrays. |

  **Four of five now real (#1, #2, #3, #5 — #2 fixed by IMP-039, #3 fixed by IMP-038, #5 fixed by IMP-047).** This is the same defect class as IMP-031's "8:30 PM" reminder and IMP-022's PDF button, but on the surface that takes money — so it is a Play policy exposure, not just a broken promise. **Nothing may charge for this list until it is true.** **#4** needs IMP-022 revived — the only remaining gap.

- **🧭 Product thesis lives in [`docs/playbook.md`](docs/playbook.md) → "Why anyone would pay" (2026-08-03).** Short form: value in a journal **accumulates**, so the paying moment is month 2–3, not signup; the app today is **all continuity (streaks/embers/reminder) and no retrieval** — **no search anywhere**, editing is today-only, no delete — which makes the archive **write-only** and blocks any "revisit your past" sale. Free forever = custody of their own words (write/read/**search**/edit/delete/history/raw export); paid = the app's work *on* those words (recap, resurfacing, insight, keepsakes, cosmetics). **Search is the highest-value non-design task in the codebase** and should be scoped as its own IMP.
- **🧭 Product note — the perk list IS the Plus roadmap.** The owner asked (2026-08-03) what more Plus should contain beyond themes. The audit answers it: **build #2, #4 and #5 properly and Plus is already a real subscription** — and the honest through-line for this app is **memory**, not cosmetics. Free helps you *write today*; Plus helps you *revisit and keep* what you wrote. That framing is exactly the existing "legacy" roadmap (D → A+B → **C, Annual Recap / Time Capsule**, still unbuilt) and the memorial-garden theme. Strongest candidates, cheapest first: **"On this day"** resurfacing (entries are local and `dayKey`-indexed, so this is near-free to build, it is the single most-loved feature in comparable journals, and IMP-013's "Tend an old grave" rite already gestures at it) · **Annual Recap** (roadmap C, the emotional payoff of a year, folds in the deferred milestone timeline) · **keepsake PDF** (perk #4, the legacy artifact — revives IMP-022) · **themed prompt packs** (grief / gratitude / transitions — IMP-023's deck architecture already supports this; new pools are pure data) · **biometric app lock** (`expo-local-authentication`, local-only, top-requested for private journals, high conversion for low build). **Recommended free/paid line: never gate a user's own writing** — reading, writing, raw export, full history and search stay free forever. Gate *enrichment*: recap, resurfacing, deeper analysis, keepsakes, cosmetics, convenience. ⚠️ Also revisit the **price tier** when products are created: $29.99/yr is not defensible for 3 palettes + 2 skies, and the owner's home market (India) reads ≈₹2,500 — Play's local tiers matter as much as the USD figure.

- **🔴 HARD BLOCKER before `PLUS_ENABLED` — the ember packs display cash prices and are wired to NOTHING.** [`data.js:132`](../src/data.js#L132) labels `EMBER_PACKS` "bought with cash" at `$1.99 / $4.99 / $9.99`, but the buy handler is [`RitualsApp.js:532`](../src/RitualsApp.js#L532) — `onBuy={(pack) => { setEmbers((e) => e + pack.amount); … }}` — a bare counter increment. **No `purchaseService`, no RevenueCat, no IAP of any kind.** Same path via [`Shop.js:170`](../src/screens/Shop.js#L170) → `getEmbers(pack)` ([`RitualsApp.js:173`](../src/RitualsApp.js#L173)). Worse, **this surface is not gated by `PLUS_ENABLED`**: the Shop's "Gather Embers" section ([`Shop.js:166`](../src/screens/Shop.js#L166)) has no `plusEnabled &&` wrapper, unlike the Plus banner at line 56 — so it renders **in the shipping free build with cash prices on it**, and tapping a "$9.99" pack grants 1,500 embers for free. Nobody is charged, so no money is at risk, but the app is **displaying a price for something that costs nothing** — the same class of misrepresentation IMP-028 fixed for the paywall. Either wire the packs to real consumable IAP products or hide the section behind `PLUS_ENABLED` (the cheap, correct move for the free release — do this one first).
- **✅ RESOLVED as IMP-043** — a returning subscriber shown as non-Plus is now re-verified once at launch (`useLaunchEntitlementCheck`), and a definitive "no entitlement" answer from the store now actually downgrades a stale/forged local cache instead of only a failed check being ignored. "Restore purchases" is also reachable from the You tab now, outside the paywall. Full detail in `docs/build-log.md` → IMP-043.
- **🔴 Embers, owned palettes/skies and freeze candles are LOCAL-ONLY and have no recovery path whatsoever.** They live in `PERSISTED_KEYS` ([`state.js:9–10`](../src/persistence/state.js#L9)) and **nowhere else** — no server record, no RevenueCat, nothing Google holds. If local state is wiped and not restored, paid inventory is **gone permanently**, and unlike the subscription there is no entitlement to re-query. Today this costs nothing (`PLUS_ENABLED = false` ⇒ **zero paying users exist**), but it is the reason IMP-033's decline path must never be a one-tap destruction — see the inventory warning folded into its spec.
- **⚠️ Before flipping `PLUS_ENABLED`: create the `RC_ANDROID_KEY` EAS env var AND GitHub repo secret.** `.env` is git-ignored and never reaches EAS Build (no `.easignore`, no `env` block in `eas.json`), so a cloud build would resolve the key to `''` → `isBillingConfigured()` false → `createPurchaseService` returns the **simulation** → the paywall fakes a purchase and grants Plus free, with no crash. IMP-028 added `scripts/check-billing-config.js` as a hard preflight in the build job, but it only arms once `PLUS_ENABLED` is true. Run `eas env:create --name RC_ANDROID_KEY --scope project --environment production` and add the repo secret of the same name (`release.yml` references it; the Actions linter flags it as undefined until it exists).
- **⚠️ The "7-day free trial" claim is hardcoded** in the paywall CTA + legal footer ([`Paywall.js`](src/screens/Paywall.js), [`PlusFlow.js`](src/screens/PlusFlow.js) `LegalFooter`). Only truthful if the Play base plan actually carries a 7-day free-trial offer. **Decide the offer when creating the products**, then either configure the trial in Play or change the copy — do not ship the claim unverified. Left hardcoded deliberately: the correct fix reads the intro/trial period off the live offering, which cannot be built or tested until real products exist. Prices themselves are already live-driven (IMP-028).

### ⛔ Parked

- **iOS (Phase 11):** blocked on a Mac / EAS macOS + Apple Developer Program enrollment. The Phase 6 iOS real-billing row is blocked on the same.

---

## Last session note

_History archived in [`docs/build-log.md`](docs/build-log.md) → "Session notes". Only the two newest notes stay here; every chat moves the older one out when it appends a new one (see DEVGUIDE Step 4)._

_2026-08-13 (IMP-052, tap a day, read it) — **code-complete, committed, not shipped.** Both heatmaps
(`ArchiveScreen.js`'s `Heat` and `InsightsScreen.js`'s `LifetimeHeat`) rendered every cell as an inert `View`;
the only route to an old entry was scrolling the list or already remembering a search word. RED-first: new
pure `src/entries/find.js` → `entryForDayKey(entries, dayKey)`, resolving a dayKey collision the same way
`calendar.js`'s private `indexByDay` does (first match in array order wins, entries are newest-first) — if
the two ever disagreed, the grid would paint one entry's mood and open a different one. `__tests__/entries/
find.test.js` (8 cases) covers the collision case, `null`/`[]`/malformed rows, no match. Lifted the
previously-duplicated inline open-handler in `RitualsApp.js` into one named `openEntry` const, passed to both
`ArchiveScreen` (`onOpen`, unchanged behaviour) and a new `InsightsScreen` `onOpen` prop — one definition,
two callers. Both `Heat` and `LifetimeHeat` now render a cell that is "written"/`done` as a `Pressable`
(everything else stays a bare `View`, no role, no label): `hitSlop={3}`, `transform: [{ scale: pressed ? 0.92
: 1 }]`, `accessibilityRole="button"` + a label naming the day and its moods. On press, `entryForDayKey` is
guarded — a cell can outlive its entry by one render after a delete (IMP-036), so a miss calls nothing rather
than throwing. The grid is deliberately not filtered by the search query. `ArchiveScreen.js`'s `Heat` is now
also a named export so the component test could construct the "cell says done but its entry isn't in
`entries`" stale-render case directly, without going through `buildHeatmap`. New `__tests__/screens/
ArchiveHeat.test.js` (5 cases): written day → `onOpen` fires with that entry · missed/empty day → no press
target at all · entry-removed-but-cell-still-done → calls nothing, doesn't throw · pressable cells expose
`accessibilityRole="button"`, non-pressable cells expose neither role nor label. `npm test` → **651 passed, 67
suites** (638 + 13 new); `npx expo export --platform android` clean. Full spec archived to `docs/build-log.md`;
backlog row set to code-complete; `docs/specs-open.md`'s index updated (IMP-052 removed, 6 tasks left,
IMP-053 now next). **Do NOT** (per spec, honored, none needed): open WriteFlow from any cell, filter the
heatmap to the search query, touch the week strip on Home, add a long-press menu, change `ReadingSheet`.
NEXT: **IMP-053** (search shows you the match) is the live task — open only its spec in `docs/specs-open.md`._

_2026-08-10 (IMP-051, the keyboard stops eating the Next button) — **code-complete, committed, not shipped.**
Three compounding causes on Android: `WriteFlow.js`'s `KeyboardAvoidingView` had `behavior: undefined`
(inert), WriteFlow renders inside an RN `Modal` (a separate dialog window that never gets `adjustResize`),
and `targetSdkVersion 36`'s forced edge-to-edge (IMP-027) stops the OS resizing the window for the IME at
all — together the keyboard fully covered **Next** on every step. Step 1 (measure before theorising, the
IMP-042 precedent): a temporary `keyboardDidShow` listener on the Pixel 9 Pro emulator (API 36, edge-to-edge,
gesture nav) read `height=312dp`, `insets.bottom=24dp` — the reported height extends flush to the screen's
physical bottom edge (visually confirmed: the keyboard fully occluded the footer pre-fix), so it **replaces**
`insets.bottom` rather than adding to it, matching the spec's default design; both numbers are logged as a
comment at the fix site. **Emulator gotcha this session:** the AVD's `hw.keyboard=yes` (hardware-keyboard
passthrough) meant Android showed only a compact floating toolbar (mic/backspace/enter/emoji/menu) instead
of the real software IME, which would have made the height measurement meaningless — had to edit
`~/.android/avd/Pixel_9_Pro.avd/config.ini` to `hw.keyboard=no` and cold-restart the emulator (`show_ime_
with_hard_keyboard` alone did not fix it) to get an accurate reading; left this way since it's a prerequisite
for any future keyboard-behaviour walk (IMP-054, IMP-059). New pure `src/ui/useKeyboardHeight.js` —
`useKeyboardHeight()` → a number, `0` when closed; subscribes to `keyboardWillShow`/`Hide` on iOS,
`keyboardDidShow`/`Hide` on Android (the only pair Android emits); RED-first
`__tests__/ui/useKeyboardHeight.test.js` (6 cases) mocks `Keyboard.addListener` to capture/fire handlers.
`WriteFlow.js`: `KeyboardAvoidingView` deleted (with the now-dead `Platform` import) for a plain `View` with
`paddingBottom: kb`; `Foot` takes `kb` and uses `paddingBottom: 12 + (kb > 0 ? 0 : insets.bottom)` — the
outer `View`'s own `paddingBottom: kb` is what lifts `Foot` (a non-flexed child) above the keyboard, since it
shrinks the flex column's height from the bottom. **`ArchiveFilters.js` and `NameEditModal.js` confirmed
already fine on the emulator, left untouched, per the spec's own instruction:** `ArchiveFilters`'s search
field sits in a plain (non-Modal) tab with no footer button to occlude; `NameEditModal` already used
`behavior="height"` on Android, which is JS-driven (resizes from keyboard events directly) rather than
relying on OS window resize, so causes (2)/(3) never applied to it. Walked all three WriteFlow steps on the
emulator — **Next**/finish fully visible and tappable with the keyboard up on every step, including the mood
step's "Name your own…" field; dismissing the keyboard restores `insets.bottom` with no stale padding. The
owner's documented top-bar fallback was **not** needed. `npm test` → **638 passed, 65 suites** (632 + 6 new);
`npx expo export --platform android` clean. Full spec archived to `docs/build-log.md`; backlog row set to
code-complete; `docs/specs-open.md`'s index updated (IMP-051 removed, 7 tasks left, IMP-052 now next). NEXT:
**IMP-052** (tap a day, read it) is the live task — open only its spec in `docs/specs-open.md`._
