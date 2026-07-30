import { planPatch, BUGGY, FIXED } from '../../scripts/patch-permissions';

const wrap = (line) => `class PermissionsService {\n  fun x(): Boolean {\n    ${line}\n  }\n}\n`;

describe('postinstall permissions patch (IMP-027)', () => {
  it('rewrites the force-unwrapped line when upstream still has the bug', () => {
    const { outcome, contents } = planPatch(wrap(BUGGY));
    expect(outcome).toBe('patched');
    expect(contents).toContain(FIXED);
    expect(contents).not.toContain(BUGGY);
  });

  it('is idempotent — an already-patched tree is a success, not a failure', () => {
    const { outcome, contents } = planPatch(wrap(FIXED));
    expect(outcome).toBe('already-patched');
    expect(contents).toBeNull();
  });

  it('reports target-missing so the patch can never no-op silently', () => {
    // The old inline postinstall wrapped everything in `try/catch{}`, so an
    // upstream rewrite of this file silently shipped an unpatched crash.
    const { outcome, contents } = planPatch(wrap('return somethingEntirelyDifferent()'));
    expect(outcome).toBe('target-missing');
    expect(contents).toBeNull();
  });
});
