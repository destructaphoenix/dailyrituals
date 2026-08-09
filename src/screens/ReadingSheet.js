// ReadingSheet.js — entry detail. Ported from ReadingSheet. Rendered inside a
// Modal by RitualsApp, so it's just the sheet body here.

import React from 'react';
import { View, ScrollView, Pressable, Text, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme';
import { T } from '../ui';
import { Chevron } from '../icons';
import { moodEmoji } from '../data';

export default function ReadingSheet({ entry, copy, mode, insets, onClose, canEdit, onEdit, onDelete }) {
  const t = useTheme();
  const c = t.colors;

  // Cap to the viewport so the ScrollView is bounded on Android's first modal
  // measure pass, where flex:1 alone bounds nothing. See Shop.js for the full
  // explanation.
  const { height: winH } = useWindowDimensions();
  return (
    <View style={{ flex: 1, maxHeight: winH, backgroundColor: c.cream, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6 }}>
        <IconBtn onPress={onClose}><Chevron dir="left" size={22} color={c.ink} /></IconBtn>
        {entry.moods && entry.moods.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, flexShrink: 1, justifyContent: 'center' }}>
            {entry.moods.map((m) => (
              <View key={m} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, backgroundColor: c.accentSoft }}>
                <Text style={{ fontSize: 13 }}>{moodEmoji(m)}</Text>
                <T w={800} color={c.accentDeep} style={{ fontSize: 11 }}>{m}</T>
              </View>
            ))}
          </View>
        ) : null}
        {canEdit ? (
          <Pressable onPress={onEdit} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
            <T w={700} color={c.accentDeep} style={{ fontSize: 13 }}>Edit</T>
          </Pressable>
        ) : null}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 6, paddingBottom: 30 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <T d w={600} color={c.muted} style={{ fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' }}>{copy.epitaph}</T>
        <T d w={800} color={c.ink} style={{ fontSize: 26, marginTop: 8, marginBottom: 2 }}>{entry.wd}, {entry.day} {entry.mon}</T>

        <T d w={700} color={c.accentDeep} style={{ fontSize: 14, marginTop: 22, marginBottom: 7 }}>{copy.q1}</T>
        <T w={400} color={c.ink} style={{ fontSize: 16.5, lineHeight: 26.7 }}>{entry.did}</T>

        <View style={{ height: 1, backgroundColor: c.border, marginVertical: 14 }} />

        <T d w={700} color={c.accentDeep} style={{ fontSize: 14, marginBottom: 7 }}>{copy.q2}</T>
        <T w={400} color={c.ink} style={{ fontSize: 16.5, lineHeight: 26.7 }}>{entry.wished}</T>

        {onDelete ? (
          <Pressable onPress={onDelete} style={{ alignSelf: 'flex-start', marginTop: 26, paddingVertical: 6 }}>
            <T w={700} color={c.red} style={{ fontSize: 13.5 }}>Delete this day</T>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

function IconBtn({ onPress, children }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.ghostBtn }}>
      {children}
    </Pressable>
  );
}
