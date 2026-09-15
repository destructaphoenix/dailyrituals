#!/usr/bin/env python3
"""encode-sky.py — take one raw sky clip to a shippable one, and prove it.

This is the pipeline that produced the live `meteor` clip, written down so it
runs the same way every time instead of being retyped per sky. It does what
docs/design-queue.md -> "The encode recipe" / "The loop rule" / "From a design
card to a shipped clip" specify, in order, and REPORTS rather than assumes:

    crop -> encode -> frame-count identity -> adjacent-frame floor
          -> wrap score against that floor -> poster + black-frame check

    python3 scripts/encode-sky.py sky-src/aurora-night.mp4 --id aurora --mode night

Then paste the printed manifest line into SHOP_SKIES in src/data.js.

WHAT THIS TOOL WILL NOT TELL YOU
--------------------------------
A green run proves the ENCODE preserved whatever loop the source had. It does
not prove the source ever looped. If the wrap scores far below this clip's own
adjacent-frame floor, the footage does not loop and no encode setting will fix
it -- search it for a window that does:

    python3 scripts/find-loop.py sky-src/aurora-night.mp4 --min-sec 4 --max-sec 5

then re-run this with --trim-in / --trim-out. Metrics also saturate on water
and noise, so the last word is watching the seam, not this script's verdict.

⚠️ There is NO universal SSIM threshold and assuming one is a real trap. On
fast water two CONSECUTIVE frames score ~0.43; on near-static footage ~0.99.
Everything here is calibrated against the clip's own floor for that reason.
"""
import argparse
import json
import os
import re
import subprocess
import sys

# Provenance, not preference. These three are Pinterest-derived: an image off a
# pin fed to Veo/Higgsfield comes out a derivative and carries the pin's rights.
# They are fine as private mockups and must never be distributed in a paid app.
# Ruling: docs/skies-route.md -> Stage 0 ruling 1 (owner, 2026-09-15).
BLOCKED = ('fernlight', 'tideline', 'localline', 'local-line', 'local_line', 'train')

SIZE_DEFAULT = 1280
OUT_DIR = 'sky-build'


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def probe(clip):
    out = run(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
               '-count_frames', '-show_entries',
               'stream=width,height,r_frame_rate,nb_read_frames,pix_fmt',
               '-of', 'json', clip]).stdout
    try:
        s = json.loads(out)['streams'][0]
    except (ValueError, KeyError, IndexError):
        sys.exit(f"  ✗ could not probe {clip} — is it a video file?")
    num, den = (s['r_frame_rate'].split('/') + ['1'])[:2]
    return {
        'w': int(s['width']), 'h': int(s['height']),
        'fps': float(num) / float(den),
        'frames': int(s.get('nb_read_frames') or 0),
        'pix_fmt': s.get('pix_fmt', '?'),
    }


def ssim(a, b):
    """Full-resolution SSIM between two PNGs, as ffmpeg's 'All:' figure.

    ⚠️ '-v info', NOT '-v error'. The ssim filter prints its result at info
    level, so the recipe's own '-v error' suppresses the only line worth
    reading and the check silently measures nothing. Found 2026-09-15 running
    this against the committed fixture; docs/design-queue.md is corrected.
    """
    err = run(['ffmpeg', '-v', 'info', '-i', a, '-i', b,
               '-lavfi', 'ssim', '-f', 'null', '-']).stderr
    m = re.search(r'All:([0-9.]+)', err)
    return float(m.group(1)) if m else None


def yavg(clip, n):
    """Mean luma of one frame, 0–255. Exact, unlike guessing from file size."""
    err = run(['ffmpeg', '-v', 'info', '-i', clip, '-vf',
               fr'select=eq(n\,{n}),signalstats,metadata=print:key=lavfi.signalstats.YAVG',
               '-vframes', '1', '-f', 'null', '-']).stderr
    m = re.search(r'YAVG=([0-9.]+)', err)
    return float(m.group(1)) if m else None


def frame_png(clip, n, path):
    run(['ffmpeg', '-v', 'error', '-i', clip,
         '-vf', fr'select=eq(n\,{n})', '-vframes', '1', '-y', path])


def main():
    p = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('clip', help='the raw source clip, e.g. sky-src/aurora-night.mp4')
    p.add_argument('--id', required=True, help="the SHOP_SKIES id, e.g. 'aurora'")
    p.add_argument('--mode', choices=['day', 'night', 'both'], default='both',
                   help="'both' for a one-clip sky (default); day/night for a pair")
    p.add_argument('--crop-x', type=float, default=50.0,
                   help="object-position X%% read off the design card (default 50, centred)")
    p.add_argument('--crop-y', type=float, default=50.0,
                   help="object-position Y%% read off the design card (default 50, centred)")
    p.add_argument('--focus-x', type=float,
                   help="where the SUBJECT sits in the source, X%%. Use instead of --crop-x/y "
                        "when the design card names the subject's position (e.g. Event Horizon: "
                        "'the event horizon sits at roughly 69%% across and 43%% down')")
    p.add_argument('--focus-y', type=float,
                   help="where the subject sits in the source, Y%%. Requires --focus-x")
    p.add_argument('--zoom', type=float, default=1.0,
                   help="crop tighter than the full square, to enlarge the subject. Read the "
                        "card's `transform: scale(N)` (Event Horizon uses 1.35). Costs "
                        "resolution: the delivered short edge is min(W,H)/zoom")
    p.add_argument('--trim-in', type=int, help='first frame to keep (from find-loop.py)')
    p.add_argument('--trim-out', type=int, help='last frame to keep (from find-loop.py)')
    p.add_argument('--size', type=int, default=SIZE_DEFAULT, help='square edge (default 1280)')
    p.add_argument('--poster-frame', type=int, default=0,
                   help='which frame the poster is cut from (default 0)')
    a = p.parse_args()

    stem = os.path.basename(a.clip).lower()
    hit = next((b for b in BLOCKED if b in stem or b in a.id.lower()), None)
    if hit:
        sys.exit(
            f"  ✗ REFUSED — '{hit}' is Pinterest-derived and may never ship.\n"
            "    An AI edit does not clear a copyright: the output carries the\n"
            "    original pin's rights, and Plus skies are a paid IAP.\n"
            "    See docs/skies-route.md -> Stage 0 ruling 1 (owner, 2026-09-15).\n"
            "    It stays fine as a private mockup. Do not upload it to R2.")

    if not os.path.exists(a.clip):
        sys.exit(f"  ✗ no such file: {a.clip}")
    os.makedirs(OUT_DIR, exist_ok=True)

    src = probe(a.clip)
    if (a.focus_x is None) != (a.focus_y is None):
        sys.exit("  ✗ --focus-x and --focus-y go together.")

    # Two ways to place the crop, and they answer different questions.
    #
    # --crop-x/y is `object-position` read off the card: "which part of the
    #   frame does the box show". It is relative to the SLACK, so on a landscape
    #   source the Y value does nothing at all -- a square crop of 16:9 takes
    #   the whole height and there is no vertical slack to spend.
    # --focus-x/y is the SUBJECT's own position in the source: "put this here".
    #   Design cards state it directly for off-centre subjects, and unlike
    #   object-position it does not depend on the card's preview box, which is
    #   NOT the device's box (docs/design-queue.md warns about exactly this).
    #   Prefer it whenever the card gives it.
    S = round(min(src['w'], src['h']) / a.zoom)
    if a.focus_x is not None:
        cx, cy = a.focus_x / 100 * src['w'], a.focus_y / 100 * src['h']
        rx, ry = round(cx - S / 2), round(cy - S / 2)
        x, y = max(0, min(rx, src['w'] - S)), max(0, min(ry, src['h'] - S))
        if (x, y) != (rx, ry):
            print(f"  ⚠️  the subject cannot be centred — the crop hit the frame edge\n"
                  f"      (wanted +{rx}+{ry}, clamped to +{x}+{y}). It will sit off-centre\n"
                  "      by that much. A higher --zoom buys room, at the cost of resolution.")
    else:
        x = round(a.crop_x / 100 * (src['w'] - S))
        y = round(a.crop_y / 100 * (src['h'] - S))

    print(f"\n  source   {src['w']}x{src['h']}  {src['fps']:.3f} fps  "
          f"{src['frames']} frames  {src['frames'] / src['fps']:.2f}s  {src['pix_fmt']}")

    # ── the filter chain. Spatial only: anything temporal (denoise, minterpolate,
    #    deflicker, stabilisation) carries state across frames and quietly stops
    #    frame 0 matching the last one.
    vf = []
    expected = src['frames']
    if a.trim_in is not None or a.trim_out is not None:
        lo = a.trim_in or 0
        hi = a.trim_out if a.trim_out is not None else src['frames'] - 1
        vf.append(fr"select=between(n\,{lo}\,{hi}),setpts=N/FRAME_RATE/TB")
        expected = hi - lo + 1
        print(f"  trim     frames {lo}–{hi}  ({expected} frames, "
              f"{expected / src['fps']:.2f}s)")
    vf.append(f"crop={S}:{S}:{x}:{y}")
    vf.append(f"scale={a.size}:{a.size}:flags=lanczos")
    how = (f"subject at {a.focus_x:g}% {a.focus_y:g}%" if a.focus_x is not None
           else f"object-position {a.crop_x:g}% {a.crop_y:g}%")
    zoomnote = f", zoom {a.zoom:g}x" if a.zoom != 1.0 else ""
    print(f"  crop     {S}x{S} at +{x}+{y}   ({how}{zoomnote})")
    if S < 1080:
        print(f"  🔴 DELIVERED SHORT EDGE IS {S}px, upscaling {a.size / S:.2f}x to {a.size}.\n"
              "      1080 is the floor and 720 was already a grudging exception\n"
              "      (skies-route.md ruling 2). Below ~720 this is visible on a phone\n"
              "      even behind a scrim. Get a larger source before spending time here.")

    suffix = '' if a.mode == 'both' else f'-{a.mode}'
    out = f"{OUT_DIR}/{a.id}{suffix}.mp4"
    poster = f"{OUT_DIR}/{a.id}{suffix}-poster.jpg"

    r = run(['ffmpeg', '-v', 'error', '-i', a.clip, '-vf', ','.join(vf),
             '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
             '-crf', '23', '-maxrate', '3500k', '-bufsize', '7000k',
             '-g', '48', '-keyint_min', '48', '-sc_threshold', '0',
             '-an', '-fps_mode', 'passthrough', '-movflags', '+faststart',
             '-y', out])
    if r.returncode:
        sys.exit(f"  ✗ ffmpeg failed:\n{r.stderr}")

    enc = probe(out)
    mb = os.path.getsize(out) / 1e6
    print(f"  encoded  {out}  {enc['w']}x{enc['h']}  {enc['frames']} frames  {mb:.2f} MB")

    ok = True
    # 1. frame-count identity — the fps must not have been resampled.
    if enc['frames'] != expected:
        print(f"  ✗ FRAME COUNT CHANGED: {expected} in, {enc['frames']} out.\n"
              "    The encode resampled. A crafted loop cannot survive that.")
        ok = False
    else:
        print(f"  ✓ frame count preserved ({enc['frames']})")

    if mb > 4:
        print(f"  ⚠️  {mb:.2f} MB is over the ~2.5–3.5 MB target — it downloads per sky.")

    # 2. the floor, then the wrap, measured against it.
    tmp = [f"{OUT_DIR}/.a.png", f"{OUT_DIR}/.b.png",
           f"{OUT_DIR}/.first.png", f"{OUT_DIR}/.last.png"]
    mid = min(100, max(1, enc['frames'] // 2))
    frame_png(out, mid, tmp[0])
    frame_png(out, mid + 1, tmp[1])
    floor = ssim(tmp[0], tmp[1])

    frame_png(out, 0, tmp[2])
    # The seek must clear at least one whole frame at this clip's own fps —
    # a fixed -0.05 lands inside the last frame's decode window on anything
    # below ~20fps (e.g. Emberfield's 10fps: 0.1s/frame) and ffmpeg emits
    # nothing. Found 2026-09-15 running this against the real clip.
    eof_offset = max(0.05, 1.5 / enc['fps'])
    run(['ffmpeg', '-v', 'error', '-sseof', f'-{eof_offset:.3f}', '-i', out,
         '-vframes', '1', '-y', tmp[3]])
    wrap = ssim(tmp[2], tmp[3])

    if floor is None or wrap is None:
        print("  ⚠️  could not measure the loop — check the clip by eye.")
        ok = False
    else:
        ratio = wrap / floor if floor else 0
        print(f"  floor    {floor:.4f}   (two CONSECUTIVE frames — this clip's own scale)")
        print(f"  wrap     {wrap:.4f}   ({ratio:.2f}x the floor)")
        # Bands, not a threshold. CALIBRATION: the clip that actually SHIPPED as
        # `meteor` -- the fixture's frames 226–345 -- scores 0.87x the floor here.
        # An earlier version of this script gated at 0.95x and rejected it, which
        # is precisely the trap docs/design-queue.md warns about. The build log's
        # "1.08x the floor" for the same window is find-loop.py's coarse 32x32 MAD,
        # a different and far less sensitive metric; the two numbers are not
        # comparable and neither is wrong.
        if ratio >= 0.85:
            print("  ✓ the wrap differs about as much as one ordinary frame step —\n"
                  "    as seamless as this subject allows. (The shipped `meteor`\n"
                  "    clip scores 0.87 here.) WATCH IT ANYWAY: metrics saturate\n"
                  "    on water and noise, and eyes are the last word.")
        elif ratio >= 0.6:
            print("  ⚠️  MARGINAL — below the shipped clip's 0.87, above a clear break.\n"
                  "    This script will not call it either way. Watch the seam, and if\n"
                  "    it jumps, search for a better window:\n"
                  f"      python3 scripts/find-loop.py {a.clip} --min-sec 4 --max-sec 5")
        else:
            print("  ✗ THE SOURCE DOES NOT LOOP. This is not an encode fault and no\n"
                  f"    setting fixes it. Search for a window that does:\n"
                  f"      python3 scripts/find-loop.py {a.clip} --min-sec 4 --max-sec 5\n"
                  "    then re-run with --trim-in / --trim-out.")
            ok = False

    # 3. the poster, and whether it is a black frame.
    run(['ffmpeg', '-v', 'error', '-i', out,
         '-vf', fr'select=eq(n\,{a.poster_frame})', '-vframes', '1',
         '-q:v', '3', '-y', poster])
    pkb = os.path.getsize(poster) / 1024 if os.path.exists(poster) else 0
    # ⚠️ Do NOT infer blackness from file size. docs/design-queue.md suggests it
    # ("a near-black frame compresses to a few hundred bytes"), and it is not
    # reliable: the committed fixture's frame 0 is luma 16 against ~115 mid-clip
    # and still produced a 9.6 KB jpg, which sails past any size threshold.
    # Compare the poster's mean luma to a mid-clip frame instead — that is exact,
    # and it does not false-positive on a night sky, where BOTH frames are dark.
    py_, my_ = yavg(out, a.poster_frame), yavg(out, mid)
    if py_ is None or my_ is None:
        print(f"  ⚠️  poster written ({pkb:.1f} KB) but its luma could not be read — eyeball it.")
    elif my_ > 0 and py_ < 0.4 * my_:
        print(f"  ✗ poster frame is luma {py_:.0f} against {my_:.0f} mid-clip — that is a\n"
              "    BLACK OPENING FRAME, not a dark sky. Many clips open on one.\n"
              "    Trim it (--trim-in 1) rather than cutting the poster elsewhere, so\n"
              "    frame 0 and the poster still agree — otherwise the poster shows one\n"
              "    thing and the video starts on another.\n"
              "    On device this reads as a bug in skyHero.js, not as a bad asset.")
        ok = False
    else:
        print(f"  ✓ poster   {poster}  {pkb:.1f} KB  (luma {py_:.0f} vs {my_:.0f} mid-clip)")

    for f in tmp:
        if os.path.exists(f):
            os.remove(f)

    print("\n  " + ("— ready to upload —" if ok else "— NOT ready. Fix the ✗ above. —"))
    if ok:
        key = 'clip' if a.mode == 'both' else f'clip{a.mode.capitalize()}'
        print(f"""
  1. Upload both files to R2, then add to SHOP_SKIES in src/data.js:

       {key}: `${{SKY_BASE}}/{os.path.basename(out)}`,
       poster: `${{SKY_BASE}}/{os.path.basename(poster)}`,
       accent: '#RRGGBB',   // read off the clip — it tints the XP bar over video
       credit: 'Veo or Higgsfield (name which), <paid tier>, output owned. '
               'Generated <date>; loop window <frames> cut {a.clip}.',

     `credit` is REQUIRED and non-empty for every sky with a clip. A sky whose
     origin nobody can state is a sky that cannot ship.

  2. Watch the seam before you believe any of the numbers above.
""")
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
