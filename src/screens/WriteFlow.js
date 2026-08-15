// WriteFlow.js — three-step guided entry (did / wished / mood). Ported from
// WriteFlow. Rendered full-screen inside a Modal by RitualsApp.

import React, { useState } from 'react';
import { View, ScrollView, TextInput, Pressable, Text } from 'react-native';
import { useTheme } from '../theme';
import { T, PrimaryButton } from '../ui';
import { Sun, Chevron, Close } from '../icons';
import { MOODS, MOOD_PALETTE, moodEmoji } from '../data';
import { isEmojiish, stripEmoji } from '../entries/emojiInput';
import { allMoodChips } from '../entries/moodChipOrder';
import { moodNameError } from '../entries/renameMood';
import { todayLabel } from '../time/clock';
import { useKeyboardHeight } from '../ui/useKeyboardHeight';
import IconBtn from '../ui/IconBtn';

const countWords = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);

export default function WriteFlow({ copy, insets, onClose, onComplete, initial, customMoods = [], customMoodEmoji = {}, onAddCustomMood }) {
  const t = useTheme();
  const c = t.colors;

  const [step, setStep] = useState(0);
  const [did, setDid] = useState(initial?.did ?? '');
  const [wished, setWished] = useState(initial?.wished ?? '');
  const [moods, setMoods] = useState(initial?.moods ?? []);
  const [customInput, setCustomInput] = useState('');
  const [emojiPick, setEmojiPick] = useState(MOOD_PALETTE[0]);
  const [emojiTyped, setEmojiTyped] = useState('');

  const startFresh = () => {
    setDid(''); setWished(''); setMoods([]); setCustomInput('');
    setEmojiPick(MOOD_PALETTE[0]); setEmojiTyped(''); setStep(0);
  };

  const steps = [
    { q: copy.q1, help: copy.q1help, val: did, set: setDid, ph: 'Start anywhere…' },
    { q: copy.q2, help: copy.q2help, val: wished, set: setWished, ph: 'Be honest, be kind…' },
  ];
  const isMood = step === 2;
  const cur = steps[step];
  const last = step === 2;
  const canNext = isMood ? moods.length > 0 : countWords(cur ? cur.val : '') >= 1;
  const customError = customInput.trim() ? moodNameError(customInput, { customMoods }) : null;

  const toggleMood = (m) => setMoods((ms) => (ms.includes(m) ? ms.filter((x) => x !== m) : [...ms, m]));

  const onEmojiTyped = (v) => {
    setEmojiTyped(v);
    if (isEmojiish(v)) setEmojiPick(v);
  };

  const pickPaletteEmoji = (e) => { setEmojiPick(e); setEmojiTyped(''); };

  const addCustomMood = () => {
    const m = customInput.trim();
    if (!m) return;
    if (moodNameError(m, { customMoods })) return;   // the rename path's rule, on the create path (IMP-069)
    if (!moods.includes(m)) setMoods((ms) => [...ms, m]);
    if (onAddCustomMood) onAddCustomMood(m, emojiPick);
    setCustomInput('');
    setEmojiPick(MOOD_PALETTE[0]);
    setEmojiTyped('');
  };

  const next = () => { if (last) onComplete({ did, wished, moods }); else setStep(step + 1); };
  const back = () => { if (step === 0) onClose(); else setStep(step - 1); };
  // The outer View's paddingBottom: kb reserves the keyboard's own height at
  // the bottom of the flex column, which is what actually lifts Foot above
  // it. Foot keeps its normal safe-area padding on top of that (not zeroed)
  // as a margin of safety — different devices/nav-bar modes were found to
  // report slightly different keyboard heights, and a small gap is far
  // better than a clipped button.
  const kb = useKeyboardHeight();

  return (
    <View style={{ flex: 1, backgroundColor: c.cream, paddingTop: insets.top, paddingBottom: kb }}>
      {/* top bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6 }}>
        <IconBtn onPress={back} label={step === 0 ? 'Close this entry' : 'Back a step'}>
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
          <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 12, paddingBottom: 18, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <T d w={600} color={c.muted} style={{ fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' }}>{copy.epitaph} {todayLabel()}</T>
            <T d w={700} color={c.ink} style={{ fontSize: 27, lineHeight: 32, marginTop: 8, marginBottom: 4 }}>{copy.moodQ}</T>
            <T w={600} color={c.muted} style={{ fontSize: 14, lineHeight: 19.6 }}>{copy.moodHelp}</T>
            {/* Reads the state toggleMood writes (IMP-069). It is the only copy that says
                the chips turn back off, and it is what tells a walk whether a tap that
                changed nothing on screen reached the reducer at all. */}
            <T w={700} color={moods.length ? c.accentDeep : c.muted} style={{ fontSize: 13, marginTop: 10, lineHeight: 18 }}>
              {moods.length
                ? `${moods.length} chosen · ${moods.join(', ')}`
                : 'Pick at least one — tap a chosen one again to take it back.'}
            </T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
              {allMoodChips(MOODS, customMoods).map((m) => {
                const sel = moods.includes(m);
                return (
                  <Pressable
                    key={m}
                    onPress={() => toggleMood(m)}
                    accessibilityRole="button"
                    accessibilityLabel={m}
                    accessibilityState={{ selected: sel }}
                    style={[
                      { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 15, paddingVertical: 11, borderRadius: 999, borderWidth: 1.5 },
                      sel
                        ? { backgroundColor: c.accent, borderColor: c.accent }
                        : { backgroundColor: c.surface, borderColor: c.border },
                      sel && t.shadow(8, c.accentDeep, 0.8),
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>{moodEmoji(m, customMoodEmoji)}</Text>
                    <T w={700} color={sel ? c.onAccent : c.ink} style={{ fontSize: 15 }}>{m}</T>
                  </Pressable>
                );
              })}
            </View>
            {/* Name your own — one headed group with two numbered steps (IMP-066). It was
                three unlabelled rows before, and "or type one…" had nothing to be an
                alternative *to*. */}
            <View style={{ marginTop: 26, paddingTop: 16, borderTopWidth: 1, borderTopColor: c.border }}>
              <T d w={700} color={c.ink} style={{ fontSize: 16 }}>Name your own</T>
              <T w={600} color={c.muted} style={{ fontSize: 13, marginTop: 2, lineHeight: 18 }}>
                Give it a face, then a name.
              </T>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 }}>
                <T w={800} color={c.muted} style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase' }}>1 · Its face</T>
                <View style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: c.accent, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 18 }}>{emojiPick}</Text>
                </View>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8, marginTop: 10, paddingRight: 8 }}>
                {MOOD_PALETTE.map((e) => {
                  const sel = emojiPick === e;
                  return (
                    <Pressable
                      key={e}
                      onPress={() => pickPaletteEmoji(e)}
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
                placeholder="or type one…"
                placeholderTextColor={c.placeholder}
                autoCorrect={false}
                maxLength={12}
                style={{
                  marginTop: 10, width: 90, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999,
                  borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface,
                  fontFamily: t.body(600), fontSize: 14, color: c.ink,
                }}
              />

              <T w={800} color={c.muted} style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 18 }}>2 · Its name</T>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <TextInput
                  value={customInput}
                  onChangeText={(v) => setCustomInput(stripEmoji(v))}
                  placeholder="Name your own…"
                  placeholderTextColor={c.placeholder}
                  maxLength={24}
                  onSubmitEditing={addCustomMood}
                  style={{
                    flex: 1, paddingHorizontal: 15, paddingVertical: 11, borderRadius: 999,
                    borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface,
                    fontFamily: t.body(600), fontSize: 14, color: c.ink,
                  }}
                />
                <Pressable
                  onPress={addCustomMood}
                  disabled={!customInput.trim() || !!customError}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 11, borderRadius: 999,
                    backgroundColor: customInput.trim() && !customError ? c.accent : c.border,
                  }}
                >
                  <T w={700} color={customInput.trim() && !customError ? c.onAccent : c.muted} style={{ fontSize: 14 }}>Add</T>
                </Pressable>
              </View>
              {customError ? (
                <T w={700} color={c.red} style={{ fontSize: 12.5, marginTop: 8 }}>{customError}</T>
              ) : null}
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
    </View>
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

