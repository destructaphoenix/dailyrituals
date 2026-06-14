// WriteFlow.js — three-step guided entry (did / wished / mood). Ported from
// WriteFlow. Rendered full-screen inside a Modal by RitualsApp.

import React, { useState } from 'react';
import { View, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { useTheme } from '../theme';
import { T, PrimaryButton } from '../ui';
import { Sun, Chevron, Close } from '../icons';
import { MOODS, moodEmoji } from '../data';
import { todayLabel } from '../time/clock';

const countWords = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);

export default function WriteFlow({ copy, insets, onClose, onComplete, initial }) {
  const t = useTheme();
  const c = t.colors;

  const [step, setStep] = useState(0);
  const [did, setDid] = useState(initial?.did ?? '');
  const [wished, setWished] = useState(initial?.wished ?? '');
  const [mood, setMood] = useState(initial?.mood ?? null);

  const startFresh = () => { setDid(''); setWished(''); setMood(null); setStep(0); };

  const steps = [
    { q: copy.q1, help: copy.q1help, val: did, set: setDid, ph: 'Start anywhere…' },
    { q: copy.q2, help: copy.q2help, val: wished, set: setWished, ph: 'Be honest, be kind…' },
  ];
  const isMood = step === 2;
  const cur = steps[step];
  const last = step === 2;
  const canNext = isMood ? !!mood : countWords(cur ? cur.val : '') >= 1;

  const next = () => { if (last) onComplete({ did, wished, mood }); else setStep(step + 1); };
  const back = () => { if (step === 0) onClose(); else setStep(step - 1); };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: c.cream, paddingTop: insets.top }}
    >
      {/* top bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6 }}>
        <IconBtn onPress={back}>
          {step === 0 ? <Close size={18} color={c.ink} /> : <Chevron dir="left" size={20} color={c.ink} />}
        </IconBtn>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{
              width: i === step ? 30 : 26, height: 6, borderRadius: 999,
              backgroundColor: i === step ? c.accent : i < step ? c.accentDeep : c.border,
            }} />
          ))}
        </View>
        {initial ? (
          <Pressable onPress={startFresh} style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
            <T w={600} color={c.muted} style={{ fontSize: 13 }}>Start fresh</T>
          </Pressable>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      {!isMood ? (
        <>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 12, paddingBottom: 18, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <T d w={600} color={c.muted} style={{ fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' }}>{copy.epitaph} {todayLabel()}</T>
            <T d w={700} color={c.ink} style={{ fontSize: 27, lineHeight: 32, marginTop: 8, marginBottom: 4 }}>{cur.q}</T>
            <T w={600} color={c.muted} style={{ fontSize: 14, lineHeight: 19.6 }}>{cur.help}</T>
            <TextInput
              value={cur.val}
              onChangeText={cur.set}
              placeholder={cur.ph}
              placeholderTextColor={c.placeholder}
              multiline
              style={{
                marginTop: 16, minHeight: 150, fontFamily: t.body(400),
                fontSize: 18, lineHeight: 29, color: c.ink, textAlignVertical: 'top',
              }}
            />
          </ScrollView>
          <Foot insets={insets}>
            <T w={700} color={c.muted} style={{ fontSize: 12 }}>{countWords(cur.val)} words</T>
            <PrimaryButton label="Next" onPress={next} disabled={!canNext} style={{ flex: 1 }} />
          </Foot>
        </>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 12, paddingBottom: 18, flexGrow: 1 }}>
            <T d w={600} color={c.muted} style={{ fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' }}>{copy.epitaph} {todayLabel()}</T>
            <T d w={700} color={c.ink} style={{ fontSize: 27, lineHeight: 32, marginTop: 8, marginBottom: 4 }}>{copy.moodQ}</T>
            <T w={600} color={c.muted} style={{ fontSize: 14, lineHeight: 19.6 }}>{copy.moodHelp}</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
              {MOODS.map((m) => {
                const sel = mood === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMood(m)}
                    style={[
                      { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 15, paddingVertical: 11, borderRadius: 999, borderWidth: 1.5 },
                      sel
                        ? { backgroundColor: c.accent, borderColor: c.accent }
                        : { backgroundColor: c.surface, borderColor: c.border },
                      sel && t.shadow(8, c.accentDeep, 0.8),
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>{moodEmoji(m)}</Text>
                    <T w={700} color={sel ? c.onAccent : c.ink} style={{ fontSize: 15 }}>{m}</T>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
          <Foot insets={insets}>
            <PrimaryButton
              label={copy.finish}
              onPress={next}
              disabled={!canNext}
              icon={<Sun size={19} color={c.onAccent} />}
              style={{ flex: 1 }}
            />
          </Foot>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

function Foot({ insets, children }) {
  const t = useTheme();
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 22, paddingTop: 12, paddingBottom: 12 + insets.bottom,
      borderTopWidth: 1, borderTopColor: t.colors.border, backgroundColor: t.colors.surface,
    }}>
      {children}
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
