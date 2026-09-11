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

**The order encodes what gates the release.** Rows are grouped by *what a failure would cost*:

| Gate | Meaning |
| --- | --- |
| 🚦 | **Blocks the release.** Data loss, silent stripping, or a core loop that has never run outside jest. |
| 🎨 | **Follows the release.** A failure here is ugly, not destructive — ship, then walk, then OTA the fix. |
| 📦 | **Independent of the app release.** Listing assets; no build required, upload any time. |
| ⏭ | **Not needed for this release.** Covered code is unreachable in the shipped build. |

**Take the first ⬜ row.** Passed walks live in `build-log.md` → "Walk log"; only live rows are described here.

### The build these rows run against — v1.0.9 / vc15 + its OTAs

**`internal` carries v1.0.9 / vc15** (shipped 2026-09-06), and **the billing fixes live in the OTAs, not the
binary** — vc15's embedded bundle still has IMP-085's broken probe. A device that has not taken the updates,
or has just had its data cleared, is back to a dead paywall. **To bring a phone current: open, wait ~15s,
fully kill, open again** — an OTA applies on the *second* launch. vc13 and vc14 are history and take no
further OTA; **vc14 must never be promoted — it faked purchases.**

⚠️ **Two artifacts, and they are not interchangeable.** The Play build is a **release** build with **no dev
harness** (`__DEV__` false, no Metro), so **T1, T2 and T3 do not exist on it**:

| Needs the **local debug APK** (harness) | Runs on the **Play `internal`** build |
| --- | --- |
| **WALK-13** (T2 → Notify, to fire a reminder minutes out) | **WALK-12** — and it *must* be this build |
| ~~WALK-03 step 4~~ — **closed 2026-09-07**, nothing owed | **WALK-19** (the only row still needing this build) |

**They cannot coexist** — same `applicationId`, different signing keys, so swapping means uninstall, which
wipes data. **Export a backup first**; that export *is* WALK-03 step 1, so sequence the sitting to get it free.

### What is actually left

> ## ✅ UPDATED 2026-09-11 — read this, the bullets below are the older narrative
>
> **The 2026-09-10/11 lapse sitting closed almost everything.** A monthly licence-tester subscription was
> bought, WALK-19 step 7 run against it, and the remaining rows run as it expired.
>
> **Closed this sitting:** **WALK-18 ✅** (IMP-111 — no transition, no outlines), **WALK-07 ✅**
> (IMP-096 — badge clear of the tick at max font), **WALK-19 step 7 ✅** (IMP-108, IMP-109, IMP-110 all
> proven on hardware; the `EMBER_PACKS_ENABLED` guard proven too).
>
> **🚦 What is left on the whole board — two rows:**
> 1. **WALK-19 step 8** — the single real-money purchase, refunded. Deliberately held for last.
> 2. **WALK-12 (R8)** — must be walked on the exact build you intend to ship, so it goes after step 8
>    and after IMP-114/115/117 land.
>
> **🎨 And one leftover:** **WALK-08** still owes DeeperInsights at max font. ⚠️ **It cannot be run on the
> owner's phone** — their real journal does not have enough days, so "Moods by season" correctly says
> *"Not enough days yet."* This needs an **emulator with a seeded journal** (T3, the `twoYears` scenario).
> [IMP-117](specs-open.md#imp-117)'s two circles fold into the same sitting.
>
> ⚠️ **7C (the candle cap) is NOT proven and was briefly recorded as passed in error.** The owner held 6
> candles banked before IMP-112; nothing capped, they merely had no room. Re-runs when the holding drains.
>
> ⛔ **WALK-20 still does not exist, and writing it is not the blocker** —
> `EMBER_PACKS_ENABLED` is `false` in [`config.js:82`](../src/billing/config.js#L82), which gates the modal,
> the buy handler and the Shop prop. There is no surface to walk until the owner flips it, and WALK-19
> step 6 currently asserts the opposite (that the packs are absent).
>
> 📱 **The running order for everything above that needs the phone is written out below — "THE DEVICE SITTING PLAN" (2026-09-11): three sittings, the state each needs, and a 30-second pre-flight. It also corrects two stale instructions inside WALK-12's own section.**


## 📱 THE DEVICE SITTING PLAN — written 2026-09-11, take it in this order

> **What this is.** Everything left on the board that needs the owner's phone, grouped into **three
> sittings** with the state each one needs spelled out. It is not a new `WALK` row — it is the running
> order for rows that already exist. Each sitting is self-contained: stop after any one of them and
> nothing is left half-proven.
>
> **Why grouped this way.** A sitting is defined by the **membership state it needs**, because you cannot
> be a member and a non-member at the same time and switching costs half an hour of waiting. Sitting 1
> needs Plus to turn on and then off. Sitting 2 needs a real charge. Sitting 3 needs nothing but the
> shipped app. ⚠️ **Do not interleave them.**

### Pre-flight — 30 seconds, every sitting, no exceptions

Open the app, go to the **You** tab, and find the line that names the running JavaScript. **It must read
`update 01a09044`.**

- If it reads **`built-in bundle (no update applied)`** or any other 8 characters, the phone does not have
  the IMP-114/115/116/117 fixes. Fix it like this: **open the app, wait about 15 seconds, swipe it away
  from recents completely, open it again.** The update downloads on one launch and applies on the *next*
  one. ⚠️ **Do not "clear app data" to get a clean start — that deletes the downloaded update** and sends
  you back to the version baked into the installed app, which predates all four fixes.
- If you see a row saying **"Plus is unavailable"**, stop. That is the app telling you its billing setup is
  broken, and any result recorded past it is void. Write down what it says.
- If the You tab shows **no such line at all**, you are on a build older than vc15. Reinstall from Play.

⚠️ **That string is the UPDATE id, not the update GROUP.** The app prints 8 characters of the update id
([`diagnostic.js:35`](../src/billing/diagnostic.js#L35)). The group (`95411ab6…`) appears in CI and in
`eas update:list` and **never on the phone** — hunting for it on screen looks exactly like a failed OTA.

---

### Sitting 1 — a Plus cosmetic must give itself back when membership ends

**Rows this closes:** [IMP-116](build-log.md) (the point of the sitting), plus
[IMP-114](build-log.md), [IMP-115](build-log.md) and a re-proof of [IMP-108](build-log.md) for free.
**Target `device` · Runner 👤 · License tester, no real money · About 45 minutes, most of it waiting.**

**State it needs:** the license-tester account, **no active subscription at the start**, and the app on
`update 01a09044`.

**Write these three things down before you start** — the test is partly "did anything else move?":
your **ember balance**, your **current palette**, your **current sky**.

1. **The kept row, before anything else.** Open the **Shop** and look at the candle line. You hold 6
   candles from before the cap existed. It must read **`6 kept`** with **no `/ 3`** after it. Seeing
   `6 / 3 kept` is [IMP-115](build-log.md) failing — that is the whole fix.
2. **Tap a candle pack you cannot afford.** It must answer with a message naming the price and what you
   hold. Going dead — nothing happens at all — is [IMP-114](build-log.md) failing. That tap has never once
   been exercised on a phone; it sat behind a disabled button through four sittings.
3. **Buy the MONTHLY plan.** Not annual. Test subscriptions renew on a compressed clock and then stop, so
   a monthly one ends your membership in roughly half an hour, while an annual one took an hour on
   2026-09-10 and can take about three. You are not charged; the payment method will say **"Test card,
   always approves"**, which is correct and not a bug.
4. **Apply one Plus-only palette and one Plus-only sky.** The Plus palettes are **Lavender Hour**,
   **Frostlight** and **Bloom**; the Plus skies are **Meteor Shower** and **Aurora**. Both must show **no
   ember price** and your **balance must not move** — that is [IMP-108](build-log.md) re-proved on this
   bundle.
5. **The control, if you can afford it: buy one ember-priced item outright.** Harvest Moon sky is 300
   embers; Marigold and Honey palettes are 240. An item you actually spent embers on must **survive** what
   happens next. If you cannot afford one, skip this and say so in the report — the sitting still works,
   it just does not prove the control half.
6. **Cancel in Play** — Manage → Cancel. ⚠️ **Plus must NOT disappear at this point.** You keep it to the
   end of the period you paid for; losing it immediately is its own defect, so record it if it happens.
7. **Wait for the period to end, with the app closed.** Roughly 30 minutes on monthly. Play will email you
   about the renewals as they compress.
8. **Swipe the app away from recents, then open it fresh.** This must be a genuine cold start — a
   background-and-return proves something weaker and was the exact ambiguity that muddied IMP-107.
9. **What must happen.** The Plus palette and the Plus sky are **both gone**, back to the defaults
   (**Golden Hour** palette, **Golden Sun** sky), and **exactly one** message explains it. The item you
   bought with embers in step 5 is **still there**.
10. **Failure shapes — record which one you saw, they need opposite fixes.**
    - The Plus cosmetic is **still applied** after the lapse → IMP-116 did not fire at all.
    - It reverted but **no message** appeared → the revert works, the explanation does not.
    - **Two or more messages** → the effect is firing per-item instead of once.
    - The **ember-bought** item reverted too → over-reverting, and that is **worse than the original bug**:
      it takes away something that was actually paid for.

**Optional add-on, five minutes, while you are here.** Turn the phone's font size up to its maximum in
Android settings, then look at two things: the **`+` on the ember pill** in the Shop, and the **emoji
circles in the custom-mood picker** when writing an entry. The glyphs must stay inside their circles and
stay centred. That is [IMP-117](build-log.md), and doing it here leaves only DeeperInsights owed on
[WALK-08](#walk-08--font-scale) — which your own journal cannot test and an emulator must.

⚠️ **7C (the candle cap) still cannot be walked, and this sitting does not change that.** The cap stops you
*gaining* a 4th candle; you hold 6 from before it existed, so there is no room to fill and nothing to cap.
It becomes walkable only when the holding drains to **2 or fewer** — candles are spent by missing days, so
this is a matter of time, not of sequencing. **Do not record it as passed because nothing went wrong.**

---

### Sitting 2 — WALK-19 step 8: one real transaction, refunded

**Row:** [WALK-19](#walk-19--money-actually-changes-hands) step 8 — the last 🚦 with live billing work.
**Target `device` · Runner 👤 · REAL MONEY · Playbook 10b.5.**

⚠️ **Read this before you plan the sitting: a license tester is never charged.** The whole point of step 8
is that money genuinely moves, so it **cannot** be run on the account you used for Sitting 1 while that
account is on the license-tester list. You have two routes and they cost different things:

- **(a) A second Google account** that is an internal tester but **not** a license tester. Cleanest, and it
  leaves your tester setup untouched. Needs the internal opt-in link accepted on that account.
- **(b) Remove your account from Play Console → Setup → License testing**, walk step 8, then add it back.
  Fewer moving parts, but **license-tester status takes time to propagate in both directions**, so budget
  for it and re-check before you buy — a purchase that silently still uses the test card proves nothing.

**Which one is your call**; I would take (a) if you have a spare account, because (b) temporarily breaks
the ability to re-run every other billing step.

1. Pre-flight as above, on whichever account you are using.
2. Buy the **monthly** plan with a real card. It is the cheapest real charge available.
3. **Confirm the money is real** — the payment method must **not** say "Test card, always approves", and a
   Google receipt must arrive. If it says test card, stop: you are still a license tester and this step did
   not happen.
4. **Check the renewal date.** This is the first time the app is showing a date from a subscription on a
   normal clock rather than a compressed test one, so it is the only honest test of that copy: You tab,
   Shop banner and Manage must all show the **real** next-renewal date. `12 Jun 2026` anywhere is a
   regression. The bare word `Member` with no date is **not** a bug — it means the store returned no
   usable date, which the app handles deliberately.
5. **Refund it** — Play Console → Order management, refund **and revoke**.
6. **Then cold-start the app** (swipe away, reopen). Membership must be gone. That is a second, independent
   proof of [IMP-107](build-log.md) on a real purchase rather than an expiring test sub.

---

### Sitting 3 — WALK-12 (R8), and it goes last

**Row:** [WALK-12](#walk-12--the-r8-release-variant-pass). **Target `device` · Runner 👤.**
**Run it on the Play `internal` build — vc15 carrying `update 01a09044`.**

⚠️ **Two instructions in WALK-12's own section below are now WRONG. Corrected here; that section is being
read through this note.**

1. 🔴 **"`PLUS_ENABLED` must be back to `false` before you build" — STRUCK.** It has been permanently
   `true` since `7d2e515`. Following that line would turn the paid surface off and walk a build nobody will
   ever ship.
2. 🔴 **Do not build it locally with `npx expo run:android --variant release` (T6).** That was written
   before a minified build existed on a track. It produces a *different* APK with a different signing key,
   which cannot take Play purchases at all — and `android/` is gitignored, so a local build can quietly
   carry stale native config. **vc15 from Play is itself a minified release build** (`app.config.js:95`
   `enableMinifyInReleaseBuilds: true` + resource shrinking, R8 on since 2026-08-08), so the artifact you
   ship is the artifact to walk. Installing it from Play is the whole setup.
3. **`grep -r "SENTINEL"` against the bundle — replace it with what you can actually do from a phone:**
   confirm the **dev panel simply is not reachable**. It does not exist on a Play build, and that absence
   *is* the check.

**What to check** (everything else in WALK-12's list stands): the app launches, fonts load, **every icon
renders** — `react-native-svg` is the classic victim of over-shrinking — the **daily reminder** fires with
the app backgrounded and routes in when tapped (set it two minutes out through the app's own settings, not
the dev harness, which is absent), JSON export → share → restore survives a round trip, the paywall opens
and prices resolve, and search / moods / trash / recap all work. Note the APK size.

**If something is missing, it is stripped:** add the specific keep rule, never disable shrinking wholesale.

**Why it is last, stated accurately.** R8 shrinks the **Android native** code at build time; the
JavaScript bundle is an asset it does not touch. So — correcting the reasoning in the section below, which
conflates the two — **a JavaScript-only OTA does not invalidate an R8 pass on the same binary.** What
invalidates it is **a new binary**, or new JavaScript that reaches native code the pass never exercised
(a new library, a new native module). IMP-114 through IMP-117 touch Shop, WriteFlow and palette code only,
so **vc15 + `01a09044` is a valid thing to walk today.** It still goes last, for a simpler reason: if
Sitting 1 or 2 finds a defect worth shipping, you would rather walk R8 once, at the end, on the bundle that
actually ships.

---

**After the 2026-09-07 emulator sitting, only three rows have live work — and two of them need a phone.**

- ✅ **WALK-19a — PASSED 2026-09-10, and it closed IMP-105.** The row that blocked `internal` →
  `production` is gone; the remaining gates are WALK-19's own leftovers (4e, 7, 9-as-recorded, 10, 8),
  WALK-12 and WALK-18. Section archived to [`build-log.md`](build-log.md) → "Walk log".
- **WALK-19** — the only 🚦 with live work in it. **2026-09-08 update: steps 3, 4a, 4b, 4c, 4d, 4f, 5, 6
  all PASS on hardware.** **[IMP-105](specs-open.md#imp-105) is CRITICAL and blocks `internal` →
  `production` promotion outright**: a reinstall + Restore on an account with an active subscription says
  "Nothing to restore." ⚠️ **Step 4e's failure is INVALID and owes a re-run, not a fix** — the phone was
  running a bundle without IMP-100/101, neither of which was ever pushed or OTA'd
  ([IMP-103](specs-open.md#imp-103)). [IMP-104](specs-open.md#imp-104) (default palette/sky items render
  as ember-locked) is real, scoped and ready to build. Owed: **step 4e re-run** (after the IMP-100/101
  OTA), **step 9 re-run under the new ordering rule**, **step 10** and **step 8** (the one real-money
  purchase, deliberately held for last). 🚦 **Two new pre-flight rules before this row is touched
  again: record the running bundle, and run buy→reinstall→restore as one tight block — a license-tester
  subscription only lives ~30 min (monthly) / ~3 hrs (annual). Both are in the RE-RUN block.**
  ✅ **IMP-099 — PROVEN ON HARDWARE 2026-09-08 (owner-run).** On 2026-09-08 a Play licence purchase
  **succeeded** and the app said "That didn't go through": `ENTITLEMENT_ID` was `'plus'` while the
  RevenueCat identifier is `Daily Rituals Plus`, so a real entitlement mapped to `null` and `buy()` read a
  resolved purchase as a failure. Fixed, shipped in group `d42b7ec7`, and **the owner confirms Plus is
  live on the device.** That also proves, in passing, that **the OTA applied** and that vc15 takes the
  update — the fastest such proof there has ever been.
  ⚠️ **What this does NOT prove, and the distinction is load-bearing.** The shipped bundle grants Plus by
  **two** routes: the named `ENTITLEMENT_ID` lookup, and IMP-099's **sole-entitlement fallback** (one
  active entitlement grants Plus whatever it is called). From outside the app **they are
  indistinguishable** — a working paywall is consistent with `'Daily Rituals Plus'` being exactly right,
  *and* with it being the dashboard's description while the fallback silently covers a still-wrong
  constant. **So this walk did not validate the string.** Anyone "simplifying" the fallback away is
  removing the only thing known to work. To separate them, read the entitlement's real key off a device
  (`getCustomerInfo()` in the dev panel) — until then the fallback stays, on purpose.
- **WALK-18 — 🟠 PARTIAL 2026-09-10, and its premise did not survive contact.** ⚠️ **The owner has no
  mid-range device.** It turns out not to matter: `motion.js` adds no per-screen animation by design, so
  there is almost nothing to frame-pace. What a flagship *did* catch is a real day-mode rendering defect,
  now [IMP-111](specs-open.md#imp-111). 🚦 **Blocked on an owner decision — keep motion or remove it.**
- **WALK-12 (R8) — last, and it cannot move.** R8 runs at build time, so it must be walked on the exact
  build you intend to ship: any fix an earlier walk turns up invalidates an R8 pass taken before it.
- **WALK-08 — one item only.** Everything else in it is now walked; it stays open purely for the
  DeeperInsights max-font defect below. Two of its listed items turned out to be unwalkable and should
  be struck (`TipCard` deleted by IMP-075; landscape rotation impossible — the app is portrait-locked).

**Closed on 2026-09-07 (emulator, agent-run):** WALK-03 ✅, WALK-07 ✅, WALK-11 ✅. All three were
"ready to re-run" rows whose fixes had landed and never been looked at.

### 🔴 Four defects came out of the 2026-09-07 sitting — all need scoping as `IMP-xxx`

None were fixed: a walk records, it does not repair.

1. **Annual Recap names a zero-entry month as "quietest."** The 2025 recap of a journal whose first entry
   is 6 Jun reports **QUIETEST MONTH = January** — a month that predates the journal. Cause confirmed in
   source: [`annualRecap.js:42-49`](../src/recap/annualRecap.js#L42-L49) `extremesByMonth` scans all twelve
   buckets including empty ones and keeps the earliest on ties while scanning Jan→Dec. **This hits every
   user's first annual recap**, which is the most common case this feature has. Busiest month is correct;
   only the quietest side is wrong. Fix direction: restrict the search to months at/after the first entry,
   consistent with how the heatmap already treats pre-first-entry days
   ([`InsightsScreen.js:229`](../src/screens/InsightsScreen.js#L229)).
2. **DeeperInsights "Moods by season" breaks at max font.** Month names wrap mid-word — "Septemb/er",
   "Novemb/er", "Decemb/er" — and the third mood in every row is ellipsised away. Cause confirmed in
   source: [`DeeperInsights.js:103`](../src/screens/DeeperInsights.js#L103) hardcodes `width: 84` on the
   month label so the box cannot grow with the text, and line 104 puts `numberOfLines={1}` on the mood
   list. **Same family as IMP-067** (hardcoded `numberOfLines`, `minWidth` instead of `width`) — a fixed
   dimension that ignores font scale. Fine at default font.
3. **Paywall "SAVE 50%" badge overlaps the selected checkmark at max font.** Clean at default font; at 2.0
   the badge covers the top of the Annual card's checkmark and, both being orange, they read as one blob.
   Cosmetic — the plan stays selectable.
4. **Dev-panel rot (not shipped, but misleading):** `LaunchSection` still renders the heading
   "PLUS (DEV-LOCAL — APP SHIPS FREE, PLUS_ENABLED STAYS FALSE)" and T1 in this file still says
   `PLUS_ENABLED = false`. It has been `true` since `7d2e515`. Also `DevPanel`'s "Last backup" stepper
   pushes its value and `+` control off-screen at max font.

**Closed, and not to be re-derived:** WALK-16 ✅ and WALK-17 ✅ (2026-09-05, **on emulator evidence at the
owner's instruction** — the `device`-≠-`emulator` rule was knowingly set aside for those two). WALK-09 ✅,
WALK-15 ✅ at owner's call. **WALK-13 was dropped** at the same instruction — not run, not failed, so IMP-054
and `b773352` remain unproven on any running app; the row reopens whenever the owner wants it.

⚠️ **The gap no closed row covers, and it does not go away by being named:** real doze, OEM battery managers,
delivery to a real share target, and Google's own backup schedule have never been exercised anywhere.

⚠️ **The branch rule is OVER (2026-09-08).** `feat/design-push` fast-forwarded onto `main` and `main` is
the lane now; CI (`release.yml`) ships from it on a `Release-Lane:` trailer. **Never `eas update` by hand.**
**Nothing is promoted `internal` → `production`.**

| # | Gate | Walk | Covers | Target | Runner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| WALK-01 | ✅ | [v2→v3 mood migration](build-log.md#walk-01--v2v3-mood-migration) | IMP-037 | emulator | 🤖 mostly | ✅ **2026-08-14** — full pass, all 9 steps; detail in `build-log.md` → "Walk log" |
| WALK-02 | 🚦 | [Restore quarantine — offered, not imposed](build-log.md#walk-02--restore-quarantine) | IMP-033, IMP-029, **IMP-062** | emulator | 👤 (clock changes + judgement on sheet copy) | ✅ **2026-08-15** — full pass, all 9 steps (incl. the new IMP-062 relaunch proof in steps 7–9); detail in `build-log.md` → "Walk log" |
| WALK-05 | 🚦 | [Edit a past day, delete, trash allowance](build-log.md#walk-05--custody-of-your-words) | IMP-036, IMP-048 | emulator | 👤 | ✅ **2026-08-15** — full pass; the outstanding `applyCompletion` half confirmed no double-counting; detail in `build-log.md` → "Walk log" |
| WALK-04 | 🎨 | [Search + the write flow's moods](build-log.md#walk-04--search--moods) | IMP-035, IMP-037, **IMP-053** | emulator | 👤 | ✅ **2026-08-16** — full pass on the third re-run (after IMP-069/070/071 landed); two more defects found and fixed live as IMP-072; detail in `build-log.md` → "Walk log" |
| WALK-13 | 🚦 | [The reminder you can answer](#walk-13--the-reminder-you-can-answer) | IMP-054, **+ the duplicate-fire fix** | **device** (OEM behaviour + real doze) | 👤 | ⏸ **DROPPED from this pass — owner's instruction, 2026-09-05.** Not run, not failed. IMP-054 and `b773352` remain unproven on any running app. The row stays here because the debt is real; it reopens whenever the owner wants it. |
| WALK-03 | 🚦 | [JSON export → share → restore round trip](build-log.md#walk-03--json-export-round-trip) | IMP-020, IMP-043 | **device** (share-sheet targets) | 👤 | ✅ **2026-09-07 — CLOSED (emulator, agent-run).** Step 4 re-run after IMP-081 and it holds at **both** font scales: `neverBackedUp` reads in full over two lines at default and over **three** at max font — the third line IMP-081 added is genuinely exercised, not vacuous. `staleBackup` re-checked at max font too (shared component) and is complete. Steps 1, 2, 3 and 5 already passed 2026-09-05. ⚠️ **Named gap, and an emulator cannot close it:** delivery to a real share *target* stays unexercised. Detail in `build-log.md` → "Walk log" |
| WALK-12 | 🚦 | [The R8 release-variant pass](#walk-12--the-r8-release-variant-pass) | IMP-044 | **device** | 👤 | ⬜ — **the last 🚦, and it cannot move: R8 must be walked on the exact build you intend to ship.** ✅ **That build now exists: v1.0.7 / vc13 on Play `internal`** (2026-09-05) — install it from Play and walk this row **last**, after every other row has cleared, because any re-cut build invalidates a pass taken before it. Failure is silent |
| WALK-06 | 🎨 | [Streak insurance — candles spend themselves](build-log.md#walk-06--streak-insurance) | IMP-039, IMP-063, IMP-064 | emulator | 👤 | ✅ **2026-08-16** — full pass, re-run after IMP-063 + IMP-064 landed; detail in `build-log.md` → "Walk log" |
| WALK-07 | 🎨 | [Modal screens actually scroll](build-log.md#walk-07--modal-scroll) | IMP-042 | emulator | 👤 (visual, two nav modes) | ✅ **FULLY CLOSED 2026-09-11 — the IMP-096 badge re-run PASSED on hardware** (owner-run, OS font scale 2.0, 3-button nav): with the Annual card selected, the **"SAVE 51%" badge sits completely separate from the selected-state checkmark** — the 2026-09-07 blob is gone and [`Paywall.js:30`](../src/screens/Paywall.js#L30)'s computed tick offset holds. ⚠️ **Named gap: gesture nav was not re-checked** at max font; the offset is pure arithmetic with no nav-mode input, so this is recorded as a lowered-but-named gap rather than owed work. ✅ **Bonus proof, unasked:** the badge read **51%**, not 50% — "Save 50%" is only the offline fallback ([`data.js:170`](../src/data.js#L170)), so a computed figure from [`prices.js:26`](../src/billing/prices.js#L26) means the **real Play prices resolved through the live offerings path**. Prior: ✅ **2026-09-07 (emulator, agent-run).** The Paywall half re-run after IMP-080 and it **passes in all four combinations**: default+gesture (first open AND after selecting a plan), max+gesture, max+3-button, default+3-button. Footer sits below its divider, the plan selector and the IMP-043 line are fully visible, content scrolls to the plan selector and clears both footer and nav bar. The 2026-08-16 first-open overlap is gone. The other five screens passed 2026-08-16. 🔴 **One NEW max-font-only defect found: the "SAVE 50%" badge on the Annual card overlaps the top of the selected-state checkmark** (clean at default font). Cosmetic, does not block purchase. **Scoped and BUILT as IMP-096** (`1e12cf7`, 2026-09-07, archived in `build-log.md`) — ✅ **SHIPPED 2026-09-08, group `d42b7ec7`** — the bundle on the phone now carries it (second launch). **Re-run the Paywall at `font_scale` 2.0 in BOTH nav modes on a build that has the fix** to close this; jest cannot see the overlap and nothing here is proven yet |
| WALK-08 | 🎨 | [Font scale + layout on the nine new screens](#walk-08--font-scale) | IMP-030 regression | **device** (real font metrics) | 👤 | 🟠 **PARTIAL → nearly closed, 2026-09-07 (emulator, agent-run).** Everything previously unrun has now been walked at OS `font_scale` 2.0, **except two items that turned out to be unwalkable.** Harness Inspect confirms the cap bites: **font scale 2, caps 1.5 body / 1.2 chrome.** **Clean at max font:** `TrashSheet` (empty *and* with a real deleted day — date, preview, Restore/Delete forever side by side), `AnnualRecap`, `AnnualRecapCard`, `PlusPerks`, `RestoreOffer`, `OnThisDayCard`, plus the `longName` (40-char) scenario across Home (greeting wraps to 3 lines) and You (wraps 2 lines then ellipsises in the profile header — bounded, not a collapse). 🔴 **`DeeperInsights` FAILS at max font** — see the new defect below. ⏭ **`TipCard` cannot be walked — it no longer exists** (IMP-075 deleted the tip cards, `11fa421`; `grep -rc TipCard src/` is empty). ⏭ **Landscape rotation cannot be walked — the app is hard-locked to portrait** (`app.config.js:6` `orientation: portrait` **and** `AndroidManifest.xml:20` `screenOrientation="portrait"`); the device rotated and the app window stayed `port`. **Both items should be struck from this row, not carried as debt.** This row stays open only for the DeeperInsights item — and **the fix has now BUILT as IMP-095** (`3030bca`, 2026-09-07, archived in `build-log.md`): month rows stack above effective scale 1.3, so the label has no fixed width to wrap inside and the mood line gets two lines. ✅ **SHIPPED 2026-09-08, group `d42b7ec7`** — re-run on the relaunched bundle. ⚠️ **Nothing is proven: jest renders a tree, not pixels, and cannot see the mid-word wrap.** Closing this row means re-opening DeeperInsights at max font on a build that has the fix |
| WALK-09 | 🎨 | [Lifetime heatmap's four states + the XP line](build-log.md#walk-09--lifetime-heatmap--closed-2026-09-05-emulator-owner-run) | IMP-045, **IMP-073** | emulator | 👤 (visual) | ✅ **2026-09-05** — full pass on the re-run after IMP-073; all three 2026-08-16 defects fixed, re-confirmed at max font. **`not yet started` was not exercised** (fixture has no pre-first-entry days) and the walk was closed with that gap recorded; detail in `build-log.md` → "Walk log" |
| WALK-10 | 🎨 | [Tips, explainers, empty states](build-log.md#walk-10--teach-the-app) | IMP-041 | emulator | 👤 | ✅ **2026-08-16** — full pass, all 4 steps; owner decided live to drop the tip cards anyway, reserved as **IMP-075**; detail in `build-log.md` → "Walk log" |
| WALK-14 | ⏭ | [TalkBack can write an entry](build-log.md#-walk-14--talkback-can-write-an-entry--dropped-2026-08-16-owners-call-section-moved-here-2026-08-17) | IMP-059 | **device** | 👤 | ⏭ — **dropped 2026-08-16** per owner; section archived to `build-log.md` → "Walk log". Reopen trigger: an accessibility complaint, or institutional Plus buyers |
| WALK-15 | ✅ | [Store screenshots regenerate](build-log.md#walk-15--store-screenshots-regenerate--closed-2026-08-16-emulator-agent-run-owners-call) | IMP-061 | emulator | 🤖 mostly | ✅ **2026-08-16 — closed at owner's call.** `npm run shots` green end to end, seven Play-legal assets committed; steps 1–3 + 7 passed, **4–6 accepted unrun**; detail in `build-log.md` → "Walk log" |
| WALK-11 | 🎨 | [The Plus surfaces](build-log.md#walk-11--the-plus-surfaces) | IMP-038, 046, 047, 043 | emulator | 👤 | ✅ **2026-09-07 — CLOSED (emulator, agent-run), items 1-5, both Plus states.** **1 On this day:** real year-match card, tapping opens the Reading sheet **and ticks the revisit rite**, dismiss suppresses for today only and it **returned the next day** after a clock advance. **2 Deeper Insights:** below threshold all three cards say "Not enough days yet"; above threshold weekday + season draw real charts. **3 Annual Recap:** 10-entry journal offers nothing ("After your first year"); 460-entry journal lists 2025, the running year is not offered; the December Home card appears and its dismissal **persists across relaunch** while On this day does not — the two lifetimes are correctly different. **4 Paywall:** sim prices resolve, IMP-043 line present. **5 Restore purchases:** present when `!plus`, gone and replaced by "Member / Manage" when `plus`. **Item 6 NOT RUN — obsolete by configuration:** `PLUS_ENABLED` has been permanently `true` since `7d2e515`, so the free-build path it checks no longer ships. 🔴 **NEW defect: Annual Recap names a zero-entry month as "quietest"** — see below. ✅ **Fixed as IMP-094** (`085876a`, 2026-09-07): the quietest month is chosen only from the months the journal actually covered. Pure logic, tests are the acceptance — **this row owes no re-run for it** |
| WALK-16 | 🚦 | [The New Architecture cold start](build-log.md#walk-16) | IMP-076 | **device** (native runtime) | 👤 | ✅ **2026-09-05 — closed on emulator evidence at owner's instruction.** All 7 steps exercised across two agent-run sittings (1-3 New Arch live: Bridgeless + Fabric + TurboModule; 4-7 storage / notification scheduling / export-share-reimport / Auto Backup via T5 with the quarantine offering not imposing). **Owner's call 2026-09-05: emulator results are recorded as done, not smoke.** ⚠️ **Named gap — never exercised anywhere:** real doze, OEM battery managers, delivery to a real share target, Google's own backup schedule. **Unblocks IMP-077.** |
| WALK-17 | 🚦 | [Edge-to-edge, re-audited under New Arch](build-log.md#walk-17) | IMP-076, IMP-027 regression | **device** | 👤 (visual) | ✅ **2026-09-05 — emulator, agent-run.** All four tabs clean under status bar + gesture bar in **both** day and night; bottom nav and write-FAB correct in **both** gesture and 3-button nav; onboarding + setup also clean. Sheets checked: trash, achievements, shop — the last two at night **and** max font. ⚠️ **Not opened: write flow, reading sheet, mood manager.** |
| WALK-18 | 🎨 | [The app moves](#walk-18--the-app-moves) | IMP-077 | **device** | 👤 (visual) | ✅ **CLOSED 2026-09-11 (hardware, owner-run) — IMP-111 proven.** Day mode, all four tabs, slow and rapid: tabs now switch **instantly with no transition at all** and **no shadow outlines around any card**. `ScreenFade` was deleted outright (`76c1d76` removed it from both `RitualsApp.js` and `motion.js`), so there is no fade left to composite elevation under. ⚠️ **Steps 2 and 3 of this row below are STRUCK, not owed** — "cards rise in and stagger" and press-scale describe `riseIn`/`stagger`, which have **no consumer**; the row's own audit already established six of eight motion exports are unused. Absence of animation is the designed state, not a failure. 🟠 Previously PARTIAL, 2026-09-10 (Galaxy S24 Ultra, owner-run) — **the row's PREMISE was wrong.** ⚠️ **The owner has no mid-range device and will not be getting one; this row cannot be run as written.** Two findings, both from a flagship, both valid there. **(1) "The animations are not there" — CORRECT AND EXPECTED.** [`motion.js`](../src/motion.js) states in its own header that it *"adds no animation to any screen"*: `riseIn`, `popIn`, `fadeOut` and `useCountUp` are **all unused**, and the only two live motions are `usePressScale` (a 0.99 scale, deliberately imperceptible) and `ScreenFade`. **There is essentially no motion here to frame-pace, so the mid-range requirement was never the real gate.** **(2) 🔴 NEW DEFECT — shadow outlines around the next screen's cards during a tab change, DAY MODE ONLY.** Cause found in source and it matches the day-mode-only symptom exactly: `ScreenFade` animates `opacity` over a subtree whose `Card`s carry Android `elevation: 8`, and elevation shadows do not composite under fractional parent opacity; dark mode has no elevation so it cannot occur. **Scoped as [IMP-111](specs-open.md#imp-111).** ✅ **DECIDED 2026-09-10 — the fade is being removed ([IMP-111](specs-open.md#imp-111)), and applying the motion vocabulary is parked until Plus is complete.** Re-run this row in **day mode** once IMP-111 ships: there should be no transition left to draw an outline during. ⚠️ **Correction to this row's own audit:** `stagger` is **also unused** — the hit in `Celebration.js:23` is RN's `Animated.stagger`, a different function. Six of eight motion exports have no consumer |
| WALK-19a | 🚦 | [The IMP-105 isolation sitting](build-log.md#-walk-19a--the-imp-105-isolation-sitting-run-this-one-on-its-own) | [IMP-105](specs-open.md#imp-105) | **device** | 👤 | ✅ **2026-09-10 — PASSED (hardware, owner-run), 4 minutes.** Bought annual 00:43, uninstalled 00:44, reinstalled 00:45, **Plus already active on the second launch at 00:47 with no Restore tap** — the Restore row was gone and the You tab showed the member state. Elapsed 4 min against an annual test sub's ~3 hr life, so **expiry is arithmetically impossible and this run tested what step 9 always meant to test**. Play separately confirmed at uninstall that the subscription survives; the owner chose "keep the fresh start" (discarding local data) and Plus still returned, proving membership is store-authoritative. **IMP-105 closed — not reproducible, walk-protocol defect.** ⚠️ Named gap: `restorePurchases()` itself was never tapped (nothing to tap), so reinstall-then-Restore stays unexercised — not a blocker, step 4f already proved `restore()`. First walk here to name its own bundle before starting (`01a0877d`, via IMP-106). Detail in `build-log.md` → "Walk log" |
| WALK-19 | 🚦 | [Money actually changes hands](#walk-19--money-actually-changes-hands) | **Phase 10b.5**, IMP-028, IMP-082 + IMP-083 (steps 5 and 10), IMP-084/085/086/087, **IMP-088** | **device** (real Play Billing + a license tester) | 👤 | 🔴 **2026-09-11 (hardware, owner-run, MONTHLY tester sub) — STEP 7 IS DONE.** Ran as the sub lapsed, the ordering rule honoured. **7A ✅ — [IMP-108](build-log.md) PROVEN:** with Plus live, Marigold, Honey, Rose Dusk, Sage Eve and Harvest Moon all showed **no ember price**, applied cleanly, and the balance stayed at 15. **7B ✅ — [IMP-109](build-log.md) PROVEN on palettes:** the shortfall names the item, its price and the balance. **7D ✅** — no "Gather Embers" section and no `$1.99`/`$4.99`/`$9.99` anywhere, so the `EMBER_PACKS_ENABLED` guard holds on a shipped build. **[IMP-110](build-log.md) ✅ PROVEN** — the paywall perk list no longer claims streak insurance is members-only. ⚠️ **7C is NOT a pass and was previously recorded as one in error:** the owner held **6 candles banked before IMP-112**, so the cap was never exercised — nothing capped, they simply had no room. It re-runs once the holding drains to ≤2. 🔴 **Three new defects out of this sitting:** [IMP-114](specs-open.md#imp-114) (the candle shortfall toast is unreachable — `disabled={!afford}` swallows the tap, which is why this call site survived four sittings unexercised), [IMP-115](specs-open.md#imp-115) (`6 / 3 kept`), and [IMP-117](specs-open.md#imp-117) (max-font centring). 🚦 **And one across the lapse:** [IMP-116](specs-open.md#imp-116) — Harvest Moon and Frostlight survived the subscription expiring, then **vanished at the next palette switch**, because `applyPalette` never adds to `ownedPalettes`. The paywall promises *"unlocked forever"*. **Blocked on an owner ruling.** **Owed now: step 8 only** (real money, held for last). Prior: 🔴 **2026-09-08 (hardware, owner-run) — steps 3, 4a, 4b, 4c, 4d, 4f, 5, 6 ✅ PASS.** [IMP-105](specs-open.md#imp-105) **blocks release**: reinstall + Restore on an account with an active subscription says "Nothing to restore" — and it is the one finding that survived the same-day source review (step 4f is its control: identical code passed minutes earlier). [IMP-104](specs-open.md#imp-104): default palette/sky items render as ember-locked, cause found, ready to build — **and tapping one wipes the ember balance to 0**. ⚠️ **Step 4e is INVALID, not a failure** — the phone ran OTA `d42b7ec7`, which predates IMP-100 **and** IMP-101; neither was ever pushed or shipped ([IMP-103](specs-open.md#imp-103)), so 4e owes a re-run after that OTA. Aeroplane-mode Restore reproduces the known IMP-092 cache limit (not new). 🔴 **2026-09-10 (hardware, owner-run), on group `f961b427`: step 4e ✅ PASS — "You already have Plus", which also settles IMP-103's open residual (the numeric `6`/`7` bet in `mapError.js` was correct). Step 7 ⚠️ INCONCLUSIVE for IMP-104 — the free items were never tapped (Crescent Moon ✅ applies cleanly), and with a 0 ember balance the NaN-wipe half is untestable; re-run once embers are earned. Step 7 instead found TWO new defects: [IMP-108](specs-open.md#imp-108) (a member is still charged embers for five palettes/skies the paywall promises) and [IMP-109](specs-open.md#imp-109) (the shortfall toast never names the price or balance). **Step 10 ✅ PASS, and the lapse confirmed at ~02:00** — the subscription bought at 00:43 expired at 01:43, and on re-opening the app the member state was gone. ✅ **That is [IMP-107](build-log.md)'s first and only hardware proof** — the row was opened 2026-09-09 because a lapsed member kept Plus until they happened to background the app. ⚠️ **The strength of this result depends on whether the app was truly force-closed first:** a cold start proves IMP-107's new launch check; a background→foreground cycle would have been caught by the pre-existing `AppState` listener and proves nothing new. Owner was asked for a force-close and reported the downgrade; recorded as a pass with that condition named. Step 10's earlier half ✅ PASS — the Play deep link worked, cancelling correctly did NOT revoke Plus before the period ended, and the "+3 candles — your Plus perk renewed" toast is IMP-102 firing on a test-compressed renewal, not a bug.** ✅ **Step 9 is SETTLED — see WALK-19a (2026-09-10): the entitlement survives a reinstall, IMP-105 was the walk's own ordering, not a defect.** That **unblocks step 10** (cancel flow), which was only ever blocked on step 9. Step 8 (real money) still deliberately held for last. Full detail in the RE-RUN section below. **Nothing is promoted `internal` → `production`.** |

---

## Techniques — read once, several walks need these

**T1 · ~~Plus surfaces are invisible by default~~ — NO LONGER TRUE, and there is no flip to do.**
`PLUS_ENABLED` has been **`true`** since 2026-09-05 (`7d2e515`,
[`src/billing/config.js:57`](../src/billing/config.js#L57)), so IMP-038/046/047, the "What's in Plus"
sheet and trash-restore all **mount on their own**. Any walk step that says "flip T1 and revert after" is
stale — do nothing. *(`LaunchSection.js` still prints the old "PLUS_ENABLED STAYS FALSE" heading in the
dev panel; that is cosmetic rot, scoped 2026-09-07.)*

**T1b · The store you get locally, and the trap in it.** With **no** `RC_ANDROID_KEY` you get the
simulation purchase service — fake prices that render, which is what paywall walks want. **But a
populated `.env` defeats this:** if `RC_ANDROID_KEY` is set, the app talks to the real RevenueCat, and an
emulator without Play Billing answers `BILLING_UNAVAILABLE` — **no offerings, so no prices and no plan
selector**, which makes any paywall layout check pass vacuously. If you need the sim service, comment the
key out of `.env` and **restart Metro** (the value is baked at bundle time), then put it back afterwards.

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

## WALK-08 — font scale

**Covers:** IMP-030 regression across the screens that did not exist when it was walked.

Emulator → Settings → Display → **font size max + display size largest**. No row may collapse to a
one-character-per-line column; rows auto-stack. Harness → Inspect shows `PixelRatio.getFontScale()` next
to `MAX_FONT_SCALE` / `CHROME_FONT_SCALE` — confirm the cap is biting.

**One trap worth more than the result.** React Native reads the font scale **at startup**. Changing
`font_scale` under a running app moves the system UI immediately and the app not at all — which looks
exactly like a correctly-clamping cap and is not. The app must be force-stopped and relaunched before any
measurement here means anything.

**Result — 🟠 2026-09-05 (emulator, agent-run), extended 2026-09-07 (emulator, agent-run).**

**2026-09-05 pass:** cap confirmed biting; clean at max font on Home, Insights, Reflections +
`ArchiveFilters`, You, achievements and shop sheets.

**2026-09-07 — everything that was still unrun has now been walked, and two items turned out to be
unwalkable.** Harness → Inspect reads **Font scale 2**, **Font scale cap (body / chrome) 1.5 / 1.2**,
window 427×952, insets `{top:52, bottom:48}` — the cap is biting, measured rather than inferred.

**Clean at max font (2.0), 3-button nav:**
- `TrashSheet` — both states. Empty: title, 30-day explainer and the Plus line all wrap, nothing clipped.
  **Populated with a really-deleted day** (deleted via the Reading sheet so the state was genuine, not
  faked): date, preview text and the **Restore / Delete forever** buttons sit side by side without
  collision.
- `AnnualRecap` — title wraps to two lines, the four stats stack 2×2, mood bars stay aligned, and the
  page scrolls until the last card clears the nav bar.
- `AnnualRecapCard` and `OnThisDayCard` on Home — date column and text side by side, no truncation.
- `PlusPerks` — all five perk bullets wrap, icons stay aligned to the first line.
- `RestoreOffer` — copy wraps to four lines, both buttons full width inside the card.
- `longName` (40 chars): **Home** grows the greeting to three lines rather than clipping; **You** wraps to
  two lines then ellipsises inside the profile header — bounded, not a collapse. **Recap** does not render
  the name, so the long-name case does not reach it; the long *entry* text it also sets pushed the recap
  to 26,063 words and the layout held.

🔴 **`DeeperInsights` FAILS at max font.** "Moods by season" wraps month names mid-word — "Septemb/er",
"Novemb/er", "Decemb/er" — and ellipsises the third mood out of every row. Cause found in the file, not
guessed: [`DeeperInsights.js:103`](../src/screens/DeeperInsights.js#L103) hardcodes `width: 84` on the
month label so it cannot grow with the text, and line 104 puts `numberOfLines={1}` + `flex: 1` on the mood
list. Correct at default font. **Same family as IMP-067.** Needs an `IMP-xxx`; this row stays open for it
and nothing else.

⏭ **Two listed items cannot be walked and should be struck from the row:**
- **`TipCard` no longer exists.** IMP-075 ("the tip cards go away", `11fa421`) deleted them;
  `grep -rc TipCard src/` returns nothing. Carrying it as unrun debt overstates what is owed.
- **Landscape rotation is impossible by design.** The app is portrait-locked in *two* places —
  `app.config.js:6` `orientation: 'portrait'` and `AndroidManifest.xml:20`
  `android:screenOrientation="portrait"`. Setting `user_rotation 1` rotated the device and the app window
  stayed `port` (`mDisplayRotation=ROTATION_0`, config `port`). There is no rotation to check.

⚠️ **Still true and not closed by this sitting:** the target says `device` for *real font metrics*. These
results are emulator results. Nothing here depended on physical DPI, but a device pass would be strictly
stronger.

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

## WALK-18 — the app moves

**Covers:** IMP-077 · **Target:** **device** (mid-range — real frame pacing) · **Runner:** 👤 (visual) ·
**Gate:** 🎨

**✅ UNBLOCKED 2026-09-05** — WALK-16 closed and IMP-077 landed. **An emulator cannot settle this** — it
will render dropped frames as smooth, which is the exact thing being judged.

⚠️ **This row needs a NEW build before it can start.** IMP-077 installed `react-native-reanimated@~4.1.1`
and `react-native-worklets@0.5.1` — native deps — and `bump:native` moved the tree to **v1.0.8 / vc14**.
**Neither vc13 artifact contains this code**, and no amount of OTA reaches it. ✅ **That build exists and
is on Play `internal`** — v1.0.9 / vc15 supersedes the vc14 named below; install from Play, do not cut a
new one. (WALK-07 and WALK-03 step 4 are pure-JS and do *not* need it.)

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

---

**Why this row exists.** `PLUS_ENABLED` flipped to `true` on 2026-09-05 and the app now shows a real
paywall wired to real Play products. **Every one of the following is asserted by code and proven by
nothing:** that the offering returns live prices, that the trial is real, that a purchase completes,
that entitlement survives a reinstall, that the perks are delivered. `npm test` cannot help — the
suite runs `simService`, which fabricates every purchase result, so **a green suite is not evidence
about billing.**

**Set up first.** ⚠️ **RevenueCat has NO sandbox for Google Play** — unlike Apple's StoreKit there is no
test key and no test environment. License-tester purchases run through the *same* production key,
products, `plus` entitlement and `current` offering; RevenueCat merely tags them sandbox (dashboard
toggle) so they stay out of the revenue charts. Five things must be true:

1. Play Console → **Setup → License testing** — the tester's Google account added. **Account-level, not
   per-app**, and it takes time to propagate.
2. That same account is on the **internal** testing tester list *and* has opened the opt-in link.
3. The app is **installed from Play**, not sideloaded — Play Billing checks install source + signature,
   so a sideloaded build fails purchases no matter what the tester list says.
4. ✅ **The Google Play service account credential IS uploaded to RevenueCat** — owner-confirmed
   2026-09-06, configured long ago. Recorded here because it is invisible from this repo and was briefly
   suspected: it is **not** [`play-service-account.json`](../play-service-account.json), which is EAS's
   for submitting builds. RC needs its own copy to validate purchase tokens. **Settled — do not re-raise.**
5. Products attached to `plus` + `current` — playbook 10b.3, owner-confirmed 2026-09-05.

A license tester walks the *full* flow and is **not charged**; do not test with a real card until step 8.
Two behaviours that otherwise read as bugs: the payment method shows **"Test card, always approves"**, and
**renewals are compressed** — annual ≈ 30 min, monthly ≈ 5 min, renewing ~6 times then stopping. **The
7-day trial compresses too**, so a short trial is not a misconfiguration.

⚠️ **Steps 0(c) and 2 are already PASSED (2026-09-06) and need no tester setup at all** — airplane mode
and a price check settle "is this real billing?" on their own. Start from step 1.

- [x] 0. **Three preconditions.**
      ✅ **(c) THE BUILD CAN TAKE MONEY — PASSED 2026-09-06 on hardware.** Airplane mode, attempt to buy:
      **it did not complete.** `simService` completes regardless of network, so this is the proof the
      simulation is off the device. (History, do not re-derive: vc14 *did* complete a purchase in airplane
      mode — that is what started the IMP-084 → 088 chain.)
      **(a) Track.** Play serves the **highest-priority track the account qualifies for**
      (internal > closed > open > production), so an account on closed testing only keeps getting vc12 and
      sees none of this. The owner's phone is on `internal`. Verify any *other* tester with
      `adb shell dumpsys package app.dailyrituals.mobile | grep versionName` — it must read **1.0.9**.
      **(b) The OTA — and this one has now cost FOUR rounds, so read it.** Steps 5 and 10 (IMP-082/083),
      the whole IMP-084→088 chain and the pending-overlay fix all arrived as **OTAs**, not in the vc15
      binary. `expo-updates` uses the defaults — **check on launch, download in background, apply on the
      NEXT launch**. ⚠️ **Clearing app data DELETES the downloaded update**, so the gesture normally used
      to "test cleanly" sends the next launch back to the **embedded vc15**, which predates every fix.
      **To get current JS on the phone: open, wait ~15s, fully kill from recents, open again — and do NOT
      clear data in between.** "I opened it and nothing changed" has been this every single time.

- [x] 1. ✅ **PASSED 2026-09-06.** **Install vc15 from Play internal** on the license-tester account — **1.0.9 / vc15**, confirmed
      with the `adb` line in 0(a) (a release build shows no version string in-app; IMP-022 is deferred).
      Then apply the OTA per 0(b) before walking any step. ⚠️ If the You tab ever shows a **"Plus is
      unavailable"** row, stop and read the bundle id it prints — that is IMP-087 telling you the gate is
      dead and which fact is false, and any result recorded past it is void.
- [x] 2. ✅ **PASSED 2026-09-06 — prices render in INR**, i.e. the live Play offering reaches the app.
      Kept below because a *regression* here is silent and this is how you would catch it.
      **Are the prices REAL?** They must be the live Play prices for the tester's
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
      `success | cancel | failed | network | owned | restored | restore-empty | deferred`. At minimum: complete a
      purchase (**success**), back out of Play's sheet (**cancel**), buy again while subscribed
      (**owned**), airplane-mode mid-purchase (**network**), Restore with an entitlement
      (**restored**) and on a clean account (**restore-empty**). Each must show the right overlay and
      leave the app in the right state — no silent no-ops.
      ⚠️ **The `owned` case is [IMP-100](build-log.md)'s acceptance, added 2026-09-08.** Before this fix
      the SDK's real Android error code for "already purchased" (`"6"`) could never match the name-based
      mapper, so this case has **never actually executed on a device** — every prior run of this walk
      exercised only `success`/`cancel`/`network`. Confirm: tapping Subscribe while already a member shows
      "You already have Plus" (not "That didn't go through … Try again") and membership is restored, not
      re-charged. If Play offers a way to simulate `PAYMENT_PENDING_ERROR` (a UPI mandate or similar
      deferred method), also confirm it shows "Payment still processing" (**deferred**), not `failed`.
      ⚠️ **The `network` case is also [IMP-088](build-log.md)'s acceptance.** It used to hang on
      *"Confirming with Play Store…"* **forever** with no way out — found on this walk 2026-09-06. Now:
      after ~20s the card must offer a **Close** button, and the copy must **not** claim the purchase
      failed (it says *if you were charged, your Plus will appear on its own*). Closing it must reconcile
      with the store, not guess. **A card that still says "Don't close the app" with no button after 20s
      means the device did not take the IMP-088 OTA** — see 0(b), not a failed fix.
- [ ] 5. **The renewal date — this is now IMP-082's acceptance.** After the successful purchase, check
      the date on the **You** tab banner, the **Shop** banner and **Manage**. It must be the tester's
      **real** next-renewal date from RevenueCat. Two distinct failures, and they mean different things:
      ⚠️ **`12 Jun 2026` anywhere is a REGRESSION of [IMP-082](build-log.md)** — the mock is back as a
      runtime fallback. **A surface showing the bare word `Member` (or a plan label with no "renews …")
      is NOT that bug** — it is IMP-082 working as designed, and it means RevenueCat handed back no
      usable `expirationDate`. Record which one you saw; they need opposite fixes.
      ✅ **The OTA gate is CLEARED.** IMP-082 landed after vc14 was cut, so the shipped binary does not
      contain it — but it was **published as an OTA on 2026-09-06**, update group `ac5c4189-736c-44f0-96ae-6ceea4fe4712`,
      runtime 1.0.8. **Confirm the device actually took it before trusting this step** (see step 0 above);
      a device still on the binary's bundled JS will show the old fabricating code and you will record a
      pass or fail against the wrong build.
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
- [ ] 10. **Cancel flow — this is now IMP-083's acceptance.** Manage → Cancel must land on **the Daily
      Rituals subscription page** in Play, with its own Cancel button — **not** the account-wide list of
      everything the tester subscribes to. That was the 2026-09-06 finding. The copy about keeping Plus
      until the period ends must also be accurate (see step 5 — the date must be real, or the clause is
      correctly absent). ⚠️ **If Play shows a "not found" / empty page rather than the subscription, the
      first suspect is the base-plan suffix strip**, not the `?sku=&package=` shape: `manageUrl` sends
      everything before the first `:` (so `plus_annual:annual` → `plus_annual`) on the strength of what
      the RevenueCat dashboard shows, and nothing has verified that against a real Play id. Record the
      exact URL Play opened. **Same OTA requirement as step 5** — IMP-083 is not in the vc14 binary
      either, so it is only present if the device took the 2026-09-06 update.

**Result — ❌ 2026-09-06 (hardware, owner-run; v1.0.9 / vc15 from Play `internal`, license tester, OTAs
applied and confirmed).** The sitting ran steps 1 through 4 and **stopped before any purchase was
attempted** — the owner's call, and the correct one: the first defect below can charge someone who asked
to restore. **Three defects found, plus a fourth off-script.**

**Pre-flight all clean.** Version confirmed **1.0.9**; the OTA applied (open → wait → kill → open, no data
clear); **no "Plus is unavailable" row**, so IMP-087's gate is alive and every result below is against a
healthy build. The published manifest was read back the same day — `rcAndroidKey` non-empty, newest group
`82bc2b16` (IMP-088), runtime 1.0.9. ⚠️ **One point of confusion worth recording:** the owner reported the
button reading **"Try free"**, which is the `shopui.js` banner that *opens* the paywall, not the paywall's
own CTA. Not a defect — but see IMP-090, it makes the same promise.

**Step 1 ✅.** Installed from Play on the license-tester account, 1.0.9 confirmed.

**Step 2 ✅ (re-confirmed).** Prices render in INR — the live offering reaches the app.

**Step 3 ❌ → IMP-090.** Our button promises `Start 7-day free trial`; **Google's own purchase sheet said
charging today** with the INR amount and no free period. Payment method correctly showed *"Test card,
always approves"*, so the license tester is configured. **The owner has subscribed and unsubscribed on
this Google account before** — a Play trial is once per account, ever, so **Play is almost certainly
right and the product config is probably fine**. The defect is ours: the claim is a string literal
([`Paywall.js:122`](../src/screens/Paywall.js#L122)) and `getPrices()` fetches only `priceString` and
`price`, so the app has never had offer data to be right about.

**Step 4a ❌ → IMP-089, FIXED this session.** With no subscription, Restore correctly showed *"Nothing to
restore."* — and its **"Try again" opened Play's purchase sheet**. `onRetry` called `buy()` unconditionally,
ignoring the mode the hook already tracked. The same bug fired from the `network` card in 4c. **This is the
one that stopped the sitting**: it puts a subscriber tapping "I already paid" one tap from a charge. Fixed
at the owner's explicit instruction rather than merely scoped — spec in [`build-log.md`](build-log.md),
968 green, **needs an OTA before the re-run**.

**Step 4c ❌ → IMP-091. IMP-088's acceptance FAILED.** Airplane mode, tap buy: *"Confirming with Play
Store…"* / *"Don't close the app."* Google's sheet raised its own no-connection error on top while the app
kept confirming behind it. **At 22s, 32s and past 60s the Close button never appeared and the copy never
changed.** Wiring was re-read and is correct — `Paywall.js` renders `flow.overlay`, which passes `stuck` —
so this is not a missing prop. ⚠️ **The cause is NOT yet established** and the spec's first step is a
measurement: either Android throttled the `setTimeout` while Play's sheet held the foreground, or the
device was not running the IMP-088 bundle. **Do not record this as "the fix does not work" until that is
separated.**

**Off-script ❌ → IMP-092.** Attempting to reach a stuck state via Restore instead (no Play sheet, app stays
foreground) revealed something else: **in airplane mode, Restore answers "Nothing to restore." instantly** —
and the owner's observation is the important half, *it has always been instant*. `restore()` relabels every
unrecognised error as `restore-empty`, so the sentence *"We couldn't find a subscription on this account"*
also means *"we could not check."* The person most likely to see it is a real subscriber on a new phone.
**It also invalidated the diagnostic** — the restore path never hangs, so it cannot be used to test IMP-091.

**Not attempted, deliberately:** steps 4b (cancel), 4d–4f, and steps 5–10. No purchase was made, real or
test. **Nothing is promoted `internal` → `production`.**

---

## ⬜ WALK-19 RE-RUN — 2026-09-07, the fixes are on the phone

**All four fixes shipped in one OTA on 2026-09-07.** Update group
`424b5a88-c993-44d7-91d6-db586ad22c32`, runtime 1.0.9, published from commit `de5cd34`. The manifest was
read back straight after publishing: `rcAndroidKey` is **non-empty** (32 chars, `goog_…`), so billing
stays ON — this is the IMP-086 trap and it is clear.

**Nothing below needs a cable or a computer.** It is all on the phone.

### First — get the new version onto the phone, and check that it arrived

The app does not update the instant you open it. It downloads in the background and starts using the new
version **the next time you open it**. So:

1. Open Daily Rituals. **Leave it open for about 15 seconds** — that is the download.
2. **Fully close it** — swipe it away from the recent-apps list. Not just Home; actually swipe it away.
3. Open it again. **This** launch is the new version.

⚠️ **Do NOT use "Clear data" or "Clear storage" at any point.** That deletes the downloaded update and
sends the app back to the version that came with the install, which is older than every fix. Every single
time this walk has gone wrong, this was why.

**How to tell it actually worked, without a cable.** Open the Shop (or the You tab) and look at the gold
Plus banner. The button on its right used to say **"Try free"**. It now says **"See Plus"**. If you still
see "Try free", the new version is not running yet — repeat the three steps above.

### Step 3 — does the trial claim match Play?

1. Tap the Plus banner to open the paywall.
2. **Look at the big button at the bottom.** It used to say *"Start 7-day free trial"*. It should now say
   either **"Subscribe"** or **"Try free, then subscribe"** — never the old wording, and **never a number
   of days.**
3. Tap it, and let Google's purchase sheet open.
4. **Compare the two.** Google's sheet is the truth. If Google says you are being charged today, our
   button must not have promised you a free trial. If Google offers you free days, "Try free, then
   subscribe" is fine.
5. **Back out of Google's sheet.** Do not buy anything yet.

**This passes if our button and Google's sheet do not contradict each other.** Also read the small print
under the button: it should no longer open with *"Your 7-day free trial converts to…"* unless Play is
actually offering a trial, and even then it says *"for new subscribers"* rather than promising you.

### Step 4a — Restore, with no subscription

1. On the paywall, tap **Restore** (top right).
2. You should get a card saying **"Nothing to restore."**
3. **Tap "Try again" on that card.**
4. **What must NOT happen: Google's purchase sheet must not open.** That was the dangerous one — it put
   someone saying "I already paid" one tap from being charged. It should just search again and come back
   with the same answer.

### Step 4c — the purchase that cannot finish

1. Turn on **aeroplane mode**.
2. Open the paywall and tap the big button to buy.
3. You will get *"Confirming with Play Store…"* and *"Don't close the app."* Google may put its own
   no-connection error on top of that — dismiss Google's error so you can see our card.
4. **Wait, and watch our card.** Within about 20 seconds of you getting back to our app, a **Close**
   button must appear and the wording must change. Last time it never appeared at all, even after a
   minute.
5. **Read the new wording before you tap anything.** It must **not** say the purchase failed. It should
   say something like *"if you were charged, your Plus will appear on its own — closing this won't cancel
   anything."* That is deliberate: a real card payment can take minutes, and telling you it failed while a
   bank is still processing would be worse than the wait.
6. Tap **Close**. Turn aeroplane mode off.

⚠️ **If the Close button still never appears**, that is a real result and worth writing down exactly —
but say so plainly rather than concluding the fix does not work. The measurement that would have told us
*why* the first time (whether the old fix was even running on the phone) was never taken. See the
IMP-091 note below.

### And one more, while aeroplane mode is on — the Restore fix

1. With **aeroplane mode ON**, open the paywall and tap **Restore**.
2. Last time this answered **"Nothing to restore." instantly**, which was a lie — it could not check.
3. It should now say **"We couldn't check."** instead.
4. Turn aeroplane mode off, and tap **Restore** again on an account with no subscription. It should say
   **"Nothing to restore."** — that sentence is still correct when we genuinely did check.

**Both halves matter.** Online-with-nothing must still say "Nothing to restore"; offline must not.

⚠️ **A known hole that this does NOT close, and it is not a bug in the fix.** RevenueCat sometimes answers
from its own saved copy of your account instead of failing, so an offline Restore can still say "Nothing
to restore" if that saved copy is empty. If you see that, it is the limit recorded in IMP-092 step 3, not
a regression. Write down which of the two you got.

### ✅❌ RESULT — 2026-09-07 (hardware, owner-run; v1.0.9 / vc15 from Play `internal`, license tester)

**Bundle confirmed without a cable.** The Plus banner's button read **"See Plus"**, not "Try free" — the
string that did not exist before this OTA. Open → wait → swipe away → open, no data clear. Every result
below is against the 2026-09-07 bundle.

**Step 3 ✅ PASSES.** Our button read **"Subscribe"**; Google's sheet read **"Starting today"**. They
agree, and no trial is promised to an account that cannot have one. **IMP-090 is proven on hardware.**
⚠️ **Worth keeping:** "Subscribe" means the live offering returned **no free phase at all** to the app —
so the original hardcoded *"Start 7-day free trial"* was never backed by anything the app could reach. It
was wrong in principle, not merely wrong for this buyer.

**Step 3 — two gaps, recorded not papered over.** (a) The **trial-eligible branch** — what a brand-new
account sees, where `ctaLabel` should return *"Try free, then subscribe"* — is **unexercised**, and cannot
be exercised on this account: a Play trial is once per Google account, ever. (b) The **onboarding paywall
mount** is **unexercised**; reaching it needs a data clear, which deletes the OTA and sends the next launch
back to the embedded bundle. Not worth it for a copy change a source assertion already pins.

**Step 4a ✅ PASSES.** With no subscription, Restore showed **"Nothing to restore."** and **"Try again"
repeated the restore — Google's purchase sheet did NOT open.** **IMP-089 is proven on hardware**, and this
is the one that stopped the last sitting. It also closes **IMP-092's online half**: a genuine check that
finds nothing must still say "Nothing to restore", and it does.

**Step 4c ⬜ INCONCLUSIVE — and the reason is a new defect.** Aeroplane mode, tap Subscribe: our card
appears, then Google's **no-connection page covers it — and that page has no X or dismiss control, only
Back**. Pressing Back dismisses Google's page **and closes the entire paywall**, taking the pending
overlay with it. Waiting **30 seconds without touching anything** does not help: Play's page **does not
self-dismiss**. So IMP-091's Close button could be working perfectly and never be seen, because its
container is destroyed first. → **[IMP-093](specs-open.md).**

⚠️ **Do NOT record this as "IMP-091 failed".** It was not observed, which is a different thing. The escape
arms on a return to the foreground with the grace period already spent, and no such return ever happens
cleanly on this path. **IMP-091 remains unproven, and may be unprovable via the Play-error route at all**
— see IMP-093, which concludes that the honest fix makes Back a *reconciling* exit rather than trying to
keep the card alive to be looked at.

**How much the new defect actually costs — checked, not assumed.** `useLaunchEntitlementCheck`
([`entitlementSync.js:33`](../src/billing/entitlementSync.js#L33)) runs on every launch where `plus` is
false, asks the store and grants Plus if there is an entitlement. So the bad version — charged, backed
out, app never notices — **does not happen**; it notices on the next launch. The cost is a delay and a
confusing minute, not lost money and not a stranded subscriber. In the aeroplane-mode case there was no
network and nothing could be charged at all.

**It also corrects the IMP-088 record.** That was written as *"force-quit was the only way out."* **Back
was always a way out.** The card's *"Don't close the app"* was telling the user not to do the one thing
that worked. Not re-litigated; recorded, and IMP-093 acts on it.

**The aeroplane-mode Restore check (IMP-092's second half) ⬜ INCONCLUSIVE — the fix was never reached.**
In aeroplane mode Restore answered **"Nothing to restore."**, not *"We couldn't check."* That is the
**known limit recorded in IMP-092 step 3 firing exactly as predicted**, not a regression:
`Purchases.restorePurchases()` **resolved** from RevenueCat's local cache rather than rejecting, so the
call took the *success* path and IMP-092's `catch` branch — the whole of the fix — was never executed.
⚠️ **Note the sequence made this near-certain**: step 4a had just run a successful online restore, which
leaves RevenueCat holding a fresh "no subscription" answer to serve offline.

⚠️ **This may be unprovable on any device with network history.** Reaching the `catch` needs a **cold**
cache with no network, and the SDK warms its cache at launch whenever there is a connection. The nearest
honest route is **step 9** (uninstall → reinstall → let the OTA apply → aeroplane mode **before** any
online restore), and even that is not guaranteed. **Record it as unproven; do not clear app data to chase
it — that deletes the OTA.**

**Worth keeping, because it reframes IMP-092.** If the cached reply is the dominant real-world behaviour,
then the *relabelling* IMP-092 fixed is the rarer half of the problem and **the cache limit is the larger
one**. It is narrower than it first looked, though: a real subscriber's cache on a new phone warms with
**their** entitlement, so the dangerous sentence needs a cache warmed with "no entitlement" — a wrong
account, or a check that ran before the purchase propagated.

**Not run:** steps 4b, 4d–4f and 5–10.
**No purchase was attempted, real or test. Nothing is promoted `internal` → `production`.**

### What is still owed after this

Steps **4b** (cancel), **4d–4f**, and steps **5–10** — none of them has ever run. Step 8 is the only one
involving real money. **Nothing is promoted `internal` → `production` until this row is ✅.**

⚠️ **IMP-091 carries an unrun measurement.** Its spec's step 0 was meant to separate *"Android froze our
timer while Google's sheet was open"* from *"the phone never had the previous fix"*, and it needs the
device — it was not run. The walk's own pre-flight recorded 1.0.9, the update applied, and the right
bundle in the manifest, which points at the first, but does not settle it. The fix is right if it was the
first and harmless if it was the second. **This re-run is what separates them.**

### ✅❌ RESULT — 2026-09-08 (hardware, owner-run) — steps 4b, 4c retry, aeroplane Restore, 4d–4f, 5–7, 9 run

**4b (cancel) ✅ PASSES.** Backed out of Google's sheet mid-purchase; app returned to normal, no stuck
screen, no message.

**4c retry ✅ PASSES — and this closes the IMP-093/IMP-091 question.** Airplane mode, tapped buy, backed
out of Google's no-connection page: app returned to normal with no card left behind. This is the fix's
actual, deliberate acceptance (`docs/build-log.md` IMP-093 note 1: *"the fix deliberately does NOT keep
the card on screen… do not re-open 4c expecting one"*) — **not a bug.** IMP-091 stays correctly
unobservable on this path, by design.

**Aeroplane-mode Restore (IMP-092's second half) — still the known limit, not a regression.** Answered
"Nothing to restore." instantly, same as before. Matches the documented cache limit (RevenueCat serves a
locally-cached answer offline rather than failing) — record as reproduced, not new.

**4d (a real test purchase) ✅ PASSES.** License-tester purchase completed, app confirmed Plus.

**4e (buy again while already subscribed — IMP-100's device acceptance) ⚠️ INVALID, NOT A FAILURE — re-run owed.**
Tapped Subscribe while already a member: Google's own sheet said the account already has the subscription,
but the app showed **"That didn't go through"** (the `failed` card), not "You already have Plus."
🔴 **Re-scoped 2026-09-08 by reading the shipped tree: the phone did not have IMP-100 or IMP-101.**
This sitting ran on OTA group `d42b7ec7` (commit `768bc88`, 04:58); IMP-100 landed at 12:30 and IMP-101 at
12:39, **neither pushed, neither carrying a `Release-Lane: ota` trailer**, so CI never published them.
`git show 768bc88:src/billing/mapError.js` is the pre-IMP-100 name matcher, and the literal
"That didn't go through." is copy IMP-101 replaced with "We couldn't confirm that." — **the wording itself
dates the bundle.** Step 4e reproduced the bug IMP-100 fixes, on a build without the fix. See
[IMP-103](specs-open.md#imp-103): ship, then re-walk. **Nothing to diagnose.**

**4f (Restore with an active entitlement) ✅ PASSES.** Tapped Restore while subscribed: "Plus Restored."

**Step 5 (renewal date) ✅ PASSES.** You tab, Shop banner and Manage all showed the correct, real
renewal date. **IMP-082 is proven on hardware.**

**Step 6 (ember packs absent) ✅ PASSES.** No "Gather Embers" section, no $1.99/$4.99/$9.99 anywhere.
⚠️ **Owner note, not a defect:** embers are coming back as a real feature later — out of scope for this
walk, raised separately with the owner.

**Step 7 (Plus perks) 🟠 PARTIAL — one new defect.** The four Plus-gated perks (unlocked palettes/skies,
missed-day candle, On this day, Deeper insights) work. **But the *default*, always-free palette/sky
items (Golden Hour, Golden Sun, Crescent Moon) rendered as ember-locked ("buy") instead of free** →
[IMP-104](specs-open.md#imp-104). Not a Plus-gating bug — it reproduces with Plus active — it's the
free/default tier itself showing as paid. ✅ **Cause found in source 2026-09-08, no device dump needed —
the row is ready to build.** ⚠️ **Do not tap those three cards on a device you care about until it ships:**
`embers < 'owned'` is a NaN compare, so the affordability guard passes and the balance becomes `NaN`,
which persists as `null` and reads back as **0**. One tap wipes the ember balance.

**Step 9 (reinstall + Restore) ❌ → [IMP-105](specs-open.md#imp-105) — and the result is now in doubt.**
Uninstalled, reinstalled from Play, tapped Restore on an account with an active, just-purchased
subscription: **"Nothing to restore."** Step 4f above is the control: same device, same account, same
bundle, minutes earlier, Restore returned "Plus Restored." Identical code ran both times, so the defect is
not in `restore()`.
🟠 **The owner's dashboard round (2026-09-08) moved this.** Restore Behavior is "Transfer to new App
User ID" — the permissive setting — so the transfer theory is dead; entitlement id and Play credentials are
clean. But **RevenueCat holds no customer with an active entitlement.** Google compresses license-tester
subscriptions (monthly renews every 5 min, yearly every 30 min, auto-cancelled after 6 renewals), giving
a test sub ~30 minutes or ~3 hours of life. **The subscription very plausibly expired during this walk**,
in which case "Nothing to restore" was correct and there is no defect. Unconfirmed — see IMP-105's C1–C4.
⚠️ **The walk did not record which plan step 4d bought, nor the wall-clock time of any step.** That
omission is why this cannot be settled today.
⚠️ **Play Console will never show these purchases** — license-tester test purchases are not orders. Look
on the phone instead: Play Store → Payments & subscriptions → Subscriptions.

**Step 10 (cancel flow) — not run.** Blocked by step 9's failure: no restorable entitlement to cancel
from after the reinstall.

**Not run:** step 8 (the one real-money purchase + refund) — owner is holding it for the very end,
deliberately, same as the original spec's ordering.

🚦 **NEW PRE-FLIGHT STEP, from this sitting's most expensive lesson.** Before running any step,
**record which JS bundle the phone is actually running** and write it into the result block. Two of this
sitting's three "defects" were the phone being behind, and nothing on screen said so. Today that string is
only reachable when billing is broken and the user is not a member — [IMP-106](specs-open.md#imp-106) puts
it on the You tab permanently. Until IMP-106 ships, get it from the OTA group id the release CI recorded,
and **never start a walk on a device whose bundle you cannot name.**

🚦 **NEW ORDERING RULE — this sitting's second structural defect.** A Google Play license-tester
subscription is **not** long-lived: monthly renews every 5 minutes, yearly every 30, and Google
auto-cancels after 6 renewals — so it lives roughly **30 minutes (monthly) or 3 hours (annual)** and then
correctly disappears. The current ordering puts a full perks tour between the purchase (4d) and the
reinstall (9), so **step 9 structurally cannot test what it exists to test.** From now on:

1. **Buy → uninstall → reinstall → Restore is ONE tight block**, run immediately after the purchase.
   Everything else moves after it, or onto a second purchase.
2. **Record the plan bought (monthly / annual) and the wall-clock time of every step.** Neither was
   captured on 2026-09-08 and their absence is what left IMP-105 unresolvable.
3. **Prefer annual** for anything that must outlive several steps — ~3 hours instead of ~30 minutes.
4. Do not go looking in Play Console Order Management; test purchases never appear there.

**Recording it.** Same rule as every row: ✅/❌ + date in the index, a paragraph here. **A failure is
the deliverable** — scope it as a new `IMP-xxx` in `PROGRESS.md`, do not fix it mid-walk. **Do not
promote `internal` → `production` until this row is ✅**, whatever the build says.
