// __tests__/scripts/genDesignSystem.test.js — the design system may not describe
// an app that no longer exists.
//
// Why this file exists. design-system/components/plus.html is what Claude Design
// reads when a Plus surface is redesigned, and for a month it carried three
// claims the app had already contradicted: "PLUS_ENABLED is false and stays
// false" (true since 2026-09-05), the pre-IMP-090 banner copy, and "Member ·
// renews soon" — the exact invented string IMP-082 forbade. It also drew three
// price tags the app does not render and omitted a fourth it does. None of that
// was visible to any test, because the card is generated, committed, and then
// read by a human in a different tool.
//
// These are source assertions over TEXT, deliberately: the generator self-runs on
// require and writes 3MB of HTML, so importing it is not an option.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const gen = fs.readFileSync(path.join(ROOT, 'scripts', 'gen-design-system.js'), 'utf8');
// JSX writes `&amp;` where the rendered string has `&`.
const shopui = fs.readFileSync(path.join(ROOT, 'src', 'shopui.js'), 'utf8').replace(/&amp;/g, '&');

function plusCopy() {
  const block = gen.match(/const PLUS_COPY = \{([\s\S]*?)\n\};/);
  expect(block).not.toBeNull();
  const out = {};
  for (const m of block[1].matchAll(/(\w+):\s*'([^']*)'/g)) out[m[1]] = m[2];
  return out;
}

describe('the Plus card quotes the app, not a memory of it', () => {
  const copy = plusCopy();

  test('every banner and member string is still in src/shopui.js', () => {
    expect(Object.keys(copy).length).toBeGreaterThanOrEqual(9);
    for (const [key, value] of Object.entries(copy)) {
      // The renewal sub-line carries a sample date; only its stem is literal.
      const needle = key === 'memberSub' ? 'Member · renews ' : value;
      expect({ key, found: shopui.includes(needle) }).toEqual({ key, found: true });
    }
  });

  test('all four PalTag states are named', () => {
    expect(copy.tagActive).toBe('Applied');
    expect(copy.tagOwned).toBe('Apply');
    expect(copy.tagPlus).toBe('Plus');
    // The fourth is the ember price, a number, so it has no literal to pin —
    // the card's caption must still say what it is.
    expect(gen).toMatch(/its ember price/);
  });
});

describe('the retired claims stay retired', () => {
  test('does not say PLUS_ENABLED is false', () => {
    expect(gen).not.toMatch(/PLUS_ENABLED<\/code> is <code>false<\/code> and stays false/);
  });

  test('does not invent a renewal date (IMP-082)', () => {
    // The phrase itself may still appear in the card's prose — it now names
    // "renews soon" as the thing a design must never do. What is pinned is the
    // RENDERED line: it must carry a date-shaped value, not a vague one.
    const sub = plusCopy().memberSub;
    expect(sub).not.toMatch(/soon/);
    expect(sub).toMatch(/^Member · renews \d/);
  });

  test('does not carry the pre-IMP-090 banner copy', () => {
    expect(gen).not.toMatch(/Keep every day you write/);
    expect(gen).not.toMatch(/unlimited restores/);
  });

  test('the Reflections caption does not call a 5-week heat lifetime', () => {
    const caption = gen.match(/'04-reflections': '([^']*)'/);
    expect(caption).not.toBeNull();
    expect(caption[1]).not.toMatch(/lifetime/);
  });
});
