// screens/Onboarding.js — first-run / signup flow, mirrored from
// rituals-onboarding.jsx. Step machine: intro → signup → personalize →
// premium → (onDone hands off to the live app). The welcome is a swipe-card
// carousel (real horizontal paging). Playful, obituary-wink voice.

import React, { useState, useRef } from 'react';
import { View, ScrollView, Pressable, TextInput, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext, makeTheme } from '../theme';
import { T, PrimaryButton } from '../ui';
import { Pencil, Check, Chevron, Sun } from '../icons';
import { BigSun, BigMoon } from '../art';
import { PLUS_PERKS } from '../data';
import Paywall from './Paywall';
import { createPurchaseService } from '../billing';
import { PLUS_ENABLED } from '../billing/config';

const INTRO = [
  { motif: 'sun',    h: 'Every day deserves\na send-off.', b: "Daily Rituals is two honest questions and a quiet goodbye — about a minute, once a day." },
  { motif: 'pencil', h: "Write the day's\nobituary.",       b: "What did you do? What do you wish you'd done? That's the whole eulogy. No filter required." },
  { motif: 'moon',   h: "A graveyard you're\nproud of.",    b: "Days laid to rest, a streak that climbs, and a moon that watches you keep showing up." },
];

const TIMES = ['8:30 PM', '10:00 PM', '11:30 PM', 'Next morning'];
// Matched to the real paywall's perk copy (first three) so the onboarding
// intro and the in-app paywall never drift.
const PERKS = PLUS_PERKS.slice(0, 3);

const OB_PLATFORM = Platform.OS === 'android' ? 'android' : 'ios';

// ── Entry: provides a Day-mode theme + safe area, runs the step machine ──────
// onDone(plus) — `plus` is true when the user subscribed during onboarding.
export default function Onboarding({ settings, onDone }) {
  const theme = makeTheme('day', settings);
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState('intro');
  const [payOpen, setPayOpen] = useState(false);
  const service = createPurchaseService({
    sim: { purchase: settings.storePurchase || 'success', restore: settings.storeRestore || 'empty' },
    alreadyPlus: false,
    platform: OB_PLATFORM,
  });

  return (
    <ThemeContext.Provider value={theme}>
      <View style={{ flex: 1, backgroundColor: theme.colors.cream, paddingTop: insets.top }}>
        {step === 'intro' && <IntroSwipe onDone={() => setStep('signup')} onSkip={() => setStep('signup')} insets={insets} />}
        {step === 'signup' && <SignUp onAuthed={() => setStep('personalize')} onBack={() => setStep('intro')} insets={insets} />}
        {step === 'personalize' && <Personalize onDone={PLUS_ENABLED ? () => setStep('premium') : () => onDone(false)} onBack={() => setStep('signup')} insets={insets} />}
        {PLUS_ENABLED && step === 'premium' && <Premium onOpenPaywall={() => setPayOpen(true)} onSkip={() => onDone(false)} onBack={() => setStep('personalize')} insets={insets} />}

        {PLUS_ENABLED && payOpen && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20, backgroundColor: theme.colors.cream }}>
            <Paywall insets={insets} platform={OB_PLATFORM} service={service}
              onClose={() => setPayOpen(false)}
              onSubscribe={() => { setPayOpen(false); onDone(true); }}
              onLink={() => {}} />
          </View>
        )}
      </View>
    </ThemeContext.Provider>
  );
}

// ── Shared chrome ────────────────────────────────────────────────────────────
function TopChrome({ left, right }) {
  return (
    <View style={{ minHeight: 38, paddingHorizontal: 12, paddingTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      {left || <View style={{ width: 64 }} />}
      {right || <View style={{ width: 64 }} />}
    </View>
  );
}
function SkipBtn({ onPress }) {
  const t = React.useContext(ThemeContext);
  return (
    <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => ({ paddingHorizontal: 12, paddingVertical: 8, opacity: pressed ? 0.6 : 1 })}>
      <T w={700} color={t.colors.muted} style={{ fontSize: 14 }}>Skip</T>
    </Pressable>
  );
}
function BackBtn({ onPress, label }) {
  const t = React.useContext(ThemeContext);
  return (
    <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, opacity: pressed ? 0.6 : 1 })}>
      <Chevron dir="left" size={20} color={t.colors.muted} />
      {label ? <T w={700} color={t.colors.muted} style={{ fontSize: 14 }}>{label}</T> : null}
    </Pressable>
  );
}

// Circular ← / → arrow floated at the vertical midpoint of the screen, on the
// left/right edge — sits in the natural thumb arc instead of a far corner.
function ArrowBtn({ dir, onPress, disabled, side }) {
  const t = React.useContext(ThemeContext);
  return (
    <Pressable onPress={disabled ? undefined : onPress} hitSlop={10} style={({ pressed }) => ([
      {
        position: 'absolute', top: '50%', marginTop: -25, zIndex: 6,
        [side]: 14,
        width: 50, height: 50, borderRadius: 999,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1.5, borderColor: t.colors.border, backgroundColor: t.colors.surface,
        opacity: disabled ? 0 : 1,
        transform: [{ scale: pressed && !disabled ? 0.9 : 1 }],
      },
      !disabled && t.shadow(10, '#292524', 0.22),
    ])}>
      <Chevron dir={dir} size={22} color={t.colors.ink} />
    </Pressable>
  );
}

function Motif({ kind, size = 150 }) {
  const t = React.useContext(ThemeContext);
  const glow = { position: 'absolute', width: 270, height: 270, borderRadius: 135, backgroundColor: 'rgba(245,158,11,0.10)' };
  let inner;
  if (kind === 'sun') inner = <BigSun size={size} />;
  else if (kind === 'moon') inner = <BigMoon size={size} />;
  else inner = (
    <View style={[{ width: 130, height: 130, borderRadius: 65, backgroundColor: '#f6b73a', alignItems: 'center', justifyContent: 'center' }, t.shadow(20, t.colors.accentDeep, 0.55)]}>
      <Pencil size={62} color="#7c2d12" />
    </View>
  );
  return (
    <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <View style={glow} />
      {inner}
    </View>
  );
}

// ── Variant A — swipe cards (real horizontal paging) ─────────────────────────
function IntroSwipe({ onDone, onSkip, insets }) {
  const t = React.useContext(ThemeContext);
  const [w, setW] = useState(Dimensions.get('window').width);
  const [page, setPage] = useState(0);
  const ref = useRef(null);
  const last = page === INTRO.length - 1;

  const go = (p) => { ref.current?.scrollTo({ x: p * w, animated: true }); setPage(p); };
  const next = () => (last ? onDone() : go(page + 1));
  const prev = () => go(Math.max(0, page - 1));
  const fwd = () => go(Math.min(INTRO.length - 1, page + 1));

  return (
    <View style={{ flex: 1 }}>
      <ArrowBtn dir="left" onPress={prev} disabled={page === 0} side="left" />
      <ArrowBtn dir="right" onPress={fwd} disabled={last} side="right" />
      <TopChrome right={<SkipBtn onPress={onSkip} />} />
      <View style={{ flex: 1 }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        <ScrollView
          ref={ref}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / w))}
        >
          {INTRO.map((s, k) => (
            <View key={k} style={{ width: w, flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 30, paddingBottom: 4 }}>
              <Motif kind={s.motif} />
              <T d w={800} color={t.colors.ink} style={{ fontSize: 28, lineHeight: 31, textAlign: 'center' }}>{s.h}</T>
              <T w={600} color={t.colors.muted} style={{ fontSize: 15.5, lineHeight: 23, textAlign: 'center', marginTop: 12 }}>{s.b}</T>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 22 }}>
                {INTRO.map((_, d) => (
                  <Pressable key={d} onPress={() => go(d)} hitSlop={8}>
                    <View style={{ width: d === page ? 26 : 8, height: 8, borderRadius: 999, backgroundColor: d === page ? t.colors.accent : t.colors.border }} />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 + insets.bottom }}>
        <PrimaryButton label={last ? 'Get started' : 'Next'} onPress={next}
          icon={last ? <Pencil size={19} color="#fff" /> : null} />
      </View>
    </View>
  );
}

// ── Sign up ──────────────────────────────────────────────────────────────────
function AuthButton({ kind, label, onPress }) {
  const t = React.useContext(ThemeContext);
  const styleByKind = {
    apple: { bg: '#1a1714', fg: '#fff', border: 'transparent', markBg: 'rgba(255,255,255,0.14)', markFg: '#fff', mark: '' },
    google: { bg: t.colors.surface, fg: t.colors.ink, border: t.colors.border, markBg: t.colors.accentSoft, markFg: t.colors.accentDeep, mark: 'G' },
    email: { bg: t.colors.accentSoft, fg: t.colors.accentDeep, border: 'transparent', markBg: 'rgba(217,119,6,0.16)', markFg: t.colors.accentDeep, mark: '@' },
  }[kind];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({
      width: '100%', paddingVertical: 15, paddingHorizontal: 20, borderRadius: t.radius.btn,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
      backgroundColor: styleByKind.bg, borderWidth: 1.5, borderColor: styleByKind.border,
      transform: [{ scale: pressed ? 0.99 : 1 }],
    })}>
      {styleByKind.mark ? (
        <View style={{ width: 20, height: 20, borderRadius: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: styleByKind.markBg }}>
          <T d w={800} color={styleByKind.markFg} style={{ fontSize: 13 }}>{styleByKind.mark}</T>
        </View>
      ) : null}
      <T d w={700} color={styleByKind.fg} style={{ fontSize: 16 }}>{label}</T>
    </Pressable>
  );
}

function SignUp({ onAuthed, onBack, insets }) {
  const t = React.useContext(ThemeContext);
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState('');
  const emailValid = /\S+@\S+\.\S+/.test(email);
  return (
    <View style={{ flex: 1 }}>
      <TopChrome left={<BackBtn onPress={onBack} label="Back" />} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 14, paddingBottom: 18 + insets.bottom }} keyboardShouldPersistTaps="handled">
        <T d w={800} color={t.colors.ink} style={{ fontSize: 30, lineHeight: 33 }}>Make it yours.</T>
        <T w={600} color={t.colors.muted} style={{ fontSize: 15.5, lineHeight: 23, marginTop: 9 }}>
          Your graveyard, your rules. Sign in so your days follow you everywhere — and never anywhere else.
        </T>

        {!emailOpen ? (
          <View style={{ gap: 12, marginTop: 30 }}>
            <AuthButton kind="apple" label="Continue with Apple" onPress={onAuthed} />
            <AuthButton kind="google" label="Continue with Google" onPress={onAuthed} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 6 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
              <T w={700} color={t.colors.muted} style={{ fontSize: 12 }}>OR</T>
              <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
            </View>
            <AuthButton kind="email" label="Continue with email" onPress={() => setEmailOpen(true)} />
          </View>
        ) : (
          <View style={{ marginTop: 28 }}>
            <T d w={700} color={t.colors.accentDeep} style={{ fontSize: 14, marginBottom: 9 }}>Your email</T>
            <TextInput
              style={{ width: '100%', paddingVertical: 15, paddingHorizontal: 16, borderRadius: t.radius.btn, borderWidth: 1.5, borderColor: t.colors.border, backgroundColor: t.colors.surface, fontFamily: t.body(400), fontSize: 16, color: t.colors.ink }}
              placeholder="you@somewhere.com" placeholderTextColor="#c3bcb0"
              keyboardType="email-address" autoCapitalize="none" autoComplete="email"
              value={email} onChangeText={setEmail}
            />
            <View style={{ marginTop: 22 }}>
              <PrimaryButton label="Continue" disabled={!emailValid} onPress={onAuthed} />
            </View>
            <Pressable onPress={() => setEmailOpen(false)} style={{ marginTop: 14, alignItems: 'center' }}>
              <T d w={700} color={t.colors.accentDeep} style={{ fontSize: 15 }}>Other options</T>
            </Pressable>
          </View>
        )}

        <T w={600} color={t.colors.muted} style={{ fontSize: 12.5, lineHeight: 19, marginTop: 18, textAlign: 'center' }}>
          We'll never post anything. <T w={800} color={t.colors.ink} style={{ fontSize: 12.5 }}>Your reflections stay yours.</T>
        </T>
      </ScrollView>
    </View>
  );
}

// ── Personalize ──────────────────────────────────────────────────────────────
function Personalize({ onDone, onBack, insets }) {
  const t = React.useContext(ThemeContext);
  const [name, setName] = useState('');
  const [time, setTime] = useState(TIMES[0]);
  return (
    <View style={{ flex: 1 }}>
      <TopChrome left={<BackBtn onPress={onBack} label="Back" />} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 14, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <T d w={800} color={t.colors.ink} style={{ fontSize: 30, lineHeight: 33 }}>Before we dig in.</T>
        <T w={600} color={t.colors.muted} style={{ fontSize: 15.5, lineHeight: 23, marginTop: 9 }}>Two quick things, then today's grave is all yours.</T>

        <View style={{ marginTop: 28 }}>
          <T d w={700} color={t.colors.accentDeep} style={{ fontSize: 14, marginBottom: 9 }}>What should we call you?</T>
          <TextInput
            style={{ width: '100%', paddingVertical: 15, paddingHorizontal: 16, borderRadius: t.radius.btn, borderWidth: 1.5, borderColor: t.colors.border, backgroundColor: t.colors.surface, fontFamily: t.body(400), fontSize: 16, color: t.colors.ink }}
            placeholder="Your name" placeholderTextColor="#c3bcb0" value={name} onChangeText={setName}
          />
        </View>
        <View style={{ marginTop: 22 }}>
          <T d w={700} color={t.colors.accentDeep} style={{ fontSize: 14, marginBottom: 9 }}>When should we nudge you to lay the day to rest?</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {TIMES.map((tm) => {
              const sel = time === tm;
              return (
                <Pressable key={tm} onPress={() => setTime(tm)} style={[
                  { paddingVertical: 11, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1.5, borderColor: sel ? t.colors.accent : t.colors.border, backgroundColor: sel ? t.colors.accent : t.colors.surface },
                  sel && t.shadow(8, t.colors.accentDeep, 0.5),
                ]}>
                  <T w={700} color={sel ? '#fff' : t.colors.ink} style={{ fontSize: 15 }}>{tm}</T>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 + insets.bottom }}>
        <PrimaryButton label="Looks good" onPress={onDone} />
      </View>
    </View>
  );
}

// ── Premium (soft intro — routes into the real paywall) ──────────────────────
// Teaser only; the plan selector, trial terms, purchase states and legal copy
// all live in one place (Paywall), reached from "See Plus".
function Premium({ onOpenPaywall, onSkip, onBack, insets }) {
  const t = React.useContext(ThemeContext);
  return (
    <View style={{ flex: 1 }}>
      <TopChrome left={<BackBtn onPress={onBack} label="Back" />} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 14, flexGrow: 1 }}>
        <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 6, paddingHorizontal: 13, borderRadius: 999, backgroundColor: t.colors.accentSoft }}>
          <Sun size={14} color={t.colors.accentDeep} />
          <T d w={800} color={t.colors.accentDeep} style={{ fontSize: 13 }}>Daily Rituals Plus</T>
        </View>
        <T d w={800} color={t.colors.ink} style={{ fontSize: 30, lineHeight: 33, marginTop: 16 }}>For the devoted grave-keeper.</T>
        <T w={600} color={t.colors.muted} style={{ fontSize: 15.5, lineHeight: 23, marginTop: 9 }}>
          Everything in Daily Rituals is free. Plus just gives your days a little more room to rest — start with 7 days free.
        </T>
        <View style={{ gap: 15, marginTop: 24 }}>
          {PERKS.map((p, k) => (
            <View key={k} style={{ flexDirection: 'row', gap: 13, alignItems: 'flex-start' }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: t.colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                <Check size={17} color={t.colors.accentDeep} />
              </View>
              <T w={700} color={t.colors.ink} style={{ flex: 1, fontSize: 15.5, lineHeight: 21 }}>{p}</T>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 + insets.bottom, gap: 10 }}>
        <PrimaryButton label="See Plus & start free trial" onPress={onOpenPaywall} />
        <Pressable onPress={onSkip} style={({ pressed }) => ({ paddingVertical: 14, alignItems: 'center', opacity: pressed ? 0.6 : 1 })}>
          <T d w={700} color={t.colors.accentDeep} style={{ fontSize: 16 }}>Maybe later</T>
        </Pressable>
      </View>
    </View>
  );
}
