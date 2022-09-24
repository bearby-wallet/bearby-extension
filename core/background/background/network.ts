import { assert } from "lib/assert";
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

      await this.#core.netwrok.setNetwork(net);

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

      await this.#core.netwrok.sortProvider(node);

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

      await this.#core.netwrok.removeProvider(node);

      return sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      return sendResponse({
        reject: (err as BaseError).serialize()
      });
    }
  }

  async upadteCount(count: number, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.netwrok.setNodesCount(count);

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

  async addNode(node: string, sendResponse: StreamResponse) {
    try {
      this.#core.guard.checkSession();

      await this.#core.netwrok.addProvider(node);

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

  async getNetwrokConfig(sendResponse: StreamResponse) {
    return sendResponse({
      resolve: this.#core.netwrok.config
    });
  }
}
