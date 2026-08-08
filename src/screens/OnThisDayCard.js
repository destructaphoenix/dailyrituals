// OnThisDayCard.js — Home card for "On this day" resurfacing (IMP-038,
// PLUS_PERKS #3). Presentational: props in, callbacks out. The caller
// decides whether to mount this at all — it is shown only on days that
// actually have a match, never as an empty state.

import React from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { T, Card } from '../ui';
import { Feather, Sun, Close } from '../icons';

export default function OnThisDayCard({ matches = [], locked = false, onOpen, onDismiss, onOpenPaywall }) {
  const t = useTheme();
  const c = t.colors;

  if (!matches.length) return null;

  const Header = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: locked ? 8 : 4 }}>
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Feather size={15} color={c.accentDeep} />
      </View>
      <T d w={700} color={c.ink} style={{ fontSize: 16, flex: 1 }}>On this day</T>
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
          The app found something you wrote on a day like this.
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
      <View style={{ gap: 10, marginTop: 6 }}>
        {matches.map(({ entry, label }) => (
          <Pressable key={entry.id ?? `${entry.dayKey}-${label}`} onPress={() => onOpen(entry)}>
            {({ pressed }) => (
              <View style={{
                flexDirection: 'row', gap: 12, padding: 12, borderRadius: 14,
                backgroundColor: c.accentSoft, transform: [{ scale: pressed ? 0.99 : 1 }],
              }}>
                <View style={{ width: 40, alignItems: 'center' }}>
                  <T d w={800} color={c.accentDeep} style={{ fontSize: 18, lineHeight: 18 }}>{entry.day}</T>
                  <T w={800} color={c.muted} style={{ fontSize: 10, textTransform: 'uppercase', marginTop: 2 }}>{entry.mon}</T>
                </View>
                <View style={{ flex: 1 }}>
                  <T w={800} color={c.accentDeep} style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</T>
                  <T w={400} color={c.ink} style={{ fontSize: 13.5, lineHeight: 19, marginTop: 3 }} numberOfLines={2}>{entry.did}</T>
                </View>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </Card>
  );
}
