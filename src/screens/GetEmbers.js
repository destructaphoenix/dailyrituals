// screens/GetEmbers.js — cash top-up sheet, mirrored from GetEmbersSheet in
// rituals-shop.jsx. Opened when the user taps the "+" on an Embers pill or
// tries to buy something they can't yet afford.

import React from 'react';
import { View, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme';
import { T } from '../ui';
import { Close, Ember } from '../icons';
import { EMBER_PACKS } from '../data';

export default function GetEmbers({ insets, onClose, embers, onBuy }) {
  const t = useTheme();
  const c = t.colors;

  // Cap to the viewport so the ScrollView is bounded on Android's first modal
  // measure pass, where flex:1 alone bounds nothing. See Shop.js for the full
  // explanation.
  const { height: winH } = useWindowDimensions();
  return (
    <View style={{ flex: 1, maxHeight: winH, backgroundColor: c.cream, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 4 }}>
        <Pressable onPress={onClose} hitSlop={8}
          style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: c.ghostBtn, opacity: pressed ? 0.6 : 1 })}>
          <Close size={18} color={c.ink} />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, height: 38, paddingHorizontal: 12, borderRadius: 999, backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.deepBorder }}>
          <Ember size={18} deep={c.accentDeep} />
          <T d w={800} color={c.accentDeep} style={{ fontSize: 15 }}>{embers}</T>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 26, paddingTop: 24, paddingBottom: 30 + insets.bottom, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
        <View style={[{ width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accentSoft }, t.shadow(20, c.accentDeep, 0.5)]}>
          <Ember size={52} deep={c.accentDeep} />
        </View>
        <T d w={800} color={c.ink} style={{ fontSize: 24, textAlign: 'center', marginTop: 18 }}>Gather more Embers</T>
        <T w={600} color={c.muted} style={{ fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8, maxWidth: 300 }}>
          Top up to tend the flame today. You also earn one Ember for every day you lay to rest.
        </T>

        <View style={{ width: '100%', marginTop: 26, gap: 10 }}>
          {EMBER_PACKS.map((p) => (
            <Pressable key={p.id} onPress={() => onBuy(p)}
              style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 15, borderRadius: t.radius.btn, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border, transform: [{ scale: pressed ? 0.99 : 1 }] }, t.dark ? null : t.shadow(8, c.shadowColor, 0.08)]}>
              <View style={{ width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accentSoft }}>
                <Ember size={22} deep={c.accentDeep} />
              </View>
              <T d w={800} color={c.ink} style={{ flex: 1, fontSize: 16 }}>{p.amount} Embers</T>
              {p.tag && (
                <View style={{ backgroundColor: c.accentSoft, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 }}>
                  <T d w={800} color={c.accentDeep} style={{ fontSize: 10, letterSpacing: 0.3 }}>{p.tag.toUpperCase()}</T>
                </View>
              )}
              <T d w={800} color={c.accentDeep} style={{ fontSize: 16 }}>{p.price}</T>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
