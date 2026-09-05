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

**The order encodes what gates the release** (re-sorted 2026-08-14; re-tracked 2026-09-05). Everything
committed since the vc11 build on 2026-08-02 is still unpublished, and reaching the public needs a
**build**, not an OTA — a build that carries IMP-044's R8. So the rows are grouped by *what a failure
would cost*:

| Gate | Meaning |
| --- | --- |
| 🚦 | **Blocks the build.** Data loss, silent stripping, or a core loop that has never run outside jest. |
| 🎨 | **Follows the release.** A failure here is ugly, not destructive — ship, then walk, then OTA the fix. |
| 📦 | **Independent of the app release.** Listing assets; no build required, upload any time. |
| ⏭ | **Not needed for this release.** Covered code is unreachable in the shipped build. |

**Taking a walk is unchanged: take the first ⬜ row.** Passed walks live in `build-log.md` → "Walk log";
only live rows are described here.

**ONE track now — the vc13 build, and it is SHIPPED (2026-09-05).**

**vc12 is no longer the release candidate.** The owner's call: **vc13 is the future.** The
`internal` → `production` promotion of v1.0.6 / vc12 is **off**, and with it the reason those walks
were split across two builds. Every remaining ⬜ row now runs against **one build of
`feat/design-push`** — v1.0.7 / vc13, New Architecture.

✅ **That build now exists on Play `internal`** (submitted 2026-09-05 from commit `bbd5f45`; EAS build
`11dce1c2-…`, submission `bcb6c944-…`). **The device sitting is no longer blocked on cutting a build.**

⚠️ **But read this before installing anything.** There are **two** vc13 artifacts and they are not
interchangeable — the Play one is a **release** build with **no dev harness** (`__DEV__` false, no Metro),
so **T1, T2 and T3 do not exist on it**. That splits the remaining rows:

| Needs the **local debug APK** (harness) | Runs on the **Play `internal`** build |
| --- | --- |
| **WALK-13** (T2 → Notify, to fire a reminder minutes out) | **WALK-12** — and it *must* be this build |
| **WALK-03 step 4** (`staleBackup` / `neverBackedUp` scenarios) | **WALK-17**, **WALK-08**, WALK-03 steps 1-3 + 5, WALK-16's hardware residue |

**They cannot coexist** — same `applicationId`, different signing keys, so swapping means uninstall, which
wipes data. **Export a backup first**; that export *is* WALK-03 step 1, so sequence the sitting to get it
for free. Full artifact table in [`PROGRESS.md`](../PROGRESS.md) → "The vc13 builds".

**⚠️ The owner set the emulator bar on 2026-09-05, and it changes how these rows close.** The instruction
was explicit: **run what the emulator can run and record it as done, not as smoke.** So **WALK-16 and
WALK-17 are closed ✅ on emulator evidence**, and the `device`-≠-`emulator` rule in the header above is
knowingly set aside for those two rows. What that buys is real — **IMP-077 is unblocked**. What it costs
is named in each row and does not go away by being closed: nothing here has met real doze, an OEM battery
manager, a real share target, or Google's own backup schedule. **WALK-13 was dropped from the pass at the
same instruction** — neither run nor failed, and IMP-054 plus `b773352` remain unproven on any running app.

**What is actually left.**
- **WALK-03 step 4 (`neverBackedUp` only)** — waiting on `IMP-081`. Steps 1, 2, 3 and 5 passed.
- **WALK-07 (Paywall only)** — waiting on `IMP-080`. Every other screen in it passed.
- **WALK-08 — partial.** The font cap is confirmed biting; eight of its nine named screens, plus rotation
  and the `longName` scenario, are still unrun.
- **WALK-12 (R8) — last, and the one row that cannot move.** R8 must be walked on the exact build you
  intend to ship, so any fix an earlier walk turns up invalidates an R8 pass taken before it. It needs the
  Play `internal` build (A), which has no dev harness.
- **WALK-18** — needs IMP-077 landed first, so it is a later sitting by construction.

**Both blocking specs are takeable right now and neither needs a device** — `IMP-080` and `IMP-081` touch
different files, so they can go in either order or in parallel.

**WALK-09 is closed (✅ 2026-09-05)** — it cleared Insights before the Claude Design request lands on that
screen.

**Everything here still runs on `feat/design-push` — a branch that is never pushed to GitHub** (owner
instruction, 2026-08-17).

**`PLUS_ENABLED = false`, so WALK-11 stays ⏭** — those surfaces are *unmountable*, not
locked. It is the row that reopens the moment Plus becomes the active work.

| # | Gate | Walk | Covers | Target | Runner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| WALK-01 | ✅ | [v2→v3 mood migration](build-log.md#walk-01--v2v3-mood-migration) | IMP-037 | emulator | 🤖 mostly | ✅ **2026-08-14** — full pass, all 9 steps; detail in `build-log.md` → "Walk log" |
| WALK-02 | 🚦 | [Restore quarantine — offered, not imposed](build-log.md#walk-02--restore-quarantine) | IMP-033, IMP-029, **IMP-062** | emulator | 👤 (clock changes + judgement on sheet copy) | ✅ **2026-08-15** — full pass, all 9 steps (incl. the new IMP-062 relaunch proof in steps 7–9); detail in `build-log.md` → "Walk log" |
| WALK-05 | 🚦 | [Edit a past day, delete, trash allowance](build-log.md#walk-05--custody-of-your-words) | IMP-036, IMP-048 | emulator | 👤 | ✅ **2026-08-15** — full pass; the outstanding `applyCompletion` half confirmed no double-counting; detail in `build-log.md` → "Walk log" |
| WALK-04 | 🎨 | [Search + the write flow's moods](build-log.md#walk-04--search--moods) | IMP-035, IMP-037, **IMP-053** | emulator | 👤 | ✅ **2026-08-16** — full pass on the third re-run (after IMP-069/070/071 landed); two more defects found and fixed live as IMP-072; detail in `build-log.md` → "Walk log" |
| WALK-13 | 🚦 | [The reminder you can answer](#walk-13--the-reminder-you-can-answer) | IMP-054, **+ the duplicate-fire fix** | **device** (OEM behaviour + real doze) | 👤 | ⏸ **DROPPED from this pass — owner's instruction, 2026-09-05.** Not run, not failed. IMP-054 and `b773352` remain unproven on any running app. The row stays here because the debt is real; it reopens whenever the owner wants it. |
| WALK-03 | 🚦 | [JSON export → share → restore round trip](#walk-03--json-export-round-trip) | IMP-020, IMP-043 | **device** (share-sheet targets) | 👤 | ❌ **2026-09-05 (emulator, agent-run) — steps 1, 2, 3 and 5 all pass; step 4 fails on one of its two cases.** Export → share sheet → well-formed envelope ✅; the IMP-033 two-systems toast ✅; reset → restore → everything returns ✅; truncated file → clean *"That file isn't readable as a backup."*, no crash ✅. **`staleBackup` card ✅ but `neverBackedUp` truncated mid-word** — **✅ IMP-081 LANDED 2026-09-05** (archived to `build-log.md`): `numberOfLines` 2 → 3, row top-aligned. **READY TO RE-RUN: step 4 only, `neverBackedUp` scenario, at default AND max font scale** — max font is where the third line actually gets tested, and default alone would pass vacuously. Pure JS, so a debug build of the branch carries it. Delivery to a real share target stays unexercised. |
| WALK-12 | 🚦 | [The R8 release-variant pass](#walk-12--the-r8-release-variant-pass) | IMP-044 | **device** | 👤 | ⬜ — **the last 🚦, and it cannot move: R8 must be walked on the exact build you intend to ship.** ✅ **That build now exists: v1.0.7 / vc13 on Play `internal`** (2026-09-05) — install it from Play and walk this row **last**, after every other row has cleared, because any re-cut build invalidates a pass taken before it. Failure is silent |
| WALK-06 | 🎨 | [Streak insurance — candles spend themselves](build-log.md#walk-06--streak-insurance) | IMP-039, IMP-063, IMP-064 | emulator | 👤 | ✅ **2026-08-16** — full pass, re-run after IMP-063 + IMP-064 landed; detail in `build-log.md` → "Walk log" |
| WALK-07 | 🎨 | [Modal screens actually scroll](#walk-07--modal-scroll) | IMP-042 | emulator | 👤 (visual, two nav modes) | ❌ **2026-08-16 (whole-walk re-run, reopened again)** — the five other screens + both IMP-067 spot-checks all pass, both nav modes, max font. **Paywall still fails after IMP-074** — footer overlaps the plan selector + disclaimer from first open, both fix-halves confirmed present in code. **✅ IMP-080 LANDED 2026-09-05** (archived to `build-log.md`) — the footer left the flex column for `position: absolute, bottom: 0` and the root took an exact `height: winH`. **READY TO RE-RUN: the Paywall half only.** Pure JS, so a debug build of `feat/design-push` carries it. ⚠️ **Jest cannot close this row** — it renders a tree, not pixels, and cannot see an overlap; the added regression test says so in a comment. Needs T1 |
| WALK-08 | 🎨 | [Font scale + layout on the nine new screens](#walk-08--font-scale) | IMP-030 regression | **device** (real font metrics) | 👤 | 🟠 **PARTIAL — 2026-09-05 (emulator, agent-run).** Cap confirmed biting: OS `font_scale` 2.0 clamps to `MAX_FONT_SCALE` 1.5 body / `CHROME_FONT_SCALE` 1.2 chrome, and **the app must be restarted for a scale change to take** (RN reads it at startup — a live change moves system UI only, which reads exactly like a passing cap and is not one). Clean at max font: Home, Insights, Reflections + `ArchiveFilters`, You (rows auto-stack), achievements + shop sheets. ⚠️ **Still unrun: `TrashSheet`, `DeeperInsights`, `AnnualRecap`, `AnnualRecapCard`, `PlusPerks` (needs T1), `TipCard`, `RestoreOffer`, `OnThisDayCard`; the `longName` scenario; landscape rotation.** |
| WALK-09 | 🎨 | [Lifetime heatmap's four states + the XP line](build-log.md#walk-09--lifetime-heatmap--closed-2026-09-05-emulator-owner-run) | IMP-045, **IMP-073** | emulator | 👤 (visual) | ✅ **2026-09-05** — full pass on the re-run after IMP-073; all three 2026-08-16 defects fixed, re-confirmed at max font. **`not yet started` was not exercised** (fixture has no pre-first-entry days) and the walk was closed with that gap recorded; detail in `build-log.md` → "Walk log" |
| WALK-10 | 🎨 | [Tips, explainers, empty states](build-log.md#walk-10--teach-the-app) | IMP-041 | emulator | 👤 | ✅ **2026-08-16** — full pass, all 4 steps; owner decided live to drop the tip cards anyway, reserved as **IMP-075**; detail in `build-log.md` → "Walk log" |
| WALK-14 | ⏭ | [TalkBack can write an entry](build-log.md#-walk-14--talkback-can-write-an-entry--dropped-2026-08-16-owners-call-section-moved-here-2026-08-17) | IMP-059 | **device** | 👤 | ⏭ — **dropped 2026-08-16** per owner; section archived to `build-log.md` → "Walk log". Reopen trigger: an accessibility complaint, or institutional Plus buyers |
| WALK-15 | ✅ | [Store screenshots regenerate](build-log.md#walk-15--store-screenshots-regenerate--closed-2026-08-16-emulator-agent-run-owners-call) | IMP-061 | emulator | 🤖 mostly | ✅ **2026-08-16 — closed at owner's call.** `npm run shots` green end to end, seven Play-legal assets committed; steps 1–3 + 7 passed, **4–6 accepted unrun**; detail in `build-log.md` → "Walk log" |
| WALK-11 | 🎨 | [The Plus surfaces](#walk-11--the-plus-surfaces) | IMP-038, 046, 047, 043 | emulator | 👤 | ⬜ — **REOPENED 2026-09-05. The reason it was skipped is gone:** `PLUS_ENABLED = true` (commit `7d2e515`), so these surfaces now mount on their own and **no T1 revert dance is needed.** Walkable on a debug build of `feat/design-push`. Covers the four *perks* (On this day, Annual Recap, Deeper insights, restores); the *purchase* half is **WALK-19**, which is a different row on a different build |
| WALK-16 | 🚦 | [The New Architecture cold start](#walk-16--the-new-architecture-cold-start) | IMP-076 | **device** (native runtime) | 👤 | ✅ **2026-09-05 — closed on emulator evidence at owner's instruction.** All 7 steps exercised across two agent-run sittings (1-3 New Arch live: Bridgeless + Fabric + TurboModule; 4-7 storage / notification scheduling / export-share-reimport / Auto Backup via T5 with the quarantine offering not imposing). **Owner's call 2026-09-05: emulator results are recorded as done, not smoke.** ⚠️ **Named gap — never exercised anywhere:** real doze, OEM battery managers, delivery to a real share target, Google's own backup schedule. **Unblocks IMP-077.** |
| WALK-17 | 🚦 | [Edge-to-edge, re-audited under New Arch](#walk-17--edge-to-edge-re-audited-under-new-arch) | IMP-076, IMP-027 regression | **device** | 👤 (visual) | ✅ **2026-09-05 — emulator, agent-run.** All four tabs clean under status bar + gesture bar in **both** day and night; bottom nav and write-FAB correct in **both** gesture and 3-button nav; onboarding + setup also clean. Sheets checked: trash, achievements, shop — the last two at night **and** max font. ⚠️ **Not opened: write flow, reading sheet, mood manager.** |
| WALK-18 | 🎨 | [The app moves](#walk-18--the-app-moves) | IMP-077 | **device** (mid-range, real frame pacing) | 👤 (visual) | ⬜ — **branch-only. UNBLOCKED 2026-09-05: WALK-16 closed and IMP-077 landed.** ✅ **The build now exists: v1.0.8 / vc14 shipped to Play `internal` 2026-09-05 19:09** (EAS `87f81b24…`, submission `4b7cf3a2…`, from commit `6590834`). IMP-077 added `react-native-reanimated` + `react-native-worklets` (native deps), so **neither vc13 artifact carries this code** — install vc14 from Play, not an older APK. **An emulator cannot settle this row** — it renders dropped frames as smooth, which is the thing being judged. The jest suite is blind here too: the Reanimated mock no-ops every hook |
| WALK-19 | 🚦 | [Money actually changes hands](#walk-19--money-actually-changes-hands) | **Phase 10b.5**, IMP-028, IMP-082, `7d2e515`, `6590834` | **device** (real Play Billing + a license tester) | 👤 | ⬜ — **NEW 2026-09-05, and it is the gate on v1.1.** `PLUS_ENABLED` is true and v1.0.8 / vc14 is cut to Play `internal`; **every claim the paid surface makes is still unproven at runtime.** jest is structurally blind here — `simService` fakes every purchase result, so a green suite says nothing about Play Billing. **Nothing gets promoted `internal` → `production` until this passes.** |

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

## WALK-03 — JSON export round trip

**Covers:** IMP-020, plus IMP-043's backup-health copy. **Target: device** (real share-sheet targets).
**🚦 Gates the release build** — this is the user's only way to get their words out of the app.

1. You → **"Back up my journal"** → the share sheet appears → save the file out.
2. The success toast says plainly that this export and the Google Auto Backup are **separate systems** and
   neither refreshes the other (the IMP-033 copy fix).
3. Reset all data → **"Restore from a backup"** → pick that file → everything returns.
4. Harness → `staleBackup` (42d) and `neverBackedUp` scenarios → the "Your journal is safe" card shows the
   right warning line for each.
5. Restore a deliberately corrupt file (truncate the JSON in a text editor) → a clean *"That backup file
   looks damaged"* message, **not** a crash. *(Note: this is the surface IMP-049 hardens — expect the
   envelope-level rejection to work today and shape-level damage to slip through until IMP-049 lands.)*

**Result — ❌ 2026-09-05 (emulator, agent-run; v1.0.7 / vc13 debug APK, `sdk_gphone16k_arm64`, API 36).**
Four of the five steps pass and one fails on half its cases. **Step 1:** `Back up my journal` wrote
`daily-rituals-2026-09-05.json` and opened the real Android share sheet (Quick Share / Drive / Gmail
resolved); the envelope pulled off the device is well-formed — `format: daily-rituals-backup`,
`appVersion: 1.0.7`, `counts: {entries: 5, days: 5}`, payload a stringified state. **Step 2:** the toast
reads *"Backup ready — save it somewhere off this phone. This doesn't update your Google backup."* — the
IMP-033 copy, saying plainly that the two systems are separate; the row flipped to "Backed up today" and
the health nudge cleared. **Step 3:** `Reset all data` → onboarding → skip → restore `dr-good.json` → the
confirm read *"This backup has 5 entries. It will replace what's on this phone now (0 entries)."* and the
data came back exactly (5-day streak, Lv 3 Contemplative, rites 20/30, 5 entries / 32 words). **Step 5:**
a file truncated to 1200 bytes was rejected with *"That file isn't readable as a backup."* — a toast, not
a crash, exactly the envelope-level rejection this walk predicted would work today.

**Step 4 is the failure, and only on one of its two cases.** `staleBackup` (42d) is correct: the row reads
"Backed up 42 days ago — back up again soon" and the warning reads in full, over two lines. `neverBackedUp`
truncates mid-word — *"…there's nothing to bring ba…"* — **at default font scale**, and worse at max
(*"there's nothing t…"*). Cause found in the file, not guessed:
[`BackupNudge`](../src/screens/YouScreen.js#L316) clamps at `numberOfLines={2}` and the `never` string is
97 chars against `stale`'s 62. **Scoped 2026-09-05 as [`IMP-081`](specs-open.md).** Re-run **step 4 only**
once it lands, at both font scales.

**Unexercised, and an emulator cannot settle it:** delivery to a real share *target*. The sheet resolves
targets and hands off; nothing on this machine receives the file.


---

## WALK-07 — modal scroll

**Covers:** IMP-042, and the four follow-up viewport-cap commits (`306a0bc`, `d9b7bc0`) that treated it as
an Android modal-measure race rather than the original static theory.

Each of **Achievements · Shop · Reading sheet · Get Embers · Manage Subscription** must scroll to its last
card, with the last card clearing the system nav bar. Check with **gesture nav and 3-button nav** (different
inset heights) and again at max font size, which is where the overflow is worst. Paywall was deliberately
left alone — confirm its fixed footer still sits correctly.

**Result — ❌ 2026-08-15.** Achievements, Shop, Reading sheet and Get Embers all passed in both nav modes,
at normal and max (2.0x) OS font scale. Manage Subscription also passed — its content is short enough it never
needed to scroll to the nav bar. The font-scale cap itself is confirmed working (`PixelRatio.getFontScale()`
read `2.0` against the `1.5`/`1.2` caps, nothing broken on the four passed screens). One real defect and two
bonus defects surfaced, written up in full (with file:line) in `PROGRESS.md` → Open items → "WALK-07 finding":
(a) Paywall's fixed footer overlaps its own content (plan amount + last perk bullets) even at normal font
size — the `ScrollView` above the footer is never given `flex: 1`, so it doesn't yield space to the footer;
(b) Annual Recap's teaser description on the You tab truncates at max font because `Row.js` hardcodes
`numberOfLines={1}`; (c) Mood Mix bars in Insights misalign depending on mood-name length, at any font size —
the label column uses `minWidth` instead of a fixed `width`. (a) blocks the Paywall half of this walk from
being called a pass; (b) and (c) were found incidentally and don't block the passed screens. Each needs a new
`IMP-xxx` — Opus's lane to scope, not this walk's. **T1 (`PLUS_ENABLED`) was reverted to `false` after this
walk — confirmed in `src/billing/config.js:39` before anything else touches this file.**

**Re-run — ❌ 2026-08-16 (Paywall only; T1 flipped for the session).** (b) and (c) landed as IMP-067 —
not yet re-checked this session. (a)'s fix, IMP-068 (`style={{ flex: 1 }}` on the `ScrollView`), turned out
incomplete: on first opening Paywall the footer is missing entirely (not just overlapping) — Android's modal
`Dialog` doesn't know its window size on the first measure pass, so `flex: 1` alone bounds nothing, same trap
`Shop.js:23-29` already documents. Selecting a plan triggers the correcting layout pass, and the footer
reappears **still overlapping** the price and perks, same as before IMP-068. Full root-cause writeup and the
fix `Shop.js` already uses (`maxHeight: winH` via `useWindowDimensions`) in `build-log.md` → "WALK-07
finding" (reopened). **Scoped 2026-08-16 as `IMP-074`** (`docs/specs-open.md`) — it keeps IMP-068's
`flex: 1` and adds `maxHeight: winH` as the second half; both are needed. **Walk paused here at the owner's
call** — the other five screens' nav-mode/font-scale checks and the IMP-067 spot-check were not re-run this
session, so the re-run after IMP-074 is a **whole-walk** re-run, not a Paywall-only one.

**Re-run — 🟡 2026-08-16 (whole walk, later the same day; T1 flipped for the session, reverted after).**
Achievements, Shop, Reading sheet, Get Embers and Manage Subscription all passed again — both nav modes
(gesture and 3-button), and at max (2.0x) OS font scale, no regressions. Both IMP-067 spot-checks also passed:
the Annual Recap teaser on You wraps instead of truncating at max font, and Mood Mix bars in Insights stay
aligned regardless of label length. **Paywall still fails — IMP-074 did not fix it.** On first open, normal
font size, gesture nav: the fixed footer overlaps the plan-selector row (annual/monthly) and the "Your journal
lives on your device" line from the very first frame the owner saw — not the delayed-then-correcting layout
pass IMP-074's writeup described, wrong immediately instead. Confirmed in code that both IMP-074 fix-halves
are present and unchanged — `maxHeight: winH` on the root `View` ([`Paywall.js:40`](../src/screens/Paywall.js#L40))
and `flex: 1` on the inner `ScrollView` ([`Paywall.js:56`](../src/screens/Paywall.js#L56)) — so this is the
fix not holding, not an unshipped fix. The plan selector stays tappable underneath the overlap, so a purchase
can still be started; this is a layout defect, not a blocked flow. The owner raised an alternative design
live: don't render the footer at all until a plan is picked, then let the page grow to fit it, rather than
reserving space for it up front — a real option for the next spec to weigh, not decided here. **Re-opened as
a WALK-07 finding below — needs Opus to scope a new `IMP-xxx`.** T1 reverted to `false` after this session,
confirmed in [`src/billing/config.js:39`](../src/billing/config.js#L39).

---

## WALK-08 — font scale

**Covers:** IMP-030 regression across the nine screens that did not exist when it was walked:
`ArchiveFilters`, `TrashSheet`, `DeeperInsights`, `AnnualRecap`, `AnnualRecapCard`, `PlusPerks`, `TipCard`,
`RestoreOffer`, `OnThisDayCard`.

Emulator → Settings → Display → **font size max + display size largest**. No row may collapse to a
one-character-per-line column; rows auto-stack. Also run the harness `longName` scenario (40 chars) across
Home / You / Recap, and rotate each new sheet to landscape. Harness → Inspect shows
`PixelRatio.getFontScale()` next to `MAX_FONT_SCALE` / `CHROME_FONT_SCALE` — confirm the cap is biting.

**Result — 🟠 PARTIAL, 2026-09-05 (emulator, agent-run).** The cap is real and biting: with OS `font_scale`
at 2.0, app text renders at `MAX_FONT_SCALE` 1.5 and chrome at `CHROME_FONT_SCALE` 1.2
([`src/ui/textScale.js`](../src/ui/textScale.js)) — tab labels stay small while body text grows.

**One trap worth more than the result.** React Native reads the font scale **at startup**. Changing
`font_scale` under a running app moves the system UI immediately and the app not at all — which looks
exactly like a correctly-clamping cap and is not. The app must be force-stopped and relaunched (and for
build B, re-attached to Metro) before any measurement here means anything. The first pass of this walk was
read wrong for precisely that reason before the relaunch corrected it.

**Clean at max font:** Home (hero, rites, "No candles…" wrapping to two lines), Insights, Reflections
including `ArchiveFilters` (mood chips scroll horizontally as designed, From/To stay side by side), You —
where rows auto-stack rather than collide ("Writing prompts / Everyday", "About Daily Rituals / v1.0").
Achievements and shop sheets also clean at max font. No row anywhere collapsed to one character per line.

⚠️ **Still unrun and this row stays open for them:** `TrashSheet`, `DeeperInsights`, `AnnualRecap`,
`AnnualRecapCard`, `PlusPerks` (needs T1), `TipCard`, `RestoreOffer`, `OnThisDayCard`; the harness
`longName` (40-char) scenario across Home / You / Recap; landscape rotation of each new sheet; and the
harness Inspect readout of `PixelRatio.getFontScale()` against the two caps.


---

## WALK-11 — the Plus surfaces

**Covers:** IMP-038, IMP-046, IMP-047, IMP-043. **Needs T1 and T3.** Run each item **twice** — once with
`plus: true`, once `false` — the locked teaser is as shippable as the real thing.

**⏭ Skip this for the current release.** `PLUS_ENABLED = false` makes every surface here *unmountable*, not
locked — none of it can reach a user in the build being cut. Walking it means flipping T1, which must be
reverted before committing, so a mistake here ships a paywall the app cannot honour. Do it when Phase 10b
opens, not before.

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
**✅ Unblocked 2026-08-13** — IMP-054 is code-complete (`18d8c2e`) and the duplicate-fire fix (`b773352`)
is in the tree. All five steps are runnable. **🚦 This gates the release build.**
**Neither commit has ever run on a phone**, which is exactly what makes this a gate rather than polish.

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

## WALK-12 — the R8 release-variant pass

**Covers:** IMP-044 — a standing walk debt, and **the first minified build of this app ever**. The failure
mode is **silent stripping at runtime, not a compile error** — jest cannot touch this.

**🚦 The LAST gate, and the reason is not squeamishness.** R8 must be walked on the build you actually
intend to ship. If WALK-02/05/13/03 turn up a fix, that fix changes the bundle R8 minifies, and an R8 pass
taken before it proves nothing about what ships. Practical consequences: no dev harness (`__DEV__` false),
no Metro, and `PLUS_ENABLED` must be back to `false` before you build.

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

## WALK-16 — the New Architecture cold start

**Covers:** IMP-076 · **Target:** **device** · **Runner:** 👤 · **Gate:** 🚦 — **this walk gates IMP-077.**

**Read this first.** IMP-076 flips `newArchEnabled` to `true` in `app.config.js` and
`android/gradle.properties`. It changes **no app code** — which means **`npm test` cannot see it at all.**
A fully green suite is compatible with an app that redboxes on launch. This walk is the only evidence
that exists.

**Build from `feat/design-push`. Do not push the branch to run this.**

**Why every step below is a native surface.** The audit in the design doc cleared
`react-native-svg`, `async-storage` and `safe-area-context` on paper (`codegenConfig` + New Arch
sourcesets) and every `expo-*` module by virtue of SDK 54 defaulting to New Arch. Paper is not a device.
Each step exercises one of those cleared claims.

1. **Cold start.** Force-stop, launch. No redbox, no ANR. **If this fails, stop — steps 2-7 are moot.**
2. **SVG everywhere** (`react-native-svg`) — the Home hero renders **the sun and its rays**, every tab
   icon draws, the heatmaps paint. This is the highest-traffic native view in the app.
3. **Safe-area insets** (`safe-area-context`) — status bar and bottom nav are not clipped or overlapped
   on Home, and the bottom nav sits above the gesture bar.
4. **Storage round trip** (`async-storage`) — write an entry, force-stop, relaunch, the entry is still
   there. This is the whole app's persistence layer.
5. **Notifications** (`expo-notifications`) — set a reminder, confirm it fires. OEM battery managers are
   a known confound (see "Out of scope"); what is being tested here is that the module *initialises and
   schedules* under New Arch, not the OS's delivery discipline.
6. **File I/O + share** (`expo-file-system`, `expo-sharing`, `expo-document-picker`) — export a backup,
   share it, re-import it.
7. **Android Auto Backup** — uninstall → reinstall → data returns without login. This is IMP-006's
   contract and it runs through the native backup agent.

**On failure — this is the deliverable, do not fix it here.** Record exactly what was observed, then:
both `newArchEnabled` flags back to `false`, rebuild, confirm the failure clears. **IMP-077 then falls
back to bare `Animated`** — Reanimated 4 is New Arch-only, but the design work (IMP-078) is *not* blocked
either way, and the motion contract was deliberately written to survive this outcome. Scope the failure
as a new `IMP-xxx` for Opus.

**🟡 Emulator smoke run — 2026-09-05. NOT A PASS; this row stays ⬜.** A `device` row run on an emulator
is not a pass (see the header rule), and steps 5-7 are exactly the ones an emulator cannot settle. But
IMP-076 had *no* runtime evidence at all, and this closes part of that gap. Run on `feat/design-push`
with a **v1.0.7 / vc13** debug APK (`expo prebuild` first, so the install genuinely stamps vc13 — an
earlier local build silently reported vc11 off a stale gradle cache).

**New Architecture is confirmed live at runtime, not merely configured.** logcat on cold start carries
`jni_lib_merge: Preparing to register libfabricjni_so`, the same for `libturbomodulejsijni_so`, and
`BridgelessReact: ReactHost{0}.startSurface(surfaceId = 0)`. Bridgeless is New-Arch-only. IMP-076's
evidence was previously limited to codegen `.so` files being *present* in the APK; this is the runtime
entering New Arch and rendering. **Step 1 (cold start, no redbox, no ANR), step 2 (SVG — the sun and rays
draw, every tab icon draws) and step 3 (safe-area — status bar clear, bottom nav above the gesture bar)
all pass here.** `prebuild` was verified not to have undone IMP-076: `newArchEnabled=true` and
`android.enableMinifyInReleaseBuilds=true` both survived.

One log line was chased and is benign: `ReactNativeJS: W Error: undefined` is preceded by
`URL: <host>:8081` and is dev-client connection logging, not an app error.

**🟡 Emulator smoke, part two — 2026-09-05, agent-run. Steps 4-7 now exercised; the row still stays ⬜.**
Same vc13 debug APK, same AVD (`sdk_gphone16k_arm64`, **Android 16 / API 36, 16 KB pages**). What an
emulator genuinely cannot settle is now a much shorter list than "steps 4-7" — it is three specific
things, all named under "Out of scope": **real doze + OEM battery managers, real share-sheet targets, and
Google's own backup schedule.** Everything else in steps 4-7 ran green.

- **Step 4 — storage round trip: PASS.** Wrote an entry through the real write flow (three steps, mood
  picker, `Bury the day`), confirmed `+50 XP / 1 day streak / +15 Embers`, then `am force-stop` and a cold
  relaunch. Home came back with streak 1, 50/100 XP, 15 Embers, "Today is at rest.", rites 20/30. The
  record in `RKStorage` survived intact: `{dayKey: 2026-09-05, did: "WALK16probe", wished: "step4probe",
  moods: ["Grateful"]}`. New Arch markers reproduced independently on this second cold start.
- **Step 5 — notifications, the half that is not doze: PASS.** Toggling `Daily reminder` on drove the
  Android 13+ `POST_NOTIFICATIONS` prompt, granted clean, and `dumpsys alarm` then showed **7 real
  `RTC_WAKEUP` alarms, one per day at 20:30**, first at 2026-09-06. The module initialises and schedules
  under New Arch — which is exactly what this step was written to prove. **Worth noting, not a defect:**
  today's 20:30 was *skipped* even though it had not yet passed, consistent with the entry already being
  written. Delivery discipline stays WALK-13's job on hardware.
- **Step 6 — file I/O + share: PASS on both ends, share target unexercised.** `Back up my journal` wrote
  `daily-rituals-2026-09-05.json` and opened the real Android share sheet (Quick Share / Drive / Gmail
  resolved as targets). The envelope is well-formed — `format: daily-rituals-backup`, `appVersion: 1.0.7`,
  `counts: {entries: 1, days: 1}`, payload a stringified state carrying the entry. Re-import through
  `Restore from a backup` launched `expo-document-picker` (`OPEN_DOCUMENT`, `application/json`), read the
  file back, and the confirm read **"This backup has 1 entry"** before replacing. State after import was
  byte-equivalent. Only the delivery to a real share *target* remains out of scope.
- **Step 7 — Android Auto Backup, via T5: PASS.** `bmgr` local transport → `backupnow` (Success,
  8.2 MB) → `adb uninstall` → reinstall → `bmgr restore 1`. **The restore quarantine behaved exactly as
  IMP-033/IMP-029/IMP-062 specify, and this is the part worth reading twice:** the restored state did not
  go live. It landed in `dailyrituals:v1:pendingRestore` with `dailyrituals:v1:state` cleared, the app
  showed onboarding, and only after onboarding did the **"We found your journal."** sheet offer it —
  correctly itemising *15 Embers, 1 palette and 2 skies* and dated 5 Sep 2026. `Load my journal` →
  a confirm reading **"This backup has 1 entry"** → data fully returned (1 entry, 50 XP, 15 Embers, both
  skies) and `pendingRestore` was cleared. The recovery copy the dialog promises was written for real:
  `files/daily-rituals-recovery-2026-09-05T09-42-22-485Z.json`. **Offered, not imposed — confirmed on a
  genuine backup-transport restore, not a T4 clock fake.**

No redbox, no ANR and no `FATAL`/`AndroidRuntime: E` at any point across all four steps.

**Expect one specific stumble, at install rather than runtime:**
`scripts/patch-permissions.js` may exit non-zero and fail `npm install` if New Arch moves the permissions
path. That is designed behaviour, not a walk failure — IMP-076 step 2 says what to do.

---

## WALK-17 — edge-to-edge, re-audited under New Arch

**Covers:** IMP-076, IMP-027 regression · **Target:** **device** · **Runner:** 👤 (visual) · **Gate:** 🚦

**Why this is not folded into WALK-16.** Android 16 *forces* edge-to-edge, and the New Architecture
changes the layout and insets path. IMP-027's edge-to-edge audit passed on 2026-07-30 **on Legacy
Architecture** — that pass says nothing about this build. It is a separate row because it is a separate
judgement call, made with different eyes.

Runnable in the same sitting as WALK-16, after it passes.

1. Every top-level tab — Home, Archive, Insights, You — draws under the status bar and the gesture bar
   without clipped content or double padding.
2. The bottom nav and its centre write-FAB sit correctly above the gesture bar, in **both** three-button
   and gesture navigation modes.
3. Open each modal sheet (write flow, reading sheet, trash, mood manager, achievements, shop) and
   confirm none is clipped at either end.
4. Both themes — day and night. The night-v2 canvas is pure black, so an inset error that hides in day
   mode is invisible until it is not.

**On failure:** record it, scope as a new `IMP-xxx`. Do not fix mid-walk.

**Result — ✅ 2026-09-05 (emulator, agent-run).** Recorded as a pass at the owner's instruction that
emulator results close these rows; the header's `device`-≠-`emulator` rule is knowingly set aside here.
**Step 1:** Today, Insights, Reflections and You all draw under the status bar and gesture bar with no
clipped content and no double padding; You scrolls to `Reset all data` sitting clear of the nav. Onboarding
and the setup screen are clean at both ends too. **Step 2:** the bottom nav and the centre write-FAB sit
correctly above the gesture bar in gesture nav, and above the system bar in three-button nav — switched
live with `cmd overlay`, no relayout damage either way. **Step 3:** trash sheet clean in day; achievements
(Keepsakes) and shop clean in night **at max font**, headers clear of the status bar, content scrolling
under nothing. **Step 4:** both themes walked. Night-v2 is a true pure black and no inset error hid in it —
the sun and rays, heatmaps and tab icons all repaint in the night palette, and the sky pill switches to the
moon.

⚠️ **Three sheets were not opened: write flow, reading sheet, mood manager.** The three that were opened
were consistent, but that is inference, not observation.

**Out of scope, noted not scoped:** the Dev Harness draws its own header under the status bar, and at max
font its "Last backup" stepper value clips off the right edge. `__DEV__`-only, absent from the release
build — not a release defect.


---

## WALK-18 — the app moves

**Covers:** IMP-077 · **Target:** **device** (mid-range — real frame pacing) · **Runner:** 👤 (visual) ·
**Gate:** 🎨

**✅ UNBLOCKED 2026-09-05** — WALK-16 closed and IMP-077 landed. **An emulator cannot settle this** — it
will render dropped frames as smooth, which is the exact thing being judged.

⚠️ **This row needs a NEW build before it can start.** IMP-077 installed `react-native-reanimated@~4.1.1`
and `react-native-worklets@0.5.1` — native deps — and `bump:native` moved the tree to **v1.0.8 / vc14**.
**Neither vc13 artifact contains this code**, and no amount of OTA reaches it. Cut a build from
`feat/design-push` at vc14 for this walk. (WALK-07 and WALK-03 step 4 are pure-JS and do *not* need it.)

⚠️ **Nothing in the test suite is evidence for any step below.** `jest.setup.js` mocks
`react-native-reanimated` to a no-op: no shared value updates, no animated styles, nothing scheduled on
the UI thread. IMP-077's 873 green tests prove the screens still render. **This row is the only thing
that can prove they move.**

1. **Tab transitions** — switching between all four tabs cross-fades and settles, no flash of blank, no
   stutter. Switch rapidly back and forth; nothing tears or stacks.
2. **Card entrances** — Home and Insights cards rise in and stagger rather than snapping in.
3. **Press feedback** — `PrimaryButton` scales under the thumb and releases cleanly, everywhere it
   appears.
4. **🔒 The sun and the rays are visually unchanged**, day and night, against the pre-IMP-077 build.
   `src/art.js` is frozen and untouched by the spec — **this step is the proof of that**, and it is the
   owner's stated constraint on the entire effort. Compare against a screenshot from before the branch.
5. **Existing choreography is unregressed** — the Celebration screen (complete an entry) and the Toast
   both still animate as they did. IMP-077 deliberately leaves both on `Animated`; this confirms the two
   systems coexist rather than fight.
6. **Reduced-motion** — enable "Remove animations" in Android accessibility settings; entrances degrade
   to plain cross-fades and nothing breaks.

**On failure:** record what stuttered and where. Motion defects are `🎨` — ugly, not destructive — so
scope as a normal `IMP-xxx`; nothing here justifies reverting IMP-076.

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

---

## WALK-19 — money actually changes hands

**Gate 🚦 · Target `device` · Runner 👤 · Build: v1.0.8 / vc14 from Play `internal`**

**Why this row exists.** `PLUS_ENABLED` flipped to `true` on 2026-09-05 and the app now shows a real
paywall wired to real Play products. **Every one of the following is asserted by code and proven by
nothing:** that the offering returns live prices, that the trial is real, that a purchase completes,
that entitlement survives a reinstall, that the perks are delivered. `npm test` cannot help — the
suite runs `simService`, which fabricates every purchase result, so **a green suite is not evidence
about billing.**

**Set up first:** the tester's Google account must be on the Play Console **license tester** list, and
installing from the `internal` track. A license tester walks the *full* purchase flow and is not
charged — that is the whole point; do not test with a real card until step 8.

- [ ] 1. **Install vc14 from Play internal** on the license-tester account. Confirm the version is
      **1.0.8 / vc14** (You tab → app version). An older artifact proves nothing about this code.
- [ ] 2. **Open the paywall. Are the prices REAL?** They must be the live Play prices for the tester's
      country, **not** the `PLUS_PRICES` fallback constants (`$4.99` monthly / `$29.99` annual /
      "Save 50%"). ⚠️ **Seeing exactly those three strings is a FAIL, not a pass** — it means the
      offering returned nothing and the app quietly fell back. This is the runtime half of playbook
      **10b.3**. Also check the annual sub-line reads "Billed yearly" and the savings badge, if shown,
      matches the real numbers (`mergePrices` drops it rather than assert a saving it cannot compute).
- [ ] 3. **Does the trial match?** The button is hardcoded `Start 7-day free trial`
      ([`Paywall.js:118`](../src/screens/Paywall.js#L118)) and does **not** read the offer. Confirm
      Play's own purchase sheet also offers **7 days free**. A mismatch is a copy fix, and a
      misrepresentation until it lands.
- [ ] 4. **Walk every purchase state.** The service contract is
      `success | cancel | failed | network | owned | restored | restore-empty`. At minimum: complete a
      purchase (**success**), back out of Play's sheet (**cancel**), buy again while subscribed
      (**owned**), airplane-mode mid-purchase (**network**), Restore with an entitlement
      (**restored**) and on a clean account (**restore-empty**). Each must show the right overlay and
      leave the app in the right state — no silent no-ops.
- [ ] 5. **The renewal date.** After the successful purchase, check the date on the **You** tab banner,
      the **Shop** banner and **Manage**. ⚠️ **If any of them says `12 Jun 2026` that is
      [IMP-082](specs-open.md) showing through** — mock data leaking to a real subscriber. Record it;
      it is already specced and ships by OTA.
- [ ] 6. **The ember packs must be ABSENT.** Open the Shop. There must be **no "Gather Embers" section**
      and the strings `$1.99` / `$4.99` / `$9.99` must appear **nowhere**. This is the runtime proof of
      commit `6590834` — the near-miss where enabling Plus armed a priced surface that gave its goods
      away. `Shop.test.js` pins it structurally; this confirms it on the shipped build.
- [ ] 7. **Are the five perks actually delivered?** With Plus active: the `tier: 'plus'` palettes and
      skies unlock in the Shop; a missed day spends a candle; "On this day" resurfaces an old entry;
      Deeper insights appear on Insights; the Annual Recap is reachable. **A perk that does not work
      for a paying subscriber is the defect class this whole gate exists to catch.**
- [ ] 8. **Then, and only then, one real transaction on a real card — and refund it.** Playbook 10b.5.
      This is the only step that involves actual money; everything above is free via the license tester.
- [ ] 9. **Reinstall and Restore.** Uninstall, reinstall from `internal`, tap Restore purchases.
      Entitlement must come back without a second charge.
- [ ] 10. **Cancel flow.** Manage → Cancel opens Play's subscription settings, and the copy about
      keeping Plus until the period ends is accurate (see step 5 — the date must be real).

**Recording it.** Same rule as every row: ✅/❌ + date in the index, a paragraph here. **A failure is
the deliverable** — scope it as a new `IMP-xxx` in `PROGRESS.md`, do not fix it mid-walk. **Do not
promote `internal` → `production` until this row is ✅**, whatever the build says.
