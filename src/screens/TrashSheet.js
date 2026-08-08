// screens/TrashSheet.js — "Recently deleted" list (IMP-036). Deleting a day is
// free; restoring it is the Plus half — keeping a safety copy is our work,
// charging someone to un-write their own grief is not.

import React from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { useTheme } from '../theme';
import { T, Card } from '../ui';
import { Chevron, Restore as RestoreIcon, Close, Sun } from '../icons';

export default function TrashSheet({ trash, insets, onClose, onRestore, onDeleteForever, plus, plusEnabled, onOpenPaywall, onRestoreBlocked }) {
  const t = useTheme();
  const c = t.colors;

  const confirmForget = (item) => {
    Alert.alert(
      'Delete forever?',
      `This permanently removes ${item.wd}, ${item.day} ${item.mon} — it can't be brought back after this.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete forever', style: 'destructive', onPress: () => onDeleteForever(item.dayKey) },
      ]
    );
  };

  const handleRestore = (item) => {
    if (plus) { onRestore(item.dayKey); return; }
    if (plusEnabled) { onOpenPaywall(); return; }
    onRestoreBlocked();
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.cream, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6 }}>
        <Pressable onPress={onClose} hitSlop={8}
          style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: c.ghostBtn, opacity: pressed ? 0.6 : 1 })}>
          <Chevron dir="left" size={22} color={c.ink} />
        </Pressable>
        <T w={700} color={c.muted} style={{ fontSize: 12 }}>{trash.length} recently deleted</T>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 30 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <T d w={800} color={c.ink} style={{ fontSize: 26, marginTop: 6 }}>Recently deleted</T>
        <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 4, marginBottom: 18, lineHeight: 20 }}>
          Kept for 30 days after you delete a day, then gone for good.
        </T>

        {trash.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <T w={600} color={c.muted} style={{ fontSize: 14, textAlign: 'center' }}>Nothing here right now.</T>
          </Card>
        ) : (
          <View style={{ gap: 12 }}>
            {trash.map((item) => (
              <Card key={item.dayKey} style={{ padding: 16 }}>
                <T d w={700} color={c.ink} style={{ fontSize: 15, marginBottom: 3 }}>{item.wd}, {item.day} {item.mon}</T>
                <T w={400} color={c.muted} numberOfLines={2} style={{ fontSize: 13.5, lineHeight: 19.5, marginBottom: 12 }}>{item.did}</T>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Pressable onPress={() => handleRestore(item)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 999, backgroundColor: c.accentSoft }}>
                    <RestoreIcon size={15} color={c.accentDeep} />
                    <T w={800} color={c.accentDeep} style={{ fontSize: 13 }}>Restore</T>
                    {!plus && plusEnabled ? <Sun size={12} color={c.accentDeep} /> : null}
                  </Pressable>
                  <Pressable onPress={() => confirmForget(item)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: c.border }}>
                    <Close size={13} color={c.red} />
                    <T w={800} color={c.red} style={{ fontSize: 13 }}>Delete forever</T>
                  </Pressable>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
