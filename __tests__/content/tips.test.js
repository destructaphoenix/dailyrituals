import fs from 'fs';
import path from 'path';
import { EXPLAINERS } from '../../src/content/tips';
import * as tipsModule from '../../src/content/tips';
import { PERSISTED_KEYS, pickPersisted, deserialize } from '../../src/persistence/state';

describe('EXPLAINERS', () => {
  it('has exactly six entries', () => {
    expect(EXPLAINERS.length).toBe(6);
  });

  it('has a non-empty label, title and body for every entry', () => {
    EXPLAINERS.forEach((e) => {
      expect(typeof e.label).toBe('string');
      expect(e.label.length).toBeGreaterThan(0);
      expect(typeof e.title).toBe('string');
      expect(e.title.length).toBeGreaterThan(0);
      expect(typeof e.body).toBe('string');
      expect(e.body.length).toBeGreaterThan(0);
    });
  });

  it('has every id unique', () => {
    const ids = EXPLAINERS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('IMP-075 — the tip cards are gone', () => {
  const readSrc = (rel) => fs.readFileSync(path.join(__dirname, '../../src', rel), 'utf8');

  it('the tips module no longer exports TIPS', () => {
    expect(tipsModule.TIPS).toBeUndefined();
  });

  it('the tips module no longer exports pendingTip', () => {
    expect(tipsModule.pendingTip).toBeUndefined();
  });

  it('the tips module no longer exports markTipSeen', () => {
    expect(tipsModule.markTipSeen).toBeUndefined();
  });

  it('still exports EXPLAINERS, unchanged', () => {
    expect(EXPLAINERS.map((e) => e.id)).toEqual(['streak', 'embers', 'candles', 'rites', 'levels', 'keepsakes']);
  });

  it('TipCard.js is gone from the tree', () => {
    expect(fs.existsSync(path.join(__dirname, '../../src/screens/TipCard.js'))).toBe(false);
  });

  it('HomeScreen renders no TipCard', () => {
    const src = readSrc('screens/HomeScreen.js');
    expect(src).not.toMatch(/TipCard/);
    expect(src).not.toMatch(/onDismissTip/);
  });

  it('ArchiveScreen renders no TipCard', () => {
    const src = readSrc('screens/ArchiveScreen.js');
    expect(src).not.toMatch(/TipCard/);
    expect(src).not.toMatch(/onDismissTip/);
  });

  it('YouScreen renders no TipCard but still imports EXPLAINERS', () => {
    const src = readSrc('screens/YouScreen.js');
    expect(src).not.toMatch(/TipCard/);
    expect(src).not.toMatch(/onDismissTip/);
    expect(src).toMatch(/EXPLAINERS/);
  });

  it('RitualsApp has no tip wiring left', () => {
    const src = readSrc('RitualsApp.js');
    expect(src).not.toMatch(/pendingTip/);
    expect(src).not.toMatch(/markTipSeen/);
    expect(src).not.toMatch(/seenTips/);
    expect(src).not.toMatch(/TipCard/);
  });

  it('seenTips is no longer a persisted key', () => {
    expect(PERSISTED_KEYS).not.toContain('seenTips');
  });

  it('pickPersisted drops a legacy seenTips value', () => {
    expect(pickPersisted({ seenTips: ['today-streak'], xp: 5 })).toEqual({ xp: 5 });
  });

  it('a legacy payload carrying seenTips still deserializes', () => {
    const result = deserialize(JSON.stringify({ version: 3, xp: 5, seenTips: ['today-streak'] }));
    expect(result).not.toBeNull();
    expect(result.xp).toBe(5);
  });
});
