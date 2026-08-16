#!/usr/bin/env bash
# scripts/shots.sh — regenerate the whole Play screenshot set in one command.
#
#   npm run shots
#
# Needs: one running emulator/device with a __DEV__ build installed, and
# maestro on PATH. Raw captures land in store/raw/ (gitignored); the finished
# 1080x1920 assets land in store/play/ (committed — they are the deliverable).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# --- 1. preconditions -------------------------------------------------------
if ! command -v adb >/dev/null 2>&1; then
  echo "shots: adb not found on PATH. Install Android platform-tools first." >&2
  exit 1
fi

DEVICES="$(adb devices | awk 'NR>1 && $2=="device" {print $1}')"
COUNT="$(printf '%s\n' "$DEVICES" | grep -c . || true)"
if [ "$COUNT" -ne 1 ]; then
  echo "shots: need exactly one connected device, found $COUNT." >&2
  echo "       adb devices:" >&2
  adb devices >&2
  exit 1
fi

if ! command -v maestro >/dev/null 2>&1; then
  echo "shots: maestro not found on PATH. Install it with:" >&2
  echo '       curl -Ls "https://get.maestro.mobile.dev" | bash' >&2
  exit 1
fi

# maestro is a JVM tool: with no java it dies mid-flow on "Unable to locate a
# Java Runtime", which reads like a maestro bug rather than a missing JDK.
# Check it here, and fall back to a JDK we know is on any machine that can
# build this app rather than failing over a bare PATH.
if ! command -v java >/dev/null 2>&1 && [ -z "${JAVA_HOME:-}" ]; then
  for candidate in \
    "/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
    "/opt/homebrew/opt/openjdk@17"; do
    if [ -x "$candidate/bin/java" ]; then
      export JAVA_HOME="$candidate"
      export PATH="$JAVA_HOME/bin:$PATH"
      echo "shots: no java on PATH, using $JAVA_HOME"
      break
    fi
  done
fi
if ! command -v java >/dev/null 2>&1 && [ ! -x "${JAVA_HOME:-}/bin/java" ]; then
  echo "shots: no Java runtime found — maestro cannot run without one." >&2
  echo "       Install a JDK 17+, or set JAVA_HOME to one." >&2
  exit 1
fi

# --- 2. clean the raw captures ---------------------------------------------
rm -rf store/raw
mkdir -p store/raw

# --- 3. demo-mode status bar (clean clock, full battery, no notifications) --
# Leaving an emulator stuck in demo mode poisons every later walk's
# screenshots, so the exit is a trap — it runs even when maestro fails.
exit_demo() {
  adb shell am broadcast -a com.android.systemui.demo -e command exit >/dev/null 2>&1 || true
}
trap exit_demo EXIT

adb shell settings put global sysui_demo_allowed 1
adb shell am broadcast -a com.android.systemui.demo -e command enter
adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 1200
adb shell am broadcast -a com.android.systemui.demo -e command battery -e level 100 -e plugged false
adb shell am broadcast -a com.android.systemui.demo -e command network -e wifi show -e level 4
adb shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false

# --- 4. capture -------------------------------------------------------------
# maestro writes takeScreenshot paths into its own run-artifacts directory, not
# the working directory, so the flow's "store/raw/..." paths actually land in
# <artifacts>/takeScreenshot/store/raw/. Pin that directory with
# --test-output-dir and move the captures back into the repo ourselves, rather
# than trusting a CWD-relative behaviour that is not what this version does.
MAESTRO_OUT="$ROOT/store/.maestro-out"
rm -rf "$MAESTRO_OUT"
maestro test --test-output-dir "$MAESTRO_OUT" .maestro/store-shots.yaml

# maestro still nests a timestamp/flow-name pair under the output dir, and that
# layout is its business, not ours — locate the capture directory rather than
# hardcoding the nesting.
CAPTURED="$(find "$MAESTRO_OUT" -type d -path '*/takeScreenshot/store/raw' 2>/dev/null | head -1)"
if [ -n "$CAPTURED" ]; then
  mv "$CAPTURED"/*.png store/raw/
fi

# A step can report COMPLETED and still leave the set short (or capture the
# wrong window entirely), so the count is checked rather than assumed.
SHOTS="$(ls store/raw/*.png 2>/dev/null | wc -l | tr -d ' ')"
if [ "$SHOTS" -ne 7 ]; then
  echo "shots: expected 7 raw captures, found $SHOTS in store/raw/." >&2
  echo "       maestro artifacts kept at $MAESTRO_OUT" >&2
  exit 1
fi

# --- 5. demo mode off (also handled by the trap) ---------------------------
exit_demo
trap - EXIT

# --- 6. compose -------------------------------------------------------------
node scripts/shots.js
