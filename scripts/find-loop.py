#!/usr/bin/env python3
"""find-loop.py — find the best loop window inside a sky clip.

Real footage rarely ends where it started, so a clip that is otherwise right
for a sky (quiet centre, self-lit, in the safe zones — docs/design-queue.md)
still jumps at the wrap. This searches every in/out pair whose gap falls in a
target duration and ranks them by how closely the footage matches across the
cut, so a non-cyclic source can still yield a cyclic window.

    python3 scripts/find-loop.py clip.mp4 --min-sec 4 --max-sec 5

⚠️ Scores are only meaningful against THIS CLIP'S adjacent-frame floor, which
the tool prints first. There is no universal threshold: on fast-moving water
two CONSECUTIVE frames score ~0.43 SSIM, while near-static footage scores
~0.99. A wrap at or near the floor differs about as much as one ordinary
frame step, which is as seamless as that subject can be. Comparing a score to
a fixed number like "0.95+" rejects good windows and accepts bad ones.

The pass here is coarse — 32x32 grayscale, mean absolute difference, which
ranks candidates fast. Verify the winner at full resolution with ffmpeg's own
SSIM (the tool prints the commands), then watch the seam. Metrics saturate on
high-frequency detail like water or noise; eyes are the last word.
"""
import argparse
import subprocess
import sys

N = 32           # thumbnail edge for the coarse pass
SIZE = N * N


def probe_fps(clip):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", clip],
        capture_output=True, text=True).stdout.strip()
    if not out:
        sys.exit(f"could not read a frame rate from {clip}")
    num, den = (out.split("/") + ["1"])[:2]
    return float(num) / float(den)


def thumbnails(clip):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", clip,
         "-vf", f"scale={N}:{N},format=gray",
         "-f", "rawvideo", "-pix_fmt", "gray", "-"],
        capture_output=True).stdout
    return [raw[k * SIZE:(k + 1) * SIZE] for k in range(len(raw) // SIZE)]


def mad(a, b):
    """Mean absolute difference, 0 (identical) to 255."""
    return sum(abs(u - v) for u, v in zip(a, b)) / SIZE


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("clip")
    p.add_argument("--min-sec", type=float, default=4.0, help="shortest acceptable loop (default 4)")
    p.add_argument("--max-sec", type=float, default=5.0, help="longest acceptable loop (default 5)")
    p.add_argument("--window", type=int, default=3,
                   help="frames compared per candidate; >1 catches a motion mismatch that a "
                        "single-frame compare misses (default 3)")
    p.add_argument("--top", type=int, default=10)
    a = p.parse_args()

    fps = probe_fps(a.clip)
    frames = thumbnails(a.clip)
    total = len(frames)
    if total < 2:
        sys.exit(f"{a.clip}: not enough frames to search")

    lo, hi = int(a.min_sec * fps), int(a.max_sec * fps)
    if total <= lo + a.window:
        sys.exit(f"{a.clip} is {total / fps:.2f}s — too short for a {a.min_sec}s window")

    # The floor: how much consecutive frames differ in this clip. Every score
    # below is read against this, never against an absolute threshold.
    step = max(1, total // 200)
    pairs = range(0, total - 1, step)
    floor = sum(mad(frames[k], frames[k + 1]) for k in pairs) / len(pairs)

    print(f"{a.clip}: {total} frames @ {fps:g}fps ({total / fps:.2f}s)")
    print(f"adjacent-frame floor: {floor:.3f}  <- the best any wrap in this clip can do")
    print(f"searching gaps {lo}..{hi} frames ({a.min_sec}..{a.max_sec}s), "
          f"{a.window}-frame window\n")

    W = a.window
    cands = []
    for i in range(0, total - lo - W):
        for gap in range(lo, min(hi, total - i - W) + 1):
            j = i + gap
            score = sum(mad(frames[i + k], frames[j + k]) for k in range(W)) / W
            cands.append((score, i, j, gap))

    if not cands:
        sys.exit("no candidate windows in that duration range")
    cands.sort()

    print(f"{'score':>8} {'vs floor':>9}  {'in':>5} {'out':>5}  {'len':>6}  timecode")
    for score, i, j, gap in cands[:a.top]:
        print(f"{score:8.3f} {score / floor:8.2f}x  {i:5d} {j:5d}  "
              f"{gap / fps:5.2f}s  {i / fps:7.3f}s -> {j / fps:7.3f}s")

    best, i, j, gap = cands[0]
    print(f"\nBest: frames {i}..{j - 1} ({gap / fps:.2f}s), scoring {best / floor:.2f}x the floor.")
    print("At ~1.0x the wrap differs about as much as one ordinary frame step.\n")
    print("Cut it (keeps the docs/design-queue.md encode settings):\n")
    print(f"  ffmpeg -i {a.clip} \\\n"
          f"    -vf \"select=between(n\\,{i}\\,{j - 1}),setpts=PTS-STARTPTS\" \\\n"
          "    -c:v libx264 -profile:v high -pix_fmt yuv420p \\\n"
          "    -crf 23 -maxrate 3500k -bufsize 7000k \\\n"
          "    -g 48 -keyint_min 48 -sc_threshold 0 \\\n"
          "    -an -fps_mode passthrough -movflags +faststart loop.mp4\n")
    print("Then verify the wrap at full resolution, and watch it:\n")
    print("  ffmpeg -v error -i loop.mp4 -vf \"select=eq(n\\,0)\" -vframes 1 -y first.png")
    print("  ffmpeg -v error -sseof -0.05 -i loop.mp4 -vframes 1 -y last.png")
    print("  ffmpeg -i last.png -i first.png -lavfi ssim -f null -   # read against the floor above")
    print("  ffmpeg -v error -stream_loop 3 -i loop.mp4 -c copy -y seam-check.mp4")


if __name__ == "__main__":
    main()
