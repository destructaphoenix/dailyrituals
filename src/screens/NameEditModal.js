import React, { useState } from 'react';
import { View, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../theme';
import { T } from '../ui';
import { sanitizeName } from '../profile/identity';

export default function NameEditModal({ currentName, onSave, onClose }) {
  const t = useTheme();
  const c = t.colors;
  const [draft, setDraft] = useState(currentName || '');
  const clean = sanitizeName(draft);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}
    >
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={{ backgroundColor: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 }}>
        <T d w={800} color={c.ink} style={{ fontSize: 20, marginBottom: 16 }}>Your name</T>

        <TextInput
          style={{
            paddingVertical: 14, paddingHorizontal: 16,
            borderRadius: t.radius.btn, borderWidth: 1.5,
            borderColor: c.border, backgroundColor: c.cream,
            fontFamily: t.body(400), fontSize: 16, color: c.ink,
          }}
          placeholder="Your name"
          placeholderTextColor={c.placeholder}
          value={draft}
          onChangeText={setDraft}
          autoFocus
          maxLength={40}
        />

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              flex: 1, paddingVertical: 14, borderRadius: t.radius.btn,
              borderWidth: 1.5, borderColor: c.border,
              alignItems: 'center', opacity: pressed ? 0.6 : 1,
            })}
          >
            <T w={700} color={c.muted} style={{ fontSize: 15.5 }}>Cancel</T>
          </Pressable>

          <Pressable
            onPress={() => { if (clean) onSave(clean); }}
            disabled={!clean}
            style={({ pressed }) => ([
              { flex: 1, paddingVertical: 14, borderRadius: t.radius.btn, backgroundColor: c.accent, alignItems: 'center', opacity: pressed ? 0.75 : 1 },
              !clean && { opacity: 0.4 },
            ])}
          >
            <T w={700} color={c.onAccent} style={{ fontSize: 15.5 }}>Save</T>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
