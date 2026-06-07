// __tests__/scripts/bumpVersion.test.js
const { bumpConfigText } = require('../../scripts/bumpVersionCore');

const SAMPLE = [
  "module.exports = {",
  "  expo: {",
  "    version: '1.0.0',",
  "    android: {",
  "      package: 'app.dailyrituals.mobile',",
  "      versionCode: 5,",
  "    },",
  "  },",
  "};",
  "",
].join('\n');

describe('bumpConfigText', () => {
  test("build mode bumps versionCode only", () => {
    const out = bumpConfigText(SAMPLE, 'build');
    expect(out).toContain('versionCode: 6');
    expect(out).toContain("version: '1.0.0'"); // unchanged
  });

  test("native mode bumps versionCode AND version patch", () => {
    const out = bumpConfigText(SAMPLE, 'native');
    expect(out).toContain('versionCode: 6');
    expect(out).toContain("version: '1.0.1'");
  });

  test("preserves the rest of the file verbatim", () => {
    const out = bumpConfigText(SAMPLE, 'build');
    expect(out).toContain("package: 'app.dailyrituals.mobile'");
    expect(out).toContain('module.exports = {');
  });

  test("throws on unknown mode", () => {
    expect(() => bumpConfigText(SAMPLE, 'wat')).toThrow(/mode/i);
  });

  test("throws when versionCode is missing", () => {
    expect(() => bumpConfigText("module.exports = {};", 'build')).toThrow(/versionCode/i);
  });

  test("throws on native when semver version is missing", () => {
    const noVer = "module.exports = { expo: { android: { versionCode: 5 } } };";
    expect(() => bumpConfigText(noVer, 'native')).toThrow(/version/i);
  });
});
