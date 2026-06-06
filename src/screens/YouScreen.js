// YouScreen.js — profile + settings. New tab. The Appearance / Tone /
// Gamification rows drive real app state (passed down from App.js).

import React from 'react';
import { View, ScrollView, Pressable, Switch } from 'react-native';
import { useTheme } from '../theme';
import { T, Card, ProgressBar } from '../ui';
import { Bell, Contrast, Pencil, Diamond, Download, Info, Chevron, Sun, Moon, Bag, Ember } from '../icons';
import { PlusBanner } from '../shopui';
import { profileIdentity } from '../profile/identity';

export default function YouScreen({
  mode, onToggleMode, settings, setSettings,
  streak, xp, xpMax, level, levelName, entriesCount, badgesEarned, onOpenAchievements,
  embers, plus, onOpenShop, onOpenPaywall, onOpenManage, plusEnabled = true,
}) {
  const t = useTheme();
  const c = t.colors;
  const dark = mode === 'night';

  const { display, initial } = profileIdentity(settings.name);
  const setTone = () => setSettings((s) => ({ ...s, tone: s.tone === 'gentle' ? 'playful' : 'gentle' }));
  const setGamify = (v) => setSettings((s) => ({ ...s, gamify: v }));

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 26, gap: 18 }}
      showsVerticalScrollIndicator={false}
    >
      {/* profile header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 6 }}>
        <Card style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={[{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }, t.shadow(12, c.accentDeep, 0.7)]}>
              <T d w={800} color="#fff" style={{ fontSize: 26 }}>{initial}</T>
            </View>
            <View style={{ flex: 1 }}>
              <T d w={800} color={c.ink} style={{ fontSize: 22 }}>{display}</T>
              <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, marginTop: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: c.accentSoft }}>
                {dark ? <Moon size={13} color={c.accentDeep} /> : <Sun size={13} color={c.accentDeep} />}
                <T w={800} color={c.accentDeep} style={{ fontSize: 12 }}>Lv {level} · {levelName}</T>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }}>
              <T w={700} color={c.muted} style={{ fontSize: 12 }}>Next level</T>
              <T w={700} color={c.muted} style={{ fontSize: 12 }}>{xp} / {xpMax} XP</T>
            </View>
            <ProgressBar value={Math.min(100, (xp / xpMax) * 100)} />
          </View>
        </Card>
      </View>

      {/* quick stats */}
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', gap: 12 }}>
        {[
          { v: String(streak), l: 'day streak' },
          { v: String(entriesCount), l: 'kept' },
          { v: String(badgesEarned), l: 'keepsakes', onPress: onOpenAchievements },
        ].map((s) => (
          <Pressable key={s.l} onPress={s.onPress} disabled={!s.onPress} style={({ pressed }) => ({ flex: 1, transform: [{ scale: pressed && s.onPress ? 0.97 : 1 }] })}>
            <Card style={{ paddingVertical: 16, alignItems: 'center' }}>
              <T d w={800} color={c.accentDeep} style={{ fontSize: 26 }}>{s.v}</T>
              <T w={700} color={c.muted} style={{ fontSize: 11.5, marginTop: 2 }}>{s.l}</T>
            </Card>
          </Pressable>
        ))}
      </View>

      {/* Plus + Shop */}
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {plusEnabled && <PlusBanner plus={plus} onOpenPaywall={onOpenPaywall} onManage={onOpenManage} compact />}
        <Pressable onPress={onOpenShop} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.99 : 1 }] })}>
          <Card>
            <Row icon={<Bag size={20} color={c.accentDeep} />} label="Shop"
              right={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.accentSoft, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 }}>
                    <Ember size={14} deep={c.accentDeep} />
                    <T d w={800} color={c.accentDeep} style={{ fontSize: 13 }}>{embers}</T>
                  </View>
                  <Chevron dir="right" size={18} color={c.muted} />
                </View>
              } />
          </Card>
        </Pressable>
      </View>

      {/* preferences */}
      <View style={{ paddingHorizontal: 20 }}>
        <T d w={700} color={c.ink} style={{ fontSize: 15, marginBottom: 10, marginLeft: 2 }}>Preferences</T>
        <Card>
          <Row icon={<Bell size={20} color={c.accentDeep} />} label="Daily reminder"
            value="8:30 PM" onPress={() => {}} />
          <Divider />
          <Row icon={<Contrast size={20} color={c.accentDeep} />} label="Appearance"
            value={dark ? 'Night' : 'Day'} onPress={onToggleMode} />
          <Divider />
          <Row icon={<Pencil size={20} color={c.accentDeep} />} label="Voice"
            value={settings.tone === 'gentle' ? 'Gentle' : 'Playful'} onPress={setTone} />
          <Divider />
          <Row icon={<Diamond size={18} color={c.accentDeep} />} label="Gamification"
            right={
              <Switch
                value={settings.gamify !== false}
                onValueChange={setGamify}
                trackColor={{ false: c.border, true: c.accent }}
                thumbColor="#fff"
                ios_backgroundColor={c.border}
              />
            } />
        </Card>
      </View>

      {/* general */}
      <View style={{ paddingHorizontal: 20 }}>
        <T d w={700} color={c.ink} style={{ fontSize: 15, marginBottom: 10, marginLeft: 2 }}>General</T>
        <Card>
          <Row icon={<Download size={20} color={c.accentDeep} />} label="Export reflections"
            right={plus
              ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><T w={700} color={c.muted} style={{ fontSize: 14 }}>PDF</T><Chevron dir="right" size={18} color={c.muted} /></View>
              : plusEnabled
                ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.accentSoft, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 }}>
                      <Sun size={11} color={c.accentDeep} />
                      <T d w={800} color={c.accentDeep} style={{ fontSize: 12.5 }}>Plus</T>
                    </View>
                    <Chevron dir="right" size={18} color={c.muted} />
                  </View>
                : <Chevron dir="right" size={18} color={c.muted} />}
            onPress={plus ? () => {} : plusEnabled ? onOpenPaywall : undefined} />
          <Divider />
          <Row icon={<Info size={20} color={c.accentDeep} />} label="About Daily Rituals"
            value="v1.0" onPress={() => {}} />
        </Card>
      </View>
    </ScrollView>
  );
}

function Row({ icon, label, value, right, onPress }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 15, opacity: pressed && onPress ? 0.6 : 1 }]}
    >
      <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </View>
      <T w={700} color={c.ink} style={{ flex: 1, fontSize: 15.5 }}>{label}</T>
      {right || (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {value ? <T w={700} color={c.muted} style={{ fontSize: 14 }}>{value}</T> : null}
          {onPress ? <Chevron dir="right" size={18} color={c.muted} /> : null}
        </View>
      )}
    </Pressable>
  );
}

function Divider() {
  const t = useTheme();
  return <View style={{ height: 1, backgroundColor: t.colors.border, marginLeft: 66 }} />;
}
