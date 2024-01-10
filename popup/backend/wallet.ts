import type { ShaAlgorithms } from "config/sha-algorithms";
import type { SendResponseParams, SetPasswordPayload, WalletState } from "types";

import { MTypePopup } from "config/stream-keys";
import { Message } from "lib/stream/message";
import { warpMessage } from "lib/stream/warp-message";
import { updateState } from "./store-update";


export async function getRandomWords(n: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.GET_RANDOM_WORDS,
    payload: {
      length: n
    }
  }).send();
  return warpMessage(data) as string[];
}

export async function createWallet(words: string, password: string, name: string, algorithm: ShaAlgorithms, iteractions: number) {
  let k = 0;
  // TODO: dump manifest v3
  while (k < 10) {
    try {
      const data = await new Message<SendResponseParams>({
        type: MTypePopup.CREATE_WALLET,
        payload: {
          words,
          name,
          password,
          algorithm,
          iteractions
        }
      }).send();
      const resolve = warpMessage(data);
      updateState(resolve as WalletState);
      return resolve;
    } catch {
      k++;
    }
  }

  throw new Error("Try again");
}

export async function checBip39Word(words: string[]) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.BIP39_WORD_CHECK,
    payload: {
      words
    }
  }).send();
  const resolve = warpMessage(data);
  return resolve as boolean[];
}

export async function changePassword(payload: SetPasswordPayload) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.WALET_PASSWORD_CHANGE,
    payload
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function getWalletState() {
  let k = 0;
  // TODO: DUMP HACK FOR DUMP manifest v3.
  while (true) {
    try {
      const data = await Message
        .signal(MTypePopup.GET_WALLET_STATE)
        .send();
      const resolve = warpMessage(data) as WalletState;
      updateState(resolve);
      return resolve;
    } catch {
      if (k > 1000) break;
    }
    k++;
  }
}

export async function unlockWallet(password: string) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.UNLOCK_WALLET,
    payload: {
      password
    }
  }).send();
  const resolve = warpMessage(data) as WalletState;
  updateState(resolve);
  return resolve;
}

export async function logout() {
  const data = await Message
    .signal(MTypePopup.WALET_LOGOUT)
    .send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function balanceUpdate() {
  const data = await Message
    .signal(MTypePopup.BALANCE_UPDATE)
    .send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function removeAccount() {
  const data = await Message
    .signal(MTypePopup.REMOVE_ACCOUNT)
    .send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function selectAccount(index: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.SELECT_ACCOUNT,
    payload: {
      index
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function createNextSeedAccount(name: string) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.ADD_ACCOUNT,
    payload: {
      name
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function restoreSecretKey(key: string, name: string) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.RESTORE_KEY,
    payload: {
      name,
      key
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function changeAccountName(name: string, index: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.SET_ACCOUNT_NAME,
    payload: {
      name,
      index
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function importAccountTracker(base58: string, name: string) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.IMPORT_TRACK_ACCOUNT,
    payload: {
      name,
      base58
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function exportPrivateKey(password: string) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.EXPORT_KEY,
    payload: {
      password
    }
  }).send();
  return warpMessage(data) as {
    privKey: string;
    base58: string;
    pubKey: string;
  };
}

export async function exportSecrePhrase(password: string) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.EXPORT_SECRET_WORDS,
    payload: {
      password
    }
  }).send();
  return String(warpMessage(data));
}
