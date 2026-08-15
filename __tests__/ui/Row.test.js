import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import Row from '../../src/ui/Row';

// Regression guard for IMP-030: a `flex: 1` text with no `numberOfLines` is
// exactly what let "Back up my journal" collapse to one character per line.
function assertNoUnboundedFlexText(view) {
  const texts = view.UNSAFE_getAllByType(Text);
  for (const node of texts) {
    const flat = StyleSheet.flatten(node.props.style) || {};
    if (flat.flex === 1) {
      expect(node.props.numberOfLines).toEqual(expect.any(Number));
    }
  }
}

describe('Row', () => {
  test('inline row: flex:1 label always carries numberOfLines', () => {
    const view = render(<Row icon={null} label="Appearance" value="Night" onPress={() => {}} />);
    assertNoUnboundedFlexText(view);
  });

  test('stacked row (long value): flex:1 label always carries numberOfLines', () => {
    const view = render(
      <Row icon={null} label="Back up my journal" value="Backed up 42 days ago — back up again soon" onPress={() => {}} />
    );
    assertNoUnboundedFlexText(view);
  });

  test('long name value: flex:1 label always carries numberOfLines', () => {
    const view = render(<Row icon={null} label="Your name" value={'A'.repeat(40)} onPress={() => {}} />);
    assertNoUnboundedFlexText(view);
  });

  test('stacked row: the value renders with numberOfLines={3}', () => {
    const view = render(
      <Row icon={null} label="Back up my journal" value="Backed up 42 days ago — back up again soon" onPress={() => {}} />
    );
    const value = view.getByText('Backed up 42 days ago — back up again soon');
    expect(value.props.numberOfLines).toBe(3);
  });

  test('inline row: the value renders with numberOfLines={1}', () => {
    const view = render(<Row icon={null} label="Appearance" value="Night" onPress={() => {}} />);
    const value = view.getByText('Night');
    expect(value.props.numberOfLines).toBe(1);
  });
});
