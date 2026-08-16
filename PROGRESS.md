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
| **Build task** | [`docs/specs-open.md`](docs/specs-open.md) | the **first ⬜ `IMP-xxx`** in the backlog below — its row links to the spec |
| **Runtime walk** | [`docs/walk-open.md`](docs/walk-open.md) | the **first ⬜ `WALK-nn`** in that file's own index |

**Never both in one chat.** A spec is **code-complete at `npm test` green + `npx expo export` clean** — its
runtime proof is a separate WALK row for a separate chat, so a missing walk is *not* an unfinished spec.
Neither queue is the phase ladder (8 / 10b / 11), parked in [`docs/playbook.md`](docs/playbook.md).

> **The backlog is empty** — `IMP-075` (remove the IMP-041 tip cards) landed 2026-08-16, `11fa421`;
> `docs/specs-open.md`'s index is empty again. `IMP-063` through `IMP-075` have all
> landed; `IMP-072` has no spec at all — found and fixed live during the WALK-04 re-run at the owner's
> direction, skipping Opus-scoping; full account in `build-log.md` → "Walk log" → WALK-04, commit `44197e9`.
> **WALKS are still the risk-ordered work**: the 🚦 group gates a release carrying ~25 unpublished tasks —
> **WALK-04, WALK-06 and WALK-10 have all passed 2026-08-16.** **WALK-07 and WALK-09 are both unblocked now**
> (IMP-074 and IMP-073 have landed) and can be re-run by a walk chat. IMP-075 needs no walk of its own — the
> owner already walked its behaviour live in WALK-10. The first ⬜ **emulator** walk is now **WALK-14**.
>
> **`IMP-057` is reserved, not missing** — the `dayKey` migration IMP-056 deferred; needs real device
> numbers first (see Open items). **Do not reuse the number.** **IMP-044
> claims no queue slot** — it rides the next build; don't "start" it, it needs only WALK-12.

**App status — all four Play tracks, read from the Play Developer API 2026-08-13. Authoritative; do not
re-derive from an older note.**

| Track | Active | API | Note |
| --- | --- | --- | --- |
| `production` (public) | **1.0.3 / vc9** | 36 ✅ | live since 2026-07-30 |
| `beta` (open testing) | **1.0.3 / vc9** | 36 ✅ | was vc8/API 35 — promoted, compliance gap closed |
| `alpha` (closed testing) | **1.0.5 / vc11** | 36 ✅ | frozen by design 2026-08-08; the newest *built* code |
| `internal` | **1.0.3 / vc9** | 36 ✅ | was vc5/API 35 — promoted, compliance gap closed |

**✅ API-36 compliance (deadline 2026-08-31) is met ACCOUNT-WIDE — blocker CLOSED 2026-08-13.** Every
active release on every track is `targetSdkVersion 36`. Banner-reading procedure kept in the playbook.

**Builds auto-submit to `internal`** (`eas.json` → `submit.production.android.track`, set 2026-08-08 in
`a299af7`; CI already does it). Reaching the public stays manual: promote `internal` → `production` in Play
Console, which *does* get the full review.

**⚠️ The OTA lane reaches `alpha` ONLY** — `runtimeVersion` = `appVersion` = **1.0.5** = **vc11**, and vc11
lives only on `alpha`. Self-testing on `internal` needs a **build**, not an update. Full consequence, and
the release sequence that follows from it, in **Open items → the first bullet**.

**⚠️ OTA has no Play track.** `eas update` publishes to Expo's CDN — no Google, no review. Gated only by
**channel** (`production`) + **matching `runtimeVersion`**. An installed build receives an OTA regardless of
which track it came from. (Once a `bump:native` lands, the OTA lane is closed for that release until the
build ships.)

**Current stack:** Expo SDK **54** · RN **0.81.5** · React **19.1.0** · **Legacy Architecture**
(`newArchEnabled: false`, held deliberately) · `targetSdkVersion` **36**, `minSdk` **24** · `npm test` →
**866 passed, 84 suites** (re-run 2026-08-16 at `11fa421`; the earlier "862" here predated IMP-075's net +4).
Details in [`docs/playbook.md`](docs/playbook.md).

---

## 🔧 Improvements backlog (post-launch — ACTIVE TRACK)

Opus scopes each owner-filed issue into a numbered `IMP-xxx` spec in
[`docs/specs-open.md`](docs/specs-open.md). Sonnet takes the **first ⬜** row, opens **only that spec**,
executes it, commits with the exact message given, ticks the row, moves the spec to `docs/build-log.md`, and
writes the session note. **Full detail for every ✅ row is in [`docs/build-log.md`](docs/build-log.md).**

| ID | Title | Lane | Status |
| --- | --- | --- | --- |
| 001–005 | Early post-launch fixes (name, greeting/date, streak, zero-state, login step) | OTA | ✅ shipped |
| 006 | Android Auto Backup — new-device restore, no login | Build | ✅ shipped + device-verified 2026-07-30 |
| 007 | Streak stops stacking on same-day entries | OTA | ✅ |
| 008 | Real zero-state: level from XP, calendar + week strip from entries | OTA | ✅ |
| 009 | Insights from real entries (kill hardcoded STATS/MOOD_MIX/RHYTHM) | OTA | ✅ |
| 010 | Onboarding only on first ever launch | OTA | ✅ |
| 011 | Kill the last hardcoded "31 May" | OTA | ✅ |
| 012 | Achievements + Keepsakes start fresh, derived from real data | OTA | ✅ |
| 013 | "Tend an old grave" rite starts at 0 + real completion trigger | OTA | ✅ |
| 014 | Missed days show 💀, not a blank cell | OTA | ✅ |
| 015 | Name is mandatory in onboarding | OTA | ✅ |
| 016 | Header flame icon proportional + centered | OTA | ✅ |
| 017 | Greeting by the user's local time | OTA | ✅ |
| 018 | Today's reflection is editable | OTA | ✅ |
| 019 | True-black AMOLED dark mode + rotating-rays hero | OTA | ✅ promoted |
| 020 | Backup / Restore — user-held JSON export + restore-by-replace | Build | ✅ shipped + device-verified 2026-07-30 |
| 021 | Lifetime Progress | OTA → vc11 | ✅ shipped vc11; shortfall closed by 045 |
| 022 | Save as PDF + About sheet (the two dead You-tab buttons) | Build | ⏸ **deferred (owner)** — spec in build-log → "Deferred specs"; **perk #6 gate** |
| 023 | Dynamic daily text — rotating greeting + prompt deck | OTA | ✅ |
| 024 | Streak counts real consecutive days | OTA | ✅ |
| 025 | Edit your name in the app | OTA | ✅ |
| 026 | Remove the Gamification toggle entirely | OTA | ✅ |
| 027 | Expo SDK 51→54 for `targetSdkVersion` 36 | Build | ✅ shipped v1.0.3 / vc9 |
| 028 | Billing correctness — live store prices, sim guard | OTA → vc11 | ✅ shipped to testers |
| 029 | Tell the user their data came from a Google backup | Build | ✅ **device-verified 2026-08-02** |
| 030 | Layout can't blow out — row auto-stack + font-scale cap | OTA+Build → vc11 | ✅ **device-verified 2026-08-02** |
| 031 | Daily reminder is real | Build | ✅ **device-verified 2026-08-02** |
| 032 | Dev harness v2 — total control + inspection | Dev-only | ✅ **device-walked 2026-08-02** |
| 033 | The restore is offered, not imposed (quarantine + offer) | OTA | ✅ |
| 034 | Hide "Gather Embers" while the app ships free | OTA | ✅ |
| 035 | Search your journal — full-text over `did`/`wished` | OTA | ✅ |
| 036 | Custody of your words — edit/delete/30-day trash | OTA | ✅ |
| 037 | Moods: custom + multiple per entry | OTA | ✅ |
| 038 | "On this day" resurfacing | OTA | ✅ |
| 039 | Streak-freeze candles actually spend themselves | OTA | ✅ |
| 040 | "Keepsake" means one thing now | OTA | ✅ |
| 041 | Teach the app — tips + explainers | OTA | ✅ walked 2026-08-16 (WALK-10) — tip-card half now slated for removal, see IMP-075 |
| 042 | The Keepsakes screen scrolls | OTA | ✅ |
| 043 | Recoverability pass — re-verify entitlement, backup health | OTA | ✅ |
| 044 | R8 on release builds (dev client was shipping to the public) | Build | 🟢 **code-complete, unbumped, UNWALKED** — rides the next build; walk = WALK-12 |
| 045 | Finish Lifetime Progress (missed-day painting + XP line) | OTA | ✅ |
| 046 | Annual Recap — "your year, remembered" | OTA | ✅ |
| 047 | Deeper insights — the Plus analysis layer | OTA | ✅ |
| 048 | Three free trash restores, then Plus | OTA | ✅ + emulator-walked 2026-08-09 |
| 049 | Settings survive a corrupt restore | OTA | ✅ |
| 050 | Every mood gets a face — emoji picker + fallback glyphs | OTA | ✅ 2026-08-10 |
| 051 | The keyboard stops eating the Next button | OTA | ✅ + emulator-walked 2026-08-10 |
| 052 | Tap a day on either heatmap, read it | OTA | ✅ 2026-08-13 |
| 053 | Search shows you the match (snippet + highlight) | OTA | ✅ 2026-08-13 |
| 056 | A day is the day you lived, not the day in Greenwich | OTA | ✅ + emulator-walked 2026-08-10 |
| 054 | The reminder you can actually answer | OTA | ✅ code-complete 2026-08-13 · walk = WALK-13 |
| 055 | Manage your feelings — rename / re-emoji / remove | OTA | ✅ code-complete 2026-08-13 |
| 060 | A candle burns without telling you | OTA | ✅ code-complete 2026-08-13 |
| 059 | The app has one accessibility label | OTA | ✅ code-complete 2026-08-13 · walk = WALK-14 |
| 058 | Prompt packs — grief / gratitude / change | OTA | ✅ code-complete 2026-08-14 |
| 061 | Store screenshots build themselves | Dev-only | ✅ code-complete 2026-08-14 · walk = WALK-15 |
| 062 | The restore offer outlives the launch that made it | OTA | ✅ code-complete 2026-08-14 · WALK-02 ✅ 2026-08-15 |
| 063 | A saved day looks saved (frozen ≠ missed) | OTA | ✅ code-complete 2026-08-15 · walk = WALK-06 (re-run whole) |
| 064 | Count your candles, and say plainly what one did | OTA | ✅ code-complete 2026-08-15 · walk = WALK-06 (re-run whole) |
| 065 | Clear the search; picked moods come to the front | OTA | ✅ code-complete 2026-08-15 · walk = WALK-04 (re-run whole) |
| 066 | The mood step stops fighting you | OTA | ✅ code-complete 2026-08-15 · walk = WALK-04 (re-run whole) |
| 067 | A stacked row wraps; Mood Mix bars line up | OTA | ✅ code-complete 2026-08-15 · walk = WALK-07 (re-run whole) |
| 068 | The Paywall footer stops covering the price | OTA | ✅ code-complete 2026-08-15 · walk = WALK-07 (re-run whole) |
| 069 | A feeling you picked can be put back down | OTA | ✅ code-complete 2026-08-16 · walk = WALK-04 (re-run whole) |
| 070 | One emoji, and the block says what it makes | OTA | ✅ code-complete 2026-08-16 · walk = WALK-04 (re-run whole) |
| 071 | The filter row stops jumping under your thumb | OTA | ✅ code-complete 2026-08-16 · walk = WALK-04 (re-run whole) |
| 072 | Custom-mood face field polish + a real typing bug | OTA | ✅ code-complete + walked 2026-08-16 · found and fixed live during WALK-04, no separate spec (owner-directed) |
| 073 | The lifetime heatmap reads as one grid | OTA | ✅ code-complete 2026-08-16 · walk = WALK-09 (re-run whole) |
| 074 | The Paywall footer survives the first measure pass | OTA | ✅ code-complete 2026-08-16 · walk = WALK-07 (re-run whole) |
| 075 | The tip cards go away | OTA | ✅ code-complete 2026-08-16 · reverses IMP-041's tip half by owner's design choice, not a defect · no walk needed (owner already walked this behaviour live in WALK-10) |

---

## Open items / blockers

> Only what is **live**. Resolved findings and closed walk debts are in
> [`docs/build-log.md`](docs/build-log.md) → "Resolved findings"; monetization strategy, the subscription
> track and Phase 10b are in [`docs/playbook.md`](docs/playbook.md) → "Monetization strategy".

### ▶️ Owner decisions still open

- **🔴 ~25 IMP tasks are committed and UNPUBLISHED. Verified against `Release-Lane` trailers in git
  2026-08-14 — the last release of any kind was the vc11 build on 2026-08-02, and the last OTA was
  2026-06-13.** Everything from IMP-032/033 to IMP-061 (search, custody + trash, multi-moods, recap, deeper
  insights, heatmap, `dayKey`, keyboard fix, prompt packs, a11y, mood management) has reached **no track at
  all**. Two independent reasons an OTA **cannot** deliver it: `runtimeVersion` = `appVersion` = 1.0.5
  matches **vc11 only, which lives only on `alpha`**; and the batch touches `app.config.js` / `eas.json` /
  `package.json` / `package-lock.json`, so CI's backstop auto-rejects an `ota` trailer. **The only route is
  a BUILD**, which necessarily carries IMP-044's R8 — the first minified build of this app ever.
  **Sequence: WALK-02 ✅ and WALK-05 ✅ (both 2026-08-15) → clear the remaining 🚦 walks in
  [`docs/walk-open.md`](docs/walk-open.md) (13 → 03 → 12, R8 last on the final candidate) → `npm run bump:native` → `Release-Lane: build` → push → owner approval →
  auto-submits to `internal` → self-test → promote `internal` → `production` by hand** (full review, ~7d).
  The old "promote vc11 → production, or hold" framing is superseded: vc11 is two weeks of work behind HEAD,
  so promoting it would ship a stale build rather than this work.
  **IMP-063…075 are 🎨 and are NOT part of this sequence** — they land either before the bump *in full*, or
  after the build as an OTA. Never split across it. (IMP-063…075 have all now landed, 2026-08-15/16. The 🚦
  walks above still gate the bump either way.)
- **Cash embers: settled in principle (dropped 2026-08-03), not finalised.** Must be decided before
  `PLUS_ENABLED` flips — it determines which Play products get created. Full argument in the playbook.
- **`PLUS_ENABLED` must not flip until every `PLUS_PERKS` line is true.** The one remaining gap is perk #6,
  the PDF (IMP-022, deferred). Gate checklist in the playbook → Phase 10b.

### 🟡 IMP-056 residual + the IMP-057 decision (2026-08-10)

`dayKey` is now derived locally (walked both offset directions). **Existing entries were deliberately not
migrated**, leaving two things:

- **The residual — nothing to act on.** Old entries keep their UTC key, so for ~a day after shipping a
  negative-offset user can have last evening's *already-stored* entry answer to today's key. New writes are
  correct immediately; old data self-heals as those keys age out.
- **IMP-057 is the owner's decision, not a build chat's.** The Inspector's "Data health" group counts rows
  disagreeing with `dayKeyOf()` and whether remapping moves `currentStreak`. **It reads 0 on the emulator
  fixture — meaningless** (`gen-v2-fixture.js` seeds ids the reporter doesn't key on), and **real device
  numbers have never been read.** Once they exist IMP-057 can be scoped — noting remapping can move an entry
  off a day and **break a live streak**: correct, but it reads as a regression to whoever it happens to.

### 🟢 IMP-044 — the standing build-lane debt

R8 is on for release builds (config-only, 2026-08-08). **Jest cannot prove it** — the failure mode is silent
stripping at runtime, not a compile error. It rides the next build, so it is the **last 🚦 walk**:
full checklist and the reason it goes last are in **WALK-12**.

### ⛔ Parked

- **iOS (Phase 11):** blocked on a Mac / EAS macOS + Apple Developer Program enrollment. The Phase 6 iOS
  real-billing row is blocked on the same.

---

## Last session note

_Only the **two newest** notes stay here; each chat moves the older one into
[`docs/build-log.md`](docs/build-log.md) → "Session notes". Keep them to the shape below: what finished,
the proof, the exact next step._

_2026-08-16 (WALK-10, teach the app) — **✅ full pass, all four steps** (tip cards on Today/Archive/You,
dismiss-and-stay-dismissed across a relaunch; "How it works" six rows each open a real alert; corrected
rites-footer copy; both empty states). No app defects — IMP-041 stands as shipped-correct. **One owner
decision surfaced mid-walk, not a defect:** having seen the tip cards live, the owner does not want them —
not a placement complaint, confirmed via `AskUserQuestion` as "they exist at all, drop them, rely on 'How
it works'". This reverses part of IMP-041 by design choice, not bug fix, so it was **not** written up as a
runtime finding or spec — logged as a new owner decision under Open items, reserving **IMP-075** for Opus
to scope (remove `TipCard` + its plumbing from `HomeScreen`/`ArchiveScreen`/`YouScreen`/`RitualsApp.js`,
decide the fate of `src/content/tips.js`'s `pendingTip`/`markTipSeen` and the `seenTips` persisted key).
Full walk detail moved to `docs/build-log.md` → "Walk log"; index row ticked. NEXT: the first ⬜ emulator
walk is now **WALK-14** (TalkBack, unblocked); **WALK-15** (store screenshots) is also open. Opus should
scope **IMP-075** before a build chat can take it — build queue is otherwise still empty since IMP-074._

_2026-08-16 (IMP-075, the tip cards go away) — **code-complete, committed `11fa421`, not shipped; OTA lane,
rides the next batch. Backlog is empty again — `docs/specs-open.md`'s index is empty.** RED-first: the
12-test `describe('IMP-075 — the tip cards are gone')` block was added to `__tests__/content/tips.test.js`
and run against the pre-deletion code — exactly 2 of 12 passed (the `EXPLAINERS` identity guard and the
legacy-payload `deserialize` guard), 10 failed, matching the spec's prediction. Then landed exactly as
specified: `git rm src/screens/TipCard.js`; stripped the `tip`/`onDismissTip` props, imports and five-line
render blocks from `HomeScreen.js`/`ArchiveScreen.js`/`YouScreen.js` (`EXPLAINERS`'s import in `YouScreen`
untouched); removed `seenTips` state, `dismissTip`, both tip imports and all three call sites (autosave,
`currentSlice()`, the three screen props) from `RitualsApp.js`; dropped `'seenTips'` from `PERSISTED_KEYS`
in `state.js` (no `SCHEMA_VERSION` bump — the key self-purges on the next autosave, per decision 3); deleted
`TIPS`/`pendingTip`/`markTipSeen` from `src/content/tips.js` and rewrote its header comment; fixed the two
stale comments in `FreezeNoticeCard.js` and `scripts/gen-v2-fixture.js` (no fixture data changed); deleted
the three old test describes (`pendingTip`, `markTipSeen`, `TIPS`) and narrowed the import to `EXPLAINERS`.
**Proof:** `npm test` → **866 passed, 84 suites** (862 − 8 removed + 12 added, was 862/84). `npx expo export
--platform android` clean. LAST command: `git commit` → `11fa421`. Archived the spec into `docs/build-log.md`,
emptied `specs-open.md`'s index, ticked the row, updated the ACTIVE TRACK banner and stack line, moved the
IMP-074 note down to `docs/build-log.md` → "Session notes" and deduplicated a stray repeated copy of it that
was sitting in this section (harmless copy-paste artifact from the prior chat, not a content change). **No
walk opened for this, deliberately** — the owner already walked this exact rendered behaviour live in
WALK-10 (all tips dismissed, relaunched; conditional block renders identically whether dismissed or deleted).
NEXT: backlog and walk-open's 🚦 group both need attention — Opus scopes the next `IMP-xxx`, or a walk chat
can take **WALK-07** (unblocked), **WALK-09** (unblocked), **WALK-14**, or **WALK-15**._
