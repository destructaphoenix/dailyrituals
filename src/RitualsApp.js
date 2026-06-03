// RitualsApp.js — state, navigation and chrome. Ported from rituals-app.jsx,
// then extended with the Insights and You tabs.
//
// Tab bar layout: [Today] [Insights] (✎ FAB) [Reflections] [You].
// Mode (day/night) and live settings come from App.js so the You tab can
// drive them. Overlays (write/read/celebrate) are RN Modals.

import React, { useState, useMemo } from 'react';
import { View, Pressable, Modal, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext, makeTheme } from './theme';
import { T } from './ui';
import { HomeIcon, BookIcon, Pencil, ChartIcon, UserIcon } from './icons';
import { COPY, SAMPLE_ENTRIES, BADGES, DAILY_QUESTS, ACHIEVEMENTS, STREAK_MILESTONES, SHOP_PALETTES, EMBER_GAIN, RENEW_DATE } from './data';
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
import { createSimService } from './billing/simService';

const XP_GAIN = 50;
const XP_MAX = 500;
const LEVEL = 3;
const LEVEL_NAME = 'Contemplative';
const PLATFORM = Platform.OS === 'android' ? 'android' : 'ios';

export default function RitualsApp({ mode = 'day', settings, setSettings, onToggleMode, initialPlus = false }) {
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

  const [entries, setEntries] = useState(SAMPLE_ENTRIES);
  const [streak, setStreak] = useState(4);
  const [xp, setXp] = useState(320);
  const [done, setDone] = useState(false);
  const [quests, setQuests] = useState(DAILY_QUESTS);
  const [freezes, setFreezes] = useState(2);
  const [showAch, setShowAch] = useState(false);

  // ── Shop / Plus / Embers economy ──
  const [embers, setEmbers] = useState(360);
  const [plus, setPlus] = useState(initialPlus);
  const [shopOpen, setShopOpen] = useState(false);
  const [getEmbersOpen, setGetEmbersOpen] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [activePalette, setActivePalette] = useState('goldenhour');
  const [ownedPalettes, setOwnedPalettes] = useState(['goldenhour']);
  const [activeSky, setActiveSky] = useState('classic');
  const [ownedSkies, setOwnedSkies] = useState(['classic', 'crescent']);
  const [toast, setToast] = useState(null);
  const toastRef = React.useRef();
  const showToast = (msg) => {
    setToast({ msg, key: Date.now() });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2000);
  };

  // ── Subscription lifecycle (manage / cancel) ──
  const [manageOpen, setManageOpen] = useState(false);
  const [subCanceled, setSubCanceled] = useState(false);
  const [activePlan, setActivePlan] = useState('annual');
  const [liveEntitlement, setLiveEntitlement] = useState(null);
  // Store outcome is driven by settings so every purchase/restore state is
  // reachable without a live billing backend (wire to RevenueCat in prod).
  const sim = { purchase: settings.storePurchase || 'success', restore: settings.storeRestore || 'empty' };
  // Phase 3: sim only. Phase 4 swaps this for createPurchaseService({...}).
  const service = useMemo(() => createSimService(sim, plus), [sim.purchase, sim.restore, plus]);
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

  const complete = ({ did, wished, mood }) => {
    const entry = { id: 'new' + Date.now(), day: '31', mon: 'May', wd: 'Saturday', mood, did, wished, streak: true };
    setEntries((es) => [entry, ...es]);
    const newStreak = streak + 1;
    setStreak(newStreak);
    setQuests((qs) => qs.map((q) => {
      if (q.id === 'write') return { ...q, cur: q.goal };
      if (q.id === 'feel' && mood) return { ...q, cur: q.goal };
      return q;
    }));
    setXp((x) => Math.min(XP_MAX, x + XP_GAIN));
    setEmbers((e) => e + EMBER_GAIN);
    setDone(true);
    setWriting(false);
    setCelebrate({ streak: newStreak, xp: XP_GAIN, embers: EMBER_GAIN, milestone: STREAK_MILESTONES[newStreak] || null });
  };

  const screen = () => {
    switch (tab) {
      case 'insights':
        return <InsightsScreen copy={copy} />;
      case 'archive':
        return <ArchiveScreen copy={copy} gamify={gamify} mode={mode} entries={entries} onOpen={(e) => setReading(e)} />;
      case 'you':
        return (
          <YouScreen
            mode={mode} onToggleMode={onToggleMode} settings={settings} setSettings={setSettings}
            streak={streak} xp={xp} xpMax={XP_MAX} level={LEVEL} levelName={LEVEL_NAME}
            entriesCount={entries.length} badgesEarned={ACHIEVEMENTS.filter((b) => b.cur >= b.goal).length}
            embers={embers} plus={plus} onOpenShop={() => setShopOpen(true)} onOpenPaywall={() => setPaywall(true)}
            onOpenManage={() => setManageOpen(true)}
            onOpenAchievements={() => setShowAch(true)}
          />
        );
      case 'today':
      default:
        return (
          <HomeScreen
            copy={copy} gamify={gamify} mode={mode}
            streak={streak} xp={xp} xpMax={XP_MAX} level={LEVEL} levelName={LEVEL_NAME}
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
              onPress={() => { setDone(false); setWriting(true); }}
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
            <WriteFlow copy={copy} insets={insets} onClose={() => setWriting(false)} onComplete={complete} />
          </ThemeContext.Provider>
        </Modal>

        <Modal visible={!!reading} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setReading(null)}>
          <ThemeContext.Provider value={theme}>
            {reading && <ReadingSheet entry={reading} copy={copy} mode={mode} insets={insets} onClose={() => setReading(null)} />}
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
            <Achievements insets={insets} onClose={() => setShowAch(false)} />
          </ThemeContext.Provider>
        </Modal>

        <Modal visible={shopOpen} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setShopOpen(false)}>
          <ThemeContext.Provider value={theme}>
            <Shop
              insets={insets} onClose={() => setShopOpen(false)} embers={embers} plus={plus}
              activePalette={activePalette} ownedPalettes={ownedPalettes} onApplyPalette={applyPalette} onBuyPalette={buyPalette}
              activeSky={activeSky} ownedSkies={ownedSkies} onApplySky={applySky} onBuySky={buySky}
              freezes={freezes} onBuyCandles={buyCandles}
              onOpenPaywall={() => setPaywall(true)} onGetEmbers={getEmbers} onManage={() => setManageOpen(true)}
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

        <Modal visible={paywall} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setPaywall(false)}>
          <ThemeContext.Provider value={theme}>
            <Paywall insets={insets} platform={PLATFORM} service={service} alreadyPlus={plus}
              onClose={() => setPaywall(false)} onSubscribe={subscribe} onLink={openLink} />
          </ThemeContext.Provider>
        </Modal>

        <Modal visible={manageOpen} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setManageOpen(false)}>
          <ThemeContext.Provider value={theme}>
            <ManageSubscription
              insets={insets} platform={PLATFORM} plan={activePlan} canceled={subCanceled}
              onClose={() => setManageOpen(false)}
              onChangePlan={() => { setManageOpen(false); setPaywall(true); }}
              onRestore={() => showToast('Your subscription is active')}
              onCancel={() => { setSubCanceled(true); showToast('Subscription set to cancel'); }}
              onResume={() => { setSubCanceled(false); showToast('Plus resumed — renews ' + RENEW_DATE); }}
              onLink={openLink}
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
