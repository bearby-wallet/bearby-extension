import type {
  KeyAccountPayload,
  SetPasswordPayload,
  WordsPayloadToEncrypt
} from "types/account";
import type { StreamResponse } from "types/stream";
import type { BackgroundState } from "./state";
import type { BaseError } from "lib/error";

import { isBase58Address, pubKeyFromBytes } from "lib/address";
import { privateKeyBytesToBase58 } from "lib/validator";
import { MTypeTab } from "config/stream-keys";
import { TabsMessage } from "lib/stream/tabs-message";


export class BackgroundWallet {
  readonly #core: BackgroundState;

  #worker?: {
    unsubscribe(): void;
  };

  constructor(state: BackgroundState) {
    this.#core = state;
  }

  async randomWords(strength: number, sendResponse: StreamResponse) {
    try {
      const mnemonic = await this
        .#core
        .account
        .bip39
        .generateMnemonic(strength);

      sendResponse({
        resolve: mnemonic
      });
    } catch (err) {
      sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async initSeedWallet(payload: WordsPayloadToEncrypt, sendResponse: StreamResponse) {
    try {
      await this.#core.account.reset();
      await this.#core.tokens.reset();
      await this.#core.guard.setGuardConfig(payload.algorithm, payload.iteractions);
      await this.#core.guard.setupVault(payload.words, payload.password);
      await this.#core.account.addAccountFromSeed(this.#core.guard.seed, payload.name);

      this.#startWorker();
      this.#core.triggerAccount();
      this.#core.triggerLock();
      await this.#core.transaction.sync();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      const message = (err as BaseError).serialize ?
        (err as BaseError).serialize().message : (err as Error).message;

      return sendResponse({
        reject: {
          message: String(message)
        }
      });
    }
  }

  async changePassword(payload: SetPasswordPayload, sendResponse: StreamResponse) {
    try {
      await this.#core.guard.unlock(payload.current);
      this.#core.guard.checkSession();

      const words = await this.#core.guard.exportMnemonic(payload.current);
      const keys = this.#core.account.getImportedAccountKeys();

      await this.#core.guard.setGuardConfig(payload.algorithm, payload.iteractions);
      await this.#core.guard.setupVault(words, payload.password);
      await this.#core.account.updateImportedKeys(keys);
      this.#core.triggerAccount();
      this.#core.triggerLock();
      await this.#core.transaction.sync();
      await this.#core.guard.logout();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async unlock(password: string, sendResponse: StreamResponse) {
    try {
      await this.#core.guard.unlock(password);

      this.#startWorker();
      this.#core.triggerAccount();
      this.#core.triggerLock();
      await this.#core.transaction.sync();

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async importTrackAccount(base58: string, name: string, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      await this.#core.account.addAccountForTrack(base58, name);
      await this.#core.transaction.sync();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async removeAccount(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.account.remove(
        this.#core.account.wallet.selectedAddress
      );
      this.#core.triggerAccount();
      await this.#core.transaction.sync();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async updateAccountName(name: string, index: number, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.account.changeAccountName(index, name);

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async selectAccount(index: number, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.account.select(index);
      this.#core.triggerAccount();
      await this.#core.transaction.sync();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async createAccountFromSeed(name: string, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.account.addAccountFromSeed(
        this.#core.guard.seed,
        name
      );
      this.#core.triggerAccount();
      await this.#core.transaction.sync();

      sendResponse({
        resolve: this.#core.state
      });

      if (this.#core.netwrok.selected == "buildnet") {
        this.massaQuestAddAccount(this.#core.account.selectedAccount?.base58 || '');
      }
    } catch (err) {
      sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async restoreKey(payload: KeyAccountPayload, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.account.addAccountFromPrivateKey(
        payload.key,
        payload.name
      );
      this.#core.triggerAccount();
      await this.#core.transaction.sync();

      sendResponse({
        resolve: this.#core.state
      });

      if (this.#core.netwrok.selected == "buildnet") {
        this.massaQuestAddAccount(this.#core.account.selectedAccount?.base58 || '');
      }
    } catch (err) {
      sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async balanceUpdate(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      const balances = await this.#core.tokens.getBalances();

      await this.#core.account.updateBalance(balances);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async exportPrivateKey(password: string, sendResponse: StreamResponse) {
    try {
      this.#core.guard.unlock(password);
      this.#core.guard.checkSession();

      const pair = await this.#core.account.getKeyPair();

      return sendResponse({
        resolve: {
          base58: pair.base58,
          privKey: await privateKeyBytesToBase58(pair.privKey),
          pubKey: await pubKeyFromBytes(pair.pubKey)
        }
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async exportSecretWords(password: string, sendResponse: StreamResponse) {
    try {
      this.#core.guard.unlock(password);
      this.#core.guard.checkSession();

      const words = await this.#core.guard.exportMnemonic(password);

      return sendResponse({
        resolve: words
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async logout(sendResponse: StreamResponse) {
    await this.#core.guard.logout();

    this.#stopWorker();
    this.#core.triggerAccount();

    sendResponse({
      resolve: this.#core.state
    });
  }

  async isBase58Massa(addr: string, uuid: string, sendResponse: StreamResponse) {
    try {
      const isMassaAddreess = await isBase58Address(addr);
      console.log(addr, uuid, isMassaAddreess);

      new TabsMessage({
        type: MTypeTab.CHECK_MASSA_ADDRESS_RES,
        payload: {
          uuid,
          resolve: isMassaAddreess
        }
      }).send();

      sendResponse({
        resolve: isMassaAddreess
      });
    } catch (err) {
      sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  getState(sendResponse: StreamResponse) {
    if (!this.#core.state.guard.isEnable) {
      this.#stopWorker();
    }

    sendResponse({
      resolve: this.#core.state
    });
  }

  #startWorker() {
    this.#stopWorker();
    this.#worker = this.#core.worker.subscribe();
  }

  #stopWorker() {
    if (this.#worker && this.#worker.unsubscribe) {
      this.#worker.unsubscribe();
    }
  }

    // TODO: REMOVE IT after prod.
  async massaQuestAddAccount(address: string) {
    const url = `http://54.36.174.177:3000/register_quest/Bearby/CREATE_WALLET/${address}`;
    const data = {};
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
    const res = await fetch(url, requestOptions);

    await res.text();
  }

}
