import type { BaseError } from "lib/error";
import type { StreamResponse } from "types";
import type { BackgroundState } from "./state";


export class BackgroundNetwork {
  readonly #core: BackgroundState;

  constructor(state: BackgroundState) {
    this.#core = state;
  }

  async selectNetwork(net: string, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.network.setNetwork(net);
      this.#core.triggerNetwork();

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async sortNodes(node: string, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.network.sortProvider(node);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async removeNode(node: string, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.network.removeProvider(node);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async addNode(node: string, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.network.addProvider(node);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      console.error(err);
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async resetConfig(sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.network.reset();

      return sendResponse({
        resolve: this.#core.network.config
      });
    } catch (err) {
      console.error(err);
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async getNetworkConfig(sendResponse: StreamResponse) {
    return sendResponse({
      resolve: this.#core.network.config
    });
  }
}
