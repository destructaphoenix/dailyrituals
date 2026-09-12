// videoSkyGate.js — which sky (if any) plays behind the streak hero, and
// which of its clips the current app mode resolves to. IMP-121 hardcoded
// `hasVideoSky()` true for one bundled fixture clip; IMP-122 replaces that
// with a real manifest lookup over SHOP_SKIES. Ownership gates it, never
// `plus` directly — Harvest Moon is ember-priced and still carries a clip
// once one exists, so this mirrors Shop.js's own owned/active check.
// `classic` and `crescent` stay frozen art (playbook -> Claude Design
// standing rules #3) and never resolve here because they carry no `clip`.
import { SHOP_SKIES } from '../data';

function isOwned(sky, ownedSkies, plus) {
  return plus || sky.tier === 'owned' || ownedSkies.includes(sky.id);
}

function hasClip(sky) {
  return Boolean(sky.clip || (sky.clipDay && sky.clipNight));
}

// The manifest entry behind the hero right now, or null when the active sky
// has no video (frozen art, or no clip has shipped for it yet) or isn't
// owned.
export function activeSkyManifest(activeSky, ownedSkies, plus) {
  const sky = SHOP_SKIES.find((s) => s.id === activeSky);
  if (!sky || !hasClip(sky) || !isOwned(sky, ownedSkies || [], plus)) return null;
  return sky;
}

// The VideoSource for a manifest entry in the given app mode. A one-clip sky
// plays the same file in both modes; a two-clip sky picks by mode. Never
// tints one clip to fake the other (docs/skies-route.md).
export function skyVideoSource(sky, mode) {
  if (!sky) return null;
  const url = sky.clip || (mode === 'night' ? sky.clipNight : sky.clipDay);
  return url ? { uri: url, useCaching: true } : null;
}
