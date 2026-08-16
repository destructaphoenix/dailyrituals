// Config for the timezone-pinned tests in __tests__/zone/ ONLY.
//
// Those tests need the process to start in a specific timezone, because Jest
// cannot change the zone from inside a test — each test file gets a COPY of
// process.env, so `process.env.TZ = ...` is inert. `npm run test:zone` sets TZ
// on the command line and runs this config twice, once at UTC+14 and once at
// UTC-11, so both signs of offset are covered.
//
// The main suite (package.json → "jest") ignores /__tests__/zone/ so it keeps
// running at whatever zone the machine is in. That is the point: CI runs UTC and
// genuinely exercises UTC for the other ~860 tests, instead of being pinned to
// reproduce the author's laptop.
//
// This exists as a file rather than CLI flags because `--testPathIgnorePatterns`
// is variadic and silently swallows a following path argument — which inverted
// the selection and ran the whole suite while skipping the zone tests.

const base = require('./package.json').jest;

module.exports = {
  ...base,
  // Same ignores as the main suite, minus the zone exclusion — this run is the
  // one that wants those tests.
  testPathIgnorePatterns: base.testPathIgnorePatterns.filter((p) => p !== '/__tests__/zone/'),
  testMatch: ['<rootDir>/__tests__/zone/**/*.test.js'],
};
