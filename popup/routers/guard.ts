import { get } from "svelte/store";

import guardStore from "popup/store/guard";
import confirmStore from "app/store/confirm";
import connectAppStore from "popup/store/confirm-apps";
import messageStore from "popup/store/message";
import reqPubKey from "app/store/req-pub-key";

import StartPage from "../pages/Start.svelte";
import LockPage from "../pages/Lock.svelte";
import ConnectPage from "../pages/Connect.svelte";
import PopupPage from "../pages/Popup.svelte";
import SignMessagePage from "../pages/SignMessage.svelte";
import PubKeyRequestPage from "../pages/PubKeyRequest.svelte";

import { type Route } from "./index";

export class RouteGuard {
  private static navigate(path: string) {
    window.location.hash = path;
  }

  static checkRoute(route: Route): Route {
    if (!route.isProtected) {
      return route;
    }

    const guard = get(guardStore);
    const confirm = get(confirmStore);
    const appsConnect = get(connectAppStore);
    const reqPubKeyState = get(reqPubKey);
    const message = get(messageStore);

    if (!guard.isReady) {
      this.navigate("/start");

      return { path: "/start", component: StartPage };
    }

    if (guard.isReady && !guard.isEnable) {
      this.navigate("lock");
      return {
        path: "/lock",
        component: LockPage,
      };
    }

    if (appsConnect.length > 0) {
      this.navigate("connect");
      return {
        path: "/connect",
        component: ConnectPage,
      };
    }

    if (confirm.length > 0) {
      this.navigate("confirm");
      return {
        path: "/confirm",
        component: PopupPage,
      };
    }

    if (message) {
      this.navigate("sign-message");
      return {
        path: "/sign-message",
        component: SignMessagePage,
      };
    }

    if (reqPubKeyState) {
      this.navigate("req-pubkey");
      return {
        path: "/req-pubkey",
        component: PubKeyRequestPage,
      };
    }

    return route;
  }
}
