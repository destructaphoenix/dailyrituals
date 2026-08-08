// screens/Shop.js — full-screen Shop, mirrored from ShopScreen in
// rituals-shop.jsx. Candles (utility) · Palettes (re-theme the app live) ·
// Skies · Embers top-ups. Plus-locked items route to the paywall.
// Cosmetics only — achievements stay earned, never bought.

import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { T } from '../ui';
import { Chevron, Ember, Check, Candle, Sun } from '../icons';
import { EmberPill, PlusBanner, SkyPreview, PalTag } from '../shopui';
import { SHOP_PALETTES, SHOP_SKIES, CANDLE_PACKS, EMBER_PACKS } from '../data';

export default function Shop({
  insets, onClose, embers, plus,
  activePalette, ownedPalettes, onApplyPalette, onBuyPalette,
  activeSky, ownedSkies, onApplySky, onBuySky,
  freezes, onBuyCandles, onOpenPaywall, onGetEmbers, onManage, plusEnabled = true,
}) {
  const t = useTheme();
  const c = t.colors;

  const palState = (p) => p.id === activePalette ? 'active'
    : ownedPalettes.includes(p.id) ? 'owned'
    : p.tier === 'plus' ? (plus ? 'owned' : 'plus') : 'buy';
  const skyState = (s) => s.id === activeSky ? 'active'
    : ownedSkies.includes(s.id) ? 'owned'
    : s.tier === 'plus' ? (plus ? 'owned' : 'plus') : 'buy';

  const cardBase = [{ backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border }, t.dark ? null : t.shadow(8, c.shadowColor, 0.08)];

  const Sec = ({ title, right }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
      <T d w={800} color={c.ink} style={{ fontSize: 19 }}>{title}</T>
      {right}
    </View>
  );
  const Note = ({ children }) => (
    <T w={600} color={c.muted} style={{ fontSize: 13, marginBottom: 14, lineHeight: 18 }}>{children}</T>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.cream, paddingTop: insets.top }}>
      {/* top bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 8 }}>
        <Pressable onPress={onClose} hitSlop={8}
          style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: c.ghostBtn, opacity: pressed ? 0.6 : 1 })}>
          <Chevron dir="left" size={22} color={c.ink} />
        </Pressable>
        <T d w={800} color={c.ink} style={{ fontSize: 19 }}>Shop</T>
        <EmberPill embers={embers} onPress={() => onGetEmbers()} lg />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
        {/* Plus upsell / status */}
        {plusEnabled && (
          <View style={{ marginTop: 4 }}>
            <PlusBanner plus={plus} onOpenPaywall={onOpenPaywall} onManage={onManage} />
          </View>
        )}

        {/* Candles */}
        <View style={{ marginTop: 22 }}>
          <Sec title="Candles" right={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Candle size={14} lit body={c.accentSoft} deep={c.accentDeep} />
              <T d w={800} color={c.accentDeep} style={{ fontSize: 13 }}>{freezes} kept</T>
            </View>
          } />
          <Note>Light one on a missed day and your streak holds.{plus ? ' Plus gives you 3 free each month.' : ''}</Note>
          <View style={{ flexDirection: 'row', gap: 11 }}>
            {CANDLE_PACKS.map((p) => {
              const afford = embers >= p.price;
              return (
                <Pressable key={p.id} onPress={() => onBuyCandles(p)} disabled={!afford}
                  style={({ pressed }) => [{ flex: 1, alignItems: 'center', paddingTop: 18, paddingBottom: 12, paddingHorizontal: 6, borderRadius: t.radius.sm, opacity: afford ? 1 : 0.5, transform: [{ scale: pressed ? 0.97 : 1 }] }, ...cardBase]}>
                  {p.tag && <PackTag label={p.tag} c={c} />}
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 }}>
                    <Candle size={26} lit body={c.accentSoft} deep={c.accentDeep} />
                    <T d w={800} color={c.ink} style={{ fontSize: 14, marginLeft: 1 }}>×{p.count}</T>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ember size={14} deep={c.accentDeep} />
                    <T d w={800} color={c.accentDeep} style={{ fontSize: 14 }}>{p.price}</T>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Palettes */}
        <View style={{ marginTop: 26 }}>
          <Sec title="Palettes" />
          <Note>Recolour the whole app. Applies the moment you pick it.</Note>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {SHOP_PALETTES.map((p) => {
              const st = palState(p);
              return (
                <Pressable key={p.id}
                  onPress={() => {
                    if (st === 'active') return;
                    if (st === 'owned') onApplyPalette(p);
                    else if (st === 'plus') { if (plusEnabled) onOpenPaywall(); }
                    else onBuyPalette(p);
                  }}
                  style={({ pressed }) => [{ width: '48%', marginBottom: 12, padding: 12, borderRadius: t.radius.card, transform: [{ scale: pressed ? 0.98 : 1 }] }, { backgroundColor: c.surface, borderWidth: 1.5, borderColor: st === 'active' ? c.accent : c.border }, t.dark ? null : t.shadow(8, c.shadowColor, 0.08)]}>
                  <View style={{ height: 64, borderRadius: 14, overflow: 'hidden', marginBottom: 10 }}>
                    <View style={{ flex: 1, backgroundColor: p.swatch[0] }} />
                    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: '46%', backgroundColor: p.swatch[1], opacity: 0.55 }} />
                    <View style={{ position: 'absolute', right: 9, bottom: 9, width: 26, height: 26, borderRadius: 13, backgroundColor: p.swatch[2], borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)' }} />
                    {st === 'plus' && (
                      <View style={{ position: 'absolute', top: 8, left: 8, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.32)' }}>
                        <Sun size={13} color={c.onAccent} />
                      </View>
                    )}
                    {st === 'active' && (
                      <View style={{ position: 'absolute', top: 8, left: 8, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accentMark }}>
                        <Check size={15} color={c.onAccent} />
                      </View>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 7, flexWrap: 'wrap', marginBottom: 9 }}>
                    <T d w={700} color={c.ink} style={{ fontSize: 15 }}>{p.name}</T>
                    {p.season
                      ? <T d w={800} color={c.accentDeep} style={{ fontSize: 10.5, letterSpacing: 0.4 }}>{p.season.toUpperCase()}</T>
                      : p.note ? <T d w={800} color={c.muted} style={{ fontSize: 10.5, letterSpacing: 0.4 }}>{p.note.toUpperCase()}</T> : null}
                  </View>
                  <PalTag st={st} tier={p.tier} />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Skies */}
        <View style={{ marginTop: 14 }}>
          <Sec title="Skies" />
          <Note>The orb that watches over your streak.</Note>
          <View style={{ gap: 11 }}>
            {SHOP_SKIES.map((s) => {
              const st = skyState(s);
              return (
                <Pressable key={s.id}
                  onPress={() => {
                    if (st === 'active') return;
                    if (st === 'owned') onApplySky(s);
                    else if (st === 'plus') { if (plusEnabled) onOpenPaywall(); }
                    else onBuySky(s);
                  }}
                  style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: t.radius.card, transform: [{ scale: pressed ? 0.99 : 1 }] }, { backgroundColor: c.surface, borderWidth: 1.5, borderColor: st === 'active' ? c.accent : c.border }, t.dark ? null : t.shadow(8, c.shadowColor, 0.08)]}>
                  <SkyPreview kind={s.kind} />
                  <View style={{ flex: 1 }}>
                    <T d w={700} color={c.ink} style={{ fontSize: 15 }}>{s.name}</T>
                    {s.note && <T d w={800} color={c.muted} style={{ fontSize: 10.5, letterSpacing: 0.4, marginTop: 2 }}>{s.note.toUpperCase()}</T>}
                  </View>
                  <PalTag st={st} tier={s.tier} />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Gather embers — cash top-ups; hidden while the app ships free (IMP-034) */}
        {plusEnabled && (
          <View style={{ marginTop: 26 }}>
            <Sec title="Gather Embers" />
            <Note>Embers also gather on their own — one for every day you keep.</Note>
            <View style={{ flexDirection: 'row', gap: 11 }}>
              {EMBER_PACKS.map((p) => (
                <Pressable key={p.id} onPress={() => onGetEmbers(p)}
                  style={({ pressed }) => [{ flex: 1, alignItems: 'center', paddingTop: 16, paddingBottom: 12, paddingHorizontal: 6, borderRadius: t.radius.sm, transform: [{ scale: pressed ? 0.97 : 1 }] }, ...cardBase]}>
                  {p.tag && <PackTag label={p.tag} c={c} soft />}
                  <View style={{ marginBottom: 4 }}><Ember size={26} deep={c.accentDeep} /></View>
                  <T d w={800} color={c.ink} style={{ fontSize: 17 }}>{p.amount}</T>
                  <T d w={800} color={c.accentDeep} style={{ fontSize: 12.5, marginTop: 1 }}>{p.price}</T>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={{ marginTop: 30, paddingTop: 18, borderTopWidth: 1, borderTopColor: c.border }}>
          <T w={700} color={c.muted} style={{ fontSize: 12, textAlign: 'center' }}>Cosmetics only. Achievements stay earned, never bought.</T>
        </View>
      </ScrollView>
    </View>
  );
}

function PackTag({ label, c, soft }) {
  return (
    <View style={{ position: 'absolute', top: -8, alignSelf: 'center', backgroundColor: soft ? c.accentSoft : c.accentDeep, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
      <T d w={800} color={soft ? c.accentDeep : c.onAccent} style={{ fontSize: 9.5, letterSpacing: 0.3 }}>{label.toUpperCase()}</T>
    </View>
  );
}
