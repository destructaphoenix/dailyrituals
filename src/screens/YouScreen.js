// YouScreen.js — profile + settings. New tab. The Appearance / Tone rows
// drive real app state (passed down from App.js).

import React, { useState } from 'react';
import { View, ScrollView, Pressable, Alert, Modal } from 'react-native';
import { useTheme } from '../theme';
import { T, Card, ProgressBar } from '../ui';
import { Bell, Contrast, Pencil, Download, Info, Chevron, Sun, Moon, Bag, Ember, Restore, UserIcon, Alert as AlertIcon, ChartIcon, Feather } from '../icons';
import { PlusBanner } from '../shopui';
import { profileIdentity } from '../profile/identity';
import { lastBackupLabel } from '../backup/lastBackupLabel';
import { backupHealth } from '../backup/backupHealth';
import { formatBackupDate } from '../persistence/restoreDetect';
import { recapYears } from '../recap/annualRecap';
import NameEditModal from './NameEditModal';
import TipCard from './TipCard';
import Row from '../ui/Row';
import { CHROME_FONT_SCALE } from '../ui/textScale';
import { EXPLAINERS } from '../content/tips';

export default function YouScreen({
  mode, onToggleMode, settings, setSettings,
  streak, level, levelName, xpInto, xpToNext, entriesCount, badgesEarned, onOpenAchievements,
  embers, plus, onOpenShop, onOpenPaywall, onOpenManage, onRestorePurchases, plusEnabled = true, onResetData,
  lastBackupAt, onExportData, onImportData, onExplainAutoBackup, onOpenDev,
  pendingRestore, onReopenPendingRestore, onDiscardPendingRestore,
  reminderValue, onOpenReminder, onOpenPlusPerks,
  trashCount = 0, onOpenTrash,
  customMoodsCount = 0, onOpenMoodManager,
  promptPackName, onOpenPromptPacks,
  tip, onDismissTip,
  entries = [], onOpenAnnualRecap,
}) {
  const t = useTheme();
  const c = t.colors;
  const dark = mode === 'night';

  const { display, initial } = profileIdentity(settings.name);
  const [editingName, setEditingName] = useState(false);
  const health = backupHealth(lastBackupAt);
  const offerableYears = plusEnabled ? recapYears(entries, new Date()) : [];
  // A milestone reads as "exactly N" rather than "N or more" so it needs no
  // dismissal state — it naturally stops firing the day after, same spirit
  // as every other derived-not-persisted signal in this app.
  const atBackupMilestone = entriesCount === 100 || entriesCount === 365;
  const setTone = () => setSettings((s) => ({ ...s, tone: s.tone === 'gentle' ? 'playful' : 'gentle' }));
  const saveName = (clean) => { setSettings((s) => ({ ...s, name: clean })); setEditingName(false); };
  const explainMechanic = (id) => {
    const e = EXPLAINERS.find((x) => x.id === id);
    if (!e) return;
    Alert.alert(e.title, e.body, [{ text: 'OK', style: 'cancel' }]);
  };
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
      {tip && (
        <View style={{ paddingHorizontal: 20 }}>
          <TipCard title={tip.title} body={tip.body} onDismiss={() => onDismissTip(tip.id)} />
        </View>
      )}

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
                <T w={800} color={c.accentDeep} maxFontSizeMultiplier={CHROME_FONT_SCALE} numberOfLines={1} style={{ fontSize: 12 }}>Lv {level} · {levelName}</T>
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
        {plusEnabled && onOpenPlusPerks && (
          <Card>
            <Row icon={<Sun size={20} color={c.accentDeep} />} label="What's in Plus" onPress={onOpenPlusPerks} />
          </Card>
        )}
        {/* Reachable outside the paywall (IMP-043) — the one place a returning
            subscriber who looks non-Plus has a reason to look. Once `plus` is
            true, this same action lives in Manage subscription instead. */}
        {plusEnabled && !plus && onRestorePurchases && (
          <Card>
            <Row icon={<Restore size={20} color={c.accentDeep} />} label="Restore purchases"
              value="Already Plus?" onPress={onRestorePurchases} />
          </Card>
        )}
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

      {/* Annual Recap (IMP-046, Plus perk #4) — permanent, so it doesn't
          disappear for the eleven months the Home card is out of its window */}
      {plusEnabled && (
        <View style={{ paddingHorizontal: 20 }}>
          <T d w={700} color={c.ink} style={{ fontSize: 15, marginBottom: 10, marginLeft: 2 }}>Your years</T>
          <Card>
            {!plus ? (
              <Row icon={<ChartIcon size={20} color={c.accentDeep} />} label="Annual Recap"
                right={
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.accentSoft, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 }}>
                      <Sun size={11} color={c.accentDeep} />
                      <T d w={800} color={c.accentDeep} style={{ fontSize: 12.5 }}>Plus</T>
                    </View>
                    <Chevron dir="right" size={18} color={c.muted} />
                  </View>
                }
                onPress={onOpenPaywall} />
            ) : offerableYears.length === 0 ? (
              <Row icon={<ChartIcon size={20} color={c.accentDeep} />} label="Annual Recap"
                value="After your first year" />
            ) : (
              offerableYears.map((y, i) => (
                <React.Fragment key={y}>
                  {i > 0 && <Divider />}
                  <Row icon={<ChartIcon size={20} color={c.accentDeep} />} label={String(y)}
                    value="View" onPress={() => onOpenAnnualRecap(y)} />
                </React.Fragment>
              ))
            )}
          </Card>
        </View>
      )}

      {/* preferences */}
      <View style={{ paddingHorizontal: 20 }}>
        <T d w={700} color={c.ink} style={{ fontSize: 15, marginBottom: 10, marginLeft: 2 }}>Preferences</T>
        <Card>
          <Row icon={<Bell size={20} color={c.accentDeep} />} label="Daily reminder"
            value={reminderValue} onPress={onOpenReminder} />
          <Divider />
          <Row icon={<Contrast size={20} color={c.accentDeep} />} label="Appearance"
            value={dark ? 'Night' : 'Day'} onPress={onToggleMode} />
          <Divider />
          <Row icon={<Pencil size={20} color={c.accentDeep} />} label="Voice"
            value={settings.tone === 'gentle' ? 'Gentle' : 'Playful'} onPress={setTone} />
          <Divider />
          <Row icon={<Feather size={20} color={c.accentDeep} />} label="Writing prompts"
            value={promptPackName} onPress={onOpenPromptPacks} />
          <Divider />
          <Row icon={<UserIcon size={20} color={c.accentDeep} />} label="Your name"
            value={display} onPress={() => setEditingName(true)} />
        </Card>
      </View>

      {/* how it works — one honest explainer per mechanic */}
      <View style={{ paddingHorizontal: 20 }}>
        <T d w={700} color={c.ink} style={{ fontSize: 15, marginBottom: 10, marginLeft: 2 }}>How it works</T>
        <Card>
          {EXPLAINERS.map((e, i) => (
            <React.Fragment key={e.id}>
              {i > 0 && <Divider />}
              <Row icon={<Info size={20} color={c.accentDeep} />} label={e.label} onPress={() => explainMechanic(e.id)} />
            </React.Fragment>
          ))}
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
          {pendingRestore && (
            <>
              <Divider />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 15 }}>
                <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Restore size={20} color={c.accentDeep} />
                </View>
                <Pressable onPress={onReopenPendingRestore} style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.6 : 1 })}>
                  <T w={700} color={c.ink} numberOfLines={1} style={{ fontSize: 15.5 }}>Google backup</T>
                  <T w={700} color={c.muted} numberOfLines={1} style={{ fontSize: 13, marginTop: 2 }}>{formatBackupDate(pendingRestore.lastSavedAt)}</T>
                </Pressable>
                <Pressable onPress={onDiscardPendingRestore} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                  <T w={700} color={c.red} numberOfLines={1} style={{ fontSize: 13.5 }}>Discard</T>
                </Pressable>
              </View>
            </>
          )}
          {onOpenTrash && (
            <>
              <Divider />
              <Row icon={<Restore size={20} color={c.accentDeep} />} label="Recently deleted"
                value={trashCount > 0 ? String(trashCount) : undefined} onPress={onOpenTrash} />
            </>
          )}
          {onOpenMoodManager && (
            <>
              <Divider />
              <Row icon={<Pencil size={20} color={c.accentDeep} />} label="Your feelings"
                value={customMoodsCount > 0 ? String(customMoodsCount) : 'None yet'} onPress={onOpenMoodManager} />
            </>
          )}
        </Card>
        {health !== 'ok' ? (
          <BackupNudge
            icon={<AlertIcon size={16} color={c.accentDeep} />}
            text={health === 'never'
              ? "You haven't backed up your journal yet — if this device is lost, there's nothing to bring back."
              : "Your last backup was over 30 days ago. A lot has been written since."}
          />
        ) : atBackupMilestone ? (
          <BackupNudge
            icon={<Download size={16} color={c.accentDeep} />}
            text={`${entriesCount} days remembered — a good moment to back them up.`}
          />
        ) : null}
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

function BackupNudge({ icon, text }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingHorizontal: 4 }}>
      {icon}
      <T w={600} color={c.muted} numberOfLines={2} style={{ flex: 1, fontSize: 12.5, lineHeight: 17 }}>{text}</T>
    </View>
  );
}
