# Daily Rituals — Build Progress (live cursor)

> **The memory between chats. Read top-to-bottom every chat — and keep it SMALL.** Only: the ACTIVE
> TRACK, the backlog table, live blockers, and the **2 newest** session notes.
>
> - **Open IMP specs → [`docs/specs-open.md`](docs/specs-open.md).** **Open the ONE spec you are building
>   and no others** — every other spec there is for a different chat.
> - **Open runtime walks → [`docs/walk-open.md`](docs/walk-open.md).** Same rule: **one walk, not the file.**
>   A failed walk is not fixed in place — it becomes a new `IMP-xxx` row here.
> - Stable reference (locked decisions, release/signing rules, monetization strategy, parked phases
>   8/10b/11, config, architecture) → [`docs/playbook.md`](docs/playbook.md) — open only when you need it.
> - Finished specs, resolved findings, older session notes → [`docs/build-log.md`](docs/build-log.md).
>   Git is the full record.
> - How to drive a Sonnet chat → [`DEVGUIDE.md`](DEVGUIDE.md).
>
> **Size budget (hard rule, ≤250 lines):** the moment a task is **code-complete** (don't wait for ship or
> walk), move its spec to `docs/build-log.md` and leave only its one-line row below. Specs never live
> inline here. Resolved blockers move out too — this file carries what is **live**, not what was.

---

## ▶️ ACTIVE TRACK

**One chat does exactly ONE task, and there are two kinds. Take whichever you were sent here for:**

| Chat type | Queue | Take |
| --- | --- | --- |
| **Build task** | [`docs/specs-open.md`](docs/specs-open.md) | the **first ⬜ `IMP-xxx`** in the backlog below — **but check 🧭 below first: a row can be blocked** |
| **Runtime walk** | [`docs/walk-open.md`](docs/walk-open.md) | the **first ⬜ `WALK-nn`** in that file's own index |

**Never both in one chat.** A spec is **code-complete at `npm test` green + `npx expo export` clean** — its
runtime proof is a separate WALK row for a separate chat, so a missing walk is *not* an unfinished spec.
Neither queue is the phase ladder (8 / 10b / 11), parked in [`docs/playbook.md`](docs/playbook.md).

> ## 🧭 WHAT TO TAKE RIGHT NOW (2026-09-08)
>
> | If this chat is… | Take |
> | --- | --- |
> | a **build task** | **The backlog is empty** — `docs/specs-open.md` has no open `IMP-xxx` row. IMP-098 (Top moods bar alignment) landed 2026-09-08, `edcea0b`. Do not open a new row from reasoning alone; wait for an owner-filed issue or a failed walk. |
> | a **runtime walk** | 🚦 **The only queue with anything in it — [`docs/walk-open.md`](docs/walk-open.md), and its index says what is left.** WALK-19 needs a purchase attempt. **WALK-07 and WALK-08 are now waiting on a BUILD, not a spec** — IMP-096 and IMP-095 landed 2026-09-07 but are **unshipped**, so those two rows must be re-run at max font on a build that actually carries the fixes. **Do not re-derive WALK-19 — read its RESULT block; steps 3 and 4a are proven.** |
> | a **design request** | See "Claude Design" below. The live request is **Insights**. |
>
> **The billing surface, honestly.** Five fixes are code-complete and all are shipped by OTA. **IMP-089 and
> IMP-090 are proven on hardware. IMP-092 is half proven** — its online half passed; its `catch` branch has
> never executed on a device. **IMP-091 has never been observed at all**, and may be unobservable on the
> Play-error path by design (see the session note). **None of that is a jest question** — `simService`
> fabricates every one of those outcomes.
>
> **Three standing warnings for anyone touching this surface.** ⚠️ **The two OTA traps that cost four
> rounds — `eas update` needs `--environment production`, and clearing app data deletes the downloaded
> update — moved to [`docs/playbook.md`](docs/playbook.md) → "Two OTA traps". Read them before publishing.**
> Full narrative → [`docs/build-log.md`](docs/build-log.md) → "The 2026-09-06 billing incident".
>
> 1. ⚠️ **jest cannot see any of this.** It renders with `__DEV__` true and cannot read a published manifest,
>    so every guard here is a **source assertion** — each was proven to fail on the real defect before it
>    shipped. A green suite is not evidence about billing.
> 2. ⚠️ **IMP-088's escape is NOT a timeout-to-failure and must never be "simplified" into one.** A real
>    purchase takes minutes on INR/3DS flows; declaring failure mid-charge is worse than hanging.
> 3. ⚠️ **A hung purchase cannot be reproduced cheaply.** Restore was the obvious no-money diagnostic and it
>    does not work: it answers instantly from RevenueCat's local cache (that is IMP-092). Testing the pending
>    overlay requires a real purchase attempt.
>
> ✅ **Settled, do not re-raise.** The free trial is **burned on the owner's Google account** (subbed and
> unsubbed before; Play grants one per account ever) — Play saying "charging today" is Play being *correct*.
> RevenueCat has **no sandbox for Google Play**, and RC's own Play service-account credential is configured.
> ⚠️ **Real charges are possible on `internal`** — confirm every account on that tester list is a Play
> **license tester**.

**The whole design push lives on `feat/design-push`, which is NEVER pushed, NEVER given a `Release-Lane:`
trailer, and NEVER merged to `main`** without a separate owner decision. ⚠️ **That is why every OTA on this
lane is published BY HAND** — CI only runs on `main`, so `release.yml`'s guards never fire here, and
`--environment production` is on you. **The free-app improvement track is CLOSED** (owner, 2026-08-16):
`IMP-001`–`IMP-075` are done bar the deferred `IMP-022` and the reserved `IMP-057`; **do not open new
free-track rows.** **`IMP-057` is reserved, not missing** — do not reuse the number, and **`IMP-079` is
burnt** (used for a path written and deleted the same session). **IMP-044 claims no queue slot** — it rides
the next build and needs only WALK-12.

---

**App status — all four Play tracks.** Read from the Play Developer API 2026-09-05 and corrected 2026-09-06;
authoritative, do not re-derive from an older note.

| Track | Active | API | Note |
| --- | --- | --- | --- |
| `production` (public) | **1.0.3 / vc9** | 36 ✅ | live since 2026-07-30 |
| `beta` (open testing) | **1.0.3 / vc9** | 36 ✅ | was vc8/API 35 — promoted, compliance gap closed |
| `alpha` (closed testing) | **1.0.6 / vc12** | 36 ✅ | ⚠️ **NOT the owner's track** — their phone is on `internal`. The lesson this row cost two rounds of confusion to learn: Play serves the **highest-priority track the account qualifies for** (internal > closed > open > production), so **a build on `internal` is invisible to a device that is only a closed tester** |
| `internal` | **1.0.9 / vc15** | 36 ✅ | ✅ **SHIPPED 2026-09-06**, confirmed from `eas submit:list` not inferred. EAS build `e97db74d-…`, submission `a43f49c1-…`, from commit `980cdad`. Runtime `1.0.9`. ✅ **With the OTAs applied it takes money for real** — proven on a device (WALK-19). ⚠️ **The binary alone does NOT** — vc15's embedded bundle carries IMP-085's broken probe, so a device that has not taken the OTAs is back to a dead paywall. **The capability lives in the update, not the build.** Unblocks WALK-19, WALK-18, WALK-11, WALK-12 |

⚠️ **vc13 and vc14 are history and on no track** — they take no further OTA, and **vc14 must never be
promoted: it shipped with no RevenueCat key, fell back to `simService` and granted Plus free.** That defect
was invisible to CI, to jest and to a green preflight, and was caught only by a human subscribing in
airplane mode. Both builds' full detail is in [`docs/build-log.md`](docs/build-log.md).

**Ship mechanics.** Builds **auto-submit to `internal`** (`eas.json` → `submit.production.android.track`).
Reaching the public is the **manual `internal` → `production` promotion** in Play Console, which gets the
full ~7d review — and it should not be taken until the device walks clear. **✅ API-36 compliance is met
account-wide**; every active release on every track is `targetSdkVersion 36`.

**⚠️ The OTA lane.** `eas update` publishes to Expo's CDN — **no Play track, no Google, no review** — gated
only by **channel** (`production`) + a **matching `runtimeVersion`** (= `appVersion`). It is **`1.0.9`,
which means vc15 installs and nothing else** (`alpha` on vc12 and `beta`/`production` on vc9 receive
nothing). An installed build takes an OTA regardless of which track it came from, and **it applies on the
SECOND launch**. **Anything native needs a build**, and **a `bump:native` closes the lane until that
versionCode actually ships** — the trap IMP-076 and IMP-077 both sprang. **Do not OTA a fix and then treat
WALK-12's R8 pass as valid:** R8 runs at build time, so the code on the device is no longer what was walked.

**Current stack:** Expo SDK **54** · RN **0.81.5** · React **19.1.0** · **New Architecture** ·
**Reanimated 4.1.1 + worklets 0.5.1** · `targetSdkVersion` **36**, `minSdk` **24** ·
`npm test` → **1063 passed, 96 suites** (verified 2026-09-08) + **3 zone tests × 2 pinned zones**.
⚠️ **Run `npm test`, not bare `npx jest`**, or the zone half is skipped. Version-checking a phone, the
track-reading script and the rest of the stack notes are in [`docs/playbook.md`](docs/playbook.md).

---

## 🔧 Improvements backlog (post-launch — ACTIVE TRACK)

Opus scopes each owner-filed issue into a numbered `IMP-xxx` spec in
[`docs/specs-open.md`](docs/specs-open.md). Sonnet takes the **first ⬜** row, opens **only that spec**,
executes it, commits with the exact message given, ticks the row, moves the spec to `docs/build-log.md`, and
writes the session note. **Full detail for every ✅ row is in [`docs/build-log.md`](docs/build-log.md).**

| ID | Title | Lane | Status |
| --- | --- | --- | --- |
| 001–075 | **Every free-track task.** Search, custody + 30-day trash, multi-moods, Annual Recap, deeper insights, heatmaps, local `dayKey`, prompt packs, a11y labels, the IMP-063…075 polish run, R8, dev harness, backup/restore, reminders. | mixed | ✅ **all done except the two rows below** — full detail per task in [`docs/build-log.md`](docs/build-log.md); git is the record. Do not re-derive from this table. |
| 076–093 | **The design-push + billing run.** New Architecture (076), motion vocabulary (077), design system (078), Paywall footer (080), backup warning (081), renewal date (082), cancel deep-link (083), the release build's simulation (084), the SDK probe (085), the OTA lane's empty key (086), the paid surface's reason (087), the purchase-overlay trap (088), restore-must-not-buy (089), the trial it cannot see (090), the pending escape (091), "nothing to restore" (092), the vanishing paywall (093). | mixed | ✅ **all code-complete, all shipped by OTA where the lane allowed, all archived** — specs in [`docs/build-log.md`](docs/build-log.md). ⚠️ **branch-only, never pushed.** ⚠️ **Code-complete is not proven** — 089/090 are proven on hardware, 092 is half proven, **091 has never been observed**; see WALK-19 |
| 094–097 | **The 2026-09-07 walk-sitting fixes.** The Annual Recap's phantom "quietest" month (094), DeeperInsights at max font (095), the Paywall badge over the selected tick (096), the dev harness's two lying labels (097). | OTA | ✅ **all four code-complete, archived** in [`docs/build-log.md`](docs/build-log.md) — `085876a`, `3030bca`, `1e12cf7`, `7bced9f`, **1059 green / 95 suites** (was 1031 / 93), export clean. ⚠️ **NOT shipped — no OTA published for any of them.** ⚠️ **095 and 096 are accepted on a screen, not by the suite**: WALK-08 at max font and WALK-07 at `font_scale` 2.0 in both nav modes. 094 is pure logic and owes nothing runtime |
| 098 | **The Annual Recap's Top moods bars start in one place.** `minWidth: 84` sizes the label column to its content, so equal counts draw unequal bars. | OTA | ✅ **code-complete, archived** in [`docs/build-log.md`](docs/build-log.md) — `edcea0b`, **1063 green / 96 suites** (was 1059 / 95), export clean. ⚠️ **NOT shipped — no OTA published.** Pure reuse of IMP-067's `moodLabelWidth`. Accepted by the suite, **owed no walk** |
| 022 | Save as PDF + About sheet (the two dead You-tab buttons) | Build | ⏸ **deferred (owner)** — spec in build-log → "Deferred specs"; **perk #6 gate** |
| 044 | R8 on release builds (dev client was shipping to the public) | Build | 🟢 **code-complete, UNWALKED.** R8 must be walked on the build you actually ship, so it rides **vc15 or later**; walk = WALK-12, on hardware, last in the sitting |
| 057 | Historical `dayKey` migration | Build | 🔒 **reserved, not missing** — cannot be written until real device numbers come back from the dev panel's "Data health" reporter. See below |
| — | **Plus is ON** (`PLUS_ENABLED = true`, commit `7d2e515`) | Build | ✅ **and vc15 can take money for real** — proven on a device. Cash ember packs were decoupled from the flag first (`6590834`), caught mid-build: flipping `PLUS_ENABLED` had armed the Shop's "Gather Embers" purchase path as a side effect |

---

## 🎨 Claude Design (IMP-078)

**Project `Daily Rituals Design System`** · id `7bf44d09-f93a-42d2-a8b6-d412d671cf60` · writable ·
**13 cards** (Tokens · Frozen · Components · Screens day+night). Regenerate after a theme change with
`node scripts/gen-design-system.js`, then re-push — the cards are generated from `theme.js`/`data.js`/
`art.js` so they cannot drift, but they do not update themselves. **No auto-sync**: pointing the pane's
GitHub connection at `design-system/` would need the branch published, which the no-push rule forbids.

**Ask for ONE screen per request** — "redesign the app" produces mush. **The live request is
Insights** (owner, 2026-09-05). ⚠️ **The four standing rules — baseline-first, specs in token names, the
frozen sun/rays, and design-is-not-enablement — plus the motion-card and night-shot rules now live in
[`docs/playbook.md`](docs/playbook.md) → "Claude Design — standing rules". Read them before asking.**
**Porting a returned design is a normal build task** — a new `IMP-xxx` scoped by Opus. Claude Design does
not emit React Native; it returns HTML/CSS previews plus a spec.

---

## Open items / blockers

> Only what is **live**. Resolved findings and closed walk debts are in
> [`docs/build-log.md`](docs/build-log.md) → "Resolved findings"; monetization strategy, the subscription
> track, the parked phase ladder and the standing test-date rule are in
> [`docs/playbook.md`](docs/playbook.md).

**✅ No live blocker.** The 2026-09-06 "vc14 fakes purchases" blocker is **closed** — vc15 carries IMP-084
and replaced vc14 on `internal`. What remains is runtime proof, not code: everything below the line is a
walk, an owner decision, or a reserved number.

### ▶️ Owner decisions still open

- **🚦 The `internal` → `production` promotion.** **vc15 is the live `internal` build and the only
  promotion candidate.** Remaining: the device walks, then promote by hand (full review, ~7d).
  🚦 **WALK-19 gates it.** ⚠️ vc12 will not be promoted (owner, 2026-09-05) and vc14 must never be.
- **Cash embers: settled in principle (dropped 2026-08-03), not finalised.** It determines which Play
  products get created. Full argument in the playbook.
- **Perk #6, the PDF, is still not built** (IMP-022, deferred). It was **cut** from `PLUS_PERKS` rather
  than built, which is how `PLUS_ENABLED` flipped honestly. Gate checklist in the playbook → Phase 10b.

### 🟡 IMP-056 residual + the IMP-057 decision (2026-08-10)

`dayKey` is now derived locally (walked both offset directions). **Existing entries were deliberately not
migrated**, leaving two things:

- **The residual — nothing to act on.** Old entries keep their UTC key, so for ~a day a negative-offset user
  can have last evening's *already-stored* entry answer to today's key. New writes are correct immediately;
  old data self-heals as those keys age out.
- **IMP-057 is the owner's decision, not a build chat's.** The Inspector's "Data health" group counts rows
  disagreeing with `dayKeyOf()` and whether remapping moves `currentStreak`. **It reads 0 on the emulator
  fixture — meaningless** (`gen-v2-fixture.js` seeds ids the reporter doesn't key on), and **real device
  numbers have never been read.** Once they exist IMP-057 can be scoped — noting remapping can move an entry
  off a day and **break a live streak**: correct, but it reads as a regression to whoever it happens to.

### ⛔ Parked

- **iOS (Phase 11):** blocked on a Mac / EAS macOS + Apple Developer Program enrollment. The Phase 6 iOS
  real-billing row is blocked on the same. Per-step runbook in the playbook → Phase ladder.
- **IMP-044 (R8):** on for release builds since 2026-08-08, and **jest cannot prove it** — the failure mode
  is silent stripping at runtime, not a compile error. It rides the next build; **WALK-12** is the checklist.

---

## Last session note

_Only the **two newest** notes stay here; each chat moves the older one into
[`docs/build-log.md`](docs/build-log.md) → "Session notes". Keep them to the shape below: what finished,
the proof, the exact next step._

_2026-09-08 (Sonnet — **IMP-098 built the day after it was scoped: the Annual Recap's Top moods bars now
share one label width, reusing IMP-067's `moodLabelWidth`.**) — branch-only, NOT pushed._

**What finished.** [`AnnualRecap.js`](src/screens/AnnualRecap.js) now reuses `moodLabelWidth` from
`../insights/moodMixLayout`: the Top-moods label column is `width: labelW` (computed above the early
return) instead of `minWidth: 84, flexShrink: 1` — no new constant, no shared component. New
`__tests__/screens/AnnualRecap.test.js` (+4), verified red against the pre-fix tree first (3/4 failed).
**1063 passed, 96 suites** (was 1059/95), export clean. Committed `edcea0b`. Spec archived to
[`docs/build-log.md`](docs/build-log.md); [`docs/specs-open.md`](docs/specs-open.md) is empty again.
⚠️ **Gotcha for next time:** `T` wraps its own `Text` (host `Text` → composite `T`), so the label column's
`View` is **three** `.parent` hops above `view.getByText(mood)`, not one as the spec's example implied.

**The exact next step.** No build queue left. **DeeperInsights.js:139** carries the identical `minWidth`
defect ("Moods that travel together") and remains deliberately unscoped — an owner call, not a bug fix.
Otherwise unchanged: IMP-094…098 are all committed and **unshipped** (OTA lane, no `eas update` published),
and **WALK-07/WALK-08 still need a build that carries 095/096** before they can be re-run.

_2026-09-07, later night (Opus — **an owner screenshot of the Annual Recap reopened the queue: IMP-098
scoped, and it is IMP-067's defect on a screen IMP-067 never touched.**) — branch-only, NOT pushed._

**What finished.** Nothing was built. The owner sent a screenshot of the shipped Annual Recap and called the
Top moods card misaligned; it is, and the cause is now scoped as **IMP-098** in
[`docs/specs-open.md`](docs/specs-open.md). Grateful, Heavy and Hopeful all read **14** and draw three
different bars because [`AnnualRecap.js:86`](src/screens/AnnualRecap.js#L86) gives the label column
`minWidth: 84, flexShrink: 1` — a floor, not a width — so the column sizes to its **content**, every row's
bar track starts at a different x, and with all three rows at `moodMax` the fills are each 100% of a
different track. **This is IMP-067 finding (c) verbatim.** That spec fixed it in `InsightsScreen.js` and
left the answer in a pure module (`moodLabelWidth`, `src/insights/moodMixLayout.js`); its scope named
Insights only, so the Annual Recap's copy of the row (IMP-046, older) was never revisited. IMP-098 is
therefore a **reuse, not a design** — no new constant, no shared component, no re-litigation.

**The proof, and its limit.** None yet — this is a scoping session, not a build. The spec's acceptance is a
new `__tests__/screens/AnnualRecap.test.js` and it names the assertion that must be **seen to fail first**:
at `fontScale` 1 every Top-moods label column has the same `width`, 96. ⚠️ Unlike IMP-095/096 this defect
**is** visible to jest — it is a style prop, not a glyph measurement — so **no WALK row is owed** and none
was added.

**What was checked and deliberately left alone.** The rest of the screenshot: the hero, the 2×2 totals grid
and "The year, marked" all align, and the header's 18dp gutter against the content's 20dp is the house
pattern on nine other screens, not a slip. ⚠️ **[`DeeperInsights.js:139`](src/screens/DeeperInsights.js#L139)
carries the same `minWidth` defect ("Moods that travel together", `minWidth: 120`) and is out of IMP-098 on
purpose** — a pairing label is two mood names joined, so a fixed column trades a readable label for a
comparable bar. That is an owner call, and the file also still owes WALK-08 from IMP-095. **It needs its own
row once the owner decides.**

**The exact next step.** *(Superseded by the note above — IMP-098 has since landed.)*
