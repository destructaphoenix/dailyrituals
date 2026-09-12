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

**1. 🔴 Which tool made the AI clips, and does the tier that made them grant commercial output ownership?**
This is the provenance gate in [`playbook.md`](playbook.md) → "Every sky must be ours to sell", and it is
the hard blocker. Until it is answered, **no clip currently in the design project may ship**, free or paid.
The answer is also per-clip: a text-to-video hero with nothing fed in is clean; the eleven named after
*editing* prompts are not.

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
