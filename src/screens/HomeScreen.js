// HomeScreen.js — streak hub. Ported from HomeScreen in rituals-screens.jsx.

import React from 'react';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { useTheme, DARK_THEME } from '../theme';
import { T, Card, PrimaryButton, ProgressBar } from '../ui';
import { Sun, Moon, Check, Pencil, BADGE_ICON } from '../icons';
import { RayFan, NightSky, NightRays } from '../art';
import { greetingFor, todayLabel } from '../time/clock';
import { pickForDay } from '../time/dailyPick';
import { HELLOS } from '../content/greetings';
import { streakSubtitle } from '../home/streakCopy';
import { buildWeekStrip } from '../home/calendar';
import { deriveKeepsakes } from '../profile/achievements';
import { StreakFreeze, DailyQuests } from '../gamify';
import { EmberPill } from '../shopui';

export default function HomeScreen({ copy, mode, streak, level, levelName, xpInto, xpToNext, entries, quests, freezes, onOpenAchievements, done, onWrite, onToggleMode, embers, plus, onOpenShop, dailyPrompt = '', userName = '' }) {
  const t = useTheme();
  const c = t.colors;
  const Orb = mode === 'night' ? Moon : Sun;
  const hello = pickForDay(HELLOS);
  const week = buildWeekStrip(entries || []);
  const keepsakes = deriveKeepsakes(entries || [], streak || 0);
  const streakShadow = { textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 10 };
  const isNightV2 = t.dark && DARK_THEME === 'v2';
  const numberGlow = isNightV2 ? { textShadowColor: c.accent + '8C', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16 } : {};

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 4, paddingBottom: 26, gap: 14 }}
      showsVerticalScrollIndicator={false}
    >
      {/* header: date left · icons right · greeting below */}
      <View style={{ paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <T w={600} color={c.muted} style={{ fontSize: 14, flex: 1 }}>{todayLabel()}</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <EmberPill embers={embers} plus={plus} onPress={onOpenShop} />
            <Pressable
              onPress={onToggleMode}
              accessibilityLabel={mode === 'night' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={({ pressed }) => [{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.92 : 1 }] }]}
            >
              <Orb size={20} color={c.accentDeep} />
            </Pressable>
          </View>
        </View>
        <T d w={700} color={c.ink} numberOfLines={3} style={{ fontSize: 27, lineHeight: 32, marginTop: 2 }}>{userName ? `${hello}, ${userName}.` : `${hello}.`}</T>
      </View>

      {/* streak hero */}
      <View style={{ paddingHorizontal: 20 }}>
        <Card style={{ paddingHorizontal: 22, paddingTop: 26, paddingBottom: 22, alignItems: 'center', overflow: 'hidden' }}>
          {mode === 'night' ? (DARK_THEME === 'v2' ? <NightRays /> : <NightSky />) : <RayFan />}
          <View style={{ zIndex: 1, alignItems: 'center', marginTop: 13 }}>
            <T d w={800} color={c.accentDeep} style={[{ fontSize: 76, lineHeight: 82, includeFontPadding: false, textAlign: 'center' }, numberGlow]}>{streak}</T>
            <T d w={700} color={c.ink} style={[{ fontSize: 16, marginTop: 2 }, t.dark && streakShadow]}>day streak</T>
            <T w={600} color={c.dimText} style={[{ fontSize: 13, marginTop: 4 }, t.dark && streakShadow]}>{streakSubtitle(streak)}</T>
          </View>
          <View style={{ zIndex: 1, width: '100%', marginTop: 22 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 7 }}>
              <T d w={700} color={c.ink} numberOfLines={1} style={{ fontSize: 14, flexShrink: 1 }}>Lv {level} · {levelName}</T>
              <T w={700} color={c.muted} style={{ fontSize: 12 }}>{xpToNext == null ? 'Max' : `${xpInto} / ${xpToNext} XP`}</T>
            </View>
            <ProgressBar value={xpToNext == null ? 100 : Math.min(100, (xpInto / xpToNext) * 100)} />
          </View>
          {freezes != null && <StreakFreeze count={freezes} />}
        </Card>
      </View>

      {/* today's ritual CTA */}
      <View style={{ paddingHorizontal: 20 }}>
        {!done ? (
          <Card style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 22 }}>
            <T w={700} color={c.muted} style={{ fontSize: 12, letterSpacing: 1.7, textTransform: 'uppercase', marginBottom: 12 }}>
              Today's reflection
            </T>
            <T d w={600} color={c.ink} style={{ fontSize: 19, lineHeight: 25 }}>
              {dailyPrompt || copy.teaser.join('')}
            </T>
            <PrimaryButton
              label={copy.cta}
              onPress={onWrite}
              icon={<Pencil size={20} color={c.onAccent} />}
              style={{ marginTop: 20 }}
            />
          </Card>
        ) : (
          <Card style={{ padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: c.greenSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Check size={26} color={c.green} />
            </View>
            <View style={{ flex: 1 }}>
              <T d w={600} color={c.ink} style={{ fontSize: 17, lineHeight: 22 }}>Today is at rest.</T>
              <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 2 }}>You can revisit it anytime in Reflections.</T>
            </View>
          </Card>
        )}
      </View>

      {/* daily rites (quests) + goal ring */}
      {quests && (
        <View style={{ paddingHorizontal: 20 }}>
          <DailyQuests quests={quests} />
        </View>
      )}

      {/* week strip */}
      <View style={{ paddingHorizontal: 20 }}>
        <Card style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {week.map((d, i) => {
              const isDone = d.state === 'done' || (d.state === 'today' && done);
              return (
                <View key={i} style={{ flex: 1, alignItems: 'center', gap: 7 }}>
                  <T w={800} color={c.muted} style={{ fontSize: 11 }}>{d.l}</T>
                  <Dot state={d.state} done={done} mode={mode}>
                    {isDone && <Check size={18} color={c.onAccent} />}
                    {d.state === 'today' && !done && <Orb size={17} color={c.accentDeep} />}
                  </Dot>
                </View>
              );
            })}
          </View>
        </Card>
      </View>

      {/* badges */}
      <View style={{ paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <T d w={700} color={c.ink} style={{ fontSize: 17 }}>Keepsakes</T>
          <Pressable onPress={onOpenAchievements} hitSlop={8}>
            <T w={700} color={c.accentDeep} style={{ fontSize: 13 }}>All</T>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 2 }}>
          {keepsakes.map((b) => {
            const Ic = BADGE_ICON[b.icon];
            return (
              <Pressable key={b.id} onPress={onOpenAchievements} style={{ width: 72, alignItems: 'center', gap: 6 }}>
                <Medal earned={b.earned} mode={mode}>
                  <Ic size={24} color={b.earned ? c.onAccent : c.placeholder} />
                </Medal>
                <T w={700} color={c.muted} style={{ fontSize: 10.5, textAlign: 'center', lineHeight: 12 }}>{b.label}</T>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

function Dot({ state, done, mode, children }) {
  const t = useTheme();
  const c = t.colors;
  let bg = c.dot, borderColor = 'transparent', borderStyle = 'solid';
  let extra = {};
  if (state === 'done' || (state === 'today' && done)) {
    bg = c.accent;
    extra = t.shadow(8, c.accentDeep, 0.8);
  } else if (state === 'today') {
    bg = c.surface; borderColor = c.accent;
  } else if (state === 'future') {
    bg = 'transparent'; borderColor = c.border; borderStyle = 'dashed';
  }
  return (
    <View style={[{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: bg, borderWidth: 1.5, borderColor, borderStyle }, extra]}>
      {state === 'missed' && <Text style={{ fontSize: 16 }}>💀</Text>}
      {children}
    </View>
  );
}

function Medal({ earned, mode, children }) {
  const t = useTheme();
  const c = t.colors;
  if (earned) {
    return (
      <View style={[{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: c.accent, borderWidth: 1.5, borderColor: c.accentDeep }, t.shadow(10, c.accentDeep, 0.8)]}>
        {children}
      </View>
    );
  }
  return (
    <View style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: c.dot, borderWidth: 1.5, borderColor: c.border }}>
      {children}
    </View>
  );
}
