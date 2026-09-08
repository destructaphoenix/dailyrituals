// screens/PlusFlow.js — the subscription compliance + lifecycle layer, mirrored
// from rituals-plus.jsx. Adds the four things the marketing paywall lacked:
//   1. A single real purchase surface (onboarding routes here too).
//   2. A reachable Manage / Cancel subscription view.
//   3. Designed purchase-state UX — pending, failed, no-connection,
//      already-owned, restore-success, restore-empty.
//   4. A store-compliant legal footer (Terms · Privacy + auto-renew disclosure).

import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator, AppState, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme';
import { T, PrimaryButton } from '../ui';
import { Close, Check, Sun, Chevron, Alert, NoSignal, Restore, Shield, Receipt, Ban, Info } from '../icons';
import { PLUS_PRICES, RENEW_DATE } from '../data';
import { checkEntitlement } from '../billing/entitlementSync';
import Row from '../ui/Row';

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
// `prices` carries the store's live localized prices (see billing/useLivePrices).
// It defaults to the design constants so non-purchase callers keep working, but
// the paywall must pass the live set — this text is the binding price disclosure.
export function LegalFooter({ platform, plan, prices = PLUS_PRICES, onLink }) {
  const c = useTheme().colors;
  const w = storeWords(platform);
  const p = prices[plan] || prices.annual;
  // IMP-090. This read "Your 7-day free trial converts to …" unconditionally —
  // the binding price disclosure promising a trial the app had never fetched and
  // Play had already burned for this account. The clause now appears only when
  // the live offer carries one, and it describes the OFFER ("for new
  // subscribers") rather than promising this buyer, because only Play knows.
  const trialDays = Number(p.trialDays);
  const hasTrial = Number.isFinite(trialDays) && trialDays > 0;
  const trialClause = hasTrial
    ? `${trialDays} days free for new subscribers — ${w.storeShort} confirms at purchase whether it applies to you. Then `
    : '';
  const chargeClause = hasTrial ? ', charged to your ' : '. Payment is charged to your ';
  const link = (k, label) => (
    <Pressable onPress={() => onLink && onLink(k)} hitSlop={6}>
      <T w={800} color={c.accentDeep} style={{ fontSize: 12, textDecorationLine: 'underline' }}>{label}</T>
    </Pressable>
  );
  return (
    <View style={{ marginTop: 11 }}>
      <T w={600} color={c.muted} style={{ fontSize: 11, lineHeight: 16.5, textAlign: 'center' }}>
        {trialClause}<T w={800} color={c.ink} style={{ fontSize: 11 }}>{p.price}</T> {p.per}{chargeClause}{w.account} at
        confirmation. It renews automatically unless cancelled at least 24 hours before the period ends — manage or
        cancel anytime in {w.store} settings.
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
  deferred: { tone: 'good', title: 'Payment still processing.', body: "Google Play hasn't finished confirming your payment. Plus unlocks by itself the moment it clears — there is nothing to buy again.", primary: 'OK', dismissTo: 'paywall' },
};

// Pure — IMP-092/IMP-101. `failed` is the only card whose copy is
// purchase-shaped, and both restore() and a buy() that IMP-101 could not
// reconcile can legitimately return it. A restore never charges anyone, so
// "you weren't charged" is irrelevant and quietly alarming there — and a
// buy's failure was never actually confirmed with the store, so the app has
// no basis to claim no money moved either. Each mode gets what it can
// honestly say it checked.
export function resultCopy(kind, mode, platform) {
  const meta = RESULT_META[kind] || RESULT_META.failed;
  if (kind !== 'failed') return meta;
  if (mode === 'restore') {
    return {
      ...meta,
      title: "We couldn't check.",
      body: 'Something stopped us reaching the store. Nothing has changed — try again in a moment.',
    };
  }
  const w = storeWords(platform);
  return {
    ...meta,
    title: "We couldn't confirm that.",
    body: `We checked with ${w.store} and couldn't see a subscription. If you were charged it will appear shortly — check before buying again.`,
  };
}

function ResultIcon({ kind, c }) {
  if (kind === 'network') return <NoSignal size={30} color={c.accentDeep} />;
  if (kind === 'failed' || kind === 'restore-empty') return <Alert size={30} color={c.accentDeep} />;
  if (kind === 'deferred') return <Info size={30} color={c.onAccent} />;
  return <Check size={30} color={c.onAccent} />;
}

// IMP-088 — the pending overlay stops being a trap.
//
// Proven on a device 2026-09-06 (WALK-19 step 0c, airplane mode): the purchase
// hung on "Confirming with Play Store…" forever. `run()` below awaits the
// service with no bound, and this card renders NO dismiss control while saying
// "Don't close the app" — so a promise that never settles leaves force-quit as
// the only way out. RevenueCat's getOfferings/purchasePackage can both hang
// with no network; nothing may ever reject.
//
// A timeout that declares FAILURE would be worse than the hang. A real purchase
// legitimately takes minutes — the Play sheet is up, a card is being added, a
// bank is running 3DS/OTP (very much the norm on the INR flows this app now
// serves). Telling someone their purchase failed while Play is mid-charge is the
// one outcome worse than a spinner. So this never asserts an outcome: after the
// grace period it offers a way OUT, and the caller reconciles with the store.
export const PENDING_GRACE_MS = 20000;

// Pure — what a stuck phase is allowed to say. Note it claims nothing about
// whether the purchase worked, because at this point nothing knows.
// Pure — IMP-093. What the pending card may say BEFORE the escape arms.
//
// This was the literal "Don't close the app." WALK-19's 2026-09-07 re-run
// established that backing out is not only possible but SAFE: Android's back
// closes the paywall, and `dismiss()` below now reconciles with the store on
// the way out. So the old line was talking the user out of the one exit that
// worked — and it is why IMP-088 was written up as "force-quit is the only way
// out", which was never true.
//
// Like stuckCopy, it asserts NOTHING about the outcome.
export function pendingCopy(mode, platform) {
  const w = storeWords(platform);
  return mode === 'restore'
    ? 'This can take a moment. Going back is safe — nothing is being charged.'
    : `This can take a minute. Going back is safe — we'll check with ${w.storeShort} either way.`;
}

export function stuckCopy(mode, platform) {
  const w = storeWords(platform);
  return mode === 'restore'
    ? { line: `${w.storeShort} isn't answering. You can close this and try again — nothing has changed.`, action: 'Close' }
    : { line: `${w.storeShort} hasn't answered yet. If you were charged, your Plus will appear on its own — closing this won't cancel anything.`, action: 'Close' };
}

// IMP-091 — WALK-19 step 4c, 2026-09-06, on hardware: airplane mode, tap buy,
// and at 22s, 32s and past 60s the Close button IMP-088 shipped never appeared.
// The wiring was correct; the only thing that arms the escape was a setTimeout,
// and Google Play's purchase sheet is a SEPARATE Android activity — our app is
// backgrounded for the entire grace period, and Android throttles background JS
// timers. A timer that does not run cannot arm anything.
//
// Elapsed wall-clock time is the fact that survives being paused. Pure so the
// rule is pinnable in jest, which can see none of the rest of this: it has no
// Play sheet and no Android activity lifecycle.
//
// `startedAt` of 0 means no flow is pending — nothing to arm.
export function graceSpent(startedAt, now, graceMs) {
  return !!startedAt && (now - startedAt) >= graceMs;
}

export function PurchaseOverlay({ flow, stuck, platform, onRetry, onDismiss, onComplete }) {
  const t = useTheme();
  const c = t.colors;
  if (!flow) return null;
  const w = storeWords(platform);

  const scrim = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 30, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: c.scrim };
  const card = [{ width: '100%', maxWidth: 340, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: t.radius.card, padding: 26, alignItems: 'center' }, t.shadow(30, '#000', 0.45)];

  if (flow.phase === 'pending') {
    const label = flow.mode === 'restore' ? 'Looking for past purchases…' : `Confirming with ${w.storeShort}…`;
    const escape = stuck ? stuckCopy(flow.mode, platform) : null;
    return (
      <View style={scrim}>
        <View style={card}>
          <ActivityIndicator size="large" color={c.accentDeep} />
          <T d w={700} color={c.ink} style={{ fontSize: 17, marginTop: 18, textAlign: 'center' }}>{label}</T>
          {escape ? (
            <>
              <T w={600} color={c.muted} style={{ fontSize: 13.5, lineHeight: 19, marginTop: 8, textAlign: 'center' }}>{escape.line}</T>
              <View style={{ width: '100%', marginTop: 18 }}>
                <GhostButton label={escape.action} onPress={onDismiss} />
              </View>
            </>
          ) : (
            <T w={600} color={c.muted} style={{ fontSize: 13, lineHeight: 18, marginTop: 6, textAlign: 'center' }}>{pendingCopy(flow.mode, platform)}</T>
          )}
        </View>
      </View>
    );
  }

  const meta = resultCopy(flow.kind, flow.mode, platform);
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
export function usePurchaseFlow({ service, platform, onComplete, onAbandon, graceMs = PENDING_GRACE_MS }) {
  const [flow, setFlow] = useState(null);
  // IMP-088: the service call is unbounded, so this is what bounds the UI. It
  // does NOT settle the flow — it only unlocks a way out. See stuckCopy above.
  const [stuck, setStuck] = useState(false);
  const timer = useRef(null);
  const alive = useRef(true);
  // IMP-091: when the pending flow began, or 0 when none is pending. The timer
  // above stays — it is correct whenever the app holds the foreground for the
  // whole grace period, which is the restore path. This is what covers the buy
  // path, where Play's sheet takes the foreground away. See graceSpent().
  const startedAt = useRef(0);
  useEffect(() => () => {
    alive.current = false;
    if (timer.current) clearTimeout(timer.current);
  }, []);
  // Coming back to the foreground is the first moment JS is guaranteed to run
  // again after Play's sheet closes, so it is where the elapsed time is read.
  // (If the user returns BEFORE the grace period is up, the paused timer resumes
  // and fires the normal way — deliberately not re-armed here.)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !alive.current) return;
      if (graceSpent(startedAt.current, Date.now(), graceMs)) setStuck(true);
    });
    return () => { if (sub && typeof sub.remove === 'function') sub.remove(); };
  }, [graceMs]);
  const lastEntitlement = useRef(null);
  const lastPlanRef = useRef('annual');
  const lastModeRef = useRef('buy');

  const clearTimer = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };

  const run = async (mode, fn) => {
    lastModeRef.current = mode;
    setFlow({ phase: 'pending', mode });
    setStuck(false);
    clearTimer();
    startedAt.current = Date.now();
    timer.current = setTimeout(() => { if (alive.current) setStuck(true); }, graceMs);
    let res;
    try {
      res = await fn();
    } catch (e) {
      res = { kind: 'failed' };
    }
    // IMP-101: a `failed` buy has no basis for its "you weren't charged" claim
    // until the store itself is asked. This runs BEFORE clearTimer() — order
    // is not negotiable — so IMP-088's escape stays armed for the duration; a
    // hanging reconcile must not re-create the trap that walk found.
    if (mode === 'buy' && res.kind === 'failed') {
      const reconciled = await checkEntitlement(service);
      if (reconciled.entitlement) res = { kind: 'success', entitlement: reconciled.entitlement };
    }
    clearTimer();
    startedAt.current = 0;
    if (!alive.current) return;
    setStuck(false);
    lastEntitlement.current = res.entitlement || null;
    if (res.kind === 'cancel') { setFlow(null); return; }
    // `mode` rides along into the result phase — resultCopy needs to know a
    // `failed` card came from a restore, not a purchase (IMP-092).
    setFlow({ phase: 'result', kind: res.kind, mode });
  };

  // Leaving a stuck flow asserts nothing about the purchase, so the app has to
  // go and ask. Failure-tolerant by construction (checkEntitlement/nextPlusState,
  // IMP-043): an unreachable store changes nothing rather than downgrading.
  const dismiss = () => {
    // IMP-093: this used to gate the reconcile on `stuck`, which was right when
    // the 20-second escape was the only way to reach it. WALK-19 2026-09-07
    // found another: Android's back closes the whole paywall, and a back press
    // at 3 seconds abandons a real purchase just as much as one at 30. What
    // matters is that a flow was IN FLIGHT, not how long the user waited.
    const wasPending = !!flow && flow.phase === 'pending';
    const mode = lastModeRef.current;
    clearTimer();
    startedAt.current = 0;
    setStuck(false);
    setFlow(null);
    if (wasPending && onAbandon) onAbandon(mode);
  };

  const buy = (plan) => { lastPlanRef.current = plan; return run('buy', () => service.buy(plan)); };
  const restore = () => run('restore', () => service.restore());

  const overlay = (
    <PurchaseOverlay
      flow={flow}
      stuck={stuck}
      platform={platform}
      // IMP-089: retry must repeat what the user actually asked for. This
      // called buy() unconditionally, so "Try again" on the restore-empty and
      // network cards opened Play's purchase sheet — one tap from charging
      // someone whose only gesture was "I already paid". The mode is already
      // tracked for dismiss(); retry simply never consulted it.
      onRetry={() => {
        clearTimer();
        startedAt.current = 0;
        setStuck(false);
        setFlow(null);
        if (lastModeRef.current === 'restore') restore();
        else buy(lastPlanRef.current);
      }}
      onDismiss={dismiss}
      onComplete={() => { clearTimer(); startedAt.current = 0; setFlow(null); onComplete(lastEntitlement.current); }}
    />
  );
  // `pending` and `dismiss` are what a caller that owns the Modal needs to
  // handle Android's back without walking away from a purchase (IMP-093).
  const pending = !!flow && flow.phase === 'pending';
  return { flow, stuck, pending, buy, restore, dismiss, overlay, reset: () => { clearTimer(); startedAt.current = 0; setStuck(false); setFlow(null); } };
}

// ── Manage / cancel subscription ──────────────────────────────────────────────
export function ManageSubscription({ insets, platform, plan, canceled, renewLabel, priceString, onClose, onChangePlan, onRestore, onCancel, onResume, onLink, onGetHelp }) {
  const t = useTheme();
  const c = t.colors;
  const w = storeWords(platform);
  const p = PLUS_PRICES[plan] || PLUS_PRICES.annual;
  // IMP-082: null means the app has no live renewal date. Drop the claim —
  // never substitute the RENEW_DATE design mock.
  const renew = renewLabel;
  const priceText = priceString || p.price;
  const [cancelSheet, setCancelSheet] = useState(false);

  // Cap to the viewport so the ScrollView is bounded on Android's first modal
  // measure pass, where flex:1 alone bounds nothing. See Shop.js for the full
  // explanation.
  const { height: winH } = useWindowDimensions();

  const Divider = () => <View style={{ height: 1, backgroundColor: c.border, marginLeft: 66 }} />;

  return (
    <View style={{ flex: 1, maxHeight: winH, backgroundColor: c.cream, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 6 }}>
        <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close subscription" style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: c.ghostBtn, opacity: pressed ? 0.6 : 1 })}>
          <Chevron dir="left" size={22} color={c.ink} />
        </Pressable>
        <T d w={800} color={c.ink} style={{ fontSize: 19 }}>Subscription</T>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 36 + insets.bottom, paddingTop: 4 }} showsVerticalScrollIndicator={false}>
        {/* status header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, borderRadius: t.radius.card, backgroundColor: c.surface, borderWidth: 1, borderColor: c.accentBorder, marginTop: 4 }}>
          <View style={[{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accent }, t.shadow(8, c.accentDeep, 0.8)]}>
            <Sun size={18} color={c.onAccent} />
          </View>
          <View style={{ flex: 1 }}>
            <T d w={800} color={c.ink} style={{ fontSize: 16 }}>Daily Rituals Plus</T>
            <T w={600} color={c.muted} style={{ fontSize: 12.5, marginTop: 1 }}>
              {canceled
                ? (renew ? `Ends ${renew} · access until then` : 'Ends soon · access until then')
                : (renew ? `${p.label} · renews ${renew}` : p.label)}
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
            ? (renew ? `Your subscription won't renew. You'll keep Plus until ${renew}.` : "Your subscription won't renew.")
            : (renew ? `Cancelling stops the next renewal — you keep Plus until ${renew}.` : 'Cancelling stops the next renewal.')}
        </T>
      </ScrollView>

      {cancelSheet && (
        <CancelSheet platform={platform} renewLabel={renew}
          onKeep={() => setCancelSheet(false)}
          onConfirm={() => { setCancelSheet(false); onCancel(); }} />
      )}
    </View>
  );
}

// Confirm sheet — Apple/Google route cancellation through system settings.
export function CancelSheet({ platform, renewLabel, onKeep, onConfirm }) {
  const t = useTheme();
  const c = t.colors;
  const w = storeWords(platform);
  const renew = renewLabel; // IMP-082 — no live date, no promise about one
  return (
    <Pressable onPress={onKeep} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 31, alignItems: 'center', justifyContent: 'flex-end', padding: 16, backgroundColor: c.scrim }}>
      <Pressable onPress={() => {}} style={[{ width: '100%', maxWidth: 400, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: t.radius.card, padding: 24, alignItems: 'center' }, t.shadow(30, '#000', 0.45)]}>
        <View style={{ width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginBottom: 16, backgroundColor: c.redSoft }}>
          <Ban size={26} color={c.red} />
        </View>
        <T d w={800} color={c.ink} style={{ fontSize: 22, lineHeight: 26, textAlign: 'center' }}>Cancel Daily Rituals Plus?</T>
        <T w={600} color={c.muted} style={{ fontSize: 14.5, lineHeight: 21, textAlign: 'center', marginTop: 9 }}>
          Subscriptions are managed by {w.store}. We'll open your subscription settings so you can cancel
          {renew ? ` — you'll keep Plus until ${renew}.` : '.'}
        </T>
        <View style={{ width: '100%', gap: 9, marginTop: 22 }}>
          <DangerButton label={`Open ${w.storeShort} settings`} onPress={onConfirm} />
          <GhostButton label="Keep Plus" onPress={onKeep} />
        </View>
      </Pressable>
    </Pressable>
  );
}
