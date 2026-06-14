// gamify.js — Duolingo-style mechanics for the RN app, mirrored from
// rituals-gamify.jsx. Solo & gentle: a daily-goal ring, daily "rites" (quests)
// and streak-freeze candles. The Achievements list lives in screens/Achievements.js.

import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from './theme';
import { T } from './ui';
import { Pencil, Heart, BookIcon, Sun, Ring, Check, Candle } from './icons';
import { questsXp, questsGoal } from './data';

const QUEST_ICON = { write: Pencil, feel: Heart, revisit: BookIcon };

// Thin progress bar (rites + achievements).
export function ThinBar({ pct }) {
  const c = useTheme().colors;
  return (
    <View style={{ height: 7, borderRadius: 999, backgroundColor: c.accentSoft, overflow: 'hidden' }}>
      <View style={{ height: '100%', width: Math.max(0, Math.min(100, pct)) + '%', borderRadius: 999, backgroundColor: c.accent }} />
    </View>
  );
}

// Circular daily-goal ring (sun fills as the day's rites are kept).
export function GoalRing({ value, goal, size = 70, stroke = 7, children }) {
  const c = useTheme().colors;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / goal));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cx} r={r} stroke={c.accentSoft} strokeWidth={stroke} fill="none" />
        <Circle cx={cx} cy={cx} r={r} stroke={c.accent} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          transform={`rotate(-90 ${cx} ${cx})`} />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}

// Streak-freeze candles, shown inside the streak hero.
export function StreakFreeze({ count }) {
  const c = useTheme().colors;
  return (
    <View style={{ marginTop: 16, paddingTop: 15, width: '100%', borderTopWidth: 1, borderTopColor: c.border, alignItems: 'center', gap: 6 }}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {[0, 1, 2].map((i) => <Candle key={i} size={19} lit={i < count} body={c.accentSoft} deep={c.accentDeep} />)}
      </View>
      <T w={700} color={c.muted} style={{ fontSize: 12, textAlign: 'center' }}>
        {count} {count === 1 ? 'candle keeps' : 'candles keep'} the flame on a missed day
      </T>
    </View>
  );
}

// Daily rites card (goal ring + three quests + keepsake footer).
export function DailyQuests({ quests }) {
  const t = useTheme();
  const c = t.colors;
  const dx = questsXp(quests);
  const goal = questsGoal(quests);
  const kept = quests.filter((q) => q.cur >= q.goal).length;
  const allDone = kept === quests.length;
  return (
    <View style={[{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: t.radius.card, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14 }, t.dark ? null : t.shadow(14, c.shadowColor, 0.16)]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <GoalRing value={dx} goal={goal}>
          {dx >= goal ? (
            <Check size={24} color={c.accentDeep} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <T d w={800} color={c.ink} style={{ fontSize: 17 }}>{dx}</T>
              <T w={700} color={c.muted} style={{ fontSize: 11 }}>/{goal}</T>
            </View>
          )}
        </GoalRing>
        <View style={{ flex: 1 }}>
          <T d w={700} color={c.ink} style={{ fontSize: 17 }}>Today&rsquo;s rites</T>
          <T w={600} color={c.muted} style={{ fontSize: 12.5, marginTop: 2, lineHeight: 17 }}>Three small acts. They renew at midnight.</T>
        </View>
      </View>

      <View style={{ gap: 11 }}>
        {quests.map((q) => {
          const done = q.cur >= q.goal;
          const Ic = QUEST_ICON[q.icon] || Pencil;
          return (
            <View key={q.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
              <View style={{ width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? c.accent : c.accentSoft }}>
                <Ic size={18} color={done ? c.onAccent : c.accentDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                  <T d w={700} color={done ? c.muted : c.ink} style={{ fontSize: 14.5 }}>{q.label}</T>
                  <T d w={800} color={c.accentDeep} style={{ fontSize: 11.5 }}>+{q.xp} XP</T>
                </View>
                <ThinBar pct={(q.cur / q.goal) * 100} />
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 14, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 14, backgroundColor: c.accentSoft }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: allDone ? c.accent : c.surface }}>
          {allDone ? <Sun size={17} color={c.onAccent} /> : <Ring size={17} color={c.muted} />}
        </View>
        <T w={700} color={allDone ? c.accentDeep : c.muted} style={{ flex: 1, fontSize: 12.5, lineHeight: 17 }}>
          {allDone ? 'All rites kept — a keepsake is yours.' : `${kept} of ${quests.length} kept — finish to earn today\u2019s keepsake.`}
        </T>
      </View>
    </View>
  );
}
