import { pubKeyFromBytes } from "lib/address";
import type { BaseError } from "lib/error";
import { privateKeyBytesToBase58 } from "lib/validator";
import type { KeyAccountPayload, WordsPayloadToEncrypt } from "types/account";
import type { StreamResponse } from "types/stream";
import type { BackgroundState } from "./state";


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
      await this.#core.guard.setupVault(payload.words, payload.password);
      await this.#core.account.addAccountFromSeed(this.#core.guard.seed, payload.name);

      this.#startWorker();

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async unlock(password: string, sendResponse: StreamResponse) {
    try {
      await this.#core.guard.unlock(password);

      this.#startWorker();

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
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

      sendResponse({
        resolve: this.#core.state
      });
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

      sendResponse({
        resolve: this.#core.state
      });
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

      const pair =  await this.#core.account.getKeyPair();

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

    sendResponse({
      resolve: this.#core.state
    });
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
}
