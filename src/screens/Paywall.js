// screens/Paywall.js — the single Plus purchase surface, mirrored from Paywall
// in rituals-shop.jsx. Annual/Monthly toggle (annual 50% off), the store's own
// trial offer if it has one, restore, designed purchase states, and a
// store-compliant legal footer.
// Reached from locked cosmetics, the You banner, onboarding, and Export.

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme';
import { T, PrimaryButton } from '../ui';
import { Close, Check, Sun, Restore } from '../icons';
import { CHROME_FONT_SCALE } from '../ui/textScale';
import { BigSun } from '../art';
import { PLUS_PERKS } from '../data';
import { useLivePrices } from '../billing/useLivePrices';
import { ctaLabel } from '../billing/prices';
import { LegalFooter, usePurchaseFlow } from './PlusFlow';

// IMP-096 — the "SAVE 50%" badge and the selected-state tick are both absolutely
// positioned against a plan card's top-right corner. The badge's box grows with
// the text inside it, so at max font it reached down over the tick; both are
// c.accentDeep/c.accent orange, so they read as one shape instead of a badge and
// a tick. Two constants keep them apart at EVERY font scale: the badge is capped
// at CHROME_FONT_SCALE — the cap textScale.js already defines for pills and
// badges — which bounds its height, and the tick simply starts below that bound.
// ⚠️ Neither offset may be derived from the font scale. A scale-dependent offset
// is the bug this file has already had twice (IMP-067, IMP-095).
const SAVE_BADGE_TOP = -10;
const SAVE_BADGE_MAX_H = 28; // 8dp of padding + one 10.5dp line capped at 1.2x
const PLAN_TICK_TOP = SAVE_BADGE_TOP + SAVE_BADGE_MAX_H + 4; // 22 — clears the badge

export default function Paywall({ insets, platform = 'ios', service, alreadyPlus, onClose, onSubscribe, onLink, onAbandon, closeGuard }) {
  const t = useTheme();
  const c = t.colors;
  // Android's Modal is a Dialog whose window size isn't known on the first measure
  // pass, so a flex column here resolves against nothing and the fixed footer lands
  // on top of the plan price and the last perks. IMP-068 (`flex: 1` on the ScrollView)
  // and IMP-074 (`maxHeight: winH` here) were both correct reasoning about that
  // measure pass, and both are SUPERSEDED rather than wrong: WALK-07's 2026-08-16
  // re-run found both halves present in code and the overlap still happening from the
  // very first frame. So IMP-080 stops tuning the measurement and removes the race —
  // the root is an exact `height: winH` (the viewport, not a cap, so `bottom: 0`
  // below is meaningful even when the page is short), and the footer is lifted out of
  // the flex column entirely with `position: 'absolute', bottom: 0`. Its position no
  // longer depends on the column measuring correctly at all. `winH` must keep coming
  // from useWindowDimensions() so it tracks rotation — a source assertion guards that.
  const { height: winH } = useWindowDimensions();
  const [plan, setPlan] = useState('annual');
  // Seeded at the footer's real approximate height (PrimaryButton + LegalFooter), not
  // 0: onLayout corrects it either way, but a 0 seed ships a short first frame.
  const [footerH, setFooterH] = useState(96);
  // The store's localized prices, falling back to the design constants. Never
  // render PLUS_PRICES directly here — Google charges the store price, not ours.
  const prices = useLivePrices(service);
  const flow = usePurchaseFlow({
    service,
    platform,
    onComplete: (entitlement) => onSubscribe(plan, entitlement),
    // IMP-088: abandoning a stuck flow says nothing about the purchase, so ask
    // the store. Passed through rather than handled here — only the app owns
    // `plus`, and only it can apply the answer.
    onAbandon,
  });

  // IMP-093 — the Modal that wraps this screen belongs to the caller, so only
  // the caller sees Android's back press. WALK-19 2026-09-07: Play's
  // no-connection page can only be dismissed with Back, and Back closed the
  // whole paywall, discarding a purchase in flight without ever asking the
  // store what happened. This hands the caller the two things it needs to
  // close honestly. Kept in an effect so the caller always reads a committed
  // render, and cleared on unmount so a stale flow can never be abandoned.
  useEffect(() => {
    if (!closeGuard) return undefined;
    closeGuard.current = { pending: flow.pending, abandon: flow.dismiss };
    return () => { closeGuard.current = null; };
  });

  return (
    <View testID="paywallRoot" style={{ height: winH, backgroundColor: c.cream, paddingTop: insets.top }}>
      {/* top bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 4 }}>
        <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close Daily Rituals Plus"
          style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: c.ghostBtn, opacity: pressed ? 0.6 : 1 })}>
          <Close size={18} color={c.ink} />
        </Pressable>
        <Pressable onPress={flow.restore} hitSlop={8} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 5, opacity: pressed ? 0.6 : 1 })}>
          <Restore size={16} color={c.muted} />
          <T w={700} color={c.muted} style={{ fontSize: 14 }}>Restore</T>
        </Pressable>
      </View>

      {/* style={{ flex: 1 }} is load-bearing (IMP-068): without it this ScrollView
          lays out at full content height inside the flex column and the fixed footer
          below is drawn over the plan price and the last perks. */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 26, paddingBottom: 18 + footerH, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
        <View style={{ marginTop: 4 }}><BigSun size={92} /></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, backgroundColor: c.accentSoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
          <Sun size={14} color={c.accentDeep} />
          <T d w={800} color={c.accentDeep} style={{ fontSize: 12.5, letterSpacing: 0.4 }}>Daily Rituals Plus</T>
        </View>
        <T d w={800} color={c.ink} style={{ fontSize: 27, lineHeight: 31, textAlign: 'center', marginTop: 14, marginBottom: 22 }}>
          Give every day a little more room to rest.
        </T>

        {/* perks */}
        <View style={{ width: '100%', gap: 13, marginBottom: 24 }}>
          {PLUS_PERKS.map((perk, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[{ width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accent }, t.shadow(6, c.accentDeep, 0.8)]}>
                <Check size={15} color={c.onAccent} />
              </View>
              <T w={700} color={c.ink} style={{ flex: 1, fontSize: 15, lineHeight: 20 }}>{perk}</T>
            </View>
          ))}
        </View>

        <T w={600} color={c.muted} style={{ fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: -10, marginBottom: 18 }}>
          Your journal lives on your device. Plus adds memory, not storage.
        </T>

        {/* plan selector */}
        <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
          {['annual', 'monthly'].map((k) => {
            const pl = prices[k];
            const sel = plan === k;
            return (
              <Pressable key={k} onPress={() => setPlan(k)}
                style={({ pressed }) => [{ flex: 1, paddingHorizontal: 14, paddingTop: 16, paddingBottom: 14, borderRadius: t.radius.card, backgroundColor: c.surface, borderWidth: 2, borderColor: sel ? c.accent : c.border, transform: [{ scale: pressed ? 0.99 : 1 }] }, sel && !t.dark ? t.shadow(12, c.accentDeep, 0.5) : null]}>
                {pl.save && (
                  <View style={[{ position: 'absolute', top: SAVE_BADGE_TOP, right: 12, backgroundColor: c.accentDeep, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 }, t.shadow(6, c.accentDeep, 0.9)]}>
                    <T d w={800} color={c.onAccent} maxFontSizeMultiplier={CHROME_FONT_SCALE} style={{ fontSize: 10.5, letterSpacing: 0.3 }}>{pl.save.toUpperCase()}</T>
                  </View>
                )}
                <View style={{ position: 'absolute', top: PLAN_TICK_TOP, right: 14, width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: sel ? c.accent : c.border, backgroundColor: sel ? c.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  {sel && <Check size={12} color={c.onAccent} />}
                </View>
                <T d w={700} color={c.muted} style={{ fontSize: 13 }}>{pl.label}</T>
                <T d w={800} color={c.ink} style={{ fontSize: 23, marginTop: 2 }}>{pl.price}</T>
                <T w={700} color={c.muted} style={{ fontSize: 11.5, marginTop: 1 }}>{pl.per}</T>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* footer CTA + legal — outside the flex column (IMP-080). backgroundColor is
          load-bearing now: the ScrollView's content passes underneath this view. */}
      <View
        onLayout={(e) => setFooterH(e.nativeEvent.layout.height)}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 26, paddingTop: 14, paddingBottom: 14 + insets.bottom, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.surface }}>
        {/* IMP-090 — this was the literal "Start 7-day free trial" while Play's
            own sheet said charging today (WALK-19 step 3). The label is now
            derived from the live offer, and ctaLabel never names the day count
            because eligibility is Play's to decide, not ours to promise. */}
        <PrimaryButton label={ctaLabel(prices[plan])} onPress={() => flow.buy(plan)} />
        <LegalFooter platform={platform} plan={plan} prices={prices}
          onLink={(k) => (k === 'restore' ? flow.restore() : onLink && onLink(k))} />
      </View>

      {flow.overlay}
    </View>
  );
}
