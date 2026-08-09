// screens/TrashSheet.js — "Recently deleted" list (IMP-036 / IMP-048).
// Deleting a day is free forever. Bringing one back is free for the first
// three, after which it is the Plus half — keeping a safety copy is our work,
// charging someone to un-write their own grief is not.
//
// The allowance is stated on this screen BEFORE it is spent, and the Restore
// button reads its own state. A button that looks live and silently does
// nothing is the defect this rewrite exists to remove (IMP-048).

import React from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { useTheme } from '../theme';
import { T, Card } from '../ui';
import { Chevron, Restore as RestoreIcon, Close, Sun } from '../icons';
import { FREE_RESTORES, restoreAccess } from '../entries/restoreAllowance';

// One sentence, always visible, stating exactly what the user has left.
function allowanceCopy(access) {
  switch (access.kind) {
    case 'plus':
      return 'Plus is yours — bring back any day, any time.';
    case 'free':
      return access.left === FREE_RESTORES
        ? `Bringing a day back is free your first ${FREE_RESTORES} times. All ${FREE_RESTORES} are still yours.`
        : `Bringing a day back is free ${FREE_RESTORES} times — ${access.left} ${access.left === 1 ? 'is' : 'are'} left.`;
    case 'locked':
      return `You've used all ${FREE_RESTORES} free restores. Plus brings back any day, any time.`;
    default:
      return `You've used all ${FREE_RESTORES} free restores. Bringing days back becomes part of Plus, which isn't on sale yet.`;
  }
}

export default function TrashSheet({ trash, insets, onClose, onRestore, onDeleteForever, plus, plusEnabled, freeRestoresUsed = 0, onOpenPaywall }) {
  const t = useTheme();
  const c = t.colors;
  const access = restoreAccess({ used: freeRestoresUsed, plus, plusEnabled });
  const canRestore = access.kind === 'free' || access.kind === 'plus';

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

  // Restoring is irreversible in the sense that the free one is spent, so the
  // last free restore says so before it goes. Alert (not the app's Toast) is
  // deliberate: this screen is inside a Modal, and a Toast rendered in
  // RitualsApp's tree sits BEHIND it — invisible until the sheet closes.
  const handleRestore = (item) => {
    if (access.kind === 'plus') { onRestore(item.dayKey); return; }

    if (access.kind === 'free') {
      const after = access.left - 1;
      Alert.alert(
        'Bring this day back?',
        `${item.wd}, ${item.day} ${item.mon} returns to your journal.\n\n` +
        `This uses one of your ${FREE_RESTORES} free restores — ` +
        (after === 0
          ? "it's your last one. After this, bringing days back is part of Plus."
          : `${after} would be left after it.`),
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Bring it back', onPress: () => onRestore(item.dayKey) },
        ]
      );
      return;
    }

    if (access.kind === 'locked') {
      Alert.alert(
        'Restoring is part of Plus',
        `You've used all ${FREE_RESTORES} free restores. Plus brings back any day, any time.\n\n` +
        'This day stays here for the rest of its 30 days either way.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'See Plus', onPress: onOpenPaywall },
        ]
      );
      return;
    }

    Alert.alert(
      'Restoring is part of Plus',
      `You've used all ${FREE_RESTORES} free restores. Bringing days back becomes part of Plus, which isn't on sale yet — ` +
      'it will unlock here when it is.\n\n' +
      'This day stays here for the rest of its 30 days either way.',
      [{ text: 'Got it' }]
    );
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
        <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 4, lineHeight: 20 }}>
          Kept for 30 days after you delete a day, then gone for good.
        </T>

        {/* The allowance, stated up front — never discovered by pressing. */}
        <Card style={{ padding: 14, marginTop: 14, marginBottom: 18, flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
          {canRestore
            ? <RestoreIcon size={17} color={c.accentDeep} />
            : <Sun size={17} color={c.accentDeep} />}
          <View style={{ flex: 1 }}>
            <T w={600} color={c.ink} style={{ fontSize: 13.5, lineHeight: 19.5 }}>
              {allowanceCopy(access)}
            </T>
            {access.kind === 'locked' ? (
              <Pressable onPress={onOpenPaywall} hitSlop={6} style={{ marginTop: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 14, borderRadius: 999, backgroundColor: c.accentSoft }}>
                <Sun size={12} color={c.accentDeep} />
                <T w={800} color={c.accentDeep} style={{ fontSize: 12.5 }}>See what's in Plus</T>
              </Pressable>
            ) : null}
          </View>
        </Card>

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
                  <Pressable onPress={() => handleRestore(item)}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 999, backgroundColor: canRestore ? c.accentSoft : 'transparent', borderWidth: canRestore ? 0 : 1, borderColor: c.border }}>
                    {canRestore
                      ? <RestoreIcon size={15} color={c.accentDeep} />
                      : <Sun size={13} color={c.muted} />}
                    <T w={800} color={canRestore ? c.accentDeep : c.muted} style={{ fontSize: 13 }}>
                      {canRestore ? 'Restore' : 'Restore with Plus'}
                    </T>
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
