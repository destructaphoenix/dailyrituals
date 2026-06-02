// Celebration.js — full-screen reward moment. Ported from Celebration.
// The CSS .ra-pop keyframe (scale 0 → 1.12 → 1) becomes an Animated spring.

import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { useTheme } from '../theme';
import { T, PrimaryButton } from '../ui';
import { Sun, Moon, Diamond, Ember } from '../icons';
import { BigSun, BigMoon, Confetti } from '../art';

export default function Celebration({ copy, mode, streak, xpGain, embersGain, milestone, onDone }) {
  const t = useTheme();
  const c = t.colors;
  const Orb = mode === 'night' ? Moon : Sun;

  const pop = useRef(new Animated.Value(0)).current;
  const reward = useRef(new Animated.Value(0)).current;
  const chip = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(pop, { toValue: 1, useNativeDriver: true, friction: 5, tension: 80 }),
      Animated.stagger(150, [
        Animated.spring(reward, { toValue: 1, useNativeDriver: true, friction: 6 }),
        Animated.spring(chip, { toValue: 1, useNativeDriver: true, friction: 6 }),
      ]),
    ]).start();
  }, [pop, reward, chip]);

  const popStyle = {
    opacity: pop,
    transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }],
  };
  const fade = (v) => ({ opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] });

  return (
    <View style={{ flex: 1, backgroundColor: c.cream, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, overflow: 'hidden' }}>
      <Confetti />

      <Animated.View style={popStyle}>
        {mode === 'night' ? <BigMoon size={132} /> : <BigSun size={132} />}
      </Animated.View>

      {milestone ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: c.accentSoft }}>
          <Diamond size={13} color={c.accentDeep} />
          <T d w={800} color={c.accentDeep} style={{ fontSize: 12.5, letterSpacing: 0.5, textTransform: 'uppercase' }}>{milestone} unlocked</T>
        </View>
      ) : null}

      <T d w={800} color={c.ink} style={{ fontSize: 30, marginTop: milestone ? 14 : 22, marginBottom: 6, textAlign: 'center' }}>
        {milestone ? `${streak} days. ${milestone}.` : copy.celebrateTitle}
      </T>
      <T w={600} color={c.muted} style={{ fontSize: 16, textAlign: 'center', maxWidth: 280, lineHeight: 22 }}>
        {milestone ? 'A rare one — most days slip by unmarked. Not yours.' : copy.celebrateBody}
      </T>

      <Animated.View style={[fade(reward), { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 22, marginBottom: 4, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: c.accentSoft }]}>
        <T d w={800} color={c.accentDeep} style={{ fontSize: 18 }}>+{xpGain} XP</T>
      </Animated.View>

      <Animated.View style={[fade(chip), { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Orb size={18} color={c.accentDeep} />
          <T w={800} color={c.ink} style={{ fontSize: 15 }}>{streak} day streak</T>
        </View>
        {embersGain ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: c.accentSoft, paddingHorizontal: 13, paddingVertical: 6, borderRadius: 999 }}>
            <Ember size={16} deep={c.accentDeep} />
            <T d w={800} color={c.accentDeep} style={{ fontSize: 15 }}>+{embersGain} Embers</T>
          </View>
        ) : null}
      </Animated.View>

      <View style={{ marginTop: 30, width: '100%', maxWidth: 300 }}>
        <PrimaryButton label="Done" onPress={onDone} />
      </View>
    </View>
  );
}
