// Decides whether first-run onboarding should be skipped on launch.
//
// A user has completed onboarding if either:
//   1. the explicit `onboarded` flag is set (the going-forward source of truth,
//      written by RitualsApp once it mounts — it only mounts post-onboarding), or
//   2. there is ANY persisted state at all (a returning user — covers testers
//      whose data was saved before the `onboarded` flag existed, so an update
//      never forces them back through onboarding).
//
// `loaded` is the deserialized persisted state, or null when nothing is stored.
export function hasCompletedOnboarding(loaded) {
  if (loaded && loaded.onboarded === true) return true;
  return !!loaded;
}
