// screens/PromptPacks.js — IMP-058's pack picker: a small bottom sheet, in
// the shape of ReminderSheet. Picks which pool selectPrompt() deals from.
import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { T } from '../ui';
import { PROMPT_PACKS } from '../content/packs';

export default function PromptPacks({ activePackId, onSelect, onClose }) {
  const t = useTheme();
  const c = t.colors;

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={{ backgroundColor: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 }}>
        <T d w={800} color={c.ink} style={{ fontSize: 20 }}>Writing prompts</T>
        <T w={600} color={c.muted} style={{ fontSize: 13, marginTop: 6, lineHeight: 18 }}>
          Changing packs reshuffles — you will not lose anything.
        </T>

        <ScrollView style={{ marginTop: 16 }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: 12 }}>
            {PROMPT_PACKS.map((pack) => {
              const active = pack.id === activePackId;
              return (
                <Pressable
                  key={pack.id}
                  onPress={() => onSelect(pack.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Use the ${pack.name} prompt pack`}
                  style={({ pressed }) => ({
                    padding: 14, borderRadius: t.radius.sm,
                    borderWidth: active ? 2 : 1.5, borderColor: active ? c.accent : c.border,
                    backgroundColor: c.cream, opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <T d w={800} color={c.ink} style={{ fontSize: 15.5 }}>{pack.name}</T>
                  <T w={600} color={c.muted} style={{ fontSize: 12.5, marginTop: 2 }}>{pack.blurb}</T>
                  <T w={600} color={c.accentDeep} numberOfLines={1} style={{ fontSize: 12.5, marginTop: 8, fontStyle: 'italic' }}>
                    "{pack.prompts[0]}"
                  </T>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
