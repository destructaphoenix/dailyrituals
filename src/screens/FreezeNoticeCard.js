// FreezeNoticeCard.js — Home card telling the user a streak-freeze candle
// spent itself for them (IMP-060). TipCard's shape: a Card with an icon,
// title/body, and a close button. Presentational — the caller decides
// whether to mount this at all, and clears pendingFreezeNotice on dismiss.

import React from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { T, Card } from '../ui';
import { Candle, Close } from '../icons';
import { freezeNoticeCopy } from '../home/freezeNotice';

export default function FreezeNoticeCard({ days = [], freezesLeft = 0, onDismiss }) {
  const t = useTheme();
  const c = t.colors;
  const copy = freezeNoticeCopy(days, freezesLeft);
  if (!copy) return null;

  return (
    <Card style={{ padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Candle size={18} lit={false} body={c.accentSoft} deep={c.accentDeep} />
      </View>
      <View style={{ flex: 1 }}>
        <T d w={700} color={c.ink} style={{ fontSize: 14.5 }}>{copy.title}</T>
        <T w={600} color={c.muted} style={{ fontSize: 13, marginTop: 3, lineHeight: 18 }}>{copy.body}</T>
      </View>
      <Pressable onPress={onDismiss} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
        <Close size={16} color={c.muted} />
      </Pressable>
    </Card>
  );
}
