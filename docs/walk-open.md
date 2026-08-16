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

**The order encodes what gates the release** (re-sorted 2026-08-14). As of today **~25 IMP tasks are
committed and unpublished** — the last release of any kind was the vc11 build on 2026-08-02, and vc11 lives
on `alpha` only. Getting that work to the public needs a **build**, not an OTA, and that build carries
IMP-044's R8. So the rows are grouped by *what a failure would cost*:

| Gate | Meaning |
| --- | --- |
| 🚦 | **Blocks the build.** Data loss, silent stripping, or a core loop that has never run outside jest. |
| 🎨 | **Follows the release.** A failure here is ugly, not destructive — ship, then walk, then OTA the fix. |
| 📦 | **Independent of the app release.** Listing assets; no build required, upload any time. |
| ⏭ | **Not needed for this release.** Covered code is unreachable in the shipped build. |

**Taking a walk is unchanged: take the first ⬜ row.** WALK-05, WALK-04, WALK-06 and WALK-10 have all
**passed** as of 2026-08-16, and **WALK-15 was closed ✅ the same day at the owner's call** (steps 1–3 and 7
passed; 4–6 were accepted unrun — its walk-log entry says exactly what that does and does not buy).
WALK-09 (lifetime heatmap) is **unblocked** — IMP-073 landed — and **its steps below were rewritten to match
IMP-073's design**; read them, not the ❌ result paragraph under them. WALK-07 (modal scroll) passed on five
of six screens but **Paywall still fails after IMP-074**, and that needs a new `IMP-xxx` from Opus, not a
re-run. **WALK-14 (TalkBack) was dropped from the queue by the owner on 2026-08-16** — see its row for the
reasoning; it is ⏭, not ⬜, and nothing is waiting on it.

**As of 2026-08-16 the queue is deliberately near-empty, because the work moved to Plus (Phase 10b).** The
only ⬜ rows left are the **device** ones (WALK-13, WALK-03, WALK-08, WALK-12) plus WALK-11 and WALK-14, both
⏭. The device rows are set aside pending a build on real hardware — which is exactly what the
2026-08-16 internal-testing build exists to provide, so they become runnable rather than blocked. The
ordering still does the work within the device subset: 🚦 rows come first, and **WALK-12 sits last inside the
🚦 group on purpose** — R8 must be walked on the build you actually intend to ship, so any fix the earlier
walks turn up would invalidate an R8 pass done before them.

**WALK-11 (the Plus surfaces) is the row that stops being ⏭ the moment Phase 10b opens.** It is skipped only
because `PLUS_ENABLED = false` makes those surfaces unmountable; once Plus is the active work, that row is
the first thing to re-read.

| # | Gate | Walk | Covers | Target | Runner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| WALK-01 | ✅ | [v2→v3 mood migration](build-log.md#walk-01--v2v3-mood-migration) | IMP-037 | emulator | 🤖 mostly | ✅ **2026-08-14** — full pass, all 9 steps; detail in `build-log.md` → "Walk log" |
| WALK-02 | 🚦 | [Restore quarantine — offered, not imposed](build-log.md#walk-02--restore-quarantine) | IMP-033, IMP-029, **IMP-062** | emulator | 👤 (clock changes + judgement on sheet copy) | ✅ **2026-08-15** — full pass, all 9 steps (incl. the new IMP-062 relaunch proof in steps 7–9); detail in `build-log.md` → "Walk log" |
| WALK-05 | 🚦 | [Edit a past day, delete, trash allowance](build-log.md#walk-05--custody-of-your-words) | IMP-036, IMP-048 | emulator | 👤 | ✅ **2026-08-15** — full pass; the outstanding `applyCompletion` half confirmed no double-counting; detail in `build-log.md` → "Walk log" |
| WALK-04 | 🎨 | [Search + the write flow's moods](build-log.md#walk-04--search--moods) | IMP-035, IMP-037, **IMP-053** | emulator | 👤 | ✅ **2026-08-16** — full pass on the third re-run (after IMP-069/070/071 landed); two more defects found and fixed live as IMP-072; detail in `build-log.md` → "Walk log" |
| WALK-13 | 🚦 | [The reminder you can answer](#walk-13--the-reminder-you-can-answer) | IMP-054, **+ the duplicate-fire fix** | **device** (OEM behaviour + real doze) | 👤 | ⬜ — **unblocked 2026-08-13** (IMP-054 landed, `18d8c2e`) |
| WALK-03 | 🚦 | [JSON export → share → restore round trip](#walk-03--json-export-round-trip) | IMP-020, IMP-043 | **device** (share-sheet targets) | 👤 | ⬜ — the user's data escape hatch |
| WALK-12 | 🚦 | [The R8 release-variant pass](#walk-12--the-r8-release-variant-pass) | IMP-044 | **device** | 👤 | ⬜ — **the last 🚦, on the final build candidate.** First minified build ever; failure is silent |
| WALK-06 | 🎨 | [Streak insurance — candles spend themselves](build-log.md#walk-06--streak-insurance) | IMP-039, IMP-063, IMP-064 | emulator | 👤 | ✅ **2026-08-16** — full pass, re-run after IMP-063 + IMP-064 landed; detail in `build-log.md` → "Walk log" |
| WALK-07 | 🎨 | [Modal screens actually scroll](#walk-07--modal-scroll) | IMP-042 | emulator | 👤 (visual, two nav modes) | ❌ **2026-08-16 (whole-walk re-run, reopened again)** — the five other screens + both IMP-067 spot-checks all pass, both nav modes, max font. **Paywall still fails after IMP-074** — footer overlaps the plan selector + disclaimer from first open, both fix-halves confirmed present in code. Needs a new `IMP-xxx`, Opus's lane to scope. Paywall half needs T1 |
| WALK-08 | 🎨 | [Font scale + layout on the nine new screens](#walk-08--font-scale) | IMP-030 regression | **device** (real font metrics) | 👤 | ⬜ |
| WALK-09 | 🎨 | [Lifetime heatmap's four states + the XP line](#walk-09--lifetime-heatmap) | IMP-045 | emulator | 👤 (visual) | ❌ **2026-08-16** — states compute correctly (kept/frozen/missed/not-yet-started/future, month labels present, XP line correct) but 3 layout defects found: legend wraps awkwardly, month labels wrap mid-word, grid cells render unevenly. **Scoped 2026-08-16 as IMP-073** (`docs/specs-open.md`), all three in one spec. **Re-run once it lands — against the rewritten steps**, which expect a three-entry legend by design |
| WALK-10 | 🎨 | [Tips, explainers, empty states](build-log.md#walk-10--teach-the-app) | IMP-041 | emulator | 👤 | ✅ **2026-08-16** — full pass, all 4 steps; owner decided live to drop the tip cards anyway, reserved as **IMP-075**; detail in `build-log.md` → "Walk log" |
| WALK-14 | ⏭ | [TalkBack can write an entry](#walk-14--talkback-can-write-an-entry) | IMP-059 | **device** | 👤 (gesture navigation, inherently manual) | ⏭ — **dropped from the queue 2026-08-16** per owner. Not a gate, not scheduled; the labels ship either way. See its section |
| WALK-15 | ✅ | [Store screenshots regenerate](build-log.md#walk-15--store-screenshots-regenerate--closed-2026-08-16-emulator-agent-run-owners-call) | IMP-061 | emulator | 🤖 mostly | ✅ **2026-08-16 — closed at owner's call.** `npm run shots` green end to end, seven Play-legal assets committed; steps 1–3 + 7 passed, **4–6 accepted unrun**; detail in `build-log.md` → "Walk log" |
| WALK-11 | ⏭ | [The Plus surfaces](#walk-11--the-plus-surfaces) | IMP-038, 046, 047, 043 | emulator | 👤 | ⬜ — **skip for this release.** `PLUS_ENABLED = false` makes every surface here *unmountable*, not locked; walking it needs T1, which must be reverted before committing |

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

---

## WALK-09 — lifetime heatmap

**Covers:** IMP-045, IMP-063's `frozen` state, and **IMP-073's layout pass**. Use the `brokenStreak` scenario.

> **Read this before re-running: the expected result changed on 2026-08-16.** The steps below describe the
> design **IMP-073** specifies, not the one the ❌ result at the bottom was walked against. In particular the
> legend is **three** entries **by design** and "not yet started" is deliberately **not** one of them — that
> is the fix, not a regression. Do not fail the walk for its absence.

Insights → "Your record":

1. **Five distinct cell states.** kept (solid accent fill) · **a candle kept it** (soft fill + accentDeep
   ring) · **missed** (soft fill + border ring) · **not yet started** (a flat, faint, ring-less tile —
   quieter than everything else, no dashed outline) · future (invisible). "Not yet started" should read as
   *nothing here* without needing a key; if it draws your eye and makes you ask what it means, IMP-073's
   decision 2 did not land.
2. **The legend is exactly three entries — `kept` · `a candle kept it` · `missed` — on ONE row**, and it
   lines up with the left edge of the first grid cell, not with the month labels. Check at normal font
   scale; if a large scale pushes it to two rows, the rows must be spaced, not cramped.
3. **Month labels appear once per month down the left gutter, each on a single line.** No "Au"/"g" wrap.
   Re-check at max OS font size — the gutter is supposed to grow with the text, so the labels stay whole and
   the grid just gets slightly narrower.
4. **The grid reads as one grid.** Every cell is the same size regardless of state — sight down a row of
   mixed kept/missed/frozen days and look for kept days rendering visibly small.
5. The level line renders XP: `Lv 4 · {name} · 1,250 XP`.

**Result — ❌ 2026-08-16.** All the computed content passed: kept/missed/not-yet-started/future all render
distinctly, plus the `frozen` ("a candle kept it") state added by IMP-063 is correctly wired in and shows up
in the legend; month labels appear once per month; the level line reads correct XP. Three layout defects
surfaced, all cosmetic (nothing miscomputed): (a) the legend (`InsightsScreen.js:197-202`, 4 entries now that
`frozen` was added) wraps awkwardly under `flexWrap: 'wrap'` — "not yet started" most often forced onto its
own row; owner's call is that this entry may not need a legend row at all, with that state represented
in-cell instead, rather than just patching the wrap. (b) Month labels wrap mid-word ("Au"/"g") —
`InsightsScreen.js:232-233` renders `monthLabelsForRows` output in a fixed `width: 24` box with no
`numberOfLines`/`ellipsizeMode`; that gutter width also doesn't match the legend's `paddingLeft: 28`. (c)
Grid cells render at visibly inconsistent sizes — `heatCellStyle` (`InsightsScreen.js:207-222`) varies
`borderWidth` by state (0 for `done`, 1 for `frozen`/`missed`/`empty`), and the function's own comment
already documents Android bleeding stroked rounded borders half outside the box, the likely cause. Full
writeup in `PROGRESS.md` → Open items → "WALK-09 finding". **Scoped 2026-08-16 as `IMP-073` — all three
defects in one spec** (`docs/specs-open.md`). Re-run this walk **against the rewritten steps above**, not
against this paragraph, once IMP-073 lands.

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

## WALK-14 — TalkBack can write an entry

**Covers:** IMP-059. **Target: device** (reclassified 2026-08-16). **Runner: 👤 owner** — gesture navigation
with a screen reader, inherently manual.

**⏭ DROPPED FROM THE QUEUE 2026-08-16, at the owner's call. Do not take this row.** Kept here rather than
deleted because the steps are the only written record of what would prove IMP-059, and they cost nothing
sitting still.

**Why it existed, since the row itself never said so plainly.** It is not a Play requirement, not a
compliance deadline, and not a gate — no store check and no policy asks a journaling app to be walkable with
a screen reader. It was written for one narrow reason: IMP-059 (`fa523f3`) added accessibility labels across
the app, `npm test` can assert a label *exists* but not that a blind user can actually reach the save button,
and the write flow is the one screen where an unreachable control means the app's whole purpose is
unavailable rather than merely awkward. That is the entire case for it. The acceptance bar in step 4 — write
a full entry using only TalkBack gestures — is a bar this app has no user asking for today, on a
pre-revenue solo build with the Plus work waiting.

**What dropping it actually costs.** The labels IMP-059 added still ship; nothing is being removed. The
exposure is that if one of them is wrong, nobody finds out until a screen-reader user hits it. That is a
real but small and recoverable risk: every fix here is a string on a component, so it goes out OTA the same
day it is reported, with no build and no review. **Reopen this row** if the app ever gets an accessibility
complaint, or if Plus starts being sold to institutions (schools, health orgs) that ask about accessibility
in procurement — that is the realistic trigger, not a date.

Enable via device → Settings → Accessibility → TalkBack.

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
