import React from 'react';
import { render } from '@testing-library/react-native';
import { ResultLine } from '../../src/screens/ArchiveScreen';

const entry = {
  id: 'e1',
  dayKey: '2026-06-03',
  did: 'Walked the long way home past the old bakery and stopped for bread',
  wished: 'A slower morning with nobody asking me anything',
  moods: ['Grateful'],
};

// The rendered text of a <T> tree, flattened — the card composes a line out of
// several nested Text nodes, and what matters is what the user reads.
const textOf = (view) => view.root.findAllByType('Text').map((n) => n.children)
  .flat().filter((x) => typeof x === 'string').join('');

describe('ArchiveScreen ResultLine — IMP-053 (search shows you the match)', () => {
  test('with no text query it renders did, exactly as before', () => {
    const view = render(<ResultLine entry={entry} text="" />);
    expect(textOf(view)).toBe(entry.did);
    expect(view.queryByText('did · ')).toBeNull();
    expect(view.queryByText('wished · ')).toBeNull();
  });

  test('a word only in wished is rendered, with the wished label', () => {
    const view = render(<ResultLine entry={entry} text="nobody" />);
    expect(textOf(view)).toContain('nobody');
    expect(view.getByText('wished · ')).toBeTruthy();
  });

  test('a word deep in did is rendered even though it is past the first line', () => {
    const view = render(<ResultLine entry={entry} text="bread" />);
    expect(textOf(view)).toContain('bread');
    // It came from `did`, so the label names did, not wished.
    expect(view.getByText('did · ')).toBeTruthy();
  });

  test('the matched word is the highlighted node, not the whole line', () => {
    const view = render(<ResultLine entry={entry} text="bakery" />);
    expect(view.getByText('bakery')).toBeTruthy();
  });

  test('a mood-only filter (no text) renders no highlight', () => {
    const view = render(<ResultLine entry={entry} text={undefined} />);
    expect(textOf(view)).toBe(entry.did);
    expect(view.queryByText('did · ')).toBeNull();
    expect(view.queryByText('wished · ')).toBeNull();
  });

  test('a query that matches nothing in either field falls back to did', () => {
    const view = render(<ResultLine entry={entry} text="zebra" />);
    expect(textOf(view)).toBe(entry.did);
  });

  test('a did match renders "did · " exactly once', () => {
    const view = render(<ResultLine entry={entry} text="bread" />);
    expect(view.getAllByText('did · ').length).toBe(1);
  });

  test('the label text is generated from the field, so a wished match never renders "did · "', () => {
    const view = render(<ResultLine entry={entry} text="nobody" />);
    expect(view.queryByText('did · ')).toBeNull();
  });
});
