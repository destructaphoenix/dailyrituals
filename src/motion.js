// motion.js — the app's motion vocabulary (IMP-077).
//
// This file adds no animation to any screen. It is the shared language that later
// per-screen IMPs and every Claude Design spec get written in, so that "the card
// rises in" means one thing everywhere instead of a fresh spring per author.
//
// The feel is not invented here — it is generalized from Celebration.js, which is
// the house motion: a spring pop into an Animated.stagger(150, …) over scale and
// opacity. DUR, EASE.pop and popIn all trace back to it.
//
// PURITY (mechanical, and asserted by __tests__/motion.test.js): this module holds
// no state of its own and imports nothing from persistence/, billing/, gamify.js or
// insights/. Motion never reaches for data. That is the "no backend rewiring"
// constraint made checkable rather than remembered.
//
// COEXISTENCE IS THE DESIGN, NOT A COMPROMISE. art.js (RayFan, NightRays — the
// signature), Celebration.js and Toast.js all stay on the RN `Animated` API. New
// motion is written here; working choreography is left alone; the two run side by
// side. Do not port them.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Easing } from 'react-native-reanimated';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  cancelAnimation,
} from 'react-native-reanimated';

// ── Durations ────────────────────────────────────────────────────────────────
// Four speeds, named for what they are FOR, not how long they last. Reach for the
// name; if none of them fits, the interaction is probably the odd one out.
export const DUR = {
  tap: 120,       // press feedback — must feel instant
  enter: 320,     // something arriving: a screen, a card, a row
  settle: 480,    // something resolving into place after a change
  celebrate: 900, // the reward moment, the only place this long is earned
};

// ── Curves ───────────────────────────────────────────────────────────────────
// `pop` is Celebration's spring (friction 5 / tension 80) restated in Reanimated's
// damping/stiffness terms, so the signature reward motion survives the move.
export const EASE = {
  standard: Easing.bezier(0.2, 0, 0, 1),   // the default for anything entering
  out: Easing.out(Easing.cubic),           // for things leaving
  inOut: Easing.inOut(Easing.quad),        // for reversible, back-and-forth changes
  pop: { damping: 10, stiffness: 180, mass: 1 }, // a spring config, not a curve
};

// ── Entrances ────────────────────────────────────────────────────────────────

// The default entrance for cards and rows: fade up over 12dp.
export function riseIn(delay = 0) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration: DUR.enter, easing: EASE.standard }));
    return () => cancelAnimation(p);
  }, [p, delay]);
  return useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: 12 * (1 - p.value) }],
  }));
}

// Rewards, badges, orbs — anything that should feel like it landed rather than
// arrived. Celebration's pop, generalized.
export function popIn(delay = 0) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withSpring(1, EASE.pop));
    return () => cancelAnimation(p);
  }, [p, delay]);
  return useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ scale: 0.85 + 0.15 * p.value }],
  }));
}

// Dismissals. Plain opacity on purpose: a thing going away should not also move.
export function fadeOut(active = true, duration = DUR.tap) {
  const p = useSharedValue(1);
  useEffect(() => {
    p.value = withTiming(active ? 0 : 1, { duration, easing: EASE.out });
    return () => cancelAnimation(p);
  }, [p, active, duration]);
  return useAnimatedStyle(() => ({ opacity: p.value }));
}

// The delay for list index `i`. Keep `step` small — a long list staggered at 150ms
// finishes after the user has already read it.
export function stagger(i, step = 60) {
  return i * step;
}

// ── Interaction ──────────────────────────────────────────────────────────────

// Shared press feedback. The 0.99 scale is deliberately barely visible: it reads as
// the surface yielding, not as the button shrinking.
export function usePressScale(scale = 0.99) {
  const p = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: 1 - (1 - scale) * p.value }] }));
  const onPressIn = useCallback(() => { p.value = withTiming(1, { duration: DUR.tap, easing: EASE.standard }); }, [p]);
  const onPressOut = useCallback(() => { p.value = withTiming(0, { duration: DUR.tap, easing: EASE.out }); }, [p]);
  return { style, onPressIn, onPressOut };
}

// Animates a number toward `value` — for XP, streaks, insight figures. Returns the
// current number in React state rather than an animated prop, so callers can format
// it (commas, suffixes) with ordinary JS.
export function useCountUp(value, duration = DUR.settle) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);
  const start = useRef(0);
  const frame = useRef(null);

  useEffect(() => {
    if (from.current === value) return undefined;
    const begin = from.current;
    start.current = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start.current) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic, matching EASE.out
      setDisplay(Math.round(begin + (value - begin) * eased));
      if (t < 1) frame.current = requestAnimationFrame(tick);
      else from.current = value;
    };
    frame.current = requestAnimationFrame(tick);
    return () => { if (frame.current) cancelAnimationFrame(frame.current); };
  }, [value, duration]);

  return display;
}

// ── Screens ──────────────────────────────────────────────────────────────────

// Wraps the screen container. `tabKey` is the remount key: when the active tab
// changes the animation restarts, which is what makes the swap read as a transition
// instead of an instant substitution. This is presentation only — no routing
// change, no state change, no navigation library. The Modal sheets keep
// animationType="slide"; OS modal presentation is correct for them.
export function ScreenFade({ tabKey, style, children }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = 0;
    p.value = withTiming(1, { duration: DUR.enter, easing: EASE.standard });
    return () => cancelAnimation(p);
  }, [p, tabKey]);
  const anim = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: 8 * (1 - p.value) }],
  }));
  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}
