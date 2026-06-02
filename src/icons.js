// icons.js — icon set ported to react-native-svg. Geometry is identical to the
// web prototype (rituals-bits.jsx); only the JSX element names change
// (svg→Svg, line→Line, etc.) and `currentColor` becomes an explicit `color` prop.

import React from 'react';
import Svg, { Circle, Line, Path, Rect, G, Defs, RadialGradient, Stop } from 'react-native-svg';

export function Sun({ size = 22, stroke = 2.4, rays = true, color = '#000' }) {
  const r = size * 0.26;
  const c = size / 2;
  const lines = [];
  if (rays) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r1 = size * 0.4, r2 = size * 0.5;
      lines.push(
        <Line key={i}
          x1={c + Math.cos(a) * r1} y1={c + Math.sin(a) * r1}
          x2={c + Math.cos(a) * r2} y2={c + Math.sin(a) * r2}
          stroke={color} strokeWidth={stroke} strokeLinecap="round" />
      );
    }
  }
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <Circle cx={c} cy={c} r={r} fill={color} />
      {lines}
    </Svg>
  );
}

export function Sunrise({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 17a7 7 0 0 1 14 0" />
      <Line x1="2.5" y1="20" x2="21.5" y2="20" />
      <Line x1="12" y1="3" x2="12" y2="5.5" />
      <Line x1="4.5" y1="6.5" x2="6" y2="8" />
      <Line x1="19.5" y1="6.5" x2="18" y2="8" />
    </Svg>
  );
}

export function Check({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12.5l4.5 4.5L19 7" />
    </Svg>
  );
}

export function Diamond({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Rect x="6.5" y="6.5" width="11" height="11" rx="2.5" transform="rotate(45 12 12)" />
    </Svg>
  );
}

export function Ring({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="7.5" stroke={color} strokeWidth={2.6} />
    </Svg>
  );
}

export function Moon({ size = 22, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color} />
    </Svg>
  );
}

export function Feather({ size = 22, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 19L15 9" />
      <Path d="M14 6l4 4-7 1-1-1 1-7z" fill={color} stroke="none" />
    </Svg>
  );
}

// Unmistakable pencil — body on the diagonal, sharp tip at lower-left,
// ferrule line near the eraser. Used for every "write" action.
export function Pencil({ size = 22, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 20l1.2-4.4L15.6 5.4l3.4 3.4L8.4 18.8 4 20z" />
      <Path d="M14 7l3 3" />
    </Svg>
  );
}

export function HomeIcon({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 11l8-6.5 8 6.5" />
      <Path d="M6 10v9h12v-9" />
    </Svg>
  );
}

export function BookIcon({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 4.5h9a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3V4.5z" />
      <Path d="M17 7.5h2v12.5h-9" />
    </Svg>
  );
}

export function Chevron({ dir = 'left', size = 22, color = '#000' }) {
  const d = dir === 'left' ? 'M14 5l-7 7 7 7' : 'M9 5l7 7-7 7';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d={d} />
    </Svg>
  );
}

export function Close({ size = 20, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.4} strokeLinecap="round">
      <Path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

// ── Tab + settings icons (added for Insights / You) ──────────────────────────
export function ChartIcon({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <Line x1="6" y1="20" x2="6" y2="13" />
      <Line x1="12" y1="20" x2="12" y2="5" />
      <Line x1="18" y1="20" x2="18" y2="9" />
    </Svg>
  );
}

export function UserIcon({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="8" r="3.6" />
      <Path d="M5 20a7 7 0 0 1 14 0" />
    </Svg>
  );
}

export function Bell({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <Path d="M10.5 19a2 2 0 0 0 3 0" />
    </Svg>
  );
}

export function Contrast({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth={2} />
      <Path d="M12 3.5a8.5 8.5 0 0 0 0 17z" fill={color} />
    </Svg>
  );
}

export function Download({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 4v10" />
      <Path d="M8 11l4 4 4-4" />
      <Path d="M5 19h14" />
    </Svg>
  );
}

export function Info({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="8.5" />
      <Line x1="12" y1="11" x2="12" y2="16" />
      <Circle cx="12" cy="7.8" r="0.2" />
    </Svg>
  );
}

// ── Plus compliance icons (added for purchase states + manage subscription) ──
export function Alert({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 4.5L21 19.5H3L12 4.5z" />
      <Line x1="12" y1="10.5" x2="12" y2="14.5" />
      <Circle cx="12" cy="17" r="0.2" />
    </Svg>
  );
}

export function NoSignal({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M7 18h9a4 4 0 0 0 .5-7.97A6 6 0 0 0 5.2 9.3" />
      <Line x1="4" y1="4" x2="20" y2="20" />
    </Svg>
  );
}

export function Restore({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4.5 12a7.5 7.5 0 1 1 2.3 5.4" />
      <Path d="M4 8.5V13h4.5" />
    </Svg>
  );
}

export function Shield({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3.5l7 2.5v5c0 4.4-3 7.5-7 9-4-1.5-7-4.6-7-9V6l7-2.5z" />
    </Svg>
  );
}

export function Receipt({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 3.5h12v17l-2.2-1.4L13.5 21l-1.5-1.4L10.5 21l-2.3-1.9L6 20.5v-17z" />
      <Line x1="9" y1="8.5" x2="15" y2="8.5" />
      <Line x1="9" y1="12.5" x2="15" y2="12.5" />
    </Svg>
  );
}

export function Ban({ size = 24, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="8.5" />
      <Line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  );
}

// String-keyed lookup used by the badges row.
export const BADGE_ICON = {
  sunrise: Sunrise,
  sun: (p) => <Sun {...p} size={p.size || 24} />,
  check: Check,
  diamond: Diamond,
  ring: Ring,
};

// ── Gamification icons ───────────────────────────────────────────────────────
export function Heart({ size = 22, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 20.2S4.5 15.6 4.5 10.3A3.9 3.9 0 0 1 12 8.2a3.9 3.9 0 0 1 7.5 2.1c0 5.3-7.5 9.9-7.5 9.9z"
        stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Candle — guards the streak flame on a missed day. Pass theme colors in.
export function Candle({ size = 22, lit = true, body = '#fef3c7', deep = '#d97706' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="8.4" y="9.6" width="7.2" height="11.4" rx="1.7" fill={body} stroke={deep} strokeWidth={1.5} />
      <Line x1="12" y1="7.4" x2="12" y2="9.7" stroke={deep} strokeWidth={1.5} strokeLinecap="round" />
      {lit
        ? <Path d="M12 2.3c1.8 2 2.5 3.5 2.5 4.7a2.5 2.5 0 0 1-5 0c0-1.2.7-2.7 2.5-4.7z" fill="#f59e0b" />
        : <Circle cx="12" cy="6.4" r="1.1" fill="none" stroke="#c3bcb0" strokeWidth={1.3} />}
    </Svg>
  );
}

// Icon lookup for the achievements list.
export const ACH_ICON = {
  sunrise: Sunrise,
  sun: (p) => <Sun {...p} size={p.size || 24} />,
  heart: Heart,
  moon: (p) => <Moon {...p} size={p.size || 24} />,
  diamond: Diamond,
  ring: Ring,
  check: Check,
};

// ── Shop / economy icons ─────────────────────────────────────────────────────
// Ember — the soft currency mark (a small flame).
export function Ember({ size = 18, deep = '#d97706' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <RadialGradient id={`ember${size}`} cx="50%" cy="64%" r="62%">
          <Stop offset="0%" stopColor="#fde68a" />
          <Stop offset="100%" stopColor="#f59e0b" />
        </RadialGradient>
      </Defs>
      <Path d="M12 2.3c3.1 3 4.7 5.7 4.7 8.4a4.7 4.7 0 0 1-9.4 0c0-1.4.5-2.8 1.5-4.1.25 1.1.9 1.8 1.8 2.1-.35-2.2.2-4.4 1.4-6.4z"
        fill={`url(#ember${size})`} stroke={deep} strokeWidth={0.6} />
    </Svg>
  );
}

export function Lock({ size = 14, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="5" y="11" width="14" height="9" rx="2.4" />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Svg>
  );
}

export function Bag({ size = 22, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 8h12l-1 12H7L6 8z" />
      <Path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </Svg>
  );
}
