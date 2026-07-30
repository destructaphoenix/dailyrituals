// src/dev/panel/LaunchSection.js
// DEV-ONLY. Direct-open buttons for overlays otherwise reachable only via a
// real trigger (a genuine streak milestone, a live purchase, an actual
// uninstall/restore cycle). Paywall + Manage subscription render in a LOCAL
// modal here — a dev-local bypass of RitualsApp's PLUS_ENABLED-gated modal,
// never a flip of PLUS_ENABLED itself (the app still ships free).
import React, { useState } from 'react';
import { View, Pressable, Modal } from 'react-native';
import { useTheme } from '../../theme';
import { T } from '../../ui';
import { buildEntries } from '../generateEntries';
import { STREAK_MILESTONES } from '../../data';
import Paywall from '../../screens/Paywall';
import { ManageSubscription } from '../../screens/PlusFlow';
import { Stepper } from './controls';
import { SENTINEL } from '../sentinel';

export const DEV_ID = `${SENTINEL}/panel/LaunchSection`;

function SectionLabel({ children }) {
  const c = useTheme().colors;
  return <T w={800} color={c.muted} style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 20, marginBottom: 4 }}>{children}</T>;
}

function LaunchRow({ label, onPress, hint }) {
  const c = useTheme().colors;
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 8 }}>
      <T w={700} color={c.accentDeep} style={{ fontSize: 15 }}>{label}</T>
      {hint ? <T color={c.muted} style={{ fontSize: 11, marginTop: 2 }}>{hint}</T> : null}
    </Pressable>
  );
}

export default function LaunchSection({
  onOpenCelebration, onOpenAchievements, onOpenShop, onOpenGetEmbers, onOpenReminder,
  onShowToast, onOpenReading, onOpenRestoreNotice, plusFlow, insets,
}) {
  const [milestoneStreak, setMilestoneStreak] = useState(7);
  const [restoreDaysAgo, setRestoreDaysAgo] = useState(3);
  const [devPaywall, setDevPaywall] = useState(false);
  const [devManage, setDevManage] = useState(false);

  return (
    <View>
      <SectionLabel>Overlays</SectionLabel>

      <Stepper label="Milestone streak" value={milestoneStreak} onChange={setMilestoneStreak} />
      <LaunchRow
        label="Celebration"
        hint={STREAK_MILESTONES[milestoneStreak] ? `milestone: ${STREAK_MILESTONES[milestoneStreak]}` : 'no milestone at this streak'}
        onPress={() => onOpenCelebration({ streak: milestoneStreak, milestone: STREAK_MILESTONES[milestoneStreak] || null })}
      />

      <LaunchRow label="Achievements" onPress={onOpenAchievements} />
      <LaunchRow label="Shop" onPress={onOpenShop} />
      <LaunchRow label="Get Embers" onPress={onOpenGetEmbers} />
      <LaunchRow label="Reminder sheet" onPress={onOpenReminder} />
      <LaunchRow label="Toast (sample)" onPress={() => onShowToast('This is a sample toast')} />
      <LaunchRow
        label="Reading sheet"
        onPress={() => onOpenReading(buildEntries({ count: 1, endDayKey: new Date().toISOString().slice(0, 10) })[0])}
      />

      <Stepper label="Restored days ago" value={restoreDaysAgo} onChange={setRestoreDaysAgo} />
      <LaunchRow label="Restore notice" onPress={() => onOpenRestoreNotice(restoreDaysAgo)} />

      <SectionLabel>Plus (dev-local — app ships free, PLUS_ENABLED stays false)</SectionLabel>
      <LaunchRow label="Paywall" onPress={() => setDevPaywall(true)} />
      <LaunchRow label="Manage subscription" onPress={() => setDevManage(true)} />

      <Modal visible={devPaywall} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setDevPaywall(false)}>
        <Paywall
          insets={insets} platform={plusFlow.platform} service={plusFlow.service} alreadyPlus={plusFlow.plus}
          onClose={() => setDevPaywall(false)} onSubscribe={plusFlow.onSubscribe} onLink={plusFlow.openLink}
        />
      </Modal>

      <Modal visible={devManage} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setDevManage(false)}>
        <ManageSubscription
          insets={insets} platform={plusFlow.platform} plan={plusFlow.livePlan} canceled={plusFlow.subCanceled}
          renewLabel={plusFlow.renewLabel} priceString={plusFlow.livePrice}
          onClose={() => setDevManage(false)}
          onChangePlan={() => { setDevManage(false); setDevPaywall(true); }}
          onRestore={plusFlow.onRestore} onCancel={plusFlow.onCancel} onResume={plusFlow.onResume}
          onLink={plusFlow.openLink} onGetHelp={plusFlow.onGetHelp}
        />
      </Modal>
    </View>
  );
}
