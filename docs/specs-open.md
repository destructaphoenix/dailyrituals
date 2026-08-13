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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **748 passed, 77 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

## Index — take them in this order

| # | Spec | Lane |
| --- | --- | --- |
| IMP-061 | [Store screenshots build themselves](#imp-061--store-screenshots-build-themselves) | Dev-only |

> **IMP-056 is done (2026-08-10), IMP-050 is done (2026-08-10), IMP-051 is done (2026-08-10), IMP-052 is
> done (2026-08-13), IMP-053 is done (2026-08-13), IMP-054 is done (2026-08-13), IMP-055 is done
> (2026-08-13), IMP-060 is done (2026-08-13), IMP-059 is done (2026-08-13) and IMP-058 is done
> (2026-08-14) — see `docs/build-log.md`.**
> **IMP-057 is still deliberately absent.** It is reserved
> for the historical `dayKey` migration IMP-056 deferred, and it cannot be written until a real device's
> numbers come back from the dev-panel Inspector's "Data health" reporter IMP-056 added. **Do not reuse the
> number.**
>
> **Every spec here is code-complete at green tests. None of them ends in a walk.** A build chat and a
> runtime walk are **two different tasks for two different chats** — where a feature needs runtime proof,
> the spec's last step names its `WALK-nn` row in [`walk-open.md`](walk-open.md). **Do not run a walk from a
> build chat**, and do not read a missing walk as an unfinished spec.

---

## IMP-061 — store screenshots build themselves

**Lane: Dev-only.** Nothing here reaches the shipped bundle except two `accessibilityLabel` strings and one
row in `src/dev/scenarios.js` — a `__DEV__`-only file already stripped from release (WALK-12 greps
`SENTINEL` against the built bundle to prove it). **No `bump:build`, no OTA, no release note.**

**The problem.** The Play listing needs 4–8 phone screenshots, and the app's design is still moving — prompt
packs (IMP-058), mood management (IMP-055), the heatmap (IMP-045/052) all changed what the screens look
like since the last time anyone captured one. Hand-capturing eight screens and hand-framing them in a web
tool is an afternoon each time, so in practice it happens once and then the listing goes stale. This makes
regenerating the whole set **one command**, so the listing tracks the app instead of lagging it.

### The output contract — one size, and the compositor refuses to emit anything else

**Every phone screenshot is exactly 1080 × 1920, 24-bit RGB, no alpha channel. There is no second size, no
"whatever the emulator gave us", and no per-shot variation.** The emulator's resolution changes what the
*inner* phone picture looks like and nothing else; the canvas is frozen.

| Property | Value | Why |
| --- | --- | --- |
| Dimensions | **1080 × 1920**, always | 9:16 exactly |
| Aspect | 1.778:1 | Play rejects anything past **2:1** — a raw 1440 × 3120 Pixel capture is **2.167:1 and gets rejected at upload** |
| Colour | 24-bit RGB, **alpha stripped** | Play's documented screenshot format is 24-bit PNG *without* alpha; resvg emits 32-bit RGBA, so this must be an explicit step |
| Min side | 1080 px | clears the ≥1080px floor for Play's promotional placements |
| Count | 7 (bounds 4–8) | Play allows 2–8; **4+** is the floor for promo eligibility |

This is the whole answer to "weird resolutions": **the output never depends on the input.** A 1440 × 3120
capture, a 1080 × 2400 capture and a 1080 × 1920 capture all produce the identical 1080 × 1920 asset — only
the phone drawn inside it is taller or shorter. `fitRect` caps width and derives height from the source
aspect, so nothing is ever stretched, and if a source is so tall the bezel would breach the bottom margin it
is scaled down rather than cropped.

**The compositor enforces this on itself.** After rasterizing, `scripts/shots.js` re-reads each PNG it just
wrote and **throws** unless the header says 1080 × 1920 and colour type 2 (truecolour, no alpha), naming the
offending file. A wrong-sized asset must fail the build, not reach Play Console and get rejected there.

### Large screens — deliberately out of scope, and this is the right call

Play Console has separate screenshot slots for 7-inch and 10-inch tablets, and leaving them empty is
**allowed** — the listing publishes fine. The cost of leaving them empty is that Play won't surface the app
in large-screen recommendations and shows a large-screen quality note in Console.

**Do not fill those slots from phone captures.** The app is `orientation: 'portrait'` with a phone layout;
a phone screenshot pasted onto a tablet-shaped canvas advertises a tablet experience that does not exist,
and Play's large-screen assessment inspects the *app*, not the screenshots, so it would not even buy the
visibility it was faking. Real tablet assets are downstream of real tablet layout work — a future IMP
against the app, not a screenshot task. **When that day comes this pipeline extends by adding a second
canvas to `shots.config.js`; nothing here needs redesigning for it.**

Also unfilled and fine: Chromebook, Wear, TV, Android Auto slots. The two graphics that *are* required
alongside the screenshots — the **512 × 512** icon and the **1024 × 500** feature graphic — already exist as
listing assets and are **not** in this task's scope.

### The four decisions, already made — do not re-litigate

1. **Maestro drives the app; the app is not modified to support it.** Maestro is a standalone binary that
   taps by accessibility label and visible text. IMP-059 just labelled every icon-only control, and the dev
   harness is reachable by a long-press on a row whose value text is `v1.0`
   ([`YouScreen.js:296`](../src/screens/YouScreen.js#L296)) — so every screen this needs is already
   reachable without a deep-link scheme, a new native module, or a rebuild. **Do not add a URL scheme.**
2. **The canvas above is frozen.** Changing it is a spec change, not an implementation choice.
3. **The phone bezel is drawn in SVG, not sourced.** No third-party device-art PNG — it dodges the usage
   terms on Google's and Apple's device-art kits, and a bezel drawn from `theme.js` tokens matches the app
   instead of approximating a stranger's phone. **Flat and front-on: a rounded rect, a hairline stroke and a
   punch-hole camera circle. No tilt, no perspective, no drop shadow, no gloss.** The owner was shown this
   and chose it over a photoreal or 3D-angled frame — if it needs more later, that is a spec change.
4. **Captures come from a `__DEV__` build, and Plus surfaces are out of scope.** The harness does not exist
   in a release build (technique T6), and the pixels are identical either way. `PLUS_ENABLED = false` makes
   `OnThisDayCard`, `DeeperInsights` and `AnnualRecap` **unmountable** — and a listing advertising features
   the public cannot buy would be false anyway. **Do not flip `PLUS_ENABLED` for this.** When Plus ships,
   the manifest grows three rows; that is a later task, not this one.

### Prerequisite the owner supplies, not this chat

Maestro must be installed on the machine that *runs* the capture: `curl -Ls "https://get.maestro.mobile.dev" | bash`.
**This chat does not install it and does not run it** — there is no emulator in a build chat. Everything
below is verifiable offline against a synthetic capture; the real run is **WALK-15**.

### Files

| File | New? | What |
| --- | --- | --- |
| `.maestro/store-shots.yaml` | new | the capture flow |
| `scripts/shots.config.js` | new | the manifest — one row per screenshot, with its caption |
| `scripts/shots.js` | new | the compositor: raw capture → 1080×1920 framed PNG |
| `scripts/shots.sh` | new | orchestrator — demo-mode status bar, maestro, compositor |
| `__tests__/shots.test.js` | new | geometry + manifest tests |
| `src/dev/scenarios.js` | edit | one new scenario row |
| `src/dev/panel/StateSection.js` | edit | one `accessibilityLabel` |
| `src/dev/DevPanel.js` | edit | one `accessibilityLabel` |
| `package.json` | edit | `@resvg/resvg-js` + `pngjs` devDependencies, `shots` script |
| `.gitignore` | edit | ignore `store/raw/`, **commit** `store/play/` |

### Step 1 — the scenario

Add to `SCENARIOS_LIST` in [`src/dev/scenarios.js`](../src/dev/scenarios.js), **last row**:

```js
{ key: 'storeShots',   label: 'Store screenshots',       knobs: { streak: 128, entryCount: 210, done: true, ownAll: true, embers: 2400, freezes: 3, name: 'Sam', textLength: 'long', lastBackupAt: 1 } },
```

Why these numbers: a 128-day streak and 210 entries fill the lifetime heatmap and every insight past its
"not enough days yet" threshold; `ownAll` makes the Shop read as a collection rather than a wall of locks;
`textLength: 'long'` fills the Reflections rows with real-looking text instead of one-word stubs. `name:
'Sam'` is short and neutral — **do not use the owner's name.**

### Step 2 — two labels so Maestro can't tap the wrong thing

Both are dev-only files.

- [`StateSection.js:153`](../src/dev/panel/StateSection.js#L153) — the Apply `Pressable` gets
  `accessibilityLabel="Apply dev state"`. Without it the flow's `tapOn: "Apply"` is ambiguous: the button
  and the confirm alert's own **Apply** are both in the hierarchy at once.
- [`DevPanel.js:63`](../src/dev/DevPanel.js#L63) — the Close `Pressable` gets
  `accessibilityLabel="Close the dev panel"`. `Close` alone collides with IMP-059's modal-close labels.

Nothing else in the app changes. If a screen turns out to need a label to be tappable, **STOP and log it** —
that is an IMP-059 gap and belongs in its own row, not smuggled in here.

### Step 3 — the manifest

`scripts/shots.config.js`, plain CommonJS (node runs it directly, it is never bundled):

```js
// scripts/shots.config.js — what gets captured, and what each shot says.
// Order IS the Play listing order: Play shows the first 3–4 most prominently.
module.exports = {
  canvas: { w: 1080, h: 1920 },
  // Straight from theme.js day palette + the splash background.
  colors: { bg: '#f9f7f4', ink: '#292524', accent: '#f59e0b', accentDeep: '#d97706' },
  fonts: {
    headline: 'node_modules/@expo-google-fonts/fredoka/Fredoka_600SemiBold.ttf',
    body:     'node_modules/@expo-google-fonts/baloo-2/Baloo2_500Medium.ttf',
  },
  shots: [
    { id: '01-today',       headline: 'One question a day.',          sub: "That's the whole ritual." },
    { id: '02-write',       headline: 'What you did.',                sub: 'What you wished for.' },
    { id: '03-moods',       headline: 'Name how it felt —',           sub: 'in your own words.' },
    { id: '04-reflections', headline: 'Every day you kept,',          sub: 'searchable.' },
    { id: '05-insights',    headline: 'Your year,',                   sub: 'one square at a time.' },
    { id: '06-achievements',headline: 'Proof you kept going.',        sub: 'Even the days you almost didn\'t.' },
    { id: '07-shop',        headline: 'A garden that grows',          sub: 'as your record does.' },
  ],
};
```

**These copy strings are decided.** They follow the playbook's thesis — continuity first, retrieval second,
cosmetics last — and they deliberately never say "AI", "free", "best" or anything Play's metadata policy
treats as a claim. Do not rewrite them.

### Step 4 — the compositor

`scripts/shots.js`. Two devDependencies, both small:

- **`@resvg/resvg-js`** — chosen over `sharp` because it takes font **files** as an explicit option, so the
  captions render in the app's own Fredoka / Baloo with no system font install and no `fontconfig` fiddling.
- **`pngjs`** — pure JS, no native binary. Used for exactly two things: **stripping the alpha channel** on
  the way out, and reading back the header on the way in for the self-check below.

The whole composition is one SVG string: background, drawn bezel, the capture embedded as a
`data:image/png;base64` `<image>`, caption text on top; resvg rasterizes it once.

**The write path is fixed, in this order:**

```js
const png = new Resvg(svg, { fitTo: { mode: 'width', value: canvas.w }, font: { fontFiles, loadSystemFonts: false } })
  .render().asPng();                       // 32-bit RGBA
const rgb = stripAlpha(png);               // pngjs decode → colorType 2 re-encode over colors.bg
fs.writeFileSync(out, rgb);
assertPlayLegal(out);                      // re-reads the file it just wrote
```

`loadSystemFonts: false` is deliberate — it makes rendering identical on every machine instead of silently
substituting whatever the host has installed.

Export these three, they are the whole of the file's real logic:

- `fitRect(...)` — geometry, below.
- `stripAlpha(buffer)` — decode with `pngjs`, composite over `colors.bg` (so any antialiased edge resolves
  against the real background rather than black), re-encode with `colorType: 2, inputHasAlpha: true`.
- `assertPlayLegal(filePath)` — read the PNG header and **throw a message naming the file** unless it is
  exactly `canvas.w × canvas.h` with `colorType === 2`. Called on every output. This is the guard that means
  a wrong-sized asset can never silently reach Play Console.

Export and unit-test this function — it is the only real logic in the file:

```js
// Fit a raw capture (any phone aspect) into the canvas as a bezelled phone.
// Returns the SCREEN rect; the bezel is drawn `bezel` px outside it.
// Guarantees: horizontally centred, never wider than maxW, and the bezel's
// bottom edge never passes `bottomLimit`.
function fitRect({ srcW, srcH, canvasW, top, maxW, bezel, bottomLimit }) { … }
```

**The finished asset, to scale.** This is the layout contract — build to it, do not reinterpret it:

```
┌──────────────────────────────────┐  1080 × 1920, frozen
│                                  │  bg: vertical wash colors.bg → 6% colors.accent
│                                  │
│        One question a day.       │  headline · Fredoka_600 62px · colors.ink · y=180
│      That's the whole ritual.    │  sub · Baloo2_500 40px · colors.ink @62% · y=258
│                                  │  both centred on x=540
│      ┌────────────────────┐      │  ← bezel outer: x=196 y=386, r=46, 1px stroke
│      │ ┌────────────────┐ │      │  ← screen rect: x=210 y=400, r=34
│      │ │                │ │      │
│      │ │  the raw       │ │      │  660 wide; height from source aspect
│      │ │  capture       │ │      │  (1430 for a 1440×3120 source)
│      │ │                │ │      │
│      │ └────────────────┘ │      │  ← screen bottom y=1830
│      └────────────────────┘      │  ← bezel bottom y=1844, under the 1880 limit
│                                  │
└──────────────────────────────────┘
```

Geometry — use these constants, they are already checked against a 1440×3120 source:
`top: 400`, `maxW: 660`, `bezel: 14`, `bottomLimit: 1880`, outer corner radius `46`, inner `34`.
A 1440×3120 source lands 660 × 1430 at y 400–1830, bezel bottom 1844, clear. A squarer source (16:9
emulator) simply comes out shorter — **width is capped, height is never stretched**, so aspect is preserved
in every case. If a taller source would breach `bottomLimit`, scale down to fit rather than crop.

Caption block: headline at `y = 180`, 62px, `colors.ink`; sub at `y = 258`, 40px, `colors.ink` at 62%
opacity. Both centred on `canvasW / 2`. Background is a soft vertical wash from `colors.bg` to a 6%
`colors.accent` tint — a flat fill reads as an unfinished asset at listing size.

CLI: `node scripts/shots.js` reads every `store/raw/<id>.png` named in the manifest and writes
`store/play/<id>.png`. **A missing raw file is a hard error naming the id** — a silently-skipped shot is how
a listing ends up with five screenshots when it should have seven. Print each output's dimensions.

### Step 5 — the flow

`.maestro/store-shots.yaml`. `appId: app.dailyrituals.mobile`. Structure:

```yaml
appId: app.dailyrituals.mobile
---
- launchApp: { clearState: false }
- tapOn: "You"
- longPressOn: "v1.0"
- tapOn: "Store screenshots"
- tapOn: { id: "Apply dev state" }
- tapOn: "Apply"            # the confirm alert
- tapOn: { id: "Close the dev panel" }
# …then per shot: navigate, then takeScreenshot
- tapOn: "Today"
- takeScreenshot: store/raw/01-today
```

Cover all seven manifest ids. `02-write` and `03-moods` are two steps of the same WriteFlow (reached by the
`Write today's entry` FAB — the label IMP-059 added); `04-reflections` is the **Reflections** tab with a
search term typed in, so the IMP-053 snippet highlight is visible; `05-insights` is the Insights tab scrolled
to the lifetime heatmap; `06-achievements` and `07-shop` open from the harness Launch section
(`tapOn: "Achievements"` / `"Shop"`), which is faster and less brittle than tapping through the You tab.

**Selector rule: prefer the accessibility label, fall back to visible text, never use coordinates.** A
coordinate tap is a screenshot flow that breaks silently on the next layout change and produces a *wrong*
picture rather than an error.

### Step 6 — the orchestrator

`scripts/shots.sh`, `chmod +x`, in this order:

1. Assert `adb` sees exactly one device, and that `maestro` is on `PATH` — exit with a readable message
   naming the install command if not.
2. Clean `store/raw/`.
3. Status bar into demo mode — this is why store screenshots show a clean clock and a full battery:
   ```sh
   adb shell settings put global sysui_demo_allowed 1
   adb shell am broadcast -a com.android.systemui.demo -e command enter
   adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 1200
   adb shell am broadcast -a com.android.systemui.demo -e command battery -e level 100 -e plugged false
   adb shell am broadcast -a com.android.systemui.demo -e command network -e wifi show -e level 4
   adb shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false
   ```
4. `maestro test .maestro/store-shots.yaml`
5. Exit demo mode (`-e command exit`) **in a trap, so it runs even when maestro fails** — leaving an
   emulator stuck in demo mode poisons every later walk's screenshots.
6. `node scripts/shots.js`

`package.json` → `"shots": "bash scripts/shots.sh"`.

### Step 7 — tests

`__tests__/shots.test.js`, node-only, no emulator:

1. `fitRect` with a 1440×3120 source returns a width ≤ 660, a horizontally centred x, and a bezel bottom
   ≤ 1880.
2. `fitRect` **preserves source aspect** within 0.5px for three sources: 1440×3120, 1080×1920, 1080×2340.
3. `fitRect` scales down rather than breaching `bottomLimit` when handed an absurdly tall source (1000×4000).
4. Every `shots[]` row has a non-empty `id`, `headline` and `sub`, ids are unique, and `shots.length` is
   **between 4 and 8** — the Play bounds, asserted so a future edit cannot quietly drop the set below the
   promo-eligibility floor.
5. **`canvas` is 1080 × 1920 and its aspect is under 2:1** — asserted against the config directly, so a
   future edit to the canvas trips a test instead of shipping a rejectable asset.
6. **The resolution-independence test — the one that answers "will I get weird sizes".** Render the same
   one-row manifest three times against three synthetic sources — **1440×3120, 1080×2400, 1080×1920** — and
   assert all three outputs are **byte-identical in dimensions: exactly 1080×1920, colour type 2**. Different
   input shapes, one output shape.
7. `stripAlpha` output decodes with `colorType === 2` and no alpha channel, and an absurdly tall source
   (1000×4000) still yields 1080×1920 rather than throwing or cropping.
8. `assertPlayLegal` **throws** on a deliberately mis-sized PNG (write a 500×500 one), and the thrown message
   contains the file name.

`npm test` must stay **≥ 748 passed**. `npx expo export --platform android` must stay clean — it will, since
nothing here is imported by the app.

### Step 8 — .gitignore

Add `store/raw/`. **`store/play/` is committed** — the finished assets are the deliverable and the owner
uploads them straight to Play Console; they must survive a fresh clone.

### Acceptance

- `npm test` green, ≥ 748 passed.
- `npx expo export --platform android` clean.
- `node scripts/shots.js` run against a synthetic capture produces a **1080×1920, 24-bit, alpha-free** PNG,
  and produces the same dimensions from all three synthetic source shapes. **A build chat proves the
  compositor, not the capture** — there is no emulator here.
- `grep -rn "PLUS_ENABLED" src/` unchanged; `git diff src/` touches **only** the three dev-only files named
  in Step 1 and Step 2.

### Commit message (exact)

```
feat(tools): store screenshots build themselves (IMP-061)
```

**Stop point.** The end-to-end run — emulator, real captures, eyes on the seven PNGs — is **WALK-15** in
[`walk-open.md`](walk-open.md), and it is a different chat. Do not attempt it here. Tick the backlog row,
write the session note, move this spec to `docs/build-log.md`.
