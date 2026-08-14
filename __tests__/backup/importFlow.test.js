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

  test('onImported runs after replaceAll (IMP-062)', async () => {
    const calls = [];
    const writeRecovery = jest.fn(async () => { calls.push('recovery'); });
    const replaceAll = jest.fn(async () => { calls.push('replace'); });
    const onImported = jest.fn(async () => { calls.push('imported'); });

    await runConfirmedImport({
      currentEnvelopeText: 'x', restoredState: {}, writeRecovery, replaceAll, onImported,
    });

    expect(calls).toEqual(['recovery', 'replace', 'imported']); // order matters, not just count
  });

  test('onImported does not run when writeRecovery throws', async () => {
    const writeRecovery = jest.fn(async () => { throw new Error('disk full'); });
    const replaceAll = jest.fn();
    const onImported = jest.fn();

    await expect(runConfirmedImport({
      currentEnvelopeText: 'x', restoredState: {}, writeRecovery, replaceAll, onImported,
    })).rejects.toThrow('disk full');

    expect(onImported).not.toHaveBeenCalled();
  });

  test('onImported does not run when replaceAll throws', async () => {
    const writeRecovery = jest.fn();
    const replaceAll = jest.fn(async () => { throw new Error('write failed'); });
    const onImported = jest.fn();

    await expect(runConfirmedImport({
      currentEnvelopeText: 'x', restoredState: {}, writeRecovery, replaceAll, onImported,
    })).rejects.toThrow('write failed');

    expect(onImported).not.toHaveBeenCalled();
  });

  test('an onImported that throws does NOT reject runConfirmedImport — the import already succeeded', async () => {
    const writeRecovery = jest.fn();
    const replaceAll = jest.fn();
    const onImported = jest.fn(async () => { throw new Error('stash clear failed'); });

    await expect(runConfirmedImport({
      currentEnvelopeText: 'x', restoredState: {}, writeRecovery, replaceAll, onImported,
    })).resolves.toBeUndefined();

    expect(replaceAll).toHaveBeenCalled();
  });
});
