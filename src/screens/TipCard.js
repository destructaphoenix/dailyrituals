// TipCard.js — a one-time, permanently-dismissible tip (IMP-041). Renders at
// the top of a screen's ScrollView, in the shape of YouScreen's BackupNudge
// but boxed as its own Card with a close button. Props in, callback out —
// no state, no persistence (that lives in seenTips via RitualsApp.js).

import React from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { T, Card } from '../ui';
import { Info, Close } from '../icons';

export default function TipCard({ title, body, onDismiss }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <Card style={{ padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Info size={17} color={c.accentDeep} />
      </View>
      <View style={{ flex: 1 }}>
        <T d w={700} color={c.ink} style={{ fontSize: 14.5 }}>{title}</T>
        <T w={600} color={c.muted} style={{ fontSize: 13, marginTop: 3, lineHeight: 18 }}>{body}</T>
      </View>
      <Pressable onPress={onDismiss} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
        <Close size={16} color={c.muted} />
      </Pressable>
    </Card>
  );
}
