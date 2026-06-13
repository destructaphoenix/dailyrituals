// art.js — the decorative hero/celebration artwork, ported from rituals-bits.jsx.
// SVG geometry is unchanged; the CSS keyframe animations (spin, breathe,
// twinkle, confetti) are re-expressed with the RN Animated API.

import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Easing, View, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Line, G, Defs, RadialGradient, Stop, ClipPath, Path } from 'react-native-svg';
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
    <View pointerEvents="none" style={{ position: 'absolute', top: -70, left: 0, right: 0, height: size, alignItems: 'center' }}>
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

// ── Night-v2 hero: rich ember glow — hot-core flicker + coal bed + rising embers ──
// Round 2 (IMP-019): layered bloom, elliptical coal bed, 16 glowing SVG particles.
// Focal point y≈80px from card top (matches IMP-003). NightSky kept intact.

// 3 hero embers (near-white cores) + 13 standard embers = 16 total (perf cap).
// x/y in 300×300 canvas coords; r = core radius; haloR = visible glow radius.
const EMBER_PARTICLES = [
  { x: 150, y: 178, r: 3.2, haloR: 18, riseH: 105, swayW: 16, swayDur: 1200, dur: 2800, delay: 0,    coreColor: '#fff7ea', outerColor: '#fde68a' },
  { x: 142, y: 172, r: 2.8, haloR: 15, riseH: 90,  swayW: 13, swayDur: 1100, dur: 3200, delay: 700,  coreColor: '#fff7ea', outerColor: '#fbbf24' },
  { x: 159, y: 175, r: 2.4, haloR: 14, riseH: 82,  swayW: 10, swayDur: 1400, dur: 3600, delay: 1400, coreColor: '#fff7ea', outerColor: '#fde68a' },
  { x: 135, y: 170, r: 1.8, haloR: 11, riseH: 72,  swayW: 14, swayDur: 1000, dur: 4200, delay: 350,  coreColor: '#fde68a', outerColor: '#f59e0b' },
  { x: 165, y: 173, r: 2.0, haloR: 12, riseH: 85,  swayW: 9,  swayDur: 1300, dur: 3700, delay: 1050, coreColor: '#fbbf24', outerColor: '#f59e0b' },
  { x: 145, y: 182, r: 1.5, haloR: 10, riseH: 65,  swayW: 18, swayDur: 900,  dur: 3400, delay: 1800, coreColor: '#f59e0b', outerColor: '#fde68a' },
  { x: 160, y: 179, r: 1.2, haloR: 9,  riseH: 70,  swayW: 11, swayDur: 1100, dur: 4600, delay: 550,  coreColor: '#fde68a', outerColor: '#fbbf24' },
  { x: 140, y: 176, r: 2.2, haloR: 13, riseH: 95,  swayW: 7,  swayDur: 1500, dur: 3100, delay: 2200, coreColor: '#fbbf24', outerColor: '#f59e0b' },
  { x: 170, y: 168, r: 1.6, haloR: 10, riseH: 62,  swayW: 15, swayDur: 1200, dur: 4000, delay: 1100, coreColor: '#fde68a', outerColor: '#f59e0b' },
  { x: 130, y: 174, r: 1.4, haloR: 9,  riseH: 75,  swayW: 12, swayDur: 800,  dur: 3900, delay: 1650, coreColor: '#f59e0b', outerColor: '#fbbf24' },
  { x: 155, y: 185, r: 1.9, haloR: 11, riseH: 88,  swayW: 6,  swayDur: 1350, dur: 2900, delay: 2800, coreColor: '#fbbf24', outerColor: '#fde68a' },
  { x: 147, y: 177, r: 1.3, haloR: 9,  riseH: 62,  swayW: 19, swayDur: 950,  dur: 4300, delay: 450,  coreColor: '#fde68a', outerColor: '#f59e0b' },
  { x: 163, y: 183, r: 1.1, haloR: 8,  riseH: 68,  swayW: 8,  swayDur: 1100, dur: 3800, delay: 2000, coreColor: '#fbbf24', outerColor: '#fde68a' },
  { x: 138, y: 186, r: 2.1, haloR: 12, riseH: 100, swayW: 14, swayDur: 1250, dur: 3000, delay: 3200, coreColor: '#f59e0b', outerColor: '#fbbf24' },
  { x: 153, y: 170, r: 1.7, haloR: 10, riseH: 78,  swayW: 10, swayDur: 1150, dur: 4100, delay: 300,  coreColor: '#fde68a', outerColor: '#f59e0b' },
  { x: 143, y: 180, r: 1.0, haloR: 8,  riseH: 67,  swayW: 9,  swayDur: 1000, dur: 3500, delay: 1300, coreColor: '#fbbf24', outerColor: '#fde68a' },
];

function EmberParticle({ x, y, haloR, riseH, swayW, swayDur, dur, delay, coreColor, outerColor, canvasSize, index }) {
  const riseV = useRef(new Animated.Value(0)).current;
  const swayV = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // One-time stagger delay, then perpetual rise cycle.
    // Opacity is 0 at riseV=0 and riseV=1, so the 1ms reset is invisible.
    const riseAnim = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.sequence([
          Animated.timing(riseV, { toValue: 1, duration: dur, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(riseV, { toValue: 0, duration: 1, useNativeDriver: true }),
        ])
      ),
    ]);
    // Gentle sine-like sway: 0 → 1 → -1 → 0
    const swayAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(swayV, { toValue: 1,  duration: swayDur,      easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(swayV, { toValue: -1, duration: swayDur * 2,  easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(swayV, { toValue: 0,  duration: swayDur,      easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    riseAnim.start();
    swayAnim.start();
    return () => { riseAnim.stop(); swayAnim.stop(); };
  }, [riseV, swayV, dur, delay, swayDur]);

  const sc = canvasSize / 300;
  const sz = haloR * 2;
  const id = `emb${index}`;

  const opacity    = riseV.interpolate({ inputRange: [0, 0.10, 0.78, 1], outputRange: [0, 0.92, 0.80, 0], extrapolate: 'clamp' });
  const translateY = riseV.interpolate({ inputRange: [0, 1], outputRange: [0, -(riseH * sc)], extrapolate: 'clamp' });
  const translateX = swayV.interpolate({ inputRange: [-1, 0, 1], outputRange: [-(swayW * sc), 0, swayW * sc], extrapolate: 'clamp' });

  return (
    <AView style={{ position: 'absolute', left: x * sc - haloR, top: y * sc - haloR, width: sz, height: sz, opacity, transform: [{ translateX }, { translateY }] }}>
      <Svg width={sz} height={sz}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor={coreColor}  stopOpacity="0.95" />
            <Stop offset="35%"  stopColor={outerColor} stopOpacity="0.60" />
            <Stop offset="100%" stopColor={outerColor} stopOpacity="0"    />
          </RadialGradient>
        </Defs>
        <Circle cx={haloR} cy={haloR} r={haloR} fill={`url(#${id})`} />
      </Svg>
    </AView>
  );
}

export function EmberGlow({ size = 300 }) {
  const breatheA = useRef(new Animated.Value(0)).current;   // outer bloom
  const breatheB = useRef(new Animated.Value(0.5)).current; // hot core — starts phase-offset
  const coalV    = useRef(new Animated.Value(0)).current;   // coal-bed flicker

  useEffect(() => {
    const animA = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheA, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(breatheA, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    const animB = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheB, { toValue: 1, duration: 3300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(breatheB, { toValue: 0, duration: 3300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    const animCoal = Animated.loop(
      Animated.sequence([
        Animated.timing(coalV, { toValue: 1, duration: 4500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(coalV, { toValue: 0, duration: 4500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    animA.start(); animB.start(); animCoal.start();
    return () => { animA.stop(); animB.stop(); animCoal.stop(); };
  }, [breatheA, breatheB, coalV]);

  const outerScale   = breatheA.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1.0]  });
  const outerOpacity = breatheA.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.48] });
  const coreScale    = breatheB.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.0]  });
  const coreOpacity  = breatheB.interpolate({ inputRange: [0, 1], outputRange: [0.62, 0.85] });
  const coalOpacity  = coalV.interpolate(   { inputRange: [0, 1], outputRange: [0.32, 0.52] });

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: -70, left: 0, right: 0, height: size, alignItems: 'center' }}>
      <View style={{ width: size, height: size }}>

        {/* Outer ambient bloom — large, amber, breathe A */}
        <AView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: outerOpacity, transform: [{ scale: outerScale }] }}>
          <Svg width={size} height={size} viewBox="0 0 300 300" fill="none">
            <Defs>
              <RadialGradient id="embOuter" cx="50%" cy="50%" r="50%">
                <Stop offset="0%"   stopColor="#f59e0b" stopOpacity="0.65" />
                <Stop offset="45%"  stopColor="#f59e0b" stopOpacity="0.25" />
                <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0"    />
              </RadialGradient>
            </Defs>
            <Circle cx={150} cy={150} r={135} fill="url(#embOuter)" />
          </Svg>
        </AView>

        {/* Hot core — tight, white→amber gradient, breathe B (out of phase with outer) */}
        <AView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: coreOpacity, transform: [{ scale: coreScale }] }}>
          <Svg width={size} height={size} viewBox="0 0 300 300" fill="none">
            <Defs>
              <RadialGradient id="embCore" cx="50%" cy="50%" r="50%">
                <Stop offset="0%"   stopColor="#fff7ea" stopOpacity="0.95" />
                <Stop offset="20%"  stopColor="#fde68a" stopOpacity="0.70" />
                <Stop offset="55%"  stopColor="#f59e0b" stopOpacity="0.30" />
                <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0"    />
              </RadialGradient>
            </Defs>
            <Circle cx={150} cy={150} r={55} fill="url(#embCore)" />
          </Svg>
        </AView>

        {/* Coal bed — wide elliptical amber pool at the base of the hero */}
        <AView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: coalOpacity }}>
          <Svg width={size} height={size} viewBox="0 0 300 300" fill="none">
            <Defs>
              <RadialGradient id="embCoal" cx="50%" cy="50%" r="50%">
                <Stop offset="0%"   stopColor="#f59e0b" stopOpacity="0.80" />
                <Stop offset="55%"  stopColor="#fbbf24" stopOpacity="0.28" />
                <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0"    />
              </RadialGradient>
            </Defs>
            <Ellipse cx={150} cy={185} rx={110} ry={40} fill="url(#embCoal)" />
          </Svg>
        </AView>

        {/* 16 glowing ember particles — staggered, rising, swaying */}
        {EMBER_PARTICLES.map((p, i) => (
          <EmberParticle key={i} {...p} canvasSize={size} index={i} />
        ))}

      </View>
    </View>
  );
}

// ── Night-v2 hero: refined crescent accent + a few gentle embers (IMP-019 Round 3) ──
// Thin luminous crescent in upper-right + ~6 sparse rising embers.
// Crescent is built from a lit disc (gradient) + an occluding disc in AMOLED
// black — the "carve" approach; zero path math, pixel-perfect on pure black.
// Number glow + card sheen are applied by HomeScreen/ui.js via DARK_THEME flag.
const CRESCENT_EMBERS = [
  { x: 148, y: 175, r: 2.2, haloR: 13, riseH: 92,  swayW: 12, swayDur: 1200, dur: 3400, delay: 0,    coreColor: '#fff7ea', outerColor: '#fde68a' },
  { x: 158, y: 178, r: 1.8, haloR: 11, riseH: 78,  swayW: 9,  swayDur: 1350, dur: 3800, delay: 900,  coreColor: '#fde68a', outerColor: '#f59e0b' },
  { x: 141, y: 172, r: 1.5, haloR: 10, riseH: 68,  swayW: 14, swayDur: 1000, dur: 4200, delay: 1700, coreColor: '#fbbf24', outerColor: '#f59e0b' },
  { x: 165, y: 174, r: 1.2, haloR: 8,  riseH: 85,  swayW: 8,  swayDur: 1500, dur: 3600, delay: 2400, coreColor: '#fde68a', outerColor: '#fbbf24' },
  { x: 152, y: 181, r: 1.9, haloR: 12, riseH: 100, swayW: 11, swayDur: 1100, dur: 3100, delay: 600,  coreColor: '#fff7ea', outerColor: '#fde68a' },
  { x: 136, y: 177, r: 1.4, haloR: 9,  riseH: 72,  swayW: 16, swayDur: 900,  dur: 4600, delay: 3100, coreColor: '#fbbf24', outerColor: '#f59e0b' },
];

export function NightCrescent({ size = 300 }) {
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 4200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 4200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [breathe]);

  const haloOpacity    = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.32] });
  const crescentOpacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.80, 0.97] });

  // Crescent geometry (300×300 canvas coords, top:-70 so card y≈40 = canvas y≈110).
  // Main lit disc at upper-right; occluding disc in AMOLED black carves the crescent.
  // Distance ≈ 56px → crescent thickness at equator ≈ 18px (thin, elegant).
  const cx = 228, cy = 112, rMain = 38;
  const cxOcc = 284, cyOcc = 108, rOcc = 36;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: -70, left: 0, right: 0, height: size, alignItems: 'center' }}>
      <View style={{ width: size, height: size }}>

        {/* Soft ambient halo — amber bloom behind the crescent */}
        <AView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: haloOpacity }}>
          <Svg width={size} height={size} viewBox="0 0 300 300" fill="none">
            <Defs>
              <RadialGradient id="crescHalo" cx="50%" cy="50%" r="50%">
                <Stop offset="0%"   stopColor="#f59e0b" stopOpacity="0.90" />
                <Stop offset="48%"  stopColor="#f59e0b" stopOpacity="0.28" />
                <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0"    />
              </RadialGradient>
            </Defs>
            <Circle cx={cx} cy={cy} r={rMain + 30} fill="url(#crescHalo)" />
          </Svg>
        </AView>

        {/* Luminous crescent: gradient lit disc + occluding disc in pure AMOLED black */}
        <AView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: crescentOpacity }}>
          <Svg width={size} height={size} viewBox="0 0 300 300" fill="none">
            <Defs>
              {/* Gradient: pale-gold lit inner edge → warm amber at outer curve */}
              <RadialGradient id="crescGrad" cx="22%" cy="28%" r="85%">
                <Stop offset="0%"   stopColor="#fff7ea" stopOpacity="1.0"  />
                <Stop offset="28%"  stopColor="#fde68a" stopOpacity="0.95" />
                <Stop offset="68%"  stopColor="#f59e0b" stopOpacity="0.75" />
                <Stop offset="100%" stopColor="#d97706" stopOpacity="0.45" />
              </RadialGradient>
            </Defs>
            <Circle cx={cx}    cy={cy}    r={rMain} fill="url(#crescGrad)" />
            <Circle cx={cxOcc} cy={cyOcc} r={rOcc}  fill="#000000" />
          </Svg>
        </AView>

        {/* ~6 sparse embers drifting upward — supporting accent, not the show */}
        {CRESCENT_EMBERS.map((p, i) => (
          <EmberParticle key={i} {...p} canvasSize={size} index={i} />
        ))}

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

