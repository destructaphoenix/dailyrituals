import { renameMood, deleteMood, moodNameError } from '../../src/entries/renameMood';

const entry = (dayKey, moods, extra = {}) => ({
  id: dayKey, dayKey, did: 'did ' + dayKey, wished: 'wished ' + dayKey, moods, streak: true, ...extra,
});

const deepFreeze = (o) => {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) {
    Object.values(o).forEach(deepFreeze);
    Object.freeze(o);
  }
  return o;
};

describe('renameMood — IMP-055', () => {
  test('rewrites the mood in every entries moods array', () => {
    const entries = [entry('2026-06-14', ['Anxios']), entry('2026-06-13', ['Grateful'])];
    const trash = [];
    const settings = { customMoods: ['Anxios'], customMoodEmoji: { Anxios: '😬' } };
    const { entries: next } = renameMood({ entries, trash, settings }, 'Anxios', 'Anxious');
    expect(next[0].moods).toEqual(['Anxious']);
    expect(next[1].moods).toEqual(['Grateful']);
  });

  test('rewrites the mood in trash too, so a later restore does not resurrect the old name', () => {
    const entries = [];
    const trash = [entry('2026-06-10', ['Anxios'], { deletedAt: 1 })];
    const settings = { customMoods: ['Anxios'], customMoodEmoji: {} };
    const { trash: nextTrash } = renameMood({ entries, trash, settings }, 'Anxios', 'Anxious');
    expect(nextTrash[0].moods).toEqual(['Anxious']);
  });

  test('rewrites settings.customMoods keeping list position', () => {
    const entries = [];
    const trash = [];
    const settings = { customMoods: ['Foo', 'Anxios', 'Bar'], customMoodEmoji: {} };
    const { settings: next } = renameMood({ entries, trash, settings }, 'Anxios', 'Anxious');
    expect(next.customMoods).toEqual(['Foo', 'Anxious', 'Bar']);
  });

  test('re-keys customMoodEmoji, keeping the emoji', () => {
    const entries = [];
    const trash = [];
    const settings = { customMoods: ['Anxios'], customMoodEmoji: { Anxios: '😬', Grateful: '🙏' } };
    const { settings: next } = renameMood({ entries, trash, settings }, 'Anxios', 'Anxious');
    expect(next.customMoodEmoji).toEqual({ Anxious: '😬', Grateful: '🙏' });
  });

  test('entries that did not use the mood keep their object identity', () => {
    const untouched = entry('2026-06-13', ['Grateful']);
    const entries = [entry('2026-06-14', ['Anxios']), untouched];
    const trash = [];
    const settings = { customMoods: ['Anxios'], customMoodEmoji: {} };
    const { entries: next } = renameMood({ entries, trash, settings }, 'Anxios', 'Anxious');
    expect(next[1]).toBe(untouched);
  });

  test('an entry carrying both the old and new name does not end up with a duplicate', () => {
    const entries = [entry('2026-06-14', ['Anxios', 'Anxious'])];
    const trash = [];
    const settings = { customMoods: ['Anxios', 'Anxious'], customMoodEmoji: {} };
    const { entries: next } = renameMood({ entries, trash, settings }, 'Anxios', 'Anxious');
    expect(next[0].moods).toEqual(['Anxious']);
  });

  test('a rename with no matching entries anywhere returns all three slices by reference', () => {
    const entries = [entry('2026-06-14', ['Grateful'])];
    const trash = [entry('2026-06-10', ['Proud'], { deletedAt: 1 })];
    const settings = { customMoods: ['SomethingElse'], customMoodEmoji: {} };
    const result = renameMood({ entries, trash, settings }, 'Anxios', 'Anxious');
    expect(result.entries).toBe(entries);
    expect(result.trash).toBe(trash);
    expect(result.settings).toBe(settings);
  });

  test('null and malformed rows, and a missing moods array, survive without throwing', () => {
    const entries = [null, { dayKey: 'x' }, entry('2026-06-14', ['Anxios'])];
    const trash = [undefined, { dayKey: 'y', moods: null }];
    const settings = { customMoods: ['Anxios'], customMoodEmoji: {} };
    expect(() => renameMood({ entries, trash, settings }, 'Anxios', 'Anxious')).not.toThrow();
    const { entries: next } = renameMood({ entries, trash, settings }, 'Anxios', 'Anxious');
    expect(next[2].moods).toEqual(['Anxious']);
  });

  test('nothing is ever mutated in place', () => {
    const entries = deepFreeze([entry('2026-06-14', ['Anxios'])]);
    const trash = deepFreeze([entry('2026-06-10', ['Anxios'], { deletedAt: 1 })]);
    const settings = deepFreeze({ customMoods: ['Anxios'], customMoodEmoji: { Anxios: '😬' } });
    expect(() => renameMood({ entries, trash, settings }, 'Anxios', 'Anxious')).not.toThrow();
  });

  test('a did/wished string that happens to contain the mood word is left completely alone', () => {
    const entries = [entry('2026-06-14', ['Anxios'], { did: 'Felt Anxios about the exam', wished: 'Less Anxios tomorrow' })];
    const trash = [];
    const settings = { customMoods: ['Anxios'], customMoodEmoji: {} };
    const { entries: next } = renameMood({ entries, trash, settings }, 'Anxios', 'Anxious');
    expect(next[0].did).toBe('Felt Anxios about the exam');
    expect(next[0].wished).toBe('Less Anxios tomorrow');
  });
});

describe('deleteMood — IMP-055', () => {
  test('removes the mood from settings.customMoods only', () => {
    const settings = { customMoods: ['Foo', 'Anxios', 'Bar'], customMoodEmoji: { Anxios: '😬' } };
    const { settings: next } = deleteMood({ entries: [], trash: [], settings }, 'Anxios');
    expect(next.customMoods).toEqual(['Foo', 'Bar']);
  });

  test('entries, trash and customMoodEmoji come back by reference, unchanged', () => {
    const entries = [entry('2026-06-14', ['Anxios'])];
    const trash = [entry('2026-06-10', ['Anxios'], { deletedAt: 1 })];
    const settings = { customMoods: ['Anxios'], customMoodEmoji: { Anxios: '😬' } };
    const result = deleteMood({ entries, trash, settings }, 'Anxios');
    expect(result.entries).toBe(entries);
    expect(result.trash).toBe(trash);
    expect(result.settings.customMoodEmoji).toBe(settings.customMoodEmoji);
  });

  test('entries that used the deleted mood keep it', () => {
    const entries = [entry('2026-06-14', ['Anxios'])];
    const settings = { customMoods: ['Anxios'], customMoodEmoji: {} };
    const result = deleteMood({ entries, trash: [], settings }, 'Anxios');
    expect(result.entries[0].moods).toEqual(['Anxios']);
  });

  test('deleting a name not present is a no-op, all references unchanged', () => {
    const entries = [];
    const trash = [];
    const settings = { customMoods: ['Foo'], customMoodEmoji: {} };
    const result = deleteMood({ entries, trash, settings }, 'Nope');
    expect(result.settings).toBe(settings);
  });
});

describe('moodNameError — IMP-055', () => {
  test('empty or whitespace', () => {
    expect(moodNameError('', {})).toBe('Give it a name.');
    expect(moodNameError('   ', {})).toBe('Give it a name.');
  });

  test('longer than 24 characters', () => {
    expect(moodNameError('a'.repeat(25), {})).toBe('A bit shorter.');
    expect(moodNameError('a'.repeat(24), {})).toBeNull();
  });

  test('a case-insensitive match against a built-in mood', () => {
    expect(moodNameError('grateful', {})).toBe('That one is already here.');
    expect(moodNameError('GRATEFUL', {})).toBe('That one is already here.');
  });

  test('a case-insensitive match against another custom mood', () => {
    expect(moodNameError('anxios', { customMoods: ['Anxios'] })).toBe('You already have that one.');
  });

  test('renaming a mood to itself (unchanged) is allowed', () => {
    expect(moodNameError('Anxios', { customMoods: ['Anxios'], existing: 'Anxios' })).toBeNull();
  });

  test('a genuinely new name is fine', () => {
    expect(moodNameError('Wistful', { customMoods: ['Anxios'] })).toBeNull();
  });
});
