import type { GasState } from 'types';

import { writable } from 'svelte/store';
import { GAS_LIMIT, MULTIPLIER } from 'config/gas';


export default writable<GasState>({
  gasLimit: GAS_LIMIT,
  multiplier: MULTIPLIER,
});
