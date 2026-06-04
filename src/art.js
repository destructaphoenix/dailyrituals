// art.js — the decorative hero/celebration artwork, ported from rituals-bits.jsx.
// SVG geometry is unchanged; the CSS keyframe animations (spin, breathe,
// twinkle, confetti) are re-expressed with the RN Animated API.

import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Line, G, Defs, RadialGradient, Stop, ClipPath, Path } from 'react-native-svg';
import { useTheme } from './theme';

const AView = Animated.View;

// ── Faint rotating ray fan behind the day hero number ────────────────────────
export function RayFan({ size = 300 }) {
  const t = useTheme();
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 60000, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const c = size / 2;
  const rays = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    rays.push(
      <Line key={i} x1={c} y1={c} x2={c + Math.cos(a) * c} y2={c + Math.sin(a) * c}
        stroke={t.colors.accent} strokeWidth={2} strokeLinecap="round" />
    );
  }
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: -70, left: 0, right: 0, height: size, alignItems: 'center', opacity: 0.5 }}>
      <AView style={{ width: size, height: size, transform: [{ rotate }] }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">{rays}</Svg>
      </AView>
    </View>
  );
}

// ── Night hero: glowing cheese-hole moon + twinkling stars ───────────────────
export function NightSky({ size = 300 }) {
  const t = useTheme();
  const breathe = useRef(new Animated.Value(0)).current;
  const twinkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 3500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 3500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    const b = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(twinkle, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    a.start(); b.start();
    return () => { a.stop(); b.stop(); };
  }, [breathe, twinkle]);

  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const moonOpacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });
  const starOpacity = twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });

  const stars = [
    [56, 64, 1.5], [244, 72, 1.6], [274, 150, 1.3], [30, 150, 1.2],
    [232, 226, 1.4], [70, 230, 1.2], [150, 268, 1.1], [284, 40, 1.0],
    [18, 96, 1.0], [150, 22, 1.2], [262, 200, 1.1], [40, 210, 1.0],
  ];
  // [cx, cy, r] — the recessed "cheese" craters
  const holes = [[122, 128, 11], [180, 122, 7], [186, 172, 8], [128, 182, 12], [108, 158, 5]];

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: -90, left: 0, right: 0, height: size, alignItems: 'center' }}>
      <View style={{ width: size, height: size }}>
        {/* breathing moon body */}
        <AView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: moonOpacity, transform: [{ scale }] }}>
          <Svg width={size} height={size} viewBox="0 0 300 300" fill="none">
            <Defs>
              <ClipPath id="moonClip"><Circle cx="150" cy="150" r="64" /></ClipPath>
              <RadialGradient id="moonHaze" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="rgba(245,158,11,0.32)" />
                <Stop offset="100%" stopColor="rgba(245,158,11,0)" />
              </RadialGradient>
              <RadialGradient id="moonDisc" cx="38%" cy="32%" r="82%">
                <Stop offset="0%" stopColor="#fffaf2" />
                <Stop offset="58%" stopColor="#f6ecd6" />
                <Stop offset="100%" stopColor="#e6d3a4" />
              </RadialGradient>
              <RadialGradient id="moonHole" cx="36%" cy="30%" r="84%">
                <Stop offset="0%" stopColor="#bda06a" />
                <Stop offset="50%" stopColor="#d4ba84" />
                <Stop offset="100%" stopColor="#ecd9ac" />
              </RadialGradient>
            </Defs>
            <Circle cx="150" cy="150" r="92" fill="url(#moonHaze)" />
            <G clipPath="url(#moonClip)">
              <Circle cx="150" cy="150" r="64" fill="url(#moonDisc)" />
              {holes.map(([cx, cy, r], i) => (
                <G key={i}>
                  <Circle cx={cx + r * 0.14} cy={cy + r * 0.16} r={r} fill="#fffaf0" fillOpacity={0.5} />
                  <Circle cx={cx} cy={cy} r={r} fill="url(#moonHole)" fillOpacity={0.78} />
                </G>
              ))}
            </G>
            <Circle cx="150" cy="150" r="64" fill="none" stroke="#f5e6c0" strokeOpacity={0.5} strokeWidth={1.6} />
          </Svg>
        </AView>
        {/* twinkling stars */}
        <AView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: starOpacity }}>
          <Svg width={size} height={size} viewBox="0 0 300 300" fill="none">
            {stars.map(([x, y, r], i) => (
              <Circle key={i} cx={x} cy={y} r={r} fill={t.colors.accent} />
            ))}
          </Svg>
        </AView>
      </View>
    </View>
  );
}

// ── Big radiant sun (celebration, day) ───────────────────────────────────────
export function BigSun({ size = 132 }) {
  const t = useTheme();
  const c = size / 2;
  const rays = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r1 = size * 0.34, r2 = size * 0.47;
    rays.push(
      <Line key={i} x1={c + Math.cos(a) * r1} y1={c + Math.sin(a) * r1}
        x2={c + Math.cos(a) * r2} y2={c + Math.sin(a) * r2}
        stroke={t.colors.accent} strokeWidth={size * 0.028} strokeLinecap="round" opacity={0.9} />
    );
  }
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <Defs>
        <RadialGradient id="bigSunG" cx="38%" cy="32%" r="75%">
          <Stop offset="0%" stopColor="#fde68a" />
          <Stop offset="100%" stopColor="#f59e0b" />
        </RadialGradient>
      </Defs>
      {rays}
      <Circle cx={c} cy={c} r={size * 0.25} fill="url(#bigSunG)" />
    </Svg>
  );
}

// ── Big crescent moon (celebration, night) ───────────────────────────────────
export function BigMoon({ size = 132 }) {
  const t = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <RadialGradient id="bigMoonG" cx="36%" cy="30%" r="80%">
          <Stop offset="0%" stopColor="#fde68a" />
          <Stop offset="100%" stopColor="#f59e0b" />
        </RadialGradient>
      </Defs>
      <Circle cx="4.2" cy="5" r="0.7" fill={t.colors.accent} />
      <Circle cx="20" cy="7.5" r="0.5" fill={t.colors.accentDeep} />
      <Circle cx="17.5" cy="3.2" r="0.42" fill={t.colors.accent} />
      <Circle cx="6.5" cy="19.5" r="0.5" fill={t.colors.accentDeep} />
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="url(#bigMoonG)" />
    </Svg>
  );
}

// ── Confetti burst (celebration) ─────────────────────────────────────────────
export function Confetti() {
  const COLORS = ['#f59e0b', '#fbbf24', '#fde68a', '#22c55e', '#d97706'];
  const bits = useMemo(() => (
    Array.from({ length: 28 }, (_, i) => {
      const ang = (Math.random() * Math.PI) - Math.PI; // upward-ish spread
      const dist = 120 + Math.random() * 200;
      return {
        tx: Math.cos(ang) * dist + (Math.random() - 0.5) * 80,
        ty: Math.sin(ang) * dist - 40,
        rot: Math.random() * 720 - 360,
        c: COLORS[i % COLORS.length],
        delay: Math.random() * 120,
        round: Math.random() > 0.5,
      };
    })
  ), []);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {bits.map((b, i) => <Bit key={i} {...b} />)}
    </View>
  );
}

function Bit({ tx, ty, rot, c, delay, round }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(p, { toValue: 1, duration: 1400, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [p, delay]);
  return (
    <Animated.View
      style={{
        position: 'absolute', top: '42%', left: '50%', width: 10, height: 10,
        backgroundColor: c, borderRadius: round ? 5 : 2,
        opacity: p.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }),
        transform: [
          { translateX: p.interpolate({ inputRange: [0, 1], outputRange: [0, tx] }) },
          { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, ty] }) },
          { rotate: p.interpolate({ inputRange: [0, 1], outputRange: ['0deg', rot + 'deg'] }) },
        ],
      }}
    />
  );
}

