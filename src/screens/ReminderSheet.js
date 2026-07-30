// screens/ReminderSheet.js — presentational sheet for IMP-031's daily
// reminder: an on/off toggle plus a plain hour/minute stepper, in the shape
// of NameEditModal / RestoreNotice. Props in, callbacks out — no persistence,
// no native imports (RitualsApp owns state + calls src/reminders/io.js).
import React from 'react';
import { View, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../theme';
import { T, PrimaryButton } from '../ui';

function StepButton({ label, onPress }) {
  const c = useTheme().colors;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({
      width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1,
    })}>
      <T d w={800} color={c.accentDeep} style={{ fontSize: 18 }}>{label}</T>
    </Pressable>
  );
}

function to12(hour) {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const period = hour < 12 ? 'AM' : 'PM';
  return { h12, period };
}

function from12(h12, period) {
  const h = h12 % 12;
  return period === 'PM' ? h + 12 : h;
}

export default function ReminderSheet({ reminder, permission, onToggle, onTimeChange, onOpenSettings, onClose }) {
  const t = useTheme();
  const c = t.colors;
  const { enabled, hour, minute } = reminder;
  const { h12, period } = to12(hour);
  const isDenied = permission === 'denied';

  const stepHour = (delta) => {
    let next = h12 + delta;
    if (next > 12) next = 1;
    if (next < 1) next = 12;
    onTimeChange(from12(next, period), minute);
  };
  const stepMinute = (delta) => {
    let next = minute + delta;
    if (next >= 60) next = 0;
    if (next < 0) next = 55;
    onTimeChange(hour, next);
  };
  const togglePeriod = () => {
    const nextPeriod = period === 'AM' ? 'PM' : 'AM';
    onTimeChange(from12(h12, nextPeriod), minute);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}
    >
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={{ backgroundColor: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <T d w={800} color={c.ink} style={{ fontSize: 20 }}>Daily reminder</T>
          <Pressable
            onPress={() => onToggle(!enabled)}
            style={({ pressed }) => ({
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
              backgroundColor: enabled ? c.accent : c.border, opacity: pressed ? 0.8 : 1,
            })}
          >
            <T w={800} color={enabled ? c.onAccent : c.muted} style={{ fontSize: 13 }}>{enabled ? 'On' : 'Off'}</T>
          </Pressable>
        </View>

        {isDenied && (
          <View style={{ backgroundColor: c.redSoft, borderRadius: t.radius.sm, padding: 12, marginBottom: 16 }}>
            <T w={700} color={c.red} numberOfLines={3} style={{ fontSize: 13, lineHeight: 18 }}>
              Notifications are blocked in your phone settings, so this can't fire yet.
            </T>
            <Pressable onPress={onOpenSettings} style={{ marginTop: 8 }}>
              <T w={800} color={c.accentDeep} style={{ fontSize: 13 }}>Open phone settings</T>
            </Pressable>
          </View>
        )}

        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: enabled ? 1 : 0.4 }}
          pointerEvents={enabled ? 'auto' : 'none'}
        >
          <View style={{ alignItems: 'center', gap: 8 }}>
            <StepButton label="+" onPress={() => stepHour(1)} />
            <T d w={800} color={c.ink} style={{ fontSize: 22, minWidth: 32, textAlign: 'center' }}>{h12}</T>
            <StepButton label="–" onPress={() => stepHour(-1)} />
          </View>
          <T d w={800} color={c.ink} style={{ fontSize: 22 }}>:</T>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <StepButton label="+" onPress={() => stepMinute(5)} />
            <T d w={800} color={c.ink} style={{ fontSize: 22, minWidth: 32, textAlign: 'center' }}>{String(minute).padStart(2, '0')}</T>
            <StepButton label="–" onPress={() => stepMinute(-5)} />
          </View>
          <Pressable
            onPress={togglePeriod}
            style={({ pressed }) => ({
              paddingHorizontal: 12, paddingVertical: 10, borderRadius: t.radius.sm,
              borderWidth: 1.5, borderColor: c.border, opacity: pressed ? 0.7 : 1,
            })}
          >
            <T w={800} color={c.accentDeep} style={{ fontSize: 15 }}>{period}</T>
          </Pressable>
        </View>

        <View style={{ marginTop: 22 }}>
          <PrimaryButton label="Done" onPress={onClose} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
