// ui.js — small shared primitives ported from the CSS classes
// (.ra-card, .ra-btn, .ra-bar) plus typography helpers for the
// display/body font families.

import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './theme';

// Themed <Text> wrappers. `w` = weight; `d` = use the display family.
export function T({ d = false, w, italic, style, color, children, ...rest }) {
  const t = useTheme();
  const weight = w != null ? w : d ? 700 : 400;
  const fontFamily = d ? t.display(weight) : t.body(weight);
  return (
    <Text {...rest} style={[{ fontFamily, color: color || t.colors.ink, fontStyle: italic ? 'italic' : 'normal' }, style]}>
      {children}
    </Text>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ style, children, padded, ...rest }) {
  const t = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: t.colors.surface,
          borderWidth: 1,
          borderColor: t.colors.border,
          borderRadius: t.radius.card,
        },
        t.dark ? null : t.shadow(14, '#5b4a2a', 0.16),
        padded && { padding: 18 },
        style,
      ]}
    >
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
          colors={['#fbbf24', t.colors.accent, t.colors.accentDeep]}
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
          <T d w={700} color="#fff" style={styles.btnLabel}>{label}</T>
        </LinearGradient>
      </Pressable>
    </Animated.View>
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
          colors={['#fbbf24', t.colors.accent]}
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
