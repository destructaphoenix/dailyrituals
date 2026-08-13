import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Heat } from '../../src/screens/ArchiveScreen';

const writtenCell = { dayKey: '2026-06-14', moods: ['calm'], today: true };
const missedCell = { dayKey: '2026-06-13', missed: true };
const emptyCell = { dayKey: '2026-06-01', empty: true };
const orphanCell = { dayKey: '2026-06-10', moods: ['tired'] };

const cells = [writtenCell, missedCell, emptyCell, orphanCell];

const writtenEntry = { id: 'e1', dayKey: '2026-06-14', moods: ['calm'], did: 'did', wished: 'wished' };
const entries = [writtenEntry]; // no entry for orphanCell's dayKey

describe('ArchiveScreen Heat — IMP-052 (tap a day, read it)', () => {
  test('pressing a written day calls onOpen with that day\'s entry', () => {
    const onOpen = jest.fn();
    const view = render(<Heat cells={cells} entries={entries} onOpen={onOpen} />);
    fireEvent.press(view.getByLabelText('2026-06-14, calm'));
    expect(onOpen).toHaveBeenCalledWith(writtenEntry);
  });

  test('pressing a missed day calls nothing', () => {
    const onOpen = jest.fn();
    const view = render(<Heat cells={cells} entries={entries} onOpen={onOpen} />);
    expect(view.queryByLabelText(/2026-06-13/)).toBeNull();
    expect(onOpen).not.toHaveBeenCalled();
  });

  test('pressing an empty day calls nothing', () => {
    const onOpen = jest.fn();
    const view = render(<Heat cells={cells} entries={entries} onOpen={onOpen} />);
    expect(view.queryByLabelText(/2026-06-01/)).toBeNull();
    expect(onOpen).not.toHaveBeenCalled();
  });

  test('a written day whose entry has been removed from entries calls nothing and does not throw', () => {
    const onOpen = jest.fn();
    const view = render(<Heat cells={cells} entries={entries} onOpen={onOpen} />);
    expect(() => fireEvent.press(view.getByLabelText('2026-06-10, tired'))).not.toThrow();
    expect(onOpen).not.toHaveBeenCalled();
  });

  test('pressable cells expose accessibilityRole="button" and non-pressable cells do not', () => {
    const view = render(<Heat cells={cells} entries={entries} onOpen={() => {}} />);
    expect(view.getByLabelText('2026-06-14, calm').props.accessibilityRole).toBe('button');
    expect(view.getByLabelText('2026-06-10, tired').props.accessibilityRole).toBe('button');
    expect(view.queryByLabelText(/2026-06-13/)).toBeNull();
    expect(view.queryByLabelText(/2026-06-01/)).toBeNull();
  });
});
