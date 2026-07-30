// screens/Paywall.js — the single Plus purchase surface, mirrored from Paywall
// in rituals-shop.jsx. Annual/Monthly toggle (annual 50% off), 7-day trial,
// restore, designed purchase states, and a store-compliant legal footer.
// Reached from locked cosmetics, the You banner, onboarding, and Export.

import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { T, PrimaryButton } from '../ui';
import { Close, Check, Sun, Restore } from '../icons';
import { BigSun } from '../art';
import { PLUS_PERKS } from '../data';
import { useLivePrices } from '../billing/useLivePrices';
import { LegalFooter, usePurchaseFlow } from './PlusFlow';

export default function Paywall({ insets, platform = 'ios', service, alreadyPlus, onClose, onSubscribe, onLink }) {
  const t = useTheme();
  const c = t.colors;
  const [plan, setPlan] = useState('annual');
  // The store's localized prices, falling back to the design constants. Never
  // render PLUS_PRICES directly here — Google charges the store price, not ours.
  const prices = useLivePrices(service);
  const flow = usePurchaseFlow({
    service,
    platform,
    onComplete: (entitlement) => onSubscribe(plan, entitlement),
  });

  return (
    <View style={{ flex: 1, backgroundColor: c.cream, paddingTop: insets.top }}>
      {/* top bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 4 }}>
        <Pressable onPress={onClose} hitSlop={8}
          style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: c.ghostBtn, opacity: pressed ? 0.6 : 1 })}>
          <Close size={18} color={c.ink} />
        </Pressable>
        <Pressable onPress={flow.restore} hitSlop={8} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 5, opacity: pressed ? 0.6 : 1 })}>
          <Restore size={16} color={c.muted} />
          <T w={700} color={c.muted} style={{ fontSize: 14 }}>Restore</T>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 26, paddingBottom: 18, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
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

        {/* plan selector */}
        <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
          {['annual', 'monthly'].map((k) => {
            const pl = prices[k];
            const sel = plan === k;
            return (
              <Pressable key={k} onPress={() => setPlan(k)}
                style={({ pressed }) => [{ flex: 1, paddingHorizontal: 14, paddingTop: 16, paddingBottom: 14, borderRadius: t.radius.card, backgroundColor: c.surface, borderWidth: 2, borderColor: sel ? c.accent : c.border, transform: [{ scale: pressed ? 0.99 : 1 }] }, sel && !t.dark ? t.shadow(12, c.accentDeep, 0.5) : null]}>
                {pl.save && (
                  <View style={[{ position: 'absolute', top: -10, right: 12, backgroundColor: c.accentDeep, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 }, t.shadow(6, c.accentDeep, 0.9)]}>
                    <T d w={800} color={c.onAccent} style={{ fontSize: 10.5, letterSpacing: 0.3 }}>{pl.save.toUpperCase()}</T>
                  </View>
                )}
                <View style={{ position: 'absolute', top: 14, right: 14, width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: sel ? c.accent : c.border, backgroundColor: sel ? c.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
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

      {/* footer CTA + legal */}
      <View style={{ paddingHorizontal: 26, paddingTop: 14, paddingBottom: 14 + insets.bottom, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.surface }}>
        <PrimaryButton label="Start 7-day free trial" onPress={() => flow.buy(plan)} />
        <LegalFooter platform={platform} plan={plan} prices={prices}
          onLink={(k) => (k === 'restore' ? flow.restore() : onLink && onLink(k))} />
      </View>

      {flow.overlay}
    </View>
  );
}
