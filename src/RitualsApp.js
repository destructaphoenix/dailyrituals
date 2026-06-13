// RitualsApp.js — state, navigation and chrome. Ported from rituals-app.jsx,
// then extended with the Insights and You tabs.
//
// Tab bar layout: [Today] [Insights] (✎ FAB) [Reflections] [You].
// Mode (day/night) and live settings come from App.js so the You tab can
// drive them. Overlays (write/read/celebrate) are RN Modals.

import React, { useState, useMemo } from 'react';
import { View, Pressable, Modal, StyleSheet, Platform, AppState } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext, makeTheme } from './theme';
import { T } from './ui';
import { HomeIcon, BookIcon, Pencil, ChartIcon, UserIcon } from './icons';
import { COPY, DAILY_QUESTS, STREAK_MILESTONES, SHOP_PALETTES, EMBER_GAIN, RENEW_DATE } from './data';
import HomeScreen from './screens/HomeScreen';
import ArchiveScreen from './screens/ArchiveScreen';
import InsightsScreen from './screens/InsightsScreen';
import YouScreen from './screens/YouScreen';
import ReadingSheet from './screens/ReadingSheet';
import WriteFlow from './screens/WriteFlow';
import Celebration from './screens/Celebration';
import Achievements from './screens/Achievements';
import Shop from './screens/Shop';
import Paywall from './screens/Paywall';
import { ManageSubscription } from './screens/PlusFlow';
import GetEmbers from './screens/GetEmbers';
import Toast from './screens/Toast';
import { openExternal } from './billing/links';
import { createPurchaseService, isBillingConfigured } from './billing';
import { PLUS_ENABLED } from './billing/config';
import { formatRenewDate } from './billing/format';
import { saveState } from './persistence/storage';
import { pickPersisted } from './persistence/state';
import { applyCompletion } from './home/completeEntry';
import { markRevisited } from './home/markRevisited';
import { findTodaysEntry, isEditableToday } from './home/todaysEntry';
import { levelFromXp } from './profile/level';
import { deriveAchievements } from './profile/achievements';
import { entryDateParts } from './time/clock';

const XP_GAIN = 50;
const PLATFORM = Platform.OS === 'android' ? 'android' : 'ios';
const todayKey = () => new Date().toISOString().slice(0, 10);

export default function RitualsApp({ mode = 'day', settings, setSettings, onToggleMode, initialPlus = false, initialState = {}, onResetData }) {
  const theme = useMemo(() => makeTheme(mode, settings), [mode, settings]);
  const c = theme.colors;
  const safe = useSafeAreaInsets();
  const insets = { top: safe.top || 12, bottom: safe.bottom || 8 };

  const copy = COPY[settings.tone] || COPY.gentle;
  const gamify = settings.gamify !== false;

  const [tab, setTab] = useState('today');
  const [writing, setWriting] = useState(false);
  const [reading, setReading] = useState(null);
  const [celebrate, setCelebrate] = useState(null);

  const [entries, setEntries] = useState(initialState.entries ?? []);
  const [streak, setStreak] = useState(initialState.streak ?? 0);
  const [xp, setXp] = useState(initialState.xp ?? 0);
  const [done, setDone] = useState(initialState.done ?? false);
  const [quests, setQuests] = useState(initialState.quests ?? DAILY_QUESTS);
  const [freezes, setFreezes] = useState(initialState.freezes ?? 0);
  const [showAch, setShowAch] = useState(false);

  // Live level derived from total XP (no hardcoded level).
  const { level, name: levelName, into: xpInto, toNext: xpToNext } = levelFromXp(xp);

  // Achievements derived from real entries + streak (no hardcoded progress).
  const achievements = useMemo(() => deriveAchievements(entries, streak), [entries, streak]);
  const badgesEarned = achievements.filter((a) => a.done).length;

  // ── Shop / Plus / Embers economy ──
  const [embers, setEmbers] = useState(initialState.embers ?? 0);
  const [plus, setPlus] = useState(initialState.plus ?? initialPlus);
  const [shopOpen, setShopOpen] = useState(false);
  const [getEmbersOpen, setGetEmbersOpen] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [activePalette, setActivePalette] = useState(initialState.activePalette ?? 'goldenhour');
  const [ownedPalettes, setOwnedPalettes] = useState(initialState.ownedPalettes ?? ['goldenhour']);
  const [activeSky, setActiveSky] = useState(initialState.activeSky ?? 'classic');
  const [ownedSkies, setOwnedSkies] = useState(initialState.ownedSkies ?? ['classic', 'crescent']);
  const [toast, setToast] = useState(null);
  const toastRef = React.useRef();
  const showToast = (msg) => {
    setToast({ msg, key: Date.now() });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2000);
  };

  // ── Subscription lifecycle (manage / cancel) ──
  const [manageOpen, setManageOpen] = useState(false);
  const [subCanceled, setSubCanceled] = useState(initialState.subCanceled ?? false);
  const [activePlan, setActivePlan] = useState(initialState.activePlan ?? 'annual');
  const [lastActiveDay, setLastActiveDay] = useState(initialState.lastActiveDay ?? todayKey());
  const [liveEntitlement, setLiveEntitlement] = useState(null);
  const renewLabel = liveEntitlement ? formatRenewDate(liveEntitlement.renewISO) : RENEW_DATE;
  const livePlan = liveEntitlement ? liveEntitlement.plan : activePlan;
  const livePrice = liveEntitlement ? liveEntitlement.priceString : null;
  // Store outcome is driven by settings so every purchase/restore state is
  // reachable without a live billing backend (wire to RevenueCat in prod).
  const sim = { purchase: settings.storePurchase || 'success', restore: settings.storeRestore || 'empty' };
  const service = useMemo(
    () => createPurchaseService({ sim, alreadyPlus: plus, platform: PLATFORM }),
    [sim.purchase, sim.restore, plus]
  );
  const openLink = (k) => { openExternal(k, PLATFORM); };

  const retint = (swatch) => setSettings && setSettings((s) => ({ ...s, accent: swatch }));
  const applyPalette = (p) => { setActivePalette(p.id); retint(p.swatch); showToast(p.name + ' applied'); };
  const buyPalette = (p) => {
    if (embers < p.tier) { setGetEmbersOpen(true); return; }
    setEmbers((e) => e - p.tier);
    setOwnedPalettes((o) => [...o, p.id]);
    setActivePalette(p.id); retint(p.swatch);
    showToast(p.name + ' unlocked');
  };
  const applySky = (s) => { setActiveSky(s.id); showToast(s.name + ' applied'); };
  const buySky = (s) => {
    if (embers < s.tier) { setGetEmbersOpen(true); return; }
    setEmbers((e) => e - s.tier);
    setOwnedSkies((o) => [...o, s.id]);
    setActiveSky(s.id);
    showToast(s.name + ' unlocked');
  };
  const buyCandles = (pack) => {
    if (embers < pack.price) { setGetEmbersOpen(true); return; }
    setEmbers((e) => e - pack.price);
    setFreezes((f) => f + pack.count);
    showToast(pack.count + (pack.count > 1 ? ' candles lit' : ' candle lit'));
  };
  const getEmbers = (pack) => {
    if (pack && pack.amount) { setEmbers((e) => e + pack.amount); showToast('+' + pack.amount + ' Embers'); setGetEmbersOpen(false); }
    else { setGetEmbersOpen(true); }
  };
  const subscribe = (plan, entitlement) => {
    setPlus(true); setSubCanceled(false);
    if (entitlement && entitlement.plan) setActivePlan(entitlement.plan);
    else if (plan) setActivePlan(plan);
    if (entitlement) setLiveEntitlement(entitlement);
    setPaywall(false);
    setFreezes((f) => f + 3);
    showToast('Welcome to Plus — enjoy.');
  };

  // Cancel: route to the OS subscription settings (Apple/Google own cancellation),
  // then optimistically mark ending. A focus-refresh (below) corrects from truth.
  const doCancel = async () => {
    await openExternal('manage', PLATFORM);
    setSubCanceled(true);
    showToast('Manage your subscription in ' + (PLATFORM === 'android' ? 'Google Play' : 'the App Store'));
  };
  const doResume = async () => {
    await openExternal('manage', PLATFORM);
    showToast('Resume your subscription in ' + (PLATFORM === 'android' ? 'Google Play' : 'the App Store'));
  };
  const doGetHelp = async () => {
    if (!isBillingConfigured(PLATFORM)) {
      showToast('Visit dailyrituals.app/support for help');
      return;
    }
    try {
      const RevenueCatUI = require('react-native-purchases-ui').default;
      await RevenueCatUI.presentCustomerCenter();
    } catch (e) {
      showToast('Visit dailyrituals.app/support for help');
    }
  };

  const doRestore = async () => {
    const res = await service.restore();
    if (res.kind === 'restored') {
      setPlus(true);
      if (res.entitlement) { setLiveEntitlement(res.entitlement); setActivePlan(res.entitlement.plan); setSubCanceled(res.entitlement.willRenew === false); }
      showToast('Your subscription is active');
    } else {
      showToast('Nothing to restore');
    }
  };

  React.useEffect(() => {
    const sub = AppState.addEventListener('change', async (s) => {
      if (s !== 'active' || !plus) return;
      const ent = await service.getEntitlement();
      if (!ent) return;
      setLiveEntitlement(ent);
      setSubCanceled(ent.willRenew === false);
      setActivePlan(ent.plan);
    });
    return () => sub.remove();
  }, [plus, service]);

  // Daily reset: clear done + quest progress when the calendar day rolls over.
  React.useEffect(() => {
    const today = todayKey();
    if (lastActiveDay !== today) {
      setDone(false);
      setQuests((qs) => qs.map((q) => ({ ...q, cur: 0 })));
      setLastActiveDay(today);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced autosave — coalesces rapid state changes into one write.
  React.useEffect(() => {
    const id = setTimeout(() => {
      saveState(pickPersisted({
        onboarded: true, // RitualsApp only mounts after first-run; record it so we skip onboarding next launch
        entries, streak, xp, done, quests, freezes, embers, plus,
        activePalette, ownedPalettes, activeSky, ownedSkies,
        subCanceled, activePlan, lastActiveDay, settings,
      }));
    }, 400);
    return () => clearTimeout(id);
  }, [entries, streak, xp, done, quests, freezes, embers, plus,
    activePalette, ownedPalettes, activeSky, ownedSkies,
    subCanceled, activePlan, lastActiveDay, settings]);

  const complete = ({ did, wished, mood }) => {
    const entry = { id: 'new' + Date.now(), ...entryDateParts(), dayKey: todayKey(), mood, did, wished, streak: true };
    const next = applyCompletion(
      { entries, streak, xp, embers, done, quests },
      entry,
      { config: { XP_GAIN, EMBER_GAIN, milestones: STREAK_MILESTONES } }
    );
    setEntries(next.entries);
    setStreak(next.streak);
    setXp(next.xp);
    setEmbers(next.embers);
    setQuests(next.quests);
    setDone(next.done);
    setWriting(false);
    if (next.celebrate) setCelebrate(next.celebrate);
    else showToast("Today's reflection updated");
  };

  const screen = () => {
    switch (tab) {
      case 'insights':
        return <InsightsScreen copy={copy} entries={entries} streak={streak} />;
      case 'archive':
        return <ArchiveScreen copy={copy} gamify={gamify} mode={mode} entries={entries} onOpen={(e) => { setReading(e); setQuests((qs) => markRevisited(qs, e, todayKey())); }} />;
      case 'you':
        return (
          <YouScreen
            mode={mode} onToggleMode={onToggleMode} settings={settings} setSettings={setSettings}
            streak={streak} level={level} levelName={levelName} xpInto={xpInto} xpToNext={xpToNext}
            entriesCount={entries.length} badgesEarned={badgesEarned}
            embers={embers} plus={plus} onOpenShop={() => setShopOpen(true)}
            plusEnabled={PLUS_ENABLED}
            onOpenPaywall={PLUS_ENABLED ? () => setPaywall(true) : () => {}}
            onOpenManage={PLUS_ENABLED ? () => setManageOpen(true) : () => {}}
            onOpenAchievements={() => setShowAch(true)}
            onResetData={onResetData}
          />
        );
      case 'today':
      default:
        return (
          <HomeScreen
            copy={copy} gamify={gamify} mode={mode}
            streak={streak} level={level} levelName={levelName} xpInto={xpInto} xpToNext={xpToNext} entries={entries}
            quests={quests} freezes={freezes} onOpenAchievements={() => setShowAch(true)}
            embers={embers} plus={plus} onOpenShop={() => setShopOpen(true)}
            done={done} onWrite={() => setWriting(true)} onToggleMode={onToggleMode}
          />
        );
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      <View style={{ flex: 1, backgroundColor: c.cream }}>
        {/* screen area */}
        <View style={{ flex: 1, paddingTop: insets.top }}>{screen()}</View>

        {/* bottom nav: 4 tabs + centered write FAB */}
        <View style={[styles.nav, { backgroundColor: c.navBg, borderTopColor: c.border, paddingBottom: insets.bottom }]}>
          <Tab active={tab === 'today'} label="Today" onPress={() => setTab('today')}
            icon={<HomeIcon size={23} color={tab === 'today' ? c.accentDeep : c.muted} />} />
          <Tab active={tab === 'insights'} label="Insights" onPress={() => setTab('insights')}
            icon={<ChartIcon size={23} color={tab === 'insights' ? c.accentDeep : c.muted} />} />

          {/* center FAB */}
          <View style={{ width: 72, alignItems: 'center' }}>
            <Pressable
              onPress={() => setWriting(true)}
              style={({ pressed }) => [
                styles.fab,
                { backgroundColor: c.accent, borderColor: c.cream, transform: [{ scale: pressed ? 0.93 : 1 }] },
                theme.shadow(14, c.accentDeep, 0.9),
              ]}
            >
              <Pencil size={26} color="#fff" />
            </Pressable>
            <T w={800} color={c.accentDeep} style={{ fontSize: 10, marginTop: 5 }}>Write</T>
          </View>

          <Tab active={tab === 'archive'} label="Reflections" onPress={() => setTab('archive')}
            icon={<BookIcon size={23} color={tab === 'archive' ? c.accentDeep : c.muted} />} />
          <Tab active={tab === 'you'} label="You" onPress={() => setTab('you')}
            icon={<UserIcon size={23} color={tab === 'you' ? c.accentDeep : c.muted} />} />
        </View>

        {/* overlays */}
        <Modal visible={writing} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setWriting(false)}>
          <ThemeContext.Provider value={theme}>
            {writing && (() => {
              const te = findTodaysEntry(entries, todayKey());
              const initial = te ? { did: te.did, wished: te.wished, mood: te.mood } : null;
              return <WriteFlow copy={copy} insets={insets} onClose={() => setWriting(false)} onComplete={complete} initial={initial} />;
            })()}
          </ThemeContext.Provider>
        </Modal>

        <Modal visible={!!reading} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setReading(null)}>
          <ThemeContext.Provider value={theme}>
            {reading && (
              <ReadingSheet
                entry={reading} copy={copy} mode={mode} insets={insets} onClose={() => setReading(null)}
                canEdit={isEditableToday(reading, todayKey())}
                onEdit={() => { setReading(null); setWriting(true); }}
              />
            )}
          </ThemeContext.Provider>
        </Modal>

        <Modal visible={!!celebrate} animationType="fade" presentationStyle="overFullScreen" onRequestClose={() => setCelebrate(null)}>
          <ThemeContext.Provider value={theme}>
            {celebrate && (
              <Celebration
                copy={copy} mode={mode} streak={celebrate.streak} xpGain={celebrate.xp} embersGain={celebrate.embers} milestone={celebrate.milestone}
                onDone={() => { setCelebrate(null); setTab('today'); }}
              />
            )}
          </ThemeContext.Provider>
        </Modal>

        <Modal visible={showAch} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setShowAch(false)}>
          <ThemeContext.Provider value={theme}>
            <Achievements insets={insets} onClose={() => setShowAch(false)} entries={entries} streak={streak} />
          </ThemeContext.Provider>
        </Modal>

        <Modal visible={shopOpen} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setShopOpen(false)}>
          <ThemeContext.Provider value={theme}>
            <Shop
              insets={insets} onClose={() => setShopOpen(false)} embers={embers} plus={plus}
              activePalette={activePalette} ownedPalettes={ownedPalettes} onApplyPalette={applyPalette} onBuyPalette={buyPalette}
              activeSky={activeSky} ownedSkies={ownedSkies} onApplySky={applySky} onBuySky={buySky}
              freezes={freezes} onBuyCandles={buyCandles}
              plusEnabled={PLUS_ENABLED}
              onOpenPaywall={PLUS_ENABLED ? () => setPaywall(true) : () => {}}
              onGetEmbers={getEmbers}
              onManage={PLUS_ENABLED ? () => setManageOpen(true) : () => {}}
            />
            {toast && <Toast key={toast.key} message={toast.msg} bottom={insets.bottom} />}
          </ThemeContext.Provider>
        </Modal>

        <Modal visible={getEmbersOpen} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setGetEmbersOpen(false)}>
          <ThemeContext.Provider value={theme}>
            <GetEmbers insets={insets} onClose={() => setGetEmbersOpen(false)} embers={embers}
              onBuy={(pack) => { setEmbers((e) => e + pack.amount); showToast('+' + pack.amount + ' Embers'); setGetEmbersOpen(false); }} />
          </ThemeContext.Provider>
        </Modal>

        <Modal visible={PLUS_ENABLED && paywall} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setPaywall(false)}>
          <ThemeContext.Provider value={theme}>
            <Paywall insets={insets} platform={PLATFORM} service={service} alreadyPlus={plus}
              onClose={() => setPaywall(false)} onSubscribe={subscribe} onLink={openLink} />
          </ThemeContext.Provider>
        </Modal>

        <Modal visible={PLUS_ENABLED && manageOpen} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setManageOpen(false)}>
          <ThemeContext.Provider value={theme}>
            <ManageSubscription
              insets={insets} platform={PLATFORM} plan={livePlan} canceled={subCanceled}
              renewLabel={renewLabel} priceString={livePrice}
              onClose={() => setManageOpen(false)}
              onChangePlan={() => { setManageOpen(false); setPaywall(true); }}
              onRestore={() => doRestore()}
              onCancel={() => doCancel()}
              onResume={() => doResume()}
              onLink={openLink}
              onGetHelp={doGetHelp}
            />
            {toast && <Toast key={toast.key} message={toast.msg} bottom={insets.bottom} />}
          </ThemeContext.Provider>
        </Modal>

        {toast && !shopOpen && <Toast key={toast.key} message={toast.msg} bottom={insets.bottom} />}
      </View>
    </ThemeContext.Provider>
  );
}

function Tab({ active, label, icon, onPress }) {
  const t = React.useContext(ThemeContext);
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 2 }}>
      {icon}
      <T w={700} color={active ? t.colors.accentDeep : t.colors.muted} style={{ fontSize: 10.5 }}>{label}</T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  fab: {
    width: 64, height: 64, borderRadius: 32, marginTop: -26,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 6,
  },
});
