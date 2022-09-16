import type { BaseError } from "lib/error";
import type { WordsPayloadToEncrypt } from "types/account";
import type { StreamResponse } from "types/stream";
import type { BackgroundState } from "./state";


export class BackgroundWallet {
  readonly #core: BackgroundState;

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

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async balanceUpdate(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();
      const balances = await this.#core.tokens.getBalances();

      console.log(balances);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async logout(sendResponse: StreamResponse) {
    await this.#core.guard.logout();

    sendResponse({
      resolve: this.#core.state
    });
  }

  getState(sendResponse: StreamResponse) {
    console.log(this.#core.state);
    sendResponse({
      resolve: this.#core.state
    });
  }
}
