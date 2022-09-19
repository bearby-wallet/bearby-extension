import type { BackgroundState } from "./state";

import { MTypePopup } from "config/stream-keys";
import { Runtime } from "lib/runtime";
import { BackgroundWallet } from "./wallet";
import { BackgroundNetwork } from './network';


export function startBackground(core: BackgroundState) {
  const wallet = new BackgroundWallet(core);
  const network = new BackgroundNetwork(core);

  Runtime.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (sender.id !== Runtime.runtime.id) {
      sendResponse(null);
      return true;
    }

    switch (msg.type) {
      case MTypePopup.GET_LATEST_BLOCK:
        return true;
      case MTypePopup.GET_WALLET_STATE:
        wallet.getState(sendResponse);
        return true;
      case MTypePopup.GET_RANDOM_WORDS:
        wallet.randomWords(msg.payload.length, sendResponse);
        return true;
      case MTypePopup.CREATE_WALLET:
        wallet.initSeedWallet(msg.payload, sendResponse);
        return true;
      case MTypePopup.UNLOCK_WALLET:
        wallet.unlock(msg.payload.password, sendResponse);
        return true;
      case MTypePopup.WALET_LOGOUT:
        wallet.logout(sendResponse);
        return true;
      case MTypePopup.BALANCE_UPDATE:
        wallet.balanceUpdate(sendResponse);
        return true;
      case MTypePopup.REMOVE_ACCOUNT:
        wallet.removeAccount(sendResponse);
        return true;
      case MTypePopup.SELECT_ACCOUNT:
        wallet.selectAccount(msg.payload.index, sendResponse);
        return true;
      case MTypePopup.ADD_ACCOUNT:
        wallet.createAccountFromSeed(msg.payload.name, sendResponse);
        return true;
      case MTypePopup.RESTORE_KEY:
        wallet.restoreKey(msg.payload, sendResponse);
        return true;

      case MTypePopup.SELECT_NETWORK:
        network.selectNetwork(msg.payload.net, sendResponse);
        return true;
      case MTypePopup.GET_NETWORK_CONFIG:
        network.getNetwrokConfig(sendResponse);
        return true;
      case MTypePopup.SET_COUNT:
        network.upadteCount(msg.payload.count, sendResponse);
        return true;
      default:
        sendResponse({
          reject: 'unexpected method'
        });
        return true;
    }
  });
}
