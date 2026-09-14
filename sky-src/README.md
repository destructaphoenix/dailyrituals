# `sky-src/` — drop raw sky clips here

**This folder's contents are gitignored. Only this README is committed.**
Nothing you put here reaches git, a build, or an OTA — which is the point.

## How to use it

1. **Export the cleared clips from the Claude Design project to this folder.** They cannot travel any
   other way: `art/assets/*.mp4` are megabytes of binary and `DesignSync get_file` caps at 256 KiB.
2. Run the pipeline on each one:

   ```sh
   python3 scripts/encode-sky.py sky-src/aurora-night.mp4 --id aurora --mode night
   ```

   Output lands in `sky-build/` (also gitignored) as `<id>[-<mode>].mp4` plus a `-poster.jpg`, and the
   script prints the `SHOP_SKIES` line to paste into [`src/data.js`](../src/data.js).
3. **Watch the seam.** The script says so itself. Metrics saturate on water and noise.
4. Upload the pair to R2, then make the data-only edit. No app code changes.

`--mode both` (the default) is a one-clip sky; `--mode day` / `--mode night` is a pair. Pass
`--crop-x` / `--crop-y` with the `object-position` percentages read off the design card if the clip
should not be centre-cropped, and `--trim-in` / `--trim-out` with a window from
[`scripts/find-loop.py`](../scripts/find-loop.py) if the clip does not loop end to end.

## 🔴 What must never go in here

**`Fernlight`, `Local Line` ("train hero") and `Tideline`** — including `tideline-hero` and the `-v2`
pair. They are Pinterest images fed to Veo/Higgsfield, which makes them **derivative works that carry the
original pin's rights**. Plus skies are a paid IAP, so shipping one is commercial infringement in a
Play-listed app. `encode-sky.py` refuses them by name as a backstop, but the backstop is not the rule.

They remain perfectly fine as **private design mockups** — the risk starts at distribution, not at
generation — so leave the cards in the design project. Just never encode, upload or list them.

✅ **Cleared:** `Aurora`, `Sakura Fuji`, `Event Horizon`, `Emberfield`, `Starfall` (Veo/Higgsfield direct).

Full ruling and the per-clip table: [`docs/skies-route.md`](../docs/skies-route.md) → Stage 0 ruling 1.
