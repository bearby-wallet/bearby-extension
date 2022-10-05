import type { BaseError } from "lib/error";
import type { ContentWalletData, StreamResponse } from "types";
import type { BackgroundState } from "./state";


export class BackgroundConnection {
  readonly #core: BackgroundState;

  constructor(state: BackgroundState) {
    this.#core = state;
  }

  async getConnections(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      return sendResponse({
        resolve: this.#core.connections.identities
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async removeConnections(index: number, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.connections.rm(index);

      return sendResponse({
        resolve: this.#core.connections.identities
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async resolveContentData(domain: string, sendResponse: StreamResponse) {
    const enabled = this.#core.guard.isEnable;
    const connected = this.#core.connections.has(domain);
    const account = this.#core.account.selectedAccount;
    const base58 = (connected && enabled && account) ? account.base58 : undefined;

    const data: ContentWalletData = {
      base58,
      connected,
      enabled,
      phishing: this.#core.settings.phishing.phishingDetectionEnabled,
      providers: this.#core.netwrok.providers
    };
    return sendResponse({
      resolve: data
    });
  }
}
