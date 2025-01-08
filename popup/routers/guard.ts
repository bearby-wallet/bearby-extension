import { get } from "svelte/store";
import { goto } from "@mateothegreat/svelte5-router";
import type { Route } from "@mateothegreat/svelte5-router";

import guardStore from "popup/store/guard";
import confirmStore from "app/store/confirm";
import connectAppStore from "popup/store/confirm-apps";
import messageStore from "popup/store/message";
import reqPubKey from "app/store/req-pub-key";


import StartPage from '../pages/Start.svelte';
import LockPage from '../pages/Lock.svelte';
import ConnectPage from '../pages/Connect.svelte';
import PopupPage from '../pages/Popup.svelte';
import SignMessagePage from '../pages/SignMessage.svelte';
import PubKeyRequestPage from '../pages/PubKeyRequest.svelte';

export const routerGuard = async (route: Route): Promise<Route> => {
  const guard = get(guardStore);
  const confirm = get(confirmStore);
  const appsConnect = get(connectAppStore);
  const reqPubKeyState = get(reqPubKey);
  const message = get(messageStore);

  if (!guard.isReady) {
    goto("start");
    return {
      path: "start",
      component: StartPage
    };
  }

  if (guard.isReady && !guard.isEnable) {
    goto("lock");
    return {
      path: "lock",
      component: LockPage
    };
  }

  if (appsConnect.length > 0) {
    goto("connect");
    return {
      path: "connect",
      component: ConnectPage
    };
  }

  if (confirm.length > 0) {
    goto("confirm");
    return {
      path: "confirm",
      component: PopupPage
    };
  }

  if (message) {
    goto("sign-message");
    return {
      path: "sign-message",
      component: SignMessagePage
    };
  }

  if (reqPubKeyState) {
    goto("req-pubkey");
    return {
      path: "req-pubkey",
      component: PubKeyRequestPage
    };
  }

  return route;
};
