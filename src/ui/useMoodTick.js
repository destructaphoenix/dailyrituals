// ui/useMoodTick.js — the shared clock behind a multi-mood heatmap cell's
// shimmer (IMP-050). Ticks only while the screen is actually visible and
// reduce-motion is off; otherwise it holds still at `seed`, never 0, so a
// backgrounded/reduced-motion cell still shows a day-varying face instead of
// collapsing to "first mood tapped, forever".

import { useEffect, useState } from 'react';
import { AppState, AccessibilityInfo } from 'react-native';

const TICK_MS = 2500;

export function useMoodTick({ enabled, seed = 0 } = {}) {
  const [tick, setTick] = useState(seed);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setTick(seed);
  }, [seed]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setAppActive(s === 'active'));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (live) setReduceMotion(v); });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => setReduceMotion(v));
    return () => { live = false; sub.remove(); };
  }, []);

  const ticking = enabled && appActive && !reduceMotion;

  useEffect(() => {
    if (!ticking) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [ticking]);

  return ticking ? tick : seed;
}
