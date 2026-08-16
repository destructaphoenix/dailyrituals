// RitualsApp.js — state, navigation and chrome. Ported from rituals-app.jsx,
// then extended with the Insights and You tabs.
//
// Tab bar layout: [Today] [Insights] (✎ FAB) [Reflections] [You].
// Mode (day/night) and live settings come from App.js so the You tab can
// drive them. Overlays (write/read/celebrate) are RN Modals.

import React, { useState, useMemo } from 'react';
import { View, Pressable, Modal, StyleSheet, Platform, AppState, Alert, Linking } from 'react-native';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBackup, readBackup, backupFilename } from './backup/backup';
import { runConfirmedImport } from './backup/importFlow';
import * as backupIO from './backup/io';
import { ThemeContext, makeTheme } from './theme';
import { dayKeyOf } from './time/dayKey';
import { T } from './ui';
import { CHROME_FONT_SCALE } from './ui/textScale';
import { HomeIcon, BookIcon, Pencil, ChartIcon, UserIcon } from './icons';
import { COPY, DAILY_QUESTS, STREAK_MILESTONES, SHOP_PALETTES, EMBER_GAIN, RENEW_DATE } from './data';
import HomeScreen from './screens/HomeScreen';
import ArchiveScreen from './screens/ArchiveScreen';
import InsightsScreen from './screens/InsightsScreen';
import YouScreen from './screens/YouScreen';
import ReadingSheet from './screens/ReadingSheet';
import RestoreNotice from './screens/RestoreNotice';
import RestoreOffer from './screens/RestoreOffer';
import ReminderSheet from './screens/ReminderSheet';
import WriteFlow from './screens/WriteFlow';
import TrashSheet from './screens/TrashSheet';
import MoodManager from './screens/MoodManager';
import PromptPacks from './screens/PromptPacks';
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
import { checkEntitlement, nextPlusState, useLaunchEntitlementCheck } from './billing/entitlementSync';
import { saveState } from './persistence/storage';
import { pickPersisted } from './persistence/state';
import { pendingRestoreInventory } from './persistence/restoreQuarantine';
import { applyCompletion } from './home/completeEntry';
import { applyAutoFreeze } from './home/streakFreeze';
import { addFreezeNotice } from './home/freezeNotice';
import { applyEdit, applyDelete, applyRestore, pruneTrash, streakAfterDelete } from './entries/mutate';
import { renameMood, deleteMood } from './entries/renameMood';
import { restoreAccess, consumeFreeRestore } from './entries/restoreAllowance';
import { markRevisited } from './home/markRevisited';
import { findTodaysEntry } from './home/todaysEntry';
import { levelFromXp } from './profile/level';
import { deriveAchievements } from './profile/achievements';
import { entryDateParts } from './time/clock';
import { currentStreak } from './insights/dateKeys';
import { dayNumber } from './time/dailyPick';
import { selectPrompt } from './content/deck';
import { packById } from './content/packs';
import { reminderCopy } from './content/reminders';
import PlusPerks from './screens/PlusPerks';
import AnnualRecap from './screens/AnnualRecap';
import { buildRecap } from './recap/annualRecap';
import { nextOccurrences, reminderId, reminderRowValue } from './reminders/schedule';
import { isOurReminder, reminderAction } from './reminders/route';
import * as reminderIO from './reminders/io';

// Dev-only test harness. The literal __DEV__ lets Metro strip this require (and
// the entire src/dev subtree) from release bundles. Never alias __DEV__ here.
let DevPanel = null;
if (__DEV__) {
  DevPanel = require('./dev/DevPanel').default;
}

const XP_GAIN = 50;
const APP_VERSION = Constants.expoConfig?.version || '1.0.0';
const IMPORT_ERROR = {
  'not-json': "That file isn't readable as a backup.",
  'not-backup': "This doesn't look like a Daily Rituals backup.",
  'too-new': 'This backup was made by a newer version — update the app first.',
  'unreadable': "That backup file looks damaged and can't be restored.",
};
const PLATFORM = Platform.OS === 'android' ? 'android' : 'ios';
export default function RitualsApp({ mode = 'day', settings, setSettings, onToggleMode, initialPlus = false, initialState = {}, onResetData, onReplaceAllData, restoredFromMs = null, onDismissRestoreNotice, pendingRestore = null, onConsumePendingRestore, restoreOfferAnswered = false, onAnswerRestoreOffer, onReopenRestoreOffer }) {
  const theme = useMemo(() => makeTheme(mode, settings), [mode, settings]);
  const c = theme.colors;
  const safe = useSafeAreaInsets();
  const insets = { top: safe.top || 12, bottom: safe.bottom || 8 };

  const copy = COPY[settings.tone] || COPY.gentle;

  const [tab, setTab] = useState('today');
  const [writing, setWriting] = useState(false);
  const [reading, setReading] = useState(null);
  const [celebrate, setCelebrate] = useState(null);

  const [entries, setEntries] = useState(initialState.entries ?? []);
  const [freezes, setFreezes] = useState(initialState.freezes ?? 0);
  // Missed days a candle has already covered (IMP-039 streak insurance) — see
  // applyAutoFreeze. Forgiven, not journaled: never becomes an `entries` row.
  const [frozenDays, setFrozenDays] = useState(initialState.frozenDays ?? []);
  // Deleted entries (IMP-036), pruned to a 30-day window on launch below.
  // Deleting is free forever; the first three restores are free too, after
  // which restoring is the Plus half (IMP-048) — the allowance is disclosed
  // on the sheet before it is spent, never discovered by a dead button.
  const [trash, setTrash] = useState(initialState.trash ?? []);
  const [freeRestoresUsed, setFreeRestoresUsed] = useState(initialState.freeRestoresUsed ?? 0);
  const [trashOpen, setTrashOpen] = useState(false);
  const [moodManagerOpen, setMoodManagerOpen] = useState(false);
  const [promptPacksOpen, setPromptPacksOpen] = useState(false);
  // Which past day WriteFlow is editing, if any — null means the normal
  // today flow (complete()/applyCompletion). Past-day edits must never go
  // through applyCompletion (see IMP-036: it would award a duplicate
  // reward), so they're routed to editPastEntry/applyEdit instead.
  const [editingDayKey, setEditingDayKey] = useState(null);
  // Streak is DERIVED from real entries (IMP-024): a missed day breaks it to 0,
  // re-logging after a gap restarts at 1 — UNLESS a candle froze the gap.
  // No persisted streak counter to drift.
  const streak = useMemo(
    () => currentStreak(entries.map((e) => e.dayKey), dayKeyOf(), { frozenDays }),
    [entries, frozenDays]
  );
  const [xp, setXp] = useState(initialState.xp ?? 0);
  const [done, setDone] = useState(initialState.done ?? false);
  const [quests, setQuests] = useState(initialState.quests ?? DAILY_QUESTS);
  const [lastBackupAt, setLastBackupAt] = useState(initialState.lastBackupAt ?? null);
  const [showAch, setShowAch] = useState(false);
  const [showDev, setShowDev] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderPermission, setReminderPermission] = useState('undetermined');
  // Dev harness only (IMP-032 Part D): lets the "Restore notice" launcher show
  // IMP-029's notice without a real uninstall/reinstall cycle. This is the
  // ONLY prod-visible cost of the whole dev harness v2 task — one inert
  // useState, always null outside a dev session.
  const [devRestoreMs, setDevRestoreMs] = useState(null);

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
  const [lastActiveDay, setLastActiveDay] = useState(initialState.lastActiveDay ?? dayKeyOf());
  const [promptDeck, setPromptDeck] = useState(initialState.promptDeck ?? null);
  const promptSel = useMemo(
    () => selectPrompt(packById(settings.promptPack).prompts, promptDeck, dayNumber(), settings.promptPack),
    [promptDeck, settings.promptPack],
  );
  const [plusPerksOpen, setPlusPerksOpen] = useState(false);
  // Which year's Annual Recap (IMP-046) is open, if any — null means closed.
  const [openRecapYear, setOpenRecapYear] = useState(null);
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

  // While the app ships free (PLUS_ENABLED = false, IMP-034) there is no cash
  // ember purchase to route to — say so instead of opening the shop.
  const EMBERS_ARE_FREE_COPY = 'Embers also gather on their own — one for every day you keep';
  const openGetEmbers = () => {
    if (PLUS_ENABLED) setGetEmbersOpen(true);
    else showToast(EMBERS_ARE_FREE_COPY);
  };

  const retint = (swatch) => setSettings && setSettings((s) => ({ ...s, accent: swatch }));
  const applyPalette = (p) => { setActivePalette(p.id); retint(p.swatch); showToast(p.name + ' applied'); };
  const buyPalette = (p) => {
    if (embers < p.tier) { openGetEmbers(); return; }
    setEmbers((e) => e - p.tier);
    setOwnedPalettes((o) => [...o, p.id]);
    setActivePalette(p.id); retint(p.swatch);
    showToast(p.name + ' unlocked');
  };
  const applySky = (s) => { setActiveSky(s.id); showToast(s.name + ' applied'); };
  const buySky = (s) => {
    if (embers < s.tier) { openGetEmbers(); return; }
    setEmbers((e) => e - s.tier);
    setOwnedSkies((o) => [...o, s.id]);
    setActiveSky(s.id);
    showToast(s.name + ' unlocked');
  };
  const buyCandles = (pack) => {
    if (embers < pack.price) { openGetEmbers(); return; }
    setEmbers((e) => e - pack.price);
    setFreezes((f) => f + pack.count);
    showToast(pack.count + (pack.count > 1 ? ' candles lit' : ' candle lit'));
  };
  const getEmbers = (pack) => {
    if (pack && pack.amount) { setEmbers((e) => e + pack.amount); showToast('+' + pack.amount + ' Embers'); setGetEmbersOpen(false); }
    else { openGetEmbers(); }
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

  // Store, not the local cache, is authoritative (IMP-043): only a verified
  // "no entitlement" answer downgrades; a failed/unreachable check changes
  // nothing (offline-first — never strand a real subscriber without a signal).
  React.useEffect(() => {
    const sub = AppState.addEventListener('change', async (s) => {
      if (s !== 'active' || !plus) return;
      const result = await checkEntitlement(service);
      if (result.entitlement) {
        setLiveEntitlement(result.entitlement);
        setSubCanceled(result.entitlement.willRenew === false);
        setActivePlan(result.entitlement.plan);
      }
      const next = nextPlusState(plus, result);
      if (next !== plus) setPlus(next);
    });
    return () => sub.remove();
  }, [plus, service]);

  // The lost-phone bug: a returning subscriber whose local cache reads false
  // (fresh install, an IMP-033 quarantine, a corrected forged flag, ...) was
  // never re-asked — "Restore purchases" lived only behind the paywall, the
  // one screen a non-Plus-looking user has no reason to open. Silent,
  // failure-tolerant, once per launch.
  useLaunchEntitlementCheck({
    plus,
    service,
    onEntitlementFound: (entitlement) => {
      setPlus(true);
      setLiveEntitlement(entitlement);
      setActivePlan(entitlement.plan);
      setSubCanceled(entitlement.willRenew === false);
    },
  });

  // Rolling-window reminder scheduling (IMP-031). A repeating OS trigger can't
  // be conditional, so instead we keep the next 7 single-shot notifications
  // pending and cancel + re-derive the whole window on every trigger below —
  // cheap and idempotent. wroteToday skips today's slot even if its time
  // hasn't passed yet, so writing early cancels tonight's nudge.
  //
  // Two things keep the window free of duplicates, because the triggers below
  // can overlap (a save landing while a foreground re-arm is mid-flight, or iOS
  // sending 'active' twice): every notification carries a stable per-day
  // identifier so re-scheduling a day replaces it, and the runs are chained on
  // rearmLock so one run's cancel can never land between another's cancel and
  // its schedules. Without both, two overlapping runs each cancelled, then each
  // scheduled — leaving two notifications per day, firing at the same minute.
  const rearmLock = React.useRef(Promise.resolve());
  const rearmReminders = React.useCallback(() => {
    const run = async () => {
      const r = settings.reminder;
      if (!r || !r.enabled) { await reminderIO.cancelAll(); return; }
      const status = await reminderIO.getPermissionStatus();
      setReminderPermission(status);
      await reminderIO.cancelAll();
      if (status !== 'granted') return;
      const wroteToday = !!findTodaysEntry(entries, dayKeyOf());
      const occurrences = nextOccurrences(new Date(), r, { wroteToday, count: 7 });
      const notif = { ...reminderCopy(settings.tone), data: { kind: 'daily-reminder' } };
      for (const date of occurrences) await reminderIO.scheduleAt(date, notif, reminderId(date));
    };
    const next = rearmLock.current.then(run, run);
    rearmLock.current = next.catch(() => {});
    return next;
  }, [settings.reminder, settings.tone, entries]);

  React.useEffect(() => { rearmReminders(); }, [rearmReminders]);

  React.useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') rearmReminders(); });
    return () => sub.remove();
  }, [rearmReminders]);

  // Android drops the OS banner entirely once shouldPlaySound is false (see
  // io.js) — this is what makes the in-app Toast below the *only* way a
  // foreground reminder is seen at all, by design (owner, 2026-08-09).
  React.useEffect(() => { reminderIO.setForegroundBehavior(); }, []);

  React.useEffect(() => {
    const receivedSub = reminderIO.onNotificationReceived((notification) => {
      if (!isOurReminder(notification)) return;
      const wroteToday = !!findTodaysEntry(entries, dayKeyOf());
      if (reminderAction({ wroteToday, foreground: true }) === 'nudge') {
        showToast('Today is still unwritten.');
      }
    });
    const tappedSub = reminderIO.onNotificationTapped((response) => {
      if (!isOurReminder(response?.notification)) return;
      const wroteToday = !!findTodaysEntry(entries, dayKeyOf());
      if (reminderAction({ wroteToday, foreground: false }) === 'write') {
        setWriting(true);
      }
    });
    return () => { receivedSub.remove(); tappedSub.remove(); };
  }, [entries]);

  // Permission is requested only from this tap (first enable) — never at
  // launch. If the native module isn't there (Expo Go), stay off and say so.
  const onReminderToggle = async (nextEnabled) => {
    if (nextEnabled) {
      const status = await reminderIO.ensurePermission();
      setReminderPermission(status);
      if (status === reminderIO.NATIVE_UNAVAILABLE) {
        showToast('Reminders need a build with notifications — not available here.');
        return;
      }
    }
    setSettings((s) => ({ ...s, reminder: { ...s.reminder, enabled: nextEnabled } }));
  };
  const onReminderTimeChange = (hour, minute) => {
    setSettings((s) => ({ ...s, reminder: { ...s.reminder, hour, minute } }));
  };
  const onOpenReminderSettings = () => Linking.openSettings();

  const openEntry = (e) => { setReading(e); setQuests((qs) => markRevisited(qs, e, dayKeyOf())); };

  // Daily reset: clear done + quest progress when the calendar day rolls over.
  React.useEffect(() => {
    const today = dayKeyOf();
    if (lastActiveDay !== today) {
      setDone(false);
      setQuests((qs) => qs.map((q) => ({ ...q, cur: 0 })));
      setLastActiveDay(today);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Streak insurance (IMP-039): catch up on any day that has fully passed
  // with no entry since we last checked, spending a candle per missed day.
  // Mount-only like the reset above — the gap only grows one day at a time,
  // and applyAutoFreeze is idempotent, so the next launch catches up fine.
  React.useEffect(() => {
    const result = applyAutoFreeze(entries, frozenDays, freezes, dayKeyOf());
    if (result.spent > 0) {
      setFrozenDays(result.frozenDays);
      setFreezes(result.freezes);
      setSettings((s) => ({ ...s, pendingFreezeNotice: addFreezeNotice(s.pendingFreezeNotice || [], result.covered) }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Trash pruning (IMP-036): drop anything past the 30-day window. Mount-only
  // like the freeze catch-up above — pruneTrash is idempotent, so the next
  // launch catches up fine.
  React.useEffect(() => {
    const pruned = pruneTrash(trash, Date.now());
    if (pruned.length !== trash.length) setTrash(pruned);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Advance + persist the prompt deck when the day rolls over. selectPrompt
  // returns the same reference when nothing changed, so this is a no-op then.
  React.useEffect(() => {
    if (promptSel.state !== promptDeck) setPromptDeck(promptSel.state);
  }, [promptSel, promptDeck]);

  // Debounced autosave — coalesces rapid state changes into one write.
  React.useEffect(() => {
    const id = setTimeout(() => {
      saveState(pickPersisted({
        onboarded: true, // RitualsApp only mounts after first-run; record it so we skip onboarding next launch
        mode,
        entries, xp, done, quests, freezes, frozenDays, embers, plus,
        activePalette, ownedPalettes, activeSky, ownedSkies,
        subCanceled, activePlan, lastActiveDay, settings, lastBackupAt, promptDeck, trash,
        freeRestoresUsed,
      }));
    }, 400);
    return () => clearTimeout(id);
  }, [mode, entries, xp, done, quests, freezes, frozenDays, embers, plus,
    activePalette, ownedPalettes, activeSky, ownedSkies,
    subCanceled, activePlan, lastActiveDay, settings, lastBackupAt, promptDeck, trash,
    freeRestoresUsed]);

  const complete = ({ did, wished, moods }) => {
    const entry = { id: 'new' + Date.now(), ...entryDateParts(), dayKey: dayKeyOf(), moods, did, wished, streak: true };
    const next = applyCompletion(
      { entries, xp, embers, done, quests },
      entry,
      { config: { XP_GAIN, EMBER_GAIN, milestones: STREAK_MILESTONES }, frozenDays }
    );
    setEntries(next.entries);
    setXp(next.xp);
    setEmbers(next.embers);
    setQuests(next.quests);
    setDone(next.done);
    setWriting(false);
    if (next.celebrate) setCelebrate(next.celebrate);
    else showToast("Today's reflection updated");
  };

  const closeWriting = () => { setWriting(false); setEditingDayKey(null); };

  // Past-day edit (IMP-036) — routed around applyCompletion on purpose: that
  // path only skips its reward branch when `prev.done` is true, so an
  // untouched today would fall into the reward branch and double-award XP
  // + embers plus a duplicate row. applyEdit never touches xp/embers.
  const editPastEntry = (dayKey, { did, wished, moods }) => {
    setEntries((es) => applyEdit(es, dayKey, { did, wished, moods }));
    closeWriting();
    showToast('Entry updated');
  };

  // Persists a user-typed feeling (and its chosen emoji, IMP-050) so it's
  // offered again next time (IMP-037). Re-adding an existing name updates
  // its emoji rather than duplicating the mood.
  const addCustomMood = (m, emoji) => {
    setSettings((s) => ({
      ...s,
      customMoods: (s.customMoods || []).includes(m) ? (s.customMoods || []) : [...(s.customMoods || []), m],
      customMoodEmoji: { ...(s.customMoodEmoji || {}), [m]: emoji },
    }));
  };

  // Rewrites `from` to `to` (and its emoji) across entries, trash and
  // settings in one go (IMP-055). All three setters fire every time — a
  // rename that updates settings but not trash is exactly the bug renameMood
  // exists to prevent.
  const onRenameMood = (from, to, emoji) => {
    const result = renameMood({ entries, trash, settings }, from, to);
    const nextSettings = emoji
      ? { ...result.settings, customMoodEmoji: { ...(result.settings.customMoodEmoji || {}), [to]: emoji } }
      : result.settings;
    setEntries(result.entries);
    setTrash(result.trash);
    setSettings(nextSettings);
  };

  // Removes a mood from the picker only — entries/trash that used it keep it
  // (IMP-055).
  const onDeleteMood = (name) => {
    const result = deleteMood({ entries, trash, settings }, name);
    setEntries(result.entries);
    setTrash(result.trash);
    setSettings(result.settings);
  };

  const confirmDeleteEntry = (entry) => {
    const newStreak = streakAfterDelete(entries, entry.dayKey, dayKeyOf(), frozenDays);
    const remaining = entries.filter((e) => e.dayKey !== entry.dayKey);
    const losesKeepsake = achievements.some(
      (a, i) => a.done && !deriveAchievements(remaining, newStreak)[i].done
    );
    Alert.alert(
      'Delete this day?',
      `This removes ${entry.wd}, ${entry.day} ${entry.mon} from your journal for good — you'll have 30 days ` +
      `to change your mind. Your streak becomes ${newStreak}.` +
      (losesKeepsake ? ' One of your keepsakes may go with it.' : ''),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: () => {
            const result = applyDelete({ entries, trash }, entry.dayKey, Date.now());
            setEntries(result.entries);
            setTrash(result.trash);
            setReading(null);
            showToast('Moved to Recently deleted');
          },
        },
      ]
    );
  };

  // IMP-048: three free restores, then Plus. The gate is re-checked here and
  // not trusted from the sheet, so no future caller can spend a fourth. No
  // toast on success — this runs inside the trash Modal, where a Toast in
  // RitualsApp's tree renders BEHIND the sheet and only surfaces once it
  // closes. The row leaving the list and the allowance line ticking down are
  // the feedback.
  const restoreFromTrash = (dayKey) => {
    const access = restoreAccess({ used: freeRestoresUsed, plus, plusEnabled: PLUS_ENABLED });
    if (access.kind !== 'free' && access.kind !== 'plus') return;
    const result = applyRestore({ entries, trash }, dayKey);
    if (result.entries === entries) return; // absent dayKey — spend nothing
    setEntries(result.entries);
    setTrash(result.trash);
    setFreeRestoresUsed((u) => consumeFreeRestore(u, plus));
  };

  const forgetFromTrash = (dayKey) => setTrash((ts) => ts.filter((t) => t.dayKey !== dayKey));

  // The exact persisted slice (mirrors the autosave object) — source for backups.
  const currentSlice = () => ({
    onboarded: true,
    entries, xp, done, quests, freezes, frozenDays, embers, plus,
    activePalette, ownedPalettes, activeSky, ownedSkies,
    subCanceled, activePlan, lastActiveDay, settings, lastBackupAt, promptDeck, trash,
    freeRestoresUsed,
  });

  const doExport = async () => {
    if (!entries.length) { showToast("Nothing to back up yet — write your first reflection."); return; }
    try {
      const env = createBackup(currentSlice(), { appVersion: APP_VERSION });
      const shared = await backupIO.exportFile(backupFilename(), JSON.stringify(env));
      if (shared) {
        setLastBackupAt(new Date().toISOString());
        // IMP-033: this file and the Google Auto Backup are separate systems —
        // this export never refreshes that copy, so say so at the moment of use.
        showToast("Backup ready — save it somewhere off this phone. This doesn't update your Google backup.");
      }
    } catch (e) {
      showToast("Couldn't create the backup. Please try again.");
    }
  };

  const doImport = async ({ onConfirmed } = {}) => {
    let raw;
    try { raw = await backupIO.pickFile(); }
    catch (e) { showToast("Couldn't open that file."); return; }
    if (raw == null) return; // user cancelled the picker

    const res = readBackup(raw);
    if (!res.ok) { showToast(IMPORT_ERROR[res.reason] || IMPORT_ERROR['not-backup']); return; }

    const here = entries.length;
    Alert.alert(
      'Restore this backup?',
      `This backup has ${res.meta.counts.entries} ${res.meta.counts.entries === 1 ? 'entry' : 'entries'}.\n` +
      `It will replace what's on this phone now (${here} ${here === 1 ? 'entry' : 'entries'}). ` +
      `We'll save a recovery copy of your current journal first.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Replace', style: 'destructive',
          onPress: async () => {
            onConfirmed?.();
            try {
              await runConfirmedImport({
                currentEnvelopeText: JSON.stringify(createBackup(currentSlice(), { appVersion: APP_VERSION })),
                restoredState: res.state,
                writeRecovery: (text) => backupIO.writeRecovery(text),
                replaceAll: (state) => onReplaceAllData(state),
              });
            } catch (e) {
              showToast("Restore failed — your current journal is unchanged.");
            }
          },
        },
      ]
    );
  };

  // IMP-033: load the quarantined OS-restored stash. The CURRENT (fresh,
  // just-onboarded) state gets a recovery copy first — same safety guarantee
  // as doImport, via the same runConfirmedImport orchestration.
  const handleLoadPendingRestore = () => {
    if (!pendingRestore) return;
    const count = (pendingRestore.entries || []).length;
    Alert.alert(
      'Load this journal?',
      `This backup has ${count} ${count === 1 ? 'entry' : 'entries'}. ` +
      "It will replace everything you've set up since installing. We'll save a recovery copy of your fresh start first.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load', style: 'destructive',
          onPress: async () => {
            try {
              await runConfirmedImport({
                currentEnvelopeText: JSON.stringify(createBackup(currentSlice(), { appVersion: APP_VERSION })),
                restoredState: pendingRestore,
                writeRecovery: (text) => backupIO.writeRecovery(text),
                replaceAll: (state) => onReplaceAllData(state),
                onImported: onConsumePendingRestore,
              });
            } catch (e) {
              showToast("Load failed — your fresh start is unchanged.");
            }
          },
        },
      ]
    );
  };

  const handleKeepFreshStart = () => onAnswerRestoreOffer();

  const handleDiscardPendingRestore = () => {
    const inventory = pendingRestoreInventory(pendingRestore);
    Alert.alert(
      'Discard this backup?',
      `This permanently deletes the Google backup${inventory ? ` — including ${inventory}` : ''}. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => onConsumePendingRestore() },
      ]
    );
  };

  // Honest Auto Backup explainer (we can't read the OS-level Google toggle).
  const explainAutoBackup = () => {
    Alert.alert(
      'Automatic backup',
      "Your journal is included in Android's automatic backup to your Google account, so it can be restored when you set up a new phone.\n\n" +
      "We can't see whether device backup is switched on, so it's worth checking: Settings › Google › Backup.\n\n" +
      "This is separate from \"Back up my journal\" below — exporting a file does not refresh your Google backup, and vice versa. For full control, export your own copy too.",
      [
        { text: 'Open phone settings', onPress: () => Linking.openSettings() },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  const screen = () => {
    switch (tab) {
      case 'insights':
        return (
          <InsightsScreen
            copy={copy} entries={entries} streak={streak} xp={xp}
            plus={plus} plusEnabled={PLUS_ENABLED}
            onOpenPaywall={PLUS_ENABLED ? () => setPaywall(true) : () => {}}
            customMoodEmoji={settings.customMoodEmoji || {}}
            onOpen={openEntry}
            frozenDays={frozenDays}
          />
        );
      case 'archive':
        return (
          <ArchiveScreen
            copy={copy} mode={mode} entries={entries}
            onOpen={openEntry}
            customMoods={settings.customMoods || []} customMoodEmoji={settings.customMoodEmoji || {}}
            frozenDays={frozenDays}
          />
        );
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
            onRestorePurchases={() => doRestore()}
            onOpenAchievements={() => setShowAch(true)}
            onResetData={onResetData}
            lastBackupAt={lastBackupAt}
            onExportData={doExport}
            onImportData={doImport}
            onExplainAutoBackup={explainAutoBackup}
            pendingRestore={pendingRestore}
            // session-only: the persisted answer stands, so a reopen the user walks away from doesn't re-ambush them next launch
            onReopenPendingRestore={() => onReopenRestoreOffer()}
            onDiscardPendingRestore={handleDiscardPendingRestore}
            trashCount={trash.length} onOpenTrash={() => setTrashOpen(true)}
            customMoodsCount={(settings.customMoods || []).length} onOpenMoodManager={() => setMoodManagerOpen(true)}
            promptPackName={packById(settings.promptPack).name} onOpenPromptPacks={() => setPromptPacksOpen(true)}
            onOpenDev={__DEV__ ? () => setShowDev(true) : undefined}
            reminderValue={reminderRowValue(settings.reminder, reminderPermission)}
            onOpenReminder={() => setReminderOpen(true)}
            onOpenPlusPerks={() => setPlusPerksOpen(true)}
            entries={entries} onOpenAnnualRecap={(year) => setOpenRecapYear(year)}
          />
        );
      case 'today':
      default:
        return (
          <HomeScreen
            copy={copy} mode={mode}
            streak={streak} level={level} levelName={levelName} xpInto={xpInto} xpToNext={xpToNext} entries={entries}
            quests={quests} freezes={freezes} onOpenAchievements={() => setShowAch(true)}
            embers={embers} plus={plus} plusEnabled={PLUS_ENABLED} onOpenShop={() => setShopOpen(true)}
            done={done} onWrite={() => setWriting(true)} onToggleMode={onToggleMode}
            dailyPrompt={promptSel.item} userName={(settings.name || '').trim()}
            pendingFreezeNotice={settings.pendingFreezeNotice || []}
            onDismissFreezeNotice={() => setSettings((s) => ({ ...s, pendingFreezeNotice: [] }))}
            onThisDayDismissed={settings.onThisDayDismissed || ''}
            onDismissOnThisDay={() => setSettings((s) => ({ ...s, onThisDayDismissed: dayKeyOf() }))}
            onOpenOnThisDay={(e) => { setReading(e); setQuests((qs) => markRevisited(qs, e, dayKeyOf())); }}
            onOpenPaywall={PLUS_ENABLED ? () => setPaywall(true) : () => {}}
            recapSeen={settings.recapSeen ?? null}
            onDismissAnnualRecap={(year) => setSettings((s) => ({ ...s, recapSeen: year }))}
            onOpenAnnualRecap={(year) => setOpenRecapYear(year)}
            frozenDays={frozenDays}
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
              accessibilityRole="button"
              accessibilityLabel="Write today's entry"
              style={({ pressed }) => [
                styles.fab,
                { backgroundColor: c.accent, borderColor: c.cream, transform: [{ scale: pressed ? 0.93 : 1 }] },
                theme.shadow(14, c.accentDeep, 0.9),
              ]}
            >
              <Pencil size={26} color={c.onAccent} />
            </Pressable>
            <T w={800} color={c.accentDeep} maxFontSizeMultiplier={CHROME_FONT_SCALE} numberOfLines={1} accessibilityElementsHidden style={{ fontSize: 10, marginTop: 5 }}>Write</T>
          </View>

          <Tab active={tab === 'archive'} label="Reflections" onPress={() => setTab('archive')}
            icon={<BookIcon size={23} color={tab === 'archive' ? c.accentDeep : c.muted} />} />
          <Tab active={tab === 'you'} label="You" onPress={() => setTab('you')}
            icon={<UserIcon size={23} color={tab === 'you' ? c.accentDeep : c.muted} />} />
        </View>

        {/* overlays */}
        <Modal visible={writing} animationType="slide" presentationStyle="overFullScreen" onRequestClose={closeWriting}>
          <ThemeContext.Provider value={theme}>
            {writing && (() => {
              const editEntry = editingDayKey ? entries.find((e) => e.dayKey === editingDayKey) : null;
              const te = editEntry || findTodaysEntry(entries, dayKeyOf());
              const initial = te ? { did: te.did, wished: te.wished, moods: te.moods } : null;
              const onCompleteFlow = editEntry ? (vals) => editPastEntry(editEntry.dayKey, vals) : complete;
              return (
                <WriteFlow
                  copy={copy} insets={insets} onClose={closeWriting} onComplete={onCompleteFlow} initial={initial}
                  customMoods={settings.customMoods || []} customMoodEmoji={settings.customMoodEmoji || {}}
                  onAddCustomMood={addCustomMood}
                />
              );
            })()}
          </ThemeContext.Provider>
        </Modal>

        <Modal visible={!!reading} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setReading(null)}>
          <ThemeContext.Provider value={theme}>
            {reading && (
              <ReadingSheet
                entry={reading} copy={copy} mode={mode} insets={insets} onClose={() => setReading(null)}
                canEdit={!!reading} customMoodEmoji={settings.customMoodEmoji || {}}
                onEdit={() => {
                  const dayKey = reading.dayKey;
                  setReading(null);
                  if (dayKey !== dayKeyOf()) setEditingDayKey(dayKey);
                  setWriting(true);
                }}
                onDelete={() => confirmDeleteEntry(reading)}
              />
            )}
          </ThemeContext.Provider>
        </Modal>

        <Modal visible={trashOpen} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setTrashOpen(false)}>
          <ThemeContext.Provider value={theme}>
            <TrashSheet
              trash={trash} insets={insets} onClose={() => setTrashOpen(false)}
              onRestore={restoreFromTrash} onDeleteForever={forgetFromTrash}
              plus={plus} plusEnabled={PLUS_ENABLED} freeRestoresUsed={freeRestoresUsed}
              onOpenPaywall={() => { setTrashOpen(false); setPaywall(true); }}
            />
          </ThemeContext.Provider>
        </Modal>

        <Modal visible={moodManagerOpen} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setMoodManagerOpen(false)}>
          <ThemeContext.Provider value={theme}>
            <MoodManager
              customMoods={settings.customMoods || []} customMoodEmoji={settings.customMoodEmoji || {}}
              insets={insets} onClose={() => setMoodManagerOpen(false)}
              onRenameMood={onRenameMood} onDeleteMood={onDeleteMood}
            />
          </ThemeContext.Provider>
        </Modal>

        <Modal visible={promptPacksOpen} animationType="slide" transparent onRequestClose={() => setPromptPacksOpen(false)}>
          <ThemeContext.Provider value={theme}>
            <PromptPacks
              activePackId={settings.promptPack}
              onSelect={(id) => { setSettings((s) => ({ ...s, promptPack: id })); setPromptPacksOpen(false); }}
              onClose={() => setPromptPacksOpen(false)}
            />
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

        <Modal visible={PLUS_ENABLED && getEmbersOpen} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setGetEmbersOpen(false)}>
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

        <Modal visible={PLUS_ENABLED && plusPerksOpen} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setPlusPerksOpen(false)}>
          <ThemeContext.Provider value={theme}>
            <PlusPerks insets={insets} onClose={() => setPlusPerksOpen(false)} />
          </ThemeContext.Provider>
        </Modal>

        <Modal visible={PLUS_ENABLED && openRecapYear != null} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setOpenRecapYear(null)}>
          <ThemeContext.Provider value={theme}>
            {openRecapYear != null && (
              <AnnualRecap
                insets={insets} onClose={() => setOpenRecapYear(null)}
                recap={buildRecap(entries, openRecapYear, { xp })}
                customMoodEmoji={settings.customMoodEmoji || {}}
              />
            )}
          </ThemeContext.Provider>
        </Modal>

        <Modal visible={reminderOpen} animationType="slide" transparent onRequestClose={() => setReminderOpen(false)}>
          <ThemeContext.Provider value={theme}>
            <ReminderSheet
              reminder={settings.reminder}
              permission={reminderPermission}
              onToggle={onReminderToggle}
              onTimeChange={onReminderTimeChange}
              onOpenSettings={onOpenReminderSettings}
              onClose={() => setReminderOpen(false)}
            />
          </ThemeContext.Provider>
        </Modal>

        {__DEV__ && DevPanel && (
          <Modal visible={showDev} animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setShowDev(false)}>
            <DevPanel
              onLoadState={(state) => { setShowDev(false); onReplaceAllData(state); }}
              onResetFresh={() => { setShowDev(false); onResetData(); }}
              onClose={() => setShowDev(false)}
              settings={settings}
              setSettings={setSettings}
              onRearmReminders={rearmReminders}
              wroteToday={!!findTodaysEntry(entries, dayKeyOf())}
              getSlice={currentSlice}
              appVersion={APP_VERSION}
              insets={insets}
              onOpenCelebration={(opts) => setCelebrate({ streak: opts.streak, xp: XP_GAIN, embers: EMBER_GAIN, milestone: opts.milestone || null })}
              onOpenAchievements={() => setShowAch(true)}
              onOpenShop={() => setShopOpen(true)}
              onOpenGetEmbers={() => setGetEmbersOpen(true)}
              onOpenReminder={() => setReminderOpen(true)}
              onShowToast={(msg) => showToast(msg)}
              onOpenReading={(entry) => setReading(entry)}
              onOpenRestoreNotice={(daysAgo) => setDevRestoreMs(Date.now() - (daysAgo || 0) * 86400000)}
              plusFlow={{
                platform: PLATFORM, service, plus, livePlan, subCanceled, renewLabel, livePrice,
                openLink, onSubscribe: subscribe, onRestore: doRestore, onCancel: doCancel,
                onResume: doResume, onGetHelp: doGetHelp,
              }}
            />
          </Modal>
        )}

        {toast && !shopOpen && <Toast key={toast.key} message={toast.msg} bottom={insets.bottom} />}

        <RestoreNotice
          restoredAtMs={devRestoreMs ?? restoredFromMs}
          onGotIt={() => (devRestoreMs ? setDevRestoreMs(null) : onDismissRestoreNotice())}
          onRestoreFile={() => { (devRestoreMs ? setDevRestoreMs(null) : onDismissRestoreNotice()); doImport(); }}
        />

        {pendingRestore && !restoreOfferAnswered && (
          <RestoreOffer
            stash={pendingRestore}
            onLoad={handleLoadPendingRestore}
            onRestoreFile={() => doImport({ onConfirmed: onAnswerRestoreOffer })}
            onKeepFreshStart={handleKeepFreshStart}
          />
        )}
      </View>
    </ThemeContext.Provider>
  );
}

function Tab({ active, label, icon, onPress }) {
  const t = React.useContext(ThemeContext);
  return (
    <Pressable onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: active }} style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 2 }}>
      {icon}
      <T w={700} color={active ? t.colors.accentDeep : t.colors.muted} maxFontSizeMultiplier={CHROME_FONT_SCALE} numberOfLines={1} style={{ fontSize: 10.5 }}>{label}</T>
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
    minHeight: 78,
  },
  fab: {
    width: 64, height: 64, borderRadius: 32, marginTop: -26,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 6,
  },
});
