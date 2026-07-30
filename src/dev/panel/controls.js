// src/dev/panel/controls.js
// DEV-ONLY. Shared primitive controls for the harness panel sections —
// Stepper/Toggle (ported from the pre-split DevPanel.js) plus Segmented and
// TextField, which the Part A knobs need (mode, palette/sky/tone, plan,
// storePurchase/storeRestore, headlineFont, textLength, gaps, name).
import React from 'react';
import { View, Pressable, Switch, TextInput } from 'react-native';
import { useTheme } from '../../theme';
import { T } from '../../ui';
import { SENTINEL } from '../sentinel';

export const DEV_ID = `${SENTINEL}/panel/controls`;

export function Stepper({ label, value, onChange, step = 1, min = 0 }) {
  const c = useTheme().colors;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
      <T w={700} color={c.ink} style={{ fontSize: 15 }}>{label}</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={() => onChange(Math.max(min, value - step))} hitSlop={10}>
          <T w={800} color={c.accentDeep} style={{ fontSize: 22 }}>−</T>
        </Pressable>
        <T w={700} color={c.ink} style={{ fontSize: 15, minWidth: 44, textAlign: 'center' }}>{value}</T>
        <Pressable onPress={() => onChange(value + step)} hitSlop={10}>
          <T w={800} color={c.accentDeep} style={{ fontSize: 22 }}>+</T>
        </Pressable>
      </View>
    </View>
  );
}

export function Toggle({ label, value, onChange }) {
  const c = useTheme().colors;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
      <T w={700} color={c.ink} style={{ fontSize: 15 }}>{label}</T>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

// A row of selectable chips — `options` is [{ value, label }] or a plain
// string[] (label defaults to the value). `value` may be null/undefined —
// no chip highlights in that case (used for the tri-state `plan` knob).
export function Segmented({ label, value, options, onChange }) {
  const c = useTheme().colors;
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <View style={{ paddingVertical: 8 }}>
      <T w={700} color={c.ink} style={{ fontSize: 15, marginBottom: 6 }}>{label}</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {opts.map((o) => {
          const active = o.value === value;
          return (
            <Pressable
              key={String(o.value)}
              onPress={() => onChange(o.value)}
              style={{
                backgroundColor: active ? c.accentDeep : c.accentSoft,
                paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8,
              }}
            >
              <T w={700} color={active ? '#fff' : c.accentDeep} style={{ fontSize: 12 }}>{o.label}</T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function TextField({ label, value, onChange, placeholder }) {
  const c = useTheme().colors;
  return (
    <View style={{ paddingVertical: 8 }}>
      <T w={700} color={c.ink} style={{ fontSize: 15, marginBottom: 6 }}>{label}</T>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        style={{
          borderWidth: 1, borderColor: c.border, borderRadius: 8,
          paddingVertical: 8, paddingHorizontal: 10, color: c.ink, fontSize: 14,
        }}
      />
    </View>
  );
}
