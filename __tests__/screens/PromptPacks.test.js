import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PromptPacks from '../../src/screens/PromptPacks';
import { PROMPT_PACKS } from '../../src/content/packs';

function renderPacks(props = {}) {
  return render(
    <PromptPacks activePackId="everyday" onSelect={() => {}} onClose={() => {}} {...props} />
  );
}

describe('PromptPacks — IMP-058', () => {
  test('renders all four packs', () => {
    const view = renderPacks();
    PROMPT_PACKS.forEach((pack) => {
      expect(view.getByText(pack.name)).toBeTruthy();
      expect(view.getByText(pack.blurb)).toBeTruthy();
    });
  });

  test('selecting a pack calls onSelect with its id', () => {
    const onSelect = jest.fn();
    const view = renderPacks({ onSelect });
    fireEvent.press(view.getByLabelText('Use the Grief & loss prompt pack'));
    expect(onSelect).toHaveBeenCalledWith('grief');
  });

  test('the active pack is marked', () => {
    const view = renderPacks({ activePackId: 'gratitude' });
    const active = view.getByLabelText('Use the Gratitude prompt pack');
    // active row uses a 2px border, others use 1.5px
    expect(active.props.style.borderWidth).toBe(2);
    const inactive = view.getByLabelText('Use the Everyday prompt pack');
    expect(inactive.props.style.borderWidth).toBe(1.5);
  });
});
