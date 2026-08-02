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

> **Two open tasks, in this order: [IMP-034](#imp-034--hide-gather-embers-while-the-app-ships-free) first (small, live in production right now), then [IMP-033](#imp-033--the-restore-is-offered-not-imposed-quarantine--post-onboarding-offer).** Both specs are inline at the bottom of the backlog. There is also an **open strategic decision** under Open items — whether to sell a consumable currency at all — which does not block either task but must be settled before `PLUS_ENABLED` flips. It came out of the 2026-08-02 real-device walk: the OS restores a Google backup silently and without consent, and the app's notice only offers acceptance. IMP-022 (Save as PDF + About) stays **⏸ deferred by owner decision**; its spec sits in [`docs/build-log.md`](docs/build-log.md) → "⏸ Deferred specs" (still valid, not history) — do not start it without the owner reviving it. The **real-device walk is now DONE** for IMP-029/030/031/032; only **IMP-021** is outstanding there, rejected by the owner as "not properly completed" and awaiting a decision on which shortfall to fix.

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
| IMP-033 | 🔴 **The restore is offered, not imposed** — quarantine an OS-restored backup, run the app as a genuine first install (onboarding and all), then offer the backup with fair warnings once onboarding is done | OTA | ⬜ **OPEN — spec inline below** |
| IMP-034 | 🔴 **Hide "Gather Embers" while the app ships free** — the Shop sells ember packs at real cash prices ($1.99–$9.99) wired to no IAP at all, and the section is not gated by `PLUS_ENABLED`. Wrap it, exactly like the Plus banner beside it | OTA | ⬜ **OPEN — small; take before IMP-033** |

---

## IMP-033 — the restore is offered, not imposed (quarantine + post-onboarding offer)

**Lane: OTA** (pure JS — no new native module; `expo-application` is already in the tree since IMP-029). Reaches **testers only** until vc11 is promoted.

**Owner's ask, verbatim (2026-08-02, after the IMP-029 device walk):** *"The app should run as if it was installed for the first time, with the welcome and everything. And then once that is done, the user should be given a pop up or prompt that there is a backup detected — would they like to load that up instead? Along with the fair warnings."*

### Why this replaces the current behaviour

IMP-029 detects an OS restore and shows a notice — but by then the restored data **is already the app's live state**, and the notice's only two actions are *Got it* (accept) and *Restore from a file* (replace from JSON). There is no way to decline. The walk proved the failure mode is real and not rare: the restore was **stale (2 entries against the 5 that were live)**, imposed without a prompt, and the user's only escape was to go hunting for You tab → Reset all data.

**What is NOT fixable, and must not be attempted:** intercepting the restore itself. Android Auto Backup writes the data at **install time, inside the OS**, before the app's first line of JS runs; `BackupAgent.onRestoreFinished()` fires only *after* it has landed. There is no prompt-before-restore API. The only OS lever is `allowBackup: false` ([`app.config.js:49`](app.config.js#L49)), which would delete IMP-006 entirely. So the fix is to **quarantine** what the OS forced on us and hand the decision back to the user.

### Does Android already ask? Only in one of the two paths — get this right

There are **two different restore paths** and they have opposite consent properties. An earlier note in this file blurred them; the precise position:

- **New phone / post-factory-reset.** Android's setup wizard **does** show a restore screen ("Copy apps & data" → pick a source device → optionally deselect apps). So there *is* consent — but it is a **device-level bulk choice about dozens of apps at once**, made by a user who is not thinking about this app, and it says **nothing about how old the data is**. Most people tap through it.
- **Reinstalling on the same device** — uninstall, then install again. **Android asks nothing at all.** The restore is completely silent. **This is the path the owner hit on 2026-08-02**, and it is the one with genuinely zero consent.

So the honest case for IMP-033 is *not* "Android never asks". It is: **the reinstall path has no consent whatsoever, and neither path ever discloses staleness.** The disclosure half is the larger win, and it applies to both paths.

### ⚠️ Trade-off, stated plainly — and REAFFIRMED by the owner

On a genuine **new phone**, the user today gets their journal back with zero friction — arguably the delight IMP-006 was built for. Under IMP-033 they do **onboarding first**, then get offered it. That is a real regression in the new-phone path, bought to gain consent in the reinstall path. Mitigate with warm, unmistakable copy — the offer must read as "your journal is here, want it back?" and never as an error.

**Decision is settled — do not reopen it.** On 2026-08-02 the owner challenged the premise directly ("android asks restore from backup? if it does then why are we even bothering?"), was shown the full counter-case — that new-phone setup *does* ask, that a cheaper **disclosure-only** alternative (keep the restore, add a "Start fresh" action + the newer-export comparison to the existing notice) would capture most of the value at roughly half the work and with no new-phone regression, and that this was the recommendation — and **chose quarantine + offer anyway.** Build it as specced.

### 🚫 What this task does NOT do — it cannot guarantee the backup is current

**Android Auto Backup hands the app exactly one copy: the last one the OS uploaded.** There is no version history, no "fetch the newest" API, no way to list or choose among backups — and the app does not even receive it, it is simply *already in AsyncStorage* at first launch. The OS uploads at most **once per 24h** and only while **idle + charging + on unmetered Wi-Fi**, so a copy that is 24h — or many days — behind is the normal case, not the exception. There is also **no way to force a fresh backup from inside the app**: native `BackupManager.dataChanged()` only *requests* one and is still subject to the same throttle and conditions, and Expo does not expose it.

**Therefore "make sure the restore is the latest" is not achievable by any design.** The only honest remedy is disclosure, which is what both IMP-029 and this task do — and the only genuinely user-controlled fresh copy is the **JSON export**, which is why step 6's copy fix matters more than it looks.

**Consequence for the offer sheet (do not drop this):** the stash carries the persisted `lastBackupAt` (the user's last JSON export) alongside `lastSavedAt` (the Google copy's age). When the export is the **newer** of the two, the sheet must say so and lead with the file route — otherwise the app would talk a user into loading the staler of two backups it can see.

### Design

**1. Quarantine on launch — [`App.js`](App.js), inside the existing load effect (~lines 55–75).**

The `isRestoredInstall` check already there stops calling `setRestoredFromMs` and instead quarantines. **Order is safety-critical — the stash must be durable before anything is cleared:**

1. Read the **raw** payload string (`AsyncStorage.getItem(KEY)`), not the deserialized slice — stash it losslessly.
2. Write it to a new key `dailyrituals:v1:pendingRestore`.
3. **Read it back and verify it parses.** If the write or the read-back fails, **abort the quarantine entirely** and fall through to today's IMP-029 behaviour (live data + the old notice). Never clear the main key on an unverified stash. This mirrors `runConfirmedImport`'s existing "recovery copy must succeed before the destructive step" guarantee.
4. `clearState()` the main key.
5. Hydrate as a fresh install — `onboarded` stays `false`, `hydrated` is the default slice. `hasCompletedOnboarding(null)` already returns `false` ([`onboarding.js:11`](src/persistence/onboarding.js#L11)), so onboarding shows with no change to that module.

**Idempotent by construction.** Killed between steps 2 and 4? Next launch still sees `installedAt > lastSavedAt`, re-stashes (overwriting), and proceeds. Killed after step 4? Main key is empty, so there is no `lastSavedAt`, no re-detection — and the offer fires off **stash presence**, not session state (see below), so nothing is lost.

**2. The offer — fires on stash presence AND onboarding complete, never on session state.**

Condition: `pendingRestore` exists && `onboarded === true`. Evaluate it on every launch and on the `onDone` transition at [`App.js:120`](App.js#L120) — so a user who is killed mid-onboarding, or who declines and relaunches, still gets it. Do **not** tie it to the same session that quarantined.

**3. New sheet `src/screens/RestoreOffer.js`** — presentational, props in / callbacks out, same scrim-and-card shape as [`RestoreNotice.js`](src/screens/RestoreNotice.js) (reuse its `GhostButton`; extract to `src/ui.js` if it's now shared).

Copy — warm, and every warning stated:
- Title: **"We found your journal."**
- Body: `Your journal was backed up to your Google account on {formatBackupDate(stash.lastSavedAt)}. You can load it now.` then, as distinct warning lines: **it replaces everything you've just set up** (your name, theme, and anything written since installing) · **it's from {date}** — anything written after that isn't in it.
- **Three** actions, not two: **Load my journal** (primary) · **Restore from a file** (ghost — routes to the existing `doImport` picker) · **Keep this fresh start** (ghost). Dropping the file route would make this sheet strictly worse than the IMP-029 notice it replaces.
- **Freshness comparison (required).** Read `stash.lastBackupAt` (the user's last JSON export) next to `stash.lastSavedAt` (the Google copy). When the export is **newer**, invert the emphasis: say so in one line — `You also exported a file on {date}, which is newer` — and promote **Restore from a file** to primary. The app must never talk a user into loading the staler of two backups it can already see.

**4. Actions.**
- **Load** → `Alert.alert` confirm → `backupIO.writeRecovery(createBackup(currentSlice))` **before** anything is replaced (same guarantee as above) → `deserialize(stash)` → route through the existing `handleReplaceAllData` (it already saves + bumps `dataKey` to remount) → delete the stash → done.

**🔴 The sheet MUST name the paid inventory in the stash.** `embers`, `ownedPalettes`, `ownedSkies` and `freezes` are **local-only with no recovery path of any kind** (see the 10b blockers under Open items) — no server holds them, so a user who declines and later discards the stash has destroyed purchased goods permanently. The offer must read the stash and say what is in it — e.g. *"including 1,500 Embers, 4 palettes and 3 candles"* — so "Keep this fresh start" is an **informed** choice, and the discard confirm must repeat it. This is why the decline path keeps the stash rather than deleting it; that rule is not negotiable. (Costs nothing today — `PLUS_ENABLED = false` ⇒ zero paying users — but IMP-033 ships before 10b and must not be the thing that eats someone's purchase later.)

**Plus subscriptions are NOT affected and must not be "restored" from the stash.** The entitlement lives with RevenueCat / the user's Google account, so it survives the quarantine independently. Do not copy `plus` out of the stash as though it were authoritative — re-query the entitlement instead. The related launch-time re-check gap is logged as its own 10b blocker; **if it is still open when this task is built, the offer sheet is the wrong place to paper over it.**
- **Keep this fresh start** → **do not delete the stash.** Surface it instead as a new row in the You tab's "Your journal is safe" card: `Google backup — {date}` → reopens this same sheet, plus a **Discard it** action (confirmed) that deletes the stash. A one-shot destructive dismissal is exactly the trap this task exists to remove.

**5. IMP-029's `RestoreNotice` stays** — it is still the correct surface for the abort path in step 3, and for old installs whose payload predates the `lastSavedAt` stamp. Do not delete it.

### Steps

- [ ] 1. New pure `src/persistence/restoreQuarantine.js`: `shouldQuarantine({ lastSavedAt, installedAt })` (delegates to `isRestoredInstall`) and `shouldOfferRestore({ hasStash, onboarded })`. **RED first.**
- [ ] 2. Stash IO in `src/persistence/storage.js`: `readPendingRestore()` / `writePendingRestore(raw)` / `clearPendingRestore()` / `readRawState()`, each `try/catch` → falsy on failure, matching the file's existing shape. No throwing.
- [ ] 3. `App.js` quarantine sequence per Design §1, with the verified-read-back abort.
- [ ] 4. `src/screens/RestoreOffer.js` + wire the offer condition per §2.
- [ ] 5. Load / decline / discard actions per §4, including the You-tab row.
- [ ] 6. Copy fix (bundled, from the same walk): the export flow never says the Google backup is a **separate** system. Add one line to the `explainAutoBackup` alert ([`RitualsApp.js:385`](src/RitualsApp.js#L385)) and to the export confirmation making clear that **"Back up my journal" does not refresh the Google backup** — the owner hit exactly this and misread a correct restore as a stale-data bug.
- [ ] 7. `npm test` (expect **367 + new**), `npx expo export --platform android` clean, update PROGRESS + archive this spec to build-log.

### Tests (pure only, per project convention)

`shouldQuarantine` (inherits `isRestoredInstall`'s 7 cases — assert delegation, don't duplicate) · `shouldOfferRestore` (stash+onboarded → true; stash+not-onboarded → false; no stash → false either way) · **`preferredSource({ lastSavedAt, lastBackupAt })` → `'google' | 'file'`** (export newer → `'file'`; Google newer → `'google'`; export missing/equal → `'google'`; non-numeric either side → `'google'`, no coercion) · a `storage` round-trip case (write → read → clear) · a regression case asserting a **failed stash write leaves the main key intact**. No render tests for the sheet (same non-goal as every other sheet in the app).

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

Release-Lane: ota
```

**Ship:** OTA. No `bump:*`. The trailer above ships it **to testers only** (`runtimeVersion` = `appVersion` = 1.0.5). Omit the trailer for WIP.

---

## IMP-034 — hide "Gather Embers" while the app ships free

**Lane: OTA.** Small — take this **before** IMP-033; it is minutes of work and it is live in production right now.

**Problem.** [`Shop.js:166–170`](src/screens/Shop.js#L166) renders the "Gather Embers" section — `EMBER_PACKS` at `$1.99 / $4.99 / $9.99`, labelled "bought with cash" in [`data.js:132`](src/data.js#L132) — with **no `plusEnabled &&` wrapper**, unlike the Plus banner ten lines above it at [`Shop.js:56`](src/screens/Shop.js#L56). The buy handler ([`RitualsApp.js:532`](src/RitualsApp.js#L532), and `getEmbers` at [`RitualsApp.js:173`](src/RitualsApp.js#L173)) is a bare `setEmbers((e) => e + pack.amount)` — **no `purchaseService`, no RevenueCat, no IAP.** So the shipping free build **displays cash prices for something that is free** and hands out 1,500 embers for a tap on "$9.99". Nobody is charged, so no money is at risk; it is a price misrepresentation of the same class IMP-028 fixed on the paywall.

**Scope — gate, do not build billing.** Wrap the "Gather Embers" section in `plusEnabled &&`. Then check every path that *opens* the ember screen when the user is short — `buyPalette` / `buySky` / `buyCandles` all call `setGetEmbersOpen(true)` ([`RitualsApp.js:153/161/168`](src/RitualsApp.js#L153)) — and the `EmberPill` in the Shop header ([`Shop.js:51`](src/screens/Shop.js#L51)). With the section hidden, those must **not** open a purchase surface: show a toast explaining embers are earned daily, matching the existing copy *"Embers also gather on their own — one for every day you keep"*. Also gate the `getEmbersOpen` Modal itself ([`RitualsApp.js:529`](src/RitualsApp.js#L529)) so no route can reach it. Wiring real consumable IAP is explicitly **out of scope** — and may never happen, pending the strategic decision under Open items.

⚠️ **Reach caveat:** OTA lands on **testers only** (`runtimeVersion` 1.0.5 ≠ the public's 1.0.3). The public keeps the free-embers Shop until vc11 (or later) is **promoted to production**. That is an argument for promoting sooner, not for skipping this.

**Tests:** the gating is JSX, so assert it where it is cheap — a `Shop` render case with `plusEnabled={false}` asserting no `EMBER_PACKS` price string appears, and one with `true` asserting they do. Keep it to that; render tests are otherwise a non-goal in this codebase.

```
fix(shop): hide the cash ember packs while the app ships free (IMP-034)

The Gather Embers section renders EMBER_PACKS at $1.99-$9.99 with no
plusEnabled gate, and its buy handler is a bare counter increment with
no IAP call — so the free build shows prices for something that costs
nothing and grants embers for a tap.

Gate the section, the header pill and the modal, and route the
insufficient-embers paths to a toast instead of a purchase surface.
Wiring real consumable IAP is out of scope and may never happen.

Release-Lane: ota
```

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
- **Fixable — what happens next.** [`RestoreNotice.js`](../src/screens/RestoreNotice.js) offers exactly two actions: **Got it** (accept) and **Restore from a file** (replace from JSON). There is **no way to reject the restored data**. A user handed a stale restore who wants to start clean has to find You tab → Reset all data on their own, and the notice never mentions it.

**✅ RESOLVED — scoped as [IMP-033](#imp-033--the-restore-is-offered-not-imposed-quarantine--post-onboarding-offer), the open task.** The owner rejected a mere "Start fresh" button in favour of a stronger design: **quarantine** the OS-restored payload, run the app as a genuine first install (onboarding and all), then **offer** the backup with fair warnings once onboarding is done. Full spec inline above.

### 🟡 Finding 2026-08-02 — "Back up my journal" says nothing about the Google backup at the moment of use

Owner: *"When I press 'Backup my journal' it gives me the option to send or share it… but no mention of a 'google backup'."* The surface **does** exist — [`YouScreen.js:130`](../src/screens/YouScreen.js#L130) renders an **"Automatic backup / How it works"** row directly *above* "Back up my journal" in the same "Your journal is safe" card, wired to `explainAutoBackup` ([`RitualsApp.js:385`](../src/RitualsApp.js#L385)). So this is discoverability, not absence: the two backups are separate systems and the export flow never says so at the moment the user is thinking about backups. Small copy fix, bundle with IMP-033.

**⚠️ The trap this walk exposed — and the confirmed cause of the "2 entries vs 5" staleness.** The owner tapped the in-app **"Back up my journal"** before uninstalling, which is the **JSON export and has ZERO effect on the Google backup.** They are unrelated systems. Exporting a JSON does not refresh what Auto Backup holds; the Google copy refreshes only on the OS's own schedule (≤once/24h, idle + charging + unmetered Wi-Fi) or via **Settings → Google → Backup → Back up now**. So the restore returned whatever the OS last took on its own — **correct behaviour, correctly announced by the notice.** If a naming-literate owner misread this, users certainly will: the copy fix is step 6 of IMP-033. Any future staleness report must first establish *which* backup was taken.
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

### 💳 Phase 10b — payments (the next real track, gated externally)

- **🔓 BillDesk deadlock broken — application SUBMITTED 2026-07-30, ⏳ awaiting verification.** The trap was circular: BillDesk PA-CB seller verification wants the **live app's Play Store URL**, payments need BillDesk, BillDesk needed a published listing. Shipping v1.0.3 broke the cycle, and the owner has now submitted the application with their details. **v1.0.3 is now live and approved**, so the listing URL resolves publicly — if BillDesk queries it during verification it will no longer 404, and the URL can be re-supplied with confidence if they ask again. **Submitted ≠ verified** — BillDesk/Google still have to approve the payments profile, and until they do, subscription products cannot be activated. Watch for mail from `onboarding@billdesk.com` and Play Console → **Payments profile**. Window opened 2026-06-04 (≤90 days ⇒ ~**2026-09-02**).
- **Owner to confirm once the profile verifies:** whether any Play subscription products exist yet — Play Console → **Monetize → Subscriptions** (any products, and are they *active*?) and RevenueCat → **Offerings** (does `current` list packages?). Playbook 10b.2–10b.5 are still unchecked and "Play product ids" is still `TBD`.
- **🔴 HARD BLOCKER before `PLUS_ENABLED` — the ember packs display cash prices and are wired to NOTHING.** [`data.js:132`](../src/data.js#L132) labels `EMBER_PACKS` "bought with cash" at `$1.99 / $4.99 / $9.99`, but the buy handler is [`RitualsApp.js:532`](../src/RitualsApp.js#L532) — `onBuy={(pack) => { setEmbers((e) => e + pack.amount); … }}` — a bare counter increment. **No `purchaseService`, no RevenueCat, no IAP of any kind.** Same path via [`Shop.js:170`](../src/screens/Shop.js#L170) → `getEmbers(pack)` ([`RitualsApp.js:173`](../src/RitualsApp.js#L173)). Worse, **this surface is not gated by `PLUS_ENABLED`**: the Shop's "Gather Embers" section ([`Shop.js:166`](../src/screens/Shop.js#L166)) has no `plusEnabled &&` wrapper, unlike the Plus banner at line 56 — so it renders **in the shipping free build with cash prices on it**, and tapping a "$9.99" pack grants 1,500 embers for free. Nobody is charged, so no money is at risk, but the app is **displaying a price for something that costs nothing** — the same class of misrepresentation IMP-028 fixed for the paywall. Either wire the packs to real consumable IAP products or hide the section behind `PLUS_ENABLED` (the cheap, correct move for the free release — do this one first).
- **🔴 Before `PLUS_ENABLED` — a returning subscriber is shown as non-Plus and is never re-checked.** The entitlement itself is safe: it lives with **RevenueCat / the user's Google account**, not on the device, so it survives uninstall, a new phone, and a declined restore. But the local `plus` flag is only a **cache**, and the AppState refresh effect ([`RitualsApp.js:222–228`](../src/RitualsApp.js#L222)) early-returns `if (!plus)` — **so when the cache is false the app never asks RevenueCat at all.** A paying subscriber on a fresh (or IMP-033-quarantined) install therefore sees a free, downgraded app until they find "Restore purchases" **behind the paywall** — the one place a non-Plus-looking user has no reason to go. `doRestore()` ([`RitualsApp.js:211`](../src/RitualsApp.js#L211)) already works; it just needs to run **silently at launch whenever local `plus` is false**, plus a visible manual route outside the paywall.
- **🔴 Embers, owned palettes/skies and freeze candles are LOCAL-ONLY and have no recovery path whatsoever.** They live in `PERSISTED_KEYS` ([`state.js:9–10`](../src/persistence/state.js#L9)) and **nowhere else** — no server record, no RevenueCat, nothing Google holds. If local state is wiped and not restored, paid inventory is **gone permanently**, and unlike the subscription there is no entitlement to re-query. Today this costs nothing (`PLUS_ENABLED = false` ⇒ **zero paying users exist**), but it is the reason IMP-033's decline path must never be a one-tap destruction — see the inventory warning folded into its spec.
- **⚠️ Before flipping `PLUS_ENABLED`: create the `RC_ANDROID_KEY` EAS env var AND GitHub repo secret.** `.env` is git-ignored and never reaches EAS Build (no `.easignore`, no `env` block in `eas.json`), so a cloud build would resolve the key to `''` → `isBillingConfigured()` false → `createPurchaseService` returns the **simulation** → the paywall fakes a purchase and grants Plus free, with no crash. IMP-028 added `scripts/check-billing-config.js` as a hard preflight in the build job, but it only arms once `PLUS_ENABLED` is true. Run `eas env:create --name RC_ANDROID_KEY --scope project --environment production` and add the repo secret of the same name (`release.yml` references it; the Actions linter flags it as undefined until it exists).
- **⚠️ The "7-day free trial" claim is hardcoded** in the paywall CTA + legal footer ([`Paywall.js`](src/screens/Paywall.js), [`PlusFlow.js`](src/screens/PlusFlow.js) `LegalFooter`). Only truthful if the Play base plan actually carries a 7-day free-trial offer. **Decide the offer when creating the products**, then either configure the trial in Play or change the copy — do not ship the claim unverified. Left hardcoded deliberately: the correct fix reads the intro/trial period off the live offering, which cannot be built or tested until real products exist. Prices themselves are already live-driven (IMP-028).

### ⛔ Parked

- **iOS (Phase 11):** blocked on a Mac / EAS macOS + Apple Developer Program enrollment. The Phase 6 iOS real-billing row is blocked on the same.

---

## Last session note

_History archived in [`docs/build-log.md`](docs/build-log.md) → "Session notes". Only the two newest notes stay here; every chat moves the older one out when it appends a new one (see DEVGUIDE Step 4)._

_2026-08-02 (vc11 released) — **v1.0.5 / versionCode 11 is BUILT, SUBMITTED and LIVE to testers on the `alpha` track.** Owner approved the CI run; vc10's redundant run was dropped, so **vc10 never shipped and vc11 is the only build after vc9**. Five previously-unreleased features are now in testers' hands: **IMP-021** (Lifetime Progress), **IMP-028** (live store prices), **IMP-029** (restore notice), **IMP-030 A+B** (row auto-stack + font-scale cap), **IMP-031** (daily reminder). IMP-032's harness shipped in the *tree* but not the *bundle*. **The public is still on v1.0.3** — promoting alpha → production is an untaken owner decision, and until it is taken every one of those five is unshipped as far as real users are concerned. **The OTA lane reopened, but only onto testers** (`runtimeVersion` = `appVersion` = 1.0.5 matches vc11, not the 1.0.3 the public runs). Docs reconciled: backlog rows for IMP-021/028/029/030/031 moved from "code-complete" to "shipped to testers", each carrying its outstanding walk; the App status block now names both live tracks explicitly so "live" is never ambiguous again. NEXT: (a) owner decides on the alpha → production promotion, and (b) a chat spends itself on the **real-device walk** of the closed-testing build — IMP-021 has never been walked at all, IMP-029 needs a genuine Auto Backup cycle, IMP-030 anchor 1 needs the 4%-margin check, IMP-031 must be verified **backgrounded**, and the IMP-032 harness itself is unwalked._

_2026-08-02 (real-device walk — 3 of 5 debts closed) — **no code changed; docs only.** Owner walked the vc11 closed-testing build on real hardware and passed **IMP-030** (the ~4% anchor-1 margin held on real font metrics — no need to lower the `0.48` glyph ratio), **IMP-031** (including the backgrounded case, the one the emulator could not settle) and **IMP-032** (harness sections, knobs, Apply/confirm, Inspector). All three are now **DONE** in the backlog table. **IMP-021 walked but rejected by the owner** — "not actually completed properly," though progress is visible on device; re-read of `InsightsScreen.js` against the approved design surfaced two concrete deviations, now written up under Open items: (1) `deriveLifetime` computes **`xpEarned` and nothing renders it**, while design §4 asks for it "surfaced quietly" in the level context line; (2) `LifetimeHeat` collapses **`missed` and `empty` into the same transparent bordered cell** with no month labels and no legend, so a missed day is indistinguishable from a pre-start day — which also contradicts IMP-014's 💀 convention on the other two grids, and on a short history just reads as blank squares. Three things confirmed **not** defects, so nobody "fixes" them later: the milestone timeline is deferred to roadmap piece C, the Home hero is untouched on owner constraint, and the "Days kept"/"This month" tiles were deliberately removed (spec §2). **IMP-029 is now the only real walk debt**, and it is genuinely un-fakeable: the notice needs `installedAt > lastSavedAt`, `installedAt` is Android's read-only `firstInstallTime`, and `serialize` force-stamps `lastSavedAt = now` on every save — so no harness knob or hand-edit can produce it, only a true backup→uninstall→reinstall cycle. Wrote a **full device-walk procedure** into build-log → IMP-029: the key unlock is **`adb shell bmgr backupnow`**, which triggers Auto Backup on demand and removes the 24h/idle/charging/Wi-Fi wait, plus the two prerequisites that silently break the test (same signing cert on both installs; never `adb uninstall -k`), the positive case, and five negatives (normal launch / update-over-the-top / OTA / genuinely-fresh-install via `bmgr wipe` / manual JSON restore). NEXT: (a) owner runs the IMP-029 procedure, (b) owner confirms which IMP-021 shortfall is the real one so Opus can scope it as IMP-033, (c) the alpha → production promotion decision is still untaken._
