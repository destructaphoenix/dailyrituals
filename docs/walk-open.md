# Open runtime walks — the test queue

> **What this file is.** Every **open** hands-on walk: things `npm test` structurally cannot prove, because
> they need a running app on an emulator or a device. It is to testing what
> [`specs-open.md`](specs-open.md) is to building. [`PROGRESS.md`](../PROGRESS.md) keeps the backlog,
> blockers and session notes; it points here.
>
> **How a chat uses this file — open ONE walk, not the file.** Take the first ⬜ row in the index, read
> **only** that walk's section, run it, then record the result. Every other walk is for a different chat
> and reading it is wasted context.
>
> **A walk is not code.** Do not "fix" anything mid-walk. When a walk fails, that is the deliverable:
> write down exactly what was observed, then scope it as a new `IMP-xxx` row in `PROGRESS.md` (spec body
> into [`specs-open.md`](specs-open.md)) and let a build chat take it. IMP-048 and IMP-049 both came out
> of walks this way.
>
> **Recording a result.** ✅ or ❌ + the date in the index row, and a one-paragraph note appended to the
> walk's own section. When a walk passes, move its section to [`build-log.md`](build-log.md) → "Walk log"
> and leave only the index row — same size discipline as the spec files.
>
> **Emulator ≠ device.** A ✅ here is real but partial. What an emulator cannot settle at all is listed
> under "Out of scope" at the bottom — those wait for hardware.
>
> **Every row states two things before you start it.**
> - **Target — `emulator` or `device`.** What the walk actually exercises decides this, not convenience. A
>   `device` row run on an emulator is not a pass.
> - **Runner — 👤 owner or 🤖 agent.** 👤 is the default: the owner walks it by hand. 🤖 marks a walk whose
>   steps Claude Code can genuinely drive itself — `adb` commands, `bmgr` backup/restore, clock changes,
>   log/`dumpsys` inspection, screenshots. Anything needing visual judgement, TalkBack gestures, a share
>   sheet, a real purchase or real hardware is 👤. **A 🤖 row still runs in a terminal window the owner can
>   see** — never a hidden shell.

## Index — take them in this order

| # | Walk | Covers | Target | Runner | Status |
| --- | --- | --- | --- | --- | --- |
| WALK-01 | [v2→v3 mood migration, via a synthetic v2 backup](#walk-01--v2v3-mood-migration) | IMP-037 | emulator | 🤖 mostly (adb push + restore; chip checks are visual) | 🟡 **IN PROGRESS** — restore fires, first attempt aborted by a bad fixture (fixed); mood checks not yet done |
| WALK-02 | [Restore quarantine — offered, not imposed](#walk-02--restore-quarantine) | IMP-033, IMP-029 | emulator | 👤 (clock changes + judgement on sheet copy) | ⬜ |
| WALK-03 | [JSON export → share → restore round trip](#walk-03--json-export-round-trip) | IMP-020, IMP-043 | **device** (share-sheet targets) | 👤 | ⬜ |
| WALK-04 | [Search + the write flow's moods](#walk-04--search--moods) | IMP-035, IMP-037, **IMP-053** | emulator | 👤 | ⬜ |
| WALK-05 | [Edit a past day, delete, trash allowance](#walk-05--custody-of-your-words) | IMP-036, IMP-048 | emulator | 👤 | ✅ 2026-08-09 (allowance walked; **past-day edit not yet**) |
| WALK-06 | [Streak insurance — candles spend themselves](#walk-06--streak-insurance) | IMP-039 | emulator | 👤 | ⬜ |
| WALK-07 | [Modal screens actually scroll](#walk-07--modal-scroll) | IMP-042 | emulator | 👤 (visual, two nav modes) | ⬜ |
| WALK-08 | [Font scale + layout on the nine new screens](#walk-08--font-scale) | IMP-030 regression | **device** (real font metrics) | 👤 | ⬜ |
| WALK-09 | [Lifetime heatmap's four states + the XP line](#walk-09--lifetime-heatmap) | IMP-045 | emulator | 👤 (visual) | ⬜ |
| WALK-10 | [Tips, explainers, empty states](#walk-10--teach-the-app) | IMP-041 | emulator | 👤 | ⬜ |
| WALK-11 | [The Plus surfaces](#walk-11--the-plus-surfaces) | IMP-038, 046, 047, 043 | emulator | 👤 | ⬜ |
| WALK-13 | [The reminder you can answer](#walk-13--the-reminder-you-can-answer) | IMP-054, **+ the duplicate-fire fix** | **device** (OEM behaviour + real doze) | 👤 | ⬜ — **blocked until IMP-054 lands** |
| WALK-14 | [TalkBack can write an entry](#walk-14--talkback-can-write-an-entry) | IMP-059 | emulator | 👤 (gesture navigation, inherently manual) | ⬜ — **blocked until IMP-059 lands** |
| WALK-12 | [The R8 release-variant pass](#walk-12--the-r8-release-variant-pass) | IMP-044 | **device** | 👤 | ⬜ — **do last** |

---

## Techniques — read once, several walks need these

**T1 · Plus surfaces are invisible by default.** `PLUS_ENABLED = false`
([`src/billing/config.js:39`](../src/billing/config.js#L39)) makes IMP-038/046/047, the "What's in Plus"
sheet and trash-restore **unmountable** — not locked, absent. Flip it to `true` for the walk and
**revert before committing anything**. With no `RC_ANDROID_KEY` locally you get the simulation purchase
service, which is what you want.

**T2 · The dev harness.** You tab → **long-press the "v1.0" version row**
([`YouScreen.js:284`](../src/screens/YouScreen.js#L284)). Sections: State (knobs + scenario presets),
Notify (permission + intended-vs-pending diff), Inspect (read-only state), Launch (open any overlay
directly). **Apply replaces the journal** and does not emit `trash`, so trash is cleared by it.

**T3 · Deep history.** The Entries stepper is `step: 1` — you cannot tap your way to a year. Add a
throwaway row to [`src/dev/scenarios.js`](../src/dev/scenarios.js) and revert it after:
`{ key: 'twoYears', label: '2 years', knobs: { streak: 12, entryCount: 460, done: true, plus: true, embers: 2000 } },`

**T4 · Faking a restored install (no Google backup needed).** Quarantine/restore-notice fire when
`installedAt > lastSavedAt` ([`restoreDetect.js:12`](../src/persistence/restoreDetect.js#L12)), and
`serialize()` stamps `lastSavedAt = Date.now()` on every autosave. So: use the app → emulator Settings →
System → Date & time → **turn off automatic and set the date back ~5 days** → open the app and change
anything (one autosave stamps a past date) → force-stop → set the clock back to today → relaunch.

**T5 · Real Auto Backup, if you want the true path once.** The emulator has a local backup transport, no
Google account needed:
`adb shell bmgr transport com.android.localtransport/.LocalTransport` · `adb shell bmgr backupnow app.dailyrituals.mobile` ·
`adb uninstall app.dailyrituals.mobile` · reinstall · `adb shell bmgr restore <token> app.dailyrituals.mobile`

**T6 · Release builds work locally.** `android/app/build.gradle` signs `release` with the **debug**
keystore, so `npx expo run:android --variant release` needs no keystore setup. That build has **no dev
harness** (`__DEV__` false) and no Metro.

---

## WALK-01 — v2→v3 mood migration

**Covers:** IMP-037's `SCHEMA_VERSION` 2→3 (`mood: string` → `moods: string[]`). **The only change in the
post-vc11 batch that can destroy a real journal**, and a fresh install never runs the migrator.

**Why a fixture instead of installing vc11.** [`backup.js:48`](../src/backup/backup.js#L48) runs a restored
payload through `deserialize()` — the **same function** the cold-start load calls
([`storage.js:10`](../src/persistence/storage.js#L10)), therefore the same migrator. Restoring a v2 file
exercises the real path without building the old version.

**Preconditions**

1. `node scripts/gen-v2-fixture.js` — writes `scripts/daily-rituals-v2-fixture.json` (git-ignored;
   regenerate rather than reuse, its `dayKey`s are relative to the run date).
2. `adb push scripts/daily-rituals-v2-fixture.json /sdcard/Download/`
3. **Reset the app first** (You → Reset all data). Non-negotiable if the emulator still holds the poisoned
   settings from the 2026-08-09 attempt — bad settings persist to AsyncStorage and survive relaunches.

The fixture is 12 entries at `version: 2` containing four deliberate shapes: ordinary `mood: 'Grateful'`
(→ one mood), **no `mood` key** (→ `[]`), **already `moods: ['Hopeful','Tender']`** (→ untouched,
idempotency), and `mood: ''` (→ `[]`, **not** `['']`). It also omits `frozenDays`, `seenTips`, `trash` and
`freeRestoresUsed` on purpose, so the app's `?? []` / `?? 0` fallbacks get exercised on genuinely old data.

**Steps + expected**

1. You → Your journal is safe → **"Restore from a backup"** → pick the file. *(This much already passed on
   2026-08-09.)*
2. Archive shows **12 days**; name reads "Migration Test"; 375 embers; 2 candles; Lv 4 · Reflective.
3. **Mood chips render.** One entry shows **two** chips, two entries show **none**, and there is no blank
   or empty chip anywhere. ← *the actual point of this walk, not yet done*
4. Insights → Mood mix populated, with the `across N reflections` denominator line.
5. Heatmap cells are coloured (they read `moods[0]`).
6. Archive → search → mood chips filter correctly, and the two-mood entry matches **either** of its moods.
7. Write today's entry → multi-select still works; the "Name how it felt" rite ticks.
8. **Force-stop and relaunch.** ← the real proof: the migrated payload was written back as v3 and re-reads
   clean, with no second migration and no crash.
9. Harness → Inspect → `frozenDays` / `seenTips` / `trash` came up empty rather than undefined.

**If it fails:** record the exact entry index and what its `moods` value is (Inspect shows it). Do not
edit the migrator during the walk.

**Log — 2026-08-09, first attempt, ABORTED (tester error, not an app defect).** The restore itself worked
and every derived value was correct on screen (12-day streak, name, Lv 4, 110/350 XP, 2 candles, "Today is
at rest"). The walk was abandoned because the fixture wrote `settings.accent` as a **string** where the app
expects the `[accent, deep, soft]` **array**, which broke every gradient in the app. Fixture fixed and now
type-checked against `DEFAULT_SETTINGS`; the underlying app fragility it exposed is scoped as **IMP-049**.
Steps 3–9 remain undone.

---

## WALK-02 — restore quarantine

**Covers:** IMP-033 (quarantine + offer) and IMP-029 (the restore notice). **The riskiest new code in the
batch — it clears the live storage key**, and it has never run outside jest.

**Preconditions:** a populated journal (write 3–4 entries, buy a palette so there is paid inventory to
warn about), then technique **T4**.

**Steps + expected**

1. After T4, the app comes up as a **genuine first install** — full onboarding, zero entries, no name.
2. Finish onboarding → the **RestoreOffer** sheet appears, stating: it replaces the fresh start · the
   dated staleness · the paid-inventory line (embers / palettes / skies / candles).
3. Run each action on a **separate** T4 cycle:
   - **Load my journal** → confirm → old data returns intact, and a recovery copy of the *fresh* state was
     written first.
   - **Restore from a file** → routes into the JSON import.
   - **Keep this fresh start** → the sheet hides and the **stash is NOT destroyed**.
4. After declining: You → "Your journal is safe" has a **`Google backup — {date}`** row → tapping reopens
   the sheet → a separate **Discard** confirms with the inventory line repeated.
5. After declining, **force-stop and relaunch** — the stash and the row are both still there.
6. Set `lastBackupAt` newer than the stash via the harness → the sheet should **invert emphasis** and lead
   with "Restore from a file" (`preferredSource`).

**If it fails:** the failure that matters most is *live data cleared without a readable stash*. If that
happens, stop and capture the Inspect output before touching anything.

---

## WALK-03 — JSON export round trip

**Covers:** IMP-020, plus IMP-043's backup-health copy.

1. You → **"Back up my journal"** → the share sheet appears → save the file out.
2. The success toast says plainly that this export and the Google Auto Backup are **separate systems** and
   neither refreshes the other (the IMP-033 copy fix).
3. Reset all data → **"Restore from a backup"** → pick that file → everything returns.
4. Harness → `staleBackup` (42d) and `neverBackedUp` scenarios → the "Your journal is safe" card shows the
   right warning line for each.
5. Restore a deliberately corrupt file (truncate the JSON in a text editor) → a clean *"That backup file
   looks damaged"* message, **not** a crash. *(Note: this is the surface IMP-049 hardens — expect the
   envelope-level rejection to work today and shape-level damage to slip through until IMP-049 lands.)*

---

## WALK-04 — search + moods

**Covers:** IMP-035, IMP-037. Needs ~15 entries (harness) with varied moods.

1. Archive → search filters live across **both** `did` and `wished`.
2. Case-insensitive; accented input matches unaccented text and back (`cafe` vs `café`) — the `normalize`
   fallback is Hermes-dependent, so this must be checked on-device, not assumed.
3. Mood chips are **multi-select** (any-of); the date range opens a month list; "Any time" clears.
4. Zero results shows *"Nothing matches that yet…"* — **different copy** from the zero-entries
   *"Nothing here yet."*
5. **The heatmap does not react to the filters** — it is the record of the year, not of the query.
6. Write flow: pick **multiple** moods; add a **custom** one via "Name your own…"; it persists and
   reappears as a chip next session; adding it twice dedups.

---

## WALK-05 — custody of your words

**Covers:** IMP-036, IMP-048.

**Done 2026-08-09:** the trash allowance — three free restores tick down, the fourth is visibly locked and
explains itself, state survives a relaunch. IMP-048 was written from this walk.

**Still outstanding — the `applyCompletion` trap, which is the risky half:**

1. **Note your XP and ember counts.** Open a **past** entry → edit → save. Both counters **unchanged**, no
   duplicate row appears, the entry keeps its original date position.
2. Repeat with today written, and with today unwritten. Both must be free.
3. Delete a mid-streak day → the confirm shows the **real post-delete streak**, and adds "One of your
   keepsakes may go with it" only when a delete genuinely un-earns an achievement.
4. Set the clock forward 31 days → `pruneTrash` drops the item on the next launch.

---

## WALK-06 — streak insurance

**Covers:** IMP-039.

1. Harness → `lapsed` scenario (5 days gone) + **freezes ≥ 5** → relaunch. `applyAutoFreeze` runs on mount
   and the streak **survives**.
2. Freezes decrement by exactly one per missed day.
3. Gap longer than candles owned → only the affordable prefix is frozen, the streak still breaks, and the
   candles are consumed anyway (intended).
4. Relaunch again → **idempotent**, no further spend.
5. Write today after a freeze → the celebration's streak number matches the Home hero.
6. Shop copy reads *"A candle spends itself the moment you miss a day…"* — both old false claims gone.

---

## WALK-07 — modal scroll

**Covers:** IMP-042, and the four follow-up viewport-cap commits (`306a0bc`, `d9b7bc0`) that treated it as
an Android modal-measure race rather than the original static theory.

Each of **Achievements · Shop · Reading sheet · Get Embers · Manage Subscription** must scroll to its last
card, with the last card clearing the system nav bar. Check with **gesture nav and 3-button nav** (different
inset heights) and again at max font size, which is where the overflow is worst. Paywall was deliberately
left alone — confirm its fixed footer still sits correctly.

---

## WALK-08 — font scale

**Covers:** IMP-030 regression across the nine screens that did not exist when it was walked:
`ArchiveFilters`, `TrashSheet`, `DeeperInsights`, `AnnualRecap`, `AnnualRecapCard`, `PlusPerks`, `TipCard`,
`RestoreOffer`, `OnThisDayCard`.

Emulator → Settings → Display → **font size max + display size largest**. No row may collapse to a
one-character-per-line column; rows auto-stack. Also run the harness `longName` scenario (40 chars) across
Home / You / Recap, and rotate each new sheet to landscape. Harness → Inspect shows
`PixelRatio.getFontScale()` next to `MAX_FONT_SCALE` / `CHROME_FONT_SCALE` — confirm the cap is biting.

---

## WALK-09 — lifetime heatmap

**Covers:** IMP-045. Use the `brokenStreak` scenario.

Insights → "Your record": the heatmap must show **four visually distinct** cell states — kept (filled),
**missed** (soft fill + border), **not yet started** (dashed outline), future (invisible) — and the legend
beneath must match the grid exactly. Month labels appear once per month down the left gutter. The level
line renders XP: `Lv 4 · {name} · 1,250 XP`.

---

## WALK-10 — teach the app

**Covers:** IMP-041.

1. One tip card on Today, Archive and You (**not** Insights). Dismiss → gone, and **still gone after a
   relaunch**.
2. You → **"How it works"**, six rows, each opening a real alert with a non-empty body.
3. Rites footer reads *"All rites kept — a full day."* / *"{n} of 3 kept today."* — not the old embers
   claim.
4. Archive at zero entries shows "Nothing here yet."; the Insights empty state has its second line.

---

## WALK-11 — the Plus surfaces

**Covers:** IMP-038, IMP-046, IMP-047, IMP-043. **Needs T1 and T3.** Run each item **twice** — once with
`plus: true`, once `false` — the locked teaser is as shippable as the real thing.

1. **On this day** — a real year-match card above "Today's reflection"; tapping a row opens the Reading
   sheet **and ticks the revisit rite**; dismiss suppresses it for today only and it returns tomorrow.
2. **Deeper Insights** — below the thresholds (14 entries / 3 months / 5 multi-mood entries) it must say
   **"Not enough days yet"**, not draw a chart from three points. Check both sides of each threshold.
3. **Annual Recap** — You → "Your years" lists offerable years; a year with <10 entries is **not** offered.
   Set the clock to December to check the Home card and its `recapSeen` dismissal.
4. **Paywall** — prices resolve from the sim service; the IMP-043 line *"Your journal lives on your device.
   Plus adds memory, not storage."* is present.
5. **Restore purchases** row appears in You when `plusEnabled && !plus`, and disappears once plus.
6. Flip `PLUS_ENABLED` back to `false` → confirm **Gather Embers** and its modal are gone and the ember
   pill toast fires instead (IMP-034).

---

## WALK-13 — the reminder you can answer

**Covers:** IMP-054 (foreground handler + tap routing) **and the out-of-band duplicate-fire fix** committed
`b773352` on 2026-08-13, which has never been seen on a running app.
**Target: device.** **Runner: 👤 owner.**
**⛔ Blocked until IMP-054 is code-complete** — steps 2–5 test code that does not exist yet. Step 1 is the
exception and can be run today, because the duplicate-fire fix is already in the tree.

**Why device, not emulator.** Two of the four things here are hardware behaviour. OEM battery managers
(Xiaomi / Realme / Oppo / Vivo) silently kill scheduled notifications, and real Doze timing is not what an
emulator simulates. An emulator ✅ here would be a weaker claim than it looks — and this subsystem already
has a history of the emulator misleading us: the 2026-08-02 walk could not settle the foregrounded case at
all, precisely because there was no `setNotificationHandler`.

**Preconditions.** A build carrying IMP-054 installed on real hardware. Reminder enabled (You tab), set 2
minutes out via the dev harness (technique **T2** → Notify).

**Steps + expected**

1. **The duplicate check — runnable now, before IMP-054.** Set a reminder, then force several re-arms:
   background/foreground the app repeatedly and save an entry while it is settling. Harness → Notify →
   the **intended-vs-pending diff** must show **exactly one pending notification per day**, never two for
   the same date. Then let one fire: **one banner, not two.** *(This is the fix in `b773352`. Before it,
   overlapping re-arms each cancelled then each scheduled, leaving two notifications at the same minute.)*
2. **Backgrounded → banner → tap → WriteFlow opens.** The tap routing is the half that has never existed;
   `PROGRESS.md`'s IMP-044 R8 checklist wrongly claimed it did.
3. **Foregrounded, today unwritten → no banner, no sound, and the app's own Toast appears** reading
   `Today is still unwritten.` The suppressed OS banner is the design, not a failure — on Android a silent
   banner is unachievable (`shouldPlaySound: false` suppresses the drop-down entirely), which is why the
   Toast exists.
4. **Foregrounded, today already written → nothing at all.** No Toast, no banner. Saying anything here
   would be nagging.
5. **Force-stop the app, let one fire, tap it → WriteFlow opens on the cold start.** This is the
   `getLastNotificationResponseAsync` half; the listener alone registers too late to catch a tap that
   *launched* the app, so a pass on step 2 does not imply a pass here. Walk both.

**If it fails:** record whether the notification arrived at all, what the Notify diff showed *before* it
fired, and which of foreground/background/cold-start broke. Do not edit the code during the walk.

---

## WALK-14 — TalkBack can write an entry

**Covers:** IMP-059. **Target: emulator** (TalkBack behaves the same here; nothing in this walk is hardware
behaviour). **Runner: 👤 owner** — it is gesture navigation with a screen reader, which is inherently manual.
**⛔ Blocked until IMP-059 is code-complete.**

Enable via emulator → Settings → Accessibility → TalkBack.

1. Swipe through **Home**: the write FAB announces itself as `Write today's entry`. Today it is a
   `Pressable` containing only an icon, with its `Write` label a *sibling* — so it announces as nothing.
2. The four tabs announce **which is selected**, not just their names.
3. Every icon-only dismiss in the overlay screens announces what it closes.
4. **The acceptance test: open, write and dismiss a WriteFlow entry using only TalkBack gestures.** If an
   entry cannot be written blind, IMP-059 is not done regardless of what the unit tests say.
5. Confirm decorative gradients/rings do **not** steal focus, and that heatmap cells still announce their
   day and moods (IMP-052 labelled them; do not relabel).

**If it fails:** note the exact control and what TalkBack announced instead. Scope a follow-up IMP rather
than fixing it in the walk chat.

---

## WALK-12 — the R8 release-variant pass

**Covers:** IMP-044 — a standing walk debt, and **the first minified build of this app ever**. Do it last:
no harness, no Metro, and it needs `PLUS_ENABLED` reverted. The failure mode is **silent stripping at
runtime, not a compile error** — jest cannot touch this.

`npx expo run:android --variant release` (technique **T6**).

- App launches; fonts load; **every SVG icon renders** (`react-native-svg` is the classic strip victim).
- **Daily reminder** — enable, set 2 min out, **background the app**, confirm it fires and tapping routes
  in. This is what the `expo-notifications` keep rule exists for; that library ships proguard rules gradle
  silently drops.
- JSON export → share → restore round trip.
- Paywall opens and prices resolve.
- Restore notice/offer still fires (redo T4 on the release build).
- Search, moods, trash, recap — anything touching `JSON.parse` / serialization.
- `grep -r "SENTINEL"` against the built bundle → **harness absent**.
- Note the APK size delta.

**If something is stripped:** add the specific keep rule. **Do not disable minify wholesale.** Full revert
is both flags in `app.config.js` to `false`.

---

## Out of scope for an emulator — these wait for hardware

- **Real Google Auto Backup.** Needs Play services, a real account, and the OS's own idle + charging +
  unmetered-Wi-Fi schedule. T5 approximates the *restore*, never the backup schedule.
- **OEM battery managers** silently killing scheduled notifications (Xiaomi / Realme / Oppo / Vivo).
  Unfixable in code — do not promise reliability in copy.
- **Foreground notifications — no longer unscoped, but still not an emulator job.** There is still no
  `setNotificationHandler` in the tree, so a reminder firing while the app is open shows nothing on
  Android. That is now **specced as IMP-054** and proven by **WALK-13 on a device**, not here.
- **A real transaction** (needs a licence tester account) and real store prices.
- **Real font metrics, notches, display cutouts.** IMP-030's margin was ~4% on real hardware.
- **Performance with 400+ entries on low-end hardware** — the search filter and heatmap re-render per
  keystroke.
- **Share-sheet targets** for the JSON export.
