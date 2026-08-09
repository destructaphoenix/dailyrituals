import React from 'react';
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
    fireEvent.changeText(view.getByPlaceholderText('or type one…'), '🌵');
    fireEvent.changeText(view.getByPlaceholderText('Name your own…'), 'Prickly');
    fireEvent.press(view.getByText('Add'));
    expect(onAddCustomMood).toHaveBeenCalledWith('Prickly', '🌵');
  });

  test('typing non-emoji text does not change the selection — the previous pick stands', () => {
    const onAddCustomMood = jest.fn();
    const view = renderOnMoodStep({ onAddCustomMood });
    fireEvent.changeText(view.getByPlaceholderText('or type one…'), 'abc');
    fireEvent.changeText(view.getByPlaceholderText('Name your own…'), 'Grumpy');
    fireEvent.press(view.getByText('Add'));
    expect(onAddCustomMood).toHaveBeenCalledWith('Grumpy', MOOD_PALETTE[0]);
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
