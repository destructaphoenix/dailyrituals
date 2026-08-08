// theme.js — design tokens ported from rituals.css.
// In the web prototype these lived as CSS custom properties on `.ra-root`,
// re-themed per device and live-updated by the Tweaks panel. Here they become
// a plain object built by makeTheme(mode, settings) and shared via context.

import React from 'react';
import { Platform } from 'react-native';

// 'v2' = premium AMOLED dark (IMP-019); 'classic' = original night palette.
// Revert: change to 'classic' and ship OTA — no other change needed.
export const DARK_THEME = 'v2';

// ── Palettes ────────────────────────────────────────────────────────────────
export const PALETTES = {
  day: {
    cream: '#f9f7f4',
    surface: '#ffffff',
    ink: '#292524',
    muted: '#6f6a78',
    border: '#e8e3da',
    dot: '#f1ece4',
    accent: '#f59e0b',
    accentDeep: '#d97706',
    accentSoft: '#fef3c7',
    green: '#22c55e',
    greenSoft: '#dcfce7',
    red: '#ef4444',
    // heatmap levels
    heat0: '#f1ece4', heat1: '#fde9bf', heat2: '#fcd577', heat3: '#f59e0b',
    placeholder: '#c3bcb0',
    navBg: 'rgba(255,255,255,0.92)',
  },
  night: {
    // Classic dark — preserved byte-for-byte so DARK_THEME='classic' is a safe revert.
    cream: '#000000',
    surface: '#16120d',
    ink: '#f4eee4',
    muted: '#9b9286',
    border: '#2c261f',
    dot: '#1c1710',
    // night fixes the accent regardless of the Tweaks accent choice (matches CSS)
    accent: '#f59e0b',
    accentDeep: '#fbbf24',
    accentSoft: '#2a2113',
    green: '#34d399',
    greenSoft: '#14271a',
    red: '#ef4444',
    heat0: '#2a2113', heat1: '#4a3414', heat2: '#936412', heat3: '#f59e0b',
    placeholder: '#5c544c',
    navBg: 'rgba(0,0,0,0.72)',
  },
  nightV2: {
    // Premium AMOLED dark (IMP-019): true-black canvas, neutral near-black cards,
    // amber-only accents. No brown. Depth via surface contrast + hairline borders.
    cream: '#000000',       // pure AMOLED black
    surface: '#0e0e10',     // near-black elevated card (neutraler than classic #16120d)
    ink: '#f4eee4',         // keep
    muted: '#8b857c',       // slightly lighter for legibility on pure black
    border: '#26241f',      // hairline; faint amber tint (was #2c261f)
    dot: '#0a0a0b',         // near-invisible on black bg
    accent: '#f59e0b',
    accentDeep: '#fbbf24',
    accentSoft: '#1c160c',  // near-black amber tint; crisp chips on black (was #2a2113)
    green: '#34d399',
    greenSoft: '#14271a',
    red: '#ef4444',
    heat0: '#1c160c', heat1: '#3d2c10', heat2: '#7a5410', heat3: '#f59e0b',
    placeholder: '#585250',
    navBg: 'rgba(0,0,0,0.88)',
  },
};

// ── Fonts ────────────────────────────────────────────────────────────────────
// RN can't synthesize weights — every weight is its own family. We map the
// "display" weight to whichever headline family the user picked, and body
// weights to Nunito.
const DISPLAY = {
  'Baloo 2': {
    500: 'Baloo2_500Medium', 600: 'Baloo2_600SemiBold',
    700: 'Baloo2_700Bold', 800: 'Baloo2_800ExtraBold',
  },
  Quicksand: {
    500: 'Quicksand_500Medium', 600: 'Quicksand_600SemiBold',
    700: 'Quicksand_700Bold', 800: 'Quicksand_700Bold',
  },
  Fredoka: {
    500: 'Fredoka_500Medium', 600: 'Fredoka_600SemiBold',
    700: 'Fredoka_700Bold', 800: 'Fredoka_700Bold',
  },
};
const BODY = {
  400: 'Nunito_400Regular',
  600: 'Nunito_600SemiBold',
  700: 'Nunito_700Bold',
  800: 'Nunito_800ExtraBold',
};

// Default "tweaks" — these were the chosen values in the web prototype.
export const DEFAULT_SETTINGS = {
  name: '',
  headlineFont: 'Quicksand', // 'Baloo 2' | 'Quicksand' | 'Fredoka'
  accent: ['#f59e0b', '#d97706', '#fef3c7'], // [accent, deep, soft] — day only
  roundness: 1, // 0.6 – 1.4
  tone: 'playful', // 'gentle' | 'playful'
  // Store simulation — flip to exercise purchase/restore states without a live
  // billing backend. purchase: 'success'|'cancel'|'failed'|'network'|'owned';
  // restore: 'empty'|'found'. Replace with real RevenueCat results in prod.
  storePurchase: 'success',
  storeRestore: 'empty',
  // Local, offline, opt-in daily reminder (IMP-031). Off by default — existing
  // users previously saw a hardcoded (fake) "8:30 PM"; this is the honest
  // correction, not a silently-armed notification nobody asked for.
  reminder: { enabled: false, hour: 20, minute: 30 },
  // User-added feelings beyond the suggested MOODS list (IMP-037), offered
  // again in every future WriteFlow session.
  customMoods: [],
};

// Mix a hex color toward white by `amount` (0–1).
export function lighten(hex, amount = 0.25) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!m) return hex;
  const mix = (c) => Math.round(c + (255 - c) * amount);
  const r = mix(parseInt(m[1], 16));
  const g = mix(parseInt(m[2], 16));
  const b = mix(parseInt(m[3], 16));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

// Mix a hex color toward black by `amount` (0–1).
export function darken(hex, amount = 0.25) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!m) return hex;
  const mix = (c) => Math.round(c * (1 - amount));
  return `#${[parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
    .map((c) => mix(c).toString(16).padStart(2, '0')).join('')}`;
}

// Convert a hex color to an rgba() string with the given alpha (0–1).
export function hexRgba(hex, alpha = 1) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!m) return hex;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
}

// _variant is a test seam ('v2'|'classic'); production code omits it (uses DARK_THEME).
export function makeTheme(mode = 'day', settings = DEFAULT_SETTINGS, _variant) {
  const nightVariant = _variant ?? DARK_THEME;
  const base = mode === 'night'
    ? (nightVariant === 'v2' ? PALETTES.nightV2 : PALETTES.night)
    : PALETTES[mode];
  // In night mode the "deep" token flips meaning: on a dark canvas the brighter
  // shade is what gives contrast, not the darker one. Both accent tokens use
  // accent[0] so every consumer (streak number, links, badges, orbs) gets a
  // color that actually reads against the near-black surface.
  // accentSoft stays as the dark palette's near-black tint — using the light-mode
  // pastel (accent[2]) on a black card would look washed out.
  const palette = mode === 'night'
    ? {
        ...base,
        accent:       settings.accent[0],
        accentDeep:   settings.accent[0],
        accentBright: lighten(settings.accent[0], 0.28),
        accentSoft:   darken(settings.accent[0], 0.88),
        heat0:        darken(settings.accent[0], 0.88),
        heat1:        darken(settings.accent[0], 0.75),
        heat2:        darken(settings.accent[0], 0.50),
        heat3:        settings.accent[0],
      }
    : {
        ...base,
        accent:       settings.accent[0],
        accentDeep:   settings.accent[1],
        accentSoft:   settings.accent[2],
        accentBright: lighten(settings.accent[0], 0.28),
        heat3:        settings.accent[0],
      };

  // Derived semantic tokens — every consumer uses these instead of hardcoded values
  // so custom palettes (Marigold, Rose Dusk, Lavender…) apply consistently.
  const colors = {
    ...palette,
    // Text / icon on any filled accent surface (buttons, FAB, active chips)
    onAccent: '#fff',
    // Dark icon in light accent-tinted contexts (earned badge, quest done)
    iconAccent: mode === 'night' ? palette.accentDeep : darken(settings.accent[1], 0.50),
    // Ghost / back-button background — adapts to mode
    ghostBtn: mode === 'night' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    // Modal / sheet overlay scrim
    scrim: 'rgba(0,0,0,0.50)',
    // Accent at 35% opacity — for achievement/plus card borders
    accentBorder: hexRgba(settings.accent[0], 0.35),
    // Deep accent at 22% opacity — for ember pill, balance row borders
    deepBorder: hexRgba(settings.accent[1], 0.22),
    // Deep accent at 92% opacity — "active" check badge in shop palette cards
    accentMark: hexRgba(settings.accent[1], 0.92),
    // Accent at 32% opacity — NightSky moon haze gradient stop
    accentHaze: hexRgba(settings.accent[0], 0.32),
    // Accent at 10% opacity — ambient glow circles (onboarding, etc.)
    glowSoft: hexRgba(settings.accent[0], 0.10),
    // Warm shadow tint matched to palette
    shadowColor: mode === 'night' ? '#000' : darken(settings.accent[1], 0.55),
    // Secondary text on accent-tinted dark surface (streak subtitle in night mode)
    dimText: mode === 'night' ? lighten(palette.muted, 0.50) : palette.muted,
    // Danger action soft background
    redSoft: hexRgba(palette.red, 0.10),
    // Canceled subscription badge background
    cancelSoft: hexRgba(settings.accent[1], 0.14),
    // Plus upsell gradient (always a dark, palette-tinted bg for premium feel)
    plusGradient: [darken(settings.accent[1], 0.78), darken(settings.accent[0], 0.88)],
    // Text colors on the dark plus banner gradient
    plusLight: lighten(settings.accent[0], 0.65),   // label / icon
    plusWhite: lighten(settings.accent[2], 0.82),   // headline (near-white warm)
    plusMuted: lighten(settings.accent[1], 0.45),   // body copy
  };

  const rk = settings.roundness;
  const dispMap = DISPLAY[settings.headlineFont] || DISPLAY['Baloo 2'];

  return {
    mode,
    dark: mode === 'night',
    rich: true, // committed "Golden Hour" direction
    colors,
    radius: {
      card: 26 * rk,
      btn: 18 * rk,
      sm: 13 * rk,
    },
    // font family resolvers
    display: (w = 700) => dispMap[w] || dispMap[700],
    body: (w = 400) => BODY[w] || BODY[400],
    // platform shadow with an optional warm tint
    shadow(elevation = 8, color = '#000', opacity = 0.14) {
      return Platform.select({
        ios: {
          shadowColor: color,
          shadowOpacity: opacity,
          shadowRadius: elevation,
          shadowOffset: { width: 0, height: Math.round(elevation * 0.55) },
        },
        android: { elevation: Math.round(elevation * 0.6) },
        default: {},
      });
    },
  };
}

// ── Context ──────────────────────────────────────────────────────────────────
export const ThemeContext = React.createContext(makeTheme('day', DEFAULT_SETTINGS));
export const useTheme = () => React.useContext(ThemeContext);

// All Google-font families we need to preload (passed to useFonts in App.js).
export const FONT_FAMILIES = [
  'Baloo2_500Medium', 'Baloo2_600SemiBold', 'Baloo2_700Bold', 'Baloo2_800ExtraBold',
  'Quicksand_500Medium', 'Quicksand_600SemiBold', 'Quicksand_700Bold',
  'Fredoka_500Medium', 'Fredoka_600SemiBold', 'Fredoka_700Bold',
  'Nunito_400Regular', 'Nunito_600SemiBold', 'Nunito_700Bold', 'Nunito_800ExtraBold',
];
