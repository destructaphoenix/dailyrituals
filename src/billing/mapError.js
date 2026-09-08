// src/billing/mapError.js — pure mapping from a RevenueCat purchase error to one
// of the overlay's RESULT_META kinds. RevenueCat surfaces both a boolean
// `userCancelled` and a string `code`, but on Android that `code` is the
// STRINGIFIED NUMERIC PurchasesErrorCode, not its name — the bridge rejects
// with `getCode() + ""` (RNPurchasesModule.java:708). Hard-coded here (not
// imported from `PURCHASES_ERROR_CODE`) because `react-native-purchases`
// pulls an untransformable ESM dependency this module must stay loadable
// without in jest.
const RC_CODE = {
  '1': 'cancel', // PURCHASE_CANCELLED_ERROR
  '10': 'network', // NETWORK_ERROR
  '35': 'network', // OFFLINE_CONNECTION_ERROR
  '6': 'owned', // PRODUCT_ALREADY_PURCHASED_ERROR
  '7': 'owned', // RECEIPT_ALREADY_IN_USE_ERROR
  '20': 'deferred', // PAYMENT_PENDING_ERROR
};

export function mapPurchaseError(e) {
  if (!e) return 'failed';
  if (e.userCancelled === true) return 'cancel';
  const raw = String(e.code || '');
  if (RC_CODE[raw]) return RC_CODE[raw];
  // iOS / web / simulated shapes still send names — kept as a fallback.
  const code = raw.toUpperCase();
  if (code.includes('CANCEL')) return 'cancel';
  if (code.includes('NETWORK') || code.includes('OFFLINE')) return 'network';
  if (code.includes('ALREADY_PURCHASED') || code.includes('ALREADY_IN_USE')) return 'owned';
  return 'failed';
}
