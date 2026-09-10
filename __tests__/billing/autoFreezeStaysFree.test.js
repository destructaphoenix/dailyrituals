// __tests__/billing/autoFreezeStaysFree.test.js — IMP-110.
//
// PLUS_PERKS[1] used to sell "Streak insurance — a candle spends itself when
// you miss a day" as a Plus-only perk, but applyAutoFreeze has never been
// gated on `plus` — every free user already gets it. The owner ruled
// 2026-09-10 that the feature stays free and the copy was wrong, not the
// code, so this guards both halves: the copy no longer claims it, and the
// effect that spends the freeze is never made to check `plus` first.
import { PLUS_PERKS } from '../../src/data';

describe('PLUS_PERKS no longer claims auto-freeze as a members-only perk', () => {
  test('no perk line mentions streak insurance or a self-spending candle', () => {
    const claims = PLUS_PERKS.filter((p) => /insurance|spends itself/i.test(p));
    expect(claims).toEqual([]);
  });

  test('the reworded perk names the real members-only grant instead', () => {
    expect(PLUS_PERKS[1]).toBe('Three streak candles, every year you stay');
  });
});

// jest renders RitualsApp with whatever `plus` value a test passes in, so a
// future chat gating the mount effect on `plus` would only show up on a
// device with a free account — never here. Only a source assertion catches
// it without a walk.
describe('RitualsApp.js keeps the auto-freeze effect ungated', () => {
  const fs = require('fs');
  const path = require('path');
  const source = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'RitualsApp.js'), 'utf8');

  test('the applyAutoFreeze mount effect does not check plus first', () => {
    const effect = source.slice(
      source.indexOf('Streak insurance (IMP-039)'),
      source.indexOf('Trash pruning (IMP-036)')
    );
    expect(effect.length).toBeGreaterThan(0);
    expect(effect).not.toMatch(/plus\s*&&/);
    expect(effect).not.toMatch(/if\s*\(\s*plus\s*\)/);
    expect(effect).not.toMatch(/!plus/);
    expect(effect).toMatch(/applyAutoFreeze\(entries, frozenDays, freezes, dayKeyOf\(\)\)/);
  });
});
