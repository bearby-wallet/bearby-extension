import { get } from 'svelte/store';
import { push } from 'svelte-spa-router';

import guardStore from 'popup/store/guard';


export const routerGuard = (e: { location: string; }) => {
  const guard = get(guardStore);

  if (!guard.isReady) {
    push('/start');
  }

  if (guard.isReady && !guard.isEnable) {
    push('/lock');
  }

  return guard.isEnable && guard.isReady;
};
