// shopui.js — shared shop/economy components for RN, mirrored from
// rituals-shop.jsx: the Embers balance pill (header entry point), the Plus
// upsell banner / member-status card, sky previews and price tags.

import React from 'react';
import { View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './theme';
import { T } from './ui';
import { Ember, Lock, Check, Sun, Moon, Chevron } from './icons';
import { RENEW_DATE } from './data';

// ── Embers balance pill ───────────────────────────────────────────────────────
export function EmberPill({ embers, plus, onPress, lg }) {
  const c = useTheme().colors;
  return (
    <Pressable onPress={onPress} hitSlop={6}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', gap: 5,
        height: lg ? 38 : 36, paddingLeft: 9, paddingRight: 11, borderRadius: 999,
        backgroundColor: c.accentSoft, borderWidth: 1, borderColor: 'rgba(217,119,6,0.22)',
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}>
      {plus && (
        <View style={{ position: 'absolute', top: -3, left: -3, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accent, borderWidth: 2, borderColor: c.cream }}>
          <Sun size={9} color="#fff" />
        </View>
      )}
      <Ember size={17} deep={c.accentDeep} />
      <T d w={800} color={c.accentDeep} style={{ fontSize: 15 }}>{embers}</T>
      <View style={{ width: 17, height: 17, borderRadius: 9, marginLeft: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accent }}>
        <T d w={800} color="#fff" style={{ fontSize: 13, lineHeight: 15 }}>+</T>
      </View>
    </Pressable>
  );
}

// ── Plus banner / member status ───────────────────────────────────────────────
export function PlusBanner({ plus, onOpenPaywall, onManage, compact }) {
  const t = useTheme();
  const c = t.colors;
  if (plus) {
    return (
      <Pressable onPress={onManage}
        style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, borderRadius: t.radius.card, backgroundColor: c.surface, borderWidth: 1, borderColor: 'rgba(245,158,11,0.34)', transform: [{ scale: pressed ? 0.99 : 1 }] }, t.dark ? null : t.shadow(12, c.accentDeep, 0.18)]}>
        <View style={[{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accent }, t.shadow(8, c.accentDeep, 0.8)]}>
          <Sun size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <T d w={800} color={c.ink} style={{ fontSize: 16 }}>Daily Rituals Plus</T>
          <T w={600} color={c.muted} style={{ fontSize: 12.5, marginTop: 1 }}>Member · renews {RENEW_DATE}</T>
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
      <LinearGradient colors={['#1f1a14', '#3a2a12']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: compact ? 15 : 18, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', borderRadius: t.radius.card }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 7 }}>
            <Sun size={13} color="#fcd9a0" />
            <T d w={800} color="#fcd9a0" style={{ fontSize: 11.5, letterSpacing: 0.6 }}>DAILY RITUALS PLUS</T>
          </View>
          <T d w={800} color="#fff7ea" style={{ fontSize: 18, lineHeight: 21 }}>Every palette, sky &amp; candle.</T>
          <T w={600} color="#cbb48d" style={{ fontSize: 12.5, marginTop: 4 }}>Plus your graveyard kept forever. 7 days free.</T>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <T d w={800} color="#fff" style={{ fontSize: 13.5 }}>Try free</T>
          <Chevron dir="right" size={16} color="#fff" />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

// ── Small sky preview (sky cards) ─────────────────────────────────────────────
const SKY_BG = {
  sun: ['#fbbf24', '#d97706'],
  moon: ['#3a2a14', '#0c0a08'],
  harvest: ['#b45309', '#1a1006'],
  meteor: ['#3a2a14', '#0c0a08'],
  aurora: ['#0c1a18', '#06120e'],
};
export function SkyPreview({ kind }) {
  const bg = SKY_BG[kind] || SKY_BG.sun;
  return (
    <LinearGradient colors={bg} start={{ x: 0.5, y: 0.2 }} end={{ x: 0.5, y: 1 }}
      style={{ width: 58, height: 58, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {kind === 'sun' && <Sun size={30} color="#fff" />}
      {(kind === 'moon' || kind === 'harvest' || kind === 'meteor') && <Moon size={kind === 'meteor' ? 20 : 26} color="#fff" />}
      {kind === 'aurora' && (
        <View style={{ position: 'absolute', top: 14, left: -8, right: -8, height: 22, backgroundColor: 'rgba(110,231,183,0.55)', transform: [{ rotate: '-18deg' }], borderRadius: 12 }} />
      )}
      {(kind !== 'sun') && (
        <>
          <View style={{ position: 'absolute', top: 12, left: 12, width: 2.5, height: 2.5, borderRadius: 2, backgroundColor: '#fde68a' }} />
          <View style={{ position: 'absolute', top: 38, left: 16, width: 2.5, height: 2.5, borderRadius: 2, backgroundColor: '#fde68a' }} />
          <View style={{ position: 'absolute', top: 18, right: 12, width: 2.5, height: 2.5, borderRadius: 2, backgroundColor: '#fde68a' }} />
        </>
      )}
    </LinearGradient>
  );
}

// ── Price / state tag (palette + sky cards) ───────────────────────────────────
export function PalTag({ st, tier }) {
  const c = useTheme().colors;
  if (st === 'active') return <T d w={800} color={c.accentDeep} style={{ fontSize: 12 }}>Applied</T>;
  if (st === 'owned') return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: c.accent, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999 }}>
      <T d w={800} color="#fff" style={{ fontSize: 12 }}>Apply</T>
    </View>
  );
  if (st === 'plus') return (
    <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.accentSoft, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999 }}>
      <Sun size={11} color={c.accentDeep} />
      <T d w={800} color={c.accentDeep} style={{ fontSize: 12 }}>Plus</T>
    </View>
  );
  return (
    <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.accentSoft, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999 }}>
      <Ember size={13} deep={c.accentDeep} />
      <T d w={800} color={c.accentDeep} style={{ fontSize: 12 }}>{tier}</T>
    </View>
  );
}
