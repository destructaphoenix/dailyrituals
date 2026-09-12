# 🌌 Animated hero skies — the route from here to shipped

> **What this file is.** The **ordered route**. The two decisions either side of it already exist and are
> not repeated here: **delivery** is locked in [`playbook.md`](playbook.md) → "Plus skies" (mp4/H.264,
> square, downloaded per sky, `expo-video` + `expo-file-system`), and the **art direction** is in
> [`design-queue.md`](design-queue.md) → "Plus skies" (the frame, the encode recipe, the loop rule, the
> 36-idea sweep). This file answers only *"what happens in what order, and who does each part"*.
>
> ⚠️ **Nothing here is an `IMP` spec yet.** Stages 3–5 name the three specs that have to be written, and
> what each has to settle before it can be. Specs go in [`specs-open.md`](specs-open.md) as normal.

---

## The shape of it

**Six stages, and the middle four run in parallel.** The art and the engineering are independent past
Stage 1 — which is the whole reason Stage 1 exists.

| | Stage | Owner | Blocks |
| --- | --- | --- | --- |
| 0 | Three rulings | 👤 owner | everything |
| 1 | **One clean clip** | 👤 owner, ~1 hour | Stage 3 only |
| 2 | The rest of the art | 👤 owner, per sky | Stage 6 |
| 3 | `IMP-A` — the hero card learns video | 🤖 build | Stage 4 |
| 4 | `IMP-B` — download + cache | 🤖 build | Stage 6 |
| 5 | `IMP-C` — the catalogue and the shop tiles | 🤖 build | Stage 6 |
| 6 | The binary, then a device walk | 🤖 + 👤 | ship |

---

## Stage 0 — three rulings, and none of them is a chat's to make

**1. 🔴 Which tool made the AI clips, and does the tier that made them grant commercial output ownership?**
This is the provenance gate in [`playbook.md`](playbook.md) → "Every sky must be ours to sell", and it is
the hard blocker. Until it is answered, **no clip currently in the design project may ship**, free or paid.
The answer is also per-clip: a text-to-video hero with nothing fed in is clean; the eleven named after
*editing* prompts are not.

**2. `Emberfield` and `Starfall` — regenerate, or accept the spec relaxed?** Both are `720×1280` and
neither has a poster; `Starfall` is 20.2s against a 6–10s spec. `design-queue.md` → "The short edge is the
only number" lays out the four options and the cost of each. ⚠️ **If the answer is "accept 720", it must be
written into `IMP-C`'s spec as accepted** — otherwise the next person finds it as a bug.

**3. Where do the clips live?** The delivery decision says "a static host" and rules out git and OTA, but
does not name one. `IMP-B` cannot be written without a URL shape. Cheapest options that satisfy it: a
public bucket (R2/S3), or GitHub Releases as a file host — **not** the repo tree. Play Asset Delivery is
the documented fallback and is deliberately not the first move.

---

## Stage 1 — one legally clean clip unblocks all the engineering

🔑 **The engineering does not wait on the art.** `IMP-A`, `IMP-B` and `IMP-C` need *one* clip that is
ours, encoded to spec, with a poster. They do not care which sky it is or whether it is the final art.

**So do this before anything else:** pull a single loop-safe subject off **Pexels or Pixabay** — free,
commercial use granted, no attribution, usually far above the 1080 floor. `design-queue.md`'s
"Build these first" table has ten subjects and their search terms; **embers, a starfield or caustics** are
the most heavily covered. Run it through the encode recipe, run the first-vs-last SSIM check, pull a poster
frame, and write its provenance line.

That clip is the fixture the three specs are built and tested against. Every later sky is then a file
swap, not a code change — which is the property the delivery decision was chosen for.

---

## Stage 2 — the art, per sky (runs alongside Stages 3–5)

For each sky, in this order. All of it is in `design-queue.md`; this is the checklist form.

1. **Clear or replace the footage.** Reverse-search a frame first (`ffmpeg -i clip.mp4 -vframes 1 f.png`
   → Google Lens / TinEye) — a good share of Pinterest video is reposted free stock, and tracing it back
   clears ownership *and* the resolution floor at once.
2. **Check it loops by nature** — stationary or cyclic. This kills `Local Line` outright; `City Window at
   Night` is its replacement.
3. **Decide one clip or two.** Self-lit → one clip, both modes. Sun-lit → two. `Aurora` should drop to one.
4. **Convert the card's `object-position` to an ffmpeg crop offset**, and ⚠️ re-check the band against a
   near-square box first — the card's preview frame is 1.23 aspect and no real device is.
5. **Encode**, with nothing temporal in the chain and the frame rate untouched.
6. **Verify the loop survived** — frame count in vs out, first-vs-last SSIM.
7. **Cut a poster frame.** Not optional: the poster is the entire answer to first-play latency, and only
   five of the seven heroes have one.
8. **Write the provenance line** — tool, prompt or licence, date. A sky whose origin nobody can state
   cannot ship.

**Exit condition:** N clips + N posters + a provenance table, all at or above `1080×1080`.

---

## Stage 3 — `IMP-A`: the hero card learns to play video

**The first binary through Play.** `expo-video` is a native dependency, so this is
`Release-Lane: build` with a `versionCode` bump (currently **15**, [`app.config.js:49`](../app.config.js#L49)) —
not the OTA lane everything since vc15 has used. Only this one.

**What it has to do:** add `expo-video`, restructure the streak hero to a full-bleed video ground with the
numeral over it, and play **one bundled fixture clip** — no download layer, no catalogue, no shop changes.

⚠️ **Four collisions with the app as it stands, all found 2026-09-12 and all for the spec to settle:**

1. **The hero card is not the design's box.** [`HomeScreen.js:71`](../src/screens/HomeScreen.js#L71) is a
   `Card` with `paddingHorizontal: 22`, centred content, and the art (`RayFan`/`NightRays`) sitting inside
   the padding. The design wants **full card width × 336dp, full-bleed**, with the bottom ~28% under a
   scrim. That is a restructure of the card, not a background swap.
2. **`RayFan`/`NightRays` are frozen art** ([`playbook.md`](playbook.md) → standing rules, #3). A video
   sky does not *redraw* them — it replaces them for that sky only — but it does mean **a paid cosmetic
   hides the app's signature**. Default and `crescent` keep the frozen art. 👤 **Owner's call that this is
   what "buying a sky" means.**
3. **The numeral's contrast is currently mode-dependent.** `streakShadow` and `numberGlow` are applied
   `t.dark &&` — on footage the scrim has to carry the numeral in **both** modes, since a clip is not
   lighter in day mode.
4. **The XP bar lives inside the hero card** and the design gives it a per-sky colour. So a sky is not
   only art: its manifest carries an accent that reaches the progress bar. Keep that field in the model
   from the start even if `IMP-A` hardcodes one value.

🔴 **Install `expo-video` first, then read `node_modules/expo-video` before writing the steps.** The
playbook's `~3.0.16` pin is the version, not the API. Three billing specs were written against an imagined
SDK shape and all three had to be redone — see [`build-log.md`](build-log.md). Same discipline here.
A jest mock alongside [`test-mocks/expoFileSystemStub.js`](../test-mocks/expoFileSystemStub.js), wired in
[`jest.setup.js`](../jest.setup.js), is part of the spec.

---

## Stage 4 — `IMP-B`: download once, play from disk

Pure JS on top of Stage 3, so **OTA-shippable** once the binary exists.

- Download on **unlock or apply**, cache to a local URI keyed by sky id, play from disk thereafter.
- The repo already uses **`expo-file-system/legacy`** ([`io.js:7`](../src/backup/io.js#L7)) — SDK 54's
  default export dropped the string-based API. Match that import, do not reach for the new one mid-feature.
- **The named risks are the test list**: first play on a fresh unlock (poster holds the frame), unlocking
  offline (queue the download, keep the poster), and a user who clears app storage (re-download silently).
- ⚠️ **The gate is ownership, not Plus.** `Harvest Moon` is ember-priced at 300, not `tier: 'plus'`
  ([`data.js:144`](../src/data.js#L144)) — so the download trigger keys on `ownedSkies`/`activeSky`, never
  on `plus`.
- ⛔ **Never ship a clip inside an OTA.** `expo-updates` hands every user every asset in an update whether
  they own that sky or not.

---

## Stage 5 — `IMP-C`: the catalogue, and the shop tiles

- **`SHOP_SKIES` grows a manifest per sky**: clip URL(s), poster URL, whether it is one clip or two, the
  accent for the XP bar, and the provenance line from Stage 2. Today it knows five static `kind` strings
  ([`data.js:141`](../src/data.js#L141)) and `SkyPreview` ([`shopui.js:92`](../src/shopui.js#L92)) draws
  each as a gradient with an icon.
- **`Meteor Shower` is `Meteorfall`**, which is drawn in CSS and has no footage. It is clean, and it is
  also the odd one out of a set that must match — `design-queue.md` says regenerate it as footage.
- **The shop list is the open design question**: `shop-plus-skins.html` plays six live clips at 58×58 and
  flags its own cost. 💡 **Posters in the list, the clip only in the detail sheet** is the cheap answer,
  and the detail sheet *is* the hero card — so it reuses Stage 3's component rather than adding one.
- D-08 in the design queue is this row.

---

## Stage 6 — ship it, then prove it on hardware

1. Bump `versionCode` 15 → 16, `Release-Lane: build`, CI on `main` (see
   [`playbook.md`](playbook.md) → shipping). Never `eas` by hand.
2. **A new walk task in [`walk-open.md`](walk-open.md)**, device-only — an emulator cannot answer any of
   what this feature risks. What it has to read: playback on a real panel, **battery over a long session**,
   first-play latency on a fresh unlock, unlocking offline, clearing app storage, and the loop seam at hero
   size (an emulator will lie about all six).
3. Skies after the first are **files on a host** — no Play release, no OTA, no code.

---

## Not in this route

- **Pricing and packaging.** Which skies are Plus, which are ember-priced, and what a sky costs are
  untouched here. `src/billing/` is not opened by any of the three specs.
- **The other Plus art.** `plus-home.html` (D-05/D-07) and `celebration.html` are separate queue rows and
  do not depend on this.
- **Bundling clips with the binary.** Costed and rejected — see the delivery decision.

_Written 2026-09-12. The route only; every "why" behind it is in `playbook.md` and `design-queue.md`._
