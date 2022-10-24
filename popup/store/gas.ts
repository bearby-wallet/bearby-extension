import type { GasState } from 'types';

import { writable } from 'svelte/store';
import { GAS_LIMIT, GAS_PRICE, MULTIPLIER } from 'config/gas';


export default writable<GasState>({
  gasLimit: GAS_LIMIT,
  multiplier: MULTIPLIER,
  gasPrice: GAS_PRICE
});
