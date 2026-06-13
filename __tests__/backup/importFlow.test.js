import { runConfirmedImport } from '../../src/backup/importFlow';

describe('runConfirmedImport', () => {
  test('writes the recovery copy BEFORE replacing data', async () => {
    const calls = [];
    const writeRecovery = jest.fn(async () => { calls.push('recovery'); });
    const replaceAll = jest.fn(async () => { calls.push('replace'); });

    await runConfirmedImport({
      currentEnvelopeText: '{"recovery":true}',
      restoredState: { streak: 9 },
      writeRecovery,
      replaceAll,
    });

    expect(calls).toEqual(['recovery', 'replace']); // order matters
    expect(writeRecovery).toHaveBeenCalledWith('{"recovery":true}');
    expect(replaceAll).toHaveBeenCalledWith({ streak: 9 });
  });

  test('does NOT replace if the recovery write throws', async () => {
    const replaceAll = jest.fn();
    const writeRecovery = jest.fn(async () => { throw new Error('disk full'); });

    await expect(runConfirmedImport({
      currentEnvelopeText: 'x', restoredState: {}, writeRecovery, replaceAll,
    })).rejects.toThrow('disk full');

    expect(replaceAll).not.toHaveBeenCalled(); // data was never destroyed
  });
});
