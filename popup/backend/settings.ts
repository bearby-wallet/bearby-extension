import type { GasState, SendResponseParams, WalletState } from "types";

import { MTypePopup } from "config/stream-keys";
import { Message } from "lib/stream/message";
import { warpMessage } from "lib/stream/warp-message";
import { updateState } from "./store-update";


export async function setDowngradeNodeFlag(flag: boolean) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.SET_DOWNGRADE_NODE,
    payload: {
      flag
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function setCurrency(currency: string) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.SET_CURRENCY,
    payload: {
      currency
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function setTheme(theme: string) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.SET_THEME,
    payload: {
      theme
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function setLocale(locale: string) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.SET_LOCALE,
    payload: {
      locale
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function setPhishingDetection() {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.SET_PHISHING,
    payload: {}
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function setGasConfig(config: GasState) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.SET_GAS_CONFIG,
    payload: {
      config
    }
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}
