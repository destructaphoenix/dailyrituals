// src/billing/mapError.js — pure mapping from a RevenueCat purchase error to one
// of the overlay's RESULT_META kinds. RevenueCat surfaces both a boolean
// `userCancelled` and a string `code` (PurchasesErrorCode); we handle both.
export function mapPurchaseError(e) {
  if (!e) return 'failed';
  if (e.userCancelled === true) return 'cancel';
  const code = String(e.code || '').toUpperCase();
  if (code.includes('CANCEL')) return 'cancel';
  if (code.includes('NETWORK') || code.includes('OFFLINE')) return 'network';
  if (code.includes('ALREADY_PURCHASED') || code.includes('ALREADY_IN_USE')) return 'owned';
  return 'failed';
}
