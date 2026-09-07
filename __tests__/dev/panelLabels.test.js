// IMP-097 — the dev harness must not tell a walker something the build
// contradicts. LaunchSection's heading and file header both said PLUS_ENABLED
// was false; it has been true since 7d2e515 (2026-09-05), so the panel was
// stating the opposite of what the build does.
//
// This is the ONE guard the suite keeps on the harness's wording. Everything
// else in src/dev is a dev-only surface and the test suite deliberately does
// not depend on how it is phrased.
import fs from 'fs';
import path from 'path';

const DEV_DIR = path.join(__dirname, '../../src/dev');

function devSources(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) return devSources(full);
    return d.isFile() && d.name.endsWith('.js') ? [full] : [];
  });
}

describe('the dev harness never asserts a value for PLUS_ENABLED', () => {
  const files = devSources(DEV_DIR);

  test('there are dev sources to check', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  test.each(files.map((f) => [path.relative(DEV_DIR, f), f]))('%s', (_rel, file) => {
    const src = fs.readFileSync(file, 'utf8');
    // "PLUS_ENABLED stays false", "PLUS_ENABLED is true", "PLUS_ENABLED = false" …
    expect(src).not.toMatch(/PLUS_ENABLED\s*(?:stays|is|remains|===?)?\s*(?:false|true|off|on)\b/i);
    // …and the same claim made without naming the flag.
    expect(src).not.toMatch(/(?:app|it)\s+ships\s+free/i);
  });
});
