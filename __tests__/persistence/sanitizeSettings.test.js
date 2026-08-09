import { sanitizeSettings } from '../../src/persistence/sanitizeSettings';
import { mergeWithDefaults } from '../../src/persistence/state';
import { DEFAULT_SETTINGS, makeTheme } from '../../src/theme';

describe('sanitizeSettings — accent', () => {
  test('accent as a string is replaced with the default array', () => {
    const out = sanitizeSettings({ accent: '#C9884A' });
    expect(out.accent).toEqual(DEFAULT_SETTINGS.accent);
  });

  test('accent whose 2nd element is not a hex colour is replaced wholesale', () => {
    const out = sanitizeSettings({ accent: ['#f59e0b', 'not-a-colour', '#fef3c7'] });
    expect(out.accent).toEqual(DEFAULT_SETTINGS.accent);
  });

  test('accent as three valid hex strings is kept untouched', () => {
    const valid = ['#111111', '#222222', '#333333'];
    const out = sanitizeSettings({ accent: valid });
    expect(out.accent).toEqual(valid);
  });

  test('accent of the wrong length is replaced with the default array', () => {
    const out = sanitizeSettings({ accent: ['#111111', '#222222'] });
    expect(out.accent).toEqual(DEFAULT_SETTINGS.accent);
  });
});

describe('sanitizeSettings — reminder', () => {
  test('reminder as null is replaced with the default object', () => {
    const out = sanitizeSettings({ reminder: null });
    expect(out.reminder).toEqual(DEFAULT_SETTINGS.reminder);
  });

  test('reminder as a string is replaced with the default object', () => {
    const out = sanitizeSettings({ reminder: 'nope' });
    expect(out.reminder).toEqual(DEFAULT_SETTINGS.reminder);
  });

  test('reminder.hour as a string is defaulted while a valid sibling (enabled) is kept', () => {
    const out = sanitizeSettings({ reminder: { enabled: true, hour: 'nine', minute: 15 } });
    expect(out.reminder.hour).toBe(DEFAULT_SETTINGS.reminder.hour);
    expect(out.reminder.enabled).toBe(true);
    expect(out.reminder.minute).toBe(15);
  });
});

describe('sanitizeSettings — scalars', () => {
  test('name as a number becomes the default empty string', () => {
    const out = sanitizeSettings({ name: 42 });
    expect(out.name).toBe('');
  });

  test('customMoods as a string becomes the default empty array', () => {
    const out = sanitizeSettings({ customMoods: 'oops' });
    expect(out.customMoods).toEqual([]);
  });

  test('recapSeen: null is valid (its own default) and is kept, not looped back on itself', () => {
    const out = sanitizeSettings({ recapSeen: null });
    expect(out.recapSeen).toBeNull();
    expect('recapSeen' in out).toBe(true);
  });

  test('recapSeen as a number (a real dismissal year) is kept', () => {
    const out = sanitizeSettings({ recapSeen: 2025 });
    expect(out.recapSeen).toBe(2025);
  });
});

describe('sanitizeSettings — customMoodEmoji', () => {
  test('a string is replaced with the default empty map', () => {
    const out = sanitizeSettings({ customMoodEmoji: 'oops' });
    expect(out.customMoodEmoji).toEqual({});
  });

  test('an array is replaced with the default empty map', () => {
    const out = sanitizeSettings({ customMoodEmoji: ['😊'] });
    expect(out.customMoodEmoji).toEqual({});
  });

  test('a good map is kept verbatim', () => {
    const good = { Sleepy: '😴', Wired: '⚡' };
    const out = sanitizeSettings({ customMoodEmoji: good });
    expect(out.customMoodEmoji).toEqual(good);
  });

  test('a mixed map keeps the good keys and drops a bad one', () => {
    const out = sanitizeSettings({ customMoodEmoji: { Sleepy: '😴', Grumpy: 'zzz' } });
    expect(out.customMoodEmoji).toEqual({ Sleepy: '😴' });
  });

  test('never mutates its input map', () => {
    const input = { customMoodEmoji: { Sleepy: '😴', Grumpy: 'zzz' } };
    const copy = JSON.parse(JSON.stringify(input));
    sanitizeSettings(input);
    expect(input).toEqual(copy);
  });
});

describe('sanitizeSettings — forward/backward compat', () => {
  test('an unknown key from a newer build is preserved, not dropped', () => {
    const out = sanitizeSettings({ somethingFromANewerBuild: 1 });
    expect(out.somethingFromANewerBuild).toBe(1);
  });

  test('a key missing from the loaded object stays missing (mergeWithDefaults fills it afterward)', () => {
    const out = sanitizeSettings({ name: 'Maya' });
    expect('reminder' in out).toBe(false);
    expect('accent' in out).toBe(false);
  });
});

describe('sanitizeSettings — input safety', () => {
  test('never mutates its input', () => {
    const input = { accent: '#C9884A', name: 'Riya' };
    const copy = JSON.parse(JSON.stringify(input));
    sanitizeSettings(input);
    expect(input).toEqual(copy);
  });

  test('undefined input returns {}', () => {
    expect(sanitizeSettings(undefined)).toEqual({});
  });

  test('null input returns {}', () => {
    expect(sanitizeSettings(null)).toEqual({});
  });

  test('a non-object input returns {}', () => {
    expect(sanitizeSettings('nope')).toEqual({});
  });
});

describe('sanitizeSettings — regression: the actual IMP-049 failure is closed', () => {
  const colorLike = /^(#[\da-f]{3,8}|rgba?\(|transparent)/i;

  function everyColorInTheme(theme) {
    const problems = [];
    for (const [key, value] of Object.entries(theme.colors)) {
      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        if (typeof v === 'string' && !colorLike.test(v)) problems.push(`${key}: ${v}`);
      }
    }
    return problems;
  }

  test('a poisoned settings.accent (string, not [accent, deep, soft]) no longer produces null/garbage colours', () => {
    const poisoned = { accent: '#C9884A' };

    // Prove the assertion below can actually fail: without sanitize, the
    // shallow mergeWithDefaults lets the string straight through and
    // makeTheme indexes it by character, producing non-colour tokens.
    const unsanitized = mergeWithDefaults(poisoned, DEFAULT_SETTINGS);
    const dayProblemsUnsanitized = everyColorInTheme(makeTheme('day', unsanitized));
    expect(dayProblemsUnsanitized.length).toBeGreaterThan(0);

    const sanitized = mergeWithDefaults(sanitizeSettings(poisoned), DEFAULT_SETTINGS);
    expect(everyColorInTheme(makeTheme('day', sanitized))).toEqual([]);
    expect(everyColorInTheme(makeTheme('night', sanitized))).toEqual([]);
  });
});
