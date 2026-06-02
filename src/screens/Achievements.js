// screens/Achievements.js — tiered achievements list, mirrored from
// AchievementsScreen in rituals-gamify.jsx. Opened as a modal from the
// Keepsakes row (Home) and the keepsakes tile (You). Earned, never bought.

import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { T } from '../ui';
import { Chevron, Check, ACH_ICON, Sun } from '../icons';
import { ThinBar } from '../gamify';
import { ACHIEVEMENTS } from '../data';

export default function Achievements({ insets, onClose }) {
  const t = useTheme();
  const c = t.colors;
  const earned = ACHIEVEMENTS.filter((a) => a.cur >= a.goal).length;
  return (
    <View style={{ flex: 1, backgroundColor: c.cream, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6 }}>
        <Pressable onPress={onClose} hitSlop={8}
          style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: t.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', opacity: pressed ? 0.6 : 1 })}>
          <Chevron dir="left" size={22} color={c.ink} />
        </Pressable>
        <T w={700} color={c.muted} style={{ fontSize: 12 }}>{earned} of {ACHIEVEMENTS.length} earned</T>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <T d w={700} color={c.accentDeep} style={{ fontSize: 14, marginTop: 6 }}>Keepsakes</T>
        <T d w={800} color={c.ink} style={{ fontSize: 26, marginTop: 2 }}>Achievements</T>
        <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 4, marginBottom: 18, lineHeight: 20 }}>
          Small honours for showing up — earned, never bought.
        </T>

        <View style={{ gap: 12 }}>
          {ACHIEVEMENTS.map((a) => {
            const Ic = ACH_ICON[a.icon] || Sun;
            const done = a.cur >= a.goal;
            return (
              <View key={a.id} style={[
                { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: t.radius.card, borderWidth: 1, borderColor: done ? 'rgba(245,158,11,0.35)' : c.border, backgroundColor: c.surface },
                t.dark ? null : t.shadow(10, '#5b4a2a', 0.1),
              ]}>
                <View style={[
                  { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? c.accent : c.dot, borderWidth: 1.5, borderColor: done ? c.accentDeep : c.border },
                  done && t.shadow(10, c.accentDeep, 0.7),
                ]}>
                  <Ic size={26} color={done ? '#7c2d12' : (t.dark ? '#6b6256' : '#c3bcb0')} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <T d w={700} color={c.ink} style={{ fontSize: 16 }}>{a.label}</T>
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
