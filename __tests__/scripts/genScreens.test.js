// __tests__/scripts/genScreens.test.js — the one real risk in IMP-135.
//
// HomeScreen takes ~30 props, wired by hand at RitualsApp.js:959.
// scripts/screenFixtures.js's homePropsFromState() restates that wiring so
// gen-screens.js can render the screen outside the app — which makes it a
// SECOND source of truth for the same prop list. A prop added to or renamed
// on HomeScreen would otherwise render silently with a hole in it (the
// missing prop just reads as `undefined`) and nobody would notice until a
// human looked at the generated card.
//
// This reads HomeScreen's OWN destructured signature via @babel/core (not a
// hand-typed list here, which would be exactly the drift this guards
// against) and asserts homePropsFromState supplies every one of them.
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const ROOT = path.join(__dirname, '..', '..');
const { homePropsFromState } = require('../../scripts/screenFixtures');

function homeScreenPropNames() {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'screens', 'HomeScreen.js'), 'utf8');
  const ast = babel.parseSync(src, {
    filename: 'HomeScreen.js',
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-syntax-jsx'],
    sourceType: 'module',
  });
  const exportDefault = ast.program.body.find((n) => n.type === 'ExportDefaultDeclaration');
  const fn = exportDefault.declaration;
  const param = fn.params[0];
  return param.properties.map((p) => p.key.name);
}

describe('homePropsFromState supplies every prop HomeScreen actually declares', () => {
  const propNames = homeScreenPropNames();

  test('HomeScreen still destructures its props (sanity on the parse itself)', () => {
    expect(propNames.length).toBeGreaterThan(20);
  });

  test('every destructured prop name is present on the fixture mapping', () => {
    const state = {
      entries: [{ dayKey: '2026-01-01' }],
      frozenDays: [],
      xp: 6400,
      settings: { tone: 'gentle', name: 'Sam' },
      quests: null,
      freezes: 3,
      done: true,
      embers: 2400,
      plus: false,
      mode: 'day',
      activeSky: 'classic',
      ownedSkies: ['classic'],
    };
    const props = homePropsFromState(state);
    const missing = propNames.filter((name) => !(name in props));
    expect(missing).toEqual([]);
  });
});

describe('the generated home cards render the app\'s real hero geometry', () => {
  // Imported, never retyped — the same rule IMP-134 set for the frozen rays
  // card, now checked here too.
  const { HERO_HEIGHT } = require('../../src/home/heroFrame');
  const dayHtml = fs.readFileSync(path.join(ROOT, 'design-system', 'screens', 'home-day.html'), 'utf8');
  const nightHtml = fs.readFileSync(path.join(ROOT, 'design-system', 'screens', 'home-night.html'), 'utf8');

  test('both grounds in home-day.html are drawn at HERO_HEIGHT', () => {
    expect((dayHtml.match(new RegExp(`height:${HERO_HEIGHT}px`, 'g')) || []).length).toBe(2);
  });

  test('both grounds in home-night.html are drawn at HERO_HEIGHT', () => {
    expect((nightHtml.match(new RegExp(`height:${HERO_HEIGHT}px`, 'g')) || []).length).toBe(2);
  });

  test('home-day.html states this is a layout render, not a device capture', () => {
    expect(dayHtml).toMatch(/not a device capture/);
  });
});
