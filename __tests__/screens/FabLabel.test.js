import React from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import RitualsApp from '../../src/RitualsApp';
import { DEFAULT_SETTINGS } from '../../src/theme';

// RitualsApp's reminder effect reaches expo-notifications on mount (io.js's
// lazy require) — stubbed so the render doesn't hit real native modules.
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(async () => ({ status: 'undetermined' })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'undetermined' })),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => {}),
  scheduleNotificationAsync: jest.fn(async () => 'id'),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove() {} })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove() {} })),
  getLastNotificationResponseAsync: jest.fn(async () => null),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

const metrics = initialWindowMetrics || {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe('RitualsApp write FAB — IMP-059', () => {
  test('the FAB exposes its label to a screen reader', () => {
    const view = render(
      <SafeAreaProvider initialMetrics={metrics}>
        <RitualsApp
          settings={DEFAULT_SETTINGS}
          setSettings={() => {}}
          onToggleMode={() => {}}
          onResetData={() => {}}
          onReplaceAllData={() => {}}
        />
      </SafeAreaProvider>
    );
    const fab = view.getByLabelText("Write today's entry");
    expect(fab.props.accessibilityRole).toBe('button');
  });
});
