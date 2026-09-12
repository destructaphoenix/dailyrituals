// __tests__/data/skyManifest.test.js — IMP-122. A sky whose origin nobody can
// state does not ship (docs/playbook.md -> "Every sky must be ours to sell"),
// so every entry that carries a clip must carry a non-empty `credit` too.
// Passes vacuously today (no sky has cleared the provenance gate yet) — it
// exists to catch the day someone adds a clip without one.
import { SHOP_SKIES } from '../../src/data';
import { activeSkyManifest, skyVideoSource } from '../../src/home/videoSkyGate';

describe('SHOP_SKIES manifest', () => {
  test('every video sky has a non-empty credit', () => {
    const videoSkies = SHOP_SKIES.filter((s) => s.clip || (s.clipDay && s.clipNight));
    videoSkies.forEach((s) => {
      expect(typeof s.credit).toBe('string');
      expect(s.credit.trim().length).toBeGreaterThan(0);
    });
  });

  // IMP-123 — meteor is the first sky to actually carry a clip.
  test('meteor resolves through activeSkyManifest to a real, absolute manifest', () => {
    const manifest = activeSkyManifest('meteor', [], true);
    expect(manifest).not.toBeNull();
    expect(manifest.clip).toMatch(/^https:\/\//);
    expect(manifest.poster).toMatch(/^https:\/\//);
    expect(skyVideoSource(manifest, 'day')).toEqual({ uri: manifest.clip, useCaching: true });
  });
});
