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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **1228 passed, 115 suites** — verified 2026-09-13), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

---

## The queue

**Three open rows, all buildable — no gates left.** **IMP-124 is done** (archived to `docs/build-log.md`,
commit `87771c4`). ✅ **IMP-125's gate is lifted: the owner ruled on 2026-09-13 and chose the week-strip
footer**, which is what its spec already specified — so the spec stands unchanged and needs no redesign.

| Row | What | Lane | Take it? |
| --- | --- | --- | --- |
| **IMP-125** | The candle indicator leaves the hero card | OTA | ✅ **first — take this one** |
| IMP-126 | The 11th mood's bar is invisible (D-04's defect half) | OTA | ✅ second |
| IMP-127 | The Shop's ember `+` promises an action it cannot perform (D-09) | OTA | ✅ third |

⚠️ **Why IMP-125 goes first even though IMP-126 is smaller.** IMP-124 is committed and **not yet shipped**.
IMP-125 **deletes code IMP-124 just added** (`StreakFreeze`'s `onVideo` branch) and moves a surface
[WALK-22](walk-open.md#walk-22--the-day-mode-hero-re-check) is about to walk. Landing it before the OTA means
**one** OTA and **one** walk of the final layout, instead of shipping a candle row over footage and then
moving it off the footage a day later.

---

### IMP-125 — the candle indicator leaves the hero card

✅ **APPROVED — the owner ruled on 2026-09-13 and chose the week-strip footer.** The gate is lifted and this
spec is unchanged by the ruling: the destination below was already the recommendation and it was accepted
against three alternatives (its own card under the hero, Shop-only with no candles on Home, and leaving it
where it is). **Take it.**

**It began as a preference, not a defect** — the owner's observation during WALK-21 that *"the candle
indicator doesn't need to live inside the hero card at all"*. Nothing is broken today, so there is no failing
behaviour to reproduce and **no test can be proven red first on this row.** **Severity 🎨.**

**What is there now.** `{freezes != null && <StreakFreeze count={freezes} />}`
([`HomeScreen.js:73`](../src/screens/HomeScreen.js#L73)) renders inside the hero, under a hairline rule —
three candle glyphs and a line of copy, stacked below the XP bar in a 336dp card that is also carrying a
76dp numeral, a subtitle, a level and a progress bar. Over a video sky it is also the part of the hero the
scrim reaches, which is the only reason it survived WALK-21 at all.

**Where it goes — ✅ the owner's own choice, 2026-09-13.** **Into the week-strip card, as a footer row beneath
the seven dots.** Not a new card of its own: [`design-queue.md`](design-queue.md)
→ D-12 already calls Home's lower half *"a stack with no hierarchy"* with the day's reflection fourth down,
and a seventh equal-weight card makes the row it is filed under worse.

**The week strip is the right home, and not merely a free slot.** `buildWeekStrip` already renders
`frozenDays` — the days a candle spent itself — as a state *in those very dots*. Today the app draws the
effect in one card and the stock in another. Moving the candles under the strip puts the count directly
beneath the thing it explains.

**What the alternatives cost, recorded so this is not re-litigated.** Its own card was rejected as a
**seventh** equal-weight card on a screen D-12 already calls a stack with no hierarchy, pushing the day's
reflection further down. Shop-only was rejected because it removes the daily glance entirely — and a freeze
notice would then arrive explaining a resource the user never saw they had.

**Steps.**
1. `HomeScreen.js` — remove `<StreakFreeze>` from `heroInner`; render it inside the week-strip `Card`,
   after the seven-dot row.
2. `StreakFreeze` — **delete the `onVideo` branch IMP-124 added**, and the `heroChrome` import with it. The
   hero is no longer one of its grounds, so the branch is dead the moment this lands. Restore the plain
   `c.border` / `c.muted` styling.
3. The hero's bottom padding is now carrying a component's worth of empty space — `paddingBottom: 22`
   against a fixed `HERO_HEIGHT` of 336. **Leave `HERO_HEIGHT` alone.** It is pinned to the clip geometry in
   [`design-queue.md`](design-queue.md) → "The frame", every sky was cropped against it, and shrinking the
   card re-crops the whole catalogue. The XP bar simply sits higher in the frame.
4. Tests: `HomeScreenSkyHero.test.js` and any Home render test that locates the candle row must find it
   under the week strip. `__tests__/home/streakFreeze.test.js` loses its `onVideo` cases.

**Ship.** `npm test` green (≥ **1228 passed, 115 suites**), `npx expo export --platform android` clean, then:

```
fix(home): the candle count sits with the week it protects (IMP-125)
```

OTA, no native change, **no `versionCode` bump.** ⚠️ **The test count will go DOWN** — step 2 deletes
`StreakFreeze`'s `onVideo` cases, which is correct and is the one sanctioned exception to the ≥-count rule on
this row. **State the number and the reason in the session note** rather than padding the suite to hide it.

**Its proof folds into [WALK-22](walk-open.md#walk-22--the-day-mode-hero-re-check)**, whose step 5 changes
from *"is the candle row readable over footage"* to *"is it gone from the hero and present under the week
strip"*. **Update that step when this lands.**

---

### IMP-126 — the 11th mood's bar is invisible

**From** [`design-queue.md`](design-queue.md) → **D-04**, which said *"scope the clamp as an IMP now
regardless of the design — it is a two-character fix and the design can land later."* This is that row.
**Severity 🐛** — data present, nothing on screen.

**What happens.** Mood mix renders every distinct mood ever logged and shades each bar
`opacity: 1 - i * 0.1` ([`InsightsScreen.js:142`](../src/screens/InsightsScreen.js#L142)). At index **10**
the opacity is **0**; past it, negative. There are 8 built-in moods and **no cap on custom ones** —
`MoodManager` counts them, nothing limits them — so a user with three custom feelings in regular use
renders a bar that is in the data, labelled with its own count beside it, and cannot be seen.

**This is IMP-118's shape exactly**: a bar present in the data and invisible on screen, next to a label
saying how big it is. The pairings list next door does not have it, because it `slice(0, 6)`s first.

**The decision.** Clamp the floor, do not cap the list. A `slice` would silently drop a mood the user
created and named; an opacity floor keeps every row visible and honest. The remainder-line design
(*"+4 more feelings"*) stays open in D-04 and is **not** this spec — this row is the clamp only.

**Step.** [`InsightsScreen.js:142`](../src/screens/InsightsScreen.js#L142):

```js
opacity: Math.max(0.3, 1 - i * 0.1),
```

**0.3, and the number is not arbitrary.** There are 8 built-in moods, so index **7** — the last row any
journal can reach today without custom feelings — already sits at exactly `0.3`. Clamping there means
**no journal that exists right now renders one pixel differently**, and every mood past the 8th draws like
the 8th instead of fading to nothing. A lower floor (`0.1`) is not a visible bar either: `c.accent` at 10%
over `c.accentSoft` is the track.

**The test.** Beside the existing Insights tests: render a mood mix of **12** distinct moods and assert the
11th and 12th bars flatten to `opacity: 0.3` — not `0`, not negative. Add the control too: the **8th** bar
is still `0.3`, proving the clamp changed nothing that already worked. **Prove it red first** — today index
10 flattens to exactly `0`.

**Ship.** `npm test` green (≥ 1228/115), export clean, then:

```
fix(insights): the eleventh mood keeps a bar you can see (IMP-126)
```

OTA, no native change. **No walk owed** — it is a numeric clamp with a render assertion, and the emulator
adds nothing a test does not already say. Update D-04's row in `docs/design-queue.md` to point at this
commit and note that only the remainder-line design is still open there.

---

### IMP-127 — the Shop's ember `+` promises an action it cannot perform

**From** [`design-queue.md`](design-queue.md) → **D-09**. **Severity 🎨.** ⏸ **Sequenced after IMP-124 —
take it only once IMP-124 is committed**, so two cosmetic OTA rows do not land on the same surface in the
same window and make a failed walk ambiguous.

**⚠️ D-09 is half wrong, and the correction is what makes this row small.** D-09 says the `+` *"opens
nothing"*. That is true of **one** of the two pills:

| Call site | `onPress` | Verdict |
| --- | --- | --- |
| [`Shop.js:78`](../src/screens/Shop.js#L78) | `onGetEmbers()` → `openGetEmbers()` → with `EMBER_PACKS_ENABLED` false, a toast: *"Embers also gather on their own"* | 🔴 **the defect** |
| [`HomeScreen.js:88`](../src/screens/HomeScreen.js#L88) | `onOpenShop` | ✅ **fine — leave it.** The `+` opens the Shop, which is where embers are got |

**The decision.** Hide the `+` where it cannot act; keep it where it can. The alternative D-09 offers —
redesigning the pill to read as a balance — is rejected: the flag flips to `true` the moment
[WALK-20](../PROGRESS.md) passes, and a redesign would then have to be undone.

**Steps.**
1. [`src/shopui.js`](../src/shopui.js) — `EmberPill` gains `showAdd = true`; the `+` circle renders only
   when it is true. Everything else about the pill is untouched.
2. [`src/screens/Shop.js`](../src/screens/Shop.js#L78) — `showAdd={EMBER_PACKS_ENABLED}`, imported from
   [`src/billing/config.js`](../src/billing/config.js). **Import the flag in `Shop.js`, not in `shopui.js`**
   — a shared UI component should not know about billing config.
3. `HomeScreen.js` — **no change.** It takes the default.

**⚠️ Check this before you commit, and say so in the session note.** [IMP-119](build-log.md) fixed the `+`
glyph's centring and **still owes a device walk**. This row must not delete the only thing that walk looks
at. It does not: the **Home** pill keeps its `+`, it is the same `EmberPill` component, and `PixelRatio`
does not care which screen it is on. **Record in the commit body that IMP-119's walk moves to Home's pill.**

**The test.** [`__tests__/ui/EmberPill.test.js`](../__tests__/ui/EmberPill.test.js) — `showAdd={false}`
renders no `+`; the default still renders it; **IMP-119's scaled-`lineHeight` assertion must still pass
under the default** (do not let the new branch skip it).

**Ship.** `npm test` green (≥ 1228/115), export clean, then:

```
fix(shop): the ember plus appears only where it can add embers (IMP-127)
```

OTA, no native change. **No walk of its own** — it folds into whichever Shop sitting comes next, and into
WALK-20 when `EMBER_PACKS_ENABLED` flips, where the `+` must come **back**.

---

**IMP-123 is done** — archived in [`docs/build-log.md`](build-log.md#imp-123--the-first-sky-carries-a-clip-on-its-own-update-channel-2026-09-13), commit `26e644b`.
**IMP-122 is done** — archived in [`docs/build-log.md`](build-log.md#imp-122--the-sky-catalogue-becomes-a-manifest-2026-09-12), commit `738a99e`.
**IMP-121 is done** — archived in [`docs/build-log.md`](build-log.md#imp-121--the-streak-hero-plays-a-video-sky-2026-09-12), commit `d0fe2cb`.
**IMP-120 is done** — archived in [`docs/build-log.md`](build-log.md#imp-120--the-consistency-grid-becomes-a-bounded-month-strip-2026-09-12), commit `72b0049`.
**IMP-119 is done** — archived in [`docs/build-log.md`](build-log.md#imp-119-the-ember-pills--lost-the-line-that-centred-it-2026-09-11), commit `1fc0664`.
**IMP-118 is done** — archived in [`docs/build-log.md`](build-log.md#imp-118-a-tied-weekday-no-longer-draws-as-an-empty-bar-2026-09-11), commit `dc22e32`.

---

**The owner asked for the Plus purchase surface to be investigated hard after IMP-099.** It was, by reading
the shipped SDK rather than our assumptions about it, and **the audit found a defect larger than IMP-099**.
**Three more rows came out of the WALK-19 re-run on 2026-09-08 (hardware, owner-run)**, and all three were
re-scoped the same day by reading source rather than trusting the field report. **Two of the three moved:
IMP-103 is not a defect at all, and IMP-104 no longer needs the device dump it asked for.** The
investigation also opened IMP-106, now code-complete and archived.

| Row | What | Severity |
| --- | --- | --- |
| IMP-100 | Every RevenueCat purchase error becomes `failed`. `e.code` is a **number**, our mapper matches **names**. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-101 | The `failed` card claims "you weren't charged" and never asks the store. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-102 | Completing a purchase grants **+3 freezes every time**, not once. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-103 | Step 4e failed on a bundle without IMP-100/101 — **neither was ever pushed or shipped**. | ✅ **done — shipped 2026-09-10, group `f961b427`; archived in `docs/build-log.md`** |
| IMP-104 | `tier: 'owned'` means free and `Shop.js` never reads it — and tapping such an item **wipes the ember balance to 0**. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-105 | 🚦 Reinstall + Restore said "Nothing to restore." **The test subscription had expired mid-walk; the app was innocent.** | ✅ **CLOSED 2026-09-10 by WALK-19a — not reproducible, walk-protocol defect. Archived in `docs/build-log.md`** |
| IMP-106 | A healthy build cannot say which JS bundle it is running — the gap that mis-scoped IMP-103. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-107 | A lapsed member kept Plus until they happened to background the app — no launch-time downgrade check. | ✅ **done — archived in `docs/build-log.md`** |

---

### ✅ Embers for money — DONE, IMP-113 is code-complete

Both gating questions were answered by the owner on 2026-09-10 (cash → embers → candles; auto-freeze stays
free) and the candle cap was set at 3, so the conversation became a spec — now built and archived in
[`docs/build-log.md`](build-log.md) → "IMP-113". **The economics, the streak-integrity argument and the
three findings that shaped it are preserved there too**, under "The embers-for-money conversation".
⚠️ **`EMBER_PACKS_ENABLED` still must not be flipped** — IMP-113 is built but not walked; it owes a new
`WALK-20` on hardware with the license tester before the flag can flip.

### Numbers that must not be reused

- **079** — used on 2026-09-05 for a baseline-capture path written, reviewed and deleted in the same
  session. Nothing landed under it, but the note naming `IMP-079` is still in the log, so reusing the
  number would make that note read as though it described a different spec.
- **057** — reserved for the historical `dayKey` migration IMP-056 deferred. It cannot be written until a
  real device's numbers come back from the dev-panel Inspector's "Data health" reporter IMP-056 added.

### ✅ The branch rule is OVER — `main` is the lane now

Superseded 2026-09-08: `feat/design-push` fast-forwarded onto `main` and the owner pushed it (`cb3d60e`).
**Commit normally, push to `main`, and add a `Release-Lane:` trailer only when the owner asks to ship.**
CI (`release.yml`) then owns the test gate, the native-file backstop, the billing preflight and
`--environment production`. ⚠️ **Never run `eas update` by hand** — that is what the trailer is for.

### The rules the next spec inherits

**Every spec here is code-complete at green tests. None of them ends in a walk.** A build chat and a
runtime walk are **two different tasks for two different chats** — where a feature needs runtime proof,
the spec's last step names its `WALK-nn` row in [`walk-open.md`](walk-open.md). **Do not run a walk from a
build chat**, and do not read a missing walk as an unfinished spec. IMP-077 is the newest worked example:
it ended code-complete at 873 green tests, and **its green suite proves nothing about the motion** — the
Reanimated jest mock no-ops every hook. WALK-18 settles it.

---

### ⏸ Parked: apply the motion vocabulary — owner's (c), deferred 2026-09-10

**Owner: *"some time later when plus is complete I can work on the motion."* NOT A ROW YET. Do not open a
number for it and do not start it — Plus is not complete.** [IMP-111](build-log.md) (removing `ScreenFade`)
is done — archived in `docs/build-log.md`.

**Why it exists.** IMP-077 bought a motion vocabulary and the app never spent it. **Six exports have no
consumer**: `riseIn`, `popIn`, `fadeOut`, `stagger`, `useCountUp`, and `ScreenFade` (IMP-111 deleted it
rather than fixing it). Only `usePressScale` is live — a 0.99 press scale deliberately built to be
imperceptible. ⚠️ **That vocabulary was not free:** IMP-077 added `react-native-reanimated` and
`react-native-worklets` as **native** deps and forced the vc14 build. **This parked row is the only thing
that ever makes that cost worth paying.**

⚠️ **`stagger` is unused — do not be fooled by `Animated.stagger` in
[`Celebration.js:23`](../src/screens/Celebration.js#L23).** That is React Native's own `Animated` API, a
different function entirely. An audit on 2026-09-10 initially miscounted it as a consumer.

**Where to start when it unparks.** `riseIn` on cards and rows is the default entrance the module was
written around; `popIn` on rewards and badges is generalized from `Celebration.js`, which is the house
motion. ⚠️ **`art.js`, `Celebration.js` and `Toast.js` stay on the RN `Animated` API — coexistence is the
design, not a compromise. Do not port them** ([`motion.js:16`](../src/motion.js#L16)).

**The gate.** "Plus is complete" is the owner's phrase and the owner's call. At minimum that means the
open Plus rows (IMP-108, IMP-109, IMP-110) shipped and WALK-19 finished.

