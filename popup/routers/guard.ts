import { get } from 'svelte/store';
import { push } from 'svelte-spa-router';

import guardStore from 'popup/store/guard';
import confirmStore from 'app/store/confirm';


export const routerGuard = () => {
  const guard = get(guardStore);
  const confirm = get(confirmStore);

  if (!guard.isReady) {
    push('/start');
  }

  if (guard.isReady && !guard.isEnable) {
    push('/lock');
  }

  if (confirm.length > 0) {
    push('/confirm');
  }

  return guard.isEnable && guard.isReady;
};
