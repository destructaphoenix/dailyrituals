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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **1199 passed, 107 suites** — verified 2026-09-12), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

---

## The queue

| Row | What | State |
| --- | --- | --- |
| [IMP-120](#imp-120--the-consistency-grid-becomes-a-bounded-month-strip) | The Insights consistency grid grows forever — one row per week, ~1,870dp for a single year. Replace it with a horizontally-scrolled month strip of constant height. | ⬜ **open — take this one** |
| [IMP-121](#imp-121--the-streak-hero-plays-a-video-sky) | The streak hero is static art. Teach it to play one looping video behind the numeral, against a single bundled fixture clip. **Native — new binary.** | ⬜ open |
| [IMP-122](#imp-122--the-sky-catalogue-becomes-a-manifest) | `SHOP_SKIES` knows five gradient `kind` strings. Make a sky a manifest (clip URL, poster, mode pair, accent) and feed the shop tiles from it. **Pure JS — OTA.** | ⬜ open — needs IMP-121 |

**IMP-119 is done** — archived in [`docs/build-log.md`](build-log.md#imp-119-the-ember-pills--lost-the-line-that-centred-it-2026-09-11), commit `1fc0664`.
**IMP-118 is done** — archived in [`docs/build-log.md`](build-log.md#imp-118-a-tied-weekday-no-longer-draws-as-an-empty-bar-2026-09-11), commit `dc22e32`.

---

## IMP-120 — the consistency grid becomes a bounded month strip

**Closes [D-01](design-queue.md), the design queue's first row since 2026-09-05.** Ported from
`design-system/proposals/insights-redesign.html` → direction **A**, its "Your year" block.

### The defect

[`LifetimeHeat`](../src/screens/InsightsScreen.js#L239) draws **one row per calendar week from the user's
first entry to today, forever**. On a 360dp phone at default font scale the card content width is 280dp,
the month gutter is 28dp + one 4dp gap, so each cell is `(280 − 32 − 6×4) ÷ 7 = 32dp` and the row pitch is
36dp. **One year is ~52 rows ≈ 1,870dp — about three screenfuls.** Two years is six. The hero number and
the totals grid are pushed that far above it.

The same app already ships the bounded version one tab over: Reflections titles its heat **"Last 5 weeks"**.
Insights is the only unbounded surface of the two.

### The measurement that decides the layout

The returned design gives two directions. **Both retire the lifetime heatmap and both replace it with the
same month-blocked calendar**, so building this commits to neither A nor B as a whole screen — that choice
stays open. They differ only in how the months are laid out, and the numbers settle it:

| | Direction A (`.mo`/`.mgrid`) | Direction B (`.ycal`/`.cg`) |
| --- | --- | --- |
| Month shape | 7 columns × up-to-6 week rows — a conventional calendar | 7 weekday rows × 5 week columns — the transpose |
| Cell | **11dp**, 3dp gap | **5dp**, 2dp gap |
| Month block | 95dp wide | 33dp wide |
| 12 months | scrolls horizontally, ~2.8 visible at 280dp | **440dp — overflows a 280dp card anyway** |
| Component height | **~124dp, constant** | ~65dp, constant |

🔑 **Take A.** B is only nominally scroll-free — twelve 33dp months need 440dp and the card has 280dp, so it
scrolls before the year is out *and* its 5dp cells are illegible on a phone. A scrolls deliberately, stays
readable, and **124dp against today's 1,870dp is the whole point of the row**. D-01's own brief proposed a
horizontally-scrolled transpose at ~250dp; A beats it and gets month labels for free.

### The five decisions this spec makes

**1. `heat0–heat3` is word density, and it does not replace the four states.** The design's ramp
("Fewer words → More") is a different axis from `done`/`frozen`/`missed`/`empty`. Both survive, like this:

| State | Fill | Ring |
| --- | --- | --- |
| `done` | `c.heat1` / `c.heat2` / `c.heat3` by word-count tertile | transparent |
| `frozen` | `c.heat0` | **`c.accentSoft`, 1dp** — a candle kept it, so it is not a miss and has no words |
| `missed` | `c.heat0` | transparent |
| `empty`, `future` | `transparent` | transparent |

**Tertiles are computed over the `done` days in the whole strip**, so the ramp is comparable across months.
If there are fewer than 3 done days, or every count is equal, **every done day is `c.heat2`** — never a
ramp derived from one value.

**2. Geometry still must not vary by state** (the D-01 invariant that was already a fixed bug). Android
strokes a rounded border half *outside* the bounds, so a bordered cell measures ~1dp larger and breaks the
rhythm. **Every state returns `borderWidth: 1`** and a transparent colour where no ring shows. **No dashed
borders** — Android renders `borderStyle: 'dashed'` with `borderRadius` inconsistently.

**3. The press target is the month, not the day.** An 11dp cell cannot be a touch target, and the design
says "tap a month". The whole 95×81dp block is pressable and opens the month; **day-level entry opening
leaves this surface** — Reflections keeps the day-tappable heat as its navigation device, which is the
returned design's own reasoning. Accessibility label on the block:
`"<Month> <year>, <n> of <m> days kept"`. Today is still marked by an **inset ring child**
(`top/left/right/bottom: 1`, `borderRadius: 1`, `borderWidth: 1`, `c.accentDeep`), never by different
geometry.

⚠️ **What the month opens is out of scope here.** Wire `onOpenMonth` as a prop and have `InsightsScreen`
pass a no-op for now. **Do not build a month detail sheet** — that is a separate row.

**4. The legend loses its indent problem.** The old legend had to indent to `gutter + gap` and those two
magic numbers had already drifted apart once (24 vs 28). There is no gutter on this axis, so **the legend
aligns to 0 — the left edge of the first month block.** It carries the density ramp
(`Fewer words` · four 10dp swatches `heat0→heat3` · `More`) and **one chip for `frozen`** ("a candle kept
this day"). `missed` needs no chip — `heat0` is the ground tone and absence reads as absence. **`empty`
stays out of the legend deliberately**, as it was before.

**5. No year selector, no time-scoping control.** The strip runs from the first entry's month to the
current month and **starts scrolled to the end**. Height is constant whatever the range, so "all time" is
free and costs no new control. The `This year · 2025 · All time` scoping in the returned design also
re-scopes the numbers above it — that is a different, larger row.

### Steps

1. **`src/home/calendar.js` — add `buildMonthHeat(entries, today = new Date(), { frozenDays = [] } = {})`.**
   It goes in this file, not a new one, because `shiftKey`, `weekdayMon0`, `indexByDay` and `minDayKey` are
   module-private here and must not be exported just for this. Return, oldest month first:
   ```js
   [{ year, month, label, lead, kept, total, cells: [{ dayKey, state, heat, today, moods }] }]
   ```
   - `label` from the existing `MONTH_SHORT` shape in `heatCells.js` (export it).
   - `lead` = `weekdayMon0` of the 1st — the count of blank cells before day 1, Monday-first, matching the
     rest of the app.
   - `cells` covers **every day of the month**, so a month block is always a full calendar.
   - `state` from `cellState` in `heatCells.js` — reuse it, do not restate the precedence.
   - `heat` is `0–3`: `0` for every non-`done` state; `1|2|3` for `done` by the tertile rule in decision 1.
     Word counts come from `countWords` (`src/insights/words.js`) over the entry's text.
   - `kept` / `total` feed the accessibility label.
   - Empty journal → `[]`, exactly as `buildLifetimeHeatmap` does.
2. **`__tests__/home/` — test `buildMonthHeat` as a pure function.** Cover: empty journal; a single-entry
   journal; a month whose 1st is a Sunday (`lead === 6`); February in a leap year; the three-tertile split;
   **the <3-done-days and zero-spread fallbacks both returning `heat === 2`**; a `frozen` day carrying
   `heat === 0`; and days after today inside the current month coming back `future`.
3. **`src/screens/InsightsScreen.js` — replace `LifetimeHeat` with `MonthStrip`.** A horizontal
   `ScrollView` (`showsHorizontalScrollIndicator={false}`, `contentContainerStyle={{ gap: 10 }}`) of month
   blocks: `width: 95`, 7-column grid of `11dp` cells at `3dp` gaps, `borderRadius: 3`. Set
   `contentOffset` so it opens at the last month. Keep the section header `Consistency` and its
   `borderTopWidth` rule exactly as they are.
4. **Delete `LifetimeHeat`, `heatGutterWidth`, `HEAT_GUTTER_BASE_DP` and `monthLabelsForRows`**, and the
   tests that only covered them. `buildLifetimeHeatmap` **stays** — `buildHeatmap` and `buildWeekStrip` are
   its neighbours and its tests still document the date maths. ⚠️ Check nothing else imports the four
   deletions before removing them.
5. **The grid is dp, not type — it must not scale with the OS font scale.** Only the month label and the
   legend text scale. The old 28dp gutter existed solely to keep "Aug" legible at the 1.5× cap; a 95dp
   block clears `Sep` at 12pt × 1.5 with room to spare, so `heatGutterWidth` goes away with it. Add a test
   at `fontScale: 1.5` asserting the cell dp is unchanged.

### Done when

`npm test` green and **≥ 1164 passed / 104 suites**, `npx expo export --platform android` clean. Commit:

```
feat(insights): the consistency grid stops growing with the journal

IMP-120. LifetimeHeat drew one row per week from the first entry
forever -- ~1,870dp for a single year on a 360dp phone, about three
screenfuls, with the hero number pushed that far above it. Reflections
already shipped the bounded version of the same component one tab over.

Ported from the returned design's direction A: a horizontally scrolled
strip of month blocks, 95dp wide, 11dp cells at 3dp gaps. Height is
~124dp and constant whatever the journal's length, which is the row.
Direction B measured worse on both counts -- twelve of its 33dp months
need 440dp against a 280dp card, so it scrolls anyway, and its 5dp cells
are illegible on a phone.

heat0-heat3 carries word density without displacing the four states:
done ramps heat1-3 by tertile over the whole strip, frozen takes heat0
plus an accentSoft ring because a candle kept it and it has no words,
missed takes heat0 bare, empty and future stay transparent. Fewer than
three done days, or no spread, gives every day heat2 rather than a ramp
invented from one value.

The press target moves from the day to the month, since an 11dp cell
cannot be one. Day-level opening leaves this surface to Reflections,
which is the design's own reasoning. onOpenMonth lands as a no-op prop;
the month sheet is a separate row.

Every state still returns borderWidth 1 with a transparent colour where
no ring shows, so geometry cannot vary by state. The legend's old
gutter+gap indent is gone with the gutter, and takes its two-magic-
numbers drift with it.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

Then tick the row in `PROGRESS.md`, write the session note, and move this spec into `docs/build-log.md`.
**No `Release-Lane:` trailer** — the owner has not asked to ship it.

⚠️ **This spec is code-complete at green tests.** It does not end in a walk. The strip's real scroll
behaviour and the tertile ramp under a real journal want a `WALK` row, which the owner files separately.

---

**IMP-117 and its IMP-119 regression are both archived** in [`docs/build-log.md`](build-log.md#imp-117)
(commit `a59aea9`) and [`docs/build-log.md`](build-log.md#imp-119-the-ember-pills--lost-the-line-that-centred-it-2026-09-11)
(commit `1fc0664`). **IMP-118 is done** (commit `dc22e32`, archived). **The queue is empty** — do not open
the parked phase ladder (8 / 10b / 11, in `docs/playbook.md`) on your own read; it still needs the owner.

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

---

## IMP-121 — the streak hero plays a video sky

**Stage 3 of [`skies-route.md`](skies-route.md).** Opens the animated-skies feature. **Scope is one clip,
bundled, hardcoded** — no catalogue, no shop change, no remote URL. `IMP-122` does all of that, and it
rides OTA on top of this.

🔴 **This is a native release.** `expo-video` is a native dependency, so this ships
`Release-Lane: build` with `versionCode` **15 → 16** ([`app.config.js:49`](../app.config.js#L49)). It is
the only sky release that ever needs one; every sky after this is a file on a host.

### What exists now

[`HomeScreen.js:69-86`](../src/screens/HomeScreen.js#L69) draws the hero as a padded, centred `Card`:
`paddingHorizontal: 22`, `RayFan`/`NightRays` behind, the 76px numeral and the XP bar stacked inside the
padding. The design wants **full card width × 336dp, full-bleed**, numeral over the art, bottom ~28% under
a scrim.

### The API, read from `node_modules` — not assumed

⚠️ `expo-video@~3.0.16` is **already installed** (`npx expo install expo-video`, 2026-09-12). Its real
surface, from [`node_modules/expo-video/build/index.d.ts`](../node_modules/expo-video/build/index.d.ts):

- `useVideoPlayer(source, setup?)` → `VideoPlayer`; the hook releases on unmount.
- `player.loop = true`, `player.muted = true`, `player.play()`.
- `<VideoView player={} contentFit="cover" nativeControls={false} />` — `contentFit: 'cover'` is exactly
  the crop the design specifies, so **no manual sizing maths**.
- `player.status` is `'idle' | 'loading' | 'readyToPlay' | 'error'`.
- **There is no `poster` prop.** The poster is an `<Image>` layered under the `VideoView`, hidden when
  `status === 'readyToPlay'`.

🔑 **`VideoSource` takes `useCaching: true`, and the module owns a real cache** —
`setVideoCacheSizeAsync(bytes)` (default **1GB**, persistent, **LRU-evicted**),
`getCurrentVideoCacheSize()`, `clearVideoCacheAsync()`. **This deletes most of the planned download
layer**: a remote sky is a URL with `useCaching: true`, not a hand-rolled `expo-file-system` download.
`IMP-122` sets the cache size once at startup; nothing needs `expo-file-system/legacy`.
⚠️ The cache is a *cache* — eviction is possible, so an owned sky must always be re-fetchable and the
poster must always cover a cold frame. Never treat a cached clip as a permanent owned file.

### Steps

1. **Config plugin.** Add `'expo-video'` to the `plugins` array in
   [`app.config.js:56`](../app.config.js#L56) — the installer could not write it (dynamic config) and the
   native build fails without it. Leave `supportsBackgroundPlayback` unset; this video must **not** play in
   the background.
2. **Jest mock.** Add `test-mocks/expoVideoStub.js` beside
   [`expoFileSystemStub.js`](../test-mocks/expoFileSystemStub.js) — `useVideoPlayer` returns a plain object
   (`{ loop: false, muted: false, status: 'readyToPlay', play() {}, pause() {} }`), `VideoView` renders a
   `View`. Wire it in [`jest.setup.js`](../jest.setup.js) next to the existing `jest.mock` lines.
3. **The fixture clip.** Place **one** clip at `assets/skies/fixture.mp4` and its poster at
   `assets/skies/fixture-poster.png`, loaded with `require`. ⛔ **Do not use any footage from the design
   project's `uploads/` or `art/assets/`** — see the provenance gate in [`playbook.md`](playbook.md). The
   fixture is a Pexels/Pixabay clip encoded with the recipe in [`design-queue.md`](design-queue.md).
   **If it is not in the tree when you start this spec, STOP and log it** — do not substitute one.
4. **`src/home/skyHero.js`** — a new component, `<SkyHero source poster accent>`: absolutely-positioned
   `VideoView` (`contentFit="cover"`, `nativeControls={false}`), poster `<Image>` beneath it, a bottom
   scrim `LinearGradient` over the lower 28%, `pointerEvents="none"` throughout. It renders **children**
   over itself; it does not know what a streak is.
5. **Restructure the hero card.** [`HomeScreen.js:71`](../src/screens/HomeScreen.js#L71) drops
   `paddingHorizontal: 22` from the `Card`, gains a 336dp `SkyHero` region, and moves the existing padding
   onto the inner content so the numeral, `day streak`, subtitle, level row and XP bar are unchanged in
   every respect except their ground. `overflow: 'hidden'` stays.
6. **Contrast in both modes.** `streakShadow` and `numberGlow` are currently applied `t.dark &&`
   ([`HomeScreen.js:42`](../src/screens/HomeScreen.js#L42)). Over footage they apply in **both** modes —
   a clip is not lighter in day mode. Apply them whenever a video sky is active, regardless of `t.dark`.
7. **Gate it.** `SkyHero` renders only when a video sky is active. `classic` and `crescent` keep
   `RayFan`/`NightRays` untouched — those are frozen art ([`playbook.md`](playbook.md) → standing rules #3)
   and this spec does not touch `src/art.js`. For IMP-121 the gate is a hardcoded constant; IMP-122 makes
   it a lookup.
8. **Accent plumbing.** `SkyHero` takes an `accent` prop and the XP `ProgressBar` inside the hero uses it.
   Hardcode one value here — the field exists so IMP-122 only has to fill it, not introduce it.
9. Tests: `SkyHero` renders the poster while `status !== 'readyToPlay'` and drops it after; the hero falls
   back to `RayFan`/`NightRays` when no video sky is active; the numeral keeps its shadow in day mode under
   a video sky.

### Accepted, not defects — owner's ruling 2026-09-12

- **720-short-edge footage is accepted.** It is @2× art on @2.625–3.5× screens; behind a 76px numeral under
  a scrim it is close to invisible, and the Pixel-class case is 1.35×. **Do not open an IMP for softness.**
- **`Starfall`'s 20.2s length is accepted** against the 6–10s guidance. It costs bytes, not correctness.

### The one thing the emulator cannot answer

`surfaceType` defaults to `'surfaceView'`, which the module's own docs call *"significantly lower power
consumption, better performance"* — and it is the right default for a clip that loops all session.
⚠️ **But `SurfaceView` is the case the docs flag for overlapping views, and this hero overlaps it with a
numeral, a scrim and a progress bar inside a card with `borderRadius: t.radius.card` and
`overflow: 'hidden'`.** SurfaceView is known not to clip to rounded parents reliably.

**Ship `surfaceView`. The walk decides.** If the corners square off or the numeral composites wrong on
hardware, `surfaceType="textureView"` is the fallback and the battery cost gets measured rather than
guessed. **Log it to `PROGRESS.md`; do not switch it pre-emptively on an emulator** — an emulator will
lie about both.

### Done when

`npm test` green (≥ prior count), `npx expo export --platform android` clean, commit:

```
feat(home): the streak hero plays a looping video sky (IMP-121)
```

---

## IMP-122 — the sky catalogue becomes a manifest

**Stage 5 of [`skies-route.md`](skies-route.md).** Pure JS on top of IMP-121, so this one **ships OTA**.

### What exists now

[`data.js:141`](../src/data.js#L141) — `SHOP_SKIES` is five entries with a `kind` string, and
[`shopui.js:92`](../src/shopui.js#L92) `SkyPreview` maps each `kind` to a two-stop gradient and an icon.
Nothing anywhere holds a URL.

### Steps

1. **`SHOP_SKIES` gains, per sky:** `clip` (URL) or `clipDay`/`clipNight` for a two-clip sky, `poster`,
   `accent` (the XP-bar colour), and `credit` — the provenance line (tool/licence + date). ⚠️ **`credit` is
   required and non-empty for every sky with a URL.** A sky whose origin nobody can state does not ship;
   add a test that asserts it.
2. **Base URL in one constant**, not per row — see the host decision in
   [`skies-route.md`](skies-route.md). One sky is `${SKY_BASE}/${id}.mp4`.
3. **Ownership, not Plus, is the gate.** `Harvest Moon` is ember-priced at 300, **not** `tier: 'plus'`
   ([`data.js:144`](../src/data.js#L144)), so the player keys on `ownedSkies` / `activeSky`. Never on
   `plus`.
4. **Mode.** A one-clip sky plays the same file in both app modes; a two-clip sky picks on `mode`.
   ⛔ Do not tint one clip to fake the other.
5. **Cache size once at startup** — `setVideoCacheSizeAsync()` in the app's existing init path, sized to
   the catalogue (~128MB), not left at the 1GB default.
6. **`SkyPreview` keeps drawing gradients for the static skies** and shows the **poster** for video skies.
   💡 **Posters in the list, the clip only in the detail sheet** — `shop-plus-skins.html` plays six live
   clips at 58×58 and flags its own cost as its one open question. This is the answer: the detail sheet
   *is* the hero card, so it reuses `SkyHero` from IMP-121 rather than adding a component.
7. Tests: every video sky has a non-empty `credit`; a two-clip sky returns different sources per mode; an
   unowned sky never resolves a URL.

### Done when

`npm test` green, export clean, commit:

```
feat(shop): a sky is a manifest, not a gradient (IMP-122)
```

