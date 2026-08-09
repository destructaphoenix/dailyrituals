import {
  FREE_RESTORES,
  freeRestoresLeft,
  restoreAccess,
  consumeFreeRestore,
} from '../../src/entries/restoreAllowance';

describe('freeRestoresLeft', () => {
  it('starts at the full allowance', () => {
    expect(FREE_RESTORES).toBe(3);
    expect(freeRestoresLeft(0)).toBe(3);
  });

  it('counts down one per used restore', () => {
    expect(freeRestoresLeft(1)).toBe(2);
    expect(freeRestoresLeft(2)).toBe(1);
    expect(freeRestoresLeft(3)).toBe(0);
  });

  it('never goes negative, however corrupt the stored count', () => {
    expect(freeRestoresLeft(9)).toBe(0);
    expect(freeRestoresLeft(Number.MAX_SAFE_INTEGER)).toBe(0);
  });

  it('treats a missing or non-numeric count as none used', () => {
    expect(freeRestoresLeft(undefined)).toBe(3);
    expect(freeRestoresLeft(null)).toBe(3);
    expect(freeRestoresLeft('2')).toBe(3);
    expect(freeRestoresLeft(NaN)).toBe(3);
    expect(freeRestoresLeft(-4)).toBe(3);
  });
});

describe('restoreAccess', () => {
  it('gives a Plus subscriber unlimited restores', () => {
    expect(restoreAccess({ used: 0, plus: true, plusEnabled: true }))
      .toEqual({ kind: 'plus', left: 3 });
    expect(restoreAccess({ used: 3, plus: true, plusEnabled: true }))
      .toEqual({ kind: 'plus', left: 0 });
  });

  it('allows a free restore while any of the three remain', () => {
    expect(restoreAccess({ used: 0, plus: false, plusEnabled: true }))
      .toEqual({ kind: 'free', left: 3 });
    expect(restoreAccess({ used: 2, plus: false, plusEnabled: true }))
      .toEqual({ kind: 'free', left: 1 });
  });

  it('locks to Plus once the three are spent', () => {
    expect(restoreAccess({ used: 3, plus: false, plusEnabled: true }))
      .toEqual({ kind: 'locked', left: 0 });
  });

  it('reports Plus as not yet purchasable when the paid surface is off', () => {
    expect(restoreAccess({ used: 3, plus: false, plusEnabled: false }))
      .toEqual({ kind: 'unavailable', left: 0 });
  });

  it('still spends the free three while the paid surface is off', () => {
    // The allowance is enforced identically either way — what ships today is
    // what ships after PLUS_ENABLED flips, so the "3 free" promise is never
    // quietly worth more than it says.
    expect(restoreAccess({ used: 0, plus: false, plusEnabled: false }))
      .toEqual({ kind: 'free', left: 3 });
    expect(restoreAccess({ used: 2, plus: false, plusEnabled: false }))
      .toEqual({ kind: 'free', left: 1 });
  });

  it('tolerates an absent argument object', () => {
    expect(restoreAccess()).toEqual({ kind: 'free', left: 3 });
    expect(restoreAccess({})).toEqual({ kind: 'free', left: 3 });
  });
});

describe('consumeFreeRestore', () => {
  it('spends one of the free three', () => {
    expect(consumeFreeRestore(0, false)).toBe(1);
    expect(consumeFreeRestore(2, false)).toBe(3);
  });

  it('never charges a Plus subscriber against the free allowance', () => {
    expect(consumeFreeRestore(0, true)).toBe(0);
    expect(consumeFreeRestore(1, true)).toBe(1);
  });

  it('clamps at the allowance so the stored count can never run away', () => {
    expect(consumeFreeRestore(3, false)).toBe(3);
    expect(consumeFreeRestore(99, false)).toBe(3);
  });

  it('normalises a missing or corrupt stored count', () => {
    expect(consumeFreeRestore(undefined, false)).toBe(1);
    expect(consumeFreeRestore(null, false)).toBe(1);
    expect(consumeFreeRestore(NaN, false)).toBe(1);
    expect(consumeFreeRestore(-2, false)).toBe(1);
  });
});
