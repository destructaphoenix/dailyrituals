// shopui.js — shared shop/economy components for RN, mirrored from
// rituals-shop.jsx: the Embers balance pill (header entry point), the Plus
// upsell banner / member-status card, sky previews and price tags.

import React from 'react';
import { View, Pressable, PixelRatio } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './theme';
import { T } from './ui';
import { CHROME_FONT_SCALE } from './ui/textScale';
import { Ember, Lock, Check, Sun, Moon, Chevron } from './icons';

// ── Embers balance pill ───────────────────────────────────────────────────────
export function EmberPill({ embers, plus, onPress, lg }) {
  const c = useTheme().colors;
  const plusSize = 17 * Math.min(PixelRatio.getFontScale(), CHROME_FONT_SCALE);
  return (
    <Pressable onPress={onPress} hitSlop={6}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', gap: 5,
        height: lg ? 38 : 36, paddingLeft: 9, paddingRight: 11, borderRadius: 999,
        backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.deepBorder,
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}>
      {plus && (
        <View style={{ position: 'absolute', top: -3, left: -3, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accent, borderWidth: 2, borderColor: c.cream }}>
          <Sun size={9} color={c.onAccent} />
        </View>
      )}
      <Ember size={17} deep={c.accentDeep} />
      <T d w={800} color={c.accentDeep} maxFontSizeMultiplier={CHROME_FONT_SCALE} numberOfLines={1} style={{ fontSize: 15 }}>{embers}</T>
      <View style={{ width: plusSize, height: plusSize, borderRadius: plusSize / 2, marginLeft: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accent }}>
        <T d w={800} color={c.onAccent} maxFontSizeMultiplier={CHROME_FONT_SCALE} numberOfLines={1} style={{ fontSize: 13 }}>+</T>
      </View>
    </Pressable>
  );
}

// ── Plus banner / member status ───────────────────────────────────────────────
// IMP-082: `renewLabel` is the real date or null. Null means the app does not
// know when this subscription renews, so it says nothing about renewal — it
// does NOT reach for the RENEW_DATE design mock.
export function PlusBanner({ plus, onOpenPaywall, onManage, compact, renewLabel = null }) {
  const t = useTheme();
  const c = t.colors;
  if (plus) {
    return (
      <Pressable onPress={onManage}
        style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, borderRadius: t.radius.card, backgroundColor: c.surface, borderWidth: 1, borderColor: c.accentBorder, transform: [{ scale: pressed ? 0.99 : 1 }] }, t.dark ? null : t.shadow(12, c.accentDeep, 0.18)]}>
        <View style={[{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accent }, t.shadow(8, c.accentDeep, 0.8)]}>
          <Sun size={18} color={c.onAccent} />
        </View>
        <View style={{ flex: 1 }}>
          <T d w={800} color={c.ink} style={{ fontSize: 16 }}>Daily Rituals Plus</T>
          <T w={600} color={c.muted} style={{ fontSize: 12.5, marginTop: 1 }}>{renewLabel ? `Member · renews ${renewLabel}` : 'Member'}</T>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <T d w={800} color={c.accentDeep} style={{ fontSize: 12.5 }}>Manage</T>
          <Chevron dir="right" size={15} color={c.accentDeep} />
        </View>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onOpenPaywall}
      style={({ pressed }) => [{ borderRadius: t.radius.card, overflow: 'hidden', transform: [{ scale: pressed ? 0.99 : 1 }] }, t.shadow(14, c.accentDeep, 0.6)]}>
      <LinearGradient colors={c.plusGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: compact ? 15 : 18, borderWidth: 1, borderColor: c.accentBorder, borderRadius: t.radius.card }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 7 }}>
            <Sun size={13} color={c.plusLight} />
            <T d w={800} color={c.plusLight} style={{ fontSize: 11.5, letterSpacing: 0.6 }}>DAILY RITUALS PLUS</T>
          </View>
          <T d w={800} color={c.plusWhite} style={{ fontSize: 18, lineHeight: 21 }}>Every palette, sky &amp; candle.</T>
          {/* IMP-090: "7 days free" / "Try free" promised a trial on a surface
              that fetches no offer at all — the same claim the paywall CTA was
              making, in two words. This banner only OPENS the paywall; the offer
              is disclosed there, where the live data actually is. */}
          <T w={600} color={c.plusMuted} style={{ fontSize: 12.5, marginTop: 4 }}>Plus your graveyard kept forever.</T>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <T d w={800} color={c.onAccent} style={{ fontSize: 13.5 }}>See Plus</T>
          <Chevron dir="right" size={16} color={c.onAccent} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

// ── Small sky preview (sky cards) ─────────────────────────────────────────────
export function SkyPreview({ kind }) {
  const t = useTheme();
  const c = t.colors;
  // Sun sky adapts to the active palette; night/special skies are fixed illustrations.
  const SKY_BG = {
    sun: [c.accentBright, c.accentDeep],
    moon: ['#3a2a14', '#0c0a08'],
    harvest: ['#b45309', '#1a1006'],
    meteor: ['#3a2a14', '#0c0a08'],
    aurora: ['#0c1a18', '#06120e'],
  };
  const bg = SKY_BG[kind] || SKY_BG.sun;
  return (
    <LinearGradient colors={bg} start={{ x: 0.5, y: 0.2 }} end={{ x: 0.5, y: 1 }}
      style={{ width: 58, height: 58, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {kind === 'sun' && <Sun size={30} color={c.onAccent} />}
      {(kind === 'moon' || kind === 'harvest' || kind === 'meteor') && <Moon size={kind === 'meteor' ? 20 : 26} color={c.onAccent} />}
      {kind === 'aurora' && (
        <View style={{ position: 'absolute', top: 14, left: -8, right: -8, height: 22, backgroundColor: 'rgba(110,231,183,0.55)', transform: [{ rotate: '-18deg' }], borderRadius: 12 }} />
      )}
      {(kind !== 'sun') && (
        <>
          <View style={{ position: 'absolute', top: 12, left: 12, width: 2.5, height: 2.5, borderRadius: 2, backgroundColor: c.accentBright }} />
          <View style={{ position: 'absolute', top: 38, left: 16, width: 2.5, height: 2.5, borderRadius: 2, backgroundColor: c.accentBright }} />
          <View style={{ position: 'absolute', top: 18, right: 12, width: 2.5, height: 2.5, borderRadius: 2, backgroundColor: c.accentBright }} />
        </>
      )}
    </LinearGradient>
  );
}

// ── Price / state tag (palette + sky cards) ───────────────────────────────────
export function PalTag({ st, tier }) {
  const c = useTheme().colors;
  if (st === 'active') return <T d w={800} color={c.accentDeep} maxFontSizeMultiplier={CHROME_FONT_SCALE} numberOfLines={1} style={{ fontSize: 12 }}>Applied</T>;
  if (st === 'owned') return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: c.accent, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999 }}>
      <T d w={800} color={c.onAccent} maxFontSizeMultiplier={CHROME_FONT_SCALE} numberOfLines={1} style={{ fontSize: 12 }}>Apply</T>
    </View>
  );
  if (st === 'plus') return (
    <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.accentSoft, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999 }}>
      <Sun size={11} color={c.accentDeep} />
      <T d w={800} color={c.accentDeep} maxFontSizeMultiplier={CHROME_FONT_SCALE} numberOfLines={1} style={{ fontSize: 12 }}>Plus</T>
    </View>
  );
  return (
    <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.accentSoft, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999 }}>
      <Ember size={13} deep={c.accentDeep} />
      <T d w={800} color={c.accentDeep} maxFontSizeMultiplier={CHROME_FONT_SCALE} numberOfLines={1} style={{ fontSize: 12 }}>{tier}</T>
    </View>
  );
}
