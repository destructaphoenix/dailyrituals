// src/billing/useLivePrices.js — feeds the paywall the store's real prices.
//
// Fetches the current offering once and merges it over the PLUS_PRICES design
// constants. Until it resolves — and forever, if the store is unreachable or we
// are in Expo Go — the constants show, exactly as the paywall behaved before.
// The merge rules (what stale copy gets dropped) live in ./prices.

import { useState, useEffect } from 'react';
import { PLUS_PRICES } from '../data';
import { mergePrices } from './prices';

export function useLivePrices(service, fallback = PLUS_PRICES) {
  const [prices, setPrices] = useState(() => mergePrices(fallback, null));

  useEffect(() => {
    if (!service || typeof service.getPrices !== 'function') return undefined;
    let alive = true;
    service
      .getPrices()
      .then((live) => { if (alive) setPrices(mergePrices(fallback, live)); })
      .catch(() => { /* keep the fallback constants — never blank the paywall */ });
    return () => { alive = false; };
  }, [service, fallback]);

  return prices;
}
