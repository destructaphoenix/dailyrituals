// YouScreen.js — profile + settings. New tab. The Appearance / Tone rows
// drive real app state (passed down from App.js).

import React, { useState } from 'react';
import { View, ScrollView, Pressable, Alert, Modal } from 'react-native';
import { useTheme } from '../theme';
import { T, Card, ProgressBar } from '../ui';
import { Bell, Contrast, Pencil, Download, Info, Chevron, Sun, Moon, Bag, Ember, Restore, UserIcon } from '../icons';
import { PlusBanner } from '../shopui';
import { profileIdentity } from '../profile/identity';
import { lastBackupLabel } from '../backup/lastBackupLabel';
import NameEditModal from './NameEditModal';
import Row from '../ui/Row';

export default function YouScreen({
  mode, onToggleMode, settings, setSettings,
  streak, level, levelName, xpInto, xpToNext, entriesCount, badgesEarned, onOpenAchievements,
  embers, plus, onOpenShop, onOpenPaywall, onOpenManage, plusEnabled = true, onResetData,
  lastBackupAt, onExportData, onImportData, onExplainAutoBackup, onOpenDev,
}) {
  const t = useTheme();
  const c = t.colors;
  const dark = mode === 'night';

  const { display, initial } = profileIdentity(settings.name);
  const [editingName, setEditingName] = useState(false);
  const setTone = () => setSettings((s) => ({ ...s, tone: s.tone === 'gentle' ? 'playful' : 'gentle' }));
  const saveName = (clean) => { setSettings((s) => ({ ...s, name: clean })); setEditingName(false); };
  const confirmReset = () => {
    Alert.alert(
      'Reset all data',
      'This will erase your journal, streak, XP, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: onResetData },
      ]
    );
  };
  return (
    <>
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
              <T d w={800} color={c.onAccent} style={{ fontSize: 26 }}>{initial}</T>
            </View>
            <View style={{ flex: 1 }}>
              <T d w={800} color={c.ink} numberOfLines={2} style={{ fontSize: 22 }}>{display}</T>
              <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, marginTop: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: c.accentSoft }}>
                {dark ? <Moon size={13} color={c.accentDeep} /> : <Sun size={13} color={c.accentDeep} />}
                <T w={800} color={c.accentDeep} style={{ fontSize: 12 }}>Lv {level} · {levelName}</T>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }}>
              <T w={700} color={c.muted} numberOfLines={1} style={{ fontSize: 12, flexShrink: 1 }}>Next level</T>
              <T w={700} color={c.muted} style={{ fontSize: 12 }}>{xpToNext == null ? 'Max' : `${xpInto} / ${xpToNext} XP`}</T>
            </View>
            <ProgressBar value={xpToNext == null ? 100 : Math.min(100, (xpInto / xpToNext) * 100)} />
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
          <Row icon={<UserIcon size={20} color={c.accentDeep} />} label="Your name"
            value={display} onPress={() => setEditingName(true)} />
        </Card>
      </View>

      {/* backup & restore — data safety (free, distinct from the Plus PDF below) */}
      <View style={{ paddingHorizontal: 20 }}>
        <T d w={700} color={c.ink} style={{ fontSize: 15, marginBottom: 10, marginLeft: 2 }}>Your journal is safe</T>
        <Card>
          <Row icon={<Info size={20} color={c.accentDeep} />} label="Automatic backup"
            value="How it works" onPress={onExplainAutoBackup} />
          <Divider />
          <Row icon={<Download size={20} color={c.accentDeep} />} label="Back up my journal"
            value={lastBackupLabel(lastBackupAt)} onPress={onExportData} />
          <Divider />
          <Row icon={<Restore size={20} color={c.accentDeep} />} label="Restore from a backup"
            onPress={onImportData} />
        </Card>
      </View>

      {/* general */}
      <View style={{ paddingHorizontal: 20 }}>
        <T d w={700} color={c.ink} style={{ fontSize: 15, marginBottom: 10, marginLeft: 2 }}>General</T>
        <Card>
          <Row icon={<Download size={20} color={c.accentDeep} />} label="Save as PDF"
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
            value="v1.0" onPress={() => {}} onLongPress={onOpenDev} />
          {onResetData && (
            <>
              <Divider />
              <Row icon={<Restore size={20} color={c.red} />} label="Reset all data"
                labelColor={c.red} onPress={confirmReset} />
            </>
          )}
        </Card>
      </View>
    </ScrollView>

      <Modal visible={editingName} animationType="slide" transparent onRequestClose={() => setEditingName(false)}>
        <NameEditModal
          currentName={settings.name}
          onSave={saveName}
          onClose={() => setEditingName(false)}
        />
      </Modal>
    </>
  );
}

function Divider() {
  const t = useTheme();
  return <View style={{ height: 1, backgroundColor: t.colors.border, marginLeft: 66 }} />;
}
