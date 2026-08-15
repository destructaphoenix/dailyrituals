// screens/MoodManager.js — rename, re-emoji or remove the feelings a user
// named themselves (IMP-055). Full-screen Modal sheet in the idiom of
// TrashSheet.js. Only `settings.customMoods` is listed here — the 8 built-in
// moods are untouchable and never appear.

import React, { useState } from 'react';
import { View, ScrollView, TextInput, Pressable, Text, Alert } from 'react-native';
import { useTheme } from '../theme';
import { T, Card } from '../ui';
import { Chevron, Pencil, Close } from '../icons';
import { MOOD_PALETTE, moodEmoji } from '../data';
import { firstEmoji, stripEmoji } from '../entries/emojiInput';
import { moodNameError } from '../entries/renameMood';

export default function MoodManager({ customMoods = [], customMoodEmoji = {}, insets, onClose, onRenameMood, onDeleteMood }) {
  const t = useTheme();
  const c = t.colors;

  // The mood currently being edited (its original name), or null.
  const [editing, setEditing] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [emojiPick, setEmojiPick] = useState(MOOD_PALETTE[0]);
  const [emojiTyped, setEmojiTyped] = useState('');

  const startEdit = (name) => {
    setEditing(name);
    setNameInput(name);
    setEmojiPick(customMoodEmoji[name] || MOOD_PALETTE[0]);
    setEmojiTyped('');
  };
  const cancelEdit = () => setEditing(null);

  // One emoji, kept as it is typed (IMP-070) — a face has to fit a 34dp circle,
  // a chip and a heatmap cell. Anything that isn't an emoji leaves the field empty.
  const onEmojiTyped = (v) => {
    const one = firstEmoji(v);
    setEmojiTyped(one);
    if (one) setEmojiPick(one);
  };

  const error = editing !== null ? moodNameError(nameInput, { customMoods, existing: editing }) : null;

  const saveEdit = () => {
    const trimmed = nameInput.trim();
    if (moodNameError(trimmed, { customMoods, existing: editing })) return;
    onRenameMood(editing, trimmed, emojiPick);
    setEditing(null);
  };

  const confirmRemove = (name) => {
    Alert.alert(
      `Remove ${name}?`,
      `Remove ${name} from your list? Days you already marked with it keep it.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onDeleteMood(name) },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.cream, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6 }}>
        <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close your feelings"
          style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: c.ghostBtn, opacity: pressed ? 0.6 : 1 })}>
          <Chevron dir="left" size={22} color={c.ink} />
        </Pressable>
        <T w={700} color={c.muted} style={{ fontSize: 12 }}>{customMoods.length} feeling{customMoods.length === 1 ? '' : 's'}</T>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 30 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <T d w={800} color={c.ink} style={{ fontSize: 26, marginTop: 6 }}>Your feelings</T>
        <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 4, lineHeight: 20 }}>
          The moods you've named yourself, beyond the built-in eight.
        </T>

        {customMoods.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center', marginTop: 18 }}>
            <T w={600} color={c.muted} style={{ fontSize: 14, textAlign: 'center' }}>The feelings you name yourself will live here.</T>
          </Card>
        ) : (
          <View style={{ gap: 12, marginTop: 18 }}>
            {customMoods.map((m) => (
              <Card key={m} style={{ padding: 16 }}>
                {editing === m ? (
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={{ fontSize: 20 }}>{emojiPick}</Text>
                      <TextInput
                        value={nameInput}
                        onChangeText={(v) => setNameInput(stripEmoji(v))}
                        maxLength={24}
                        autoFocus
                        style={{
                          flex: 1, paddingHorizontal: 15, paddingVertical: 11, borderRadius: 999,
                          borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface,
                          fontFamily: t.body(600), fontSize: 14, color: c.ink,
                        }}
                      />
                    </View>
                    {error ? (
                      <T w={700} color={c.red} style={{ fontSize: 12.5, marginTop: 8 }}>{error}</T>
                    ) : null}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 12, paddingRight: 8 }}>
                      {MOOD_PALETTE.map((e) => {
                        const sel = emojiPick === e;
                        return (
                          <Pressable
                            key={e}
                            onPress={() => { setEmojiPick(e); setEmojiTyped(''); }}
                            accessibilityLabel={`Choose ${e} for your custom mood`}
                            style={{
                              width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
                              borderWidth: sel ? 2 : 0, borderColor: c.accent, backgroundColor: c.surface,
                            }}
                          >
                            <Text style={{ fontSize: 17 }}>{e}</Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                    <TextInput
                      value={emojiTyped}
                      onChangeText={onEmojiTyped}
                      placeholder="or any emoji…"
                      placeholderTextColor={c.placeholder}
                      autoCorrect={false}
                      maxLength={12}
                      style={{
                        marginTop: 10, width: 110, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999,
                        borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface,
                        fontFamily: t.body(600), fontSize: 14, color: c.ink,
                      }}
                    />
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                      <Pressable onPress={cancelEdit} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: c.border }}>
                        <T w={800} color={c.muted} style={{ fontSize: 13 }}>Cancel</T>
                      </Pressable>
                      <Pressable onPress={saveEdit} disabled={!!error} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 999, backgroundColor: error ? c.border : c.accent }}>
                        <T w={800} color={error ? c.muted : c.onAccent} style={{ fontSize: 13 }}>Save</T>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Text style={{ fontSize: 20 }}>{moodEmoji(m, customMoodEmoji)}</Text>
                    <T w={700} color={c.ink} style={{ flex: 1, fontSize: 15.5 }}>{m}</T>
                    <Pressable onPress={() => startEdit(m)} hitSlop={8} accessibilityLabel={`Edit ${m}`} style={{ padding: 6 }}>
                      <Pencil size={18} color={c.accentDeep} />
                    </Pressable>
                    <Pressable onPress={() => confirmRemove(m)} hitSlop={8} accessibilityLabel={`Remove ${m}`} style={{ padding: 6 }}>
                      <Close size={18} color={c.red} />
                    </Pressable>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
