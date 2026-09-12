// videoSkyGate.js — is a video sky active behind the streak hero? IMP-121
// hardcodes it on for the one bundled fixture clip; IMP-122 replaces the body
// with a manifest lookup keyed on the owned/active sky. `classic` and
// `crescent` stay frozen art (playbook → standing rules #3) and never reach
// this gate.
export function hasVideoSky() {
  return true;
}
