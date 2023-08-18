import { get } from 'svelte/store';
import { push } from 'svelte-spa-router';

import guardStore from 'popup/store/guard';
import confirmStore from 'app/store/confirm';
import connectAppStore from 'popup/store/confirm-apps';
import messageStore from 'popup/store/message';
import reqPubKey from 'app/store/req-pub-key';


export const routerGuard = () => {
  const guard = get(guardStore);
  const confirm = get(confirmStore);
  const appsConnect = get(connectAppStore);
  const reqPubKeyState = get(reqPubKey);
  const message = get(messageStore);

  if (!guard.isReady) {
    push('/start');

    return guard.isEnable && guard.isReady;
  }

  if (guard.isReady && !guard.isEnable) {
    push('/lock');

    return guard.isEnable && guard.isReady;
  }

  if (appsConnect.length > 0) {
    push('/connect');

    return guard.isEnable && guard.isReady;
  }

  if (confirm.length > 0) {
    push('/confirm');

    return guard.isEnable && guard.isReady;
  }

  if (message) {
    push('/sign-message');

    return guard.isEnable && guard.isReady;
  }

  if (reqPubKeyState) {
    push('/req-pubkey');

    return guard.isEnable && guard.isReady;
  }

  return guard.isEnable && guard.isReady;
};
