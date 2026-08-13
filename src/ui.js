// ui.js — small shared primitives ported from the CSS classes
// (.ra-card, .ra-btn, .ra-bar) plus typography helpers for the
// display/body font families.

import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, DARK_THEME } from './theme';
import { MAX_FONT_SCALE } from './ui/textScale';

// Themed <Text> wrappers. `w` = weight; `d` = use the display family.
export function T({ d = false, w, italic, style, color, maxFontSizeMultiplier = MAX_FONT_SCALE, children, ...rest }) {
  const t = useTheme();
  const weight = w != null ? w : d ? 700 : 400;
  const fontFamily = d ? t.display(weight) : t.body(weight);
  return (
    <Text {...rest} maxFontSizeMultiplier={maxFontSizeMultiplier} style={[{ fontFamily, color: color || t.colors.ink, fontStyle: italic ? 'italic' : 'normal' }, style]}>
      {children}
    </Text>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
// The night-v2 card's top sheen. The ramp is a FIXED dp height rather than a
// fraction of the card, because its alpha range is tiny: 6% → 0% is only ~15 of
// 255 alpha steps. Stretched over half a tall card (the old `absoluteFill` +
// `end.y: 0.5`) that is ~10dp per step, which Android's hardware draw path
// renders as visible horizontal bands — and every card banded differently
// because every card is a different height. It only ever looked smooth because
// the SDK-51 draw path dithered it for us; SDK 54 / RN 0.81 does not. A short
// fixed ramp puts each step at ~3dp, so it reads as one crisp highlight,
// identically on every card. (IMP-027)
export const CARD_SHEEN = {
  height: 48,
  colors: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0)'],
  start: { x: 0.5, y: 0 },
  end: { x: 0.5, y: 1 },
};

export function Card({ style, children, padded, ...rest }) {
  const t = useTheme();
  const isNightV2 = t.dark && DARK_THEME === 'v2';
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: t.colors.surface,
          borderWidth: 1,
          borderColor: t.colors.border,
          borderRadius: t.radius.card,
          // overflow:hidden lets the sheen gradient respect the card radius; safe in
          // dark mode because t.shadow() returns null there (no Android elevation to lose).
          overflow: isNightV2 ? 'hidden' : undefined,
        },
        t.dark ? null : t.shadow(14, t.colors.shadowColor, 0.16),
        padded && { padding: 18 },
        style,
      ]}
    >
      {isNightV2 && (
        <LinearGradient
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          dither
          colors={CARD_SHEEN.colors}
          start={CARD_SHEEN.start}
          end={CARD_SHEEN.end}
          // Top strip only — see CARD_SHEEN. The parent's overflow:hidden clips
          // this to the card's rounded corners.
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: CARD_SHEEN.height }}
        />
      )}
      {children}
    </View>
  );
}

// ── Primary button ───────────────────────────────────────────────────────────
export function PrimaryButton({ label, onPress, disabled, icon, style }) {
  const t = useTheme();
  const press = useRef(new Animated.Value(0)).current;
  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.99] });
  const to = (v) => Animated.spring(press, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 0 }).start();

  return (
    <Animated.View style={[{ width: '100%', transform: [{ scale }], opacity: disabled ? 0.4 : 1 }, style]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={() => to(1)}
        onPressOut={() => to(0)}
        disabled={disabled}
      >
        <LinearGradient
          colors={[t.colors.accentBright, t.colors.accent, t.colors.accentDeep]}
          locations={[0, 0.55, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[
            styles.btn,
            { borderRadius: t.radius.btn },
            !disabled && t.shadow(12, t.colors.accentDeep, 0.6),
          ]}
        >
          {icon}
          <T d w={700} color={t.colors.onAccent} style={styles.btnLabel}>{label}</T>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// ── Ghost button ─────────────────────────────────────────────────────────────
// Secondary action for scrim sheets (RestoreNotice, RestoreOffer) — outlined,
// no fill, sits below a PrimaryButton.
export function GhostButton({ label, onPress }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({
      width: '100%', paddingVertical: 16, borderRadius: 18, borderWidth: 1.5, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1,
    })}>
      <T d w={700} color={c.accentDeep} style={{ fontSize: 16 }}>{label}</T>
    </Pressable>
  );
}

// ── XP / progress bar with shimmer ───────────────────────────────────────────
export function ProgressBar({ value }) {
  const t = useTheme();
  const w = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(w, { toValue: value, duration: 900, useNativeDriver: false }).start();
  }, [value, w]);
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.delay(5000),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const width = w.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'], extrapolate: 'clamp' });
  const tx = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-80, 320] });

  return (
    <View style={[styles.bar, { backgroundColor: t.colors.accentSoft }]}>
      <Animated.View style={{ width, height: '100%' }}>
        <LinearGradient
          colors={[t.colors.accentBright, t.colors.accent]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ flex: 1, borderRadius: 999, overflow: 'hidden' }}
        >
          <Animated.View
            style={{
              position: 'absolute', top: 0, bottom: 0, width: 80,
              transform: [{ translateX: tx }, { skewX: '-15deg' }],
            }}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.42)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnLabel: { fontSize: 17 },
  bar: { height: 12, borderRadius: 999, overflow: 'hidden' },
});
