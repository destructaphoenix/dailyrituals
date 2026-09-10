// src/billing/emberGrants.js — IMP-113. Pure over a transaction list; no
// React, no persistence.
//
// `nonSubscriptionTransactions` (from RevenueCat's CustomerInfo) is a HISTORY,
// not a balance — it lists every ember pack this account has ever bought,
// forever. Granting from it naively would re-grant on every relaunch; the
// caller keeps a local ledger of `transactionIdentifier`s already turned into
// embers (`applied`) and this returns only what is still owed against it,
// plus the ids to add to that ledger.
//
// This is also what makes the grant self-healing: a purchase that resolves
// while the app is being killed never runs the grant, but the transaction is
// still in the next customerInfo's history and not yet in `applied`, so the
// very next launch catches it.
export function pendingEmberGrants(transactions, applied, packsById) {
  const list = Array.isArray(transactions) ? transactions : [];
  const seen = new Set(Array.isArray(applied) ? applied : []);
  let amount = 0;
  const grantedIds = [];
  list.forEach((tx) => {
    const id = tx && tx.transactionIdentifier;
    if (!id || seen.has(id)) return;
    const pack = packsById[tx.productIdentifier];
    if (!pack) return;
    amount += pack.amount;
    grantedIds.push(id);
    seen.add(id); // guards the same transaction appearing twice in one list
  });
  return { amount, grantedIds };
}
