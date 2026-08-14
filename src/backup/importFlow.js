// importFlow.js — orchestrates a *confirmed* restore. Native effects are injected
// so the safety guarantee (recovery copy first, replace second; never replace if
// the recovery write fails) is unit-testable without UI.

export async function runConfirmedImport({ currentEnvelopeText, restoredState, writeRecovery, replaceAll, onImported }) {
  await writeRecovery(currentEnvelopeText); // 1. safety copy of current data FIRST
  await replaceAll(restoredState);          // 2. only then the destructive replace
  // 3. post-success effects (IMP-062): the import has already happened, so a
  // failure here must never be reported as a failed import.
  if (onImported) { try { await onImported(); } catch (e) { console.warn('onImported failed after a successful import', e); } }
}
