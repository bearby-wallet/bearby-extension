import type { GuardType } from 'types/account';

import { writable } from 'svelte/store';


export default writable<GuardType>({
  isEnable: false,
  isReady: false
});
