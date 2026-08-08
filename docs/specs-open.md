# Open IMP specs — the build queue

> **What this file is.** The full spec for every **open** `IMP-xxx` task. [`PROGRESS.md`](../PROGRESS.md) keeps the
> backlog table, the live blockers and the two newest session notes; it points here for the spec body.
> Finished specs move to [`docs/build-log.md`](build-log.md). Git is the full record.
>
> **How Sonnet uses this file — read ONE spec, not the file.** `PROGRESS.md`'s backlog table names the
> first unchecked task and links to its heading here. **Open that heading only.** Every other spec in this
> file is for a different chat and reading it is wasted context.
>
> **These specs are the design.** Opus decided every open question in them — file paths, function
> signatures, copy strings, the free/Plus line. Execute the Steps in order. **Do not redesign, do not
> re-litigate a "why", and do not improve the scope.** If a step turns out to be impossible or the code
> contradicts the spec, **STOP** and log it to `PROGRESS.md` → Open items rather than inventing a fix.
>
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **482 passed,
> 51 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

## Index — take them in this order

| # | Spec | Lane | Free / Plus | Depends on |
| --- | --- | --- | --- | --- |
| 1 | [IMP-033 — the restore is offered, not imposed](#imp-033--the-restore-is-offered-not-imposed) | OTA | Free | — |
| 2 | [IMP-038 — "On this day"](#imp-038--on-this-day) | OTA | **Plus** (perk #3) | — (IMP-037 ✅ done) |
| 3 | [IMP-046 — Annual Recap](#imp-046--annual-recap-your-year-remembered-perk-4) | OTA | **Plus** (perk #4) | — (IMP-037 ✅, IMP-047 ✅ both done) |
| — | [IMP-045 — finish Lifetime Progress](#imp-045--finish-lifetime-progress-the-imp-021-shortfall) | OTA | Free | — · **no queue slot** |

**IMP-045 does not claim a slot.** It is small, independent and fixes a live tester complaint — take it in any
chat where the queued task is blocked, or as its own short chat. Same treatment as IMP-044.

---

## IMP-033 — the restore is offered, not imposed

**Lane:** OTA · **Status:** ⬜ OPEN · **Depends on:** nothing · **Free**

Pure JS — no new native module; `expo-application` has been in the tree since IMP-029. Reaches **testers
only** until vc11 is promoted.

**Owner's ask, verbatim (2026-08-02, after the IMP-029 device walk):** *"The app should run as if it was
installed for the first time, with the welcome and everything. And then once that is done, the user should
be given a pop up or prompt that there is a backup detected — would they like to load that up instead?
Along with the fair warnings."*

### Why this replaces the current behaviour

IMP-029 detects an OS restore and shows a notice — but by then the restored data **is already the app's
live state**, and the notice's only two actions are *Got it* (accept) and *Restore from a file* (replace
from JSON). There is no way to decline. The walk proved the failure mode is real and not rare: the restore
was **stale (2 entries against the 5 that were live)**, imposed without a prompt, and the user's only
escape was to go hunting for You tab → Reset all data.

**What is NOT fixable, and must not be attempted:** intercepting the restore itself. Android Auto Backup
writes the data at **install time, inside the OS**, before the app's first line of JS runs;
`BackupAgent.onRestoreFinished()` fires only *after* it has landed. There is no prompt-before-restore API.
The only OS lever is `allowBackup: false` ([`app.config.js:49`](../app.config.js#L49)), which would delete
IMP-006 entirely. So the fix is to **quarantine** what the OS forced on us and hand the decision back.

### Does Android already ask? Only in one of the two paths — get this right

- **New phone / post-factory-reset.** Android's setup wizard **does** show a restore screen. So there *is*
  consent — but it is a **device-level bulk choice about dozens of apps at once**, made by someone not
  thinking about this app, and it says **nothing about how old the data is**. Most people tap through it.
- **Reinstalling on the same device.** **Android asks nothing at all.** The restore is completely silent.
  **This is the path the owner hit on 2026-08-02**, and it has genuinely zero consent.

So the honest case is *not* "Android never asks". It is: **the reinstall path has no consent whatsoever,
and neither path ever discloses staleness.** The disclosure half is the larger win, and it applies to both.

### ⚠️ Trade-off, stated plainly — and REAFFIRMED by the owner

On a genuine **new phone**, the user today gets their journal back with zero friction. Under IMP-033 they
do **onboarding first**, then get offered it. That is a real regression in the new-phone path, bought to
gain consent in the reinstall path. Mitigate with warm, unmistakable copy — the offer must read as "your
journal is here, want it back?" and never as an error.

**Decision is settled — do not reopen it.** On 2026-08-02 the owner challenged the premise directly, was
shown the full counter-case (including a cheaper disclosure-only alternative, which was the
recommendation) and **chose quarantine + offer anyway.** Build it as specced.

### 🚫 What this task does NOT do — it cannot guarantee the backup is current

**Android Auto Backup hands the app exactly one copy: the last one the OS uploaded.** No version history,
no "fetch the newest" API, no way to list or choose — and the app does not even receive it, it is simply
*already in AsyncStorage* at first launch. The OS uploads at most **once per 24h** and only while **idle +
charging + on unmetered Wi-Fi**, so a copy days behind is the normal case. There is **no way to force a
fresh backup from inside the app**. **Therefore "make sure the restore is the latest" is not achievable by
any design.** The only honest remedy is disclosure — which is why step 6's copy fix matters more than it
looks.

**Consequence for the offer sheet (do not drop this):** the stash carries the persisted `lastBackupAt` (the
user's last JSON export) alongside `lastSavedAt` (the Google copy's age). When the export is the **newer**
of the two, the sheet must say so and lead with the file route — otherwise the app would talk a user into
loading the staler of two backups it can see.

### Design

**1. Quarantine on launch — [`App.js`](../App.js), inside the existing load effect (~lines 55–75).**

The `isRestoredInstall` check already there stops calling `setRestoredFromMs` and instead quarantines.
**Order is safety-critical — the stash must be durable before anything is cleared:**

1. Read the **raw** payload string (`AsyncStorage.getItem(KEY)`), not the deserialized slice.
2. Write it to a new key `dailyrituals:v1:pendingRestore`.
3. **Read it back and verify it parses.** If the write or the read-back fails, **abort the quarantine
   entirely** and fall through to today's IMP-029 behaviour (live data + the old notice). Never clear the
   main key on an unverified stash. This mirrors `runConfirmedImport`'s existing "recovery copy must
   succeed before the destructive step" guarantee.
4. `clearState()` the main key.
5. Hydrate as a fresh install — `onboarded` stays `false`, `hydrated` is the default slice.
   `hasCompletedOnboarding(null)` already returns `false`
   ([`onboarding.js:11`](../src/persistence/onboarding.js#L11)), so onboarding shows with no change there.

**Idempotent by construction.** Killed between steps 2 and 4? Next launch still sees
`installedAt > lastSavedAt`, re-stashes (overwriting), and proceeds. Killed after step 4? Main key is
empty, so there is no `lastSavedAt` and no re-detection — and the offer fires off **stash presence**, not
session state, so nothing is lost.

**2. The offer — fires on stash presence AND onboarding complete, never on session state.**

Condition: `pendingRestore` exists && `onboarded === true`. Evaluate on every launch **and** on the
`onDone` transition at [`App.js:120`](../App.js#L120) — so a user killed mid-onboarding, or who declines
and relaunches, still gets it. Do **not** tie it to the session that quarantined.

**3. New sheet `src/screens/RestoreOffer.js`** — presentational, props in / callbacks out, same
scrim-and-card shape as [`RestoreNotice.js`](../src/screens/RestoreNotice.js) (reuse its `GhostButton`;
extract to `src/ui.js` if it is now shared).

Copy — warm, and every warning stated:
- Title: **"We found your journal."**
- Body: `Your journal was backed up to your Google account on {formatBackupDate(stash.lastSavedAt)}. You
  can load it now.` then, as distinct warning lines: **it replaces everything you've just set up** (your
  name, theme, and anything written since installing) · **it's from {date}** — anything written after that
  isn't in it.
- **Three** actions, not two: **Load my journal** (primary) · **Restore from a file** (ghost — routes to
  the existing `doImport` picker) · **Keep this fresh start** (ghost). Dropping the file route would make
  this sheet strictly worse than the IMP-029 notice it replaces.
- **Freshness comparison (required).** Read `stash.lastBackupAt` next to `stash.lastSavedAt`. When the
  export is **newer**, invert the emphasis: `You also exported a file on {date}, which is newer` — and
  promote **Restore from a file** to primary.

**4. Actions.**
- **Load** → `Alert.alert` confirm → `backupIO.writeRecovery(createBackup(currentSlice))` **before**
  anything is replaced → `deserialize(stash)` → route through the existing `handleReplaceAllData` (it
  already saves + bumps `dataKey` to remount) → delete the stash → done.

**🔴 The sheet MUST name the paid inventory in the stash.** `embers`, `ownedPalettes`, `ownedSkies` and
`freezes` are **local-only with no recovery path of any kind** — no server holds them, so a user who
declines and later discards the stash has destroyed purchased goods permanently. The offer must read the
stash and say what is in it — e.g. *"including 1,500 Embers, 4 palettes and 3 candles"* — so "Keep this
fresh start" is an **informed** choice, and the discard confirm must repeat it. This is why the decline
path keeps the stash rather than deleting it; **that rule is not negotiable.**

**Plus subscriptions are NOT affected and must not be "restored" from the stash.** The entitlement lives
with RevenueCat / the user's Google account and survives the quarantine independently. Do not copy `plus`
out of the stash as though it were authoritative — re-query the entitlement instead (IMP-043 already
built `useLaunchEntitlementCheck` for exactly this).

- **Keep this fresh start** → **do not delete the stash.** Surface it as a new row in the You tab's "Your
  journal is safe" card: `Google backup — {date}` → reopens this same sheet, plus a **Discard it** action
  (confirmed) that deletes the stash. A one-shot destructive dismissal is exactly the trap this task
  exists to remove.

**5. IMP-029's `RestoreNotice` stays** — it is still correct for the abort path in step 3, and for old
installs whose payload predates the `lastSavedAt` stamp. **Do not delete it.**

### Steps

- [ ] 1. **RED first.** New pure `src/persistence/restoreQuarantine.js`:
      `shouldQuarantine({ lastSavedAt, installedAt })` (delegates to `isRestoredInstall`),
      `shouldOfferRestore({ hasStash, onboarded })` and
      `preferredSource({ lastSavedAt, lastBackupAt })`.
- [ ] 2. Stash IO in [`src/persistence/storage.js`](../src/persistence/storage.js):
      `readPendingRestore()` / `writePendingRestore(raw)` / `clearPendingRestore()` / `readRawState()`,
      each `try/catch` → falsy on failure, matching the file's existing shape. **No throwing.**
- [ ] 3. `App.js` quarantine sequence per Design §1, with the verified-read-back abort.
- [ ] 4. `src/screens/RestoreOffer.js` + wire the offer condition per §2.
- [ ] 5. Load / decline / discard actions per §4, including the You-tab row and the inventory summary.
- [ ] 6. Copy fix (bundled, from the same walk): the export flow never says the Google backup is a
      **separate** system. Add one line to the `explainAutoBackup` alert
      ([`RitualsApp.js:436`](../src/RitualsApp.js#L436)) and to the export confirmation making clear that
      **"Back up my journal" does not refresh the Google backup** — the owner hit exactly this and misread
      a correct restore as a stale-data bug.
- [ ] 7. `npm test` green (406 + new), `npx expo export --platform android` clean, commit, update
      `PROGRESS.md`, archive this spec to `docs/build-log.md`.

### Tests

Pure only, per project convention. `shouldQuarantine` (inherits `isRestoredInstall`'s 7 cases — **assert
delegation, don't duplicate them**) · `shouldOfferRestore` (stash + onboarded → true; stash + not-onboarded
→ false; no stash → false either way) · **`preferredSource` → `'google' | 'file'`** (export newer →
`'file'`; Google newer → `'google'`; export missing or equal → `'google'`; non-numeric either side →
`'google'`, no coercion) · a `storage` round-trip case (write → read → clear) · **a regression case
asserting a failed stash write leaves the main key intact.** No render tests for the sheet.

### Commit message

```
feat(restore): offer an OS-restored backup instead of imposing it (IMP-033)

Android Auto Backup restores at install time, inside the OS, with no
way to prompt first. Quarantine what it forces on us: stash the raw
payload, clear the live key, run a genuine first install, then offer
the backup once onboarding is done, with the staleness and
replacement warnings stated.

The stash is verified readable before the live key is cleared, and
declining keeps it — reachable later from the You tab — so no single
tap can destroy a journal.
```

**Ship:** OTA. No `bump:*`. The trailer ships it **to testers only** (`runtimeVersion` = `appVersion` =
1.0.5).

---

## IMP-038 — "On this day"

**Lane:** OTA · **Status:** ⬜ OPEN · **Depends on:** — (IMP-035 ✅ done, IMP-037 ✅ done) · **PLUS — perk #3 of the
proposed final list** (PROGRESS.md → "PROPOSED FINAL PERK LIST")

> **⚠️ Perk numbering — read this before touching `data.js`.** The live `PLUS_PERKS` array
> ([`data.js:144`](../src/data.js#L144)) has **5** entries and does **not** match the 6-line proposed
> table in `PROGRESS.md`. "On this day" is **not in the array at all** today, and array slot #3 is the
> line the owner decided to **cut**: *"Your whole graveyard, kept forever"* (it sells relief from a
> history limit that has never existed). Step 6 below replaces that slot. **Do not renumber anything
> else.**

**Build after the retrieval group.** IMP-035's retrieval layer and IMP-037's mood model are both done.

**Goal:** on opening the app, the user is shown what they wrote on this date in previous years — and,
until they have a year of history, at 6 / 3 / 1 months back.

**Why this one is worth money (settled):** it is **worthless on day 1 and priceless on day 400** — exactly
the shape the product thesis requires of the paid tier. It is the most-loved feature in comparable
journals, and it is already in this app's voice: IMP-013's *"Tend an old grave"* rite gestures straight at
it.

**Free/paid line:** a user can always *reach* any past entry — that is IMP-035, free. Plus is the app
**bringing it to them unprompted**: the surfacing, the anniversary framing, and later a reminder that says
"a year ago today you wrote…". **Our work, not their words.**

### Decided design (Opus — do not redesign)

- **Pure core:** `src/memory/onThisDay.js` → `onThisDay(entries, todayKey)` →
  `[{ entry, label, monthsBack }]`, newest match first. Labels are exact strings: `'A year ago today'`,
  `` `${n} years ago today` ``, `'6 months ago'`, `'3 months ago'`, `'A month ago'`.
- **Year matches take priority over month fallbacks**, and month fallbacks are shown **only** when there
  is no year match at all. Never show both.
- **🔴 Leap day.** 29 Feb must **not** false-match 28 Feb, in either direction. Do the comparison on the
  `YYYY-MM-DD` string components, not by adding milliseconds to a `Date`. There is a test for exactly this.
- **Placement:** a card on Home **above** the write card, shown **only on days with a match — never an
  empty state.** Dismissible per day: persist `onThisDayDismissed: <dayKey>` in `settings` (a single string,
  not a set — yesterday's dismissal is irrelevant, and this keeps it self-pruning, same
  derived-not-accumulated discipline as IMP-021/024).
- **Gating:** rendered when `plus`. When `plusEnabled && !plus`, render a locked teaser **only on days
  that actually have a match** — a card that says the app found something without showing it is the
  strongest honest pitch this feature has, and showing it on empty days would be noise. When
  `!plusEnabled`, render **nothing**.

### Steps

- [ ] 1. **RED first.** `__tests__/memory/onThisDay.test.js` covering every case in Tests below.
- [ ] 2. `src/memory/onThisDay.js` — `onThisDay(entries, todayKey)`, pure, no `Date` arithmetic across
      the leap boundary.
- [ ] 3. `src/screens/OnThisDayCard.js` — presentational: `{ matches, locked, onOpen, onDismiss,
      onOpenPaywall }`. Reuses the existing entry-row shape from `ArchiveScreen.js`.
- [ ] 4. Mount in [`HomeScreen.js`](../src/screens/HomeScreen.js) above the write card; thread `plus`,
      `plusEnabled` and the dismissal from `RitualsApp.js` (`plus` is already a `HomeScreen` prop).
- [ ] 5. Opening a match routes through the existing `setReading(e)` path, which also credits the
      `revisit` rite via `markRevisited` — confirm it does, and do not duplicate that logic.
- [ ] 6. **Make the perk line true.** In [`data.js:147`](../src/data.js#L147), **replace** the cut line
      `'Your whole graveyard, kept forever'` with
      `'On this day — your own words, brought back to you'`. The array stays 5 long; nothing else moves.
      Then update `PROGRESS.md` → Phase 10b's perk-reality table: the old #3 row is struck as **cut**, and
      the new "On this day" row is ✅ **REAL**.
- [ ] 7. `npm test` green (406 + new), `npx expo export --platform android` clean, commit, update
      `PROGRESS.md`, archive this spec to `docs/build-log.md`.

### Tests

Exact year-ago match · **multiple years at once**, ordered newest first · month fallbacks at 6 / 3 / 1
months · month fallbacks are suppressed when a year match exists · **leap day: 29 Feb does not match
28 Feb, and 28 Feb does not match 29 Feb** · a 31-day month falling back into a 30-day month does not
false-match · empty history → `[]` · same-day-multiple-entries returns each · malformed entries (missing
`dayKey`, `null` in the array) never throw.

### Commit message

```
feat(memory): "On this day" resurfacing (IMP-038)

Surfaces what the user wrote on this date in previous years — and, until
there is a year of history, at 6, 3 and 1 months back. Shown on Home only
on days that actually have a match, dismissible for that day.

The first genuinely new Plus feature rather than debt repayment. Reaching
any past entry stays free (that is search); what Plus buys is the app
bringing one back unprompted.

Date matching is done on the YYYY-MM-DD components rather than by adding
milliseconds, so 29 Feb never false-matches 28 Feb in either direction.
```

**Ship:** OTA. No `bump:*`.

---

## IMP-046 — Annual Recap: "your year, remembered" (perk #4)

**Lane:** OTA · **Status:** ⬜ OPEN · **Depends on: — (IMP-037 ✅, IMP-047 ✅ both done)** ·
**PLUS — perk #4 of the proposed final list**

> **⚠️ Perk numbering.** "Your year, remembered" is **not in `PLUS_PERKS` at all** today
> ([`data.js:144`](../src/data.js#L144) has 5 entries and none of them is the recap). Step 6 **appends**
> it, taking the array to 6 and finally matching the proposed table in `PROGRESS.md`. **Do not renumber
> the existing entries.**

**Goal:** at the end of a year, a Plus user gets one page that tells them what their year looked like —
the roadmap piece C the legacy pivot has pointed at since 2026-06-14, and the paywall line *"Your year,
remembered."*

**Why (settled):** value in a journal **accumulates**; the paying moment is month 2–3, not signup. A recap
is the emotional payoff of a whole year and the single most quotable thing this app can produce. It also
absorbs the **milestone timeline that IMP-021 deliberately deferred to "roadmap piece C"** — this is that
piece. See [`docs/playbook.md`](playbook.md) → "Why anyone would pay".

### Decided design (Opus — do not redesign)

- **Pure core:** `src/recap/annualRecap.js`
  - `recapYears(entries, now)` → the years offerable **right now**, newest first. A year is offerable from
    **1 December of that year** onward, and every earlier year with entries is offerable forever. **No
    partial-year recaps before December** — a "year in review" in March is a lie.
  - `buildRecap(entries, year, { xp, now })` → `{ year, daysRemembered, totalWords, longestStreak,
    firstEntry, lastEntry, topMoods, peakMonth, quietestMonth, milestones }`.
    - `topMoods` — top 3 from `moodByMonth`-style counting over that year's entries (**reuse IMP-047's
      counting; do not write a second mood counter**).
    - `milestones` — the streak milestones crossed that year, from `STREAK_MILESTONES`
      ([`data.js:68`](../src/data.js#L68)), plus the year's first entry. **This is IMP-021's deferred
      timeline; it lives here and nowhere else.**
  - **Reuse, do not reimplement:** `longestConsecutiveRun` and `currentStreak` from
    [`dateKeys.js`](../src/insights/dateKeys.js), the word count from
    [`lifetime.js`](../src/insights/lifetime.js) (**extract `countWords` to a shared module rather than
    copying it** — it is currently file-private there).
- **A recap must never be empty or embarrassing.** `buildRecap` returns `null` for a year with **fewer than
  10 entries**, and `recapYears` filters those years out. A recap of four days is worse than no recap.
- **Surface:** new full-screen `src/screens/AnnualRecap.js`, opened from (a) a Home card shown **1 Dec –
  31 Jan** when a recap is available, dismissible per year via `settings.recapSeen: <year>`, and (b) a
  permanent **"Your years"** row on the You tab listing every offerable year. **(b) is what stops the
  feature disappearing for eleven months of the year.**
- **Gating:** rendered when `plus`. When `plusEnabled && !plus`, the Home card and the You row both show
  locked with a Plus chip routing to the paywall. When `!plusEnabled`, render **nothing**.
- **Sharing is out of scope for v1.** No image export, no PDF — that is IMP-022's territory and would drag
  a native module into an OTA-lane task.

### Steps

- [ ] 1. **RED first.** `__tests__/recap/annualRecap.test.js` covering every case in Tests below.
- [ ] 2. Extract `countWords` from [`lifetime.js:4`](../src/insights/lifetime.js#L4) into
      `src/insights/words.js` and re-import it there, so recap and lifetime cannot drift apart. Existing
      `lifetime` tests must stay green untouched.
- [ ] 3. `src/recap/annualRecap.js` — `recapYears` + `buildRecap`.
- [ ] 4. `src/screens/AnnualRecap.js` — presentational, `{ recap, onClose }`. Sectioned like
      `InsightsScreen`'s cards: a hero number (days remembered), the totals, top moods, the busiest and
      quietest months, and the milestone timeline.
- [ ] 5. Home card (1 Dec – 31 Jan, `settings.recapSeen` dismissal) + the permanent You-tab "Your years"
      row, both gated per Decided design.
- [ ] 6. **Make the perk line true.** **Append** `'Your year, remembered — the Annual Recap'` to
      `PLUS_PERKS` ([`data.js:144`](../src/data.js#L144)), taking it to 6 entries. Then update
      `PROGRESS.md` → the perk table: #4 becomes ✅ built.
- [ ] 7. `npm test` green (406 + new), `npx expo export --platform android` clean, commit, update
      `PROGRESS.md`, archive this spec to `docs/build-log.md`.

### Tests

`recapYears` offers the current year **on 1 Dec and not on 30 Nov** (boundary, both sides) · offers every
prior year with enough entries · **omits a year with fewer than 10 entries** · returns `[]` for empty
history · newest first · `buildRecap` returns `null` below the 10-entry floor · counts only that year's
entries (an entry on 31 Dec of the prior year and 1 Jan of the next are both excluded) · `longestStreak` is
computed **within the year**, not across it · `topMoods` returns at most 3 and is stable on a tie
(alphabetical) · `peakMonth`/`quietestMonth` on a tie return the earlier month · `milestones` lists only
milestones actually crossed in that year · malformed entries never throw.

### Commit message

```
feat(recap): the Annual Recap — your year, remembered (IMP-046)

Roadmap piece C, and the paywall line that had no code behind it. Builds
one page per completed year: days remembered, words, the longest streak
held, top moods, busiest and quietest months, and the milestones crossed.

This is also where IMP-021's deliberately-deferred milestone timeline
lands — it lives here and nowhere else.

A year is offerable from 1 December onward and forever after, never
before: a "year in review" in March is a lie. Years with fewer than ten
entries are omitted entirely, because a recap of four days is worse than
no recap. Reachable year-round from a "Your years" row on the You tab, not
only from the seasonal Home card.
```

**Ship:** OTA. No `bump:*`.

---

## IMP-045 — finish Lifetime Progress (the IMP-021 shortfall)

**Lane:** OTA · **Status:** ⬜ OPEN · **Depends on:** nothing · **Free** · **Takes no queue slot**

**Goal:** close the two deviations from the approved Lifetime Progress design that made the owner call
IMP-021 *"not properly completed"* on the 2026-08-02 device walk.

**Why (settled 2026-08-08 — the owner chose "fix both"):** the section renders and shows real progress, so
this is a completeness question, not a crash. Re-reading the code against
[`docs/superpowers/specs/2026-06-14-lifetime-progress-design.md`](superpowers/specs/2026-06-14-lifetime-progress-design.md)
found exactly two deviations. **Both are in scope. There is no decision left to make.**

> **Numbering note:** an earlier line in `PROGRESS.md` said Opus would scope this as "IMP-033". That was
> wrong — IMP-033 is the restore-quarantine task. **This is IMP-045.** The stale pointer has been removed.

### The two shortfalls — both are in scope

1. **`xpEarned` is computed and never rendered.** Design §4 says *"`xpEarned` is surfaced quietly (e.g. in
   the level context line or a tile subtitle)"*. `deriveLifetime` returns it
   ([`lifetime.js:42`](../src/insights/lifetime.js#L42)) and
   [`InsightsScreen.js:80`](../src/screens/InsightsScreen.js#L80) prints only
   `Lv N · levelName · activeSpan`. **Decided: the level context line**, not a tile subtitle.
2. **The heatmap draws `missed` and `empty` identically.**
   [`LifetimeHeat`](../src/screens/InsightsScreen.js#L176) computes
   `has = !(cell.missed || cell.empty || cell.future)` and paints every non-`has` cell as the same
   transparent bordered box. So a genuinely-missed day is indistinguishable from a day before the user
   started, and there are **no month labels and no legend**. On a short history this reads as a wall of
   blank squares — the likely source of the "doesn't look finished" impression. It also contradicts
   **IMP-014**, which established 💀 for genuinely-missed days on the other two grids.

### 🚫 Not defects — do not "fix" these

The **milestone timeline is deferred to IMP-046** (Annual Recap), the **Home hero is untouched on owner
constraint**, and the **"Days kept" / "This month" tiles were deliberately removed** (design §2). Row count
is uncapped by design ("grows over time"). **Touch none of them.**

### Decided design (Opus — do not redesign)

- **Cell states become four, not two.** The lifetime heatmap is dense (one small square per day over a
  whole history), so it must **not** use the 💀 glyph the way `ArchiveScreen`'s 5-week grid does — a skull
  is unreadable at that size. Match IMP-014's *meaning* with density-appropriate styling instead:

  | state | fill | border |
  | --- | --- | --- |
  | `done` | `c.accent` | none (or `c.accentDeep` 2px if `today`) |
  | `missed` | `c.accentSoft` | 1px `c.border` — **present but unkept: visibly a day, visibly empty** |
  | `empty` | transparent | 1px dashed `c.border` — before the user started |
  | `future` | transparent | none — not yet a day |

- **Month labels** run down the left of the grid, one per row, printed **only on the row where the month
  changes** (blank otherwise), so the column stays quiet.
- **A three-item legend** sits under the grid: *kept · missed · not yet started*.

### Steps

- [ ] 1. **RED first.** `__tests__/insights/heatCells.test.js` against a new pure
      `src/insights/heatCells.js`:
      - `cellState(cell)` → `'done' | 'missed' | 'empty' | 'future'`, precedence
        `future` > `done` > `missed` > `empty`.
      - `monthLabelsForRows(rows)` → one string per row: the short month name (`'Jan'`) on the row whose
        **first cell** begins a new month, `''` otherwise, and always a label on row 0.
- [ ] 2. `src/insights/heatCells.js` — both functions, pure, no theme imports.
- [ ] 3. `InsightsScreen.js` → `LifetimeHeat`: consume `cellState` for the four-way styling above, render
      the month-label gutter and the legend. **No change to
      [`buildLifetimeHeatmap`](../src/home/calendar.js#L67)** — its cell shape already carries everything
      needed.
- [ ] 4. The level context line at [`InsightsScreen.js:80`](../src/screens/InsightsScreen.js#L80) becomes
      `` `Lv {level} · {levelName}{activeSpan ? ` · ${activeSpan}` : ''} · {fmt(xpEarned)} XP` ``. Keep it
      one line and keep the existing `numberOfLines` / font-scale behaviour intact (IMP-030).
- [ ] 5. `npm test` green (406 + new), `npx expo export --platform android` clean, commit, update
      `PROGRESS.md` (tick IMP-021's row to ✅ and remove the "🟡 IMP-021 … NOT properly done" block from
      Open items), archive this spec to `docs/build-log.md`.

### Tests

`cellState` for each of the four inputs · precedence when a cell carries more than one flag (a `future`
cell that also reads `empty` → `'future'`) · a `done` cell that is also `today` still returns `'done'` ·
`monthLabelsForRows` labels row 0 always · labels only rows where the month changes · a run of rows inside
one month yields `''` · a single-row grid · an empty `rows` array → `[]` · rows whose cells lack `dayKey`
never throw.

### Commit message

```
fix(insights): finish Lifetime Progress — missed vs never-started, and lifetime XP (IMP-045)

Closes the two deviations from the approved 2026-06-14 design that made
the owner call IMP-021 "not properly completed" on the device walk.

The lifetime heatmap painted missed days and days-before-you-started
identically, so a short history read as a wall of blank squares and a
genuinely missed day was invisible — contradicting IMP-014, which
established that missed days are marked. Cells now carry four distinct
states with month labels down the left and a legend beneath. The dense
grid uses fill and border rather than the skull glyph, which is
unreadable at this size.

deriveLifetime has always returned xpEarned and nothing rendered it;
it now sits in the level context line, as the design specified.
```

**Ship:** OTA. No `bump:*`.
