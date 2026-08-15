import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import MoodManager from '../../src/screens/MoodManager';

const insets = { top: 0, bottom: 0 };

function renderManager(props = {}) {
  return render(
    <MoodManager
      customMoods={[]} customMoodEmoji={{}} insets={insets}
      onClose={() => {}} onRenameMood={() => {}} onDeleteMood={() => {}}
      {...props}
    />
  );
}

describe('MoodManager — IMP-055', () => {
  test('renaming to a name that already exists shows the error and calls nothing', () => {
    const onRenameMood = jest.fn();
    const view = renderManager({ customMoods: ['Anxios', 'Sleepy'], onRenameMood });
    fireEvent.press(view.getByLabelText('Edit Anxios'));
    fireEvent.changeText(view.getByDisplayValue('Anxios'), 'Sleepy');
    expect(view.getByText('You already have that one.')).toBeTruthy();
    fireEvent.press(view.getByText('Save'));
    expect(onRenameMood).not.toHaveBeenCalled();
  });

  test('a valid rename calls onRenameMood with the old and new names', () => {
    const onRenameMood = jest.fn();
    const view = renderManager({
      customMoods: ['Anxios'], customMoodEmoji: { Anxios: '😬' }, onRenameMood,
    });
    fireEvent.press(view.getByLabelText('Edit Anxios'));
    fireEvent.changeText(view.getByDisplayValue('Anxios'), 'Anxious');
    fireEvent.press(view.getByText('Save'));
    expect(onRenameMood).toHaveBeenCalledWith('Anxios', 'Anxious', '😬');
  });

  test('Remove asks before calling onDeleteMood', () => {
    const onDeleteMood = jest.fn();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const view = renderManager({ customMoods: ['Anxios'], onDeleteMood });
    fireEvent.press(view.getByLabelText('Remove Anxios'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Remove Anxios?',
      'Remove Anxios from your list? Days you already marked with it keep it.',
      expect.any(Array)
    );
    expect(onDeleteMood).not.toHaveBeenCalled();
    const buttons = alertSpy.mock.calls[0][2];
    buttons.find((b) => b.text === 'Remove').onPress();
    expect(onDeleteMood).toHaveBeenCalledWith('Anxios');
    alertSpy.mockRestore();
  });

  test('the empty state renders with no custom moods', () => {
    const view = renderManager({ customMoods: [] });
    expect(view.getByText('The feelings you name yourself will live here.')).toBeTruthy();
  });

  test('built-in moods are never listed', () => {
    const view = renderManager({ customMoods: ['Anxios'] });
    expect(view.queryByText('Grateful')).toBeNull();
    expect(view.queryByText('Restless')).toBeNull();
  });

  test('typing "😬😬" into the face field leaves only "😬" (IMP-070)', () => {
    const view = renderManager({ customMoods: ['Anxios'] });
    fireEvent.press(view.getByLabelText('Edit Anxios'));
    fireEvent.changeText(view.getByPlaceholderText('or any emoji…'), '😬😬');
    expect(view.getByPlaceholderText('or any emoji…').props.value).toBe('😬');
  });
});
