import type { ConfirmParams, HistoryTransaction, SignMessageParams } from 'types/transaction';
import type { BadgeControl } from 'background/notifications';
import type { NetworkControl } from 'core/background/network';

import { AccountController, NIL_ACCOUNT } from 'core/background/account';
import { Fields } from 'config/fields';
import { TransactionsError } from './errors';
import { MAX_TX_QUEUE } from 'config/common';
import { BrowserStorage, buildObject, StorageKeyValue } from 'lib/storage';
import { base58Decode } from 'lib/address';


export class TransactionsController {
  readonly #network: NetworkControl;
  readonly #account: AccountController;
  readonly #badge: BadgeControl;

  #history: HistoryTransaction[] = [];
  #confirm: ConfirmParams[] = [];
  #unsafeConfirm: Uint8Array = new Uint8Array();
  #message?: SignMessageParams;

  get history() {
    return this.#history;
  }

  get confirm() {
    return this.#confirm;
  }

  get unsafeConfirm() {
    return this.#unsafeConfirm;
  }

  get message() {
    return this.#message;
  }

  get #historyField() {
    if (this.#account.selectedAccount) {
      return `${Fields.TRANSACTIONS}/${this.#network.selected}/${this.#account.selectedAccount.base58}`;
    }

    throw new TransactionsError(NIL_ACCOUNT);
  }

  get #unsafeConfirmField() {
    return `${Fields.UNSAFE_CONFIRM_TRANSACTIONS}/${this.#network.selected}`;
  }

  get #confirmField() {
    return `${Fields.CONFIRM_TRANSACTIONS}/${this.#network.selected}`;
  }

  constructor(
    network: NetworkControl,
    account: AccountController,
    badge: BadgeControl
  ) {
    this.#network = network;
    this.#account = account;
    this.#badge = badge;
  }

  async addHistory(tx: HistoryTransaction) {
    const newList = [tx, ...this.history];

    // Circumcision Array.
    newList.length = MAX_TX_QUEUE;

    this.#history = newList.filter(Boolean);

    await BrowserStorage.set(
      buildObject(this.#historyField, this.history)
    );
  }

  async updateHistory(history: HistoryTransaction[]) {
    this.#history = history;
    await BrowserStorage.set(
      buildObject(this.#historyField, this.history)
    );
  }

  async clearHistory() {
    this.#history = [];
    await BrowserStorage.set(
      buildObject(this.#historyField, this.history)
    );
  }

  async clearConfirm() {
    this.#badge.decrease(this.confirm.length);
    this.#confirm = [];

    await BrowserStorage.set(
      buildObject(this.#confirmField, this.confirm)
    );
  }

  async addUnsafeConfirm(params: Uint8Array) {
    this.#unsafeConfirm = params;
    this.#badge.increase();
    await BrowserStorage.set(
      buildObject(this.#confirmField, this.confirm)
    );
  }

  async addConfirm(params: ConfirmParams) {
    this.#confirm.push(params);
    this.#badge.increase();
    await BrowserStorage.set(
      buildObject(this.#confirmField, this.confirm)
    );
  }

  async addMessage(message: SignMessageParams) {
    this.#message = message;
    this.#badge.increase();
    await BrowserStorage.set(
      buildObject(Fields.CONFIRM_SIGN_MESSAGE, message)
    );
  }

  async removeMessage() {
    this.#message = undefined;
    this.#badge.decrease();
    await BrowserStorage.rm(Fields.CONFIRM_SIGN_MESSAGE);
  }

  async rmConfirm(index: number) {
    delete this.#confirm[index];

    this.#confirm = this.#confirm.filter(Boolean);
    this.#badge.decrease();

    await BrowserStorage.set(
      buildObject(this.#confirmField, this.confirm)
    );
  }

  async updateConfirm(txns: ConfirmParams[]) {
    this.#confirm = txns;

    await BrowserStorage.set(
      buildObject(this.#confirmField, this.confirm)
    );
  }

  async resetNonce(nonce: number) {
    this.#history = this.history.map((t) => ({
      ...t,
      nonce
    }));

    await BrowserStorage.set(
      buildObject(this.#historyField, this.#history)
    );
  }

  async sync() {
    const data = await BrowserStorage.get(
      this.#confirmField,
      this.#unsafeConfirmField,
      this.#historyField
    ) as StorageKeyValue;

    try {
      if (data[this.#unsafeConfirmField]) {
        this.#unsafeConfirm = await base58Decode(data[this.#unsafeConfirmField]);
      }
    } catch (err) {
      this.#unsafeConfirm = new Uint8Array();
    }

    try {
      if (data[this.#confirmField]) {
        this.#confirm = JSON.parse(String(data[this.#confirmField]));
      }
    } catch (err) {
      this.#confirm = [];
    }

    try {
      if (!data[this.#historyField]) {
        throw new Error();
      }
      this.#history = JSON.parse(String(data[this.#historyField]));
    } catch (err) {
      this.#history = [];
    }
  }
}
