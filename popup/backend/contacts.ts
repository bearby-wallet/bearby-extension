import type { Contact, SendResponseParams, WalletState } from "types";

import { MTypePopup } from "config/stream-keys";
import { Message } from "lib/stream/message";
import { warpMessage } from "lib/stream/warp-message";
import { updateState } from "./store-update";
import contactsStore from "app/store/contacts";

export async function getContacts() {
  const data = await Message.signal(MTypePopup.GET_CONTACTS).send();
  const resolve = warpMessage(data);
  contactsStore.set(resolve as Contact[]);
  return resolve;
}

export async function addContact(contact: Contact) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.ADD_CONTACT,
    payload: {
      contact,
    },
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}

export async function removeContact(index: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.REMOVE_CONTACT,
    payload: {
      index,
    },
  }).send();
  const resolve = warpMessage(data);
  updateState(resolve as WalletState);
  return resolve;
}
