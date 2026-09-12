// __tests__/data/skyManifest.test.js — IMP-122. A sky whose origin nobody can
// state does not ship (docs/playbook.md -> "Every sky must be ours to sell"),
// so every entry that carries a clip must carry a non-empty `credit` too.
// Passes vacuously today (no sky has cleared the provenance gate yet) — it
// exists to catch the day someone adds a clip without one.
import { SHOP_SKIES } from '../../src/data';

describe('SHOP_SKIES manifest', () => {
  test('every video sky has a non-empty credit', () => {
    const videoSkies = SHOP_SKIES.filter((s) => s.clip || (s.clipDay && s.clipNight));
    videoSkies.forEach((s) => {
      expect(typeof s.credit).toBe('string');
      expect(s.credit.trim().length).toBeGreaterThan(0);
    });
  });
});
