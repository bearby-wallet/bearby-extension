import { get } from 'svelte/store';
import Big from 'big.js';

import settingsStore from 'popup/store/settings';

Big.PE = 99;

export function formatNumber(balance: number | string | Big, currency?: string) {
  const { format } = get(settingsStore);

  if (String(balance).length <= 10) {
    return `${currency || ''} ${Number(balance)}`;
  }

  const locale = 'en';// navigator.language;
  let opt: Intl.NumberFormatOptions = {
    style: undefined,
    currency: undefined,
    maximumSignificantDigits: 5,
    notation: "compact"
  };

  if (currency) {
    opt.style = 'currency';
    opt.currency = currency;
  }

  try {
    return new Intl
      .NumberFormat(locale, opt)
      .format(Number(balance));
  } catch {
    opt.style = undefined;
    opt.currency = undefined;

    const n = new Intl
      .NumberFormat(locale, opt)
      .format(Number(balance));
    return `${currency} ${n}`;
  }
}

export function toMass(value: string | Big, decimals: number): Big {
  const _decimals = Big(10).pow(decimals);
  const _balance = Big(value);

  return _balance.div(_decimals);
}

export function toKG(value: number) {
  return formatNumber(value / 10e4, 'KG');
}
