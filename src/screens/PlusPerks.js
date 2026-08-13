// PlusPerks.js — "What's in Plus", reachable from the You tab outside the
// paywall (IMP-041). Mounted only when PLUS_ENABLED, per the decided design:
// PLUS_PERKS carries three untrue lines while the app ships free, so this
// sheet must not exist outside a build where every line is honest.

import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { T, Card } from '../ui';
import { Chevron, Sun } from '../icons';
import { PLUS_PERKS } from '../data';

export default function PlusPerks({ insets, onClose }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <View style={{ flex: 1, backgroundColor: c.cream, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6 }}>
        <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close what's in Plus"
          style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: c.ghostBtn, opacity: pressed ? 0.6 : 1 })}>
          <Chevron dir="left" size={22} color={c.ink} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 30 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <T d w={800} color={c.ink} style={{ fontSize: 26, marginTop: 6 }}>What's in Plus</T>
        <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 4, marginBottom: 18, lineHeight: 20 }}>
          Everything a subscription unlocks, in one place.
        </T>

        <Card style={{ padding: 8 }}>
          {PLUS_PERKS.map((perk, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 10 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                <Sun size={14} color={c.accentDeep} />
              </View>
              <T w={600} color={c.ink} style={{ flex: 1, fontSize: 14.5, lineHeight: 20 }}>{perk}</T>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}
