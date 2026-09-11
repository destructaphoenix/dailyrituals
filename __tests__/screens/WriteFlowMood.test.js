import React from 'react';
import fs from 'fs';
import path from 'path';
import { ScrollView } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import WriteFlow from '../../src/screens/WriteFlow';
import { MOOD_PALETTE, CUSTOM_MOOD_FALLBACK } from '../../src/data';

const copy = {
  q1: 'q1', q1help: 'h1', q2: 'q2', q2help: 'h2',
  moodQ: 'moodQ', moodHelp: 'moodHelp', epitaph: 'Here lies', finish: 'Finish',
};
const insets = { top: 0, bottom: 0 };

function renderOnMoodStep(props = {}) {
  const view = render(
    <WriteFlow
      copy={copy}
      insets={insets}
      onClose={() => {}}
      onComplete={() => {}}
      onAddCustomMood={() => {}}
      {...props}
    />
  );
  // Two words in did/wished so Next is enabled at each step.
  fireEvent.changeText(view.getByPlaceholderText('Start anywhere…'), 'two words');
  fireEvent.press(view.getByText('Next'));
  fireEvent.changeText(view.getByPlaceholderText('Be honest, be kind…'), 'more words');
  fireEvent.press(view.getByText('Next'));
  return view;
}

describe('WriteFlow — custom mood emoji picker', () => {
  test('tapping a palette emoji changes the selection', () => {
    const onAddCustomMood = jest.fn();
    const view = renderOnMoodStep({ onAddCustomMood });
    const second = MOOD_PALETTE[1];
    fireEvent.press(view.getByLabelText(`Choose ${second} for your custom mood`));
    fireEvent.changeText(view.getByPlaceholderText('Name your own…'), 'Sleepy');
    fireEvent.press(view.getByText('Add'));
    expect(onAddCustomMood).toHaveBeenCalledWith('Sleepy', second);
  });

  test('typing a valid emoji selects it, and Add fires with that emoji', () => {
    const onAddCustomMood = jest.fn();
    const view = renderOnMoodStep({ onAddCustomMood });
    fireEvent.changeText(view.getByTestId('customMoodEmojiInput'), '🌵');
    fireEvent.changeText(view.getByPlaceholderText('Name your own…'), 'Prickly');
    fireEvent.press(view.getByText('Add'));
    expect(onAddCustomMood).toHaveBeenCalledWith('Prickly', '🌵');
  });

  test('typing a second emoji after the first replaces it, not just re-picks the first', () => {
    // Simulates the real native buffer: onChangeText's v is the old value plus
    // whatever was just typed, not just the new keystroke.
    const view = renderOnMoodStep();
    const field = view.getByTestId('customMoodEmojiInput');
    fireEvent.changeText(field, '🌵');
    expect(field.props.value).toBe('🌵');
    fireEvent.changeText(field, '🌵😀');
    expect(field.props.value).toBe('😀');
  });

  test('typing non-emoji text does not change the selection — the previous pick stands', () => {
    const onAddCustomMood = jest.fn();
    const view = renderOnMoodStep({ onAddCustomMood });
    fireEvent.changeText(view.getByTestId('customMoodEmojiInput'), 'abc');
    fireEvent.changeText(view.getByPlaceholderText('Name your own…'), 'Grumpy');
    fireEvent.press(view.getByText('Add'));
    expect(onAddCustomMood).toHaveBeenCalledWith('Grumpy', MOOD_PALETTE[0]);
  });

  test('typing "🌵🌵🌵" leaves only "🌵" in the field, and Add fires with it', () => {
    const onAddCustomMood = jest.fn();
    const view = renderOnMoodStep({ onAddCustomMood });
    fireEvent.changeText(view.getByTestId('customMoodEmojiInput'), '🌵🌵🌵');
    expect(view.getByTestId('customMoodEmojiInput').props.value).toBe('🌵');
    fireEvent.changeText(view.getByPlaceholderText('Name your own…'), 'Prickly');
    fireEvent.press(view.getByText('Add'));
    expect(onAddCustomMood).toHaveBeenCalledWith('Prickly', '🌵');
  });

  test('the block subtitle says what it makes', () => {
    const view = renderOnMoodStep();
    expect(view.getByText('Make a feeling of your own: one emoji for its face, then what you call it.')).toBeTruthy();
  });

  test('Add with a name and no explicit emoji choice fires with MOOD_PALETTE[0]', () => {
    const onAddCustomMood = jest.fn();
    const view = renderOnMoodStep({ onAddCustomMood });
    fireEvent.changeText(view.getByPlaceholderText('Name your own…'), 'Wistful');
    fireEvent.press(view.getByText('Add'));
    expect(onAddCustomMood).toHaveBeenCalledWith('Wistful', MOOD_PALETTE[0]);
  });

  test('the newly-added chip renders its chosen emoji, not the CUSTOM_MOOD_FALLBACK glyph', () => {
    const view = renderOnMoodStep({ customMoods: ['Prickly'], customMoodEmoji: { Prickly: '🌵' } });
    expect(view.queryAllByText('🌵').length).toBeGreaterThan(0);
    expect(view.queryAllByText(CUSTOM_MOOD_FALLBACK).length).toBe(0);
  });
});

describe('WriteFlow — mandatory mood gate (regression)', () => {
  test('Finish is disabled with zero moods selected', () => {
    const onComplete = jest.fn();
    const view = renderOnMoodStep({ onComplete });
    fireEvent.press(view.getByText('Finish'));
    expect(onComplete).not.toHaveBeenCalled();
  });

  test('Finish is enabled once one mood is selected', () => {
    const onComplete = jest.fn();
    const view = renderOnMoodStep({ onComplete });
    fireEvent.press(view.getByText('Grateful'));
    fireEvent.press(view.getByText('Finish'));
    expect(onComplete).toHaveBeenCalledWith({ did: 'two words', wished: 'more words', moods: ['Grateful'] });
  });
});

describe('WriteFlow — the mood step stops fighting you (IMP-066)', () => {
  test('tapping a selected chip deselects it', () => {
    const onComplete = jest.fn();
    const view = renderOnMoodStep({ onComplete });
    fireEvent.press(view.getByText('Grateful'));
    fireEvent.press(view.getByText('Grateful'));
    fireEvent.press(view.getByText('Finish'));
    expect(onComplete).not.toHaveBeenCalled();
  });

  test('every ScrollView on the mood step persists taps through the keyboard', () => {
    const view = renderOnMoodStep();
    const scrollViews = view.UNSAFE_getAllByType(ScrollView);
    expect(scrollViews.length).toBeGreaterThan(0);
    scrollViews.forEach((sv) => {
      expect(sv.props.keyboardShouldPersistTaps).toBe('handled');
    });
  });

  test('typing "😴Sleepy" into Name your own… and pressing Add fires with the stripped name', () => {
    const onAddCustomMood = jest.fn();
    const view = renderOnMoodStep({ onAddCustomMood });
    fireEvent.changeText(view.getByPlaceholderText('Name your own…'), '😴Sleepy');
    fireEvent.press(view.getByText('Add'));
    expect(onAddCustomMood).toHaveBeenCalledWith('Sleepy', MOOD_PALETTE[0]);
  });

  test('the name field caps at 24 characters', () => {
    const view = renderOnMoodStep();
    expect(view.getByPlaceholderText('Name your own…').props.maxLength).toBe(24);
  });
});

describe('WriteFlow — a feeling you picked can be put back down (IMP-069)', () => {
  const chipCount = (view, label) =>
    view.getAllByRole('button').map((n) => n.props.accessibilityLabel).filter((l) => l === label).length;

  test('with nothing picked the line reads the empty copy', () => {
    const view = renderOnMoodStep();
    expect(view.getByText('Tap to pick — tap again to undo.')).toBeTruthy();
  });

  test('after pressing Grateful it reads "1 chosen · Grateful"', () => {
    const view = renderOnMoodStep();
    fireEvent.press(view.getByText('Grateful'));
    expect(view.getByText('1 chosen · Grateful')).toBeTruthy();
  });

  test('pressing Grateful a second time returns it to the empty copy', () => {
    const view = renderOnMoodStep();
    fireEvent.press(view.getByText('Grateful'));
    fireEvent.press(view.getByText('Grateful'));
    expect(view.getByText('Tap to pick — tap again to undo.')).toBeTruthy();
  });

  test('typing "grateful" renders "That one is already here." and Add does not fire', () => {
    const onAddCustomMood = jest.fn();
    const view = renderOnMoodStep({ onAddCustomMood });
    fireEvent.changeText(view.getByPlaceholderText('Name your own…'), 'grateful');
    expect(view.getByText('That one is already here.')).toBeTruthy();
    fireEvent.press(view.getByText('Add'));
    expect(onAddCustomMood).not.toHaveBeenCalled();
  });

  test('customMoods={["Grateful", "Sleepy"]} yields exactly one chip labelled Grateful', () => {
    const view = renderOnMoodStep({ customMoods: ['Grateful', 'Sleepy'] });
    expect(chipCount(view, 'Grateful')).toBe(1);
  });
});

// IMP-117: at max font the two custom-mood circles must grow with the text
// they hold, not clip it. jest renders a tree, not pixels — these are source
// assertions; the walk (WALK-08) is the real acceptance.
describe('WriteFlow — the custom-mood circles scale with the font (IMP-117)', () => {
  const SRC = fs.readFileSync(path.join(__dirname, '../../src/screens/WriteFlow.js'), 'utf8');

  test('the chosen-face emoji and each palette-swatch emoji cap at CHROME_FONT_SCALE', () => {
    expect(SRC).toMatch(/<Text maxFontSizeMultiplier=\{CHROME_FONT_SCALE\} style=\{\{ fontSize: 18 \}\}>\{emojiPick\}<\/Text>/);
    expect(SRC).toMatch(/<Text maxFontSizeMultiplier=\{CHROME_FONT_SCALE\} style=\{\{ fontSize: 17 \}\}>\{e\}<\/Text>/);
  });

  test('neither circle hardcodes the old fixed 34dp box', () => {
    expect(SRC).not.toMatch(/width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: c\.accent, backgroundColor: c\.surface, alignItems: 'center', justifyContent: 'center' \}\}>/);
    expect(SRC).not.toMatch(/width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',\n\s*borderWidth: sel \? 2 : 0/);
  });

  test('both circles derive their size from the capped OS font scale', () => {
    expect(SRC).toMatch(/const dot = 34 \* Math\.min\(PixelRatio\.getFontScale\(\), CHROME_FONT_SCALE\);/);
    expect(SRC).toMatch(/width: dot, height: dot, borderRadius: dot \/ 2, borderWidth: 2,/);
    expect(SRC).toMatch(/width: dot, height: dot, borderRadius: dot \/ 2, alignItems: 'center', justifyContent: 'center',/);
  });
});
