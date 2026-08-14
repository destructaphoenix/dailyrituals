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
maestro test .maestro/store-shots.yaml

# --- 5. demo mode off (also handled by the trap) ---------------------------
exit_demo
trap - EXIT

# --- 6. compose -------------------------------------------------------------
node scripts/shots.js
