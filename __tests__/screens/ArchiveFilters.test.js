import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ArchiveFilters from '../../src/screens/ArchiveFilters';
import { MOODS } from '../../src/data';

const chipLabels = (view) => view.getAllByRole('button').map((n) => n.props.accessibilityLabel);

const baseProps = { from: null, to: null, resultCount: 0 };

describe('ArchiveFilters — IMP-065', () => {
  test('with text="" there is no clear button', () => {
    const view = render(<ArchiveFilters {...baseProps} text="" moods={[]} onChange={() => {}} />);
    expect(view.queryByLabelText('Clear search')).toBeNull();
  });

  test('with text="rain" the clear button exists', () => {
    const view = render(<ArchiveFilters {...baseProps} text="rain" moods={[]} onChange={() => {}} />);
    expect(view.queryByLabelText('Clear search')).toBeTruthy();
  });

  test('pressing the clear button calls onChange with text cleared and the rest untouched', () => {
    const onChange = jest.fn();
    const view = render(
      <ArchiveFilters {...baseProps} text="rain" moods={['Grateful']} from="2026-01-01" to="2026-02-28" onChange={onChange} />
    );
    fireEvent.press(view.getByLabelText('Clear search'));
    expect(onChange).toHaveBeenCalledWith({ text: '', moods: ['Grateful'], from: '2026-01-01', to: '2026-02-28' });
  });

  test('with moods=[] the first chip is MOODS[0]', () => {
    const view = render(<ArchiveFilters {...baseProps} text="" moods={[]} onChange={() => {}} />);
    expect(chipLabels(view)[0]).toBe(MOODS[0]);
  });

  test('with moods=["Light"] (the last built-in) the first chip is Light', () => {
    const view = render(<ArchiveFilters {...baseProps} text="" moods={['Light']} onChange={() => {}} />);
    expect(chipLabels(view)[0]).toBe('Light');
  });

  test('customMoods={["Grateful"]} (IMP-069) yields exactly one chip labelled Grateful', () => {
    const view = render(
      <ArchiveFilters {...baseProps} text="" moods={[]} customMoods={['Grateful']} onChange={() => {}} />
    );
    expect(chipLabels(view).filter((l) => l === 'Grateful').length).toBe(1);
  });
});
