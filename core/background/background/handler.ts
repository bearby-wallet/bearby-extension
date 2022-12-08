import type { BackgroundState } from "./state";

import { MTypePopup, MTypeTab } from "config/stream-keys";
import { Runtime } from "lib/runtime";
import { BackgroundWallet } from "./wallet";
import { BackgroundNetwork } from './network';
import { BackgroundSettings } from "./settings";
import { BackgroundContacts } from "./contacts";
import { BackgroundTransaction } from "./transaction";
import { BackgroundConnection } from './connections';


export function startBackground(core: BackgroundState) {
  const wallet = new BackgroundWallet(core);
  const network = new BackgroundNetwork(core);
  const settings = new BackgroundSettings(core);
  const contacts = new BackgroundContacts(core);
  const transaction = new BackgroundTransaction(core);
  const connections = new BackgroundConnection(core);

  Runtime.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (sender.id !== Runtime.runtime.id) {
      sendResponse(null);
      return true;
    }

    switch (msg.type) {
      case MTypeTab.GET_DATA:
        connections.resolveContentData(msg.payload.domain, sendResponse);
        return true;
      case MTypeTab.CONNECT_APP:
        connections.addConnectAppConfirm(msg.payload, sendResponse);
        return true;
      case MTypeTab.TX_TO_SEND:
        transaction.addToConfirm(msg.payload, sendResponse);
        return true;
      case MTypeTab.SIGN_MESSAGE:
        transaction.addSignMessage(msg.payload, sendResponse);
        return true;

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
      case MTypePopup.WALET_PASSWORD_CHANGE:
        wallet.changePassword(msg.payload, sendResponse);
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
      case MTypePopup.SET_ACCOUNT_NAME:
        wallet.updateAccountName(msg.payload.name, msg.payload.index, sendResponse);
        return true;
      case MTypePopup.IMPORT_TRACK_ACCOUNT:
        wallet.importTrackAccount(msg.payload.base58, msg.payload.name, sendResponse);
        return true;
      case MTypePopup.RESTORE_KEY:
        wallet.restoreKey(msg.payload, sendResponse);
        return true;
      case MTypePopup.EXPORT_KEY:
        wallet.exportPrivateKey(msg.payload.password, sendResponse);
        return true;
      case MTypePopup.EXPORT_SECRET_WORDS:
        wallet.exportSecretWords(msg.payload.password, sendResponse);
        return true;

      case MTypePopup.SELECT_NETWORK:
        network.selectNetwork(msg.payload.net, sendResponse);
        return true;
      case MTypePopup.SORT_NODES:
        network.sortNodes(msg.payload.node, sendResponse);
        return true;
      case MTypePopup.REMOVE_NODES:
        network.removeNode(msg.payload.node, sendResponse);
        return true;
      case MTypePopup.GET_NETWORK_CONFIG:
        network.getNetwrokConfig(sendResponse);
        return true;
      case MTypePopup.RESET_NETWORK_CONFIG:
        network.resetConfig(sendResponse);
        return true;
      case MTypePopup.ADD_NODE:
        network.addNode(msg.payload.node, sendResponse);
        return true;

      case MTypePopup.SET_DOWNGRADE_NODE:
        settings.setNodeDowngrade(msg.payload.flag, sendResponse);
        return true;
      case MTypePopup.SET_PERIOD:
        settings.setPeriodOffest(msg.payload.period, sendResponse);
        return true;
      case MTypePopup.SET_CURRENCY:
        settings.setCurrency(msg.payload.currency, sendResponse);
        return true;
      case MTypePopup.SET_THEME:
        settings.setTheme(msg.payload.theme, sendResponse);
        return true;
      case MTypePopup.SET_LOCALE:
        settings.setLocale(msg.payload.locale, sendResponse);
        return true;
      case MTypePopup.SET_PHISHING:
        settings.setPthishing(sendResponse);
        return true;
      case MTypePopup.SET_GAS_CONFIG:
        settings.setGasConfig(msg.payload.config, sendResponse);
        return true;
      case MTypePopup.SET_LOCK_TIMER:
        settings.setLogOutTimer(msg.payload.timer, sendResponse);
        return true;
      case MTypePopup.TOGGLE_POPUP_ENABLED:
        settings.togglePopupEnabled(sendResponse);
        return true;
      case MTypePopup.TOGGLE_FORMAT_ENABLED:
        settings.toggleFormatEnabled(sendResponse);
        return true;

      case MTypePopup.ADD_CONTACT:
        contacts.addContact(msg.payload.contact, sendResponse);
        return true;
      case MTypePopup.GET_CONTACTS:
        contacts.getContacts(sendResponse);
        return true;
      case MTypePopup.REMOVE_CONTACT:
        contacts.removeContact(msg.payload.index, sendResponse);
        return true;

      case MTypePopup.GET_CONNECTIONS:
        connections.getConnections(sendResponse);
        return true;
      case MTypePopup.REMOVE_CONNECTION:
        connections.removeConnections(msg.payload.index, sendResponse);
        return true;
      case MTypePopup.APPROVE_CONNECTION:
        connections.approveConnections(msg.payload.index, sendResponse);
        return true;
      case MTypePopup.REJECT_CONNECTION:
        connections.rejectConnections(msg.payload.index, sendResponse);
        return true;

      case MTypePopup.GET_TX_HISTORY:
        transaction.getTransactionHistory(sendResponse);
        return true;
      case MTypePopup.ADD_TX_FOR_CONFIRM:
        transaction.addToConfirm(msg.payload.transaction, sendResponse);
        return true;
      case MTypePopup.REJECT_TX_FOR_CONFIRM:
        transaction.removeConfirmTx(msg.payload.index, sendResponse);
        return true;
      case MTypePopup.SIGN_AND_SEND_TX:
        transaction.signAndSendTx(msg.payload.index, sendResponse);
        return true;

      case MTypePopup.APPROVE_MESSAGE:
        transaction.approveMessage(sendResponse);
        return true;
      case MTypePopup.REJECT_MESSAGE:
        transaction.rejectMessage(sendResponse);
        return true;

      case MTypePopup.CLEAR_ALL_HISTORY:
        transaction.clearAllHistory(sendResponse);
        return true;
      case MTypePopup.UPDATE_TX_FOR_CONFIRM:
        transaction.updateConfirmTx(
          msg.payload.transaction,
          msg.payload.index,
          sendResponse
        );
        return true;
      default:
        sendResponse({
          reject: 'unexpected method'
        });
        return true;
    }
  });
}
