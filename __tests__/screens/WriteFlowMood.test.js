import React from 'react';
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
    fireEvent.changeText(view.getByPlaceholderText('or any emoji…'), '🌵');
    fireEvent.changeText(view.getByPlaceholderText('Name your own…'), 'Prickly');
    fireEvent.press(view.getByText('Add'));
    expect(onAddCustomMood).toHaveBeenCalledWith('Prickly', '🌵');
  });

  test('typing non-emoji text does not change the selection — the previous pick stands', () => {
    const onAddCustomMood = jest.fn();
    const view = renderOnMoodStep({ onAddCustomMood });
    fireEvent.changeText(view.getByPlaceholderText('or any emoji…'), 'abc');
    fireEvent.changeText(view.getByPlaceholderText('Name your own…'), 'Grumpy');
    fireEvent.press(view.getByText('Add'));
    expect(onAddCustomMood).toHaveBeenCalledWith('Grumpy', MOOD_PALETTE[0]);
  });

  test('typing "🌵🌵🌵" leaves only "🌵" in the field, and Add fires with it', () => {
    const onAddCustomMood = jest.fn();
    const view = renderOnMoodStep({ onAddCustomMood });
    fireEvent.changeText(view.getByPlaceholderText('or any emoji…'), '🌵🌵🌵');
    expect(view.getByPlaceholderText('or any emoji…').props.value).toBe('🌵');
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
    expect(view.getByText('Pick at least one — tap a chosen one again to take it back.')).toBeTruthy();
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
    expect(view.getByText('Pick at least one — tap a chosen one again to take it back.')).toBeTruthy();
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
