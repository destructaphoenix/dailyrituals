import fs from 'fs';
import path from 'path';
import { DUR, EASE, stagger } from '../src/motion';

// ⚠️ Read jest.setup.js before trusting this file. react-native-reanimated is
// mocked to a no-op, so nothing here — and nothing in any suite that renders a
// screen using motion.js — exercises a single frame of real animation. What is
// tested below is deliberately only the PURE surface: the numbers, the shapes and
// the import graph. The motion itself is WALK-18's job, on a device.
describe('motion — the vocabulary (IMP-077)', () => {
  test('DUR names four speeds, ordered fastest to slowest', () => {
    expect(Object.keys(DUR).sort()).toEqual(['celebrate', 'enter', 'settle', 'tap']);
    expect(DUR.tap).toBe(120);
    expect(DUR.enter).toBe(320);
    expect(DUR.settle).toBe(480);
    expect(DUR.celebrate).toBe(900);
    expect(DUR.tap).toBeLessThan(DUR.enter);
    expect(DUR.enter).toBeLessThan(DUR.settle);
    expect(DUR.settle).toBeLessThan(DUR.celebrate);
  });

  test('EASE carries three curves plus the Celebration spring', () => {
    // Reanimated's Easing.bezier returns a factory object rather than a bare
    // function, so assert what actually distinguishes a curve here: it exists and
    // it is not a spring config.
    for (const curve of [EASE.standard, EASE.out, EASE.inOut]) {
      expect(curve).toBeTruthy();
      expect(curve.damping).toBeUndefined();
    }
    // `pop` is a spring config, not a curve — Celebration.js's friction 5 / tension
    // 80 restated in damping/stiffness. It must stay an object or withSpring breaks.
    expect(typeof EASE.pop).toBe('object');
    expect(EASE.pop).toEqual(expect.objectContaining({
      damping: expect.any(Number),
      stiffness: expect.any(Number),
      mass: expect.any(Number),
    }));
  });

  test('stagger(i, step) is the delay for list index i', () => {
    expect(stagger(0)).toBe(0);
    expect(stagger(1)).toBe(60);
    expect(stagger(4)).toBe(240);
    expect(stagger(0, 150)).toBe(0);
    expect(stagger(3, 150)).toBe(450);
  });

  // A source assertion on purpose, in the style of IMP-074's: "motion never reaches
  // for data" is a decision about the import graph, and no rendered frame can show
  // that a future author has not quietly imported the streak store to time a pop.
  test('motion.js imports nothing from persistence, billing, gamify or insights', () => {
    const src = fs.readFileSync(path.join(__dirname, '../src/motion.js'), 'utf8');
    const imports = [...src.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    expect(imports.length).toBeGreaterThan(0);
    for (const spec of imports) {
      expect(spec).not.toMatch(/persistence/);
      expect(spec).not.toMatch(/billing/);
      expect(spec).not.toMatch(/gamify/);
      expect(spec).not.toMatch(/insights/);
    }
  });

  test('motion.js holds no module-level state of its own', () => {
    const src = fs.readFileSync(path.join(__dirname, '../src/motion.js'), 'utf8');
    const body = src.replace(/\/\/[^\n]*/g, '');
    // Only DUR and EASE are module-level bindings; everything else is a hook or a
    // component, so state lives per-caller rather than shared across the app.
    const topLevel = [...body.matchAll(/^(?:export )?(?:const|let|var) (\w+)/gm)].map((m) => m[1]);
    expect(topLevel.sort()).toEqual(['DUR', 'EASE']);
  });
});
