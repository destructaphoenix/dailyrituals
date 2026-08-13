// screens/Achievements.js — tiered achievements list, mirrored from
// AchievementsScreen in rituals-gamify.jsx. Opened as a modal from the
// Keepsakes row (Home) and the keepsakes tile (You). Earned, never bought.

import React from 'react';
import { View, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme';
import { T } from '../ui';
import { Chevron, Check, ACH_ICON, Sun } from '../icons';
import { ThinBar } from '../gamify';
import { deriveAchievements } from '../profile/achievements';

export default function Achievements({ insets, onClose, entries = [], streak = 0 }) {
  const t = useTheme();
  const c = t.colors;

  // Cap to the viewport so the ScrollView is bounded on Android's first modal
  // measure pass, where flex:1 alone bounds nothing. See Shop.js for the full
  // explanation.
  const { height: winH } = useWindowDimensions();
  const achievements = deriveAchievements(entries, streak);
  const earned = achievements.filter((a) => a.done).length;
  return (
    <View style={{ flex: 1, maxHeight: winH, backgroundColor: c.cream, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6 }}>
        <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close Keepsakes"
          style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: c.ghostBtn, opacity: pressed ? 0.6 : 1 })}>
          <Chevron dir="left" size={22} color={c.ink} />
        </Pressable>
        <T w={700} color={c.muted} style={{ fontSize: 12 }}>{earned} of {achievements.length} earned</T>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 30 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <T d w={800} color={c.ink} style={{ fontSize: 26, marginTop: 6 }}>Keepsakes</T>
        <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 4, marginBottom: 18, lineHeight: 20 }}>
          Small honours for showing up — earned, never bought.
        </T>

        <View style={{ gap: 12 }}>
          {achievements.map((a) => {
            const Ic = ACH_ICON[a.icon] || Sun;
            const done = a.done;
            return (
              <View key={a.id} style={[
                { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: t.radius.card, borderWidth: 1, borderColor: done ? c.accentBorder : c.border, backgroundColor: c.surface },
                t.dark ? null : t.shadow(10, c.shadowColor, 0.1),
              ]}>
                <View style={[
                  { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? c.accent : c.dot, borderWidth: 1.5, borderColor: done ? c.accentDeep : c.border },
                  done && t.shadow(10, c.accentDeep, 0.7),
                ]}>
                  <Ic size={26} color={done ? c.onAccent : c.placeholder} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <T d w={700} color={c.ink} numberOfLines={1} style={{ fontSize: 16, flexShrink: 1 }}>{a.label}</T>
                    {done && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Check size={14} color={c.green} />
                        <T d w={800} color={c.green} style={{ fontSize: 11.5 }}>Earned</T>
                      </View>
                    )}
                  </View>
                  <T w={600} color={c.muted} style={{ fontSize: 13, marginTop: 2, lineHeight: 18 }}>{a.desc}</T>
                  {!done && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
                      <View style={{ flex: 1 }}><ThinBar pct={(a.cur / a.goal) * 100} /></View>
                      <T d w={800} color={c.muted} style={{ fontSize: 11.5 }}>{a.cur} / {a.goal}</T>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
