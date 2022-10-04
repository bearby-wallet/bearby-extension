import type { GasState } from 'types';

import { writable } from 'svelte/store';


export default writable<GasState>({
  gasLimit: 1,
  multiplier: 1
});
