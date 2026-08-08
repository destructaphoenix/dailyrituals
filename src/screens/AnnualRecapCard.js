// AnnualRecapCard.js — Home card for the Annual Recap (IMP-046, PLUS_PERKS
// #4). Presentational, mirrors OnThisDayCard.js's shape: props in, callbacks
// out. The caller decides whether to mount this at all (the 1 Dec – 31 Jan
// window + a completed year existing) — it is never shown as an empty state.

import React from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { T, Card } from '../ui';
import { ChartIcon, Sun, Close } from '../icons';

export default function AnnualRecapCard({ year, locked = false, onOpen, onDismiss, onOpenPaywall }) {
  const t = useTheme();
  const c = t.colors;

  if (!year) return null;

  const Header = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: locked ? 8 : 4 }}>
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        <ChartIcon size={15} color={c.accentDeep} />
      </View>
      <T d w={700} color={c.ink} style={{ fontSize: 16, flex: 1 }}>Your {year}, remembered</T>
      <Pressable onPress={onDismiss} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
        <Close size={16} color={c.muted} />
      </Pressable>
    </View>
  );

  if (locked) {
    return (
      <Card style={{ padding: 18 }}>
        <Header />
        <T w={600} color={c.muted} style={{ fontSize: 13.5, lineHeight: 19, marginBottom: 14 }}>
          Your year is ready — days, words, moods and the milestones you crossed, on one page.
        </T>
        <Pressable
          onPress={onOpenPaywall}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
            paddingVertical: 10, borderRadius: 999, backgroundColor: c.accentSoft, opacity: pressed ? 0.7 : 1,
          })}
        >
          <Sun size={13} color={c.accentDeep} />
          <T w={800} color={c.accentDeep} style={{ fontSize: 13 }}>Unlock with Plus</T>
        </Pressable>
      </Card>
    );
  }

  return (
    <Card style={{ padding: 16 }}>
      <Header />
      <Pressable onPress={onOpen} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.99 : 1 }] })}>
        <View style={{ padding: 12, borderRadius: 14, backgroundColor: c.accentSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <T w={600} color={c.ink} style={{ fontSize: 13.5, flex: 1 }}>Your {year} is ready to open.</T>
          <T w={800} color={c.accentDeep} style={{ fontSize: 13 }}>View</T>
        </View>
      </Pressable>
    </Card>
  );
}
