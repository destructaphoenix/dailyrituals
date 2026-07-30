// src/dev/sentinel.js
// DEV-ONLY marker. Every dev module builds a DEV_ID from this and the panel
// footer *renders* the joined id list — rendering (not just exporting) is
// what stops the minifier dropping an unreferenced constant, so the release
// sentinel grep (see PROGRESS.md verification step) actually covers every
// dev module, not just DevPanel.
export const SENTINEL = 'DEV_HARNESS_SENTINEL_DO_NOT_SHIP';
