// screens/PlusFlow.js — the subscription compliance + lifecycle layer, mirrored
// from rituals-plus.jsx. Adds the four things the marketing paywall lacked:
//   1. A single real purchase surface (onboarding routes here too).
//   2. A reachable Manage / Cancel subscription view.
//   3. Designed purchase-state UX — pending, failed, no-connection,
//      already-owned, restore-success, restore-empty.
//   4. A store-compliant legal footer (Terms · Privacy + auto-renew disclosure).

import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme';
import { T, PrimaryButton } from '../ui';
import { Close, Check, Sun, Chevron, Alert, NoSignal, Restore, Shield, Receipt, Ban, Info } from '../icons';
import { PLUS_PRICES, RENEW_DATE } from '../data';

// Store wording flips with platform so the disclosure is truthful on both.
export function storeWords(platform) {
  return platform === 'android'
    ? { store: 'Google Play', storeShort: 'Play Store', account: 'Google Play account' }
    : { store: 'the App Store', storeShort: 'App Store', account: 'Apple ID' };
}

export { RENEW_DATE };

// ── Shared small buttons ──────────────────────────────────────────────────────
function GhostButton({ label, onPress }) {
  const c = useTheme().colors;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({
      width: '100%', paddingVertical: 16, borderRadius: 18, borderWidth: 1.5, borderColor: c.border,
      alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1,
    })}>
      <T d w={700} color={c.accentDeep} style={{ fontSize: 16 }}>{label}</T>
    </Pressable>
  );
}
function DangerButton({ label, onPress }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{
      width: '100%', paddingVertical: 16, borderRadius: t.radius.btn, backgroundColor: c.red,
      alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.99 : 1 }],
    }, t.shadow(10, c.red, 0.5)]}>
      <T d w={700} color={c.onAccent} style={{ fontSize: 16 }}>{label}</T>
    </Pressable>
  );
}

// ── Compliant legal footer (paywall) ──────────────────────────────────────────
export function LegalFooter({ platform, plan, onLink }) {
  const c = useTheme().colors;
  const w = storeWords(platform);
  const p = PLUS_PRICES[plan] || PLUS_PRICES.annual;
  const link = (k, label) => (
    <Pressable onPress={() => onLink && onLink(k)} hitSlop={6}>
      <T w={800} color={c.accentDeep} style={{ fontSize: 12, textDecorationLine: 'underline' }}>{label}</T>
    </Pressable>
  );
  return (
    <View style={{ marginTop: 11 }}>
      <T w={600} color={c.muted} style={{ fontSize: 11, lineHeight: 16.5, textAlign: 'center' }}>
        Your 7-day free trial converts to <T w={800} color={c.ink} style={{ fontSize: 11 }}>{p.price}</T> {p.per}. Payment
        is charged to your {w.account} at confirmation. It renews automatically unless cancelled at least 24 hours before
        the period ends — manage or cancel anytime in {w.store} settings.
      </T>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 9 }}>
        {link('terms', 'Terms of Service')}
        <T w={800} color={c.border} style={{ fontSize: 12 }}>·</T>
        {link('privacy', 'Privacy Policy')}
        <T w={800} color={c.border} style={{ fontSize: 12 }}>·</T>
        {link('restore', 'Restore')}
      </View>
    </View>
  );
}

// ── Purchase-state overlay (pending + result) ─────────────────────────────────
const RESULT_META = {
  success: { tone: 'good', title: "You're in.", body: 'Welcome to Daily Rituals Plus. Every palette, sky and candle is yours to keep.', primary: 'Begin', dismissTo: 'complete' },
  owned: { tone: 'good', title: 'You already have Plus.', body: "This account is already a member — you weren't charged again. We've restored your access.", primary: 'Great', dismissTo: 'complete' },
  restored: { tone: 'good', title: 'Plus restored.', body: 'Welcome back — your membership is active again on this device.', primary: 'Done', dismissTo: 'complete' },
  failed: { tone: 'bad', title: "That didn't go through.", body: "Something interrupted the purchase and you weren't charged. You can try again.", primary: 'Try again', secondary: 'Not now', dismissTo: 'paywall' },
  network: { tone: 'bad', title: 'No connection.', body: "We couldn't reach the store. Check your connection, then give it another try.", primary: 'Try again', secondary: 'Not now', dismissTo: 'paywall' },
  'restore-empty': { tone: 'bad', title: 'Nothing to restore.', body: "We couldn't find a subscription on this account. If you believe this is a mistake, contact support.", primary: 'Try again', secondary: 'Close', dismissTo: 'paywall' },
};

function ResultIcon({ kind, c }) {
  if (kind === 'network') return <NoSignal size={30} color={c.accentDeep} />;
  if (kind === 'failed' || kind === 'restore-empty') return <Alert size={30} color={c.accentDeep} />;
  return <Check size={30} color={c.onAccent} />;
}

export function PurchaseOverlay({ flow, platform, onRetry, onDismiss, onComplete }) {
  const t = useTheme();
  const c = t.colors;
  if (!flow) return null;
  const w = storeWords(platform);

  const scrim = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 30, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: c.scrim };
  const card = [{ width: '100%', maxWidth: 340, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: t.radius.card, padding: 26, alignItems: 'center' }, t.shadow(30, '#000', 0.45)];

  if (flow.phase === 'pending') {
    const label = flow.mode === 'restore' ? 'Looking for past purchases…' : `Confirming with ${w.storeShort}…`;
    return (
      <View style={scrim}>
        <View style={card}>
          <ActivityIndicator size="large" color={c.accentDeep} />
          <T d w={700} color={c.ink} style={{ fontSize: 17, marginTop: 18 }}>{label}</T>
          <T w={600} color={c.muted} style={{ fontSize: 13, marginTop: 4 }}>Don't close the app.</T>
        </View>
      </View>
    );
  }

  const meta = RESULT_META[flow.kind] || RESULT_META.failed;
  const good = meta.tone === 'good';
  return (
    <View style={scrim}>
      <View style={card}>
        <View style={[{ width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', marginBottom: 18, backgroundColor: good ? c.accent : c.accentSoft }, good ? t.shadow(12, c.accentDeep, 0.8) : null]}>
          <ResultIcon kind={flow.kind} c={c} />
        </View>
        <T d w={800} color={c.ink} style={{ fontSize: 22, lineHeight: 26, textAlign: 'center' }}>{meta.title}</T>
        <T w={600} color={c.muted} style={{ fontSize: 14.5, lineHeight: 21, textAlign: 'center', marginTop: 9 }}>{meta.body}</T>
        <View style={{ width: '100%', gap: 9, marginTop: 22 }}>
          <PrimaryButton label={meta.primary} onPress={() => (meta.dismissTo === 'complete' ? onComplete() : onRetry())} />
          {meta.secondary ? <GhostButton label={meta.secondary} onPress={onDismiss} /> : null}
        </View>
      </View>
    </View>
  );
}

// Shared store state machine. Drives its pending→result overlay off an injected
// async PurchaseService (sim in Expo Go, RevenueCat in dev/prod builds). The
// service owns timing/outcomes; this hook owns transient UI state.
export function usePurchaseFlow({ service, platform, onComplete }) {
  const [flow, setFlow] = useState(null);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  const lastEntitlement = useRef(null);
  const lastPlanRef = useRef('annual');

  const run = async (mode, fn) => {
    setFlow({ phase: 'pending', mode });
    let res;
    try {
      res = await fn();
    } catch (e) {
      res = { kind: 'failed' };
    }
    if (!alive.current) return;
    lastEntitlement.current = res.entitlement || null;
    if (res.kind === 'cancel') { setFlow(null); return; }
    setFlow({ phase: 'result', kind: res.kind });
  };

  const buy = (plan) => { lastPlanRef.current = plan; return run('buy', () => service.buy(plan)); };
  const restore = () => run('restore', () => service.restore());

  const overlay = (
    <PurchaseOverlay
      flow={flow}
      platform={platform}
      onRetry={() => { setFlow(null); buy(lastPlanRef.current); }}
      onDismiss={() => setFlow(null)}
      onComplete={() => { setFlow(null); onComplete(lastEntitlement.current); }}
    />
  );
  return { flow, buy, restore, overlay, reset: () => setFlow(null) };
}

// ── Manage / cancel subscription ──────────────────────────────────────────────
export function ManageSubscription({ insets, platform, plan, canceled, renewLabel, priceString, onClose, onChangePlan, onRestore, onCancel, onResume, onLink, onGetHelp }) {
  const t = useTheme();
  const c = t.colors;
  const w = storeWords(platform);
  const p = PLUS_PRICES[plan] || PLUS_PRICES.annual;
  const renew = renewLabel || RENEW_DATE;
  const priceText = priceString || p.price;
  const [cancelSheet, setCancelSheet] = useState(false);

  const Row = ({ icon, label, value, onPress }) => (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 15, opacity: pressed ? 0.6 : 1 })}>
      <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <T w={700} color={c.ink} style={{ flex: 1, fontSize: 15.5 }}>{label}</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {value ? <T w={700} color={c.muted} style={{ fontSize: 14 }}>{value}</T> : null}
        <Chevron dir="right" size={18} color={c.muted} />
      </View>
    </Pressable>
  );
  const Divider = () => <View style={{ height: 1, backgroundColor: c.border, marginLeft: 66 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: c.cream, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 6 }}>
        <Pressable onPress={onClose} hitSlop={8} style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: c.ghostBtn, opacity: pressed ? 0.6 : 1 })}>
          <Chevron dir="left" size={22} color={c.ink} />
        </Pressable>
        <T d w={800} color={c.ink} style={{ fontSize: 19 }}>Subscription</T>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 36, paddingTop: 4 }} showsVerticalScrollIndicator={false}>
        {/* status header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, borderRadius: t.radius.card, backgroundColor: c.surface, borderWidth: 1, borderColor: c.accentBorder, marginTop: 4 }}>
          <View style={[{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accent }, t.shadow(8, c.accentDeep, 0.8)]}>
            <Sun size={18} color={c.onAccent} />
          </View>
          <View style={{ flex: 1 }}>
            <T d w={800} color={c.ink} style={{ fontSize: 16 }}>Daily Rituals Plus</T>
            <T w={600} color={c.muted} style={{ fontSize: 12.5, marginTop: 1 }}>
              {canceled ? `Ends ${renew} · access until then` : `${p.label} · renews ${renew}`}
            </T>
          </View>
          <View style={{ backgroundColor: canceled ? c.cancelSoft : c.greenSoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
            <T d w={800} color={canceled ? c.accentDeep : c.green} style={{ fontSize: 11, letterSpacing: 0.4 }}>{canceled ? 'ENDING' : 'ACTIVE'}</T>
          </View>
        </View>

        {/* plan detail */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: t.radius.card, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, marginTop: 14 }}>
          <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Receipt size={20} color={c.accentDeep} />
          </View>
          <View style={{ flex: 1 }}>
            <T d w={800} color={c.ink} style={{ fontSize: 16 }}>{p.label} plan</T>
            <T w={600} color={c.muted} style={{ fontSize: 13, marginTop: 2 }}>{priceText} {p.per} · {p.sub.toLowerCase()}</T>
          </View>
        </View>

        {/* actions */}
        <View style={{ marginTop: 14, borderRadius: t.radius.card, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
          {canceled
            ? <Row icon={<Sun size={18} color={c.accentDeep} />} label="Resume Plus" onPress={onResume} />
            : <Row icon={<Receipt size={18} color={c.accentDeep} />} label="Change plan" value={plan === 'annual' ? 'Annual' : 'Monthly'} onPress={onChangePlan} />}
          <Divider />
          <Row icon={<Restore size={18} color={c.accentDeep} />} label="Restore purchases" onPress={onRestore} />
          <Divider />
          <Row icon={<Shield size={18} color={c.accentDeep} />} label="Terms & Privacy" onPress={() => onLink && onLink('privacy')} />
          <Divider />
          <Row icon={<Info size={18} color={c.accentDeep} />} label="Get help" onPress={onGetHelp} />
        </View>

        {/* cancel */}
        {!canceled && (
          <Pressable onPress={() => setCancelSheet(true)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, paddingVertical: 15, borderRadius: t.radius.btn, borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface, opacity: pressed ? 0.7 : 1 })}>
            <Ban size={18} color={c.red} />
            <T d w={700} color={c.red} style={{ fontSize: 15.5 }}>Cancel subscription</T>
          </Pressable>
        )}

        <T w={600} color={c.muted} style={{ fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 18, marginHorizontal: 4 }}>
          Billing is handled by {w.store}. {canceled
            ? `Your subscription won't renew. You'll keep Plus until ${renew}.`
            : `Cancelling stops the next renewal — you keep Plus until ${renew}.`}
        </T>
      </ScrollView>

      {cancelSheet && (
        <CancelSheet platform={platform}
          onKeep={() => setCancelSheet(false)}
          onConfirm={() => { setCancelSheet(false); onCancel(); }} />
      )}
    </View>
  );
}

// Confirm sheet — Apple/Google route cancellation through system settings.
export function CancelSheet({ platform, onKeep, onConfirm }) {
  const t = useTheme();
  const c = t.colors;
  const w = storeWords(platform);
  return (
    <Pressable onPress={onKeep} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 31, alignItems: 'center', justifyContent: 'flex-end', padding: 16, backgroundColor: c.scrim }}>
      <Pressable onPress={() => {}} style={[{ width: '100%', maxWidth: 400, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: t.radius.card, padding: 24, alignItems: 'center' }, t.shadow(30, '#000', 0.45)]}>
        <View style={{ width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginBottom: 16, backgroundColor: c.redSoft }}>
          <Ban size={26} color={c.red} />
        </View>
        <T d w={800} color={c.ink} style={{ fontSize: 22, lineHeight: 26, textAlign: 'center' }}>Cancel Daily Rituals Plus?</T>
        <T w={600} color={c.muted} style={{ fontSize: 14.5, lineHeight: 21, textAlign: 'center', marginTop: 9 }}>
          Subscriptions are managed by {w.store}. We'll open your subscription settings so you can cancel — you'll keep
          Plus until {RENEW_DATE}.
        </T>
        <View style={{ width: '100%', gap: 9, marginTop: 22 }}>
          <DangerButton label={`Open ${w.storeShort} settings`} onPress={onConfirm} />
          <GhostButton label="Keep Plus" onPress={onKeep} />
        </View>
      </Pressable>
    </Pressable>
  );
}
