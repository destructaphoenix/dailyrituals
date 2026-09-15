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
| 3 | **[`IMP-121`](specs-open.md#imp-121--the-streak-hero-plays-a-video-sky)** — the hero card plays video | 🤖 build | Stage 5 |
| 4 | ~~download + cache~~ — **gone, see below** | — | — |
| 5 | **[`IMP-122`](specs-open.md#imp-122--the-sky-catalogue-becomes-a-manifest)** — the catalogue and the shop tiles | 🤖 build | Stage 6 |
| 6 | The binary, then a device walk | 🤖 + 👤 | ship |

✅ **Both specs are written** (2026-09-12). Stage 4 collapsed into a flag — see "What reading the SDK
changed" at the foot of this file.

---

## Stage 0 — three rulings, and none of them is a chat's to make

**1. ✅ ANSWERED AND CLOSED 2026-09-15 by the owner, in two passes — the tool question, then the per-clip classification.**

> **Owner, 2026-09-15:** *"Everything from Pinterest is either directly AI generated, or was an image that
> I had converted to video using higgsfield or veo subscriptions."* Also ruled the same day: **we are not
> sourcing stock replacements.**

**What that clears.** Requirement **#2** of the gate — *the tool's terms grant commercial use and output
ownership*. **Higgsfield and Veo both grant commercial use and output ownership on paid tiers**, and the
owner holds subscriptions to both. That requirement is satisfied and does not need re-asking. It also
answers the *"find out which tool it was"* note in the playbook: it was those two.

**What that first answer did NOT settle — requirement #1, *nothing scraped in the chain*.** It splits the
library in half rather than clearing it, and which half a clip lands in is decided by **one question: where
did the seed image come from?** ➡️ **The owner answered that too, later the same day — the table below is
the result, and requirement #1 is now settled per clip.** This rule is kept because it is the test any
*future* clip has to pass:

| The chain | Verdict |
| --- | --- |
| An image **the owner owns** → Higgsfield/Veo → clip | ✅ **Clean. Ships**, once its provenance line is written. |
| Text-to-video, **nothing fed in** | ✅ **Clean. Ships.** |
| An image **off Pinterest** → Higgsfield/Veo → clip | 🔴 **Derivative.** The output carries the seed image's rights, whichever tool did the conversion. |

⚠️ **"It was already AI-generated when I found it on Pinterest" does not by itself clear a clip.** Someone
else generated it; selling their output is the same problem in a different coat. (Whether AI output is
copyrightable at all is contested and jurisdiction-specific — it is not a defence to build a paid IAP on,
and it says nothing about Pinterest's own terms.)

### ✅ THE CLASSIFICATION — owner, 2026-09-15. **The gate is CLOSED.**

> **Owner:** *"Fernlight, train hero and tideline hero cards video are derived from pinterest. Everything
> else is Veo or Higgsfield directly."*

**"Train hero" is `Local Line`** — the only train in the set.

| Hero | Chain | Verdict |
| --- | --- | --- |
| `Fernlight` | Pinterest image → Veo/Higgsfield | 🔴 **DERIVATIVE — cannot ship.** |
| `Local Line` ("train hero") | Pinterest image → Veo/Higgsfield | 🔴 **DERIVATIVE — cannot ship.** Already dead anyway: ⛔ it cannot loop (the train traverses). |
| `Tideline` | Pinterest image → Veo/Higgsfield | 🔴 **DERIVATIVE — cannot ship.** Covers `tideline.html`, `tideline-hero.html` **and the `-v2` pair.** |
| `Aurora` | Veo/Higgsfield direct | ✅ **CLEAR.** |
| `Sakura Fuji` | Veo/Higgsfield direct | ✅ **CLEAR.** |
| `Event Horizon` | Veo/Higgsfield direct | ✅ **CLEAR.** |
| `Emberfield` | Veo/Higgsfield direct | ✅ **CLEAR.** |
| `Starfall` | Veo/Higgsfield direct | ✅ **CLEAR.** |
| `Meteorfall` | drawn in CSS — no footage exists | ✅ **CLEAR by construction**, and the only one with no provenance surface at all. |
| `meteor` → `ocean.mp4` (**the one already live**) | Pexels stock | ✅ **CLEAR**, unaffected by any of this. |

🔴 **The three blocked cards must not be ported, and their `.mp4`s must not be uploaded to R2** — not as a
placeholder, not "just to test the path", not free rather than paid. **An AI edit does not clear a
copyright**; these carry the original pin's rights. ⚠️ **They are still fine as private design mockups**,
which is what they have always been — the risk starts at *distribution*, not at generation. Leave the cards
in the project.

**What the loss actually costs: two heroes, not three.** `Local Line` was already ruled out on the loop
rule below, so it takes nothing with it. The real casualties are **`Fernlight` and `Tideline`** — and
`Tideline` is the more expensive of the two, because it had a day/night pair, posters, *and* a `-v2`
regeneration already done.

⚠️ **Write the provenance line per sky when each one is added to `SHOP_SKIES`** — requirement #3, and the
only part of the gate that is still outstanding. For the cleared six it is the same sentence with the tool
name and date filled in; `credit` is already a required non-empty field on any sky carrying a clip
([`data.js`](../src/data.js)).

### What is actually ready to ship, sky by sky

**Provenance is no longer the blocker for any of these. Files are.** Read against the two rulings already
made above (720 short edge accepted; **posters are required, not optional**):

| Hero | Footage | Poster | What it still needs |
| --- | --- | --- | --- |
| **Aurora** | ✅ day + night | ✅ both | **Nothing but encode → R2 → a data edit.** Consider collapsing to one clip (an aurora is not a daylight phenomenon — see the loop-rule table). |
| **Sakura Fuji** | ✅ day + night | ✅ both | **Nothing but encode → R2 → a data edit.** Daylight-defined, so it correctly keeps both modes. |
| **Event Horizon** | ✅ one clip, both modes | 🔴 none | A poster frame. Also: the file is `eventhorizon-temp.mp4` — **confirm it is the final grade, not a working copy**, before it is baked. |
| **Emberfield** | ✅ one clip | 🔴 none | A poster frame. |
| **Starfall** | ✅ one clip | 🔴 none | A poster frame. 20.2s against a 6–10s spec — **accepted, do not re-open** (ruling 2). |
| **Meteorfall** | 🔴 none — it is CSS | — | ⏸ **PARKED — owner, 2026-09-15: *"hold off on meteorfall. I do not like it and will replace it with something better so leave it."*** Do not port it, do not generate footage for it, do not propose it as the cheap win. Its replacement is the owner's to choose. |

🔑 **A poster is one command** (`ffmpeg -i clip.mp4 -vframes 1 -ss <t> poster.png`), so three of the six are
a few minutes apart from Aurora and Sakura Fuji.

### ▶️ The pipeline is built — `scripts/encode-sky.py`

**Added 2026-09-15.** One command per clip does what was done by hand for the live `meteor` sky: crop →
encode → frame-count identity → adjacent-frame floor → wrap score against that floor → poster + black-frame
check, then it prints the `SHOP_SKIES` line to paste.

```sh
python3 scripts/encode-sky.py sky-src/aurora-night.mp4 --id aurora --mode night
```

Drop clips in [`sky-src/`](../sky-src/README.md) (gitignored); output lands in `sky-build/` (gitignored too
— footage never enters git, a build or an OTA).

**Validated against the one clip whose answer is already known.** On the committed IMP-121 fixture it
independently re-finds both recorded defects — the black opening frame and the wrap that does not hold —
and on the shipped window (frames 226–345) it passes and emits the manifest line. ⚠️ **It refuses
`Fernlight`, `Local Line` and `Tideline` by name**, as a backstop to the ruling above.

⚠️ **It reports; it does not decide.** The loop verdict is banded, not thresholded — the shipped clip scores
**0.87× its own floor** at full-resolution SSIM, so a "0.95+" gate would have rejected the sky that is live.
(The build log's "1.08× the floor" for that same window is `find-loop.py`'s coarse 32×32 MAD, a different
and far less sensitive metric; the two numbers are not comparable and neither is wrong.) **Watch the seam.**

### 🔴 Event Horizon — the crop is solved, and it is not what blocks it

**Read from its own design card** (`art/event-horizon.html`) on 2026-09-15, in answer to *"can't you just
ask Claude Design for the coordinates?"* — **yes, and the card states them outright:** the event horizon
sits at **69% across, 43% down**, the video is scaled **1.35×**, and the source is **736×414**.

`encode-sky.py` now takes exactly that, with `--focus-x/--focus-y/--zoom`:

```sh
python3 scripts/encode-sky.py sky-src/event-horizon.mp4 --id eventhorizon --zoom 1.35 \
    --focus-x 69 --focus-y 43          # -> crop 307x307 at +354+25, black hole centred
```

⚠️ **`--focus-x/y` is not `--crop-x/y`.** `object-position` is relative to the *slack*, so on a landscape
source its Y value **does nothing** — a square crop of 16:9 takes the whole height and there is no vertical
slack to spend. `--focus-x/y` is the subject's own position in the frame, which is what the card states and
what survives the card's preview box not being the device's box.

**So the framing is a solved, one-command problem. Two other things are not:**

1. 🔴 **Resolution. The source is 736×414 — a 414 short edge, and the 1.35× zoom cuts it to 307.** Scaled to
   the 1280 delivery that is a **4.17× upscale**. The floor is 1080, and 720 was already a grudging
   exception accepted only because it is @2× art behind a numeral under a scrim. **307 is not in the same
   conversation** — it is under half the grudging exception. ⚠️ **`eventhorizon-temp.mp4` is a working copy;
   the ungraded master is in the project's `uploads/`.** Check the master's real dimensions before
   concluding anything — but if it is also 414, **this hero cannot ship at hero size**, however good the
   crop is, and the answer is to regenerate it at the largest square or landscape preset the tool offers.
2. 🔴 **It does not loop, and the card's fix is not something the app can do.** The card measured the
   end-to-start jump at **~25× the mean frame-to-frame change** and worked around it by running **two copies
   of the clip half a length apart with a 2s cross-dissolve**. [`skyHero.js`](../src/home/skyHero.js) plays
   **one** `VideoView` with `p.loop = true` — a hard cut. **The card's loop does not exist in the app**, so
   ported as-is this hero visibly snaps every 10 seconds. Either find a genuine loop window
   (`find-loop.py`), or `SkyHero` grows a crossfade shell, which is a real build task and not a data edit.

**Neither of these is a cropping problem, and neither was visible from the card's picture.** Take them
before spending time on the framing, which is now free.

### Sakura Fuji — one clip or two? And what a second clip actually costs

**How a sky reaches the phone — there is no downloader, and Stage 4 exists to say so.** The manifest entry
holds an `https://` URL on R2; [`videoSkyGate.js`](../src/home/videoSkyGate.js) hands it to `expo-video` as
`{ uri, useCaching: true }` and that is the whole mechanism:

- **Nothing is bundled.** The app ships no sky footage; `assets/skies/fixture.mp4` is the IMP-121 test
  fixture and is not a shipped sky.
- **Nothing is pre-fetched.** A clip is streamed **the first time it is actually played** — i.e. when a user
  who owns that sky has it active. A sky nobody selects is never downloaded.
- **It is then cached to disk, LRU**, at a ceiling of **128 MB** set in
  [`RitualsApp.js:576`](../src/RitualsApp.js#L576) (expo-video's own default is 1 GB; we size it to the
  catalogue because it is a cache, not owned storage).
- **The poster is what covers the first play**, which is why every sky needs one. It is not optional.

**So a second clip costs ~2.5–3.5 MB, downloaded lazily, only for users who own the sky AND switch to that
mode.** It is not a bundle-size or install-size cost, and it cannot be paid twice for the same mode.

**Recommendation: ship Sakura Fuji's DAY clip only, as a one-clip sky (`clip`, not `clipDay`/`clipNight`).**
The reasoning is not cost — the cost is small — it is that **a one-clip sky is a strictly safer object**:
it has one loop to verify, one poster, one provenance line, and it cannot desynchronise. ⚠️ **Note this
cuts against the loop-rule table above, which files `Sakura Fuji` under "daylight-defined → keep both
modes".** That table is right in principle: cherry blossom under a night sky is a different picture, not a
dimmer one. **But it was written before either clip existed, and the owner has now seen both — "its better
one" is a judgement about the actual footage that no rule can overrule.** If the night clip is weak, one
good clip in both modes beats a good one and a weak one, and `skyVideoSource` already handles a one-clip
sky in both modes by design ("never tints one clip to fake the other").

▶️ **Reversible, and cheaply: adding the night clip later is a data-only edit** — `clip` becomes
`clipDay` + `clipNight`. **Ship the day clip, look at it on a phone at night, and decide then.**

🔴 **The one thing a chat cannot do: get the footage out.** `art/assets/*.mp4` are megabytes of binary and
**`DesignSync get_file` is capped at 256 KiB** — the clips cannot travel through the read path, which
`design-system/proposals/README.md` has said since 2026-09-11. **The owner has to export the cleared clips
to disk.** Everything after that (crop offsets, encode, SSIM loop check, posters) is scriptable.

💡 **The stock route below is not deleted, but the owner has declined it** (2026-09-15). It is kept as the
record of what the alternative was.

💡 **The stock route below is not deleted, but the owner has declined it** (2026-09-15). It is kept as the
record of what the alternative was.

**2. ✅ ANSWERED 2026-09-12 — the relaxed spec is accepted.** 720-short-edge footage and `Starfall`'s
20.2s both ship as they are. Recorded as *accepted, not a defect* in
[`IMP-121`](specs-open.md#imp-121--the-streak-hero-plays-a-video-sky) so the next person does not reopen
it: at hero size, behind a 76px numeral under a scrim, 720 is @2× art on a @2.625–3.5× screen and the
Pixel-class case is 1.35×. **Posters are still required** — they are the answer to first-play latency, not
a quality setting, and neither of those two heroes has one yet.

**3. ✅ ANSWERED 2026-09-12 — Cloudflare R2, public bucket behind a custom domain.** Recommended and
taken; see "The host" below for why it beat the alternatives. `SKY_BASE` is one constant in
[`IMP-122`](specs-open.md#imp-122--the-sky-catalogue-becomes-a-manifest), so moving hosts later is a
one-line change.

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

## Stages 3–5 — the two build specs

**Both are written and sitting in [`specs-open.md`](specs-open.md).** They are not repeated here.

| Spec | What | Lane |
| --- | --- | --- |
| [`IMP-121`](specs-open.md#imp-121--the-streak-hero-plays-a-video-sky) | The hero card plays **one bundled fixture clip**. Config plugin, jest mock, `SkyHero`, the card restructure, the scrim, poster-until-ready. | 🔴 **native — `Release-Lane: build`, vc 15 → 16** |
| [`IMP-122`](specs-open.md#imp-122--the-sky-catalogue-becomes-a-manifest) | A sky becomes a manifest — clip URL(s), poster, accent, provenance — and the shop tiles read from it. | ✅ pure JS — OTA |

The four app/design collisions this route was opened for are settled inside `IMP-121`: the padded-vs-
full-bleed card, the frozen `RayFan`/`NightRays` staying for non-video skies, the numeral's contrast
applying in both modes, and the XP bar's per-sky accent.

---

## The host — Cloudflare R2

**Public bucket behind a custom domain.** The catalogue is ~7–14 files of ~3.5MB, so every option is
"free" on storage; **egress is the only number that matters**, because video is the one asset type that
can actually run up a bill.

| Option | Why not |
| --- | --- |
| **Cloudflare R2** ✅ | **zero egress fees, permanently** — not a free-tier allowance that lapses. 10GB storage free, ~200× this catalogue. S3-compatible, so it is a plain HTTPS URL to `expo-video`. Adding a sky is a drag-and-drop, which is exactly the "content, not code" property the delivery decision was chosen for |
| S3 / Cloud Storage | works, but egress is metered — 10k users × 4 skies is ~140GB, which is a real monthly bill for a file that never changes |
| GitHub Releases | free and CDN-backed, but it is a code host doing CDN work; awkward URLs, and app asset delivery at volume is not what it is for |
| Netlify / Pages | free bandwidth, but aimed at sites — large media at volume is the case their terms push back on |
| Play Asset Delivery | Google hosts it free, but wiring it through Expo means custom Gradle. The documented fallback, deliberately not the first move |

**Shape:** `https://<your-domain>/skies/<id>.mp4` and `/skies/<id>-poster.jpg`, one-clip skies at `<id>`,
two-clip at `<id>-day` / `<id>-night`. Set long cache headers — these files never change; a new sky is a
new id, never an overwrite.

---

## What reading the SDK changed — 2026-09-12

**The planned download-and-cache layer is gone.** `expo-video@3.0.16` was installed and its types read
before either spec was written (the discipline three billing specs had to learn the hard way). It turns out
to own a real cache:

- `VideoSource` takes **`useCaching: true`** — a remote sky is a URL, and the module handles the download.
- `setVideoCacheSizeAsync(bytes)` (default 1GB, persistent, **LRU**), `getCurrentVideoCacheSize()`,
  `clearVideoCacheAsync()`.

So there is no hand-rolled `expo-file-system/legacy` download, no cache directory, no offline queue —
`IMP-122` sets a cache size once and the rest is a flag. ⚠️ **It is a cache, not owned storage:** eviction
is possible, so an owned sky must stay re-fetchable and the poster must always cover a cold frame.

`contentFit="cover"` also lands the design's crop with no sizing maths, and **there is no `poster` prop** —
the poster is a layered `<Image>` dropped when `player.status === 'readyToPlay'`.

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

---

## Emberfield does not stutter — it loops (2026-09-16)

The owner, first sitting with all four skies on the phone: *"Emberfield: looks good, but sometimes it feels
like it freezes for one frame."* **"Sometimes" is the whole clue** — a constant judder is a frame rate, an
intermittent one is a seam. Measured from the encoded clip, not guessed:

| | Aurora | Emberfield | Sakura Fuji | Starfall |
| --- | --- | --- | --- | --- |
| fps | 24 | **10** | 24 | 30 |
| frames | 240 | 60 | 240 | 604 |
| one frame lasts | 42ms | **100ms** | 42ms | 33ms |

**Three things were ruled out by measurement, and each one is a dead end somebody will otherwise re-walk:**

1. **It is not a duplicate frame.** All 59 adjacent frame pairs score SSIM 0.860–0.885 against each other —
   a tight band with no outlier anywhere near 1.0. There is no repeated frame in the clip.
2. **It is not a bad loop window.** The wrap (last frame → frame 0) scores **0.863 against an adjacent-frame
   floor of 0.877 — 0.98× the floor**, i.e. the jump back to the start is the same size as any ordinary
   frame step. By `encode-sky.py`'s own calibration that is better than the clip that shipped as `meteor`.
3. 🔴 **It is NOT fixable by frame interpolation, and trying is actively destructive.** The obvious move is
   `minterpolate` 10 → 30fps, and it was tried both ways (`mi_mode=mci` and `blend`, over a doubled clip so
   the interpolation crosses the wrap — that part works, both score 0.97–0.98× floor at 180 frames).
   **Look at the output before believing the numbers: Emberfield is PIXEL ART.** Motion compensation
   resamples hard-edged pixel clusters into mush, and the falling orange leaf in the upper right is smeared
   away entirely by frame 91. **10fps is not a defect in this clip — it is the medium.** Never interpolate
   this source.

### What is left, and what was done about it

`SkyHero` plays with `p.loop = true` — one `VideoView`, a hard restart. **Every loop restart is a seek back
to frame 0**, and the clip was encoded `-g 48`, so it held **two keyframes in 60 frames**. At 10fps a
restart that has to re-decode costs up to 100ms of held frame; at 24 or 30fps the same hitch is 42 or 33ms
and hides under the scrim. That is exactly "sometimes it freezes for one frame", once every 6 seconds.

**Fix applied — `emberfield.mp4` re-encoded all-keyframe.** `encode-sky.py` gains **`--gop`** (default 48
unchanged) and warns on its own whenever an output is under 20fps with a long GOP. Emberfield was rebuilt as
`--gop 1`: 60 frames, **60 keyframes**, wrap now **0.99× floor**, and a loop restart cannot stall because
there is nothing to re-decode.

```
python3 scripts/encode-sky.py sky-src/embers.mp4 --id emberfield --mode both \
    --crop-x 50 --crop-y 58 --gop 1
```

**It costs 1.3 → 2.97 MB and nothing else** — still inside the 2.5–3.5 MB per-sky target, still lazily
downloaded and LRU-cached, and **not one pixel is touched** (frame 30 scores 0.974 against the old encode,
all of it compression, all-intra at crf 23 being the higher-quality side of that number).

✅ **The re-encode is live.** The owner uploaded it 2026-09-16; verified from here rather than taken on
trust — `emberfield.mp4` returns **200, 2,970,779 bytes**, SHA-matching `sky-build/emberfield.mp4` byte for
byte. ⚠️ **One thing did not come with it: `emberfield-poster.jpg` on R2 is still the OLD file** (91,064
bytes vs the new 82,489). **Harmless and not worth a re-upload on its own** — both are frame 0 of the same
clip and score 0.985 against each other; the difference is JPEG compression, not picture. Replace it
whenever the bucket is next open.

⚠️ **The fix is NOT PROVEN and must not be recorded as proven.** Being live is not being watched. It is a
well-supported hypothesis with the other three candidates measured out — it is not a device result, and it
needs an eye on it for a full minute:
[WALK-27](walk-open.md#walk-27--four-skies-and-a-white-numeral) step 3. ⚠️ **`expo-video` caches by URL** —
a phone that has already played Emberfield holds the old bytes, so the walk has to clear app storage or the
test proves nothing.

**If it still hitches after that,** the cause is the loop restart itself rather than the decode, and the
answer is the crossfade shell `skies-route.md` already costed for Event Horizon — two players half a length
apart. That is a real build task on `SkyHero`, not a data edit, and it should not be started before the
device says the cheap fix failed.
