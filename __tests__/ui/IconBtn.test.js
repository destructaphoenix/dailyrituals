import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import IconBtn from '../../src/ui/IconBtn';

describe('IconBtn — IMP-059', () => {
  test('renders accessibilityRole="button" and the given label', () => {
    const view = render(
      <IconBtn onPress={() => {}} label="Close this entry">
        <Text>x</Text>
      </IconBtn>
    );
    const btn = view.getByLabelText('Close this entry');
    expect(btn.props.accessibilityRole).toBe('button');
  });
});
