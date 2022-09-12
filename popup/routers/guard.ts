import { get } from 'svelte/store';
import { push } from 'svelte-spa-router';

import guardStore from 'popup/store/guard';


export const routerGuard = (e: any) => {
  const guard = get(guardStore);

  console.log(e);

  if (!guard.isReady) {
    push('/start');
  }

  if (guard.isReady && !guard.isEnable) {
    push('/lock');
  }

  return guard.isEnable && guard.isReady;
};
