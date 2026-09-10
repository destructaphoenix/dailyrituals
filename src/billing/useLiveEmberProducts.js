// src/billing/useLiveEmberProducts.js — feeds the Get Embers surfaces the
// store's real prices and the raw StoreProduct objects a purchase needs.
// Same fetch-once-and-merge pattern as useLivePrices: until the fetch
// resolves — and forever, if the store is unreachable or we are in Expo Go —
// the EMBER_PACKS design constants show, exactly as before.
import { useState, useEffect } from 'react';
import { EMBER_PACKS } from '../data';
import { mergeEmberPrices } from './prices';

export function useLiveEmberProducts(service, fallback = EMBER_PACKS) {
  const [packs, setPacks] = useState(fallback);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!service || typeof service.getEmberProducts !== 'function') return undefined;
    let alive = true;
    service
      .getEmberProducts()
      .then((live) => {
        if (!alive) return;
        setProducts(live);
        setPacks(mergeEmberPrices(fallback, live));
      })
      .catch(() => { /* keep the fallback constants — never blank the sheet */ });
    return () => { alive = false; };
  }, [service, fallback]);

  return { packs, products };
}
